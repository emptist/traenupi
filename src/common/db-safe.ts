import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import type { DbQueryOptions } from "./types.js";

export interface DbConfig {
  host?: string;
  user?: string;
  database?: string;
  password?: string;
  port?: number;
}

let pool: Pool | null = null;
let dbConfig: DbConfig = {
  host: "localhost",
  user: "postgres",
  database: "nezha",
  port: 5432,
};

export function setDbConfig(config: Partial<DbConfig>): void {
  dbConfig = { ...dbConfig, ...config };
}

export function getDbConfig(): DbConfig {
  return { ...dbConfig };
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password,
      port: dbConfig.port ?? 5432,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function querySafe<T extends Record<string, any> = any>(
  sql: string,
  params: any[] = [],
  options?: DbQueryOptions
): Promise<T[]> {
  try {
    const result = await getPool().query<T extends QueryResultRow ? T : any>(sql, params);
    return result.rows as T[];
  } catch (e) {
    if (!options?.silent) {
      console.error(`[DB Error] ${e instanceof Error ? e.message : String(e)}`);
    }
    return [];
  }
}

export async function queryOne<T extends Record<string, any> = any>(
  sql: string,
  params: any[] = [],
  options?: DbQueryOptions
): Promise<T | null> {
  const rows = await querySafe<T>(sql, params, options);
  return rows.length > 0 ? rows[0] : null;
}

export async function execSafe(
  sql: string,
  params: any[] = [],
  options?: DbQueryOptions
): Promise<boolean> {
  try {
    await getPool().query(sql, params);
    return true;
  } catch (e) {
    if (!options?.silent) {
      console.error(`[DB Error] ${e instanceof Error ? e.message : String(e)}`);
    }
    return false;
  }
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T | null> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(`[Transaction Error] ${e instanceof Error ? e.message : String(e)}`);
    return null;
  } finally {
    client.release();
  }
}

export function validateIdentifier(identifier: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
}

export function escapeIdentifier(identifier: string): string {
  if (!validateIdentifier(identifier)) {
    throw new Error(`Invalid identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}
