import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/int
import gleam/string
import gleam/javascript/promise.{type Promise, await, resolve}

pub type DbConfig {
  DbConfig(
    host: String,
    port: Int,
    database: String,
    user: String,
    password: Option(String),
    max_connections: Int,
    idle_timeout_ms: Int,
    connection_timeout_ms: Int,
  )
}

pub type Connection

pub type DbError {
  ConnectionError(String)
  QueryError(String)
  TimeoutError
  PoolExhausted
  InvalidConfig(String)
  ClosedError
}

pub type QueryResult {
  QueryResult(
    rows: List(Dict(String, String)),
    row_count: Int,
  )
}

pub type PoolStats {
  PoolStats(
    total_connections: Int,
    idle_connections: Int,
    active_connections: Int,
    waiting_clients: Int,
  )
}

pub type HealthStatus {
  Healthy(latency_ms: Int)
  Unhealthy(error: String)
}

pub fn default_config() -> DbConfig {
  DbConfig(
    host: "localhost",
    port: 5432,
    database: "traenupi",
    user: "postgres",
    password: None,
    max_connections: 10,
    idle_timeout_ms: 30000,
    connection_timeout_ms: 5000,
  )
}

pub fn config_with_password(config: DbConfig, password: String) -> DbConfig {
  DbConfig(..config, password: Some(password))
}

pub fn config_from_env() -> Result(DbConfig, DbError) {
  let host = option.unwrap(get_env("DB_HOST"), "localhost")
  let port = case get_env("DB_PORT") {
    Some(p) -> {
      case int.parse(p) {
        Ok(n) -> n
        Error(_) -> 5432
      }
    }
    None -> 5432
  }
  let database = option.unwrap(get_env("DB_NAME"), "traenupi")
  let user = option.unwrap(get_env("DB_USER"), "postgres")
  let password = get_env("DB_PASSWORD")
  let max_conn = case get_env("DB_MAX_CONNECTIONS") {
    Some(m) -> {
      case int.parse(m) {
        Ok(n) -> n
        Error(_) -> 10
      }
    }
    None -> 10
  }
  
  Ok(DbConfig(
    host: host,
    port: port,
    database: database,
    user: user,
    password: password,
    max_connections: max_conn,
    idle_timeout_ms: 30000,
    connection_timeout_ms: 5000,
  ))
}

@external(javascript, "./db_ffi.mjs", "connect")
pub fn connect(config: DbConfig) -> Promise(Result(Connection, DbError))

@external(javascript, "./db_ffi.mjs", "query")
pub fn query(
  conn: Connection,
  sql: String,
  params: List(String),
) -> Promise(Result(QueryResult, DbError))

@external(javascript, "./db_ffi.mjs", "query_one")
pub fn query_one(
  conn: Connection,
  sql: String,
  params: List(String),
) -> Promise(Result(Option(Dict(String, String)), DbError))

@external(javascript, "./db_ffi.mjs", "execute")
pub fn execute(
  conn: Connection,
  sql: String,
  params: List(String),
) -> Promise(Result(Int, DbError))

@external(javascript, "./db_ffi.mjs", "close")
pub fn close(conn: Connection) -> Promise(Result(Nil, DbError))

@external(javascript, "./db_ffi.mjs", "get_pool_stats")
pub fn get_pool_stats(conn: Connection) -> Promise(PoolStats)

@external(javascript, "./db_ffi.mjs", "health_check")
pub fn health_check(conn: Connection) -> Promise(HealthStatus)

@external(javascript, "./db_ffi.mjs", "set_project_context")
pub fn set_project_context(
  conn: Connection,
  project_id: Option(String),
) -> Promise(Result(Nil, DbError))

@external(javascript, "./db_ffi.mjs", "get_env")
fn get_env(key: String) -> Option(String)

pub fn select_all(conn: Connection, table: String) -> Promise(Result(QueryResult, DbError)) {
  let sql = "SELECT * FROM " <> table
  query(conn, sql, [])
}

