# PI Agent - Pure Gleam AI Agent

[![Package Version](https://img.shields.io/hexpm/v/pi_agent)](https://hex.pm/packages/pi_agent)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/pi_agent/)

A stateful, tool-executing AI agent with event streaming, written in **pure Gleam**.

## Why Pure Gleam?

This project demonstrates the power of writing pure Gleam code:

- ✅ **No FFI wrappers** for session management
- ✅ **Type-safe** throughout the entire stack
- ✅ **Portable** across Erlang and JavaScript targets
- ✅ **Maintainable** with clear, functional code
- ✅ **AI-friendly** for easy understanding and modification

## Installation

```sh
gleam add pi_agent@1
```

## Quick Start

### Basic Usage

```gleam
import pi_agent/session_pure
import gleam/io

pub fn main() {
  // Create a session with your API key
  let session = session_pure.create_session(
    "your-openrouter-api-key",
    "You are a helpful AI assistant."
  )
  
  // Send a message and get a response
  let promise = session_pure.ask(session, "What is the capital of France?")
  
  // Handle the response
  // In JavaScript: promise.then(response => console.log(response))
}
```

### With Streaming

```gleam
import pi_agent/session_pure

pub fn main() {
  let session = session_pure.create_session(
    "your-api-key",
    "You are a helpful assistant."
  )
  
  let on_chunk = fn(chunk) {
    io.print(chunk)
    Nil
  }
  
  let promise = session_pure.ask_streaming(
    session,
    "Tell me a story",
    on_chunk
  )
}
```

### Advanced Agent Usage

```gleam
import pi_agent/agent
import pi_agent/types.{Model, ModelCost, ThinkingMedium}

pub fn main() {
  // Create a custom model configuration
  let model = Model(
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    api: "openrouter",
    context_window: 200000,
    max_tokens: 4096,
    cost: ModelCost(
      input: 0.015,
      output: 0.075,
      cache_read: 0.0015,
      cache_write: 0.0075
    ),
  )
  
  // Create an agent with custom configuration
  let agent = agent.new(
    "You are an expert programmer.",
    model,
    ThinkingMedium
  )
  
  // Add tools (if needed)
  let agent_with_tools = agent.with_tools(agent, [
    // Define your tools here
  ])
  
  // Run the agent
  let promise = agent.run(agent_with_tools, "your-api-key")
}
```

## Architecture

### Pure Gleam Components

- **`session_pure.gleam`**: Session management without FFI
- **`agent.gleam`**: Core agent logic
- **`types.gleam`**: Type definitions
- **`tool.gleam`**: Tool system
- **`event.gleam`**: Event system (uses FFI for Node.js EventEmitter)

### FFI Components (When Needed)

- **`event_ffi.mjs`**: Event emitter (uses Node.js EventEmitter)
- **`openrouter_ffi.mjs`**: HTTP requests (uses fetch API)
- **`streaming_ffi.mjs`**: Streaming HTTP responses

**Note**: We only use FFI when there's no pure Gleam alternative:
- Event emitters: No pure Gleam event system
- HTTP streaming: Requires platform-specific APIs

## Features

- ✅ **Stateful conversations**: Maintains conversation history
- ✅ **Tool execution**: Define and execute custom tools
- ✅ **Event streaming**: Real-time event updates
- ✅ **Multiple models**: Support for various LLM providers via OpenRouter
- ✅ **Type-safe**: Full type safety throughout
- ✅ **Streaming responses**: Real-time response streaming

## Development

```sh
gleam run   # Run the project
gleam test  # Run the tests
gleam build # Build the project
```

## Testing

The project includes comprehensive tests:

```sh
gleam test
```

Tests cover:
- Agent creation and configuration
- Message handling
- Tool execution
- Event system
- Session management

## Documentation

Further documentation can be found at <https://hexdocs.pm/pi_agent>.

## Philosophy

This project follows the **Pure Gleam First** philosophy:

1. **Write Gleam first**: Start with pure Gleam code
2. **Find libraries**: Use pure Gleam libraries when available
3. **Use FFI sparingly**: Only when no pure Gleam alternative exists
4. **Keep it type-safe**: Maintain type safety throughout

## Contributing

Contributions are welcome! Please ensure:

- Code is written in pure Gleam when possible
- FFI is only used when necessary
- All code is properly typed
- Tests are included for new features

## License

Apache-2.0
