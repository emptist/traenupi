# PI Agent Gleam Architecture Design

**Date**: 2026-05-04  
**Status**: Design Phase  
**Author**: AI Assistant  
**Reference**: pi-mono project analysis

## Executive Summary

This document presents the architecture design for implementing a PI Agent in Gleam, adapting the proven patterns from pi-mono's TypeScript implementation to Gleam's functional paradigm.

**Core Philosophy**:
- Embrace Gleam's functional nature
- Leverage type system for safety
- Use Process for concurrency
- Maintain event-driven architecture

---

## 1. Core Type System

### 1.1 Message Types

```gleam
// Core message types that LLMs understand
pub type LlmMessage {
  UserMessage(content: Content, timestamp: Int)
  AssistantMessage(
    content: List(ContentBlock),
    stop_reason: StopReason,
    timestamp: Int,
  )
  ToolResultMessage(
    tool_call_id: String,
    tool_name: String,
    content: List(ContentBlock),
    is_error: Bool,
    timestamp: Int,
  )
}

// Extended message types for internal use
pub type AgentMessage {
  // LLM-compatible messages
  User(LlmMessage)
  Assistant(LlmMessage)
  ToolResult(LlmMessage)
  
  // Custom message types for TraeNuPI
  Notification(content: String, level: NotificationLevel)
  StatusUpdate(component: String, status: String)
  KnowledgeUpdate(knowledge_id: String, action: UpdateAction)
}

// Content blocks
pub type ContentBlock {
  TextContent(text: String)
  ImageContent(url: String, media_type: String)
  ToolCall(id: String, name: String, arguments: Json)
  ThinkingContent(thinking: String, signature: Option(String))
}

pub type StopReason {
  StopReasonEnd
  StopReasonMaxTokens
  StopReasonToolUse
  StopReasonError(message: String)
  StopReasonAborted
}

pub type NotificationLevel {
  Info
  Warning
  Error
  Debug
}

pub type UpdateAction {
  Created
  Updated
  Deleted
}
```

### 1.2 Agent State

```gleam
pub type AgentState {
  AgentState(
    system_prompt: String,
    model: Model,
    messages: List(AgentMessage),
    tools: List(Tool),
    thinking_level: ThinkingLevel,
    is_streaming: Bool,
    pending_tool_calls: Set(String),
    error_message: Option(String),
  )
}

pub type ThinkingLevel {
  ThinkingOff
  ThinkingMinimal
  ThinkingLow
  ThinkingMedium
  ThinkingHigh
  ThinkingXHigh
}

pub type Model {
  Model(
    id: String,
    name: String,
    provider: String,
    api: String,
    context_window: Int,
    max_tokens: Int,
    cost: ModelCost,
  )
}

pub type ModelCost {
  ModelCost(
    input: Float,
    output: Float,
    cache_read: Float,
    cache_write: Float,
  )
}
```

### 1.3 Tool System

```gleam
pub type Tool {
  Tool(
    name: String,
    description: String,
    parameters: JsonSchema,
    execute: fn(Json, Option(AbortSignal)) -> Promise(ToolResult),
    execution_mode: ToolExecutionMode,
  )
}

pub type ToolExecutionMode {
  SequentialExecution
  ParallelExecution
}

pub type ToolResult {
  ToolResult(
    content: List(ContentBlock),
    is_error: Bool,
    details: Option(Json),
  )
}

pub type JsonSchema {
  ObjectSchema(properties: List(#(String, JsonSchema)), required: List(String))
  StringSchema(description: Option(String))
  NumberSchema(description: Option(String))
  BooleanSchema(description: Option(String))
  ArraySchema(items: JsonSchema, description: Option(String))
}
```

### 1.4 Event System

```gleam
pub type AgentEvent {
  // Lifecycle events
  AgentStart
  AgentEnd(messages: List(AgentMessage))
  
  // Turn events
  TurnStart
  TurnEnd(message: LlmMessage, tool_results: List(LlmMessage))
  
  // Message events
  MessageStart(message: AgentMessage)
  MessageUpdate(message: AgentMessage, event: AssistantMessageEvent)
  MessageEnd(message: AgentMessage)
  
  // Tool execution events
  ToolExecutionStart(
    tool_call_id: String,
    tool_name: String,
    args: Json,
  )
  ToolExecutionUpdate(
    tool_call_id: String,
    partial_result: String,
  )
  ToolExecutionEnd(
    tool_call_id: String,
    result: ToolResult,
  )
}

pub type AssistantMessageEvent {
  TextStart(id: String)
  TextDelta(id: String, delta: String)
  TextEnd(id: String)
  
  ThinkingStart(id: String)
  ThinkingDelta(id: String, delta: String)
  ThinkingEnd(id: String, signature: Option(String))
  
  ToolCallStart(id: String, name: String)
  ToolCallDelta(id: String, arguments_delta: String)
  ToolCallEnd(id: String, arguments: Json)
}
```

