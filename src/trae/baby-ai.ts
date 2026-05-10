import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import type { ConversationItem } from "../common/types.js";
import { loadHistory, saveHistory, ensureDir } from "../common/storage.js";
import { buildContext, buildQuickContext, PI_SESSION_DIR, PI_FLAGS } from "./context.js";
import { PiAgent, createPiAgentSession, type PiAgentConfig, type PiAgentMessage } from "./pi-agent-bridge.js";
import { BabyAiCache, PerformanceTracker, RateLimiter, formatMetrics } from "./baby-ai-utils.js";
import { withRetry, type RetryConfig } from "./baby-ai-retry.js";
import { BabyAiError, PiAgentError, PiTimeoutError, ConfigurationError } from "./baby-ai-errors.js";

/**
 * Configuration options for the Baby AI module.
 */
export interface BabyAiConfig {
  /** OpenRouter API key for PI Agent */
  apiKey?: string;
  /** LLM model to use (default: "tencent/hy3-preview:free") */
  model?: string;
  /** Custom system prompt for the AI */
  systemPrompt?: string;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default: 2000) */
  baseDelayMs?: number;
  /** Request timeout in milliseconds (default: 120000) */
  timeout?: number;
  /** Enable logging (default: true) */
  enableLogging?: boolean;
  /** Enable response caching (default: true) */
  enableCache?: boolean;
  /** Maximum number of cache entries (default: 100) */
  cacheMaxSize?: number;
  /** Cache TTL in milliseconds (default: 3600000 = 1 hour) */
  cacheTtl?: number;
  /** Enable rate limiting (default: true) */
  enableRateLimit?: boolean;
  /** Maximum requests per rate limit window (default: 60) */
  rateLimitMaxRequests?: number;
  /** Rate limit window in milliseconds (default: 60000 = 1 minute) */
  rateLimitWindowMs?: number;
}

const DEFAULT_CONFIG: Required<BabyAiConfig> = {
  apiKey: process.env.OPENROUTER_API_KEY || "",
  model: "anthropic/claude-3.5-sonnet",
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

/**
 * Configure the Baby AI module with custom settings.
 * This will reset all cached instances and reinitialize with new config.
 * 
 * @param newConfig - Partial configuration to update
 * 
 * @example
 * ```typescript
 * configureBabyAi({
 *   model: "anthropic/claude-3-opus",
 *   enableCache: true,
 *   cacheMaxSize: 200
 * });
 * ```
 */
export function configureBabyAi(newConfig: Partial<BabyAiConfig>): void {
  config = { ...config, ...newConfig };
  piAgentInstance = null;
  cache = null;
  tracker = null;
  limiter = null;
}

/**
 * Get current performance metrics for the Baby AI module.
 * Returns null if performance tracking is not enabled.
 * 
 * @returns Performance metrics or null
 * 
 * @example
 * ```typescript
 * const metrics = getPerformanceMetrics();
 * if (metrics) {
 *   console.log(`Success rate: ${metrics.successfulRequests / metrics.totalRequests * 100}%`);
 * }
 * ```
 */
export function getPerformanceMetrics() {
  return tracker ? tracker.getMetrics() : null;
}

/**
 * Print current performance metrics to console.
 * Does nothing if performance tracking is not enabled.
 * 
 * @example
 * ```typescript
 * printPerformanceMetrics();
 * // Output:
 * // [BabyAI] Performance Metrics:
 * // Total Requests: 100
 * // Successful: 95
 * // Failed: 5
 * // ...
 * ```
 */
export function printPerformanceMetrics(): void {
  const metrics = getPerformanceMetrics();
  if (metrics) {
    console.log(formatMetrics(metrics));
  } else {
    console.log("[BabyAI] Performance tracking not enabled");
  }
}

/**
 * Clear the response cache.
 * Does nothing if caching is not enabled.
 * 
 * @example
 * ```typescript
 * clearCache();
 * console.log("Cache cleared");
 * ```
 */
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
      throw new ConfigurationError("OPENROUTER_API_KEY environment variable is required for PI Agent");
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

/**
 * Ask PI Agent a question asynchronously with caching and rate limiting.
 * 
 * @param question - The question to ask
 * @param history - Conversation history for context
 * @param quick - Use quick context mode (default: false)
 * @param onChunk - Optional callback for streaming responses
 * @returns The AI's response
 * 
 * @example
 * ```typescript
 * const response = await askPiAsync(
 *   "What is the capital of France?",
 *   [],
 *   false,
 *   (chunk) => process.stdout.write(chunk)
 * );
 * console.log(response);
 * ```
 */
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
    const context = quick ? await buildQuickContext(history, question) : await buildContext(history, question);
    
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
    
    if (e instanceof BabyAiError) {
      throw e;
    }
    throw new PiAgentError(`Error calling Pi Agent: ${msg}`, e instanceof Error ? e : undefined);
  }
}

