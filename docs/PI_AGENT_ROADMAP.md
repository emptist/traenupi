# PI Agent Implementation Roadmap

**Date**: 2026-05-04  
**Status**: Ready to Start  
**Target**: Node.js (JavaScript)  
**LLM Provider**: OpenRouter (hy3 free model)

---

## Overview

This roadmap outlines the implementation of PI Agent for TraeNuPI, focusing on Node.js target and OpenRouter integration.

**Key Decisions**:
- ✅ Target: Node.js (JavaScript) only
- ✅ LLM: OpenRouter with hy3 (free tier)
- ✅ Framework: Glen (existing HTTP server)
- ✅ Database: node_pg (existing integration)

---

## Phase 1: Foundation (Week 1-2)

### Goal
Establish core types and basic infrastructure

### Tasks

#### 1.1 Project Setup
- [ ] Create `gleam/pi_agent` directory
- [ ] Initialize Gleam project with `gleam init`
- [ ] Configure `gleam.toml` for JavaScript target
- [ ] Add dependencies:
  - `gleam_stdlib`
  - `gleam_javascript`
  - `gleam_json`
  - `gleam_http`
- [ ] Set up test framework

#### 1.2 Core Type Definitions
- [ ] Define `AgentMessage` type
  ```gleam
  pub type AgentMessage {
    User(LlmMessage)
    Assistant(LlmMessage)
    ToolResult(LlmMessage)
    Notification(content: String, level: NotificationLevel)
    StatusUpdate(component: String, status: String)
    KnowledgeUpdate(knowledge_id: String, action: UpdateAction)
  }
  ```
- [ ] Define `LlmMessage` type
- [ ] Define `AgentState` type
- [ ] Define `Tool` type
- [ ] Define `AgentEvent` type
- [ ] Define error types

#### 1.3 JSON Utilities
- [ ] Implement JSON encoding/decoding for messages
- [ ] Implement JSON schema validation
- [ ] Write tests for JSON conversions

### Deliverables
- `gleam/pi_agent/gleam.toml` - Project configuration
- `src/pi_agent/types.gleam` - Core type definitions
- `src/pi_agent/json.gleam` - JSON utilities
- `test/pi_agent/types_test.gleam` - Type tests

### Success Criteria
- ✅ All types compile without errors
- ✅ JSON encoding/decoding works correctly
- ✅ Test coverage > 80%

---

## Phase 2: Event System (Week 3)

### Goal
Implement event streaming infrastructure

### Tasks

#### 2.1 Event Emitter
- [ ] Implement EventEmitter using JavaScript FFI
  ```javascript
  // src/pi_agent_event_emitter.mjs
  export function newEmitter() {
    return new EventEmitter();
  }
  
  export function emit(emitter, event) {
    emitter.emit('event', event);
  }
  
  export function on(emitter, callback) {
    emitter.on('event', callback);
  }
  ```
- [ ] Create Gleam wrapper for EventEmitter
- [ ] Write tests for event emission

#### 2.2 Event Stream
- [ ] Implement EventStream type
  ```gleam
  pub type EventStream(event, result) {
    EventStream(
      emitter: EventEmitter(event),
      promise: Promise(result),
    )
  }
  ```
- [ ] Implement `push`, `end`, `error` functions
- [ ] Implement event consumption
- [ ] Write tests for event streaming

#### 2.3 Promise Integration
- [ ] Implement Promise utilities
- [ ] Create async/await patterns
- [ ] Write tests for Promise operations

### Deliverables
- `src/pi_agent/event_emitter.gleam` - Event emitter
- `src/pi_agent/event_emitter_ffi.mjs` - JavaScript FFI
- `src/pi_agent/event_stream.gleam` - Event stream
- `src/pi_agent/promise.gleam` - Promise utilities
- `test/pi_agent/event_test.gleam` - Event tests

### Success Criteria
- ✅ Events can be emitted and consumed
- ✅ Promise-based async operations work
- ✅ Test coverage > 85%

---

## Phase 3: OpenRouter Integration (Week 4-5)

