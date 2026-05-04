// node_pg: PostgreSQL client library for Gleam (JavaScript target)
// Wraps the node-postgres (pg) library with type-safe Gleam interfaces
//
// Example usage:
//   import node_pg
//   import gleam/javascript/promise
//   import gleam/option.{Some}
//
//   pub fn main() {
//     let config = node_pg.create_config(
//       user: Some("postgres"),
//       password: Some("secret"),
//       host: Some("localhost"),
//       port: Some(5432),
//       database: Some("mydb")
//     )
//
//     let client = node_pg.new_client(config)
//
//     promise.await(node_pg.connect(client), fn(result) {
//       case result {
//         Ok(_) -> {
//           promise.await(node_pg.query(client, "SELECT * FROM users", []), fn(query_result) {
//             case query_result {
//               Ok(result) -> {
//                 // Process result.rows
//                 promise.await(node_pg.end(client), fn(_) { promise.resolve(Nil) })
//               }
//               Error(error) -> panic as error.message
//             }
//           })
//         }
//         Error(error) -> panic as error.message
//       }
//     })
//   }

import gleam/dynamic.{type Dynamic}
import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option}

// ============================================================================
// Core Types
// ============================================================================

/// PostgreSQL connection configuration
/// All fields are optional; node-postgres uses environment variables as defaults
pub type Config {
  Config(
    user: Option(String),
    password: Option(String),
    host: Option(String),
    port: Option(Int),
    database: Option(String),
    connection_string: Option(String),
    ssl: Option(Dynamic),
    types: Option(Dynamic),
    statement_timeout: Option(Int),
    query_timeout: Option(Int),
    lock_timeout: Option(Int),
    application_name: Option(String),
    connection_timeout_millis: Option(Int),
    keep_alive_initial_delay_millis: Option(Int),
    idle_in_transaction_session_timeout: Option(Int),
    client_encoding: Option(String),
    fallback_application_name: Option(String),
    options: Option(String),
  )
}

/// Opaque type wrapping a node-postgres Client instance
/// Provides type safety and encapsulates internal implementation
pub opaque type Client {
  Client(inner: Dynamic)
}

/// Structured database error information
/// Maps PostgreSQL and node-postgres errors to Gleam Result types
pub type DatabaseError {
  DatabaseError(
    message: String,
    code: Option(String),
    detail: Option(String),
    hint: Option(String),
  )
}

/// SQL query execution result
/// Rows are provided as Dynamic type for user decoding with gleam/dynamic
pub type QueryResult {
  QueryResult(
    rows: List(Dynamic),
    row_count: Option(Int),
    command: String,
    fields: Option(List(FieldInfo)),
  )
}

/// Field metadata from query results
pub type FieldInfo {
  FieldInfo(name: String, table_id: Int, column_id: Int, data_type_id: Int)
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/// Create an empty PostgreSQL configuration
/// All fields are set to None; node-postgres will use environment variables as defaults
/// This is useful when you want to rely entirely on environment configuration
pub fn empty_config() -> Config {
  Config(
    user: option.None,
    password: option.None,
    host: option.None,
    port: option.None,
    database: option.None,
    connection_string: option.None,
    ssl: option.None,
    types: option.None,
    statement_timeout: option.None,
    query_timeout: option.None,
    lock_timeout: option.None,
    application_name: option.None,
    connection_timeout_millis: option.None,
    keep_alive_initial_delay_millis: option.None,
    idle_in_transaction_session_timeout: option.None,
    client_encoding: option.None,
    fallback_application_name: option.None,
    options: option.None,
  )
}

/// Create a PostgreSQL configuration from a connection string
/// Connection string format: postgresql://[user[:password]@][host][:port][/database][?options]
pub fn connection_string_config(connection_string: String) -> Config {
  Config(..empty_config(), connection_string: option.Some(connection_string))
}

/// Create a new PostgreSQL configuration from basic connection parameters
/// All parameters are optional; unspecified fields will be set to None
/// node-postgres will use environment variables as defaults for None values
pub fn create_config(
  user: Option(String),
  password: Option(String),
  host: Option(String),
  port: Option(Int),
  database: Option(String),
) -> Config {
  Config(
    ..empty_config(),
    user: user,
    password: password,
    host: host,
    port: port,
    database: database,
  )
}

// ============================================================================
// Client Management Functions
// ============================================================================

/// Create a new PostgreSQL client instance from configuration
/// The client is not connected; call connect() to establish connection
pub fn new_client(config: Config) -> Client {
  Client(inner: create_client_internal(config))
}

/// Internal FFI function to create the underlying pg.Client instance
@external(javascript, "./ffi.mjs", "createClientInternal")
fn create_client_internal(config: Config) -> Dynamic

/// Establish a connection to the PostgreSQL database
/// Returns a Promise that resolves to Result(Nil, DatabaseError)
@external(javascript, "./ffi.mjs", "connectClient")
pub fn connect(client: Client) -> Promise(Result(Nil, DatabaseError))

/// Close the database connection
/// Returns a Promise that resolves to Result(Nil, DatabaseError)
@external(javascript, "./ffi.mjs", "endClient")
pub fn end(client: Client) -> Promise(Result(Nil, DatabaseError))

// ============================================================================
// Query Execution Functions
// ============================================================================

/// Execute a SQL query with optional parameters
/// Uses parameterized queries to prevent SQL injection
/// Parameters should use $1, $2, etc. placeholders in the SQL string
@external(javascript, "./ffi.mjs", "executeQuery")
pub fn query(
  client: Client,
  sql: String,
  parameters: List(Dynamic),
) -> Promise(Result(QueryResult, DatabaseError))

// ============================================================================
// Placeholder main function
// ============================================================================

pub fn main() -> Nil {
  Nil
}