---

## 2. Agent Loop Architecture

### 2.1 Core Loop Structure

```gleam
// Main agent loop entry point
pub fn agent_loop(
  prompts: List(AgentMessage),
  context: AgentContext,
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
) -> EventStream(AgentEvent, List(AgentMessage)) {
  let stream = event_stream.new()

  // Start async agent loop
  process.spawn(fn() {
    let result = run_agent_loop(
      prompts,
      context,
      config,
      signal,
      fn(event) { event_stream.push(stream, event) },
    )

    case result {
      Ok(messages) -> event_stream.end(stream, messages)
      Error(error) -> event_stream.error(stream, error)
    }
  })

  stream
}

// Recursive loop implementation
fn run_agent_loop(
  prompts: List(AgentMessage),
  context: AgentContext,
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
) -> Result(List(AgentMessage), AgentError) {
  // 1. Emit agent_start
  emit(AgentStart)

  // 2. Add prompts to context
  let new_context = add_messages(context, prompts)
  let new_messages = prompts

  // 3. Run main loop
  use <- result.try(run_loop(
    new_context,
    new_messages,
    config,
    signal,
    emit,
  ))

  Ok(new_messages)
}

// Main loop logic
fn run_loop(
  context: AgentContext,
  new_messages: List(AgentMessage),
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
) -> Result(Nil, AgentError) {
  // Outer loop: handle follow-up messages
  run_outer_loop(
    context,
    new_messages,
    config,
    signal,
    emit,
    True,  // first_turn
    [],    // pending_messages
  )
}

fn run_outer_loop(
  context: AgentContext,
  new_messages: List(AgentMessage),
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
  first_turn: Bool,
  pending_messages: List(AgentMessage),
) -> Result(Nil, AgentError) {
  // Inner loop: handle tool calls and steering
  use <- result.try(run_inner_loop(
    context,
    new_messages,
    config,
    signal,
    emit,
    first_turn,
    pending_messages,
    True,  // has_more_tool_calls
  ))

  // Check for follow-up messages
  let follow_up = config.get_follow_up_messages()
  
  case follow_up {
    [] -> {
      // No more messages, emit agent_end and exit
      emit(AgentEnd(new_messages))
      Ok(Nil)
    }
    messages -> {
      // Continue with follow-up messages
      run_outer_loop(
        context,
        new_messages,
        config,
        signal,
        emit,
        False,
        messages,
      )
    }
  }
}

fn run_inner_loop(
  context: AgentContext,
  new_messages: List(AgentMessage),
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
  first_turn: Bool,
  pending_messages: List(AgentMessage),
  has_more_tool_calls: Bool,
) -> Result(Nil, AgentError) {
  // Check if we should continue
  case has_more_tool_calls || list.length(pending_messages) > 0 {
    False -> Ok(Nil)
    True -> {
      // Emit turn_start if not first turn
      case first_turn {
        False -> emit(TurnStart)
        True -> Nil
      }

      // Process pending messages
      use <- result.try(process_pending_messages(
        context,
        new_messages,
        pending_messages,
        emit,
      ))

      // Stream assistant response
      use <- result.try(stream_assistant_response(
        context,
        config,
        signal,
        emit,
      ))

      // Execute tool calls
      use <- result.try(execute_tool_calls(
        context,
        config,
        signal,
        emit,
      ))

      // Check for steering messages
      let steering = config.get_steering_messages()

      // Continue inner loop
      run_inner_loop(
        context,
        new_messages,
        config,
        signal,
        emit,
        False,
        steering,
        has_more_tool_calls,
      )
    }
  }
}
```

### 2.2 Message Conversion

