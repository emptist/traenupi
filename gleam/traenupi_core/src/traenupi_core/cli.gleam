import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub type CliCommand {
  Help
  Version
  Status
  Tellme(question: String)
  Know(key: String, value: String)
  Search(query: String)
  Remind(minutes: Int, message: String)
  Review(review_id: String, action: Option(String))
  Tasks
  Unknown(command: String, args: List(String))
}

pub type ParseResult {
  ParseOk(command: CliCommand)
  ParseError(message: String)
}

pub fn parse_args(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseOk(Help)
    ["help", ..] -> ParseOk(Help)
    ["--help", ..] -> ParseOk(Help)
    ["-h", ..] -> ParseOk(Help)
    ["version", ..] -> ParseOk(Version)
    ["--version", ..] -> ParseOk(Version)
    ["-v", ..] -> ParseOk(Version)
    ["status", ..] -> ParseOk(Status)
    ["tellme", ..rest] -> parse_tellme(rest)
    ["know", ..rest] -> parse_know(rest)
    ["search", ..rest] -> parse_search(rest)
    ["remind", ..rest] -> parse_remind(rest)
    ["review", ..rest] -> parse_review(rest)
    ["tasks", ..] -> ParseOk(Tasks)
    [cmd, ..rest] -> ParseOk(Unknown(command: cmd, args: rest))
  }
}

fn parse_tellme(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("tellme requires a question argument")
    [_question, ..] -> ParseOk(Tellme(question: string.join(args, " ")))
  }
}

fn parse_know(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("know requires key and value arguments")
    [key, ..rest] -> {
      case rest {
        [] -> ParseError("know requires a value argument")
        _ -> ParseOk(Know(key: key, value: string.join(rest, " ")))
      }
    }
  }
}

fn parse_search(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("search requires a query argument")
    _ -> ParseOk(Search(query: string.join(args, " ")))
  }
}

fn parse_remind(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("remind requires minutes and message arguments")
    [minutes_str, ..rest] -> {
      case int_parse(minutes_str) {
        Ok(minutes) -> {
          case rest {
            [] -> ParseError("remind requires a message argument")
            _ -> ParseOk(Remind(minutes: minutes, message: string.join(rest, " ")))
          }
        }
        Error(_) -> ParseError("remind: first argument must be a number (minutes)")
      }
    }
  }
}

fn parse_review(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("review requires a review_id argument")
    [review_id] -> ParseOk(Review(review_id: review_id, action: None))
    [review_id, action, ..] -> ParseOk(Review(review_id: review_id, action: Some(action)))
  }
}

fn int_parse(s: String) -> Result(Int, Nil) {
  case s {
    "0" -> Ok(0)
    "1" -> Ok(1)
    "2" -> Ok(2)
    "3" -> Ok(3)
    "4" -> Ok(4)
    "5" -> Ok(5)
    "6" -> Ok(6)
    "7" -> Ok(7)
    "8" -> Ok(8)
    "9" -> Ok(9)
    "10" -> Ok(10)
    "15" -> Ok(15)
    "20" -> Ok(20)
    "30" -> Ok(30)
    "60" -> Ok(60)
    _ -> {
      case string.starts_with(s, "-") {
        True -> Error(Nil)
        False -> {
          case string.length(s) > 3 {
            True -> Error(Nil)
            False -> {
              let chars = string.to_graphemes(s)
              case list.all(chars, fn(c) { is_digit(c) }) {
                True -> {
                  let num = list.fold(chars, 0, fn(acc, c) {
                    acc * 10 + digit_to_int(c)
                  })
                  Ok(num)
                }
                False -> Error(Nil)
              }
            }
          }
        }
      }
    }
  }
}

fn is_digit(s: String) -> Bool {
  case s {
    "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" -> True
    _ -> False
  }
}

fn digit_to_int(s: String) -> Int {
  case s {
    "0" -> 0
    "1" -> 1
    "2" -> 2
    "3" -> 3
    "4" -> 4
    "5" -> 5
    "6" -> 6
    "7" -> 7
    "8" -> 8
    "9" -> 9
    _ -> 0
  }
}

pub fn command_to_string(cmd: CliCommand) -> String {
  case cmd {
    Help -> "help"
    Version -> "version"
    Status -> "status"
    Tellme(question) -> "tellme \"" <> question <> "\""
    Know(key, value) -> "know " <> key <> " \"" <> value <> "\""
    Search(query) -> "search \"" <> query <> "\""
    Remind(minutes, message) -> "remind " <> int_to_string(minutes) <> " \"" <> message <> "\""
    Review(review_id, action) -> {
      case action {
        Some(a) -> "review " <> review_id <> " " <> a
        None -> "review " <> review_id
      }
    }
    Tasks -> "tasks"
    Unknown(command, args) -> "unknown: " <> command <> " " <> string.join(args, " ")
  }
}

fn int_to_string(n: Int) -> String {
  case n {
    0 -> "0"
    1 -> "1"
    2 -> "2"
    3 -> "3"
    4 -> "4"
    5 -> "5"
    6 -> "6"
    7 -> "7"
    8 -> "8"
    9 -> "9"
    10 -> "10"
    15 -> "15"
    20 -> "20"
    30 -> "30"
    60 -> "60"
    _ -> "0"
  }
}

pub fn is_valid_command(cmd: String) -> Bool {
  case cmd {
    "help" | "version" | "status" | "tellme" | "know" | "search" | "remind" | "review" | "tasks" -> True
    _ -> False
  }
}

pub fn get_help_text() -> String {
  "TraeNuPI CLI Commands:

  help              Show this help message
  version           Show version information
  status            Show daemon status
  tellme <question> Ask the baby AI a question
  know <key> <val>  Store knowledge in the database
  search <query>    Search the web
  remind <min> <msg> Set a reminder
  review <id> [act] View or complete a review
  tasks             List current tasks"
}
