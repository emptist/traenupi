import { createInterface } from "readline";

export interface JsonKnowledgeInput {
  category: string;
  key: string;
  value: string;
  tags?: string[];
  importance?: number;
}

export interface JsonKnowledgeBatch {
  entries: JsonKnowledgeInput[];
}

export interface JsonMeetingOpinion {
  perspective: string;
  position?: "support" | "oppose" | "neutral";
  reasoning?: string;
}

export async function readStdinJson(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = createInterface({
      input: process.stdin,
      terminal: false,
    });

    let data = "";
    rl.on("line", (line) => {
      data += line + "\n";
    });

    rl.on("close", () => {
      resolve(data.trim());
    });

    rl.on("error", (error) => {
      reject(error);
    });
  });
}

export function parseJsonKnowledge(input: string): JsonKnowledgeInput | JsonKnowledgeBatch {
  try {
    const parsed = JSON.parse(input);
    
    if (parsed.entries && Array.isArray(parsed.entries)) {
      return parsed as JsonKnowledgeBatch;
    }
    
    if (parsed.category && parsed.key && parsed.value) {
      return parsed as JsonKnowledgeInput;
    }
    
    throw new Error("Invalid JSON structure. Expected {category, key, value} or {entries: [{category, key, value}]}");
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}

export function validateJsonKnowledge(input: JsonKnowledgeInput): void {
  if (!input.category || typeof input.category !== "string") {
    throw new Error("Missing or invalid 'category' field");
  }
  
  if (!input.key || typeof input.key !== "string") {
    throw new Error("Missing or invalid 'key' field");
  }
  
  if (!input.value || typeof input.value !== "string") {
    throw new Error("Missing or invalid 'value' field");
  }
  
  if (input.tags && !Array.isArray(input.tags)) {
    throw new Error("'tags' must be an array");
  }
  
  if (input.importance && (typeof input.importance !== "number" || input.importance < 1 || input.importance > 10)) {
    throw new Error("'importance' must be a number between 1 and 10");
  }
}

export function parseJsonMeetingOpinion(input: string): JsonMeetingOpinion {
  try {
    const parsed = JSON.parse(input);
    
    if (!parsed.perspective || typeof parsed.perspective !== "string") {
      throw new Error("Missing or invalid 'perspective' field");
    }
    
    if (parsed.position && !["support", "oppose", "neutral"].includes(parsed.position)) {
      throw new Error("'position' must be 'support', 'oppose', or 'neutral'");
    }
    
    return parsed as JsonMeetingOpinion;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}
