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
import { psqlQuery, psqlExec } from "./db.js";
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

export function loadKnowledge(): KnowledgeEntry[] {
  if (!knowledgeConfig.useDatabase) {
    return loadKnowledgeLocal();
  }

  try {
    const output = psqlQuery(
      `SELECT content, source, tags FROM memory WHERE source = '${knowledgeConfig.source}' ORDER BY created_at DESC LIMIT 50;`
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

export function addKnowledge(key: string, value: string, category: string): void {
  const content = `${key}: ${value}`;
  const tags = `{${knowledgeConfig.source},${category}}`;

  const gleamEntry = new_entry(key, value, category);
  const gleamEntryWithTags = with_tags(gleamEntry, toList([knowledgeConfig.source || "traenupi", category]));
  knowledgeGraph = add_entry(knowledgeGraph, gleamEntryWithTags);

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
  const entries = listToArray(find_by_category(knowledgeGraph, category));
  
  if (entries.length === 0 && knowledgeConfig.useDatabase) {
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
  
  return entries.map(e => ({
    key: e.key,
    value: e.value,
    category: e.category,
    time: e.created_at * 1000,
  }));
}

export function searchKnowledge(term: string): KnowledgeEntry[] {
  const entries = listToArray(search(knowledgeGraph, term));
  
  if (entries.length === 0 && knowledgeConfig.useDatabase) {
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
  
  return entries.map(e => ({
    key: e.key,
    value: e.value,
    category: e.category,
    time: e.created_at * 1000,
  }));
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

export function getKnowledgeStats(): { total: number; categories: string[]; tags: string[] } {
  return {
    total: count_entries(knowledgeGraph),
    categories: listToArray(get_all_categories(knowledgeGraph)),
    tags: listToArray(get_all_tags(knowledgeGraph)),
  };
}
