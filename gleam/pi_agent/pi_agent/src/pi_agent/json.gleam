import gleam/json
import gleam/dynamic/decode as decode
import gleam/list
import gleam/string
import gleam/option.{type Option, None, Some}
import gleam/result
import pi_agent/types.{
  type AgentMessage, type ContentBlock, type LlmMessage, type Model,
  type ModelCost, type StopReason, type Tool, type ToolExecutionResult,
  type NotificationLevel, type UpdateAction,
  Assistant, AssistantMessage, ImageContent, KnowledgeUpdate,
  Model as ModelType, ModelCost as ModelCostType, Notification, StopReasonAborted,
  StopReasonEnd, StopReasonError, StopReasonMaxTokens, StopReasonToolUse,
  TextContent, ThinkingContent, Tool as ToolType, ToolCall, ToolExecutionResult as ToolExecutionResultType,
  ToolResult, ToolResultMessage, User, UserMessage, StatusUpdate,
  Info, Warning, Error as ErrorLevel, Debug,
  Created, Updated, Deleted,
}

pub fn encode_content_block(block: ContentBlock) -> json.Json {
  case block {
    TextContent(text) ->
      json.object([#("type", json.string("text")), #("text", json.string(text))])
    
    ImageContent(url, media_type) ->
      json.object([
        #("type", json.string("image")),
        #("url", json.string(url)),
        #("media_type", json.string(media_type)),
      ])
    
    ToolCall(id, name, arguments) ->
      json.object([
        #("type", json.string("tool_call")),
        #("id", json.string(id)),
        #("name", json.string(name)),
        #("arguments", json.string(arguments)),
      ])
    
    ThinkingContent(thinking, signature) ->
      json.object([
        #("type", json.string("thinking")),
        #("thinking", json.string(thinking)),
        #("signature", encode_option(signature, json.string)),
      ])
  }
}

pub fn encode_llm_message(message: LlmMessage) -> json.Json {
  case message {
    UserMessage(content, timestamp) ->
      json.object([
        #("role", json.string("user")),
        #("content", encode_content_block(content)),
        #("timestamp", json.int(timestamp)),
      ])
    
    AssistantMessage(content, stop_reason, timestamp) ->
      json.object([
        #("role", json.string("assistant")),
        #("content", json.array(content, encode_content_block)),
        #("stop_reason", encode_stop_reason(stop_reason)),
        #("timestamp", json.int(timestamp)),
      ])
    
    ToolResultMessage(tool_call_id, tool_name, content, is_error, timestamp) ->
      json.object([
        #("role", json.string("tool_result")),
        #("tool_call_id", json.string(tool_call_id)),
        #("tool_name", json.string(tool_name)),
        #("content", json.array(content, encode_content_block)),
        #("is_error", json.bool(is_error)),
        #("timestamp", json.int(timestamp)),
      ])
  }
}

pub fn encode_agent_message(message: AgentMessage) -> json.Json {
  case message {
    User(msg) ->
      json.object([
        #("type", json.string("user")),
        #("message", encode_llm_message(msg)),
      ])
    
    Assistant(msg) ->
      json.object([
        #("type", json.string("assistant")),
        #("message", encode_llm_message(msg)),
      ])
    
    ToolResult(msg) ->
      json.object([
        #("type", json.string("tool_result")),
        #("message", encode_llm_message(msg)),
      ])
    
    Notification(content, level) ->
      json.object([
        #("type", json.string("notification")),
        #("content", json.string(content)),
        #("level", encode_notification_level(level)),
      ])
    
    StatusUpdate(component, status) ->
      json.object([
        #("type", json.string("status_update")),
        #("component", json.string(component)),
        #("status", json.string(status)),
      ])
    
    KnowledgeUpdate(knowledge_id, action) ->
      json.object([
        #("type", json.string("knowledge_update")),
        #("knowledge_id", json.string(knowledge_id)),
        #("action", encode_update_action(action)),
      ])
  }
}

pub fn encode_stop_reason(reason: StopReason) -> json.Json {
  case reason {
    StopReasonEnd -> json.string("end")
    StopReasonMaxTokens -> json.string("max_tokens")
    StopReasonToolUse -> json.string("tool_use")
    StopReasonError(message) ->
      json.object([
        #("type", json.string("error")),
        #("message", json.string(message)),
      ])
    StopReasonAborted -> json.string("aborted")
  }
}

pub fn encode_notification_level(level: types.NotificationLevel) -> json.Json {
  case level {
    types.Info -> json.string("info")
    types.Warning -> json.string("warning")
    types.Error -> json.string("error")
    types.Debug -> json.string("debug")
  }
}

pub fn encode_update_action(action: types.UpdateAction) -> json.Json {
  case action {
    types.Created -> json.string("created")
    types.Updated -> json.string("updated")
    types.Deleted -> json.string("deleted")
  }
}

pub fn encode_model(model: Model) -> json.Json {
  case model {
    ModelType(id, name, provider, api, context_window, max_tokens, cost) ->
      json.object([
        #("id", json.string(id)),
        #("name", json.string(name)),
        #("provider", json.string(provider)),
        #("api", json.string(api)),
        #("context_window", json.int(context_window)),
        #("max_tokens", json.int(max_tokens)),
        #("cost", encode_model_cost(cost)),
      ])
  }
}

pub fn encode_model_cost(cost: ModelCost) -> json.Json {
  case cost {
    ModelCostType(input, output, cache_read, cache_write) ->
      json.object([
        #("input", json.float(input)),
        #("output", json.float(output)),
        #("cache_read", json.float(cache_read)),
        #("cache_write", json.float(cache_write)),
      ])
  }
}

pub fn encode_tool(tool: Tool) -> json.Json {
  case tool {
    ToolType(name, description, parameters, execution_mode) ->
      json.object([
        #("name", json.string(name)),
        #("description", json.string(description)),
        #("parameters", encode_json_schema(parameters)),
        #("execution_mode", encode_execution_mode(execution_mode)),
      ])
  }
}

pub fn encode_json_schema(schema: types.JsonSchema) -> json.Json {
  case schema {
    types.ObjectSchema(properties, required) ->
      json.object([
        #("type", json.string("object")),
        #("properties", json.object(list.map(properties, fn(prop) {
          #(prop.0, encode_json_schema(prop.1))
        }))),
        #("required", json.array(required, json.string)),
      ])
    
    types.StringSchema(description) ->
      json.object([
        #("type", json.string("string")),
        #("description", encode_option(description, json.string)),
      ])
    
    types.NumberSchema(description) ->
      json.object([
        #("type", json.string("number")),
        #("description", encode_option(description, json.string)),
      ])
    
    types.BooleanSchema(description) ->
      json.object([
        #("type", json.string("boolean")),
        #("description", encode_option(description, json.string)),
      ])
    
    types.ArraySchema(items, description) ->
      json.object([
        #("type", json.string("array")),
        #("items", encode_json_schema(items)),
        #("description", encode_option(description, json.string)),
      ])
  }
}

