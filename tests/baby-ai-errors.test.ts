import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  BabyAiError,
  PiAgentError,
  PiTimeoutError,
  RateLimitError,
  CacheError,
  ConfigurationError,
  isBabyAiError,
  isPiAgentError,
  isPiTimeoutError,
  isRateLimitError,
  isCacheError,
  isConfigurationError,
} from "../src/trae/baby-ai-errors.js";

describe("Baby AI Error Types", () => {
  describe("BabyAiError", () => {
    it("should create a basic error with code", () => {
      const error = new BabyAiError("Test error", "TEST_CODE");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.name).toBe("BabyAiError");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BabyAiError);
    });

    it("should create an error with cause", () => {
      const cause = new Error("Original error");
      const error = new BabyAiError("Wrapped error", "WRAPPED", cause);
      expect(error.cause).toBe(cause);
    });
  });

  describe("PiAgentError", () => {
    it("should create a PI Agent error", () => {
      const error = new PiAgentError("Agent failed");
      expect(error.message).toBe("Agent failed");
      expect(error.code).toBe("PI_AGENT_ERROR");
      expect(error.name).toBe("PiAgentError");
    });
  });

  describe("PiTimeoutError", () => {
    it("should create a timeout error with duration", () => {
      const error = new PiTimeoutError(30000);
      expect(error.message).toBe("Pi Agent timed out after 30000ms");
      expect(error.code).toBe("PI_TIMEOUT");
      expect(error.name).toBe("PiTimeoutError");
    });
  });

  describe("RateLimitError", () => {
    it("should create a rate limit error with wait time", () => {
      const error = new RateLimitError(5000, 60, 60000);
      expect(error.message).toBe("Rate limit reached. Wait 5000ms before next request.");
      expect(error.code).toBe("RATE_LIMIT");
      expect(error.name).toBe("RateLimitError");
      expect(error.waitTime).toBe(5000);
      expect(error.maxRequests).toBe(60);
      expect(error.windowMs).toBe(60000);
    });
  });

  describe("CacheError", () => {
    it("should create a cache error", () => {
      const error = new CacheError("Cache miss");
      expect(error.message).toBe("Cache miss");
      expect(error.code).toBe("CACHE_ERROR");
      expect(error.name).toBe("CacheError");
    });
  });

  describe("ConfigurationError", () => {
    it("should create a configuration error", () => {
      const error = new ConfigurationError("Missing API key");
      expect(error.message).toBe("Missing API key");
      expect(error.code).toBe("CONFIGURATION_ERROR");
      expect(error.name).toBe("ConfigurationError");
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify BabyAiError", () => {
      const error = new BabyAiError("Test", "TEST");
      expect(isBabyAiError(error)).toBe(true);
      expect(isBabyAiError(new Error("Test"))).toBe(false);
    });

    it("should correctly identify PiAgentError", () => {
      const error = new PiAgentError("Test");
      expect(isPiAgentError(error)).toBe(true);
      expect(isPiAgentError(new BabyAiError("Test", "TEST"))).toBe(false);
    });

    it("should correctly identify PiTimeoutError", () => {
      const error = new PiTimeoutError(1000);
      expect(isPiTimeoutError(error)).toBe(true);
      expect(isPiTimeoutError(new PiAgentError("Test"))).toBe(false);
    });

    it("should correctly identify RateLimitError", () => {
      const error = new RateLimitError(1000, 60, 60000);
      expect(isRateLimitError(error)).toBe(true);
      expect(isRateLimitError(new BabyAiError("Test", "TEST"))).toBe(false);
    });

    it("should correctly identify CacheError", () => {
      const error = new CacheError("Test");
      expect(isCacheError(error)).toBe(true);
      expect(isCacheError(new BabyAiError("Test", "TEST"))).toBe(false);
    });

    it("should correctly identify ConfigurationError", () => {
      const error = new ConfigurationError("Test");
      expect(isConfigurationError(error)).toBe(true);
      expect(isConfigurationError(new BabyAiError("Test", "TEST"))).toBe(false);
    });
  });
});
