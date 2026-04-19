import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { psqlQuery, psqlExec } from "./db.js";

const TRAENUPI_DIR = join(homedir(), ".traenupi");
const KNOWLEDGE_FILE = join(TRAENUPI_DIR, "knowledge.json");

export interface KnowledgeEntry {
  key: string;
  value: string;
  category: string;
  time: number;
}

export function loadKnowledge(): KnowledgeEntry[] {
  try {
    const output = psqlQuery(`"SELECT content, source, tags FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT 50;"`);
    if (!output) return [];

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
  try {
    if (existsSync(KNOWLEDGE_FILE)) {
      return JSON.parse(readFileSync(KNOWLEDGE_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

export function addKnowledge(key: string, value: string, category: string): void {
  const content = `${key}: ${value}`;
  const tags = `{traenupi,${category}}`;
  
  try {
    psqlExec(`INSERT INTO memory (content, source, tags) VALUES ('${content.replace(/'/g, "''")}', 'traenupi', '${tags}');`);
  } catch {
    const knowledge = loadKnowledgeLocal();
    const existing = knowledge.findIndex(k => k.key === key && k.category === category);
    if (existing >= 0) {
      knowledge[existing].value = value;
      knowledge[existing].time = Date.now();
    } else {
      knowledge.push({ key, value, category, time: Date.now() });
    }
    writeFileSync(KNOWLEDGE_FILE, JSON.stringify(knowledge, null, 2));
  }
}

export function getKnowledgeByCategory(category: string): KnowledgeEntry[] {
  try {
    const output = psqlQuery(`"SELECT content FROM memory WHERE source = 'traenupi' AND '${category}' = ANY(tags) ORDER BY created_at DESC LIMIT 20;"`);
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
