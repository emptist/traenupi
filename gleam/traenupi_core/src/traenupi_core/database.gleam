import gleam/option.{type Option, Some, None}
import gleam/result
import gleam/list
import gleam/string
import gleam/dict.{type Dict}
import traenupi_core/lively_puter.{type LivelyPuterBridge}

pub type DatabaseConfig {
  DatabaseConfig(
    host: String,
    user: String,
    database: String,
    password: Option(String),
    port: Int,
    enable_cloud_sync: Bool,
  )
}

pub type DatabaseError {
  ConnectionError(String)
  QueryError(String)
  CloudSyncError(String)
  BridgeNotInitialized
  PoolNotInitialized
}

pub type Database {
  Database(
    config: DatabaseConfig,
    pool: Option(PostgresPool),
    bridge: Option(LivelyPuterBridge),
  )
}

pub type PostgresPool

pub type QueryResult {
  QueryResult(rows: List(Dict(String, String)))
}

pub fn default_config() -> DatabaseConfig {
  DatabaseConfig(
    host: "localhost",
    user: "postgres",
    database: "psypi",
    password: None,
    port: 5432,
    enable_cloud_sync: False,
  )
}

pub fn initialize(config: DatabaseConfig) -> Result(Database, DatabaseError) {
  use pool <- result.try(
    create_postgres_pool(config)
    |> result.map_error(fn(err) { ConnectionError(err) })
  )
  
  let bridge = case config.enable_cloud_sync {
    True -> {
      case lively_puter.initialize(lively_puter.default_config()) {
        Ok(b) -> Some(b)
        Error(_) -> None
      }
    }
    False -> None
  }
  
  Ok(Database(config: config, pool: Some(pool), bridge: bridge))
}

pub fn query(
  db: Database,
  sql: String,
  params: List(String),
) -> Result(QueryResult, DatabaseError) {
  case db.pool {
    Some(pool) -> {
      postgres_query(pool, sql, params)
      |> result.map_error(fn(err) { QueryError(err) })
    }
    None -> Error(PoolNotInitialized)
  }
}

pub fn query_one(
  db: Database,
  sql: String,
  params: List(String),
) -> Result(Dict(String, String), DatabaseError) {
  use result <- result.try(query(db, sql, params))
  
  case result.rows {
    [row, ..] -> Ok(row)
    [] -> Error(QueryError("No rows returned"))
  }
}

pub fn exec(
  db: Database,
  sql: String,
  params: List(String),
) -> Result(Nil, DatabaseError) {
  case db.pool {
    Some(pool) -> {
      postgres_exec(pool, sql, params)
      |> result.map_error(fn(err) { QueryError(err) })
    }
    None -> Error(PoolNotInitialized)
  }
}

pub fn get(db: Database, key: String) -> Result(String, DatabaseError) {
  case should_use_cloud(key), db.bridge {
    True, Some(bridge) -> {
      lively_puter.db_get(bridge, key)
      |> result.map_error(fn(err) { CloudSyncError(err) })
    }
    _, _ -> {
      case db.pool {
        Some(pool) -> {
          postgres_kv_get(pool, key)
          |> result.map_error(fn(err) { QueryError(err) })
        }
        None -> Error(PoolNotInitialized)
      }
    }
  }
}

pub fn set(db: Database, key: String, value: String) -> Result(Nil, DatabaseError) {
  case should_use_cloud(key), db.bridge {
    True, Some(bridge) -> {
      lively_puter.db_set(bridge, key, value)
      |> result.map_error(fn(err) { CloudSyncError(err) })
    }
    _, _ -> {
      case db.pool {
        Some(pool) -> {
          postgres_kv_set(pool, key, value)
          |> result.map_error(fn(err) { QueryError(err) })
        }
        None -> Error(PoolNotInitialized)
      }
    }
  }
}

pub fn delete(db: Database, key: String) -> Result(Nil, DatabaseError) {
  case should_use_cloud(key), db.bridge {
    True, Some(bridge) -> {
      lively_puter.db_delete(bridge, key)
      |> result.map_error(fn(err) { CloudSyncError(err) })
    }
    _, _ -> {
      case db.pool {
        Some(pool) -> {
          postgres_kv_delete(pool, key)
          |> result.map_error(fn(err) { QueryError(err) })
        }
        None -> Error(PoolNotInitialized)
      }
    }
  }
}

