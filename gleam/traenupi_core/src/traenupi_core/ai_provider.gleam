import gleam/option.{type Option, Some, None}
import gleam/result
import gleam/list
import gleam/string
import gleam/json
import traenupi_core/lively_puter.{type LivelyPuterBridge}

pub type AIProvider {
  OpenAI
  Anthropic
  Puter
  Local
}

pub type AIModel {
  GPT4
  GPT35Turbo
  Claude3Opus
  Claude3Sonnet
  PuterDefault
  LocalDefault
  CustomModel(String)
}

pub type AIConfig {
  AIConfig(
    provider: AIProvider,
    model: AIModel,
    api_key: Option(String),
    base_url: Option(String),
    max_tokens: Int,
    temperature: Float,
    enable_fallback: Bool,
    fallback_providers: List(AIProvider),
  )
}

pub type Message {
  SystemMessage(String)
  UserMessage(String)
  AssistantMessage(String)
}

pub type AIError {
  APIError(String)
  NetworkError(String)
  AuthenticationError(String)
  RateLimitError(String)
  InvalidResponseError(String)
  ProviderNotAvailable(String)
  AllProvidersFailed
}

pub type AIResponse {
  AIResponse(
    content: String,
    provider: AIProvider,
    model: AIModel,
    usage: Option(TokenUsage),
  )
}

pub type TokenUsage {
  TokenUsage(
    prompt_tokens: Int,
    completion_tokens: Int,
    total_tokens: Int,
  )
}

pub type AIProviderClient {
  AIProviderClient(
    config: AIConfig,
    bridge: Option(LivelyPuterBridge),
  )
}

pub fn default_config() -> AIConfig {
  AIConfig(
    provider: Puter,
    model: PuterDefault,
    api_key: None,
    base_url: None,
    max_tokens: 4096,
    temperature: 0.7,
    enable_fallback: True,
    fallback_providers: [OpenAI, Anthropic, Local],
  )
}

pub fn initialize(config: AIConfig) -> Result(AIProviderClient, AIError) {
  let bridge = case config.provider {
    Puter -> {
      case lively_puter.initialize(lively_puter.default_config()) {
        Ok(b) -> Some(b)
        Error(_) -> None
      }
    }
    _ -> None
  }
  
  Ok(AIProviderClient(config: config, bridge: bridge))
}

pub fn generate_text(
  client: AIProviderClient,
  prompt: String,
) -> Result(AIResponse, AIError) {
  case client.config.provider {
    Puter -> generate_with_puter(client, prompt)
    OpenAI -> generate_with_openai(client, prompt)
    Anthropic -> generate_with_anthropic(client, prompt)
    Local -> generate_with_local(client, prompt)
  }
  |> handle_fallback(client, prompt)
}

pub fn generate_chat(
  client: AIProviderClient,
  messages: List(Message),
) -> Result(AIResponse, AIError) {
  case client.config.provider {
    Puter -> generate_chat_with_puter(client, messages)
    OpenAI -> generate_chat_with_openai(client, messages)
    Anthropic -> generate_chat_with_anthropic(client, messages)
    Local -> generate_chat_with_local(client, messages)
  }
  |> handle_chat_fallback(client, messages)
}

pub fn complete(
  client: AIProviderClient,
  text: String,
) -> Result(AIResponse, AIError) {
  let prompt = "Complete the following text:\n\n" <> text
  generate_text(client, prompt)
}

pub fn summarize(
  client: AIProviderClient,
  text: String,
) -> Result(AIResponse, AIError) {
  let prompt = "Summarize the following text:\n\n" <> text
  generate_text(client, prompt)
}

pub fn translate(
  client: AIProviderClient,
  text: String,
  target_language: String,
) -> Result(AIResponse, AIError) {
  let prompt = 
    "Translate the following text to " <> target_language <> ":\n\n" <> text
  generate_text(client, prompt)
}

pub fn analyze(
  client: AIProviderClient,
  text: String,
  analysis_type: String,
) -> Result(AIResponse, AIError) {
  let prompt = 
    "Analyze the following text for " <> analysis_type <> ":\n\n" <> text
  generate_text(client, prompt)
}

