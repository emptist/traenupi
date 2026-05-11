import gleam/io
import gleam/int
import gleam/javascript/promise.{await, resolve}
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import traenupi_core/ai_provider
import traenupi_core/cli.{
  type CliCommand, Help, Know, MeetingSay, Meetings, Models, Remind, Review,
  Reviews, Search, Status, Tasks, Tellme, Unknown, Version,
}
import traenupi_core/knowledge_db
import traenupi_core/reviews_db
import traenupi_core/meetings_db

pub fn main() {
  let args = get_args()

  case cli.parse_args(args) {
    cli.ParseOk(command) -> handle_command(command)
    cli.ParseError(message) -> {
      io.println("Error: " <> message)
      io.println("")
      resolve(show_help())
    }
  }
}

fn handle_command(command: CliCommand) -> promise.Promise(Nil) {
  case command {
    Help -> resolve(show_help())
    Version -> resolve(show_version())
    Status -> resolve(show_status())
    Tellme(question, model) -> handle_tellme(question, model)
    Know(key, value) -> handle_know(key, value)
    Search(query) -> handle_search(query)
    Remind(minutes, message) -> resolve(handle_remind(minutes, message))
    Review(review_id, action, summary) ->
      handle_review(review_id, action, summary)
    Reviews -> handle_reviews()
    Tasks -> resolve(handle_tasks())
    Models -> handle_models()
    Meetings -> handle_meetings()
    MeetingSay(meeting_id, perspective, position) ->
      handle_meeting_say(meeting_id, perspective, position)
    Unknown(cmd, args) -> resolve(handle_unknown(cmd, args))
  }
}

fn show_help() {
  io.println("TraeNuPI - Autonomous daemon for Trae AI")
  io.println("")
  io.println("Usage: traenupi <command> [arguments]")
  io.println("")
  io.println("Commands:")
  io.println("  help              Show this help message")
  io.println("  version           Show version information")
  io.println("  status            Show daemon status")
  io.println("  tellme <question> Ask baby AI a question")
  io.println("  tellme --model <m> <q> Use specific model (e.g. qwen3:4b, llama3.2:3b)")
  io.println("  know <key> <value> Store knowledge")
  io.println("  search <query>    Search knowledge base")
  io.println("  remind <min> <msg> Set a reminder")
  io.println("  reviews           List pending inter-reviews")
  io.println("  review <id>       View an inter-review")
  io.println("  review <id> complete \"summary\" Complete an inter-review")
  io.println("  tasks             List current tasks")
  io.println("  models            List available AI models")
  io.println("  meetings          List active meetings")
  io.println("  meeting say <id> <perspective> Join a meeting with your opinion")
  io.println("  meeting say <id> --position <pos> <perspective> With position")
  io.println("")
}

fn show_version() {
  io.println("TraeNuPI v1.0.0")
  io.println("Pure Gleam implementation")
}

fn show_status() {
  io.println("=== TraeNuPI Status ===")
  io.println("Status: Active")
  io.println("Backend: Pure Gleam (JavaScript target)")
  io.println("Database: PostgreSQL (via node_pg)")
  io.println("")
  io.println("Note: Full status implementation pending")
}

