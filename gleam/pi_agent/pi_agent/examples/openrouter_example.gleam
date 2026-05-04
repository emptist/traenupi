import gleam/io
import gleam/javascript/promise as promise
import pi_agent/openrouter.{
  OpenRouterConfig, UserMessage, create_request, default_config,
  send_chat_completion,
}

pub fn main() {
  let api_key = "your-api-key-here"
  let config = default_config(api_key)
  
  let messages = [UserMessage("Hello, how are you?")]
  let request = create_request(config, messages)
  
  use result <- promise.await(send_chat_completion(config, request))
  
  case result {
    Ok(response) -> {
      io.debug(response)
    }
    Error(error) -> {
      io.debug(error)
    }
  }
  
  Nil
}
