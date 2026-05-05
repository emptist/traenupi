import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { BabyAiCache, PerformanceTracker, RateLimiter, formatMetrics, sleep } from "./baby-ai-utils.js";

describe("BabyAiCache", () => {
  let cache: BabyAiCache;

  beforeEach(() => {
    cache = new BabyAiCache(3, 1000);
  });

  it("should store and retrieve values", () => {
    cache.set("question1", "answer1");
    assert.strictEqual(cache.get("question1"), "answer1");
  });

  it("should return null for missing keys", () => {
    assert.strictEqual(cache.get("nonexistent"), null);
  });

  it("should evict oldest entry when max size reached", () => {
    cache.set("q1", "a1");
    cache.set("q2", "a2");
    cache.set("q3", "a3");
    cache.set("q4", "a4");

    assert.strictEqual(cache.get("q1"), null);
    assert.strictEqual(cache.get("q2"), "a2");
    assert.strictEqual(cache.get("q3"), "a3");
    assert.strictEqual(cache.get("q4"), "a4");
  });

  it("should expire entries after TTL", async () => {
    cache = new BabyAiCache(3, 100);
    cache.set("question", "answer");
    
    assert.strictEqual(cache.get("question"), "answer");
    
    await sleep(150);
    
    assert.strictEqual(cache.get("question"), null);
  });

  it("should clear all entries", () => {
    cache.set("q1", "a1");
    cache.set("q2", "a2");
    
    assert.strictEqual(cache.size(), 2);
    
    cache.clear();
    
    assert.strictEqual(cache.size(), 0);
  });

  it("should return correct size", () => {
    assert.strictEqual(cache.size(), 0);
    
    cache.set("q1", "a1");
    assert.strictEqual(cache.size(), 1);
    
    cache.set("q2", "a2");
    assert.strictEqual(cache.size(), 2);
  });
});

describe("PerformanceTracker", () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
  });

  it("should track successful requests", () => {
    tracker.recordRequest(true, 100);
    tracker.recordRequest(true, 200);

    const metrics = tracker.getMetrics();
    assert.strictEqual(metrics.totalRequests, 2);
    assert.strictEqual(metrics.successfulRequests, 2);
    assert.strictEqual(metrics.failedRequests, 0);
  });

  it("should track failed requests", () => {
    tracker.recordRequest(false, 50);
    tracker.recordRequest(true, 100);

    const metrics = tracker.getMetrics();
    assert.strictEqual(metrics.totalRequests, 2);
    assert.strictEqual(metrics.successfulRequests, 1);
    assert.strictEqual(metrics.failedRequests, 1);
  });

  it("should calculate average response time", () => {
    tracker.recordRequest(true, 100);
    tracker.recordRequest(true, 200);
    tracker.recordRequest(true, 300);

    const metrics = tracker.getMetrics();
    assert.strictEqual(metrics.averageResponseTime, 200);
  });

  it("should track token usage", () => {
    tracker.recordRequest(true, 100, 50);
    tracker.recordRequest(true, 100, 30);

    const metrics = tracker.getMetrics();
    assert.strictEqual(metrics.totalTokensUsed, 80);
  });

  it("should track cache hits and misses", () => {
    tracker.recordCacheHit();
    tracker.recordCacheHit();
    tracker.recordCacheMiss();

    const metrics = tracker.getMetrics();
    assert.strictEqual(metrics.cacheHits, 2);
    assert.strictEqual(metrics.cacheMisses, 1);
  });

  it("should reset all metrics", () => {
    tracker.recordRequest(true, 100, 50);
    tracker.recordCacheHit();
    
    tracker.reset();
    
    const metrics = tracker.getMetrics();
    assert.strictEqual(metrics.totalRequests, 0);
    assert.strictEqual(metrics.totalTokensUsed, 0);
    assert.strictEqual(metrics.cacheHits, 0);
  });
});

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
  });

  it("should allow requests under limit", () => {
    assert.strictEqual(limiter.canMakeRequest(), true);
    assert.strictEqual(limiter.canMakeRequest(), true);
    assert.strictEqual(limiter.canMakeRequest(), true);
  });

  it("should block requests over limit", () => {
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    
    assert.strictEqual(limiter.canMakeRequest(), false);
  });

  it("should allow requests after window expires", async () => {
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    
    assert.strictEqual(limiter.canMakeRequest(), false);
    
    await sleep(1100);
    
    assert.strictEqual(limiter.canMakeRequest(), true);
  });

  it("should calculate time until next request", () => {
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    
    const timeUntilNext = limiter.getTimeUntilNextRequest();
    assert.ok(timeUntilNext > 0);
    assert.ok(timeUntilNext <= 1000);
  });

  it("should reset rate limiter", () => {
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    limiter.canMakeRequest();
    
    limiter.reset();
    
    assert.strictEqual(limiter.canMakeRequest(), true);
  });
});

describe("formatMetrics", () => {
  it("should format metrics correctly", () => {
    const metrics = {
      totalRequests: 10,
      successfulRequests: 8,
      failedRequests: 2,
      averageResponseTime: 150.5,
      totalTokensUsed: 500,
      cacheHits: 6,
      cacheMisses: 4,
    };

    const formatted = formatMetrics(metrics);
    
    assert.ok(formatted.includes("Total Requests: 10"));
    assert.ok(formatted.includes("Successful: 8"));
    assert.ok(formatted.includes("Failed: 2"));
    assert.ok(formatted.includes("Success Rate: 80.00%"));
    assert.ok(formatted.includes("Average Response Time: 150.50ms"));
    assert.ok(formatted.includes("Total Tokens Used: 500"));
    assert.ok(formatted.includes("Cache Hit Rate: 60.00%"));
  });
});

describe("sleep", () => {
  it("should delay execution", async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    
    assert.ok(elapsed >= 90);
    assert.ok(elapsed < 200);
  });
});
