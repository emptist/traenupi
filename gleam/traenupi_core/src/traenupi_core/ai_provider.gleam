import gleam/int
import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/json.{type Json}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import traenupi_core/http.{type HttpError}

pub type Message {
  Message(role: String, content: String)
}

pub type ChatCompletionResponse {
  ChatCompletionResponse(
    id: String,
    model: String,
    content: String,
    provider: String,
    latency_ms: Int,
    is_fallback: Bool,
  )
}

pub type Provider {
  OpenRouter(OpenRouterConfig)
  Ollama(OllamaConfig)
}

pub type OpenRouterConfig {
  OpenRouterConfig(api_key: String, base_url: String)
}

pub type OllamaConfig {
  OllamaConfig(host: String, port: Int)
}

pub type ModelInfo {
  ModelInfo(
    name: String,
    family: String,
    parameter_size: String,
    quantization: String,
    size_bytes: Int,
  )
}

pub type AiError {
  AiNetworkError(String)
  ApiError(status: Int, message: String)
  AuthError(String)
  TimeoutError
  ParseError(String)
  NoProviderAvailable
  AllProvidersFailed(List(AiError))
}

pub fn openrouter(api_key: String) -> Provider {
  OpenRouter(OpenRouterConfig(
    api_key: api_key,
    base_url: "https://openrouter.ai/api/v1",
  ))
}

pub fn ollama() -> Provider {
  Ollama(OllamaConfig(host: "localhost", port: 11_434))
}

pub fn list_ollama_models(
  config: OllamaConfig,
) -> Promise(Result(List(ModelInfo), AiError)) {
  let url =
    "http://" <> config.host <> ":" <> int.to_string(config.port) <> "/api/tags"

  let request = http.get(url)

  use result <- await(http.send(request))
  resolve(case result {
    Ok(response) ->
      case response.status {
        200 -> parse_ollama_models(response.body)
        status -> Error(ApiError(status: status, message: response.body))
      }
    Error(http_error) -> Error(to_ai_error(http_error))
  })
}

fn parse_ollama_models(body: String) -> Result(List(ModelInfo), AiError) {
  let model_names = extract_all_field_values(body, "name")
  case model_names {
    [] -> Error(ParseError("Could not extract models from Ollama response"))
    _ -> Ok(list.map(model_names, fn(name) {
      let family = extract_value_near_name(body, name, "family")
      let param_size = extract_value_near_name(body, name, "parameter_size")
      let quant = extract_value_near_name(body, name, "quantization_level")
      let size_str = extract_size_near_name(body, name)
      ModelInfo(
        name: name,
        family: family,
        parameter_size: param_size,
        quantization: quant,
        size_bytes: parse_int_safe(size_str),
      )
    }))
  }
}

fn extract_all_field_values(json_string: String, field: String) -> List(String) {
  let marker = "\"" <> field <> "\":\""
  let parts = string.split(json_string, marker)
  case parts {
    [] -> []
    [_, ..rest] -> extract_first_string_values(rest)
  }
}

fn extract_first_string_values(parts: List(String)) -> List(String) {
  list.filter_map(parts, fn(part) {
    case string.split(part, "\"") {
      [first, ..] ->
        case first {
          "" -> Error(Nil)
          _ -> Ok(first)
        }
      _ -> Error(Nil)
    }
  })
}

fn extract_value_near_name(
  json_string: String,
  name: String,
  field: String,
) -> String {
  let name_marker = "\"name\":\"" <> name <> "\""
  case string.split(json_string, name_marker) {
    [_, after_name, ..] -> {
      let next_model = string.split(after_name, "\"name\":\"")
      let segment = case next_model {
        [first, ..] -> first
        _ -> after_name
      }
      let field_marker = "\"" <> field <> "\":\""
      case string.split(segment, field_marker) {
        [_, rest, ..] -> {
          case string.split(rest, "\"") {
            [first, ..] -> first
            _ -> ""
          }
        }
        _ -> ""
      }
    }
    _ -> ""
  }
}

fn extract_size_near_name(json_string: String, name: String) -> String {
  let name_marker = "\"name\":\"" <> name <> "\""
  case string.split(json_string, name_marker) {
    [_, after_name, ..] -> {
      let next_model = string.split(after_name, "\"name\":\"")
      let segment = case next_model {
        [first, ..] -> first
        _ -> after_name
      }
      let size_marker = "\"size\":"
      case string.split(segment, size_marker) {
        [_, rest, ..] -> {
          let digits = take_digits(rest)
          digits
        }
        _ -> ""
      }
    }
    _ -> ""
  }
}