/**
 * Ask PI a question synchronously using the pi CLI.
 * 
 * @param question - The question to ask
 * @param history - Conversation history for context
 * @param quick - Use quick context mode (default: false)
 * @param useSession - Use session mode for persistent context (default: false)
 * @returns The AI's response
 * 
 * @example
 * ```typescript
 * const response = askPi("What is 2 + 2?", [], false, false);
 * console.log(response);
 * ```
 */
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
      throw new PiTimeoutError(120000);
    }
    throw new PiAgentError(`Error calling Pi: ${msg}`, e instanceof Error ? e : undefined);
  }
}

/**
 * Perform a web search using Pi (note: Pi uses local model, not real web search).
 * 
 * @param query - The search query
 * 
 * @example
 * ```typescript
 * webSearch("What is the latest version of Gleam?");
 * ```
 */
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

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 2000,
  shouldRetry: (error: unknown) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes("error") || message.includes("timeout");
    }
    return false;
  },
  onRetry: (attempt, delay) => {
    console.log(`[RETRY ${attempt}/3] Waiting ${delay / 1000}s before retry...`);
  },
};

/**
 * Ask Pi a question synchronously with retry logic and history management.
 * 
 * @param question - The question to ask
 * @param quick - Use quick context mode (default: false)
 * @param useSession - Use session mode for persistent context (default: false)
 * 
 * @example
 * ```typescript
 * tellmeSync("What is the meaning of life?", false, false);
 * ```
 */
export async function tellmeSync(question: string, quick: boolean = false, useSession: boolean = false): Promise<void> {
  ensureDir();
  const history = loadHistory();

  const mode = quick ? "(quick mode)" : useSession ? "(session mode)" : "(full context)";
  console.log(`[TRAENUPI] Asking ${mode}: "${question}"`);
  console.log("─".repeat(50));

  try {
    const result = await withRetry(
      async () => await askPi(question, history, quick, useSession),
      RETRY_CONFIG
    );

    console.log("\n[TRAENUPI ANSWER]:");
    console.log(result.result);
    console.log("\n" + "─".repeat(50));

    history.push({ question, answer: result.result, time: Date.now() });
    saveHistory(history);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Error: ${errorMsg}]`);
  }
}

/**
 * Ask Pi a question asynchronously with retry logic and history management.
 * Uses the real PI Agent for better responses.
 * 
 * @param question - The question to ask
 * @param quick - Use quick context mode (default: false)
 * 
 * @example
 * ```typescript
 * await tellmeAsync("Explain quantum computing in simple terms", false);
 * ```
 */
export async function tellmeAsync(question: string, quick: boolean = false): Promise<void> {
  ensureDir();
  const history = loadHistory();

  const mode = quick ? "(quick mode)" : "(full context with real PI Agent)";
  console.log(`[TRAENUPI] Asking ${mode}: "${question}"`);
  console.log("─".repeat(50));

  try {
    const result = await withRetry(
      () => askPiAsync(question, history, quick),
      RETRY_CONFIG
    );

    console.log("\n[TRAENUPI ANSWER]:");
    console.log(result.result);
    console.log("\n" + "─".repeat(50));

    history.push({ question, answer: result.result, time: Date.now() });
    saveHistory(history);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Error: ${errorMsg}]`);
  }
}

/**
 * Ask Pi a question in daemon mode (no console output, just save to history).
 * 
 * @param question - The question to ask
 * 
 * @example
 * ```typescript
 * tellmeDaemon("What time is it?");
 * // Silently saves response to history
 * ```
 */
export async function tellmeDaemon(question: string): Promise<void> {
  ensureDir();
  const history = loadHistory();
  const answer = await askPi(question, history, false, false);
  history.push({ question, answer, time: Date.now() });
  saveHistory(history);
}

function sleepAsync(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withRetrySync<T>(operation: () => T, config: RetryConfig): { result: T; attempts: number; totalDelay: number } {
  let lastError: unknown;
  let attempts = 0;
  let totalDelay = 0;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    attempts = attempt + 1;

    try {
      const result = operation();
      return { result, attempts, totalDelay };
    } catch (error) {
      lastError = error;

      if (attempt < config.maxRetries && config.shouldRetry && config.shouldRetry(error)) {
        const delay = Math.min(config.baseDelayMs * Math.pow(2, attempt), 60000);
        totalDelay += delay;

        if (config.onRetry) {
          config.onRetry(attempt + 1, delay, error);
        }

        const end = Date.now() + delay;
        while (Date.now() < end) {}
      } else {
        break;
      }
    }
  }

  throw lastError;
}
