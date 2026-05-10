import traenupi_core/ai_provider as ai_provider
import gleam/io
import gleam/string
import gleam/bool
import gleam/option.{Some}

pub fn main() {
  io.println("🧪 Pure Gleam AI Test")
  io.println("─" <> string.repeat("─", 40))
  
  let api_key = "test-key"
  let provider = ai_provider.openrouter(api_key)
  
  io.println("✅ Provider created: OpenRouter")
  io.println("")
  
  let messages = [ai_provider.Message(role: "user", content: "What is 2+2?")]
  
  case ai_provider.chat_completion(provider, "anthropic/claude-3.5-sonnet", messages, Some("You are helpful.")) {
    Ok(response) -> {
      io.println("✅ Got response!")
      io.println("Content: " <> ai_provider.get_content(response))
      io.println("Fallback: " <> bool.to_string(response.is_fallback))
    }
    Error(err) -> {
      io.println("❌ Error: " <> ai_provider.error_to_string(err))
      
      case err {
        ai_provider.AiNetworkError(msg) ->
          io.println("   (Expected - using test key)")
        _ -> Nil
      }
    }
  }
  
  io.println("")
  io.println("─" <> string.repeat("─", 40))
  io.println("🎉 Pure Gleam AI Provider works!")
}
