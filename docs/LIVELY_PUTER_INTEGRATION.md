# Lively-Puter Integration for TraeNuPI

## 🎯 Overview

This integration brings the power of **Lively4** and **Puter** platforms to TraeNuPI, providing:

- **Unified File System**: Seamless file operations across local and cloud storage
- **AI Services**: Access to multiple AI providers (OpenAI, Claude, Gemini, etc.)
- **Database**: Hybrid key-value storage with automatic sync
- **Authentication**: Unified auth system supporting multiple providers

## 🚀 Quick Start

### TypeScript/JavaScript

```typescript
import { LivelyPuterBridge } from './src/common/lively-puter/index.js';

// Initialize the bridge
const bridge = new LivelyPuterBridge({
  mode: 'hybrid', // or 'lively-first', 'puter-first'
  enableAuth: true,
  enableAI: true,
  enableStorage: true,
  enableDatabase: true
});

await bridge.initialize();

// Use file system
await bridge.fs.write('/documents/test.txt', 'Hello!');
const content = await bridge.fs.read('/documents/test.txt');

// Use AI
const response = await bridge.ai.chat([
  { role: 'user', content: 'Hello!' }
]);

// Use database
await bridge.db.set('user:preferences', { theme: 'dark' });
const prefs = await bridge.db.get('user:preferences');

// Use authentication
const user = await bridge.auth.signIn();
```

### Gleam

```gleam
import traenupi_core/lively_puter as bridge

pub fn main() {
  // Initialize
  let config = bridge.default_config()
  let assert Ok(_) = bridge.initialize(config)
  
  // Use file system
  let assert Ok(_) = bridge.write_file("/test.txt", "Hello!")
  let assert Ok(content) = bridge.read_file("/test.txt")
  
  // Use AI
  let messages = [bridge.UserMessage("Hello!")]
  let assert Ok(response) = bridge.chat(messages)
  
  // Use database
  let value = json.object([#("theme", json.string("dark"))])
  let assert Ok(_) = bridge.db_set("user:preferences", value)
  
  // Use authentication
  let assert Ok(user) = bridge.sign_in()
}
```

## 🏗️ Architecture

### Three Integration Modes

1. **Lively-First Mode**
   - Primary: Lively4 local services
   - Fallback: Puter cloud services
   - Best for: Local development, offline work

2. **Puter-First Mode**
   - Primary: Puter cloud services
   - Fallback: Lively4 local services
   - Best for: Cloud-native applications

3. **Hybrid Mode** (Default)
   - Intelligent routing based on data type
   - Local: Temporary files, cache, session data
   - Cloud: User data, shared files, persistent storage
   - Best for: Production applications

### Hybrid Routing Strategy

#### File System
```
/tmp, /cache, /local      → Lively4 (fast local access)
/documents, /projects     → Puter (cloud sync)
```

#### Database
```
cache:, temp:, session:   → Local (fast)
user:, settings:, data:   → Cloud (persistent)
```

## 📁 Project Structure

```
traenupi/
├── src/common/lively-puter/
│   ├── index.ts                    # Main bridge class
│   ├── types.ts                    # Type definitions
│   └── adapters/
│       ├── lively/                 # Lively4 adapters
│       ├── puter/                  # Puter adapters
│       └── hybrid/                 # Hybrid adapters
│
├── gleam/traenupi_core/
│   ├── src/traenupi_core/
│   │   ├── lively_puter.gleam     # Gleam bindings
│   │   └── lively_puter_ffi.mjs   # FFI implementation
│   └── examples/
│       └── lively_puter_example.gleam
│
└── examples/
    └── lively-puter-integration.ts  # TypeScript example
```

## 🔧 Configuration

### Environment Variables

```bash
# Optional: Custom Puter SDK URL
PUTER_SDK_URL=https://js.puter.com/v2/

# Optional: Lively4 base URL
LIVELY_BASE_URL=http://localhost:4100
```

### Programmatic Configuration

```typescript
const bridge = new LivelyPuterBridge({
  mode: 'hybrid',
  puterSDKUrl: 'https://js.puter.com/v2/',
  livelyBaseUrl: 'http://localhost:4100',
  enableAuth: true,
  enableAI: true,
  enableStorage: true,
  enableDatabase: true
});
```

## 📚 API Reference

### File System

```typescript
// Write a file
await bridge.fs.write(path: string, content: string | Blob): Promise<void>

// Read a file
await bridge.fs.read(path: string): Promise<string | Blob>

// Delete a file
await bridge.fs.delete(path: string): Promise<void>

// Check if file exists
await bridge.fs.exists(path: string): Promise<boolean>

// List directory contents
await bridge.fs.readdir(path: string): Promise<FileInfo[]>

// Get file info
await bridge.fs.stat(path: string): Promise<FileInfo>

// Copy file
await bridge.fs.copy(src: string, dest: string): Promise<void>

// Move file
await bridge.fs.move(src: string, dest: string): Promise<void>
```