```gleam
// Convert AgentMessage to LLM-compatible Message
pub fn convert_to_llm(
  messages: List(AgentMessage),
) -> List(LlmMessage) {
  messages
  |> list.filter_map(fn(msg) {
    case msg {
      User(m) -> Ok(m)
      Assistant(m) -> Ok(m)
      ToolResult(m) -> Ok(m)
      Notification(..) -> Error(Nil)  // Filter out UI-only messages
      StatusUpdate(..) -> Error(Nil)
      KnowledgeUpdate(..) -> Error(Nil)
    }
  })
}

// Transform context before conversion
pub fn transform_context(
  messages: List(AgentMessage),
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
) -> Result(List(AgentMessage), AgentError) {
  case config.transform_context {
    Some(transform) -> transform(messages, signal)
    None -> Ok(messages)
  }
}
```

### 2.3 Tool Execution

```gleam
// Execute tool calls
fn execute_tool_calls(
  context: AgentContext,
  assistant_message: LlmMessage,
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
) -> Result(List(LlmMessage), AgentError) {
  let tool_calls = extract_tool_calls(assistant_message)

  case config.tool_execution {
    SequentialExecution ->
      execute_tool_calls_sequential(
        context,
        assistant_message,
        tool_calls,
        config,
        signal,
        emit,
      )
    ParallelExecution ->
      execute_tool_calls_parallel(
        context,
        assistant_message,
        tool_calls,
        config,
        signal,
        emit,
      )
  }
}

// Sequential tool execution
fn execute_tool_calls_sequential(
  context: AgentContext,
  assistant_message: LlmMessage,
  tool_calls: List(ToolCall),
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
) -> Result(List(LlmMessage), AgentError) {
  tool_calls
  |> list.fold(
    Ok([]),
    fn(acc, tool_call) {
      use results <- result.try(acc)
      use result <- result.try(execute_single_tool(
        context,
        assistant_message,
        tool_call,
        config,
        signal,
        emit,
      ))
      Ok(list.append(results, [result]))
    },
  )
}

// Parallel tool execution
fn execute_tool_calls_parallel(
  context: AgentContext,
  assistant_message: LlmMessage,
  tool_calls: List(ToolCall),
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
) -> Result(List(LlmMessage), AgentError) {
  // Prepare all tools first
  let prepared = tool_calls
  |> list.map(fn(tool_call) {
    prepare_tool_call(context, assistant_message, tool_call, config, signal)
  })

  // Execute allowed tools concurrently
  let futures = prepared
  |> list.filter_map(fn(prep) {
    case prep {
      Ok(ready) -> Some(execute_tool_async(ready, signal))
      Error(_) -> None
    }
  })

  // Wait for all results
  let results = promise.all(futures)
  |> promise.await

  // Emit events and collect results
  Ok(collect_tool_results(results, emit))
}

// Execute single tool
fn execute_single_tool(
  context: AgentContext,
  assistant_message: LlmMessage,
  tool_call: ToolCall,
  config: AgentLoopConfig,
  signal: Option(AbortSignal),
  emit: fn(AgentEvent) -> Nil,
) -> Result(LlmMessage, AgentError) {
  // Emit start event
  emit(ToolExecutionStart(
    tool_call_id: tool_call.id,
    tool_name: tool_call.name,
    args: tool_call.arguments,
  ))

  // Call beforeToolCall hook
  use <- result.try(case config.before_tool_call {
    Some(hook) -> hook(context, assistant_message, tool_call, signal)
    None -> Ok(Nil)
  })

  // Execute tool
  let result = tool_call.execute(tool_call.arguments, signal)

  // Call afterToolCall hook
  use final_result <- result.try(case config.after_tool_call {
    Some(hook) -> hook(context, assistant_message, tool_call, result, signal)
    None -> Ok(result)
  })

  // Emit end event
  emit(ToolExecutionEnd(
    tool_call_id: tool_call.id,
    result: final_result,
  ))

  // Create tool result message
  Ok(ToolResultMessage(
    tool_call_id: tool_call.id,
    tool_name: tool_call.name,
    content: final_result.content,
    is_error: final_result.is_error,
    timestamp: get_timestamp(),
  ))
}
```

---

## 3. LLM Integration

### 3.1 Stream Interface

