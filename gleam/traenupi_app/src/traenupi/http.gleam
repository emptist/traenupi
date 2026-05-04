//// TraeNuPI HTTP Server
////
//// A web server for TraeNuPI daemon operations using Glen framework.
//// Provides health check, status, and API endpoints.

import gleam/io
import gleam/int
import gleam/javascript/promise.{type Promise}
import gleam/json
import glen
import glen/status
import node_pg

pub type AppState {
  AppState(db_client: node_pg.Client, db_connected: Bool)
}

@external(javascript, "./http_ffi.mjs", "createServer")
fn create_server_node(port: Int, handler: fn(glen.JsRequest) -> Promise(glen.JsResponse)) -> Nil

pub fn start_server(port: Int, db_config: node_pg.Config) -> Promise(Nil) {
  let client = node_pg.new_client(db_config)
  
  io.println("Starting TraeNuPI HTTP server on port " <> int.to_string(port))
  io.println("Connecting to database...")
  
  promise.await(node_pg.connect(client), fn(result) {
    case result {
      Ok(_) -> {
        io.println("✓ Database connected")
        let state = AppState(db_client: client, db_connected: True)
        
        io.println("✓ HTTP server starting on port " <> int.to_string(port))
        io.println("  Endpoints:")
        io.println("    - GET /health  - Health check")
        io.println("    - GET /status  - Server status")
        io.println("    - GET /api/tasks - List tasks")
        
        create_server_node(port, fn(req) { handle_request_js(req, state) })
        promise.resolve(Nil)
      }
      Error(error) -> {
        io.println("✗ Database connection failed: " <> error.message)
        promise.resolve(Nil)
      }
    }
  })
}

fn handle_request_js(req: glen.JsRequest, state: AppState) -> Promise(glen.JsResponse) {
  let gleam_req = glen.convert_request(req)
  let response = handle_request(gleam_req, state)
  promise.map(response, fn(res) { glen.convert_response(res) })
}

fn handle_request(req: glen.Request, state: AppState) -> Promise(glen.Response) {
  case glen.path_segments(req) {
    ["health"] -> health_check()
    ["status"] -> server_status(state)
    ["api", "tasks"] -> api_tasks(state)
    _ -> not_found()
  }
}

fn health_check() -> Promise(glen.Response) {
  json.object([
    #("status", json.string("ok")),
    #("service", json.string("TraeNuPI")),
    #("timestamp", json.string(get_timestamp())),
    #("framework", json.string("Glen")),
  ])
  |> json.to_string
  |> glen.json(status.ok)
  |> promise.resolve
}

fn server_status(state: AppState) -> Promise(glen.Response) {
  let db_status = case state.db_connected {
    True -> "connected"
    False -> "disconnected"
  }
  
  json.object([
    #("status", json.string("running")),
    #("database", json.string(db_status)),
    #("version", json.string("1.0.0")),
    #("client", json.string("node_pg")),
    #("framework", json.string("Glen")),
  ])
  |> json.to_string
  |> glen.json(status.ok)
  |> promise.resolve
}

fn api_tasks(_state: AppState) -> Promise(glen.Response) {
  json.object([
    #("tasks", json.array([], fn(_) {
      json.object([
        #("id", json.string("1")),
        #("title", json.string("Sample task")),
        #("status", json.string("pending")),
      ])
    })),
  ])
  |> json.to_string
  |> glen.json(status.ok)
  |> promise.resolve
}

fn not_found() -> Promise(glen.Response) {
  json.object([
    #("error", json.string("Not found")),
  ])
  |> json.to_string
  |> glen.json(status.not_found)
  |> promise.resolve
}

fn get_timestamp() -> String {
  "2026-05-04T00:00:00Z"
}
