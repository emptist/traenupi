/**
 * TraeNuPI Database - Enhanced with Lively-Puter Bridge Integration
 * 
 * This module provides unified database access with hybrid routing:
 * - PostgreSQL for structured data (tasks, meetings, knowledge)
 * - Cloud KV store for user data, settings, cache
 * - Automatic sync for cross-device access
 */

import { Pool, PoolClient } from "pg";
import type { DbQueryOptions } from "./types.js";
import { LivelyPuterBridge } from "./lively-puter/index.js";

export interface DbConfig {
  host?: string;
  user?: string;
  database?: string;
  password?: string;
  port?: number;
  enableCloudSync?: boolean;
}

interface DatabaseMetadata {
  version: string;
  lastSync: number;
  source: 'local' | 'cloud' | 'hybrid';
}

export class TraeNuPIDatabase {
  private config: DbConfig;
  private pool: Pool | null = null;
  private bridge: LivelyPuterBridge | null = null;
  private metadata: DatabaseMetadata;
  
  private cloudKeys = [
    'user:preferences',
    'user:settings',
    'cache:',
    'session:',
    'temp:'
  ];

  constructor(config: Partial<DbConfig> = {}) {
    this.config = {
      host: "localhost",
      user: "postgres",
      database: "psypi",
      port: 5432,
      enableCloudSync: false,
      ...config
    };
    
    this.metadata = {
      version: '1.0.0',
      lastSync: 0,
      source: 'local'
    };
  }

  async initialize(): Promise<void> {
    this.pool = new Pool({
      host: this.config.host,
      user: this.config.user,
      database: this.config.database,
      password: this.config.password,
      port: this.config.port ?? 5432,
    });
    
    console.log('✅ PostgreSQL connection pool created');
    
    if (this.config.enableCloudSync) {
      try {
        this.bridge = new LivelyPuterBridge({
          mode: 'hybrid',
          enableDatabase: true
        });
        await this.bridge.initialize();
        
        this.metadata.source = 'hybrid';
        console.log('✅ Cloud sync enabled');
      } catch (error) {
        console.warn('⚠️  Cloud sync initialization failed, using local only:', error);
        this.bridge = null;
        this.metadata.source = 'local';
      }
    }
    
    await this.loadMetadata();
  }

  private shouldUseCloud(key: string): boolean {
    return this.cloudKeys.some(prefix => key.startsWith(prefix));
  }

  private async loadMetadata(): Promise<void> {
    if (!this.bridge) return;
    
    try {
      const metadata = await this.bridge.db.get('db:metadata');
      if (metadata) {
        this.metadata = { ...this.metadata, ...metadata };
      }
    } catch (error) {
      console.warn('Failed to load metadata:', error);
    }
  }

  private async saveMetadata(): Promise<void> {
    if (!this.bridge) return;
    
    try {
      await this.bridge.db.set('db:metadata', this.metadata);
    } catch (error) {
      console.warn('Failed to save metadata:', error);
    }
  }

  async query<T extends Record<string, any> = any>(
    sql: string,
    params: any[] = [],
    options?: DbQueryOptions
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    try {
      const result = await this.pool.query<T>(sql, params);
      return result.rows;
    } catch (error) {
      if (!options?.silent) {
        console.error('[DB Error]', error);
      }
      return [];
    }
  }

