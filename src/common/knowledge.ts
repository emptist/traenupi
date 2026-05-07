import { loadJsonFile, saveJsonFile, getStoragePath } from "./storage.js";
import { querySafeText, execSafe } from "./db-safe.js";
import type { KnowledgeEntry } from "./types.js";

export type { KnowledgeEntry } from "./types.js";

export interface KnowledgeConfig {
  source?: string;
  useDatabase?: boolean;
}

let knowledgeConfig: KnowledgeConfig = {
  source: "traenupi",
  useDatabase: true,
};

export function setKnowledgeConfig(config: Partial<KnowledgeConfig>): void {
  knowledgeConfig = { ...knowledgeConfig, ...config };
}

export async function loadKnowledge(): Promise<KnowledgeEntry[]> {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal();
  }

  try {
    const output = await querySafeText(
      `SELECT content, source, tags FROM memory WHERE source = $1 ORDER BY created_at DESC LIMIT 50;`,
      [knowledgeConfig.source!]
    );
    if (!output) return loadKnowledgeLocal();

    return output.split("\n").map(line => {
      const parts = line.split("|");
      const content = parts[0] || "";
      const category = parts[1] || "general";
      const tagsStr = parts[2] || "";
      const keyMatch = content.match(/^(\w[\w-]*):/);
      return {
        key: keyMatch ? keyMatch[1] : content.substring(0, 20),
        value: keyMatch ? content.substring(keyMatch[1].length + 1).trim() : content,
        category: category || "general",
        time: Date.now(),
      };
    });
  } catch {
    return loadKnowledgeLocal();
  }
}

export function loadKnowledgeLocal(): KnowledgeEntry[] {
  return loadJsonFile(getStoragePath("knowledge.json"), []);
}

export async function addKnowledge(key: string, value: string, category: string): Promise<void> {
  const content = `${key}: ${value}`;
  const tags = `{${knowledgeConfig.source},${category}}`;

  if (knowledgeConfig.useDatabase) {
    try {
      await execSafe(
        `INSERT INTO memory (content, source, tags) VALUES ($1, $2, $3);`,
        [content, knowledgeConfig.source!, tags]
      );
      return;
    } catch {}
  }

  const knowledge = loadKnowledgeLocal();
  const existing = knowledge.findIndex(k => k.key === key && k.category === category);
  if (existing >= 0) {
    knowledge[existing].value = value;
    knowledge[existing].time = Date.now();
  } else {
    knowledge.push({ key, value, category, time: Date.now() });
  }
  saveJsonFile(getStoragePath("knowledge.json"), knowledge);
}

export async function getKnowledgeByCategory(category: string): Promise<KnowledgeEntry[]> {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal().filter(k => k.category === category);
  }

  try {
    const output = await querySafeText(
      `SELECT content FROM memory WHERE source = $1 AND $2 = ANY(tags) ORDER BY created_at DESC LIMIT 20;`,
      [knowledgeConfig.source!, category]
    );
    if (!output.trim()) return [];

    return output.trim().split("\n").map(line => {
      const keyMatch = line.match(/^(\w[\w-]*):/);
      return {
        key: keyMatch ? keyMatch[1] : line.substring(0, 20),
        value: keyMatch ? line.substring(keyMatch[1].length + 1).trim() : line,
        category,
        time: Date.now(),
      };
    });
  } catch {
    return loadKnowledgeLocal().filter(k => k.category === category);
  }
}

export async function searchKnowledge(term: string): Promise<KnowledgeEntry[]> {
  if (!knowledgeConfig.useDatabase) {
    const knowledge = loadKnowledgeLocal();
    const termLower = term.toLowerCase();
    return knowledge.filter(
      k => k.key.toLowerCase().includes(termLower) || k.value.toLowerCase().includes(termLower)
    );
  }

  try {
    const output = await querySafeText(
      `SELECT content, source, tags FROM memory WHERE source = $1 AND content ILIKE $2 ORDER BY created_at DESC LIMIT 20;`,
      [knowledgeConfig.source!, `%${term}%`]
    );
    if (!output.trim()) return [];

    return output.trim().split("\n").map(line => {
      const parts = line.split("|");
      const content = parts[0] || "";
      const category = parts[1] || "general";
      const keyMatch = content.match(/^(\w[\w-]*):/);
      return {
        key: keyMatch ? keyMatch[1] : content.substring(0, 20),
        value: keyMatch ? content.substring(keyMatch[1].length + 1).trim() : content,
        category: category || "general",
        time: Date.now(),
      };
    });
  } catch {
    return [];
  }
}

export async function getRecentKnowledge(limit: number = 10): Promise<KnowledgeEntry[]> {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal().slice(0, limit);
  }

  try {
    const output = await querySafeText(
      `SELECT content, tags, created_at FROM memory WHERE source = $1 ORDER BY created_at DESC LIMIT $2;`,
      [knowledgeConfig.source!, limit]
    );
    if (!output.trim()) return [];

    return output.trim().split("\n").map(line => {
      const parts = line.split("|");
      const content = parts[0] || "";
      const tagsStr = parts[1] || "";
      const keyMatch = content.match(/^(\w[\w-]*):/);
      return {
        key: keyMatch ? keyMatch[1] : content.substring(0, 20),
        value: keyMatch ? content.substring(keyMatch[1].length + 1).trim() : content,
        category: tagsStr.replace(/[{}]/g, "").split(",")[1] || "general",
        time: Date.now(),
      };
    });
  } catch {
    return loadKnowledgeLocal().slice(0, limit);
  }
}
