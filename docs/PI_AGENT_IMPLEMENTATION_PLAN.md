# Pi Agent Implementation Plan for TraeNuPI

**Date**: 2026-05-04  
**Status**: Research & Planning  
**Author**: AI Assistant  
**Reference**: pi-mono project (`../refers/pi-mono`)  
**Adapted from**: psypi project implementation plan

## Executive Summary

This document outlines the research findings from analyzing the pi-mono project's agent architecture and provides a detailed implementation plan for bringing Pi Agent capabilities to the TraeNuPI project (written in Gleam).

The goal is to implement a stateful, tool-executing agent with event streaming capabilities, similar to pi-mono's `@mariozechner/pi-agent-core`, but designed for Gleam's functional paradigm and TraeNuPI's specific needs.

**Key Differences from psypi**:
- **Database**: TraeNuPI uses `nezha` database (vs psypi's `psypi` database)
- **Primary Functions**: TraeNuPI focuses on daemon, knowledge management, and inter-AI coordination
- **Integration**: TraeNuPI serves as the coordination layer for the Nezha family (nezha, nupi, piano, xcom)

---

## Table of Contents

1. [Research Findings](#research-findings)
2. [Architecture Analysis](#architecture-analysis)
3. [Implementation Plan](#implementation-plan)
4. [Technical Decisions](#technical-decisions)
5. [Risks and Challenges](#risks-and-challenges)
6. [Timeline](#timeline)

---

## Research Findings

### 0. node_pg Integration Complete ✅

**Date**: 2026-05-04  
**Status**: Implemented  
**Approach**: Minimal FFI with node_pg + custom HTTP server

#### Implementation Summary

Successfully integrated `node_pg` for PostgreSQL connectivity with minimal FFI dependency:

1. **Database Connectivity** ✅
   - Native Gleam PostgreSQL client (node_pg)
   - Type-safe query execution
   - Promise-based async operations
   - Connection to `nezha` database

2. **HTTP Server** ✅
   - Minimal FFI using Node.js built-in `http` module
   - Health check endpoint (`/health`)
   - Status endpoint (`/status`)
   - API endpoints (`/api/tasks`)
   - JSON responses

3. **Architecture Benefits**
   ```
   Before (High FFI Dependency):
   ├─ Database: FFI to Node.js pg ❌
   ├─ HTTP: Not implemented ❌
   └─ Tools: FFI to Node.js ❌
   
   After (Minimal FFI):
   ├─ Database: node_pg (Gleam native) ✅
   ├─ HTTP: Minimal FFI (Node.js http module) ✅
   └─ Tools: Only when necessary ✅
   ```

#### Why Not Glimr

Glimr is designed for Erlang target, not JavaScript. Since TraeNuPI uses JavaScript target (Node.js runtime), we created a minimal HTTP server with just 3 FFI functions:
- `createServer(handler)` - Create HTTP server
- `listen(server, port, callback)` - Start listening
- `writeResponse(res, status, headers, body)` - Send response

This approach provides:
- ✅ Minimal FFI (only 3 functions)
- ✅ Full control over request handling
- ✅ Native Gleam request/response types
- ✅ Integration with node_pg for database operations
| Type Safety | ✅ Full Gleam | ✅ Full Gleam | ✅ Full Gleam |
| Learning Curve | Medium | Low | Medium |
| Best For | Full-stack apps | APIs, simple web | SPAs, LiveView |

**Decision**: Use Glimr as the foundation for TraeNuPI's HTTP layer, session management, and CLI commands.

### 1. pi-mono Architecture Overview

The pi-mono project implements a sophisticated three-layer architecture:

```
┌─────────────────────────────────────────┐
│  packages/ai - LLM Abstraction Layer    │
│  - Unified LLM API interface            │
│  - Multi-provider support               │
│  - Streaming response handling          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  packages/agent - Agent Core Layer      │
│  - Agent class (state management)       │
│  - Agent Loop (event loop)              │
│  - Tool execution engine                │
│  - Message conversion (convertToLlm)    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  packages/coding-agent - Application    │
│  - Concrete tools (bash, edit, etc.)    │
│  - Session management                   │
│  - CLI/TUI interface                    │
└─────────────────────────────────────────┘
```

### 2. Core Concepts

#### 2.1 AgentMessage vs LLM Message

**Key Insight**: pi-mono distinguishes between internal message representation and LLM-compatible messages.

```typescript
// AgentMessage - Flexible internal representation
type AgentMessage = 
  | UserMessage 
  | AssistantMessage 
  | ToolResultMessage 
  | CustomMessage;  // App-specific types

// LLM Message - Only what LLMs understand
type Message = 
  | UserMessage 
  | AssistantMessage 
  | ToolResultMessage;

// Conversion function
convertToLlm(messages: AgentMessage[]): Message[]
```

**Why This Matters**: This separation allows:
- UI-only messages (notifications, status updates)
- Custom message types for app-specific features
- Context window management before LLM calls
- Message transformation and filtering

#### 2.2 Event Flow

pi-mono uses a well-defined event sequence for agent lifecycle:

```
prompt("Hello")
├─ agent_start
├─ turn_start
├─ message_start   { message: userMessage }
├─ message_end     { message: userMessage }
├─ message_start   { message: assistantMessage }
├─ message_update  { message: partial... }      // Streaming chunks
├─ message_update  { message: partial... }
├─ message_end     { message: assistantMessage }
├─ tool_execution_start  { toolCallId, toolName, args }
├─ tool_execution_update { partialResult }      // If tool streams
├─ tool_execution_end    { toolCallId, result }
├─ message_start/end  { toolResultMessage }
├─ turn_end        { message, toolResults: [...] }
│
├─ turn_start                                    // Next turn
├─ message_start/end  { assistantMessage }       // LLM responds to tool result
├─ turn_end
└─ agent_end      { messages: [...] }
```

**Key Observations**:
- Events are emitted in a predictable sequence
- Tool execution is interleaved with message events
- Multiple turns can occur in a single prompt() call
- `agent_end` is always the final event

#### 2.3 Tool System

pi-mono's tool system is based on JSON Schema validation and type-safe execution:

```typescript
// Tool definition
interface AgentTool<TSchema> {
  name: string;
  description: string;
  parameters: TSchema;  // TypeBox schema
  execute: (
    args: Static<TSchema>, 
    signal?: AbortSignal
  ) => Promise<ToolResult>;
}

// Tool creation pattern
function createBashTool(cwd: string, options?: BashToolOptions): AgentTool {
  return {
    name: "bash",
    description: "Execute bash commands",
    parameters: Type.Object({
      command: Type.String({ description: "Bash command to execute" }),
      timeout: Type.Optional(Type.Number({ description: "Timeout in seconds" })),
    }),
    execute: async (args, signal) => {
      // Execute command
      return { 
        content: [
          { type: "text", text: output }
        ],
        isError: false 
      };
    }
  };
}
```

**Key Features**:
- Schema-based parameter validation
- Abort signal support for cancellation
- Structured tool results (text + images)
- Error handling via `isError` flag

#### 2.4 State Management

```typescript
interface AgentState {
  systemPrompt: string;
  model: Model;
  messages: AgentMessage[];
  tools: AgentTool[];
  isStreaming: boolean;
  streamingMessage?: AgentMessage;
  pendingToolCalls: Set<string>;
  errorMessage?: string;
}
```

**Key Design Decisions**:
- Mutable state wrapped in Agent class
- Defensive copying on state assignment
- Streaming state tracked separately
- Pending tool calls tracked by ID

#### 2.5 Message Queuing

pi-mono implements two message queue types:

```typescript
// Steering - Inject after current turn finishes
steer(message: AgentMessage): void;

// Follow-up - Run only after agent would otherwise stop
followUp(message: AgentMessage): void;
```

**Queue Modes**:
- `"all"` - Drain entire queue at once
- `"one-at-a-time"` - Process one message per drain

**Use Cases**:
- **Steering**: Inject context, redirect agent mid-task
- **Follow-up**: Chain tasks, auto-continue after completion

#### 2.6 Lifecycle Hooks

```typescript
// Before tool execution
beforeToolCall?: (
  context: BeforeToolCallContext,
  signal?: AbortSignal
) => Promise<BeforeToolCallResult | undefined>;

// After tool execution
afterToolCall?: (
  context: AfterToolCallContext,
  signal?: AbortSignal
) => Promise<AfterToolCallResult | undefined>;

// After each turn
shouldStopAfterTurn?: (
  context: ShouldStopAfterTurnContext
) => boolean | Promise<boolean>;
```

**Capabilities**:
- Block tool execution with custom error
- Modify tool results after execution
- Early termination based on custom logic
- Inject additional context or constraints

### 3. Tool Implementation Patterns

#### 3.1 Tool Definition Structure

```typescript
// tools/index.ts
export function createCodingToolDefinitions(cwd: string, options?: ToolsOptions): ToolDef[] {
  return [
    createReadToolDefinition(cwd, options?.read),
    createBashToolDefinition(cwd, options?.bash),
    createEditToolDefinition(cwd, options?.edit),
    createWriteToolDefinition(cwd, options?.write),
  ];
}

export function createReadOnlyToolDefinitions(cwd: string, options?: ToolsOptions): ToolDef[] {
  return [
    createReadToolDefinition(cwd, options?.read),
    createGrepToolDefinition(cwd, options?.grep),
    createFindToolDefinition(cwd, options?.find),
    createLsToolDefinition(cwd, options?.ls),
  ];
}
```

#### 3.2 Bash Tool Implementation

Key features of the bash tool:
- **Streaming output**: Real-time stdout/stderr streaming
- **Timeout support**: Optional timeout with process tree kill
- **Detached process tracking**: Track and cleanup detached processes
- **Temp file logging**: Full output capture to temp files
- **Truncation**: Configurable output truncation

```typescript
// Key implementation details
interface BashOperations {
  exec: (
    command: string,
    cwd: string,
    options: {
      onData: (data: Buffer) => void;
      signal?: AbortSignal;
      timeout?: number;
      env?: NodeJS.ProcessEnv;
    },
  ) => Promise<{ exitCode: number | null }>;
}
```

#### 3.3 File Operation Tools

- **Read tool**: Read files with truncation, encoding detection
- **Write tool**: Create/overwrite files with validation
- **Edit tool**: Search-replace with diff preview
- **Grep tool**: Search file contents with regex
- **Find tool**: Find files by name/pattern
- **Ls tool**: List directory contents

### 4. Comparison with TraeNuPI

| Feature | pi-mono | TraeNuPI (Current) | Gap |
|---------|---------|-------------------|-----|
| Language | TypeScript | Gleam | Different paradigm |
| Runtime | Node.js | Node.js (via Gleam JS) | ✅ Compatible |
| LLM Abstraction | Complete `@mariozechner/pi-ai` | None | ❌ Missing |
| Agent Core | Complete `@mariozechner/pi-agent-core` | None | ❌ Missing |
| Tool System | Complete tool set | None | ❌ Missing |
| State Management | Agent class | None | ❌ Missing |
| Event System | Event emitter pattern | None | ❌ Missing |
| Database | Not used in agent core | PostgreSQL (nezha DB) | ✅ Advantage |
| Daemon | Not applicable | ✅ TraeNuPI daemon | ✅ Advantage |
| Knowledge Graph | Not applicable | ✅ Memory system | ✅ Advantage |

**TraeNuPI Advantages**:
- Already has database layer (tasks, issues, meetings, knowledge, etc.)
- Gleam's type safety and pattern matching
- Functional paradigm benefits (immutability, pure functions)
- Daemon architecture for persistent operation
- Knowledge graph for inter-session memory
- Integration with Nezha family (nezha, nupi, piano, xcom)

**TraeNuPI Gaps**:
- No LLM integration
- No agent loop implementation
- No tool execution framework
- No event streaming

---

## Implementation Plan

### Phase 0: Glimr Integration (Week 0 - Prerequisite) 🎯

**Goal**: Set up Glimr framework as the foundation for TraeNuPI's HTTP layer, session management, and CLI commands.

**Why First**: Glimr provides the infrastructure that all subsequent phases will build upon, reducing FFI dependencies and providing native Gleam solutions.

#### 0.1 Glimr Installation & Configuration

**Tasks**:
- [ ] Clone Glimr template to TraeNuPI project
- [ ] Configure `.env` file with TraeNuPI settings
- [ ] Set up `APP_NAME=TraeNuPI`, `APP_PORT` (e.g., 3000)
- [ ] Configure `APP_KEY` for session encryption
- [ ] Install dependencies: `gleam deps download`

**Files to create/modify**:
- `.env` - Environment configuration
- `gleam.toml` - Add Glimr dependencies
- `config/` - Glimr configuration files

#### 0.2 PostgreSQL Database Setup

**Tasks**:
- [ ] Configure Glimr to use `nezha` database
- [ ] Set up connection pooling for PostgreSQL
- [ ] Configure database connection in `config/database.toml`
- [ ] Test connection with existing `node_pg` setup
- [ ] Verify Glimr's connection pooling works with our schema

**Configuration**:
```toml
# config/database.toml
[main]
adapter = "postgresql"
host = "localhost"
port = 5432
database = "nezha"
pool_size = 10
```

#### 0.3 Session Management Setup

**Tasks**:
- [ ] Configure PostgreSQL session driver
- [ ] Create sessions table migration
- [ ] Set up session middleware
- [ ] Test session creation and retrieval
- [ ] Configure session lifetime and cleanup

**Migration**:
```sql
-- Create sessions table for Glimr
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 0.4 Console Commands Setup

**Tasks**:
- [ ] Create custom console command structure
- [ ] Implement `traenupi start` command
- [ ] Implement `traenupi status` command
- [ ] Implement `traenupi tellme` command
- [ ] Test commands with database access

**Example Command**:
```gleam
// src/app/console/commands/start_command.gleam
import glimr/console/command.{type Command}
import glimr/database/query

pub fn start_command() -> Command {
  command.new("start")
  |> command.description("Start TraeNuPI daemon")
  |> command.handle(fn(_args, _ctx) {
    // Start daemon logic
    Ok("TraeNuPI daemon started")
  })
}
```

#### 0.5 Basic HTTP Routes

**Tasks**:
- [ ] Create health check endpoint
- [ ] Create API status endpoint
- [ ] Set up middleware stack (logging, CSRF, etc.)
- [ ] Test basic routing
- [ ] Configure CORS for API access

**Example Routes**:
```gleam
// src/app/http/controllers/health_controller.gleam
import glimr/http/response.{type Response}

/// @get "/health"
pub fn check() -> Response {
  response.json(200, #("status", "ok"))
}

/// @get "/api/status"
pub fn status() -> Response {
  response.json(200, #("daemon", "running"))
}
```

#### 0.6 Integration Testing

**Tasks**:
- [ ] Test Glimr HTTP server startup
- [ ] Test PostgreSQL connection pooling
- [ ] Test session management
- [ ] Test console commands
- [ ] Verify all components work together

**Success Criteria**:
- ✅ Glimr server runs on configured port
- ✅ PostgreSQL connection pooling works
- ✅ Sessions can be created and retrieved
- ✅ Console commands execute successfully
- ✅ Basic HTTP routes respond correctly

**Estimated Time**: 2-3 days

---

### Phase 1: Foundation (Week 1-2)

#### 1.1 Core Type Definitions

**File**: `src/traenupi_core/agent/types.gleam`

```gleam
pub type AgentMessage {
  UserMessage(content: String, timestamp: String)
  AssistantMessage(
    content: String, 
    tool_calls: List(ToolCall),
    stop_reason: StopReason
  )
  ToolResultMessage(
    tool_call_id: String, 
    content: List(ContentBlock),
    is_error: Bool
  )
}

pub type ContentBlock {
  TextContent(text: String)
  ImageContent(data: String, media_type: String)
}

pub type ToolCall {
  ToolCall(
    id: String,
    name: String,
    arguments: dynamic.Dynamic
  )
}

pub type StopReason {
  EndTurn
  ToolUse
  StopSequence
  Error
}

pub type AgentState {
  AgentState(
    system_prompt: String,
    messages: List(AgentMessage),
    tools: List(Tool),
    is_streaming: Bool,
    pending_tool_calls: Set(String),
  )
}
```

**Tasks**:
- [ ] Define `AgentMessage` type
- [ ] Define `ContentBlock` type
- [ ] Define `ToolCall` type
- [ ] Define `StopReason` type
- [ ] Define `AgentState` type
- [ ] Define `AgentEvent` type
- [ ] Add JSON encoding/decoding

#### 1.2 Event System

**File**: `src/traenupi_core/agent/events.gleam`

```gleam
pub type AgentEvent {
  AgentStart
  AgentEnd(messages: List(AgentMessage))
  TurnStart
  TurnEnd(message: AssistantMessage, tool_results: List(ToolResultMessage))
  MessageStart(message: AgentMessage)
  MessageUpdate(message: AgentMessage)
  MessageEnd(message: AgentMessage)
  ToolExecutionStart(
    tool_call_id: String,
    tool_name: String,
    args: dynamic.Dynamic
  )
  ToolExecutionUpdate(partial_result: dynamic.Dynamic)
  ToolExecutionEnd(
    tool_call_id: String,
    result: ToolResult
  )
  Error(error: AgentError)
}

pub type AgentError {
  ConnectionError(String)
  LLMError(String)
  ToolError(String)
  ValidationError(String)
}
```

**Tasks**:
- [ ] Define all event types
- [ ] Implement event emitter pattern
- [ ] Add event subscription mechanism
- [ ] Implement event logging

#### 1.3 Tool Definition Framework

**File**: `src/traenupi_core/agent/tool.gleam`

```gleam
pub type Tool {
  Tool(
    name: String,
    description: String,
    parameters: json_schema.Schema,
    execute: fn(dynamic.Dynamic, option.Option(AbortSignal)) -> 
      promise.Promise(Result(ToolResult, ToolError))
  )
}

pub type ToolResult {
  ToolResult(
    content: List(ContentBlock),
    is_error: Bool,
    details: option.Option(dynamic.Dynamic)
  )
}

pub type AbortSignal {
  AbortSignal(signal: dynamic.Dynamic)
}

pub fn create_tool(
  name: String,
  description: String,
  parameters: json_schema.Schema,
  execute: fn(dynamic.Dynamic, option.Option(AbortSignal)) -> 
    promise.Promise(Result(ToolResult, ToolError))
) -> Tool {
  Tool(name, description, parameters, execute)
}
```

**Tasks**:
- [ ] Define `Tool` type
- [ ] Define `ToolResult` type
- [ ] Implement `create_tool` helper
- [ ] Add JSON Schema validation
- [ ] Implement abort signal handling

### Phase 2: LLM Integration (Week 3-4)

#### 2.1 LLM Provider Abstraction

**File**: `src/traenupi_core/llm/provider.gleam`

```gleam
pub type LLMProvider {
  OpenAI
  Anthropic
  Local(url: String)
}

pub type LLMConfig {
  LLMConfig(
    provider: LLMProvider,
    model: String,
    api_key: option.Option(String),
    base_url: option.Option(String),
    temperature: option.Option(Float),
    max_tokens: option.Option(Int),
  )
}

pub type Message {
  UserMessage(content: List(ContentBlock))
  AssistantMessage(content: List(ContentBlock), tool_calls: List(ToolCall))
  ToolResultMessage(tool_call_id: String, content: List(ContentBlock))
  SystemMessage(content: String)
}

pub fn stream_completion(
  config: LLMConfig,
  messages: List(Message),
  tools: List(Tool),
  signal: option.Option(AbortSignal),
) -> promise.Promise(Result(Stream, LLMError)) {
  // Implementation
}
```

**Tasks**:
- [ ] Define `LLMProvider` type
- [ ] Define `LLMConfig` type
- [ ] Define LLM `Message` type (separate from AgentMessage)
- [ ] Implement OpenAI provider
- [ ] Implement Anthropic provider
- [ ] Add streaming support
- [ ] Add error handling
- [ ] Add retry logic

#### 2.2 Message Conversion

**File**: `src/traenupi_core/agent/message_converter.gleam`

```gleam
pub fn convert_to_llm(
  messages: List(AgentMessage)
) -> List(Message) {
  messages
  |> list.filter_map(fn(msg) {
    case msg {
      UserMessage(content, _) -> 
        Ok(UserMessage([TextContent(content)]))
      AssistantMessage(content, tool_calls, _) ->
        Ok(AssistantMessage([TextContent(content)], tool_calls))
      ToolResultMessage(id, content, _) ->
        Ok(ToolResultMessage(id, content))
    }
  })
}

pub fn transform_context(
  messages: List(AgentMessage),
  max_tokens: Int,
) -> List(AgentMessage) {
  // Implement context window management
  // - Prune old messages
  // - Keep system prompt
  // - Keep recent messages
}
```

**Tasks**:
- [ ] Implement `convert_to_llm`
- [ ] Implement `transform_context`
- [ ] Add context window management
- [ ] Add message truncation
- [ ] Add token counting

### Phase 3: Agent Core (Week 5-6)

#### 3.1 Agent Loop

**File**: `src/traenupi_core/agent/agent_loop.gleam`

```gleam
pub fn run_agent_loop(
  state: AgentState,
  config: AgentLoopConfig,
  signal: option.Option(AbortSignal),
) -> promise.Promise(Result(AgentState, AgentError)) {
  // Main agent loop:
  // 1. Emit agent_start
  // 2. Convert messages to LLM format
  // 3. Stream LLM response
  // 4. Execute tools if needed
  // 5. Continue until stop
  // 6. Emit agent_end
}

pub fn execute_tool(
  tool: Tool,
  args: dynamic.Dynamic,
  signal: option.Option(AbortSignal),
) -> promise.Promise(Result(ToolResult, ToolError)) {
  // Tool execution with:
  // - Schema validation
  // - Timeout handling
  // - Error handling
  // - Abort signal support
}
```

**Tasks**:
- [ ] Implement main agent loop
- [ ] Implement tool execution
- [ ] Add event emission
- [ ] Add error recovery
- [ ] Add abort signal handling

#### 3.2 Agent Class

**File**: `src/traenupi_core/agent/agent.gleam`

```gleam
pub type Agent {
  Agent(
    state: AgentState,
    config: AgentConfig,
    listeners: List(AgentEventListener),
    steering_queue: MessageQueue,
    follow_up_queue: MessageQueue,
  )
}

pub fn new(config: AgentConfig) -> Agent {
  Agent(
    state: initial_state(),
    config: config,
    listeners: [],
    steering_queue: MessageQueue("one-at-a-time"),
    follow_up_queue: MessageQueue("one-at-a-time"),
  )
}

pub fn prompt(
  agent: Agent,
  message: String,
) -> promise.Promise(Result(Agent, AgentError)) {
  // 1. Add user message
  // 2. Run agent loop
  // 3. Process queues
  // 4. Return updated agent
}

pub fn subscribe(
  agent: Agent,
  listener: AgentEventListener,
) -> Agent {
  Agent(..agent, listeners: [listener, ..agent.listeners])
}
```

**Tasks**:
- [ ] Implement `Agent` type
- [ ] Implement `new` constructor
- [ ] Implement `prompt` method
- [ ] Implement `subscribe` method
- [ ] Implement message queues
- [ ] Add state management

### Phase 4: Tool Implementation (Week 7-8)

#### 4.1 TraeNuPI-Specific Tools

**File**: `src/traenupi_core/tools/traenupi_tools.gleam`

```gleam
// TraeNuPI-specific tools for daemon and knowledge management

pub fn create_tellme_tool() -> Tool {
  create_tool(
    "traenupi-tellme",
    "Ask the TraeNuPI daemon for guidance",
    tellme_schema(),
    fn(args, signal) {
      let question = decode.get_string(args, "question")
      
      // Call TraeNuPI daemon
      traenupi_daemon.tellme(question, signal)
    }
  )
}

pub fn create_search_tool() -> Tool {
  create_tool(
    "traenupi-search",
    "Search the web via TraeNuPI daemon",
    search_schema(),
    fn(args, signal) {
      let query = decode.get_string(args, "query")
      
      // Call TraeNuPI daemon
      traenupi_daemon.search(query, signal)
    }
  )
}

pub fn create_knowledge_tool() -> Tool {
  create_tool(
    "traenupi-knowledge",
    "Store or retrieve knowledge from memory",
    knowledge_schema(),
    fn(args, signal) {
      // Use TraeNuPI's knowledge graph
      traenupi_memory.manage_knowledge(args, signal)
    }
  )
}

pub fn create_nezha_integration_tool() -> Tool {
  create_tool(
    "traenupi-nezha",
    "Interact with Nezha family (nezha, nupi, piano, xcom)",
    nezha_schema(),
    fn(args, signal) {
      // Coordinate with Nezha family
      nezha.coordinate(args, signal)
    }
  )
}
```

**Tasks**:
- [ ] Implement tellme tool
- [ ] Implement search tool
- [ ] Implement knowledge tool
- [ ] Implement Nezha integration tool
- [ ] Add daemon communication
- [ ] Add error handling

#### 4.2 Standard Tools

**Files**: 
- `src/traenupi_core/tools/read.gleam`
- `src/traenupi_core/tools/write.gleam`
- `src/traenupi_core/tools/edit.gleam`
- `src/traenupi_core/tools/bash.gleam`

**Tasks**:
- [ ] Implement read tool
- [ ] Implement write tool
- [ ] Implement edit tool
- [ ] Implement bash tool
- [ ] Add encoding detection
- [ ] Add file validation
- [ ] Add truncation

### Phase 5: Integration & Testing (Week 9-10)

#### 5.1 CLI Integration

**File**: `src/traenupi_cli/main.gleam`

```gleam
pub fn run_agent_command(args: List(String)) {
  let agent = agent.new(config)
  let agent = agent.subscribe(agent, event_handler)
  
  case agent.prompt(agent, prompt_text) {
    Ok(agent) -> // Handle success
    Error(error) -> // Handle error
  }
}
```

**Tasks**:
- [ ] Add agent command to CLI
- [ ] Implement event display
- [ ] Add interactive mode
- [ ] Add configuration loading

#### 5.2 Database Integration

**File**: `src/traenupi_core/agent/session.gleam`

```gleam
pub fn save_session(
  agent: Agent,
  session_id: String,
) -> promise.Promise(Result(Nil, SessionError)) {
  // Save agent state to nezha database
  db.with_connection(fn(conn) {
    // Save messages
    // Save tool calls
    // Save state
  }, db_error_to_session_error)
}

pub fn load_session(
  session_id: String,
) -> promise.Promise(Result(Agent, SessionError)) {
  // Load agent state from nezha database
}
```

**Tasks**:
- [ ] Design session schema for nezha DB
- [ ] Implement session save
- [ ] Implement session load
- [ ] Add session listing
- [ ] Add session deletion

#### 5.3 Testing

**Files**:
- `test/traenupi_core/agent_test.gleam`
- `test/traenupi_core/llm_test.gleam`
- `test/traenupi_core/tools_test.gleam`

**Tasks**:
- [ ] Unit tests for agent types
- [ ] Unit tests for message conversion
- [ ] Integration tests for agent loop
- [ ] Mock LLM provider for testing
- [ ] Tool execution tests
- [ ] Event emission tests

---

## Technical Decisions

### 0. Web Framework Selection: Glen vs Wisp 🎯

**Context**: TraeNuPI needs HTTP server, session management, and database integration for both JavaScript and Erlang targets.

**Options Evaluated**:

| Framework | Target | Pros | Cons | Best For |
|-----------|--------|------|------|----------|
| **Glen** | JavaScript | ✅ Minimal FFI (1 function)<br>✅ Node.js ecosystem<br>✅ Serverless-friendly<br>✅ Team familiarity | ❌ Manual error handling<br>❌ No hot reload<br>❌ Event loop limitations | HTTP APIs, Serverless |
| **Wisp** | Erlang | ✅ Zero FFI<br>✅ OTP fault tolerance<br>✅ Hot code reload<br>✅ Built-in middleware<br>✅ Crash rescue | ❌ Erlang runtime required<br>❌ Learning curve<br>❌ No npm packages | Long-running services, Real-time |

**Decision**: **Use Both** - Hybrid Architecture

**Rationale**:
1. **Glen for HTTP APIs**: JavaScript target for lightweight HTTP endpoints
2. **Wisp for Core Service**: Erlang target for daemon process with fault tolerance
3. **Best of Both Worlds**: Leverage strengths of each framework

**Impact on Architecture**:
```
TraeNuPI Hybrid Architecture:
├─ Core Service (Wisp - Erlang)
│  ├─ Daemon process ✅
│  ├─ Background tasks ✅
│  ├─ WebSocket connections ✅
│  ├─ OTP supervision ✅
│  └─ Hot code reload ✅
│
└─ HTTP API (Glen - JavaScript)
   ├─ REST endpoints ✅
   ├─ Serverless deployment ✅
   ├─ npm ecosystem ✅
   └─ Lightweight requests ✅
```

**Implementation Status**:
- ✅ Glen experimental project: `gleam/traenupi_app`
- ✅ Wisp experimental project: `gleam/wisp_experimental`
- ✅ Comprehensive comparison: `docs/WISP_VS_GLEN.md`

**When to Use Each**:

**Choose Wisp (Erlang) for**:
- Long-running daemon processes
- Real-time applications (WebSocket)
- High-concurrency systems
- Fault-tolerant services
- Hot code updates required

**Choose Glen (JavaScript) for**:
- Simple HTTP APIs
- Serverless deployments
- npm package integration
- Quick prototypes
- Team familiar with Node.js

### 1. Why Gleam Instead of TypeScript?

**Pros**:
- ✅ Type safety with pattern matching
- ✅ Functional paradigm (immutability, pure functions)
- ✅ No runtime errors from type mismatches
- ✅ Better error handling with Result type
- ✅ Easier to reason about async code with Promise

**Cons**:
- ❌ Smaller ecosystem than TypeScript
- ❌ Need FFI for Node.js APIs
- ❌ Less tooling support

**Decision**: Use Gleam for core agent logic, TypeScript FFI for Node.js integration.

### 2. How to Handle LLM API Calls?

**Option A**: Direct HTTP calls via `gleam_http`  
**Option B**: FFI to Node.js `fetch` or `axios`  
**Option C**: FFI to existing TypeScript LLM SDKs

**Decision**: **Option B** - FFI to Node.js `fetch`
- Simpler than maintaining TypeScript SDK bindings
- More control over request/response handling
- Easier to add custom headers, retry logic

### 3. How to Implement Event Streaming?

**Option A**: Callback-based event emitter  
**Option B**: Channel-based message passing  
**Option C**: Stream-based with `gleam/iterator`

**Decision**: **Option A** - Callback-based event emitter
- Matches pi-mono's pattern
- Easier to integrate with CLI/TUI
- More flexible for different use cases

### 4. How to Handle Tool Execution?

**Option A**: Synchronous execution only  
**Option B**: Asynchronous with Promise  
**Option C**: Asynchronous with streaming results

**Decision**: **Option C** - Asynchronous with streaming
- Supports long-running tools (e.g., bash commands)
- Better user experience (real-time feedback)
- Matches pi-mono's pattern

### 5. How to Manage State?

**Option A**: Mutable state with refs  
**Option B**: Immutable state with state monad  
**Option C**: Immutable state with explicit passing

**Decision**: **Option C** - Immutable state with explicit passing
- More idiomatic Gleam
- Easier to test and reason about
- No hidden side effects

---

## Risks and Challenges

### Technical Risks

1. **FFI Complexity**
   - **Risk**: Complex Node.js APIs may be difficult to bind
   - **Mitigation**: Start with minimal FFI, expand as needed
   - **Impact**: Medium

2. **Streaming Implementation**
   - **Risk**: Streaming in Gleam may be challenging
   - **Mitigation**: Use Promise-based streaming pattern
   - **Impact**: High

3. **Error Handling**
   - **Risk**: Error propagation across FFI boundaries
   - **Mitigation**: Comprehensive error types, careful FFI design
   - **Impact**: Medium

4. **Performance**
   - **Risk**: Gleam-to-JS compilation overhead
   - **Mitigation**: Profile early, optimize hot paths
   - **Impact**: Low

### Integration Risks

1. **LLM API Changes**
   - **Risk**: LLM providers may change their APIs
   - **Mitigation**: Abstract provider interface, version pinning
   - **Impact**: High

2. **Tool Execution Safety**
   - **Risk**: Malicious tool execution (bash commands)
   - **Mitigation**: Sandboxing, permission system, validation
   - **Impact**: Critical

3. **State Consistency**
   - **Risk**: Database state vs. in-memory state drift
   - **Mitigation**: Single source of truth (database), optimistic updates
   - **Impact**: Medium

### Adoption Risks

1. **Learning Curve**
   - **Risk**: Users unfamiliar with Gleam
   - **Mitigation**: Good documentation, examples, TypeScript interop
   - **Impact**: Medium

2. **Ecosystem Maturity**
   - **Risk**: Gleam ecosystem may lack needed libraries
   - **Mitigation**: FFI to Node.js ecosystem, contribute back
   - **Impact**: Medium

---

## Timeline

### Week 0: Glimr Integration (Prerequisite) 🎯
- [ ] Install and configure Glimr framework
- [ ] Set up PostgreSQL connection pooling
- [ ] Configure session management
- [ ] Implement basic console commands
- [ ] Create health check and status endpoints
- [ ] Integration testing

### Week 1-2: Foundation
- [ ] Core type definitions
- [ ] Event system
- [ ] Tool framework
- [ ] Basic tests

### Week 3-4: LLM Integration
- [ ] Provider abstraction
- [ ] OpenAI provider
- [ ] Anthropic provider
- [ ] Message conversion
- [ ] Streaming support

### Week 5-6: Agent Core
- [ ] Agent loop
- [ ] Agent class
- [ ] State management
- [ ] Message queues
- [ ] Lifecycle hooks

### Week 7-8: Tools
- [ ] TraeNuPI-specific tools (tellme, search, knowledge)
- [ ] Standard tools (bash, read, write, edit)
- [ ] Tool tests

### Week 9-10: Integration
- [ ] CLI integration (via Glimr console commands)
- [ ] Database integration (nezha DB via Glimr)
- [ ] Session management (via Glimr)
- [ ] End-to-end tests
- [ ] Documentation

### Week 11-12: Polish & Release
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Examples
- [ ] Release preparation

---

## Success Criteria

### Phase 0 Success (Glimr Integration)
- ✅ Glimr server runs on configured port
- ✅ PostgreSQL connection pooling works
- ✅ Sessions can be created and retrieved
- ✅ Console commands execute successfully
- ✅ Basic HTTP routes respond correctly
- ✅ Minimal FFI dependencies

### Phase 1 Success
- ✅ All core types defined and tested
- ✅ Event system working
- ✅ Tool framework functional

### Phase 2 Success
- ✅ Can call OpenAI API
- ✅ Can call Anthropic API
- ✅ Streaming responses working
- ✅ Message conversion working

### Phase 3 Success
- ✅ Agent can run basic prompts
- ✅ Agent can execute tools
- ✅ Agent can handle multi-turn conversations
- ✅ Event emission working

### Phase 4 Success
- ✅ TraeNuPI-specific tools working
- ✅ Standard tools working
- ✅ All tools tested

### Phase 5 Success
- ✅ CLI integration working
- ✅ Database integration working (nezha DB)
- ✅ End-to-end tests passing
- ✅ Documentation complete

---

## Architecture Design Document 📐

**See**: [PI Agent Gleam Architecture Design](./PI_AGENT_GLEAM_ARCHITECTURE.md)

A comprehensive architecture design document has been created that details:

1. **Core Type System** - AgentMessage, AgentState, Tool, Event types
2. **Agent Loop Architecture** - Functional recursive implementation
3. **LLM Integration** - Provider abstraction and streaming
4. **Event Stream Implementation** - Process-based event emission
5. **Configuration System** - AgentLoopConfig and hooks
6. **Error Handling** - Result-based error management
7. **TraeNuPI-Specific Features** - Knowledge, Tasks, Communication tools
8. **Implementation Strategy** - 10-week phased approach

**Key Design Decisions**:
- **Functional Recursion** - Idiomatic Gleam, no mutable state
- **Process-Based Events** - Native Gleam concurrency
- **Result Type Errors** - Type-safe error handling
- **Message Separation** - AgentMessage vs LlmMessage

**Implementation Phases**:
- Phase 1: Core Types (Week 1)
- Phase 2: Event Stream (Week 2)
- Phase 3: Agent Loop (Week 3-4)
- Phase 4: LLM Integration (Week 5-6)
- Phase 5: TraeNuPI Tools (Week 7-8)
- Phase 6: Integration & Testing (Week 9-10)

---

## Next Steps

1. **Review architecture design** - See [PI_AGENT_GLEAM_ARCHITECTURE.md](./PI_AGENT_GLEAM_ARCHITECTURE.md)
2. **Set up project structure** - Create `gleam/pi_agent` package
3. **Begin Phase 1** - Core type definitions
4. **Establish testing framework** - Gleam test infrastructure
5. **Weekly progress reviews** - Track implementation progress

---

## References

- [pi-mono repository](../refers/pi-mono)
- [pi-mono AGENTS.md](../refers/pi-mono/AGENTS.md)
- [Gleam documentation](https://gleam.run/documentation/)
- [node-postgres documentation](https://node-postgres.com/)
- [OpenAI API documentation](https://platform.openai.com/docs)
- [Anthropic API documentation](https://docs.anthropic.com/)
- [psypi implementation plan](../psypi/docs/PI_AGENT_IMPLEMENTATION_PLAN.md) - Original source

---

## Changelog

### 2026-05-04 (Phase 1 Foundation Complete ✅)
- **Major Milestone**: Phase 1 - Foundation implementation complete
- **Core Types**: All types defined and tested (AgentMessage, LlmMessage, ContentBlock, StopReason, etc.)
- **JSON Serialization**: Complete encoding/decoding system with 35 passing tests
- **OpenRouter Client**: Full implementation with streaming support
- **FFI Integration**: Node.js fetch API integration for HTTP requests
- **Documentation**: Created GLEAM_PRACTICE_SUMMARY.md with practical insights
- **Example Code**: Added openrouter_example.gleam for testing
- **Test Coverage**: 35 tests passing, including roundtrip tests
- **Key Achievements**:
  - Type-safe message handling
  - Composable decoder pattern
  - Promise-based async operations
  - SSE streaming support
  - Error handling with custom types

### 2026-05-04 (Architecture Design Update)
- **Major Addition**: Created comprehensive Gleam architecture design
- **New Document**: PI_AGENT_GLEAM_ARCHITECTURE.md
- **Design Decisions**: Functional recursion, Process-based events, Result type errors
- **Implementation Strategy**: 10-week phased approach
- **Key Features**: TraeNuPI-specific tools (Knowledge, Tasks, Communication)
- **Updated Timeline**: Revised phases based on Gleam-specific needs

### 2026-05-04 (Glimr Integration Update)
- **Major Addition**: Integrated Glimr framework as foundation
- **New Phase 0**: Glimr Integration (prerequisite for all other phases)
- **Architecture Change**: Minimal FFI approach using Glimr native features
- **Updated Timeline**: Added Week 0 for Glimr setup
- **Updated Technical Decisions**: Added Glimr framework comparison and rationale
- **Benefits**:
  - PostgreSQL native support with connection pooling
  - Built-in session management
  - Console commands for CLI tools
  - Authentication system
  - Minimal FFI dependencies

### 2026-05-04 (Initial)
- Adapted from psypi implementation plan
- Updated database references (psypi → nezha)
- Added TraeNuPI-specific tools (tellme, search, knowledge, nezha integration)
- Updated context for TraeNuPI's daemon architecture and knowledge graph
