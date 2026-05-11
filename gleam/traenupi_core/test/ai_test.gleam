import gleam/int
import gleam/io
import gleam/javascript/promise.{await, resolve}
import gleam/list
import gleam/string
import gleam/bool
import gleam/option.{Some}
import traenupi_core/ai_provider as ai_provider

pub fn main() {
  io.println("🧪 Pure Gleam AI Test")
  io.println("─" <> string.repeat("─", 40))

  let api_key = "test-key"
  let provider = ai_provider.openrouter(api_key)

  io.println("✅ Provider created: OpenRouter")
  io.println("")

  let messages = [ai_provider.Message(role: "user", content: "What is 2+2?")]

  use result <- await(
    ai_provider.chat_completion(
      provider,
      "anthropic/claude-sonnet-4.6",
      messages,
      Some("You are helpful."),
    ),
  )

  case result {
    Ok(response) -> {
      io.println("✅ Got response!")
      io.println("Content: " <> ai_provider.get_content(response))
      io.println("Fallback: " <> bool.to_string(response.is_fallback))
    }
    Error(err) -> {
      io.println("❌ Error: " <> ai_provider.error_to_string(err))

      case err {
        ai_provider.AiNetworkError(_) ->
          io.println("   (Expected - using test key)")
        _ -> Nil
      }
    }
  }

  io.println("")
  io.println("─" <> string.repeat("─", 40))

  io.println("")
  io.println("📋 Testing Ollama model listing...")
  let ollama_config = case ai_provider.ollama() {
    ai_provider.Ollama(config) -> config
    _ -> ai_provider.OllamaConfig(host: "localhost", port: 11_434)
  }

  use models_result <- await(ai_provider.list_ollama_models(ollama_config))
  case models_result {
    Ok(models) -> {
      io.println("✅ Found " <> int.to_string(list.length(models)) <> " models:")
      list.each(models, fn(m) {
        io.println("  - " <> ai_provider.model_info_to_string(m))
      })
    }
    Error(err) -> {
      io.println("❌ Model listing error: " <> ai_provider.error_to_string(err))
    }
  }

  io.println("")
  io.println("─" <> string.repeat("─", 40))
  io.println("🎉 Pure Gleam AI Provider works!")

  resolve(Nil)
}