### Goal
Integrate with OpenRouter API for LLM calls

### Tasks

#### 3.1 OpenRouter Client
- [ ] Implement HTTP client for OpenRouter
  ```gleam
  pub fn openrouter_request(
    config: OpenRouterConfig,
    payload: Json,
  ) -> Promise(HttpResponse) {
    // Use Glen's HTTP client or Node.js fetch
  }
  ```
- [ ] Implement authentication
- [ ] Handle rate limiting
- [ ] Write tests with mock server

#### 3.2 Streaming Response Handler
- [ ] Implement SSE (Server-Sent Events) parser
  ```javascript
  // src/pi_agent_sse_ffi.mjs
  export function parseSSE(stream) {
    // Parse SSE stream
  }
  ```
- [ ] Handle streaming chunks
- [ ] Emit events for each chunk
- [ ] Write tests for streaming

#### 3.3 Message Conversion
- [ ] Implement `convert_to_llm` function
- [ ] Handle different message types
- [ ] Implement context window management
- [ ] Write tests for message conversion

#### 3.4 Tool Definition Format
- [ ] Convert Gleam tools to OpenAI format
- [ ] Handle tool result formatting
- [ ] Write tests for tool formatting

### Deliverables
- `src/pi_agent/openrouter.gleam` - OpenRouter client
- `src/pi_agent/openrouter_ffi.mjs` - JavaScript FFI
- `src/pi_agent/sse.gleam` - SSE parser
- `src/pi_agent/message_conversion.gleam` - Message conversion
- `test/pi_agent/openrouter_test.gleam` - OpenRouter tests

### Success Criteria
- ✅ Can call OpenRouter API successfully
- ✅ Streaming responses work correctly
- ✅ Message conversion is accurate
- ✅ Test coverage > 90%

---

## Phase 4: Agent Loop (Week 6-7)

### Goal
Implement core agent loop

### Tasks

#### 4.1 Agent Loop Core
- [ ] Implement main agent loop
  ```gleam
  pub fn agent_loop(
    prompts: List(AgentMessage),
    context: AgentContext,
    config: AgentLoopConfig,
  ) -> EventStream(AgentEvent, List(AgentMessage)) {
    // Recursive loop implementation
  }
  ```
- [ ] Implement turn management
- [ ] Implement message queuing
- [ ] Write tests for loop logic

#### 4.2 Tool Execution
- [ ] Implement sequential tool execution
- [ ] Implement parallel tool execution
- [ ] Implement tool hooks (before/after)
- [ ] Write tests for tool execution

#### 4.3 Error Handling
- [ ] Implement error recovery
- [ ] Implement retry logic
- [ ] Implement graceful degradation
- [ ] Write tests for error scenarios

#### 4.4 Steering and Follow-up
- [ ] Implement steering message queue
- [ ] Implement follow-up message queue
- [ ] Implement queue modes (all vs one-at-a-time)
- [ ] Write tests for message queuing

### Deliverables
- `src/pi_agent/loop.gleam` - Agent loop
- `src/pi_agent/tool_execution.gleam` - Tool execution
- `src/pi_agent/error_handling.gleam` - Error handling
- `test/pi_agent/loop_test.gleam` - Loop tests

### Success Criteria
- ✅ Agent can run multi-turn conversations
- ✅ Tool execution works correctly
- ✅ Error handling is robust
- ✅ Test coverage > 90%

---

## Phase 5: TraeNuPI Tools (Week 8-9)

### Goal
Implement TraeNuPI-specific tools

### Tasks

#### 5.1 Knowledge Tool
- [ ] Implement knowledge query tool
  ```gleam
  pub fn knowledge_tool() -> Tool {
    Tool(
      name: "knowledge",
      description: "Query and manage knowledge base",
      parameters: knowledge_query_schema(),
      execute: fn(args, signal) {
        // Query nezha database
      },
    )
  }
  ```
- [ ] Integrate with node_pg
- [ ] Implement knowledge search
- [ ] Write tests for knowledge tool

