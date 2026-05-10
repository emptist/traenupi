export type AIProvider = "openrouter" | "ollama";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  isFallback: boolean;
}

export interface AIDirectConfig {
  primaryProvider: AIProviderConfig;
  fallbackProvider?: AIProviderConfig;
  enableFallback: boolean;
  retryCount: number;
  timeoutMs: number;
}

const DEFAULT_CONFIG: AIDirectConfig = {
  primaryProvider: {
    provider: "openrouter",
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.3,
    maxTokens: 4000,
  },
  fallbackProvider: {
    provider: "ollama",
    model: "llama3.2:3b",
    baseUrl: "http://localhost:11434",
    temperature: 0.3,
    maxTokens: 4000,
  },
  enableFallback: true,
  retryCount: 3,
  timeoutMs: 120000,
};

let config: AIDirectConfig = { ...DEFAULT_CONFIG };

export function configureAIDirect(newConfig: Partial<AIDirectConfig>): void {
  config = { ...config, ...newConfig };
}

export function getAIDirectConfig(): AIDirectConfig {
  return { ...config };
}

async function callOpenRouter(
  messages: AIMessage[],
  providerConfig: AIProviderConfig
): Promise<AICompletionResponse> {
  const startTime = Date.now();
  
  const apiKey = providerConfig.apiKey || process.env.OPENROUTER_API_KEY || "";
  const baseUrl = providerConfig.baseUrl || "https://openrouter.ai/api/v1";
  const model = providerConfig.model;
  
  if (!apiKey) {
    throw new Error("[AIDirect] OpenRouter API key is required");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://traenupi.ai",
      "X-Title": "TraeNuPI",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: providerConfig.temperature || 0.3,
      max_tokens: providerConfig.maxTokens || 4000,
    }),
    signal: AbortSignal.timeout(config.timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[AIDirect] OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };

  const latencyMs = Date.now() - startTime;

  return {
    content: data.choices[0]?.message?.content || "",
    model,
    provider: "openrouter",
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
    latencyMs,
    isFallback: false,
  };
}

async function callOllama(
  messages: AIMessage[],
  providerConfig: AIProviderConfig
): Promise<AICompletionResponse> {
  const startTime = Date.now();
  
  const baseUrl = providerConfig.baseUrl || "http://localhost:11434";
  const model = providerConfig.model;

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: providerConfig.temperature || 0.3,
        num_predict: providerConfig.maxTokens || 4000,
      },
    }),
    signal: AbortSignal.timeout(config.timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[AIDirect] Ollama API error: ${response.status} ${errorText}`);
  }

  const data = await response.json() as {
    message?: { content: string };
    model: string;
    eval_count?: number;
    prompt_eval_count?: number;
  };

  const latencyMs = Date.now() - startTime;

  return {
    content: data.message?.content || "",
    model,
    provider: "ollama",
    usage: data.eval_count
      ? {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count,
          totalTokens: (data.prompt_eval_count || 0) + data.eval_count,
        }
      : undefined,
    latencyMs,
    isFallback: true,
  };
}

function isRetryableError(error: any): boolean {
  const message = error?.message?.toLowerCase() || "";
  const status = error?.status || 0;
  
  const isRateLimited = status === 429 || 
    message.includes("rate limit") || 
    message.includes("too many requests");
  
  const isOutOfCredits = status === 403 || 
    message.includes("out of credits") || 
    message.includes("quota") || 
    message.includes("insufficient");
  
  const isServerError = status >= 500 && status < 600;
  
  const isModelUnavailable = status === 404 || 
    message.includes("model not found") || 
    message.includes("not found");

  return isRateLimited || isOutOfCredits || isServerError || isModelUnavailable;
}

function getProviderFunction(provider: AIProvider) {
  switch (provider) {
    case "openrouter":
      return callOpenRouter;
    case "ollama":
      return callOllama;
    default:
      throw new Error(`[AIDirect] Unknown provider: ${provider}`);
  }
}

export async function askDirect(
  question: string,
  systemPrompt: string,
  options?: {
    useFallback?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<AICompletionResponse> {
  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ];

  const useFallback = options?.useFallback ?? config.enableFallback;

  try {
    const primaryFn = getProviderFunction(config.primaryProvider.provider);
    
    for (let attempt = 1; attempt <= config.retryCount; attempt++) {
      try {
        const result = await primaryFn(messages, config.primaryProvider);
        console.log(`[AIDirect] ✅ Success via ${config.primaryProvider.provider}/${config.primaryProvider.model} (${result.latencyMs}ms, attempt ${attempt})`);
        return result;
      } catch (error: any) {
        console.error(`[AIDirect] ❌ Attempt ${attempt}/${config.retryCount} failed:`, error.message);
        
        if (options?.onRetry) {
          options.onRetry(attempt, error);
        }
        
        if (attempt < config.retryCount && isRetryableError(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`[AIDirect] ⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (!isRetryableError(error) || attempt === config.retryCount) {
          throw error;
        }
      }
    }
    
    throw new Error("[AIDirect] All retries exhausted");
  } catch (primaryError: any) {
    if (!useFallback || !config.fallbackProvider) {
      throw primaryError;
    }

    console.log(`[AIDirect] ⚠️ Primary failed, trying fallback: ${config.fallbackProvider.provider}/${config.fallbackProvider.model}`);
    
    try {
      const fallbackFn = getProviderFunction(config.fallbackProvider.provider);
      const result = await fallbackFn(messages, config.fallbackProvider);
      console.log(`[AIDirect] ✅ Fallback success via ${config.fallbackProvider.provider}/${config.fallbackProvider.model} (${result.latencyMs}ms)`);
      return result;
    } catch (fallbackError: any) {
      console.error(`[AIDirect] ❌ Fallback also failed:`, fallbackError.message);
      throw new Error(`[AIDirect] Both providers failed:\nPrimary: ${primaryError.message}\nFallback: ${fallbackError.message}`);
    }
  }
}

export async function testConnection(): Promise<{
  openrouter: { connected: boolean; model: string; latencyMs?: number; error?: string };
  ollama: { connected: boolean; model: string; latencyMs?: number; error?: string };
}> {
  const results = {
    openrouter: { connected: false, model: config.primaryProvider.model } as { connected: boolean; model: string; latencyMs?: number; error?: string },
    ollama: { connected: false, model: config.fallbackProvider?.model || "N/A" } as { connected: boolean; model: string; latencyMs?: number; error?: string },
  };

  try {
    const start = Date.now();
    await askDirect("ping", "Respond with 'pong'", { useFallback: false });
    results.openrouter.connected = true;
    results.openrouter.latencyMs = Date.now() - start;
  } catch (e: any) {
    results.openrouter.error = e.message;
  }

  if (config.fallbackProvider) {
    try {
      const start = Date.now();
      await callOllama([{ role: "user", content: "ping" }], config.fallbackProvider);
      results.ollama.connected = true;
      results.ollama.latencyMs = Date.now() - start;
    } catch (e: any) {
      results.ollama.error = e.message;
    }
  }

  return results;
}