fn handle_tellme(question: String, model_opt: option.Option(String)) {
  io.println("Question: " <> question)
  io.println("")

  let ollama_model = case model_opt {
    Some(m) -> m
    None -> "qwen3:4b"
  }
  let ollama_provider = ai_provider.ollama()
  let messages = [ai_provider.Message(role: "user", content: question)]
  let system_prompt =
    Some(
      "You are a helpful AI assistant integrated with TraeNuPI. Be concise and helpful.",
    )

  io.println("🤖 Asking AI (Ollama local: " <> ollama_model <> ")...")
  io.println("─" <> string.repeat("─", 50))

  use ollama_result <- await(
    ai_provider.chat_completion(
      ollama_provider,
      ollama_model,
      messages,
      system_prompt,
    ),
  )

  case ollama_result {
    Ok(response) -> {
      let content = ai_provider.get_content(response)
      io.println("")
      io.println("✅ AI Response:")
      io.println("")
      io.println(content)
      io.println("")
      io.println("─" <> string.repeat("─", 50))
      resolve(Nil)
    }
    Error(ollama_error) -> {
      io.println("")
      io.println(
        "⚠️  Ollama failed: " <> ai_provider.error_to_string(ollama_error),
      )
      io.println("")

      let api_key = get_api_key()
      case api_key {
        "" -> {
          io.println("✗ No OpenRouter API key for fallback")
          io.println("  Start Ollama: ollama serve")
          io.println("  Pull model:   ollama pull qwen3:4b")
          resolve(Nil)
        }
        key -> {
          io.println("🔄 Falling back to OpenRouter...")
          io.println("─" <> string.repeat("─", 50))

          let or_provider = ai_provider.openrouter(key)
          use or_result <- await(
            ai_provider.chat_completion(
              or_provider,
              "anthropic/claude-sonnet-4.6",
              messages,
              system_prompt,
            ),
          )

          case or_result {
            Ok(response) -> {
              let content = ai_provider.get_content(response)
              io.println("")
              io.println("✅ AI Response (OpenRouter fallback):")
              io.println("")
              io.println(content)
              io.println("")
              io.println("─" <> string.repeat("─", 50))
            }
            Error(error) -> {
              io.println("")
              io.println("✗ OpenRouter also failed:")
              io.println(ai_provider.error_to_string(error))
            }
          }

          resolve(Nil)
        }
      }
    }
  }
}

fn handle_know(key: String, value: String) {
  let parts = string.split(key, ":")
  let category = case parts {
    [cat, _] -> cat
    _ -> "general"
  }

  use result <- await(knowledge_db.add_knowledge(
    key,
    value,
    category,
    "traenupi",
    [],
    5,
  ))

  case result {
    Ok(_) -> {
      io.println("✓ Knowledge stored successfully")
      io.println("  Category: " <> category)
      io.println("  Key: " <> key)
      io.println("  Value: " <> value)
    }
    Error(e) -> {
      io.println("✗ Failed to store knowledge")
      case e {
        knowledge_db.ConnectionError(msg) ->
          io.println("  Error: Connection - " <> msg)
        knowledge_db.QueryError(msg) -> io.println("  Error: Query - " <> msg)
        knowledge_db.NotFound(msg) -> io.println("  Error: Not found - " <> msg)
        knowledge_db.DecodeError(msg) -> io.println("  Error: Decode - " <> msg)
      }
    }
  }

  resolve(Nil)
}

fn handle_search(query: String) {
  use result <- await(knowledge_db.search_knowledge(query, "traenupi"))

  case result {
    Ok(entries) -> {
      io.println("Search results for: " <> query)
      io.println("")
      case entries {
        [] -> io.println("  No results found")
        _ -> {
          io.println(
            "  Found " <> int.to_string(list.length(entries)) <> " results:",
          )
          io.println("")
          list.each(entries, fn(entry) {
            io.println(
              "  ["
              <> entry.category
              <> "] "
              <> entry.key
              <> ": "
              <> entry.value,
            )
          })
        }
      }
    }
    Error(e) -> {
      io.println("✗ Search failed")
      case e {
        knowledge_db.ConnectionError(msg) ->
          io.println("  Error: Connection - " <> msg)
        knowledge_db.QueryError(msg) -> io.println("  Error: Query - " <> msg)
        knowledge_db.NotFound(msg) -> io.println("  Error: Not found - " <> msg)
        knowledge_db.DecodeError(msg) -> io.println("  Error: Decode - " <> msg)
      }
    }
  }

  resolve(Nil)
}

fn handle_remind(minutes: Int, message: String) {
  io.println("Reminder set:")
  io.println("  In: " <> int.to_string(minutes) <> " minutes")
  io.println("  Message: " <> message)
  io.println("")
  io.println("Note: Reminder system pending migration")
}

