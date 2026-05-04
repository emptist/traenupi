import gleam/json
import gleam/option.{type Option}

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

pub type StopReason {
  StopReasonEnd
  StopReasonMaxTokens
  StopReasonToolUse
  StopReasonError(message: String)
  StopReasonAborted
}

pub type ContentBlock {
  TextContent(text: String)
  ImageContent(url: String, media_type: String)
  ToolCall(id: String, name: String, arguments: String)
  ThinkingContent(thinking: String, signature: Option(String))
}

pub type LlmMessage {
  UserMessage(content: ContentBlock, timestamp: Int)
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

pub type AgentMessage {
  User(LlmMessage)
  Assistant(LlmMessage)
  ToolResult(LlmMessage)
  Notification(content: String, level: NotificationLevel)
  StatusUpdate(component: String, status: String)
  KnowledgeUpdate(knowledge_id: String, action: UpdateAction)
}

pub type ThinkingLevel {
  ThinkingOff
  ThinkingMinimal
  ThinkingLow
  ThinkingMedium
  ThinkingHigh
  ThinkingXHigh
}

pub type ModelCost {
  ModelCost(
    input: Float,
    output: Float,
    cache_read: Float,
    cache_write: Float,
  )
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

pub type ToolExecutionMode {
  SequentialExecution
  ParallelExecution
}

pub type ToolExecutionResult {
  ToolExecutionResult(
    content: List(ContentBlock),
    is_error: Bool,
    details: Option(json.Json),
  )
}

pub type JsonSchema {
  ObjectSchema(properties: List(#(String, JsonSchema)), required: List(String))
  StringSchema(description: Option(String))
  NumberSchema(description: Option(String))
  BooleanSchema(description: Option(String))
  ArraySchema(items: JsonSchema, description: Option(String))
}

pub type Tool {
  Tool(
    name: String,
    description: String,
    parameters: JsonSchema,
    execution_mode: ToolExecutionMode,
  )
}

pub type AgentState {
  AgentState(
    system_prompt: String,
    model: Model,
    messages: List(AgentMessage),
    tools: List(Tool),
    thinking_level: ThinkingLevel,
    is_streaming: Bool,
    pending_tool_calls: List(String),
    error_message: Option(String),
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
  ToolCallEnd(id: String, arguments: json.Json)
}

pub type AgentEvent {
  AgentStart
  AgentEnd(messages: List(AgentMessage))
  
  TurnStart
  TurnEnd(message: LlmMessage, tool_results: List(LlmMessage))
  
  MessageStart(message: AgentMessage)
  MessageUpdate(message: AgentMessage, event: AssistantMessageEvent)
  MessageEnd(message: AgentMessage)
  
  ToolExecutionStart(
    tool_call_id: String,
    tool_name: String,
    args: json.Json,
  )
  ToolExecutionUpdate(
    tool_call_id: String,
    partial_result: String,
  )
  ToolExecutionEnd(
    tool_call_id: String,
    result: ToolExecutionResult,
  )
}

pub type AgentError {
  InvalidConfig(message: String)
  MissingApiKey(provider: String)
  InvalidToolDefinition(tool_name: String, reason: String)
  LlmError(message: String, provider: String)
  ToolExecutionError(tool_name: String, message: String)
  ValidationError(message: String)
  NetworkError(message: String)
  TimeoutError(duration_ms: Int)
  Aborted(reason: String)
  ContextOverflow(tokens: Int, limit: Int)
  InvalidMessageFormat(message: String)
}
