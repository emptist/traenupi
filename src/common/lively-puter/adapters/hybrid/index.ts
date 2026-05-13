/**
 * Hybrid Adapters - Combine Lively4 and Puter services
 */

import type {
  FileSystemAdapter,
  DatabaseAdapter,
  FileInfo
} from '../types.js';

import { LivelyFileSystemAdapter } from '../lively/index.js';
import { PuterFileSystemAdapter } from '../puter/index.js';
import { LivelyDatabaseAdapter } from '../lively/index.js';
import { PuterDatabaseAdapter } from '../puter/index.js';

/**
 * Hybrid FileSystem Adapter
 * 
 * Strategy:
 * - Local paths (/tmp, /cache, /local) → Lively4
 * - Cloud paths (/documents, /projects, /shared) → Puter
 * - Automatic sync for important files
 */
export class HybridFileSystemAdapter implements FileSystemAdapter {
  private livelyFS: LivelyFileSystemAdapter;
  private puterFS: PuterFileSystemAdapter;
  
  private localPaths = ['/tmp', '/cache', '/local', '/.temp'];

  constructor(lively: any, puter: any) {
    this.livelyFS = new LivelyFileSystemAdapter(lively);
    this.puterFS = new PuterFileSystemAdapter(puter);
  }

  private getBackend(path: string): FileSystemAdapter {
    for (const localPath of this.localPaths) {
      if (path.startsWith(localPath)) {
        return this.livelyFS;
      }
    }
    return this.puterFS;
  }

  async write(path: string, content: string | Blob): Promise<void> {
    const backend = this.getBackend(path);
    await backend.write(path, content);
    
    // Sync important files to both backends
    if (this.shouldSync(path)) {
      const otherBackend = backend === this.livelyFS ? this.puterFS : this.livelyFS;
      await otherBackend.write(path, content).catch(err => {
        console.warn(`[HybridFS] Sync failed for ${path}:`, err);
      });
    }
  }

  async read(path: string): Promise<string | Blob> {
    const backend = this.getBackend(path);
    
    try {
      return await backend.read(path);
    } catch (error) {
      // Fallback to other backend
      const otherBackend = backend === this.livelyFS ? this.puterFS : this.livelyFS;
      if (await otherBackend.exists(path)) {
        return await otherBackend.read(path);
      }
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    await Promise.all([
      this.livelyFS.delete(path).catch(() => {}),
      this.puterFS.delete(path).catch(() => {})
    ]);
  }

  async mkdir(path: string): Promise<void> {
    const backend = this.getBackend(path);
    await backend.mkdir(path);
  }

  async readdir(path: string): Promise<FileInfo[]> {
    const [localFiles, cloudFiles] = await Promise.all([
      this.livelyFS.readdir(path).catch(() => []),
      this.puterFS.readdir(path).catch(() => [])
    ]);
    
    const fileMap = new Map<string, FileInfo>();
    [...localFiles, ...cloudFiles].forEach(file => {
      fileMap.set(file.path, file);
    });
    
    return Array.from(fileMap.values());
  }

  async stat(path: string): Promise<FileInfo> {
    const backend = this.getBackend(path);
    return await backend.stat(path);
  }

  async exists(path: string): Promise<boolean> {
    const [localExists, cloudExists] = await Promise.all([
      this.livelyFS.exists(path).catch(() => false),
      this.puterFS.exists(path).catch(() => false)
    ]);
    return localExists || cloudExists;
  }

  async copy(src: string, dest: string): Promise<void> {
    const content = await this.read(src);
    await this.write(dest, content);
  }

  async move(src: string, dest: string): Promise<void> {
    await this.copy(src, dest);
    await this.delete(src);
  }

  private shouldSync(path: string): boolean {
    return path.startsWith('/documents') || path.startsWith('/projects');
  }
}

/**
 * Hybrid Database Adapter
 * 
 * Strategy:
 * - cache:, temp:, session: → Local (fast)
 * - user:, settings:, data: → Cloud (persistent)
 * - Automatic sync for critical data
 */
export class HybridDatabaseAdapter implements DatabaseAdapter {
  private localDB: LivelyDatabaseAdapter;
  private cloudDB: PuterDatabaseAdapter;
  
  private localKeys = ['cache:', 'temp:', 'session:'];

  constructor(localDB: LivelyDatabaseAdapter, cloudDB: PuterDatabaseAdapter) {
    this.localDB = localDB;
    this.cloudDB = cloudDB;
  }

  private getBackend(key: string): DatabaseAdapter {
    for (const localKey of this.localKeys) {
      if (key.startsWith(localKey)) {
        return this.localDB;
      }
    }
    return this.cloudDB;
  }

  async set(key: string, value: any): Promise<void> {
    const backend = this.getBackend(key);
    await backend.set(key, value);
    
    if (this.shouldSync(key)) {
      const otherBackend = backend === this.localDB ? this.cloudDB : this.localDB;
      await otherBackend.set(key, value).catch(err => {
        console.warn(`[HybridDB] Sync failed for ${key}:`, err);
      });
    }
  }

  async get(key: string): Promise<any> {
    const backend = this.getBackend(key);
    
    try {
      return await backend.get(key);
    } catch (error) {
      const otherBackend = backend === this.localDB ? this.cloudDB : this.localDB;
      return await otherBackend.get(key);
    }
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.localDB.delete(key).catch(() => {}),
      this.cloudDB.delete(key).catch(() => {})
    ]);
  }

  async list(prefix?: string): Promise<Array<{key: string, value: any}>> {
    const [localItems, cloudItems] = await Promise.all([
      this.localDB.list(prefix).catch(() => []),
      this.cloudDB.list(prefix).catch(() => [])
    ]);
    
    const itemMap = new Map<string, any>();
    [...localItems, ...cloudItems].forEach(item => {
      itemMap.set(item.key, item);
    });
    
    return Array.from(itemMap.entries()).map(([key, value]) => ({ key, value }));
  }

  private shouldSync(key: string): boolean {
    return key.startsWith('user:') || key.startsWith('settings:');
  }
}
