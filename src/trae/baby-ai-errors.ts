export class BabyAiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "BabyAiError";
  }
}

export class PiAgentError extends BabyAiError {
  constructor(message: string, cause?: Error) {
    super(message, "PI_AGENT_ERROR", cause);
    this.name = "PiAgentError";
  }
}

export class PiTimeoutError extends BabyAiError {
  constructor(timeout: number) {
    super(`Pi Agent timed out after ${timeout}ms`, "PI_TIMEOUT");
    this.name = "PiTimeoutError";
  }
}

export class RateLimitError extends BabyAiError {
  constructor(
    public readonly waitTime: number,
    public readonly maxRequests: number,
    public readonly windowMs: number
  ) {
    super(
      `Rate limit reached. Wait ${waitTime}ms before next request.`,
      "RATE_LIMIT"
    );
    this.name = "RateLimitError";
  }
}

export class CacheError extends BabyAiError {
  constructor(message: string, cause?: Error) {
    super(message, "CACHE_ERROR", cause);
    this.name = "CacheError";
  }
}

export class ConfigurationError extends BabyAiError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}

export function isBabyAiError(error: unknown): error is BabyAiError {
  return error instanceof BabyAiError;
}

export function isPiAgentError(error: unknown): error is PiAgentError {
  return error instanceof PiAgentError;
}

export function isPiTimeoutError(error: unknown): error is PiTimeoutError {
  return error instanceof PiTimeoutError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isCacheError(error: unknown): error is CacheError {
  return error instanceof CacheError;
}

export function isConfigurationError(error: unknown): error is ConfigurationError {
  return error instanceof ConfigurationError;
}
