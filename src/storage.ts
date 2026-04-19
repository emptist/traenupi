import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const TRAENUPI_DIR = join(homedir(), ".traenupi");
const HISTORY_FILE = join(TRAENUPI_DIR, "history.json");
const REMINDERS_FILE = join(TRAENUPI_DIR, "reminders.json");
const MEETING_STATE_FILE = join(TRAENUPI_DIR, "meeting_state.json");
const BABY_AI_STATE_FILE = join(TRAENUPI_DIR, "baby_ai_state.json");
const PRESENCE_FILE = join(TRAENUPI_DIR, "presence.json");
const BOOKMARKS_FILE = join(TRAENUPI_DIR, "bookmarks.json");
const MOOD_FILE = join(TRAENUPI_DIR, "mood_history.json");

export interface ConversationItem {
  question: string;
  answer: string;
  time: number;
}

export interface Reminder {
  id: string;
  message: string;
  triggerAt: number;
  triggered: boolean;
}

export interface Bookmark {
  id: string;
  meetingId: string;
  opinionId: string;
  author: string;
  perspective: string;
  note: string;
  createdAt: number;
}

export interface MoodEntry {
  agentId: string;
  mood: string;
  timestamp: number;
  context: string;
}

export function ensureDir(): void {
  if (!existsSync(TRAENUPI_DIR)) {
    mkdirSync(TRAENUPI_DIR, { recursive: true });
  }
}

export function loadHistory(): ConversationItem[] {
  try {
    if (existsSync(HISTORY_FILE)) {
      return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

export function saveHistory(history: ConversationItem[]): void {
  const recent = history.slice(-10);
  writeFileSync(HISTORY_FILE, JSON.stringify(recent, null, 2));
}

export function loadReminders(): Reminder[] {
  try {
    if (existsSync(REMINDERS_FILE)) {
      return JSON.parse(readFileSync(REMINDERS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

export function saveReminders(reminders: Reminder[]): void {
  writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
}

export function loadBookmarks(): Bookmark[] {
  try {
    if (existsSync(BOOKMARKS_FILE)) {
      return JSON.parse(readFileSync(BOOKMARKS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  writeFileSync(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
}

export function loadMoodHistory(): MoodEntry[] {
  try {
    if (existsSync(MOOD_FILE)) {
      return JSON.parse(readFileSync(MOOD_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

export function saveMoodHistory(moodHistory: MoodEntry[]): void {
  writeFileSync(MOOD_FILE, JSON.stringify(moodHistory, null, 2));
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