fn handle_review(
  review_id: String,
  action: option.Option(String),
  summary: option.Option(String),
) -> promise.Promise(Nil) {
  case action {
    Some("complete") -> {
      let summary_text = case summary {
        Some(s) -> s
        None -> "Reviewed and completed"
      }
      use result <- await(
        reviews_db.complete_review(review_id, summary_text, "traenupi-gleam-cli"),
      )
      case result {
        Ok(_) -> {
          io.println("✅ Review completed: " <> review_id)
          io.println("  Summary: " <> summary_text)
        }
        Error(reviews_db.NotFound(msg)) ->
          io.println("✗ Review not found: " <> msg)
        Error(reviews_db.ConnectionError(msg)) ->
          io.println("✗ Connection error: " <> msg)
        Error(reviews_db.QueryError(msg)) ->
          io.println("✗ Query error: " <> msg)
      }
      resolve(Nil)
    }
    _ -> {
      use result <- await(reviews_db.get_review(review_id))
      case result {
        Ok(review) -> {
          io.println("📋 " <> reviews_db.review_to_full_string(review))
          io.println("")
          case review.review_context {
            "" -> Nil
            ctx -> {
              io.println("Context:")
              io.println("  " <> ctx)
            }
          }
        }
        Error(reviews_db.NotFound(msg)) ->
          io.println("✗ Review not found: " <> msg)
        Error(reviews_db.ConnectionError(msg)) ->
          io.println("✗ Connection error: " <> msg)
        Error(reviews_db.QueryError(msg)) ->
          io.println("✗ Query error: " <> msg)
      }
      resolve(Nil)
    }
  }
}

fn handle_reviews() -> promise.Promise(Nil) {
  io.println("╔════════════════════════════════════════════╗")
  io.println("║     Pending Inter-Reviews                  ║")
  io.println("╚════════════════════════════════════════════╝")
  io.println("")

  use result <- await(reviews_db.list_pending_reviews())

  case result {
    Ok(reviews) -> {
      case reviews {
        [] -> {
          io.println("✅ No pending inter-reviews found!")
        }
        _ -> {
          io.println(
            "📋 Found " <> int.to_string(list.length(reviews)) <> " pending review(s):",
          )
          io.println("")
          list.each(reviews, fn(review) {
            io.println("  🔍 " <> reviews_db.review_to_short_string(review))
          })
          io.println("")
          io.println("──────────────────────────────────────────────────")
          io.println("💡 To perform a review:")
          io.println("   traenupi review <id>  - View review details")
          io.println(
            "   traenupi review <id> complete \"summary\" - Complete the review",
          )
        }
      }
    }
    Error(reviews_db.ConnectionError(msg)) -> {
      io.println("✗ Could not connect to database")
      io.println("  " <> msg)
    }
    Error(reviews_db.QueryError(msg)) -> {
      io.println("✗ Query error")
      io.println("  " <> msg)
    }
    Error(reviews_db.NotFound(msg)) -> {
      io.println("✗ Not found: " <> msg)
    }
  }

  resolve(Nil)
}

fn handle_meetings() -> promise.Promise(Nil) {
  io.println("╔════════════════════════════════════════════╗")
  io.println("║     Active Meetings                        ║")
  io.println("╚════════════════════════════════════════════╝")
  io.println("")

  use result <- await(meetings_db.list_active_meetings())

  case result {
    Ok(meetings) -> {
      case meetings {
        [] -> {
          io.println("  No active meetings found")
        }
        _ -> {
          io.println(
            "📋 Found " <> int.to_string(list.length(meetings)) <> " active meeting(s):",
          )
          io.println("")
          list.each(meetings, fn(meeting) {
            let short_id = case string.length(meeting.id) > 8 {
              True -> string.slice(meeting.id, 0, 8)
              False -> meeting.id
            }
            io.println("  📌 " <> short_id <> " | " <> meeting.topic)
          })
          io.println("")
          io.println("──────────────────────────────────────────────────")
          io.println("💡 To join a meeting:")
          io.println(
            "   traenupi meeting say <id> \"your perspective\"",
          )
          io.println(
            "   traenupi meeting say <id> --position support \"your perspective\"",
          )
        }
      }
    }
    Error(meetings_db.ConnectionError(msg)) -> {
      io.println("✗ Could not connect to database")
      io.println("  " <> msg)
    }
    Error(meetings_db.QueryError(msg)) -> {
      io.println("✗ Query error")
      io.println("  " <> msg)
    }
    Error(meetings_db.NotFound(msg)) -> {
      io.println("✗ Not found: " <> msg)
    }
  }

  resolve(Nil)
}

