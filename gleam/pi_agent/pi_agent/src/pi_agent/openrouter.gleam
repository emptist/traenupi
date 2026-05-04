import gleam/json
import gleam/option.{type Option, None}
import gleam/dynamic/decode as decode
import gleam/javascript/promise.{type Promise}

pub type OpenRouterConfig {
  OpenRouterConfig(
    api_key: String,
    base_url: String,
    model: String,
  )
}

pub type ChatMessage {
  SystemMessage(content: String)
  UserMessage(content: String)
  AssistantMessage(content: String)
  ToolMessage(tool_call_id: String, content: String)
}

pub type ChatCompletionRequest {
  ChatCompletionRequest(
    model: String,
    messages: List(ChatMessage),
    temperature: Option(Float),
    max_tokens: Option(Int),
    stream: Bool,
  )
}

pub type ChatCompletionChoice {
  ChatCompletionChoice(
    index: Int,
    message: ChatMessage,
    finish_reason: String,
  )
}

pub type ChatCompletionResponse {
  ChatCompletionResponse(
    id: String,
    model: String,
    choices: List(ChatCompletionChoice),
    usage: Option(Usage),
  )
}

pub type Usage {
  Usage(
    prompt_tokens: Int,
    completion_tokens: Int,
    total_tokens: Int,
  )
}

pub type OpenRouterError {
  ApiError(message: String)
  NetworkError(message: String)
  DecodeError(message: String)
}

pub fn default_config(api_key: String) -> OpenRouterConfig {
  OpenRouterConfig(
    api_key: api_key,
    base_url: "https://openrouter.ai/api/v1",
    model: "tencent/hy3-preview:free",
  )
}

pub fn create_request(
  config: OpenRouterConfig,
  messages: List(ChatMessage),
) -> ChatCompletionRequest {
  ChatCompletionRequest(
    model: config.model,
    messages: messages,
    temperature: None,
    max_tokens: None,
    stream: False,
  )
}

pub fn encode_chat_message(message: ChatMessage) -> json.Json {
  case message {
    SystemMessage(content) ->
      json.object([
        #("role", json.string("system")),
        #("content", json.string(content)),
      ])
    
    UserMessage(content) ->
      json.object([
        #("role", json.string("user")),
        #("content", json.string(content)),
      ])
    
    AssistantMessage(content) ->
      json.object([
        #("role", json.string("assistant")),
        #("content", json.string(content)),
      ])
    
    ToolMessage(tool_call_id, content) ->
      json.object([
        #("role", json.string("tool")),
        #("tool_call_id", json.string(tool_call_id)),
        #("content", json.string(content)),
      ])
  }
}

pub fn encode_request(request: ChatCompletionRequest) -> json.Json {
  let messages_json = json.array(request.messages, encode_chat_message)
  
  json.object([
    #("model", json.string(request.model)),
    #("messages", messages_json),
    #("stream", json.bool(request.stream)),
  ])
}

pub fn decode_chat_message() -> decode.Decoder(ChatMessage) {
  use role <- decode.field("role", decode.string)
  use content <- decode.field("content", decode.string)
  
  case role {
    "system" -> decode.success(SystemMessage(content))
    "user" -> decode.success(UserMessage(content))
    "assistant" -> decode.success(AssistantMessage(content))
    "tool" -> {
      use tool_call_id <- decode.field("tool_call_id", decode.string)
      decode.success(ToolMessage(tool_call_id, content))
    }
    _ -> decode.failure(SystemMessage(""), "valid role")
  }
}

pub fn decode_usage() -> decode.Decoder(Usage) {
  use prompt_tokens <- decode.field("prompt_tokens", decode.int)
  use completion_tokens <- decode.field("completion_tokens", decode.int)
  use total_tokens <- decode.field("total_tokens", decode.int)
  decode.success(Usage(prompt_tokens, completion_tokens, total_tokens))
}

pub fn decode_choice() -> decode.Decoder(ChatCompletionChoice) {
  use index <- decode.field("index", decode.int)
  use message <- decode.field("message", decode_chat_message())
  use finish_reason <- decode.field("finish_reason", decode.string)
  decode.success(ChatCompletionChoice(index, message, finish_reason))
}

pub fn decode_response() -> decode.Decoder(ChatCompletionResponse) {
  use id <- decode.field("id", decode.string)
  use model <- decode.field("model", decode.string)
  use choices <- decode.field("choices", decode.list(decode_choice()))
  use usage <- decode.optional_field("usage", None, decode.optional(decode_usage()))
  decode.success(ChatCompletionResponse(id, model, choices, usage))
}

@external(javascript, "./openrouter_ffi.mjs", "chat_completion")
pub fn send_chat_completion(
  config: OpenRouterConfig,
  request: ChatCompletionRequest,
) -> Promise(Result(ChatCompletionResponse, OpenRouterError))

@external(javascript, "./openrouter_ffi.mjs", "chat_completion_stream")
pub fn send_chat_completion_stream(
  config: OpenRouterConfig,
  request: ChatCompletionRequest,
  on_chunk: fn(ChatCompletionChunk) -> Nil,
) -> Promise(Result(Nil, OpenRouterError))

pub type ChatCompletionChunk {
  ChatCompletionChunk(
    id: String,
    choices: List(ChunkChoice),
  )
}

pub type ChunkChoice {
  ChunkChoice(
    index: Int,
    delta: ChatMessageDelta,
    finish_reason: Option(String),
  )
}

pub type ChatMessageDelta {
  ChatMessageDelta(
    role: Option(String),
    content: Option(String),
  )
}

pub fn decode_chunk() -> decode.Decoder(ChatCompletionChunk) {
  use id <- decode.field("id", decode.string)
  use choices <- decode.field("choices", decode.list(decode_chunk_choice()))
  decode.success(ChatCompletionChunk(id, choices))
}

pub fn decode_chunk_choice() -> decode.Decoder(ChunkChoice) {
  use index <- decode.field("index", decode.int)
  use delta <- decode.field("delta", decode_message_delta())
  use finish_reason <- decode.optional_field("finish_reason", None, decode.optional(decode.string))
  decode.success(ChunkChoice(index, delta, finish_reason))
}

pub fn decode_message_delta() -> decode.Decoder(ChatMessageDelta) {
  use role <- decode.optional_field("role", None, decode.optional(decode.string))
  use content <- decode.optional_field("content", None, decode.optional(decode.string))
  decode.success(ChatMessageDelta(role, content))
}
