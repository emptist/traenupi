import { psqlQuery, psqlExec } from "./db.js";
import { loadJsonFile, saveJsonFile, getStoragePath } from "./storage.js";
import type { KnowledgeEntry } from "./types.js";

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

export function loadKnowledge(): KnowledgeEntry[] {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal();
  }

  try {
    const output = psqlQuery(
      `SELECT content, source, tags FROM memory WHERE source = '${knowledgeConfig.source}' ORDER BY created_at DESC LIMIT 50;`
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

export function addKnowledge(key: string, value: string, category: string): void {
  const content = `${key}: ${value}`;
  const tags = `{${knowledgeConfig.source},${category}}`;

  if (knowledgeConfig.useDatabase) {
    try {
      psqlExec(
        `INSERT INTO memory (content, source, tags) VALUES ('${content.replace(/'/g, "''")}', '${knowledgeConfig.source}', '${tags}');`
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

export function getKnowledgeByCategory(category: string): KnowledgeEntry[] {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal().filter(k => k.category === category);
  }

  try {
    const output = psqlQuery(
      `SELECT content FROM memory WHERE source = '${knowledgeConfig.source}' AND '${category}' = ANY(tags) ORDER BY created_at DESC LIMIT 20;`
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

export function searchKnowledge(term: string): KnowledgeEntry[] {
  if (!knowledgeConfig.useDatabase) {
    const knowledge = loadKnowledgeLocal();
    const termLower = term.toLowerCase();
    return knowledge.filter(
      k => k.key.toLowerCase().includes(termLower) || k.value.toLowerCase().includes(termLower)
    );
  }

  try {
    const output = psqlQuery(
      `SELECT content, source, tags FROM memory WHERE source = '${knowledgeConfig.source}' AND content ILIKE '%${term}%' ORDER BY created_at DESC LIMIT 20;`
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

export function getRecentKnowledge(limit: number = 10): KnowledgeEntry[] {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal().slice(0, limit);
  }

  try {
    const output = psqlQuery(
      `SELECT content, tags, created_at FROM memory WHERE source = '${knowledgeConfig.source}' ORDER BY created_at DESC LIMIT ${limit};`
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
