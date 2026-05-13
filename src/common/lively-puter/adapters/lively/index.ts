/**
 * Lively4 Adapters - Simplified for TraeNuPI integration
 */

import type {
  FileSystemAdapter,
  AIServiceAdapter,
  DatabaseAdapter,
  AuthAdapter,
  FileInfo,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  User
} from '../types.js';

export class LivelyFileSystemAdapter implements FileSystemAdapter {
  private lively: any;

  constructor(lively: any) {
    this.lively = lively;
  }

  async write(path: string, content: string | Blob): Promise<void> {
    if (!this.lively) {
      console.warn('Lively4 not available, skipping write');
      return;
    }
    // Use Lively4's file system
    const files = await this.lively.import('src/client/files.js');
    await files.write(path, content);
  }

  async read(path: string): Promise<string | Blob> {
    if (!this.lively) throw new Error('Lively4 not available');
    const files = await this.lively.import('src/client/files.js');
    return await files.read(path);
  }

  async delete(path: string): Promise<void> {
    if (!this.lively) return;
    const files = await this.lively.import('src/client/files.js');
    await files.remove(path);
  }

  async mkdir(path: string): Promise<void> {
    if (!this.lively) return;
    const files = await this.lively.import('src/client/files.js');
    await files.mkdir(path);
  }

  async readdir(path: string): Promise<FileInfo[]> {
    if (!this.lively) return [];
    const files = await this.lively.import('src/client/files.js');
    const entries = await files.readdir(path);
    return entries.map((entry: any) => ({
      name: entry.name,
      path: entry.path,
      is_dir: entry.isDirectory(),
      size: entry.size
    }));
  }

  async stat(path: string): Promise<FileInfo> {
    if (!this.lively) throw new Error('Lively4 not available');
    const files = await this.lively.import('src/client/files.js');
    const stat = await files.stat(path);
    return {
      name: stat.name,
      path: stat.path,
      is_dir: stat.isDirectory(),
      size: stat.size
    };
  }

  async exists(path: string): Promise<boolean> {
    if (!this.lively) return false;
    const files = await this.lively.import('src/client/files.js');
    return await files.exists(path);
  }

  async copy(src: string, dest: string): Promise<void> {
    const content = await this.read(src);
    await this.write(dest, content);
  }

  async move(src: string, dest: string): Promise<void> {
    await this.copy(src, dest);
    await this.delete(src);
  }
}

export class LivelyAIAdapter implements AIServiceAdapter {
  private lively: any;

  constructor(lively: any) {
    this.lively = lively;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.lively) throw new Error('Lively4 not available');
    
    // Use Lively4's AI workspace
    const openai = await this.lively.import('src/client/openai.js');
    const response = await openai.chat(messages, options);

    return {
      message: {
        role: 'assistant',
        content: response.content
      }
    };
  }
}

export class LivelyDatabaseAdapter implements DatabaseAdapter {
  private lively: any;
  private db: any = null;

  constructor(lively: any) {
    this.lively = lively;
  }

  private async getDB() {
    if (!this.db && this.lively) {
      const Dexie = await this.lively.import('src/external/dexie3.js');
      this.db = new Dexie('traenupi-lively-db');
      this.db.version(1).stores({
        kv: 'key, value'
      });
    }
    return this.db;
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    if (db) {
      await db.kv.put({ key, value: JSON.stringify(value) });
    }
  }

  async get(key: string): Promise<any> {
    const db = await this.getDB();
    if (!db) return null;
    const item = await db.kv.get(key);
    return item ? JSON.parse(item.value) : null;
  }

  async delete(key: string): Promise<void> {
    const db = await this.getDB();
    if (db) {
      await db.kv.delete(key);
    }
  }

  async list(prefix?: string): Promise<Array<{key: string, value: any}>> {
    const db = await this.getDB();
    if (!db) return [];
    
    let items = await db.kv.toArray();
    
    if (prefix) {
      items = items.filter(item => item.key.startsWith(prefix));
    }

    return items.map(item => ({
      key: item.key,
      value: JSON.parse(item.value)
    }));
  }
}

export class LivelyAuthAdapter implements AuthAdapter {
  private lively: any;
  private currentUser: User | null = null;

  constructor(lively: any) {
    this.lively = lively;
  }

  async signIn(): Promise<User> {
    // Create a local user for Lively4
    const username = `lively-user-${Date.now()}`;
    this.currentUser = {
      id: username,
      username,
      metadata: { source: 'lively4' }
    };
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }

  async getUser(): Promise<User | null> {
    return this.currentUser;
  }

  async isSignedIn(): Promise<boolean> {
    return this.currentUser !== null;
  }
}
