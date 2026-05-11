import gleam/int
import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/io
import gleam/string
import traenupi_core/code_backup

pub type DaemonConfig {
  DaemonConfig(
    interval_seconds: Int,
    project_dir: String,
    project_name: String,
  )
}

pub fn default_daemon_config(project_dir: String) -> DaemonConfig {
  DaemonConfig(
    interval_seconds: 300,
    project_dir: project_dir,
    project_name: code_backup.get_project_name(project_dir),
  )
}

pub fn run_daemon(config: DaemonConfig) -> Promise(Nil) {
  io.println("🚀 TraeNuPI Backup Daemon Started")
  io.println("📁 Project: " <> config.project_name)
  io.println("📂 Directory: " <> config.project_dir)
  io.println("⏱️  Interval: " <> int.to_string(config.interval_seconds) <> " seconds")
  io.println("")
  
  daemon_loop(config, 1)
}

fn daemon_loop(config: DaemonConfig, iteration: Int) -> Promise(Nil) {
  io.println("🔄 Backup iteration #" <> int.to_string(iteration))
  
  use stats <- await(code_backup.backup_project(
    config.project_dir,
    config.project_name,
    "traenupi-daemon",
  ))
  
  io.println("   " <> code_backup.stats_to_string(stats))
  io.println("")
  
  use _ <- await(sleep(config.interval_seconds * 1000))
  
  daemon_loop(config, iteration + 1)
}

@external(javascript, "./daemon_ffi.mjs", "sleep")
fn sleep(ms: Int) -> Promise(Nil)

pub fn write_pid_file(pid: Int) -> Promise(Result(Nil, String)) {
  let pid_content = int.to_string(pid)
  let path = expand_home("~/.traenupi/daemon.pid")
  
  use result <- await(write_file_string(path, pid_content))
  
  case result {
    Ok(_) -> resolve(Ok(Nil))
    Error(e) -> resolve(Error("Failed to write PID file: " <> e))
  }
}

pub fn read_pid_file() -> Promise(Result(Int, String)) {
  let path = expand_home("~/.traenupi/daemon.pid")
  
  use result <- await(read_file_string(path))
  
  case result {
    Ok(content) -> {
      case int.parse(string.trim(content)) {
        Ok(pid) -> resolve(Ok(pid))
        Error(_) -> resolve(Error("Invalid PID file"))
      }
    }
    Error(e) -> resolve(Error("Failed to read PID file: " <> e))
  }
}

pub fn remove_pid_file() -> Promise(Result(Nil, String)) {
  let path = expand_home("~/.traenupi/daemon.pid")
  
  use result <- await(delete_file(path))
  
  case result {
    Ok(_) -> resolve(Ok(Nil))
    Error(e) -> resolve(Error("Failed to remove PID file: " <> e))
  }
}

pub fn is_daemon_running() -> Promise(Bool) {
  use result <- await(read_pid_file())
  
  case result {
    Ok(pid) -> resolve(is_process_running(pid))
    Error(_) -> resolve(False)
  }
}

pub fn get_daemon_status() -> Promise(String) {
  use result <- await(read_pid_file())
  
  case result {
    Ok(pid) -> {
      case is_process_running(pid) {
        True -> resolve("Running (PID: " <> int.to_string(pid) <> ")")
        False -> resolve("Stopped (stale PID file)")
      }
    }
    Error(_) -> resolve("Not running")
  }
}

@external(javascript, "./daemon_ffi.mjs", "isProcessRunning")
fn is_process_running(pid: Int) -> Bool

@external(javascript, "./daemon_ffi.mjs", "expandHome")
fn expand_home(path: String) -> String

@external(javascript, "./daemon_ffi.mjs", "getPid")
pub fn get_pid() -> Int

@external(javascript, "./daemon_ffi.mjs", "readFile")
fn read_file_string(path: String) -> Promise(Result(String, String))

@external(javascript, "./daemon_ffi.mjs", "writeFile")
fn write_file_string(path: String, content: String) -> Promise(Result(Nil, String))

@external(javascript, "./daemon_ffi.mjs", "deleteFile")
fn delete_file(path: String) -> Promise(Result(Nil, String))