### AI Services

```typescript
// Chat with AI
await bridge.ai.chat(
  messages: ChatMessage[], 
  options?: ChatOptions
): Promise<ChatResponse>

// Generate image
await bridge.ai.generateImage(
  prompt: string, 
  options?: ImageGenerationOptions
): Promise<string>
```

### Database

```typescript
// Set a value
await bridge.db.set(key: string, value: any): Promise<void>

// Get a value
await bridge.db.get(key: string): Promise<any>

// Delete a value
await bridge.db.delete(key: string): Promise<void>

// List values with prefix
await bridge.db.list(prefix?: string): Promise<Array<{key: string, value: any}>>
```

### Authentication

```typescript
// Sign in
await bridge.auth.signIn(): Promise<User>

// Sign out
await bridge.auth.signOut(): Promise<void>

// Get current user
await bridge.auth.getUser(): Promise<User | null>

// Check if signed in
await bridge.auth.isSignedIn(): Promise<boolean>
```

## 🧪 Testing

### Run TypeScript Example

```bash
cd traenupi
npx ts-node examples/lively-puter-integration.ts
```

### Run Gleam Example

```bash
cd gleam/traenupi_core
gleam run -m lively_puter_example
```

## 🎯 Use Cases

### 1. Collaborative Development
- Real-time code collaboration
- Shared file system
- AI-assisted code review

### 2. Self-Hosted Cloud IDE
- Complete development environment
- No external dependencies
- Full data control

### 3. AI-Powered Applications
- Multi-model AI access
- Zero-configuration setup
- Usage tracking

### 4. Data Synchronization
- Hybrid storage strategy
- Automatic sync
- Conflict resolution

## 🔍 Integration with TraeNuPI

### Using in Existing TraeNuPI Code

```typescript
// In any TraeNuPI module
import { LivelyPuterBridge } from './common/lively-puter/index.js';

export class MyTraeNuPIModule {
  private bridge: LivelyPuterBridge;
  
  async initialize() {
    this.bridge = new LivelyPuterBridge();
    await this.bridge.initialize();
  }
  
  async saveData(data: any) {
    // Automatically uses hybrid storage
    await this.bridge.db.set('data:my-module', data);
  }
  
  async analyzeWithAI(text: string) {
    const response = await this.bridge.ai.chat([
      { role: 'user', content: `Analyze: ${text}` }
    ]);
    return response.message.content;
  }
}
```

### Using in Gleam Modules

```gleam
import traenupi_core/lively_puter as bridge

pub fn save_data(data: String) {
  let config = bridge.default_config()
  let assert Ok(_) = bridge.initialize(config)
  
  let json_data = json.string(data)
  bridge.db_set("data:my-module", json_data)
}
```

## 📊 Performance Considerations

### Hybrid Mode Performance
- Local operations: < 10ms
- Cloud operations: < 100ms
- Sync operations: Background, non-blocking

### Optimization Tips
1. Use local paths for temporary data
2. Use cloud paths for persistent data
3. Let hybrid mode handle routing automatically
4. Monitor sync operations in logs

## 🐛 Troubleshooting

### Bridge Not Initializing
```typescript
// Check if Puter SDK is loaded
if (!window.puter) {
  console.error('Puter SDK not loaded');
}

// Check if Lively4 is available
if (!window.lively) {
  console.warn('Lively4 not available, using Puter only');
}
```

### File Operations Failing
```typescript
// Check file path routing
const path = '/documents/test.txt';
const backend = bridge.getMode(); // Check current mode
console.log(`Using ${backend} backend for ${path}`);
```

### AI Not Responding
```typescript
// Check AI configuration
try {
  const response = await bridge.ai.chat([
    { role: 'user', content: 'test' }
  ]);
} catch (error) {
  console.error('AI error:', error);
  // Fallback to different model
}
```

## 📖 Further Reading

- [Lively4 Documentation](https://github.com/LivelyKernel/lively4-core)
- [Puter Documentation](https://docs.puter.com/)
- [TraeNuPI Architecture](../README.md)

## 🤝 Contributing

To contribute to this integration:

1. Follow the adapter pattern for new services
2. Add tests for new functionality
3. Update documentation
4. Test in all three modes (lively-first, puter-first, hybrid)

## 📄 License

MIT License - Part of TraeNuPI project