  async queryOne<T extends Record<string, any> = any>(
    sql: string,
    params: any[] = [],
    options?: DbQueryOptions
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params, options);
    return rows.length > 0 ? rows[0] : null;
  }

  async exec(
    sql: string,
    params: any[] = [],
    options?: DbQueryOptions
  ): Promise<boolean> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    try {
      await this.pool.query(sql, params);
      return true;
    } catch (error) {
      if (!options?.silent) {
        console.error('[DB Error]', error);
      }
      return false;
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T | null> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error('[Transaction Error]', error);
      return null;
    } finally {
      client.release();
    }
  }

  async get(key: string): Promise<any> {
    if (this.bridge && this.shouldUseCloud(key)) {
      try {
        return await this.bridge.db.get(key);
      } catch (error) {
        console.warn(`Failed to get ${key} from cloud:`, error);
      }
    }
    
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    const result = await this.queryOne<{ value: string }>(
      'SELECT value FROM traenupi_kv WHERE key = $1',
      [key]
    );
    
    return result ? JSON.parse(result.value) : null;
  }

  async set(key: string, value: any): Promise<void> {
    if (this.bridge && this.shouldUseCloud(key)) {
      try {
        await this.bridge.db.set(key, value);
        this.metadata.lastSync = Date.now();
        await this.saveMetadata();
        return;
      } catch (error) {
        console.warn(`Failed to set ${key} to cloud:`, error);
      }
    }
    
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    const valueStr = JSON.stringify(value);
    
    await this.exec(
      `INSERT INTO traenupi_kv (key, value, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, valueStr]
    );
  }

  async delete(key: string): Promise<void> {
    if (this.bridge && this.shouldUseCloud(key)) {
      try {
        await this.bridge.db.delete(key);
      } catch (error) {
        console.warn(`Failed to delete ${key} from cloud:`, error);
      }
    }
    
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    await this.exec('DELETE FROM traenupi_kv WHERE key = $1', [key]);
  }

  async list(prefix?: string): Promise<Array<{ key: string; value: any }>> {
    const results: Array<{ key: string; value: any }> = [];
    
    if (this.bridge && prefix) {
      try {
        const cloudItems = await this.bridge.db.list(prefix);
        results.push(...cloudItems);
      } catch (error) {
        console.warn(`Failed to list ${prefix} from cloud:`, error);
      }
    }
    
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    const sql = prefix
      ? 'SELECT key, value FROM traenupi_kv WHERE key LIKE $1'
      : 'SELECT key, value FROM traenupi_kv';
    
    const params = prefix ? [`${prefix}%`] : [];
    
    const rows = await this.query<{ key: string; value: string }>(sql, params);
    
    for (const row of rows) {
      if (!results.find(r => r.key === row.key)) {
        results.push({
          key: row.key,
          value: JSON.parse(row.value)
        });
      }
    }
    
    return results;
  }

  async syncToCloud(prefix?: string): Promise<void> {
    if (!this.bridge) {
      throw new Error('Cloud sync not enabled');
    }
    
    const items = await this.list(prefix);
    
    for (const item of items) {
      if (this.shouldUseCloud(item.key)) {
        try {
          await this.bridge.db.set(item.key, item.value);
          console.log(`✅ Synced ${item.key} to cloud`);
        } catch (error) {
          console.error(`Failed to sync ${item.key}:`, error);
        }
      }
    }
    
    this.metadata.lastSync = Date.now();
    await this.saveMetadata();
  }

  async syncFromCloud(prefix?: string): Promise<void> {
    if (!this.bridge) {
      throw new Error('Cloud sync not enabled');
    }
    
    const cloudItems = await this.bridge.db.list(prefix);
    
    for (const item of cloudItems) {
      if (this.shouldUseCloud(item.key)) {
        try {
          await this.set(item.key, item.value);
          console.log(`✅ Synced ${item.key} from cloud`);
        } catch (error) {
          console.error(`Failed to sync ${item.key} from cloud:`, error);
        }
      }
    }
  }

  getMetadata(): DatabaseMetadata {
    return { ...this.metadata };
  }

  isCloudEnabled(): boolean {
    return this.bridge !== null;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

let defaultDatabase: TraeNuPIDatabase | null = null;

export async function initializeDatabase(config: Partial<DbConfig> = {}): Promise<TraeNuPIDatabase> {
  if (!defaultDatabase) {
    defaultDatabase = new TraeNuPIDatabase(config);
    await defaultDatabase.initialize();
  }
  return defaultDatabase;
}

export function getDatabase(): TraeNuPIDatabase {
  if (!defaultDatabase) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return defaultDatabase;
}

export function resetDatabase(): void {
  defaultDatabase = null;
}

export {
  validateIdentifier,
  escapeIdentifier,
} from "./db-safe.js";
