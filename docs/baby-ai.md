# Baby AI Module Documentation

## Overview

The Baby AI module provides a production-ready AI assistant integration with caching, performance tracking, and rate limiting.

## Features

### 🚀 Core Features

- **PI Agent Integration**: Real AI agent powered by OpenRouter
- **Caching**: LRU cache with TTL for faster responses
- **Performance Tracking**: Comprehensive metrics and monitoring
- **Rate Limiting**: API protection with sliding window algorithm
- **Configuration**: Flexible runtime configuration

### 📊 Performance Benefits

- **Cache Hit**: Instant response (0ms API call)
- **Cache Miss**: Normal API call with caching for future
- **Rate Limiting**: Prevents API quota exhaustion
- **Metrics**: Visibility into performance and usage

## Configuration

### Basic Configuration

```typescript
import { configureBabyAi } from "./baby-ai.js";

configureBabyAi({
  apiKey: "your-api-key",
  model: "tencent/hy3-preview:free",
  systemPrompt: "You are a helpful assistant",
});
```

### Full Configuration Options

```typescript
interface BabyAiConfig {
  // Core settings
  apiKey?: string;              // OpenRouter API key
  model?: string;               // LLM model to use
  systemPrompt?: string;        // Custom system prompt
  maxRetries?: number;          // Max retry attempts (default: 3)
  baseDelayMs?: number;         // Base delay for retries (default: 2000)
  timeout?: number;             // Request timeout in ms (default: 120000)
  enableLogging?: boolean;      // Enable logging (default: true)
  
  // Cache settings
  enableCache?: boolean;        // Enable caching (default: true)
  cacheMaxSize?: number;        // Max cache entries (default: 100)
  cacheTtl?: number;            // Cache TTL in ms (default: 3600000 = 1 hour)
  
  // Rate limiting settings
  enableRateLimit?: boolean;    // Enable rate limiting (default: true)
  rateLimitMaxRequests?: number; // Max requests per window (default: 60)
  rateLimitWindowMs?: number;   // Rate limit window in ms (default: 60000 = 1 min)
}
```

## Usage Examples

### Basic Usage

```typescript
import { askPiAsync } from "./baby-ai.js";

const answer = await askPiAsync(
  "What is the capital of France?",
  [], // history
  false // quick mode
);

console.log(answer);
```

### With Streaming

```typescript
import { askPiAsync } from "./baby-ai.js";

const answer = await askPiAsync(
  "Tell me a story",
  [],
  false,
  (chunk) => {
    process.stdout.write(chunk); // Stream output
  }
);
```

### Quick Mode

```typescript
import { askPiAsync } from "./baby-ai.js";

// Quick mode uses minimal context for faster responses
const answer = await askPiAsync(
  "What is 2+2?",
  [],
  true // quick mode
);
```

### Performance Monitoring

```typescript
import { 
  askPiAsync, 
  getPerformanceMetrics, 
  printPerformanceMetrics 
} from "./baby-ai.js";

// Make some requests
await askPiAsync("Question 1", [], false);
await askPiAsync("Question 2", [], false);

// Get metrics
const metrics = getPerformanceMetrics();
console.log(metrics);

// Or print formatted metrics
printPerformanceMetrics();
```

Output:
```
Performance Metrics:
  Total Requests: 2
  Successful: 2
  Failed: 0
  Success Rate: 100.00%
  Average Response Time: 1234.56ms
  Total Tokens Used: 0
  Cache Hit Rate: 0.00%
```

### Cache Management

```typescript
import { clearCache, askPiAsync } from "./baby-ai.js";

// First request (cache miss)
await askPiAsync("What is AI?", [], false);

// Second request (cache hit - instant!)
await askPiAsync("What is AI?", [], false);

// Clear cache
clearCache();

// Third request (cache miss again)
await askPiAsync("What is AI?", [], false);
```

### Custom Configuration

```typescript
import { configureBabyAi, askPiAsync } from "./baby-ai.js";

// Configure for high-volume usage
configureBabyAi({
  enableCache: true,
  cacheMaxSize: 1000,        // 1000 entries
  cacheTtl: 7200000,         // 2 hours
  enableRateLimit: true,
  rateLimitMaxRequests: 100, // 100 requests per minute
  rateLimitWindowMs: 60000,
});

// Configure for development
configureBabyAi({
  enableLogging: true,
  enableCache: false,        // Disable cache for testing
  enableRateLimit: false,    // Disable rate limiting
});
```

## Utility Classes

### BabyAiCache

LRU cache with TTL support:

```typescript
import { BabyAiCache } from "./baby-ai-utils.js";

const cache = new BabyAiCache(100, 3600000); // 100 entries, 1 hour TTL

// Set value
cache.set("question", "answer");

// Get value (returns null if expired or missing)
const answer = cache.get("question");

// Clear cache
cache.clear();

// Get size
const size = cache.size();
```

### PerformanceTracker

Track performance metrics:

```typescript
import { PerformanceTracker, formatMetrics } from "./baby-ai-utils.js";

const tracker = new PerformanceTracker();

// Record requests
tracker.recordRequest(true, 100, 50);  // success, 100ms, 50 tokens
tracker.recordRequest(false, 200);     // failure, 200ms

// Record cache
tracker.recordCacheHit();
tracker.recordCacheMiss();

// Get metrics
const metrics = tracker.getMetrics();

// Format metrics
console.log(formatMetrics(metrics));

// Reset
tracker.reset();
```

### RateLimiter

Sliding window rate limiter:

```typescript
import { RateLimiter } from "./baby-ai-utils.js";

const limiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 60000, // 60 requests per minute
});

// Check if request allowed
if (limiter.canMakeRequest()) {
  // Make request
} else {
  // Wait
  const waitTime = limiter.getTimeUntilNextRequest();
  await sleep(waitTime);
}

// Reset
limiter.reset();
```

## Best Practices

### 1. Enable Caching for Production

```typescript
configureBabyAi({
  enableCache: true,
  cacheMaxSize: 1000,
  cacheTtl: 3600000, // 1 hour
});
```

### 2. Monitor Performance

```typescript
// Log metrics periodically
setInterval(() => {
  printPerformanceMetrics();
}, 60000); // Every minute
```

### 3. Handle Rate Limiting

```typescript
// Let the module handle it automatically
configureBabyAi({
  enableRateLimit: true,
  rateLimitMaxRequests: 50, // Conservative limit
});
```

### 4. Use Quick Mode for Simple Questions

```typescript
// Quick mode for simple, context-free questions
const answer = await askPiAsync("What is 2+2?", [], true);
```

### 5. Clear Cache When Needed

```typescript
// Clear cache when switching topics or after configuration changes
clearCache();
```

## Troubleshooting

### Issue: Cache Not Working

**Symptoms**: No cache hits, all requests go to API

**Solution**:
```typescript
// Check if cache is enabled
configureBabyAi({
  enableCache: true,
});

// Check if responses are being cached
// Only successful responses (not starting with "[Error") are cached
```

### Issue: Rate Limiting Too Strict

**Symptoms**: Requests wait too long

**Solution**:
```typescript
// Increase rate limit
configureBabyAi({
  rateLimitMaxRequests: 100, // More requests
  rateLimitWindowMs: 60000,  // Per minute
});
```

### Issue: Performance Metrics Not Available

**Symptoms**: getPerformanceMetrics() returns null

**Solution**:
```typescript
// Enable cache or rate limiting to activate performance tracking
configureBabyAi({
  enableCache: true, // or
  enableRateLimit: true,
});
```

## API Reference

### Functions

#### `configureBabyAi(config: Partial<BabyAiConfig>): void`
Configure the Baby AI module.

#### `askPiAsync(question, history, quick?, onChunk?): Promise<string>`
Ask a question to the AI.

#### `getPerformanceMetrics(): PerformanceMetrics | null`
Get performance metrics.

#### `printPerformanceMetrics(): void`
Print formatted performance metrics.

#### `clearCache(): void`
Clear the cache.

### Types

#### `BabyAiConfig`
Configuration interface for Baby AI.

#### `PerformanceMetrics`
Performance metrics interface.

#### `CacheEntry`
Cache entry interface.

#### `RateLimitConfig`
Rate limiter configuration interface.

## Performance Characteristics

### Cache Performance

- **Hit Rate**: Typically 30-50% for repeated questions
- **Hit Latency**: < 1ms (instant)
- **Miss Latency**: Normal API call time

### Rate Limiting Performance

- **Overhead**: < 1ms per request
- **Memory**: O(n) where n = max requests in window
- **Accuracy**: Exact (sliding window)

### Memory Usage

- **Cache**: ~1KB per entry
- **Tracker**: ~100 bytes
- **Limiter**: ~8 bytes per request in window

## Future Improvements

- [ ] Persistent cache (file/database)
- [ ] Distributed rate limiting
- [ ] Token usage tracking from API
- [ ] Cost estimation
- [ ] A/B testing support
- [ ] Response quality scoring
