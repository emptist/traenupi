import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import type { ConversationItem } from "../common/types.js";
import { loadHistory, saveHistory, ensureDir } from "../common/storage.js";
import { buildContext, buildQuickContext, PI_SESSION_DIR, PI_FLAGS } from "./context.js";
import { PiAgent, createPiAgentSession, type PiAgentConfig, type PiAgentMessage } from "./pi-agent-bridge.js";
import { BabyAiCache, PerformanceTracker, RateLimiter, formatMetrics } from "./baby-ai-utils.js";

export interface BabyAiConfig {
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  maxRetries?: number;
  baseDelayMs?: number;
  timeout?: number;
  enableLogging?: boolean;
  enableCache?: boolean;
  cacheMaxSize?: number;
  cacheTtl?: number;
  enableRateLimit?: boolean;
  rateLimitMaxRequests?: number;
  rateLimitWindowMs?: number;
}

const DEFAULT_CONFIG: Required<BabyAiConfig> = {
  apiKey: process.env.OPENROUTER_API_KEY || "",
  model: "tencent/hy3-preview:free",
  systemPrompt: process.env.PI_AGENT_SYSTEM_PROMPT || "You are a helpful AI assistant integrated with TraeNuPI.",
  maxRetries: 3,
  baseDelayMs: 2000,
  timeout: 120000,
  enableLogging: true,
  enableCache: true,
  cacheMaxSize: 100,
  cacheTtl: 3600000,
  enableRateLimit: true,
  rateLimitMaxRequests: 60,
  rateLimitWindowMs: 60000,
};

let piAgentInstance: PiAgent | null = null;
let config: Required<BabyAiConfig> = { ...DEFAULT_CONFIG };
let cache: BabyAiCache | null = null;
let tracker: PerformanceTracker | null = null;
let limiter: RateLimiter | null = null;

export function configureBabyAi(newConfig: Partial<BabyAiConfig>): void {
  config = { ...config, ...newConfig };
  piAgentInstance = null;
  cache = null;
  tracker = null;
  limiter = null;
}

export function getPerformanceMetrics() {
  return tracker ? tracker.getMetrics() : null;
}

export function printPerformanceMetrics(): void {
  const metrics = getPerformanceMetrics();
  if (metrics) {
    console.log(formatMetrics(metrics));
  } else {
    console.log("[BabyAI] Performance tracking not enabled");
  }
}

export function clearCache(): void {
  if (cache) {
    cache.clear();
    log("[BabyAI] Cache cleared");
  }
}

function log(message: string): void {
  if (config.enableLogging) {
    console.log(message);
  }
}

function getCache(): BabyAiCache {
  if (!cache) {
    cache = new BabyAiCache(config.cacheMaxSize, config.cacheTtl);
    log(`[BabyAI] Cache initialized (max: ${config.cacheMaxSize}, ttl: ${config.cacheTtl}ms)`);
  }
  return cache;
}

function getTracker(): PerformanceTracker {
  if (!tracker) {
    tracker = new PerformanceTracker();
    log("[BabyAI] Performance tracker initialized");
  }
  return tracker;
}

function getLimiter(): RateLimiter {
  if (!limiter) {
    limiter = new RateLimiter({
      maxRequests: config.rateLimitMaxRequests,
      windowMs: config.rateLimitWindowMs,
    });
    log(`[BabyAI] Rate limiter initialized (${config.rateLimitMaxRequests} requests per ${config.rateLimitWindowMs}ms)`);
  }
  return limiter;
}

function getPiAgent(): PiAgent {
  if (!piAgentInstance) {
    if (!config.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required for PI Agent");
    }
    piAgentInstance = createPiAgentSession({
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt: config.systemPrompt,
    });
    log(`[BabyAI] PI Agent initialized with model: ${config.model}`);
  }
  return piAgentInstance;
}

export async function askPiAsync(
  question: string,
  history: ConversationItem[],
  quick: boolean = false,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const startTime = Date.now();
  const perfTracker = config.enableCache || config.enableRateLimit ? getTracker() : null;
  
  if (config.enableRateLimit) {
    const rateLimiter = getLimiter();
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getTimeUntilNextRequest();
      log(`[BabyAI] Rate limit reached, waiting ${waitTime}ms`);
      await sleepAsync(waitTime);
    }
  }

  if (config.enableCache) {
    const cacheInstance = getCache();
    const cached = cacheInstance.get(question);
    if (cached) {
      perfTracker?.recordCacheHit();
      log("[BabyAI] Cache hit");
      return cached;
    }
    perfTracker?.recordCacheMiss();
  }

  try {
    const agent = getPiAgent();
    const context = quick ? buildQuickContext(history, question) : buildContext(history, question);
    
    const messages: PiAgentMessage[] = [
      { role: "system", content: context },
      { role: "user", content: question },
    ];

    log(`[BabyAI] Sending request to PI Agent (quick: ${quick})`);
    const response = await agent.run(messages, onChunk);
    const elapsed = Date.now() - startTime;
    
    perfTracker?.recordRequest(true, elapsed);
    log(`[BabyAI] Response received in ${elapsed}ms`);
    
    const content = response.content || "[Pi returned empty response]";
    
    if (config.enableCache && !content.startsWith("[Error")) {
      getCache().set(question, content);
      log("[BabyAI] Response cached");
    }
    
    return content;
  } catch (e) {
    const elapsed = Date.now() - startTime;
    const msg = e instanceof Error ? e.message : String(e);
    
    perfTracker?.recordRequest(false, elapsed);
    log(`[BabyAI] Error after ${elapsed}ms: ${msg}`);
    
    return `[Error calling Pi Agent: ${msg}]`;
  }
}

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

export async function tellmeAsync(question: string, quick: boolean = false): Promise<void> {
  ensureDir();
  const history = loadHistory();

  const mode = quick ? "(quick mode)" : "(full context with real PI Agent)";
  console.log(`[TRAENUPI] Asking ${mode}: "${question}"`);
  console.log("─".repeat(50));

  let answer = "";
  let retries = 0;
  const maxRetries = 3;
  const baseDelayMs = 2000;

  while (retries <= maxRetries) {
    try {
      answer = await askPiAsync(question, history, quick);

      if (!answer.startsWith("[Error") && !answer.startsWith("[Pi Agent error")) {
        break;
      }

      retries++;
      if (retries <= maxRetries) {
        const delay = baseDelayMs * Math.pow(2, retries - 1);
        console.log(`[RETRY ${retries}/${maxRetries}] Waiting ${delay / 1000}s before retry...`);
        await sleepAsync(delay);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      answer = `[Error: ${msg}]`;
      retries++;
      if (retries <= maxRetries) {
        const delay = baseDelayMs * Math.pow(2, retries - 1);
        console.log(`[RETRY ${retries}/${maxRetries}] Waiting ${delay / 1000}s before retry...`);
        await sleepAsync(delay);
      }
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

function sleepAsync(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
