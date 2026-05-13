/**
 * Type definitions for Lively-Puter Bridge
 */

export interface FileSystemAdapter {
  write(path: string, content: string | Blob, options?: WriteOptions): Promise<void>;
  read(path: string, options?: ReadOptions): Promise<string | Blob>;
  delete(path: string): Promise<void>;
  mkdir(path: string): Promise<void>;
  readdir(path: string): Promise<FileInfo[]>;
  stat(path: string): Promise<FileInfo>;
  exists(path: string): Promise<boolean>;
  copy(src: string, dest: string): Promise<void>;
  move(src: string, dest: string): Promise<void>;
}

export interface AIServiceAdapter {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
  chatStream?(messages: ChatMessage[], options?: ChatOptions): AsyncIterator<ChatResponse>;
  generateImage?(prompt: string, options?: ImageGenerationOptions): Promise<string>;
  transcribe?(audio: Blob): Promise<string>;
  synthesize?(text: string): Promise<Blob>;
}

export interface DatabaseAdapter {
  set(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(prefix?: string, options?: QueryOptions): Promise<Array<{key: string, value: any}>>;
  query?(query: string, params?: any[]): Promise<any[]>;
}

export interface AuthAdapter {
  signIn(): Promise<User>;
  signOut(): Promise<void>;
  getUser(): Promise<User | null>;
  isSignedIn(): Promise<boolean>;
  onAuthStateChange?(callback: (state: AuthState) => void): () => void;
}

export interface FileInfo {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number;
  modified?: Date;
  created?: Date;
}

export interface WriteOptions {
  overwrite?: boolean;
  createDirs?: boolean;
}

export interface ReadOptions {
  encoding?: 'utf-8' | 'binary';
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  message: ChatMessage;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageGenerationOptions {
  model?: string;
  size?: '256x256' | '512x512' | '1024x1024';
  quality?: 'standard' | 'hd';
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

export interface AuthState {
  isSignedIn: boolean;
  user: User | null;
}
