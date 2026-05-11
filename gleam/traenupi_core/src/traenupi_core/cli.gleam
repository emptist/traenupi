import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub type CliCommand {
  Help
  Version
  Status
  Tellme(question: String, model: Option(String))
  Know(key: String, value: String)
  Search(query: String)
  Remind(minutes: Int, message: String)
  Review(review_id: String, action: Option(String), summary: Option(String))
  Reviews
  Tasks
  Models
  Meetings
  MeetingSay(meeting_id: String, perspective: String, position: Option(String))
  Backup(project_dir: Option(String))
  Daemon(action: String)
  Commit
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
    ["reviews", ..] -> ParseOk(Reviews)
    ["tasks", ..] -> ParseOk(Tasks)
    ["models", ..] -> ParseOk(Models)
    ["meetings", ..] -> ParseOk(Meetings)
    ["meeting", "say", ..rest] -> parse_meeting_say(rest)
    ["backup", ..rest] -> parse_backup(rest)
    ["commit"] -> ParseOk(Commit)
    ["daemon", ..rest] -> parse_daemon(rest)
    [cmd, ..rest] -> ParseOk(Unknown(command: cmd, args: rest))
  }
}

fn parse_tellme(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("tellme requires a question argument")
    _ -> {
      let #(model, question_args) = extract_model_flag(args)
      case question_args {
        [] -> ParseError("tellme requires a question argument")
        _ ->
          ParseOk(Tellme(
            question: string.join(question_args, " "),
            model: model,
          ))
      }
    }
  }
}

fn extract_model_flag(args: List(String)) -> #(Option(String), List(String)) {
  case args {
    ["--model", model, ..rest] -> #(Some(model), rest)
    [arg, ..rest] -> {
      let #(model, remaining) = extract_model_flag(rest)
      #(model, [arg, ..remaining])
    }
    [] -> #(None, [])
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
    [review_id] -> ParseOk(Review(review_id: review_id, action: None, summary: None))
    [review_id, "complete", ..rest] ->
      ParseOk(Review(
        review_id: review_id,
        action: Some("complete"),
        summary: case rest {
          [] -> None
          _ -> Some(string.join(rest, " "))
        },
      ))
    [review_id, action, ..] ->
      ParseOk(Review(review_id: review_id, action: Some(action), summary: None))
  }
}

fn parse_meeting_say(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("meeting say requires a meeting_id and perspective")
    [_] -> ParseError("meeting say requires a perspective argument")
    [meeting_id, ..rest] -> {
      let #(position, perspective_args) = extract_position_flag(rest)
      case perspective_args {
        [] -> ParseError("meeting say requires a perspective argument")
        _ ->
          ParseOk(MeetingSay(
            meeting_id: meeting_id,
            perspective: string.join(perspective_args, " "),
            position: position,
          ))
      }
    }
  }
}

fn parse_backup(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseOk(Backup(project_dir: None))
    [dir] -> ParseOk(Backup(project_dir: Some(dir)))
    _ -> ParseError("backup takes at most one argument (project directory)")
  }
}

fn parse_daemon(args: List(String)) -> ParseResult {
  case args {
    [] -> ParseError("daemon requires an action: start, stop, status")
    ["start", ..] -> ParseOk(Daemon(action: "start"))
    ["stop", ..] -> ParseOk(Daemon(action: "stop"))
    ["status", ..] -> ParseOk(Daemon(action: "status"))
    [action, ..] -> ParseError("daemon: unknown action '" <> action <> "'. Use: start, stop, status")
  }
}

fn extract_position_flag(args: List(String)) -> #(Option(String), List(String)) {
  case args {
    ["--position", pos, ..rest] -> #(Some(pos), rest)
    [arg, ..rest] -> {
      let #(pos, remaining) = extract_position_flag(rest)
      #(pos, [arg, ..remaining])
    }
    [] -> #(None, [])
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
    Tellme(question, model) -> {
      case model {
        Some(m) -> "tellme --model " <> m <> " \"" <> question <> "\""
        None -> "tellme \"" <> question <> "\""
      }
    }
    Know(key, value) -> "know " <> key <> " \"" <> value <> "\""
    Search(query) -> "search \"" <> query <> "\""
    Remind(minutes, message) -> "remind " <> int_to_string(minutes) <> " \"" <> message <> "\""
    Review(review_id, action, summary) -> {
      case action {
        Some(a) -> {
          case summary {
            Some(s) -> "review " <> review_id <> " " <> a <> " \"" <> s <> "\""
            None -> "review " <> review_id <> " " <> a
          }
        }
        None -> "review " <> review_id
      }
    }
    Reviews -> "reviews"
    Tasks -> "tasks"
    Models -> "models"
    Meetings -> "meetings"
    MeetingSay(meeting_id, perspective, position) -> {
      case position {
        Some(p) ->
          "meeting say " <> meeting_id <> " --position " <> p <> " \"" <> perspective <> "\""
        None -> "meeting say " <> meeting_id <> " \"" <> perspective <> "\""
      }
    }
    Backup(project_dir) -> {
      case project_dir {
        Some(dir) -> "backup " <> dir
        None -> "backup"
      }
    }
    Daemon(action) -> "daemon " <> action
    Commit -> "commit"
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
    "help" | "version" | "status" | "tellme" | "know" | "search" | "remind" | "review" | "reviews" | "tasks" | "models" | "meetings" | "meeting" | "backup" | "daemon" -> True
    _ -> False
  }
}

pub fn get_help_text() -> String {
  "TraeNuPI CLI Commands:

  help              Show this help message
  version           Show version information
  status            Show daemon status
  tellme <question> Ask the baby AI a question
  tellme --model <m> <q> Use a specific AI model (e.g. qwen3:4b, llama3.2:3b)
  know <key> <val>  Store knowledge in the database
  search <query>    Search knowledge base
  remind <min> <msg> Set a reminder
  reviews           List pending inter-reviews
  review <id>       View an inter-review
  review <id> complete \"summary\" Complete an inter-review
  tasks             List current tasks
  models            List available AI models
  meetings          List active meetings
  meeting say <id> <perspective> Join a meeting with your opinion
  meeting say <id> --position <pos> <perspective> With position (support/oppose/neutral)
  backup [dir]      Backup current project code to database
  daemon start      Start backup daemon (auto-backup every 5 min)
  daemon stop       Stop backup daemon
  daemon status     Check daemon status"
}
