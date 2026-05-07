import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import type { ConversationItem } from "../common/types.js";
import { loadHistory, saveHistory, ensureDir } from "../common/storage.js";
import { buildContext, buildQuickContext, PI_SESSION_DIR, PI_FLAGS } from "./context.js";

export interface PiAgentConfig {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
}

export interface PiAgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PiAgentResponse {
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  isComplete: boolean;
}

export class PiAgent {
  private config: PiAgentConfig;

  constructor(config: PiAgentConfig) {
    this.config = config;
  }

  async run(messages: PiAgentMessage[], onChunk?: (chunk: string) => void): Promise<PiAgentResponse> {
    try {
      const args = [...PI_FLAGS, "--no-session"];
      
      const fullPrompt = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");
      args.push("-p", fullPrompt);

      const output = execFileSync("pi", args, {
        encoding: "utf-8",
        timeout: 120000,
        maxBuffer: 1024 * 1024,
        killSignal: "SIGTERM",
      });

      if (onChunk) {
        onChunk(output);
      }

      return {
        content: output.trim() || "[Pi returned empty response]",
        isComplete: true,
      };
    } catch (e) {
      if (e instanceof Error && "stdout" in e) {
        const err = e as Error & { stdout?: string };
        if (err.stdout) {
          return {
            content: err.stdout.trim(),
            isComplete: true,
          };
        }
      }
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("timed out")) {
        return {
          content: "[Pi timed out. Try again with a shorter question.]",
          isComplete: false,
        };
      }
      return {
        content: `[Error calling Pi: ${msg}]`,
        isComplete: false,
      };
    }
  }

  async runStreaming(
    messages: PiAgentMessage[],
    onChunk: (chunk: string) => void
  ): Promise<PiAgentResponse> {
    return this.run(messages, onChunk);
  }
}

export function createPiAgentSession(config: PiAgentConfig): PiAgent {
  return new PiAgent(config);
}

export async function askPi(question: string, history: ConversationItem[], quick: boolean = false, useSession: boolean = false): Promise<string> {
  try {
    const context = quick ? await buildQuickContext(history, question) : await buildContext(history, question);
    const fullPrompt = `${context}\n\nQuestion: ${question}`;

    const args = [...PI_FLAGS];
    if (useSession) {
      if (!existsSync(PI_SESSION_DIR)) {
        mkdirSync(PI_SESSION_DIR, { recursive: true });
      }
      args.push("--session-dir", PI_SESSION_DIR, "--continue");
    } else {
      args.push("--no-session");
    }
    args.push("-p", fullPrompt);

    const output = execFileSync("pi", args, {
      encoding: "utf-8",
      timeout: 120000,
      maxBuffer: 1024 * 1024,
      killSignal: "SIGTERM",
    });

    return output.trim() || "[Pi returned empty response]";
  } catch (e) {
    if (e instanceof Error && "stdout" in e) {
      const err = e as Error & { stdout?: string };
      if (err.stdout) {
        return err.stdout.trim();
      }
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("timed out")) {
      return "[Pi timed out. Try again with a shorter question.]";
    }
    return `[Error calling Pi: ${msg}]`;
  }
}

export function webSearch(query: string): void {
  console.log(`[TRAENUPI] Asking Pi about: "${query}"...`);
  console.log("[Note: Pi uses a local model and cannot search the web. This asks Pi from its training data.]");
  try {
    const searchPrompt = `Answer this question based on your training data: "${query}". Be concise and factual. If you don't know, say so.`;
    const output = execFileSync("pi", [...PI_FLAGS, "-p", searchPrompt], {
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    });
    console.log("\n[PI ANSWER]:");
    console.log(output.trim() || "[No answer]");
  } catch (e) {
    if (e instanceof Error && "stdout" in e) {
      const err = e as Error & { stdout?: string };
      if (err.stdout) {
        console.log("\n[PI ANSWER]:");
        console.log(err.stdout.trim());
        return;
      }
    }
    console.error(`[Search error: ${e instanceof Error ? e.message : String(e)}]`);
  }
}

export async function tellmeSync(question: string, quick: boolean = false, useSession: boolean = false): Promise<void> {
  ensureDir();
  const history = loadHistory();

  const mode = quick ? "(quick mode)" : useSession ? "(session mode)" : "(full context)";
  console.log(`[TRAENUPI] Asking ${mode}: "${question}"`);
  console.log("─".repeat(50));

  let answer = "";
  let retries = 0;
  const maxRetries = 3;
  const baseDelayMs = 2000;

  while (retries <= maxRetries) {
    answer = await askPi(question, history, quick, useSession);

    if (!answer.startsWith("[Error") && !answer.startsWith("[Pi timed out")) {
      break;
    }

    retries++;
    if (retries <= maxRetries) {
      const delay = baseDelayMs * Math.pow(2, retries - 1);
      console.log(`[RETRY ${retries}/${maxRetries}] Waiting ${delay / 1000}s before retry...`);
      sleep(delay);
    }
  }

  console.log("\n[TRAENUPI ANSWER]:");
  console.log(answer);
  console.log("\n" + "─".repeat(50));

  history.push({ question, answer, time: Date.now() });
  saveHistory(history);
}

export async function tellmeDaemon(question: string): Promise<void> {
  ensureDir();
  const history = loadHistory();
  const answer = await askPi(question, history, false, false);
  history.push({ question, answer, time: Date.now() });
  saveHistory(history);
}

function sleep(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}
