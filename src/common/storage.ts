import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { ConversationItem, Reminder, Bookmark, MoodEntry } from "./types.js";

export type { ConversationItem, Reminder, Bookmark, MoodEntry } from "./types.js";

export interface StorageConfig {
  baseDir?: string;
}

let storageConfig: StorageConfig = {
  baseDir: join(homedir(), ".traenupi"),
};

export function setStorageConfig(config: Partial<StorageConfig>): void {
  storageConfig = { ...storageConfig, ...config };
}

export function getStorageConfig(): StorageConfig {
  return { ...storageConfig };
}

export function getStoragePath(filename: string): string {
  return join(storageConfig.baseDir!, filename);
}

export function ensureDir(dir?: string): void {
  const targetDir = dir || storageConfig.baseDir!;
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
}

export function loadJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf-8"));
    }
  } catch {}
  return defaultValue;
}

export function saveJsonFile<T>(filePath: string, data: T): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function loadHistory(): ConversationItem[] {
  return loadJsonFile(getStoragePath("history.json"), []);
}

export function saveHistory(history: ConversationItem[]): void {
  const recent = history.slice(-10);
  saveJsonFile(getStoragePath("history.json"), recent);
}

export function loadReminders(): Reminder[] {
  return loadJsonFile(getStoragePath("reminders.json"), []);
}

export function saveReminders(reminders: Reminder[]): void {
  saveJsonFile(getStoragePath("reminders.json"), reminders);
}

export function loadBookmarks(): Bookmark[] {
  return loadJsonFile(getStoragePath("bookmarks.json"), []);
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  saveJsonFile(getStoragePath("bookmarks.json"), bookmarks);
}

export function loadMoodHistory(): MoodEntry[] {
  return loadJsonFile(getStoragePath("mood_history.json"), []);
}

export function saveMoodHistory(moodHistory: MoodEntry[]): void {
  saveJsonFile(getStoragePath("mood_history.json"), moodHistory);
}

export function loadState(): Record<string, unknown> {
  return loadJsonFile(getStoragePath("state.json"), { started: Date.now() });
}

export function saveState(state: Record<string, unknown>): void {
  saveJsonFile(getStoragePath("state.json"), state);
}