fn generate_with_puter(
  client: AIProviderClient,
  prompt: String,
) -> Result(AIResponse, AIError) {
  case client.bridge {
    Some(bridge) -> {
      use response <- result.try(
        lively_puter.ai_generate(bridge, prompt)
        |> result.map_error(fn(err) { APIError(err) })
      )
      
      Ok(AIResponse(
        content: response,
        provider: Puter,
        model: PuterDefault,
        usage: None,
      ))
    }
    None -> Error(ProviderNotAvailable("Puter"))
  }
}

fn generate_with_openai(
  client: AIProviderClient,
  prompt: String,
) -> Result(AIResponse, AIError) {
  case client.config.api_key {
    Some(api_key) -> {
      call_openai_api(
        api_key,
        client.config.base_url,
        model_to_string(client.config.model),
        prompt,
        client.config.max_tokens,
        client.config.temperature,
      )
      |> result.map(fn(response) {
        AIResponse(
          content: response,
          provider: OpenAI,
          model: client.config.model,
          usage: None,
        )
      })
    }
    None -> Error(AuthenticationError("OpenAI API key not provided"))
  }
}

fn generate_with_anthropic(
  client: AIProviderClient,
  prompt: String,
) -> Result(AIResponse, AIError) {
  case client.config.api_key {
    Some(api_key) -> {
      call_anthropic_api(
        api_key,
        model_to_string(client.config.model),
        prompt,
        client.config.max_tokens,
        client.config.temperature,
      )
      |> result.map(fn(response) {
        AIResponse(
          content: response,
          provider: Anthropic,
          model: client.config.model,
          usage: None,
        )
      })
    }
    None -> Error(AuthenticationError("Anthropic API key not provided"))
  }
}

fn generate_with_local(
  client: AIProviderClient,
  prompt: String,
) -> Result(AIResponse, AIError) {
  call_local_api(
    client.config.base_url,
    model_to_string(client.config.model),
    prompt,
    client.config.max_tokens,
    client.config.temperature,
  )
  |> result.map(fn(response) {
    AIResponse(
      content: response,
      provider: Local,
      model: client.config.model,
      usage: None,
    )
  })
}

fn generate_chat_with_puter(
  client: AIProviderClient,
  messages: List(Message),
) -> Result(AIResponse, AIError) {
  case client.bridge {
    Some(bridge) -> {
      let prompt = messages_to_prompt(messages)
      use response <- result.try(
        lively_puter.ai_generate(bridge, prompt)
        |> result.map_error(fn(err) { APIError(err) })
      )
      
      Ok(AIResponse(
        content: response,
        provider: Puter,
        model: PuterDefault,
        usage: None,
      ))
    }
    None -> Error(ProviderNotAvailable("Puter"))
  }
}

fn generate_chat_with_openai(
  client: AIProviderClient,
  messages: List(Message),
) -> Result(AIResponse, AIError) {
  case client.config.api_key {
    Some(api_key) -> {
      call_openai_chat_api(
        api_key,
        client.config.base_url,
        model_to_string(client.config.model),
        messages,
        client.config.max_tokens,
        client.config.temperature,
      )
      |> result.map(fn(response) {
        AIResponse(
          content: response,
          provider: OpenAI,
          model: client.config.model,
          usage: None,
        )
      })
    }
    None -> Error(AuthenticationError("OpenAI API key not provided"))
  }
}

fn generate_chat_with_anthropic(
  client: AIProviderClient,
  messages: List(Message),
) -> Result(AIResponse, AIError) {
  case client.config.api_key {
    Some(api_key) -> {
      call_anthropic_chat_api(
        api_key,
        model_to_string(client.config.model),
        messages,
        client.config.max_tokens,
        client.config.temperature,
      )
      |> result.map(fn(response) {
        AIResponse(
          content: response,
          provider: Anthropic,
          model: client.config.model,
          usage: None,
        )
      })
    }
    None -> Error(AuthenticationError("Anthropic API key not provided"))
  }
}

fn generate_chat_with_local(
  client: AIProviderClient,
  messages: List(Message),
) -> Result(AIResponse, AIError) {
  call_local_chat_api(
    client.config.base_url,
    model_to_string(client.config.model),
    messages,
    client.config.max_tokens,
    client.config.temperature,
  )
  |> result.map(fn(response) {
    AIResponse(
      content: response,
      provider: Local,
      model: client.config.model,
      usage: None,
    )
  })
}

