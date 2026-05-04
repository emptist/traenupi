//// TraeNuPI HTTP Server
////
//// A minimal HTTP server for TraeNuPI daemon operations.
//// Provides health check, status, and API endpoints using minimal FFI.

import gleam/io
import gleam/int
import gleam/javascript/promise
import gleam/json
import node_pg

pub type Server

pub type Request {
  Request(method: String, path: String, headers: List(#(String, String)))
}

pub type Response {
  Response(status: Int, headers: List(#(String, String)), body: String)
}

pub type AppState {
  AppState(db_client: node_pg.Client, db_connected: Bool)
}

@external(javascript, "./http_ffi.mjs", "createServer")
fn create_server_internal(handler: fn(Request) -> fn(Response) -> Nil) -> Server

@external(javascript, "./http_ffi.mjs", "listen")
fn listen_internal(server: Server, port: Int, callback: fn() -> Nil) -> Nil

@external(javascript, "./http_ffi.mjs", "writeResponse")
fn write_response_internal(
  res: Response,
  status: Int,
  headers: List(#(String, String)),
  body: String,
) -> Nil

pub fn start_server(port: Int, db_config: node_pg.Config) {
  let client = node_pg.new_client(db_config)
  
  io.println("Starting TraeNuPI HTTP server on port " <> int.to_string(port))
  io.println("Connecting to database...")
  
  promise.await(node_pg.connect(client), fn(result) {
    case result {
      Ok(_) -> {
        io.println("✓ Database connected")
        let state = AppState(db_client: client, db_connected: True)
        
        let handler = fn(req: Request) {
          let response = handle_request(req, state)
          fn(res: Response) {
            write_response_internal(res, response.status, response.headers, response.body)
          }
        }
        
        let server = create_server_internal(handler)
        let callback = fn() {
          io.println("✓ HTTP server started on port " <> int.to_string(port))
          io.println("  Endpoints:")
          io.println("    - GET /health  - Health check")
          io.println("    - GET /status  - Server status")
          io.println("    - GET /api/tasks - List tasks")
        }
        
        listen_internal(server, port, callback)
        promise.resolve(Nil)
      }
      Error(error) -> {
        io.println("✗ Database connection failed: " <> error.message)
        promise.resolve(Nil)
      }
    }
  })
}

fn handle_request(req: Request, state: AppState) -> Response {
  case req.path {
    "/health" -> health_check()
    "/status" -> server_status(state)
    "/api/tasks" -> api_tasks(state)
    _ -> not_found()
  }
}

fn health_check() -> Response {
  Response(
    status: 200,
    headers: [#("content-type", "application/json")],
    body: json.to_string(json.object([
      #("status", json.string("ok")),
      #("service", json.string("TraeNuPI")),
      #("timestamp", json.string(get_timestamp())),
    ])),
  )
}

fn server_status(state: AppState) -> Response {
  let db_status = case state.db_connected {
    True -> "connected"
    False -> "disconnected"
  }
  
  Response(
    status: 200,
    headers: [#("content-type", "application/json")],
    body: json.to_string(json.object([
      #("status", json.string("running")),
      #("database", json.string(db_status)),
      #("version", json.string("1.0.0")),
      #("client", json.string("node_pg")),
    ])),
  )
}

fn api_tasks(_state: AppState) -> Response {
  Response(
    status: 200,
    headers: [#("content-type", "application/json")],
    body: json.to_string(json.object([
      #("tasks", json.array([], fn(_) {
        json.object([
          #("id", json.string("1")),
          #("title", json.string("Sample task")),
          #("status", json.string("pending")),
        ])
      })),
    ])),
  )
}

fn not_found() -> Response {
  Response(
    status: 404,
    headers: [#("content-type", "application/json")],
    body: json.to_string(json.object([
      #("error", json.string("Not found")),
    ])),
  )
}

fn get_timestamp() -> String {
  "2026-05-04T00:00:00Z"
}
