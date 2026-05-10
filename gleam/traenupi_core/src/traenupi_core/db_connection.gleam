import gleam/option.{None, Some}
import gleam/int
import gleam/javascript/promise.{type Promise, await, resolve}
import traenupi_core/db_types.{type Connection, type DbConfig, type DbError, DbConfig}

pub fn default_config() -> DbConfig {
  DbConfig(
    host: "localhost",
    port: 5432,
    database: "psypi",
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
  let database = option.unwrap(get_env("DB_NAME"), "psypi")
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

@external(javascript, "./db_ffi.mjs", "close")
pub fn close(conn: Connection) -> Promise(Result(Nil, DbError))

@external(javascript, "./db_ffi.mjs", "get_env")
fn get_env(key: String) -> option.Option(String)

pub fn with_connection(
  callback: fn(Connection) -> Promise(Result(a, e)),
  error_mapper: fn(DbError) -> e,
) -> Promise(Result(a, e)) {
  use conn_result <- await(connect(default_config()))
  
  case conn_result {
    Error(e) -> resolve(Error(error_mapper(e)))
    Ok(conn) -> {
      use result <- await(callback(conn))
      let _ = close(conn)
      resolve(result)
    }
  }
}
