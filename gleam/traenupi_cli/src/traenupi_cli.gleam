import gleam/io
import gleam/string
import gleam/option.{None, Some}
import traenupi_core/cli.{type CliCommand, Help, Version, Status, Tellme, Know, Search, Remind, Review, Tasks, Unknown}

pub fn main() {
  let args = get_args()
  
  case cli.parse_args(args) {
    cli.ParseOk(command) -> handle_command(command)
    cli.ParseError(message) -> {
      io.println("Error: " <> message)
      io.println("")
      show_help()
    }
  }
}

fn handle_command(command: CliCommand) {
  case command {
    Help -> show_help()
    Version -> show_version()
    Status -> show_status()
    Tellme(question) -> handle_tellme(question)
    Know(key, value) -> handle_know(key, value)
    Search(query) -> handle_search(query)
    Remind(minutes, message) -> handle_remind(minutes, message)
    Review(review_id, action) -> handle_review(review_id, action)
    Tasks -> handle_tasks()
    Unknown(cmd, args) -> handle_unknown(cmd, args)
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
  io.println("  know <key> <value> Store knowledge")
  io.println("  search <query>    Search knowledge base")
  io.println("  remind <min> <msg> Set a reminder")
  io.println("  review <id>       Review a session")
  io.println("  tasks             List current tasks")
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

fn handle_tellme(question: String) {
  io.println("Question: " <> question)
  io.println("")
  io.println("Note: Baby AI integration pending migration")
}

fn handle_know(key: String, value: String) {
  io.println("Storing knowledge:")
  io.println("  Key: " <> key)
  io.println("  Value: " <> value)
  io.println("")
  io.println("Note: Knowledge storage pending migration")
}

fn handle_search(query: String) {
  io.println("Searching for: " <> query)
  io.println("")
  io.println("Note: Knowledge search pending migration")
}

fn handle_remind(minutes: Int, message: String) {
  io.println("Reminder set:")
  io.println("  In: " <> int_to_string(minutes) <> " minutes")
  io.println("  Message: " <> message)
  io.println("")
  io.println("Note: Reminder system pending migration")
}

fn handle_review(review_id: String, action: option.Option(String)) {
  io.println("Review: " <> review_id)
  case action {
    Some(act) -> io.println("Action: " <> act)
    None -> Nil
  }
  io.println("")
  io.println("Note: Review system pending migration")
}

fn handle_tasks() {
  io.println("=== Current Tasks ===")
  io.println("")
  io.println("Note: Task listing pending migration")
}

fn handle_unknown(cmd: String, args: List(String)) {
  io.println("Unknown command: " <> cmd)
  io.println("Arguments: " <> string.join(args, " "))
  io.println("")
  io.println("Run 'traenupi help' for available commands")
}

@external(javascript, "../traenupi_cli_ffi.mjs", "getArgs")
fn get_args() -> List(String)

@external(javascript, "../traenupi_cli_ffi.mjs", "intToString")
fn int_to_string(i: Int) -> String