fn handle_fallback(
  result: Result(AIResponse, AIError),
  client: AIProviderClient,
  prompt: String,
) -> Result(AIResponse, AIError) {
  case result, client.config.enable_fallback {
    Ok(response), _ -> Ok(response)
    Error(error), True -> {
      try_fallback_providers(client, prompt, error)
    }
    Error(error), False -> Error(error)
  }
}

fn handle_chat_fallback(
  result: Result(AIResponse, AIError),
  client: AIProviderClient,
  messages: List(Message),
) -> Result(AIResponse, AIError) {
  case result, client.config.enable_fallback {
    Ok(response), _ -> Ok(response)
    Error(error), True -> {
      try_chat_fallback_providers(client, messages, error)
    }
    Error(error), False -> Error(error)
  }
}

fn try_fallback_providers(
  client: AIProviderClient,
  prompt: String,
  original_error: AIError,
) -> Result(AIResponse, AIError) {
  case client.config.fallback_providers {
    [] -> Error(original_error)
    [provider, ..rest] -> {
      let new_config = AIConfig(
        ..client.config,
        provider: provider,
        fallback_providers: rest,
      )
      let new_client = AIProviderClient(..client, config: new_config)
      
      case generate_text(new_client, prompt) {
        Ok(response) -> Ok(response)
        Error(_) -> try_fallback_providers(new_client, prompt, original_error)
      }
    }
  }
}

fn try_chat_fallback_providers(
  client: AIProviderClient,
  messages: List(Message),
  original_error: AIError,
) -> Result(AIResponse, AIError) {
  case client.config.fallback_providers {
    [] -> Error(original_error)
    [provider, ..rest] -> {
      let new_config = AIConfig(
        ..client.config,
        provider: provider,
        fallback_providers: rest,
      )
      let new_client = AIProviderClient(..client, config: new_config)
      
      case generate_chat(new_client, messages) {
        Ok(response) -> Ok(response)
        Error(_) -> try_chat_fallback_providers(new_client, messages, original_error)
      }
    }
  }
}

fn model_to_string(model: AIModel) -> String {
  case model {
    GPT4 -> "gpt-4"
    GPT35Turbo -> "gpt-3.5-turbo"
    Claude3Opus -> "claude-3-opus-20240229"
    Claude3Sonnet -> "claude-3-sonnet-20240229"
    PuterDefault -> "puter-default"
    LocalDefault -> "local-default"
    CustomModel(name) -> name
  }
}

fn messages_to_prompt(messages: List(Message)) -> String {
  messages
  |> list.map(fn(message) {
    case message {
      SystemMessage(content) -> "System: " <> content
      UserMessage(content) -> "User: " <> content
      AssistantMessage(content) -> "Assistant: " <> content
    }
  })
  |> string.join("\n\n")
}

@external(javascript, "../traenupi_core_ffi.mjs", "callOpenAIApi")
fn call_openai_api(
  api_key: String,
  base_url: Option(String),
  model: String,
  prompt: String,
  max_tokens: Int,
  temperature: Float,
) -> Result(String, AIError)

@external(javascript, "../traenupi_core_ffi.mjs", "callAnthropicApi")
fn call_anthropic_api(
  api_key: String,
  model: String,
  prompt: String,
  max_tokens: Int,
  temperature: Float,
) -> Result(String, AIError)

@external(javascript, "../traenupi_core_ffi.mjs", "callLocalApi")
fn call_local_api(
  base_url: Option(String),
  model: String,
  prompt: String,
  max_tokens: Int,
  temperature: Float,
) -> Result(String, AIError)

@external(javascript, "../traenupi_core_ffi.mjs", "callOpenAIChatApi")
fn call_openai_chat_api(
  api_key: String,
  base_url: Option(String),
  model: String,
  messages: List(Message),
  max_tokens: Int,
  temperature: Float,
) -> Result(String, AIError)

@external(javascript, "../traenupi_core_ffi.mjs", "callAnthropicChatApi")
fn call_anthropic_chat_api(
  api_key: String,
  model: String,
  messages: List(Message),
  max_tokens: Int,
  temperature: Float,
) -> Result(String, AIError)

@external(javascript, "../traenupi_core_ffi.mjs", "callLocalChatApi")
fn call_local_chat_api(
  base_url: Option(String),
  model: String,
  messages: List(Message),
  max_tokens: Int,
  temperature: Float,
) -> Result(String, AIError)