```gleam
pub type LlmStream {
  LlmStream(
    model: Model,
    context: LlmContext,
    options: StreamOptions,
  )
}

pub type LlmContext {
  LlmContext(
    system_prompt: String,
    messages: List(LlmMessage),
    tools: List(Tool),
  )
}

pub type StreamOptions {
  StreamOptions(
    temperature: Option(Float),
    max_tokens: Option(Int),
    api_key: Option(String),
    signal: Option(AbortSignal),
    cache_retention: CacheRetention,
    session_id: Option(String),
  )
}

pub type CacheRetention {
  CacheNone
  CacheShort
  CacheLong
}

// Stream function type
pub type StreamFn = fn(
  Model,
  LlmContext,
  StreamOptions,
) -> EventStream(AssistantMessageEvent, LlmMessage)
```

### 3.2 Provider Abstraction

```gleam
pub type Provider {
  OpenAIProvider(base_url: String, api_key: String)
  AnthropicProvider(api_key: String)
  GoogleProvider(api_key: String)
  MistralProvider(api_key: String)
  CustomProvider(name: String, config: Json)
}

pub fn stream_simple(
  model: Model,
  context: LlmContext,
  options: StreamOptions,
) -> EventStream(AssistantMessageEvent, LlmMessage) {
  case model.provider {
    "openai" -> openai_stream(model, context, options)
    "anthropic" -> anthropic_stream(model, context, options)
    "google" -> google_stream(model, context, options)
    "mistral" -> mistral_stream(model, context, options)
    _ -> custom_stream(model, context, options)
  }
}
```

---

## 4. Event Stream Implementation

### 4.1 Event Stream Type

```gleam
pub type EventStream(event, result) {
  EventStream(
    subject: process.Subject(StreamMessage(event, result)),
    is_complete: fn(event) -> Bool,
    extract_result: fn(event) -> Option(result),
  )
}

pub type StreamMessage(event, result) {
  Event(event)
  End(result)
  Error(error: AgentError)
}

pub fn new_event_stream(
  is_complete: fn(AgentEvent) -> Bool,
  extract_result: fn(AgentEvent) -> Option(List(AgentMessage)),
) -> EventStream(AgentEvent, List(AgentMessage)) {
  EventStream(
    subject: process.new_subject(),
    is_complete: is_complete,
    extract_result: extract_result,
  )
}

pub fn push(
  stream: EventStream(event, result),
  event: event,
) -> Nil {
  process.send(stream.subject, Event(event))
}

pub fn end(
  stream: EventStream(event, result),
  result: result,
) -> Nil {
  process.send(stream.subject, End(result))
}

pub fn error(
  stream: EventStream(event, result),
  error: AgentError,
) -> Nil {
  process.send(stream.subject, Error(error))
}

// Iterator for consuming events
pub fn to_iterator(
  stream: EventStream(event, result),
) -> Iterator(StreamMessage(event, result)) {
  process.from_subject(stream.subject)
}
```

---

## 5. Configuration

### 5.1 Agent Loop Config

```gleam
pub type AgentLoopConfig {
  AgentLoopConfig(
    model: Model,
    convert_to_llm: fn(List(AgentMessage)) -> Result(List(LlmMessage), AgentError),
    transform_context: Option(fn(List(AgentMessage), Option(AbortSignal)) -> Result(List(AgentMessage), AgentError)),
    get_api_key: Option(fn(String) -> Result(String, AgentError)),
    should_stop_after_turn: Option(fn(ShouldStopContext) -> Bool),
    get_steering_messages: fn() -> List(AgentMessage),
    get_follow_up_messages: fn() -> List(AgentMessage),
    tool_execution: ToolExecutionMode,
    before_tool_call: Option(fn(BeforeToolContext, Option(AbortSignal)) -> Result(BeforeToolResult, AgentError)),
    after_tool_call: Option(fn(AfterToolContext, Option(AbortSignal)) -> Result(AfterToolResult, AgentError)),
    thinking_budgets: Option(ThinkingBudgets),
    cache_retention: CacheRetention,
    session_id: Option(String),
  )
}

pub type ThinkingBudgets {
  ThinkingBudgets(
    minimal: Option(Int),
    low: Option(Int),
    medium: Option(Int),
    high: Option(Int),
  )
}

pub type ShouldStopContext {
  ShouldStopContext(
    message: LlmMessage,
    tool_results: List(LlmMessage),
    context: AgentContext,
    new_messages: List(AgentMessage),
  )
}

pub type BeforeToolContext {
  BeforeToolContext(
    assistant_message: LlmMessage,
    tool_call: ToolCall,
    args: Json,
    context: AgentContext,
  )
}

pub type BeforeToolResult {
  AllowExecution
  BlockExecution(reason: String)
}

pub type AfterToolContext {
  AfterToolContext(
    assistant_message: LlmMessage,
    tool_call: ToolCall,
    args: Json,
    result: ToolResult,
    is_error: Bool,
    context: AgentContext,
  )
}

pub type AfterToolResult {
  AfterToolResult(
    content: Option(List(ContentBlock)),
    details: Option(Json),
    is_error: Option(Bool),
    terminate: Option(Bool),
  )
}
```