fn take_digits(s: String) -> String {
  s
  |> string.to_graphemes()
  |> list.take_while(fn(c) { is_digit_char(c) })
  |> string.concat()
}

fn is_digit_char(c: String) -> Bool {
  case c {
    "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" -> True
    _ -> False
  }
}

fn parse_int_safe(s: String) -> Int {
  case int.parse(s) {
    Ok(n) -> n
    Error(_) -> 0
  }
}

pub fn format_size(bytes: Int) -> String {
  case bytes >= 1_000_000_000 {
    True ->
      int.to_string(bytes / 1_000_000_000) <> "." <> int.to_string(bytes % 1_000_000_000 / 100_000_000) <> " GB"
    False ->
      case bytes >= 1_000_000 {
        True ->
          int.to_string(bytes / 1_000_000) <> " MB"
        False -> int.to_string(bytes) <> " B"
      }
  }
}

pub fn model_info_to_string(info: ModelInfo) -> String {
  info.name
  <> " ("
  <> info.parameter_size
  <> ", "
  <> info.quantization
  <> ", "
  <> format_size(info.size_bytes)
  <> ")"
}

pub fn detect_provider(model: String, api_key: String) -> Provider {
  case
    string.contains(model, "llama")
    || string.contains(model, "mistral")
    || string.contains(model, "qwen")
  {
    True -> ollama()
    False -> openrouter(api_key)
  }
}

pub fn chat_completion(
  provider: Provider,
  model: String,
  messages: List(Message),
  system_prompt: Option(String),
) -> Promise(Result(ChatCompletionResponse, AiError)) {
  case provider {
    OpenRouter(config) ->
      openrouter_chat(config, model, messages, system_prompt)
    Ollama(config) -> ollama_chat(config, model, messages, system_prompt)
  }
}

fn message_to_json_obj(msg: Message) -> Json {
  json.object([
    #("role", json.string(msg.role)),
    #("content", json.string(msg.content)),
  ])
}

fn identity(a: Json) -> Json {
  a
}

fn messages_to_json(messages: List(Message)) -> Json {
  messages
  |> list.map(message_to_json_obj)
  |> json.array(identity)
}

fn openrouter_chat(
  config: OpenRouterConfig,
  model: String,
  messages: List(Message),
  system_prompt: Option(String),
) -> Promise(Result(ChatCompletionResponse, AiError)) {
  let url = config.base_url <> "/chat/completions"

  let all_messages = case system_prompt {
    Some(prompt) -> [Message(role: "system", content: prompt), ..messages]
    None -> messages
  }

  let body =
    json.object([
      #("model", json.string(model)),
      #("messages", messages_to_json(all_messages)),
      #("temperature", json.float(0.3)),
      #("max_tokens", json.int(4000)),
    ])
    |> json.to_string

  let request =
    http.post(url)
    |> http.with_bearer_token(config.api_key)
    |> http.with_json_content_type()
    |> http.with_header("HTTP-Referer", "https://traenupi.ai")
    |> http.with_header("X-Title", "TraeNuPI")
    |> http.with_header("X-OpenRouter-Cache", "false")
    |> http.with_header("X-OpenRouter-Cache-Clear", "true")
    |> http.with_body(body)

  use result <- await(http.send(request))
  resolve(case result {
    Ok(response) ->
      case response.status {
        200 ->
          parse_openrouter_response(response.body, model, "openrouter", False)
        status -> Error(ApiError(status: status, message: response.body))
      }
    Error(http_error) -> Error(to_ai_error(http_error))
  })
}

fn ollama_chat(
  config: OllamaConfig,
  model: String,
  messages: List(Message),
  system_prompt: Option(String),
) -> Promise(Result(ChatCompletionResponse, AiError)) {
  let url =
    "http://" <> config.host <> ":" <> int.to_string(config.port) <> "/api/chat"

  let all_messages = case system_prompt {
    Some(prompt) -> [Message(role: "system", content: prompt), ..messages]
    None -> messages
  }

  let body =
    json.object([
      #("model", json.string(model)),
      #("messages", messages_to_json(all_messages)),
      #("stream", json.bool(False)),
      #(
        "options",
        json.object([
          #("temperature", json.float(0.3)),
          #("num_predict", json.int(4000)),
        ]),
      ),
    ])
    |> json.to_string

  let request =
    http.post(url)
    |> http.with_json_content_type()
    |> http.with_body(body)

  use result <- await(http.send(request))
  resolve(case result {
    Ok(response) ->
      case response.status {
        200 -> parse_ollama_response(response.body, model)
        status -> Error(ApiError(status: status, message: response.body))
      }
    Error(http_error) -> Error(to_ai_error(http_error))
  })
}

