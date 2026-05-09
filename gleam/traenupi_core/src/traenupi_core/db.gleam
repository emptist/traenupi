import gleam/dict.{type Dict}
import gleam/option.{type Option}
import gleam/string
import gleam/javascript/promise.{type Promise}
import traenupi_core/db_types.{type Connection, type DbError, type QueryResult}

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

@external(javascript, "./db_ffi.mjs", "get_pool_stats")
pub fn get_pool_stats(conn: Connection) -> Promise(db_types.PoolStats)

@external(javascript, "./db_ffi.mjs", "health_check")
pub fn health_check(conn: Connection) -> Promise(db_types.HealthStatus)

@external(javascript, "./db_ffi.mjs", "set_project_context")
pub fn set_project_context(
  conn: Connection,
  project_id: Option(String),
) -> Promise(Result(Nil, DbError))

@external(javascript, "./db_ffi.mjs", "cwd")
pub fn get_cwd() -> Result(String, String)

@external(javascript, "./db_ffi.mjs", "run_shell_command")
pub fn run_shell_command(command: String, args: List(String)) -> Promise(Result(String, String))

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
