import gleam/string
import gleam/list
import gleam/javascript/promise.{type Promise}

pub type Context {
  Context(working_dir: String, project: String, git_branch: String)
}

@external(javascript, "./db_ffi.mjs", "cwd")
pub fn get_cwd() -> Result(String, String)

@external(javascript, "./db_ffi.mjs", "run_shell_command")
pub fn run_shell(command: String, args: List(String)) -> Promise(Result(String, String))

@external(javascript, "./reflection_ffi.mjs", "now")
pub fn get_timestamp() -> Int

pub fn get_working_dir() -> String {
  case get_cwd() {
    Ok(dir) -> dir
    Error(_) -> "unknown"
  }
}

pub fn get_project_name() -> String {
  let dir = get_working_dir()
  case string.split(dir, "/") {
    parts -> {
      case list.reverse(parts) {
        [name, ..] -> name
        _ -> "unknown"
      }
    }
  }
}

pub fn get_time_greeting() -> String {
  let ts = get_timestamp()
  let hour = ts / 3600 % 24
  case hour {
    n if n < 6 -> "Good night"
    n if n < 12 -> "Good morning"
    n if n < 18 -> "Good afternoon"
    _ -> "Good evening"
  }
}