---

## 6. Error Handling

### 6.1 Error Types

```gleam
pub type AgentError {
  // Configuration errors
  InvalidConfig(message: String)
  MissingApiKey(provider: String)
  InvalidToolDefinition(tool_name: String, reason: String)
  
  // Runtime errors
  LlmError(message: String, provider: String)
  ToolExecutionError(tool_name: String, message: String)
  ValidationError(message: String)
  
  // Network errors
  NetworkError(message: String)
  TimeoutError(duration_ms: Int)
  
  // Abort errors
  Aborted(reason: String)
  
  // Context errors
  ContextOverflow(tokens: Int, limit: Int)
  InvalidMessageFormat(message: String)
}

pub fn handle_error(error: AgentError) -> LlmMessage {
  case error {
    LlmError(message, _) ->
      AssistantMessage(
        content: [TextContent("Error: " <> message)],
        stop_reason: StopReasonError(message),
        timestamp: get_timestamp(),
      )
    Aborted(reason) ->
      AssistantMessage(
        content: [TextContent("Aborted: " <> reason)],
        stop_reason: StopReasonAborted,
        timestamp: get_timestamp(),
      )
    _ ->
      AssistantMessage(
        content: [TextContent("Internal error occurred")],
        stop_reason: StopReasonError("Internal error"),
        timestamp: get_timestamp(),
      )
  }
}
```

---

## 7. TraeNuPI-Specific Features

### 7.1 Knowledge Integration

```gleam
pub type KnowledgeTool {
  KnowledgeTool(
    name: "knowledge",
    description: "Query and manage knowledge base",
    parameters: KnowledgeQuerySchema,
  )
}

pub type KnowledgeQuerySchema {
  KnowledgeQuerySchema(
    action: KnowledgeAction,
    query: Option(String),
    knowledge_id: Option(String),
    limit: Option(Int),
  )
}

pub type KnowledgeAction {
  QueryKnowledge
  AddKnowledge
  UpdateKnowledge
  DeleteKnowledge
  SearchSimilar
}

pub fn execute_knowledge_tool(
  args: Json,
  db: DatabaseConnection,
) -> Promise(ToolResult) {
  let query = decode_knowledge_query(args)
  
  case query.action {
    QueryKnowledge -> query_knowledge(db, query)
    AddKnowledge -> add_knowledge(db, query)
    UpdateKnowledge -> update_knowledge(db, query)
    DeleteKnowledge -> delete_knowledge(db, query)
    SearchSimilar -> search_similar(db, query)
  }
}
```

### 7.2 Task Management

```gleam
pub type TaskTool {
  TaskTool(
    name: "tasks",
    description: "Manage tasks from Nezha database",
    parameters: TaskQuerySchema,
  )
}

pub type TaskQuerySchema {
  TaskQuerySchema(
    action: TaskAction,
    task_id: Option(String),
    title: Option(String),
    priority: Option(Int),
  )
}

pub type TaskAction {
  ListTasks
  AddTask
  CompleteTask
  UpdateTask
}

pub fn execute_task_tool(
  args: Json,
  db: DatabaseConnection,
) -> Promise(ToolResult) {
  let query = decode_task_query(args)
  
  case query.action {
    ListTasks -> list_tasks(db, query)
    AddTask -> add_task(db, query)
    CompleteTask -> complete_task(db, query)
    UpdateTask -> update_task(db, query)
  }
}
```

### 7.3 Inter-AI Communication

```gleam
pub type CommunicationTool {
  CommunicationTool(
    name: "communicate",
    description: "Communicate with other AI sessions",
    parameters: CommunicationSchema,
  )
}

pub type CommunicationSchema {
  CommunicationSchema(
    action: CommunicationAction,
    target_session: Option(String),
    message: Option(String),
  )
}

pub type CommunicationAction {
  SendMessage
  BroadcastMessage
  RequestCollaboration
}

pub fn execute_communication_tool(
  args: Json,
  session_manager: SessionManager,
) -> Promise(ToolResult) {
  let query = decode_communication_query(args)
  
  case query.action {
    SendMessage -> send_message(session_manager, query)
    BroadcastMessage -> broadcast_message(session_manager, query)
    RequestCollaboration -> request_collaboration(session_manager, query)
  }
}
```

