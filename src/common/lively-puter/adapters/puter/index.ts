/**
 * Puter Adapters - Simplified for TraeNuPI integration
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

export class PuterFileSystemAdapter implements FileSystemAdapter {
  private puter: any;

  constructor(puter: any) {
    this.puter = puter;
  }

  async write(path: string, content: string | Blob): Promise<void> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    await this.puter.fs.write(path, content);
  }

  async read(path: string): Promise<string | Blob> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    return await this.puter.fs.read(path);
  }

  async delete(path: string): Promise<void> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    await this.puter.fs.delete(path);
  }

  async mkdir(path: string): Promise<void> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    await this.puter.fs.mkdir(path);
  }

  async readdir(path: string): Promise<FileInfo[]> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    const entries = await this.puter.fs.readdir(path);
    return entries.map((entry: any) => ({
      name: entry.name,
      path: entry.path,
      is_dir: entry.is_dir,
      size: entry.size,
      modified: entry.modified ? new Date(entry.modified) : undefined
    }));
  }

  async stat(path: string): Promise<FileInfo> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    const stat = await this.puter.fs.stat(path);
    return {
      name: stat.name,
      path: stat.path,
      is_dir: stat.is_dir,
      size: stat.size
    };
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  async copy(src: string, dest: string): Promise<void> {
    await this.puter.fs.copy(src, dest);
  }

  async move(src: string, dest: string): Promise<void> {
    await this.puter.fs.move(src, dest);
  }
}

export class PuterAIAdapter implements AIServiceAdapter {
  private puter: any;

  constructor(puter: any) {
    this.puter = puter;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    
    const response = await this.puter.ai.chat(messages, {
      model: options?.model || 'gpt-4',
      temperature: options?.temperature
    });

    return {
      message: {
        role: 'assistant',
        content: response.message?.content || response
      }
    };
  }

  async generateImage(prompt: string, options?: any): Promise<string> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    return await this.puter.ai.image(prompt, options);
  }
}

export class PuterDatabaseAdapter implements DatabaseAdapter {
  private puter: any;

  constructor(puter: any) {
    this.puter = puter;
  }

  async set(key: string, value: any): Promise<void> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    await this.puter.db.set(key, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    const value = await this.puter.db.get(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key: string): Promise<void> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    await this.puter.db.del(key);
  }

  async list(prefix?: string): Promise<Array<{key: string, value: any}>> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    const items = await this.puter.db.list(prefix);
    return items.map((item: any) => ({
      key: item.key,
      value: JSON.parse(item.value)
    }));
  }
}

export class PuterAuthAdapter implements AuthAdapter {
  private puter: any;

  constructor(puter: any) {
    this.puter = puter;
  }

  async signIn(): Promise<User> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    await this.puter.auth.signIn();
    const user = await this.getUser();
    if (!user) throw new Error('Sign in failed');
    return user;
  }

  async signOut(): Promise<void> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    await this.puter.auth.signOut();
  }

  async getUser(): Promise<User | null> {
    if (!this.puter) throw new Error('Puter SDK not loaded');
    
    if (!this.puter.auth.isSignedIn()) {
      return null;
    }
    
    const user = await this.puter.auth.getUser();
    return {
      id: user.uuid || user.username,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    };
  }

  async isSignedIn(): Promise<boolean> {
    if (!this.puter) return false;
    return this.puter.auth.isSignedIn();
  }
}
