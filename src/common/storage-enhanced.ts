/**
 * TraeNuPI Storage - Enhanced with Lively-Puter Bridge Integration
 * 
 * This module provides unified storage with hybrid routing:
 * - Local files for fast access
 * - Cloud backup for persistence
 * - Automatic sync for important data
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { ConversationItem, Reminder, Bookmark, MoodEntry } from "./types.js";
import { LivelyPuterBridge } from "./lively-puter/index.js";

export type { ConversationItem, Reminder, Bookmark, MoodEntry } from "./types.js";

export interface StorageConfig {
  baseDir?: string;
  enableCloudSync?: boolean;
  syncPaths?: string[];
}

interface StorageMetadata {
  version: string;
  lastSync: number;
  source: 'local' | 'cloud' | 'hybrid';
}

export class TraeNuPIStorage {
  private config: StorageConfig;
  private bridge: LivelyPuterBridge | null = null;
  private metadata: StorageMetadata;
  
  private cloudPaths = [
    'history.json',
    'bookmarks.json',
    'state.json'
  ];

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      baseDir: join(homedir(), ".traenupi"),
      enableCloudSync: false,
      syncPaths: [],
      ...config
    };
    
    this.metadata = {
      version: '1.0.0',
      lastSync: 0,
      source: 'local'
    };
  }

  async initialize(): Promise<void> {
    this.ensureDir();
    
    if (this.config.enableCloudSync) {
      try {
        this.bridge = new LivelyPuterBridge({
          mode: 'hybrid',
          enableStorage: true
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

  private ensureDir(dir?: string): void {
    const targetDir = dir || this.config.baseDir!;
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
  }

  private getStoragePath(filename: string): string {
    return join(this.config.baseDir!, filename);
  }

  private shouldSyncToCloud(filename: string): boolean {
    return this.cloudPaths.includes(filename) || 
           this.config.syncPaths?.includes(filename) ||
           false;
  }

  private async loadMetadata(): Promise<void> {
    const metadataPath = this.getStoragePath('.storage-metadata.json');
    try {
      if (existsSync(metadataPath)) {
        this.metadata = {
          ...this.metadata,
          ...JSON.parse(readFileSync(metadataPath, 'utf-8'))
        };
      }
    } catch (error) {
      console.warn('Failed to load metadata:', error);
    }
  }

  private async saveMetadata(): Promise<void> {
    const metadataPath = this.getStoragePath('.storage-metadata.json');
    try {
      writeFileSync(metadataPath, JSON.stringify(this.metadata, null, 2));
    } catch (error) {
      console.warn('Failed to save metadata:', error);
    }
  }

  async loadJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
    const filePath = this.getStoragePath(filename);
    
    try {
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Failed to load ${filename} from local:`, error);
    }
    
    if (this.bridge && this.shouldSyncToCloud(filename)) {
      try {
        const cloudData = await this.bridge.db.get(`storage:${filename}`);
        if (cloudData) {
          await this.saveJsonFile(filename, cloudData);
          return cloudData;
        }
      } catch (error) {
        console.warn(`Failed to load ${filename} from cloud:`, error);
      }
    }
    
    return defaultValue;
  }

  async saveJsonFile<T>(filename: string, data: T): Promise<void> {
    const filePath = this.getStoragePath(filename);
    
    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to save ${filename} to local:`, error);
      throw error;
    }
    
    if (this.bridge && this.shouldSyncToCloud(filename)) {
      try {
        await this.bridge.db.set(`storage:${filename}`, data);
        this.metadata.lastSync = Date.now();
        await this.saveMetadata();
      } catch (error) {
        console.warn(`Failed to sync ${filename} to cloud:`, error);
      }
    }
  }

  async syncToCloud(filename?: string): Promise<void> {
    if (!this.bridge) {
      throw new Error('Cloud sync not enabled');
    }
    
    const filesToSync = filename ? [filename] : this.cloudPaths;
    
    for (const file of filesToSync) {
      try {
        const filePath = this.getStoragePath(file);
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          await this.bridge.db.set(`storage:${file}`, data);
          console.log(`✅ Synced ${file} to cloud`);
        }
      } catch (error) {
        console.error(`Failed to sync ${file}:`, error);
      }
    }
    
    this.metadata.lastSync = Date.now();
    await this.saveMetadata();
  }

  async syncFromCloud(filename?: string): Promise<void> {
    if (!this.bridge) {
      throw new Error('Cloud sync not enabled');
    }
    
    const filesToSync = filename ? [filename] : this.cloudPaths;
    
    for (const file of filesToSync) {
      try {
        const cloudData = await this.bridge.db.get(`storage:${file}`);
        if (cloudData) {
          await this.saveJsonFile(file, cloudData);
          console.log(`✅ Synced ${file} from cloud`);
        }
      } catch (error) {
        console.error(`Failed to sync ${file} from cloud:`, error);
      }
    }
  }

  getMetadata(): StorageMetadata {
    return { ...this.metadata };
  }

  isCloudEnabled(): boolean {
    return this.bridge !== null;
  }

  async loadHistory(): Promise<ConversationItem[]> {
    return this.loadJsonFile("history.json", []);
  }

  async saveHistory(history: ConversationItem[]): Promise<void> {
    const recent = history.slice(-10);
    await this.saveJsonFile("history.json", recent);
  }

  async loadReminders(): Promise<Reminder[]> {
    return this.loadJsonFile("reminders.json", []);
  }

  async saveReminders(reminders: Reminder[]): Promise<void> {
    await this.saveJsonFile("reminders.json", reminders);
  }

  async loadBookmarks(): Promise<Bookmark[]> {
    return this.loadJsonFile("bookmarks.json", []);
  }

  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    await this.saveJsonFile("bookmarks.json", bookmarks);
  }

  async loadMoodHistory(): Promise<MoodEntry[]> {
    return this.loadJsonFile("mood_history.json", []);
  }

  async saveMoodHistory(moodHistory: MoodEntry[]): Promise<void> {
    await this.saveJsonFile("mood_history.json", moodHistory);
  }

  async loadState(): Promise<Record<string, unknown>> {
    return this.loadJsonFile("state.json", { started: Date.now() });
  }

  async saveState(state: Record<string, unknown>): Promise<void> {
    await this.saveJsonFile("state.json", state);
  }
}

let defaultStorage: TraeNuPIStorage | null = null;

export async function initializeStorage(config: Partial<StorageConfig> = {}): Promise<TraeNuPIStorage> {
  if (!defaultStorage) {
    defaultStorage = new TraeNuPIStorage(config);
    await defaultStorage.initialize();
  }
  return defaultStorage;
}

export function getStorage(): TraeNuPIStorage {
  if (!defaultStorage) {
    throw new Error('Storage not initialized. Call initializeStorage() first.');
  }
  return defaultStorage;
}

export function resetStorage(): void {
  defaultStorage = null;
}

export {
  setStorageConfig,
  getStorageConfig,
  getStoragePath,
  ensureDir,
  loadJsonFile,
  saveJsonFile,
  loadHistory,
  saveHistory,
  loadReminders,
  saveReminders,
  loadBookmarks,
  saveBookmarks,
  loadMoodHistory,
  saveMoodHistory,
  loadState,
  saveState,
} from "./storage.js";