pub fn select_by_id(
  conn: Connection,
  table: String,
  id: String,
) -> Promise(Result(Option(Dict(String, String)), DbError)) {
  let sql = "SELECT * FROM " <> table <> " WHERE id = $1"
  query_one(conn, sql, [id])
}

pub fn insert(
  conn: Connection,
  table: String,
  columns: List(String),
  values: List(String),
) -> Promise(Result(Int, DbError)) {
  let cols = string.join(columns, ", ")
  let placeholders = 
    range_list(1, list.length(columns))
    |> list.map(fn(i) { "$" <> int.to_string(i) })
    |> string.join(", ")
  let sql = "INSERT INTO " <> table <> " (" <> cols <> ") VALUES (" <> placeholders <> ")"
  execute(conn, sql, values)
}

pub fn update(
  conn: Connection,
  table: String,
  id: String,
  columns: List(String),
  values: List(String),
) -> Promise(Result(Int, DbError)) {
  let sets = 
    list.index_map(columns, fn(col, idx) {
      col <> " = $" <> int.to_string(idx + 1)
    })
    |> string.join(", ")
  let sql = "UPDATE " <> table <> " SET " <> sets <> " WHERE id = $" <> int.to_string(list.length(columns) + 1)
  execute(conn, sql, list.append(values, [id]))
}

pub fn delete(
  conn: Connection,
  table: String,
  id: String,
) -> Promise(Result(Int, DbError)) {
  let sql = "DELETE FROM " <> table <> " WHERE id = $1"
  execute(conn, sql, [id])
}

pub fn count(conn: Connection, table: String) -> Promise(Result(Int, DbError)) {
  let sql = "SELECT COUNT(*) as count FROM " <> table
  use result <- await(query_one(conn, sql, []))
  
  case result {
    Ok(Some(row)) -> {
      case dict.get(row, "count") {
        Ok(count_str) -> {
          case int.parse(count_str) {
            Ok(n) -> resolve(Ok(n))
            Error(_) -> resolve(Error(QueryError("Invalid count value")))
          }
        }
        Error(_) -> resolve(Error(QueryError("Missing count field")))
      }
    }
    Ok(None) -> resolve(Ok(0))
    Error(e) -> resolve(Error(e))
  }
}

pub fn exists(conn: Connection, table: String, id: String) -> Promise(Result(Bool, DbError)) {
  let sql = "SELECT 1 FROM " <> table <> " WHERE id = $1 LIMIT 1"
  use result <- await(query_one(conn, sql, [id]))
  
  case result {
    Ok(Some(_)) -> resolve(Ok(True))
    Ok(None) -> resolve(Ok(False))
    Error(e) -> resolve(Error(e))
  }
}

pub fn safe_query(
  conn: Connection,
  sql: String,
  params: List(String),
) -> Promise(Result(QueryResult, DbError)) {
  let sanitized = sanitize_sql(sql)
  query(conn, sanitized, params)
}

fn sanitize_sql(sql: String) -> String {
  sql
  |> string.trim
  |> fn(s) {
    case string.length(s) > 1000 {
      True -> string.slice(s, 0, 1000) <> "..."
      False -> s
    }
  }
}

pub fn build_where_clause(conditions: List(#(String, String))) -> String {
  case conditions {
    [] -> ""
    _ -> {
      let clauses = 
        conditions
        |> list.index_map(fn(cond, idx) {
          let #(col, _val) = cond
          col <> " = $" <> int.to_string(idx + 1)
        })
        |> string.join(" AND ")
      " WHERE " <> clauses
    }
  }
}

pub fn build_order_clause(columns: List(String), direction: String) -> String {
  case columns {
    [] -> ""
    _ -> {
      let cols = string.join(columns, ", ")
      " ORDER BY " <> cols <> " " <> direction
    }
  }
}

pub fn build_limit_clause(limit: Int) -> String {
  " LIMIT " <> int.to_string(limit)
}

pub fn build_offset_clause(offset: Int) -> String {
  " OFFSET " <> int.to_string(offset)
}

fn range_list(start: Int, count: Int) -> List(Int) {
  case count {
    0 -> []
    n -> [start, ..range_list(start + 1, n - 1)]
  }
}
