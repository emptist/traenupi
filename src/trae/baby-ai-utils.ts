import type { BabyAiConfig } from "./baby-ai.js";

export interface CacheEntry {
  question: string;
  answer: string;
  timestamp: number;
  ttl: number;
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class BabyAiCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize: number = 100, defaultTtl: number = 3600000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  get(question: string): string | null {
    const key = this.hashQuestion(question);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.answer;
  }

  set(question: string, answer: string, ttl?: number): void {
    const key = this.hashQuestion(question);
    
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      question,
      answer,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private hashQuestion(question: string): string {
    let hash = 0;
    for (let i = 0; i < question.length; i++) {
      const char = question.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private evictOldest(): void {
    let oldest: [string, CacheEntry] | null = null;
    
    for (const entry of this.cache.entries()) {
      if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
        oldest = entry;
      }
    }

    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }
}

export class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalTokensUsed: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  private responseTimes: number[] = [];

  recordRequest(success: boolean, responseTime: number, tokens?: number): void {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.responseTimes.push(responseTime);
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    if (tokens) {
      this.metrics.totalTokensUsed += tokens;
    }
  }

  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
    this.responseTimes = [];
  }
}

export class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.config.windowMs);
    
    if (this.requests.length < this.config.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) {
      return 0;
    }

    const now = Date.now();
    const oldestRequest = Math.min(...this.requests);
    return this.config.windowMs - (now - oldestRequest);
  }

  reset(): void {
    this.requests = [];
  }
}

export function formatMetrics(metrics: PerformanceMetrics): string {
  return `
Performance Metrics:
  Total Requests: ${metrics.totalRequests}
  Successful: ${metrics.successfulRequests}
  Failed: ${metrics.failedRequests}
  Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%
  Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms
  Total Tokens Used: ${metrics.totalTokensUsed}
  Cache Hit Rate: ${((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2)}%
`.trim();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