---

## 8. Implementation Strategy

### 8.1 Phase 1: Core Types (Week 1)

**Goal**: Define all core types and interfaces

**Tasks**:
- [ ] Define AgentMessage types
- [ ] Define AgentState and related types
- [ ] Define Tool system types
- [ ] Define Event system types
- [ ] Define Error types
- [ ] Write comprehensive tests for type conversions

**Deliverables**:
- `src/agent/types.gleam` - All type definitions
- `test/agent/types_test.gleam` - Type conversion tests

### 8.2 Phase 2: Event Stream (Week 2)

**Goal**: Implement event streaming infrastructure

**Tasks**:
- [ ] Implement EventStream type
- [ ] Implement event emission
- [ ] Implement event consumption
- [ ] Implement error handling in streams
- [ ] Write tests for event streaming

**Deliverables**:
- `src/agent/event_stream.gleam` - Event stream implementation
- `test/agent/event_stream_test.gleam` - Event stream tests

### 8.3 Phase 3: Agent Loop (Week 3-4)

**Goal**: Implement core agent loop

**Tasks**:
- [ ] Implement main agent loop
- [ ] Implement message conversion
- [ ] Implement tool execution
- [ ] Implement steering and follow-up queues
- [ ] Write comprehensive loop tests

**Deliverables**:
- `src/agent/loop.gleam` - Agent loop implementation
- `test/agent/loop_test.gleam` - Agent loop tests

### 8.4 Phase 4: LLM Integration (Week 5-6)

**Goal**: Integrate with LLM providers

**Tasks**:
- [ ] Implement provider abstraction
- [ ] Implement OpenAI provider
- [ ] Implement Anthropic provider
- [ ] Implement streaming response handling
- [ ] Write provider tests

**Deliverables**:
- `src/agent/providers.gleam` - Provider abstraction
- `src/agent/providers/openai.gleam` - OpenAI provider
- `src/agent/providers/anthropic.gleam` - Anthropic provider
- `test/agent/providers_test.gleam` - Provider tests

### 8.5 Phase 5: TraeNuPI Tools (Week 7-8)

**Goal**: Implement TraeNuPI-specific tools

**Tasks**:
- [ ] Implement knowledge tool
- [ ] Implement task tool
- [ ] Implement communication tool
- [ ] Integrate with database
- [ ] Write tool tests

**Deliverables**:
- `src/agent/tools/knowledge.gleam` - Knowledge tool
- `src/agent/tools/tasks.gleam` - Task tool
- `src/agent/tools/communication.gleam` - Communication tool
- `test/agent/tools_test.gleam` - Tool tests

### 8.6 Phase 6: Integration & Testing (Week 9-10)

**Goal**: Full integration and end-to-end testing

**Tasks**:
- [ ] Integrate all components
- [ ] Write end-to-end tests
- [ ] Performance testing
- [ ] Error scenario testing
- [ ] Documentation

**Deliverables**:
- Complete PI Agent implementation
- Comprehensive test suite
- Performance benchmarks
- User documentation

---

## 9. Key Design Decisions

### 9.0 Target Platform: Node.js (JavaScript) 🎯

**Decision**: Focus on Node.js target first, do not implement Erlang target initially

**Rationale**:
- TraeNuPI already uses JavaScript target with node_pg
- Can leverage existing Glen framework and HTTP server
- Faster development cycle with familiar Node.js ecosystem
- Can add Erlang target later if needed for OTP features

**Implications**:
- Use JavaScript Promise instead of Erlang Process
- Use Node.js built-in modules for HTTP and streaming
- Leverage npm ecosystem for utilities
- Deploy to Node.js or serverless platforms

### 9.1 LLM Provider: OpenRouter with hy3 🤖

**Decision**: Use OpenRouter as primary LLM provider, starting with free model hy3

**Rationale**:
- OpenRouter provides unified API for multiple models
- Free tier available with hy3 model
- Easy to switch models without code changes
- Supports streaming and tool calling

