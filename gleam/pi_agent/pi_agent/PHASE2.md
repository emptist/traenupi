# PI Agent Phase 2 Implementation

## Overview

Phase 2 implements the core agent functionality including Event System, Tool System, Agent Loop with LLM integration, Tool Execution logic, and Streaming support.

## Components

### 1. Event System (`pi_agent/event.gleam`)

**Purpose**: Real-time event emission and subscription for agent lifecycle tracking.

**Features**:
- Event emitter with JavaScript FFI (Node.js EventEmitter)
- Type-safe event handling
- Support for all AgentEvent types (AgentStart, AgentEnd, TurnStart, TurnEnd, etc.)

**API**:
```gleam
pub fn new_emitter() -> EventEmitter
pub fn on(emitter: EventEmitter, handler: EventHandler) -> EventEmitter
pub fn emit(emitter: EventEmitter, event: AgentEvent) -> EventEmitter
pub fn remove_listener(emitter: EventEmitter, handler: EventHandler) -> EventEmitter
pub fn remove_all_listeners(emitter: EventEmitter) -> EventEmitter
```

**Tests**: 6 comprehensive tests covering event emission, subscription, and cleanup.

### 2. Tool System (`pi_agent/tool.gleam`)

**Purpose**: Define and manage tools for LLM function calling.

**Features**:
- Tool definition with JSON schema support
- Tool-to-JSON conversion for LLM integration
- Tool result creation utilities
- Sequential and parallel execution modes

**API**:
```gleam
pub fn define_tool(name: String, description: String, parameters: JsonSchema, execution_mode: ToolExecutionMode) -> Tool
pub fn tool_to_json(tool: Tool) -> json.Json
pub fn create_tool_result(content: List(ContentBlock), is_error: Bool) -> ToolExecutionResult
```

**Tests**: 11 comprehensive tests covering tool definition, JSON conversion, and result creation.

### 3. Agent Module (`pi_agent/agent.gleam`)

**Purpose**: Core agent implementation with state management and LLM integration.

**Features**:
- Agent type and state management
- Agent creation and configuration
- Message addition and retrieval
- Message conversion (AgentMessage → ChatMessage)
- Event emitter integration
- LLM integration via OpenRouter

**API**:
```gleam
pub fn new(system_prompt: String, model: Model, thinking_level: ThinkingLevel) -> Agent
pub fn with_tools(agent: Agent, tools: List(Tool)) -> Agent
pub fn add_message(agent: Agent, message: AgentMessage) -> Agent
pub fn on_event(agent: Agent, handler: event.EventHandler) -> Agent
pub fn run(agent: Agent, api_key: String) -> Promise(Result(Agent, String))
```

**Tests**: Integrated with existing test suite (52 total tests passing).

### 4. Tool Execution (`pi_agent/tool_executor.gleam`)

**Purpose**: Execute tools when called by the LLM.

**Features**:
- Tool registry for storing tool handlers
- Tool execution by name
- Tool call extraction from content blocks
- Error handling for missing tools

**API**:
```gleam
pub fn new_registry() -> ToolRegistry
pub fn register_tool(registry: ToolRegistry, name: String, handler: ToolHandler) -> ToolRegistry
pub fn execute_tool(registry: ToolRegistry, tool_call: ContentBlock) -> ToolExecutionResult
pub fn extract_tool_calls(content_blocks: List(ContentBlock)) -> List(ContentBlock)
pub fn has_tool_calls(content_blocks: List(ContentBlock)) -> Bool
```

**Tests**: Integrated with existing test suite.

### 5. Streaming Support (`pi_agent/streaming.gleam`)

**Purpose**: Real-time streaming of LLM responses.

**Features**:
- Callback-based streaming approach
- FFI bindings to JavaScript Fetch API with streaming
- Support for Server-Sent Events (SSE)
- Stream cancellation support

**API**:
```gleam
pub type StreamCallback = fn(String, Bool) -> Nil
pub fn create_streaming_request(url: String, headers: List(#(String, String)), body: String, on_chunk: StreamCallback) -> Promise(Result(StreamHandle, String))
pub fn cancel_stream(handle: StreamHandle) -> Nil
```