#### 5.2 Task Tool
- [ ] Implement task management tool
- [ ] Integrate with nezha database
- [ ] Implement task CRUD operations
- [ ] Write tests for task tool

#### 5.3 Communication Tool
- [ ] Implement inter-AI communication tool
- [ ] Implement message broadcasting
- [ ] Implement collaboration requests
- [ ] Write tests for communication tool

#### 5.4 Standard Tools
- [ ] Implement bash tool (optional)
- [ ] Implement file read/write tools (optional)
- [ ] Write tests for standard tools

### Deliverables
- `src/pi_agent/tools/knowledge.gleam` - Knowledge tool
- `src/pi_agent/tools/tasks.gleam` - Task tool
- `src/pi_agent/tools/communication.gleam` - Communication tool
- `test/pi_agent/tools_test.gleam` - Tool tests

### Success Criteria
- ✅ All TraeNuPI tools work correctly
- ✅ Tools integrate with database
- ✅ Test coverage > 85%

---

## Phase 6: Integration & Testing (Week 10)

### Goal
Full integration and end-to-end testing

### Tasks

#### 6.1 Integration
- [ ] Integrate with Glen HTTP server
- [ ] Integrate with node_pg database
- [ ] Create API endpoints
- [ ] Write integration tests

#### 6.2 End-to-End Testing
- [ ] Test complete conversation flows
- [ ] Test tool execution flows
- [ ] Test error scenarios
- [ ] Test performance

#### 6.3 Documentation
- [ ] Write API documentation
- [ ] Write usage examples
- [ ] Write deployment guide
- [ ] Create README

### Deliverables
- Complete PI Agent implementation
- Integration tests
- API documentation
- Usage examples
- README

### Success Criteria
- ✅ All components integrated successfully
- ✅ End-to-end tests pass
- ✅ Documentation is complete
- ✅ Ready for deployment

---

## Technical Stack

### Core Dependencies
- `gleam_stdlib` - Standard library
- `gleam_javascript` - JavaScript target support
- `gleam_json` - JSON handling
- `gleam_http` - HTTP types
- `node_pg` - PostgreSQL client (existing)

### JavaScript Dependencies
- Node.js built-in modules:
  - `http` - HTTP server
  - `events` - EventEmitter
  - `stream` - Stream handling
  - `fetch` - HTTP client (Node 18+)

### External Services
- OpenRouter API - LLM provider
- nezha database - Knowledge and tasks

---

## Risk Mitigation

### Technical Risks

**Risk**: OpenRouter API changes
- **Mitigation**: Use stable API version, implement adapter pattern

**Risk**: hy3 model limitations
- **Mitigation**: Design for easy model switching, test with multiple models

**Risk**: JavaScript FFI complexity
- **Mitigation**: Minimize FFI, use well-tested patterns

### Integration Risks

**Risk**: Database connection issues
- **Mitigation**: Use connection pooling, implement retries

**Risk**: Performance bottlenecks
- **Mitigation**: Profile early, optimize critical paths

---

## Success Metrics

### Functional Metrics
- ✅ Can execute 10+ turn conversations
- ✅ Can execute tools in < 100ms
- ✅ Can handle 100+ messages per session
- ✅ Error recovery rate > 95%

### Performance Metrics
- Event emission latency < 1ms
- Tool execution overhead < 5ms
- Memory usage < 100MB per session
- API response time < 2s (excluding LLM)

### Quality Metrics
- Test coverage > 90%
- Zero runtime type errors
- All tests pass consistently
- Documentation complete

---

## Next Steps

1. **Create project structure**
   ```bash
   cd /Users/jk/gits/hub/tools_ai/traenupi/gleam
   mkdir pi_agent
   cd pi_agent
   gleam init
   ```

2. **Configure for JavaScript target**
   - Update `gleam.toml`
   - Add dependencies

3. **Start Phase 1**
   - Define core types
   - Implement JSON utilities
   - Write tests

4. **Set up CI/CD**
   - GitHub Actions for testing
   - Automated test runs

---

**Ready to start Phase 1? Let's begin!** 🚀
