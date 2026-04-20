import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import {
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
} from "../common/storage.js";
import type { ConversationItem, Reminder } from "../common/types.js";

describe("Storage Module", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `traenupi-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    setStorageConfig({ baseDir: testDir });
  });

  it("should get storage path correctly", () => {
    const path = getStoragePath("test.json");
    assert.ok(path.endsWith("test.json"));
    assert.ok(path.includes(testDir));
  });

  it("should ensure directory exists", () => {
    const newDir = join(testDir, "subdir");
    ensureDir(newDir);
    assert.ok(existsSync(newDir));
  });

  it("should load and save JSON files", () => {
    const filePath = join(testDir, "test.json");
    const data = { key: "value", number: 42 };

    saveJsonFile(filePath, data);
    const loaded = loadJsonFile(filePath, {});

    assert.deepStrictEqual(loaded, data);
  });

  it("should return default value for non-existent file", () => {
    const defaultValue = { default: true };
    const loaded = loadJsonFile(join(testDir, "nonexistent.json"), defaultValue);
    assert.deepStrictEqual(loaded, defaultValue);
  });

  it("should handle history operations", () => {
    const history: ConversationItem[] = [
      { question: "q1", answer: "a1", time: Date.now() },
      { question: "q2", answer: "a2", time: Date.now() },
    ];

    saveHistory(history);
    const loaded = loadHistory();

    assert.strictEqual(loaded.length, 2);
    assert.strictEqual(loaded[0].question, "q1");
  });

  it("should limit history to 10 items when saving", () => {
    const history: ConversationItem[] = Array.from({ length: 20 }, (_, i) => ({
      question: `q${i}`,
      answer: `a${i}`,
      time: Date.now() + i,
    }));

    saveHistory(history);
    const loaded = loadHistory();

    assert.strictEqual(loaded.length, 10);
    assert.strictEqual(loaded[0].question, "q10");
  });

  it("should handle reminders operations", () => {
    const reminders: Reminder[] = [
      { id: "1", message: "test", triggerAt: Date.now(), triggered: false },
    ];

    saveReminders(reminders);
    const loaded = loadReminders();

    assert.strictEqual(loaded.length, 1);
    assert.strictEqual(loaded[0].message, "test");
  });
});
