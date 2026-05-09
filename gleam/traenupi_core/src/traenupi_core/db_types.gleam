import gleam/dict.{type Dict}
import gleam/option.{type Option}

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