**Implementation**:
```gleam
pub type OpenRouterConfig {
  OpenRouterConfig(
    api_key: String,
    base_url: String,  // "https://openrouter.ai/api/v1"
    model: String,     // "hy3" for free tier
  )
}

pub fn openrouter_stream(
  config: OpenRouterConfig,
  context: LlmContext,
  options: StreamOptions,
) -> EventStream(AssistantMessageEvent, LlmMessage) {
  // OpenRouter uses OpenAI-compatible API
  openai_compatible_stream(
    base_url: config.base_url,
    api_key: config.api_key,
    model: config.model,
    context: context,
    options: options,
  )
}
```

**Benefits**:
- Zero cost to start (hy3 free tier)
- Can upgrade to better models later
- Single API for multiple providers
- Built-in fallback support

### 9.2 Why Functional Recursion?

**Decision**: Use recursive functions instead of while loops

**Rationale**:
- Gleam is a functional language without mutable state
- Recursion is idiomatic and clear
- Pattern matching makes state transitions explicit
- Easier to reason about and test

### 9.3 Why Promise-Based Event Stream?

**Decision**: Use JavaScript Promise for event streaming (Node.js target)

**Rationale**:
- Native JavaScript async primitive
- Compatible with Node.js ecosystem
- Easy to integrate with existing Glen framework
- Natural fit for HTTP streaming responses

**Implementation**:
```gleam
pub type EventStream(event, result) {
  EventStream(
    emitter: EventEmitter(event),
    promise: Promise(result),
  )
}

pub fn new_event_stream() -> EventStream(event, result) {
  EventStream(
    emitter: event_emitter.new(),
    promise: promise.new(),
  )
}

pub fn push(stream: EventStream(event, result), event: event) -> Nil {
  event_emitter.emit(stream.emitter, event)
}

pub fn end(stream: EventStream(event, result), result: result) -> Nil {
  promise.resolve(stream.promise, result)
}
```

### 9.4 Why Result Type for Errors?

**Decision**: Use Result type instead of exceptions

**Rationale**:
- Forces explicit error handling
- Type-safe error propagation
- No runtime surprises
- Matches Gleam conventions

### 9.4 Why Separate AgentMessage and LlmMessage?

**Decision**: Maintain separation between internal and LLM messages

**Rationale**:
- Allows TraeNuPI-specific message types
- Cleaner context management
- Easier to add features without breaking LLM compatibility
- Follows pi-mono's proven pattern

---

## 10. Success Criteria

### 10.1 Functional Requirements

- ✅ Can execute multi-turn conversations
- ✅ Can execute tools in sequential and parallel modes
- ✅ Can stream responses from LLMs
- ✅ Can handle errors gracefully
- ✅ Can be aborted mid-execution
- ✅ Supports steering and follow-up messages

### 10.2 Performance Requirements

- Event emission latency < 1ms
- Tool execution overhead < 5ms
- Memory usage < 100MB for typical sessions
- Can handle 100+ messages per session

### 10.3 Quality Requirements

- Test coverage > 90%
- Zero runtime type errors
- Clear error messages
- Comprehensive documentation

---

## 11. Risks and Mitigations

### 11.1 Technical Risks

**Risk**: Gleam's type system may not support all TypeScript patterns

**Mitigation**: 
- Design Gleam-idiomatic alternatives
- Use Result type for error handling
- Leverage pattern matching for state machines

**Risk**: Process-based concurrency may be different from Node.js

**Mitigation**:
- Study Erlang/OTP patterns
- Use supervision trees for fault tolerance
- Test concurrent scenarios thoroughly

**Risk**: LLM provider APIs may change

**Mitigation**:
- Abstract provider interface
- Implement provider versioning
- Monitor API changelogs

### 11.2 Integration Risks

**Risk**: Database integration may be complex

**Mitigation**:
- Use existing node_pg integration
- Implement database connection pooling
- Test with real database early

**Risk**: Tool execution may have side effects

**Mitigation**:
- Implement tool sandboxing
- Use transaction boundaries
- Provide rollback mechanisms

---

## 12. Next Steps

1. **Review this design** with the team
2. **Create detailed task breakdown** for Phase 1
3. **Set up project structure** and dependencies
4. **Begin Phase 1 implementation**
5. **Establish CI/CD pipeline** for testing

---

**Questions for Discussion**:
- Should we support both JavaScript and Erlang targets?
- What's the priority for LLM provider support?
- How should we handle long-running tool executions?
- What's the strategy for session persistence?