pub fn list(
  db: Database,
  prefix: String,
) -> Result(List(#(String, String)), DatabaseError) {
  let mut results = []
  
  case db.bridge {
    Some(bridge) -> {
      case lively_puter.db_list(bridge, prefix) {
        Ok(items) -> {
          results = list.append(results, items)
        }
        Error(_) -> Nil
      }
    }
    None -> Nil
  }
  
  case db.pool {
    Some(pool) -> {
      case postgres_kv_list(pool, prefix) {
        Ok(items) -> {
          results = list.append(results, items)
        }
        Error(_) -> Nil
      }
    }
    None -> Nil
  }
  
  Ok(results)
}

pub fn sync_to_cloud(db: Database) -> Result(Nil, DatabaseError) {
  case db.bridge {
    Some(bridge) -> {
      case db.pool {
        Some(pool) -> {
          use items <- result.try(
            postgres_kv_list(pool, "")
            |> result.map_error(fn(err) { QueryError(err) })
          )
          
          list.try_each(items, fn(item) {
            let #(key, value) = item
            case should_use_cloud(key) {
              True -> {
                lively_puter.db_set(bridge, key, value)
                |> result.map_error(fn(err) { CloudSyncError(err) })
              }
              False -> Ok(Nil)
            }
          })
        }
        None -> Error(PoolNotInitialized)
      }
    }
    None -> Error(BridgeNotInitialized)
  }
}

pub fn sync_from_cloud(db: Database) -> Result(Nil, DatabaseError) {
  case db.bridge {
    Some(bridge) -> {
      use items <- result.try(
        lively_puter.db_list(bridge, "")
        |> result.map_error(fn(err) { CloudSyncError(err) })
      )
      
      list.try_each(items, fn(item) {
        let #(key, value) = item
        case should_use_cloud(key) {
          True -> set(db, key, value)
          False -> Ok(Nil)
        }
      })
    }
    None -> Error(BridgeNotInitialized)
  }
}

pub fn is_cloud_enabled(db: Database) -> Bool {
  option.is_some(db.bridge)
}

pub fn close(db: Database) -> Result(Nil, DatabaseError) {
  case db.pool {
    Some(pool) -> {
      close_postgres_pool(pool)
      |> result.map_error(fn(err) { ConnectionError(err) })
    }
    None -> Ok(Nil)
  }
}

fn should_use_cloud(key: String) -> Bool {
  let cloud_prefixes = ["user:", "cache:", "session:", "temp:"]
  list.any(cloud_prefixes, fn(prefix) { string.starts_with(key, prefix) })
}

@external(javascript, "../traenupi_core_ffi.mjs", "createPostgresPool")
fn create_postgres_pool(config: DatabaseConfig) -> Result(PostgresPool, String)

@external(javascript, "../traenupi_core_ffi.mjs", "postgresQuery")
fn postgres_query(
  pool: PostgresPool,
  sql: String,
  params: List(String),
) -> Result(QueryResult, String)

@external(javascript, "../traenupi_core_ffi.mjs", "postgresExec")
fn postgres_exec(
  pool: PostgresPool,
  sql: String,
  params: List(String),
) -> Result(Nil, String)

@external(javascript, "../traenupi_core_ffi.mjs", "postgresKvGet")
fn postgres_kv_get(pool: PostgresPool, key: String) -> Result(String, String)

@external(javascript, "../traenupi_core_ffi.mjs", "postgresKvSet")
fn postgres_kv_set(pool: PostgresPool, key: String, value: String) -> Result(Nil, String)

@external(javascript, "../traenupi_core_ffi.mjs", "postgresKvDelete")
fn postgres_kv_delete(pool: PostgresPool, key: String) -> Result(Nil, String)

@external(javascript, "../traenupi_core_ffi.mjs", "postgresKvList")
fn postgres_kv_list(pool: PostgresPool, prefix: String) -> Result(List(#(String, String)), String)

@external(javascript, "../traenupi_core_ffi.mjs", "closePostgresPool")
fn close_postgres_pool(pool: PostgresPool) -> Result(Nil, String)
