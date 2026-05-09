import gleam/option.{type Option, None, Some}
import gleam/dict.{type Dict}
import gleam/int
import gleam/string
import gleam/result
import traenupi_core/time_utils

pub type TaskStatus {
  Pending
  Running
  Completed
  Failed
}

pub type Task {
  Task(
    id: String,
    title: String,
    description: Option(String),
    status: TaskStatus,
    priority: Int,
    result: Option(String),
    error: Option(String),
    retry_count: Int,
    created_at: Int,
    updated_at: Int,
    completed_at: Option(Int),
    depends_on: List(String),
    blocking: List(String),
  )
}

pub type TaskError {
  TaskNotFound(String)
  InvalidStatus(String)
  DatabaseError(String)
  DependencyNotMet(String)
  ValidationError(String)
}

pub fn new_task(title: String, priority: Int) -> Task {
  Task(
    id: generate_id(),
    title: title,
    description: None,
    status: Pending,
    priority: priority,
    result: None,
    error: None,
    retry_count: 0,
    created_at: now(),
    updated_at: now(),
    completed_at: None,
    depends_on: [],
    blocking: [],
  )
}

pub fn with_description(task: Task, description: String) -> Task {
  Task(..task, description: Some(description))
}

pub fn with_dependencies(task: Task, depends_on: List(String)) -> Task {
  Task(..task, depends_on: depends_on)
}

pub fn start(task: Task) -> Result(Task, TaskError) {
  case task.status {
    Pending -> Ok(Task(..task, status: Running, updated_at: now()))
    Running -> Error(InvalidStatus("Task is already running"))
    Completed -> Error(InvalidStatus("Task is already completed"))
    Failed -> Ok(Task(..task, status: Running, updated_at: now(), retry_count: task.retry_count + 1))
  }
}

pub fn complete(task: Task, result: String) -> Task {
  Task(
    ..task,
    status: Completed,
    result: Some(result),
    updated_at: now(),
    completed_at: Some(now()),
  )
}

pub fn fail(task: Task, error: String) -> Task {
  Task(
    ..task,
    status: Failed,
    error: Some(error),
    updated_at: now(),
  )
}

pub fn is_pending(task: Task) -> Bool {
  task.status == Pending
}

pub fn is_running(task: Task) -> Bool {
  task.status == Running
}

pub fn is_completed(task: Task) -> Bool {
  task.status == Completed
}

pub fn is_failed(task: Task) -> Bool {
  task.status == Failed
}

pub fn can_start(task: Task) -> Bool {
  task.status == Pending || task.status == Failed
}

pub fn status_to_string(status: TaskStatus) -> String {
  case status {
    Pending -> "PENDING"
    Running -> "RUNNING"
    Completed -> "COMPLETED"
    Failed -> "FAILED"
  }
}

pub fn status_from_string(s: String) -> Result(TaskStatus, TaskError) {
  case s {
    "PENDING" -> Ok(Pending)
    "RUNNING" -> Ok(Running)
    "COMPLETED" -> Ok(Completed)
    "FAILED" -> Ok(Failed)
    _ -> Error(InvalidStatus("Unknown status: " <> s))
  }
}

pub fn encode_task(task: Task) -> Dict(String, String) {
  dict.from_list([
    #("id", task.id),
    #("title", task.title),
    #("description", option.unwrap(task.description, "")),
    #("status", status_to_string(task.status)),
    #("priority", int.to_string(task.priority)),
    #("result", option.unwrap(task.result, "")),
    #("error", option.unwrap(task.error, "")),
    #("retry_count", int.to_string(task.retry_count)),
    #("created_at", int.to_string(task.created_at)),
    #("updated_at", int.to_string(task.updated_at)),
    #("completed_at", option.unwrap(option.map(task.completed_at, int.to_string), "")),
    #("depends_on", string.join(task.depends_on, ",")),
    #("blocking", string.join(task.blocking, ",")),
  ])
}

pub fn decode_task(row: Dict(String, String)) -> Result(Task, TaskError) {
  use id <- result.try(dict_get(row, "id"))
  use title <- result.try(dict_get(row, "title"))
  use status_str <- result.try(dict_get(row, "status"))
  use status <- result.try(status_from_string(status_str))
  use priority_str <- result.try(dict_get(row, "priority"))
  use priority <- result.try(parse_int(priority_str))
  
  let description = dict_get_opt(row, "description")
  let result_val = dict_get_opt(row, "result")
  let error = dict_get_opt(row, "error")
  let retry_count = dict_get_int(row, "retry_count", 0)
  let created_at = dict_get_int(row, "created_at", now())
  let updated_at = dict_get_int(row, "updated_at", now())
  let completed_at = dict_get_int_opt(row, "completed_at")
  let depends_on = dict_get_list(row, "depends_on")
  let blocking = dict_get_list(row, "blocking")
  
  Ok(Task(
    id: id,
    title: title,
    description: description,
    status: status,
    priority: priority,
    result: result_val,
    error: error,
    retry_count: retry_count,
    created_at: created_at,
    updated_at: updated_at,
    completed_at: completed_at,
    depends_on: depends_on,
    blocking: blocking,
  ))
}

fn dict_get(dict: Dict(String, String), key: String) -> Result(String, TaskError) {
  case dict.get(dict, key) {
    Ok(value) if value != "" -> Ok(value)
    _ -> Error(ValidationError("Missing field: " <> key))
  }
}

fn dict_get_opt(dict: Dict(String, String), key: String) -> Option(String) {
  case dict.get(dict, key) {
    Ok(value) if value != "" -> Some(value)
    _ -> None
  }
}

fn dict_get_int(dict: Dict(String, String), key: String, default: Int) -> Int {
  case dict.get(dict, key) {
    Ok(value) -> {
      case int.parse(value) {
        Ok(n) -> n
        Error(_) -> default
      }
    }
    Error(_) -> default
  }
}

fn dict_get_int_opt(dict: Dict(String, String), key: String) -> Option(Int) {
  case dict.get(dict, key) {
    Ok(value) if value != "" -> {
      case int.parse(value) {
        Ok(n) -> Some(n)
        Error(_) -> None
      }
    }
    _ -> None
  }
}

fn dict_get_list(dict: Dict(String, String), key: String) -> List(String) {
  case dict.get(dict, key) {
    Ok(value) if value != "" -> string.split(value, ",")
    _ -> []
  }
}

fn parse_int(s: String) -> Result(Int, TaskError) {
  case int.parse(s) {
    Ok(n) -> Ok(n)
    Error(_) -> Error(ValidationError("Invalid integer: " <> s))
  }
}

fn generate_id() -> String {
  time_utils.generate_id("task")
}

fn now() -> Int {
  time_utils.now()
}