fn handle_meeting_say(
  meeting_id: String,
  perspective: String,
  position: option.Option(String),
) -> promise.Promise(Nil) {
  let pos = case position {
    Some(p) -> p
    None -> "support"
  }

  use result <- await(
    meetings_db.add_meeting_opinion(
      meeting_id,
      "S-TRAE-traenupi-gleam-cli",
      perspective,
      pos,
    ),
  )

  case result {
    Ok(_) -> {
      io.println("✅ Opinion added to meeting " <> meeting_id)
      io.println("  Position: " <> pos)
      io.println("  Perspective: " <> perspective)
    }
    Error(meetings_db.ConnectionError(msg)) -> {
      io.println("✗ Could not connect to database")
      io.println("  " <> msg)
    }
    Error(meetings_db.QueryError(msg)) -> {
      io.println("✗ Query error")
      io.println("  " <> msg)
    }
    Error(meetings_db.NotFound(msg)) -> {
      io.println("✗ Not found: " <> msg)
    }
  }

  resolve(Nil)
}

fn handle_tasks() {
  io.println("=== Current Tasks ===")
  io.println("")
  io.println("Note: Task listing pending migration")
}

fn handle_models() {
  io.println("=== Available AI Models ===")
  io.println("")

  let ollama_config = case ai_provider.ollama() {
    ai_provider.Ollama(config) -> config
    _ -> ai_provider.OllamaConfig(host: "localhost", port: 11_434)
  }

  use result <- await(ai_provider.list_ollama_models(ollama_config))

  case result {
    Ok(models) -> {
      case models {
        [] -> {
          io.println("  No Ollama models found")
          io.println("")
          io.println("  Pull a model: ollama pull qwen3:4b")
        }
        _ -> {
          io.println("  Ollama (local):")
          io.println("")
          list.each(models, fn(model) {
            io.println("    " <> ai_provider.model_info_to_string(model))
          })
          io.println("")
          io.println(
            "  Use with: traenupi tellme --model "
            <> case models {
              [first, ..] -> first.name
              _ -> "qwen3:4b"
            }
            <> " \"your question\"",
          )
        }
      }
    }
    Error(error) -> {
      io.println("  ✗ Could not connect to Ollama")
      io.println("  " <> ai_provider.error_to_string(error))
      io.println("")
      io.println("  Start Ollama: ollama serve")
      io.println("  Pull a model: ollama pull qwen3:4b")
    }
  }

  resolve(Nil)
}

fn handle_unknown(cmd: String, args: List(String)) {
  io.println("Unknown command: " <> cmd)
  io.println("Arguments: " <> string.join(args, " "))
  io.println("")
  io.println("Run 'traenupi help' for available commands")
}

fn get_api_key() -> String {
  let keychain_key_traenupi = get_keychain_password("traenupi")

  case keychain_key_traenupi {
    "" -> {
      let keychain_key_openrouter = get_keychain_password("openrouter")

      case keychain_key_openrouter {
        "" -> get_env("OPENROUTER_API_KEY")
        key -> {
          io.println("🔐 Using API key from Keychain ✓ (service: openrouter)")
          key
        }
      }
    }
    key -> {
      io.println("🔐 Using API key from Keychain ✓")
      key
    }
  }
}

@external(javascript, "../traenupi_cli_ffi.mjs", "getArgs")
fn get_args() -> List(String)

@external(javascript, "../traenupi_cli_ffi.mjs", "getEnv")
fn get_env(key: String) -> String

@external(javascript, "../traenupi_cli_ffi.mjs", "getKeychainPassword")
fn get_keychain_password(service: String) -> String
