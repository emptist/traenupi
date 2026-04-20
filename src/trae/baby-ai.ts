import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import type { ConversationItem } from "../common/types.js";
import { loadHistory, saveHistory, ensureDir } from "../common/storage.js";
import { buildContext, buildQuickContext, PI_SESSION_DIR } from "./context.js";

const PI_FLAGS = ["--no-tools", "--no-context-files", "--no-skills", "--no-prompt-templates"];

export function askPi(question: string, history: ConversationItem[], quick: boolean = false, useSession: boolean = false): string {
  try {
    const context = quick ? buildQuickContext(history, question) : buildContext(history, question);
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
      timeout: 45000,
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

export function tellmeSync(question: string, quick: boolean = false, useSession: boolean = false): void {
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
    answer = askPi(question, history, quick, useSession);

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

export function tellmeDaemon(question: string): void {
  ensureDir();
  const history = loadHistory();
  const answer = askPi(question, history, false, false);
  history.push({ question, answer, time: Date.now() });
  saveHistory(history);
}

function sleep(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

export { PI_FLAGS };
