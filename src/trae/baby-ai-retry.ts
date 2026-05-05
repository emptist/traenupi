import { BabyAiError } from "./baby-ai-errors.js";

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (attempt: number, delay: number, error: unknown) => void;
}

export interface RetryResult<T> {
  result: T;
  attempts: number;
  totalDelay: number;
}

const DEFAULT_SHOULD_RETRY = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("timeout") ||
      message.includes("rate limit") ||
      message.includes("network") ||
      message.includes("connection")
    );
  }
  return false;
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<RetryResult<T>> {
  const { maxRetries, baseDelayMs, maxDelayMs = 60000, shouldRetry = DEFAULT_SHOULD_RETRY, onRetry } = config;

  let lastError: unknown;
  let attempts = 0;
  let totalDelay = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;

    try {
      const result = await operation();
      return { result, attempts, totalDelay };
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && shouldRetry(error)) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        totalDelay += delay;

        if (onRetry) {
          onRetry(attempt + 1, delay, error);
        }

        await sleep(delay);
      } else {
        break;
      }
    }
  }

  throw lastError || new BabyAiError("Retry failed", "RETRY_FAILED");
}

export async function withRetrySync<T>(
  operation: () => T,
  config: RetryConfig
): Promise<RetryResult<T>> {
  return withRetry(async () => operation(), config);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateExponentialBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number = 60000
): number {
  return Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
}

export function isRetryableError(error: unknown): boolean {
  return DEFAULT_SHOULD_RETRY(error);
}
