import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/int
import gleam/string
import traenupi_core/db
import traenupi_core/db_types
import traenupi_core/db_connection
import traenupi_core/task.{type Task, type TaskStatus}

pub type TaskDbError {
  ConnectionError(String)
  QueryError(String)
  NotFound(String)
  DecodeError(String)
}

fn db_error_to_task_error(e: db_types.DbError) -> TaskDbError {
  case e {
    db_types.ConnectionError(msg) -> ConnectionError(msg)
    db_types.QueryError(msg) -> QueryError(msg)
    db_types.TimeoutError -> ConnectionError("Connection timeout")
    db_types.PoolExhausted -> ConnectionError("Connection pool exhausted")
    db_types.InvalidConfig(msg) -> ConnectionError(msg)
    db_types.ClosedError -> ConnectionError("Connection closed")
  }
}

pub fn get_task_by_id(task_id: String) -> Promise(Result(Task, TaskDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "SELECT * FROM tasks WHERE id = $1"
    let params = [task_id]
    
    use result <- await(db.query_one(conn, sql, params))
    
    case result {
      Ok(Some(row)) -> {
        case task.decode_task(row) {
          Ok(task) -> resolve(Ok(task))
          Error(e) -> resolve(Error(DecodeError("Failed to decode task: " <> task_error_to_string(e))))
        }
      }
      Ok(None) -> resolve(Error(NotFound("Task not found: " <> task_id)))
      Error(e) -> resolve(Error(db_error_to_task_error(e)))
    }
  }, db_error_to_task_error)
}

pub fn list_tasks_by_status(status: TaskStatus) -> Promise(Result(List(Task), TaskDbError)) {
  db_connection.with_connection(fn(conn) {
    let status_str = task.status_to_string(status)
    let sql = "SELECT * FROM tasks WHERE status = $1 ORDER BY priority DESC, created_at ASC"
    let params = [status_str]
    
    use result <- await(db.query(conn, sql, params))
    
    case result {
      Ok(query_result) -> {
        let decoded_tasks = list.filter_map(query_result.rows, fn(row) {
          task.decode_task(row)
        })
        resolve(Ok(decoded_tasks))
      }
      Error(e) -> resolve(Error(db_error_to_task_error(e)))
    }
  }, db_error_to_task_error)
}

pub fn create_task(new_task: Task) -> Promise(Result(Nil, TaskDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "
      INSERT INTO tasks (id, title, description, status, priority, result, error, retry_count, created_at, updated_at, completed_at, depends_on, blocking)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    "
    let params = [
      new_task.id,
      new_task.title,
      option.unwrap(new_task.description, ""),
      task.status_to_string(new_task.status),
      int.to_string(new_task.priority),
      option.unwrap(new_task.result, ""),
      option.unwrap(new_task.error, ""),
      int.to_string(new_task.retry_count),
      int.to_string(new_task.created_at),
      int.to_string(new_task.updated_at),
      option.unwrap(option.map(new_task.completed_at, int.to_string), ""),
      string.join(new_task.depends_on, ","),
      string.join(new_task.blocking, ","),
    ]
    
    use result <- await(db.execute(conn, sql, params))
    
    case result {
      Ok(_) -> resolve(Ok(Nil))
      Error(e) -> resolve(Error(db_error_to_task_error(e)))
    }
  }, db_error_to_task_error)
}

pub fn update_task_status(task_id: String, new_status: TaskStatus, timestamp: Int) -> Promise(Result(Nil, TaskDbError)) {
  db_connection.with_connection(fn(conn) {
    let status_str = task.status_to_string(new_status)
    let sql = "UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3"
    let params = [status_str, int.to_string(timestamp), task_id]
    
    use result <- await(db.execute(conn, sql, params))
    
    case result {
      Ok(0) -> resolve(Error(NotFound("Task not found: " <> task_id)))
      Ok(_) -> resolve(Ok(Nil))
      Error(e) -> resolve(Error(db_error_to_task_error(e)))
    }
  }, db_error_to_task_error)
}

fn task_error_to_string(e: task.TaskError) -> String {
  case e {
    task.TaskNotFound(id) -> "Task not found: " <> id
    task.InvalidStatus(s) -> "Invalid status: " <> s
    task.DatabaseError(s) -> "Database error: " <> s
    task.DependencyNotMet(s) -> "Dependency not met: " <> s
    task.ValidationError(s) -> "Validation error: " <> s
  }
}