pub fn ask_with_fallback(
  primary: Provider,
  fallback: Provider,
  model: String,
  fallback_model: String,
  messages: List(Message),
  system_prompt: Option(String),
) -> Promise(Result(ChatCompletionResponse, AiError)) {
  use primary_result <- await(chat_completion(
    primary,
    model,
    messages,
    system_prompt,
  ))
  case primary_result {
    Ok(response) -> resolve(Ok(response))
    Error(primary_error) -> {
      use fallback_result <- await(chat_completion(
        fallback,
        fallback_model,
        messages,
        system_prompt,
      ))
      resolve(case fallback_result {
        Ok(fallback_response) ->
          Ok(ChatCompletionResponse(..fallback_response, is_fallback: True))
        Error(fallback_error) ->
          Error(AllProvidersFailed([primary_error, fallback_error]))
      })
    }
  }
}

fn extract_content(json_string: String) -> Option(String) {
  extract_field_after_marker(json_string, "\"content\":\"")
}

fn extract_field_after_marker(
  json_string: String,
  marker: String,
) -> Option(String) {
  do_extract_after_marker(string.split(json_string, marker))
}

fn do_extract_after_marker(parts: List(String)) -> Option(String) {
  case parts {
    [_, rest, ..] -> do_get_first_part(string.split(rest, "\""))
    _ -> None
  }
}

fn do_get_first_part(parts: List(String)) -> Option(String) {
  case parts {
    [first, ..] -> Some(first)
    _ -> None
  }
}

fn parse_openrouter_response(
  body: String,
  model: String,
  provider: String,
  is_fallback: Bool,
) -> Result(ChatCompletionResponse, AiError) {
  case extract_content(body) {
    Some(content) ->
      Ok(ChatCompletionResponse(
        id: provider <> "-" <> int.to_string(system_time()),
        model: model,
        content: content,
        provider: provider,
        latency_ms: 0,
        is_fallback: is_fallback,
      ))
    None ->
      Error(ParseError("Could not extract content from OpenRouter response"))
  }
}

fn parse_ollama_response(
  body: String,
  model: String,
) -> Result(ChatCompletionResponse, AiError) {
  case extract_content(body) {
    Some(content) ->
      Ok(ChatCompletionResponse(
        id: "ollama-" <> int.to_string(system_time()),
        model: model,
        content: content,
        provider: "ollama",
        latency_ms: 0,
        is_fallback: True,
      ))
    None -> Error(ParseError("Could not extract content from Ollama response"))
  }
}

fn to_ai_error(error: HttpError) -> AiError {
  case error {
    http.NetworkError(msg) -> AiNetworkError(msg)
    http.Timeout -> TimeoutError
    http.StatusError(status, body) ->
      case status {
        401 | 403 -> AuthError(body)
        n if n >= 500 -> ApiError(status: status, message: body)
        _ -> ApiError(status: status, message: body)
      }
    _ -> AiNetworkError("Unknown error")
  }
}

@external(javascript, "../traenupi_core_ffi.mjs", "systemTime")
pub fn system_time() -> Int

pub fn get_content(response: ChatCompletionResponse) -> String {
  response.content
}

pub fn get_model(response: ChatCompletionResponse) -> String {
  response.model
}

pub fn is_success(response: ChatCompletionResponse) -> Bool {
  string.length(response.content) > 0
}

pub fn error_to_string(error: AiError) -> String {
  case error {
    AiNetworkError(msg) -> "Network error: " <> msg
    ApiError(status, msg) ->
      "API error (" <> int.to_string(status) <> "): " <> msg
    AuthError(msg) -> "Auth failed: " <> msg
    TimeoutError -> "Timeout"
    ParseError(msg) -> "Parse error: " <> msg
    NoProviderAvailable -> "No provider"
    AllProvidersFailed(errors) ->
      "All failed:\n" <> string.join(list.map(errors, error_to_string), "\n")
  }
}
