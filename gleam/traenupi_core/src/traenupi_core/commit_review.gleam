import gleam/io
import gleam/javascript/array
import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/list
import gleam/string

pub type ReviewStatus {
  Approved
  Rejected(reasons: List(String))
  NoChanges
}

pub fn review_changes() -> Promise(ReviewStatus) {
  use status <- await(check_git_status())

  io.println("Git status: " <> status)

  case status {
    "clean" -> resolve(NoChanges)
    _ -> {
      use files <- await(get_changed_files())

      io.println("Changed files: " <> string.inspect(files))

      use violations <- await(check_all_files(files))

      case violations {
        [] -> resolve(Approved)
        _ -> resolve(Rejected(violations))
      }
    }
  }
}

pub fn force_commit() -> Promise(Nil) {
  use review <- await(review_changes())

  case review {
    Approved -> {
      io.println("✅ Review passed! Proceeding with commit...")
      commit_changes()
    }
    Rejected(reasons) -> {
      io.println("❌ Review failed! Cannot commit.")
      io.println("Violations:")
      list.each(reasons, fn(r) { io.println("  - " <> r) })
      resolve(Nil)
    }
    NoChanges -> {
      io.println("ℹ️  No changes to commit.")
      resolve(Nil)
    }
  }
}

fn check_all_files(files: List(String)) -> Promise(List(String)) {
  case files {
    [] -> resolve([])
    [file, ..rest] -> {
      io.println("Checking file: " <> string.inspect(file))

      use violation <- await(check_file_lines(file))
      use other <- await(check_all_files(rest))
      case violation {
        "" -> resolve(other)
        _ -> resolve([violation, ..other])
      }
    }
  }
}

fn check_file_lines(file: String) -> Promise(String) {
  use count <- await(count_file_lines(file))

  let is_gleam = string.ends_with(file, ".gleam")

  case is_gleam && count > 100 {
    True -> resolve(file <> ": " <> int_to_string(count) <> " lines (max 100)")
    False -> resolve("")
  }
}

@external(javascript, "./git_ffi.mjs", "checkGitStatus")
fn check_git_status() -> Promise(String)

@external(javascript, "./git_ffi.mjs", "getChangedFiles")
fn get_changed_files_raw() -> Promise(array.Array(String))

fn get_changed_files() -> Promise(List(String)) {
  use files_array <- await(get_changed_files_raw())
  resolve(array.to_list(files_array))
}

@external(javascript, "./git_ffi.mjs", "countFileLines")
fn count_file_lines(file: String) -> Promise(Int)

@external(javascript, "./git_ffi.mjs", "commitChanges")
fn commit_changes() -> Promise(Nil)

@external(javascript, "./git_ffi.mjs", "intToString")
fn int_to_string(i: Int) -> String