**Implementation Details**:
- Uses JavaScript Fetch API with ReadableStream
- Parses Server-Sent Events (SSE) format
- Invokes callback for each chunk with `(chunk: String, is_final: Bool)`
- Returns cleanup function for stream cancellation

## Architecture

### Data Flow

```
User Input → Agent.add_message() → Agent.run()
    ↓
Event: AgentStart
    ↓
Convert messages to ChatMessage format
    ↓
Send to OpenRouter LLM
    ↓
Receive response (streaming or non-streaming)
    ↓
Event: TurnStart
    ↓
Check for tool calls
    ├─ Has tool calls → Execute tools → Add tool results → Loop back to LLM
    └─ No tool calls → Add assistant message → Event: TurnEnd → Event: AgentEnd
    ↓
Return updated Agent
```

### Type System

**Core Types**:
- `Agent`: Main agent type with state and event emitter
- `AgentState`: Immutable state container
- `AgentMessage`: Union type for User, Assistant, ToolResult messages
- `ContentBlock`: Union type for TextContent, ImageContent, ToolCall, ThinkingContent
- `Tool`: Tool definition with JSON schema
- `ToolExecutionResult`: Result of tool execution

**FFI Types**:
- `EventEmitter`: JavaScript EventEmitter wrapper
- `StreamHandle`: Handle for stream cancellation

## Testing

**Total Tests**: 52 (35 Phase 1 + 17 Phase 2)

**Test Coverage**:
- Event System: 6 tests
- Tool System: 11 tests
- Agent Module: Integrated with existing tests
- Tool Execution: Integrated with existing tests
- Streaming: Infrastructure in place (tests to be added)

**Running Tests**:
```bash
cd gleam/pi_agent/pi_agent
gleam test
```

## Integration with OpenRouter

The agent integrates with OpenRouter API for LLM access:

1. **Configuration**: Uses `OpenRouterConfig` with API key and model selection
2. **Request Creation**: Converts agent messages to OpenRouter format
3. **Response Handling**: Parses OpenRouter responses and extracts content
4. **Streaming Support**: Handles SSE streaming responses

## Next Steps

### Phase 3 (Planned)
- Multi-turn conversation support
- Advanced tool execution with parallel calls
- Error recovery and retry logic
- Context window management
- Memory and persistence

### Phase 4 (Planned)
- Integration with TraeNuPI daemon
- Real-time event streaming to Trae IDE
- Integration with Nezha task management
- XCOM integration for social media automation

## Dependencies

**Gleam Packages**:
- `gleam/javascript`: JavaScript interop
- `gleam/option`: Option type handling
- `gleam/list`: List operations
- `gleam/json`: JSON encoding/decoding

**JavaScript Dependencies**:
- Node.js EventEmitter (built-in)
- Fetch API (built-in)

## Performance Considerations

- **Immutable State**: All state updates create new Agent instances
- **Event-driven**: Non-blocking event emission
- **Streaming**: Real-time response processing reduces latency
- **FFI Overhead**: Minimal due to direct JavaScript bindings

## Security Considerations

- **API Key Handling**: API keys passed as parameters, not stored in state
- **Tool Execution**: Tool handlers are user-defined functions with controlled scope
- **Error Handling**: All FFI calls wrapped in Result types

## Known Limitations

1. **Streaming**: Currently supports text streaming; tool call streaming requires additional parsing
2. **Tool Execution**: Sequential execution only; parallel execution planned for Phase 3
3. **Error Recovery**: Basic error handling; advanced retry logic planned for Phase 3
4. **Context Management**: No automatic context window management yet

## Contributing

When contributing to Phase 2 components:

1. Follow TDD approach (write tests first)
2. Maintain immutability in state management
3. Use event emission for lifecycle tracking
4. Document all public APIs with examples
5. Ensure all tests pass before committing

## License

Part of the TraeNuPI project. See main project LICENSE for details.