pub fn encode_execution_mode(mode: types.ToolExecutionMode) -> json.Json {
  case mode {
    types.SequentialExecution -> json.string("sequential")
    types.ParallelExecution -> json.string("parallel")
  }
}

pub fn encode_tool_result(result: ToolExecutionResult) -> json.Json {
  case result {
    ToolExecutionResultType(content, is_error, details) ->
      json.object([
        #("content", json.array(content, encode_content_block)),
        #("is_error", json.bool(is_error)),
        #("details", encode_option(details, fn(d) { d })),
      ])
  }
}

fn encode_option(option: Option(a), encoder: fn(a) -> json.Json) -> json.Json {
  case option {
    None -> json.null()
    Some(value) -> encoder(value)
  }
}

pub fn to_json_string(message: AgentMessage) -> String {
  json.to_string(encode_agent_message(message))
}

pub fn from_json_string(json_string: String) -> Result(AgentMessage, String) {
  json.parse(from: json_string, using: decode_agent_message())
  |> result.map_error(fn(error) {
    "JSON decode error: " <> json_error_to_string(error)
  })
}

fn json_error_to_string(error: json.DecodeError) -> String {
  case error {
    json.UnexpectedEndOfInput -> "Unexpected end of input"
    json.UnexpectedByte(msg) -> "Unexpected byte: " <> msg
    json.UnexpectedSequence(msg) -> "Unexpected sequence: " <> msg
    json.UnableToDecode(errors) -> string_join_errors(errors)
  }
}

fn string_join_errors(errors: List(decode.DecodeError)) -> String {
  errors
  |> list.map(fn(error) {
    "Expected " <> error.expected <> " but found " <> error.found
  })
  |> string.concat
}

