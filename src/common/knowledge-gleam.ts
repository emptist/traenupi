import {
  new_graph,
  new_entry,
  with_tags,
  add_entry,
  remove_entry,
  get_entry,
  find_by_key,
  find_by_tag,
  find_by_category,
  search,
  count_entries,
  get_all_tags,
  get_all_categories,
  type KnowledgeGraph$,
  type KnowledgeEntry$,
  toList,
  listToArray,
  optionToNullable,
} from "./gleam-bridge.js";
import { querySafeText, execSafe } from "./db-safe.js";
import { loadJsonFile, saveJsonFile, getStoragePath } from "./storage.js";
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

let knowledgeGraph: KnowledgeGraph$ = new_graph();

export function setKnowledgeConfig(config: Partial<KnowledgeConfig>): void {
  knowledgeConfig = { ...knowledgeConfig, ...config };
}

export async function loadKnowledge(): Promise<KnowledgeEntry[]> {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal();
  }

  try {
    const output = await querySafeText(
      "SELECT content, source, tags FROM memory WHERE source = $1 ORDER BY created_at DESC LIMIT 50",
      [knowledgeConfig.source]
    );
    if (!output) return loadKnowledgeLocal();

    const entries: KnowledgeEntry[] = [];
    const lines = output.split("\n");
    
    knowledgeGraph = new_graph();
    
    for (const line of lines) {
      const parts = line.split("|");
      const content = parts[0] || "";
      const category = parts[1] || "general";
      const tagsStr = parts[2] || "";
      const keyMatch = content.match(/^(\w[\w-]*):/);
      
      const entry: KnowledgeEntry = {
        key: keyMatch ? keyMatch[1] : content.substring(0, 20),
        value: keyMatch ? content.substring(keyMatch[1].length + 1).trim() : content,
        category: category || "general",
        time: Date.now(),
      };
      
      entries.push(entry);
      
      const gleamEntry = new_entry(entry.key, entry.value, entry.category);
      const tags = tagsStr.replace(/[{}"]/g, "").split(",").filter(t => t);
      const gleamEntryWithTags = with_tags(gleamEntry, toList(tags));
      knowledgeGraph = add_entry(knowledgeGraph, gleamEntryWithTags);
    }
    
    return entries;
  } catch {
    return loadKnowledgeLocal();
  }
}

export function loadKnowledgeLocal(): KnowledgeEntry[] {
  const entries = loadJsonFile<KnowledgeEntry[]>(getStoragePath("knowledge.json"), []);
  
  knowledgeGraph = new_graph();
  
  for (const entry of entries) {
    const gleamEntry = new_entry(entry.key, entry.value, entry.category);
    knowledgeGraph = add_entry(knowledgeGraph, gleamEntry);
  }
  
  return entries;
}

export async function addKnowledge(
  key: string, 
  value: string, 
  category: string,
  customTags?: string[],
  importance?: number
): Promise<void> {
  const content = `${key}: ${value}`;
  const tagsArray = customTags || [knowledgeConfig.source || "traenupi", category];
  const tags = `{${tagsArray.join(",")}}`;

  const gleamEntry = new_entry(key, value, category);
  const gleamEntryWithTags = with_tags(gleamEntry, toList(tagsArray));
  knowledgeGraph = add_entry(knowledgeGraph, gleamEntryWithTags);

  if (knowledgeConfig.useDatabase) {
    try {
      const importanceValue = importance || 5;
      await execSafe(
        "INSERT INTO memory (content, source, tags, importance) VALUES ($1, $2, $3, $4)",
        [content, knowledgeConfig.source, tags, importanceValue]
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
  const entries = listToArray(find_by_category(knowledgeGraph, category));
  
  if (entries.length === 0 && knowledgeConfig.useDatabase) {
    try {
      const output = await querySafeText(
        "SELECT content FROM memory WHERE source = $1 AND $2 = ANY(tags) ORDER BY created_at DESC LIMIT 20",
        [knowledgeConfig.source, category]
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
  
  return entries.map(e => ({
    key: e.key,
    value: e.value,
    category: e.category,
    time: e.created_at * 1000,
  }));
}

export async function searchKnowledge(term: string): Promise<KnowledgeEntry[]> {
  const entries = listToArray(search(knowledgeGraph, term));
  
  if (entries.length === 0 && knowledgeConfig.useDatabase) {
    try {
      const output = await querySafeText(
        "SELECT content, source, tags FROM memory WHERE source = $1 AND content ILIKE $2 ORDER BY created_at DESC LIMIT 20",
        [knowledgeConfig.source, `%${term}%`]
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
  
  return entries.map(e => ({
    key: e.key,
    value: e.value,
    category: e.category,
    time: e.created_at * 1000,
  }));
}

export async function getRecentKnowledge(limit: number = 10): Promise<KnowledgeEntry[]> {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal().slice(0, limit);
  }

  try {
    const output = await querySafeText(
      "SELECT content, tags, created_at FROM memory WHERE source = $1 ORDER BY created_at DESC LIMIT $2",
      [knowledgeConfig.source, limit]
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

export function getKnowledgeStats(): { total: number; categories: string[]; tags: string[] } {
  return {
    total: count_entries(knowledgeGraph),
    categories: listToArray(get_all_categories(knowledgeGraph)),
    tags: listToArray(get_all_tags(knowledgeGraph)),
  };
}