pub fn decode_agent_message() -> decode.Decoder(AgentMessage) {
  use msg_type <- decode.field("type", decode.string)
  case msg_type {
    "user" -> {
      use message <- decode.field("message", decode_llm_message())
      decode.success(User(message))
    }
    
    "assistant" -> {
      use message <- decode.field("message", decode_llm_message())
      decode.success(Assistant(message))
    }
    
    "tool_result" -> {
      use message <- decode.field("message", decode_llm_message())
      decode.success(ToolResult(message))
    }
    
    "notification" -> {
      use content <- decode.field("content", decode.string)
      use level <- decode.field("level", decode_notification_level())
      decode.success(Notification(content, level))
    }
    
    "status_update" -> {
      use component <- decode.field("component", decode.string)
      use status <- decode.field("status", decode.string)
      decode.success(StatusUpdate(component, status))
    }
    
    "knowledge_update" -> {
      use knowledge_id <- decode.field("knowledge_id", decode.string)
      use action <- decode.field("action", decode_update_action())
      decode.success(KnowledgeUpdate(knowledge_id, action))
    }
    
    _ ->
      decode.failure(User(UserMessage(TextContent(""), 0)), "valid message type")
  }
}

pub fn decode_llm_message() -> decode.Decoder(LlmMessage) {
  use role <- decode.field("role", decode.string)
  case role {
    "user" -> {
      use content <- decode.field("content", decode_content_block())
      use timestamp <- decode.field("timestamp", decode.int)
      decode.success(UserMessage(content, timestamp))
    }
    
    "assistant" -> {
      use content <- decode.field("content", decode.list(decode_content_block()))
      use stop_reason <- decode.field("stop_reason", decode_stop_reason())
      use timestamp <- decode.field("timestamp", decode.int)
      decode.success(AssistantMessage(content, stop_reason, timestamp))
    }
    
    "tool_result" -> {
      use tool_call_id <- decode.field("tool_call_id", decode.string)
      use tool_name <- decode.field("tool_name", decode.string)
      use content <- decode.field("content", decode.list(decode_content_block()))
      use is_error <- decode.field("is_error", decode.bool)
      use timestamp <- decode.field("timestamp", decode.int)
      decode.success(ToolResultMessage(tool_call_id, tool_name, content, is_error, timestamp))
    }
    
    _ ->
      decode.failure(UserMessage(TextContent(""), 0), "valid role")
  }
}

pub fn decode_content_block() -> decode.Decoder(ContentBlock) {
  use content_type <- decode.field("type", decode.string)
  case content_type {
    "text" -> {
      use text <- decode.field("text", decode.string)
      decode.success(TextContent(text))
    }
    
    "image" -> {
      use url <- decode.field("url", decode.string)
      use media_type <- decode.field("media_type", decode.string)
      decode.success(ImageContent(url, media_type))
    }
    
    "tool_call" -> {
      use id <- decode.field("id", decode.string)
      use name <- decode.field("name", decode.string)
      use arguments <- decode.field("arguments", decode.string)
      decode.success(ToolCall(id, name, arguments))
    }
    
    "thinking" -> {
      use thinking <- decode.field("thinking", decode.string)
      use signature <- decode.optional_field("signature", None, decode.optional(decode.string))
      decode.success(ThinkingContent(thinking, signature))
    }
    
    _ ->
      decode.failure(TextContent(""), "valid content type")
  }
}

pub fn decode_stop_reason() -> decode.Decoder(StopReason) {
  use decoded <- decode.then(decode.string)
  case decoded {
    "end" -> decode.success(StopReasonEnd)
    "max_tokens" -> decode.success(StopReasonMaxTokens)
    "tool_use" -> decode.success(StopReasonToolUse)
    "aborted" -> decode.success(StopReasonAborted)
    _ -> {
      use reason_type <- decode.field("type", decode.string)
      case reason_type {
        "error" -> {
          use message <- decode.field("message", decode.string)
          decode.success(StopReasonError(message))
        }
        _ -> decode.failure(StopReasonEnd, "valid stop reason")
      }
    }
  }
}

pub fn decode_notification_level() -> decode.Decoder(NotificationLevel) {
  use decoded <- decode.then(decode.string)
  case decoded {
    "info" -> decode.success(Info)
    "warning" -> decode.success(Warning)
    "error" -> decode.success(ErrorLevel)
    "debug" -> decode.success(Debug)
    _ -> decode.failure(Info, "valid notification level")
  }
}

pub fn decode_update_action() -> decode.Decoder(UpdateAction) {
  use decoded <- decode.then(decode.string)
  case decoded {
    "created" -> decode.success(Created)
    "updated" -> decode.success(Updated)
    "deleted" -> decode.success(Deleted)
    _ -> decode.failure(Created, "valid update action")
  }
}
