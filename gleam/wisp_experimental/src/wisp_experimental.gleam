import gleam/erlang/process
import gleam/io
import gleam/json
import wisp
import wisp/wisp_mist
import mist

pub fn main() {
  io.println("=== Wisp Advanced Features Demo ===")
  
  let secret_key_base = wisp.random_string(64)
  
  let assert Ok(_) =
    wisp_mist.handler(handle_request, secret_key_base)
    |> mist.new
    |> mist.port(8080)
    |> mist.start

  io.println("✓ Wisp server started on port 8080")
  io.println("  Endpoints:")
  io.println("    - GET /health  - Health check")
  io.println("    - GET /status  - Server status")
  io.println("    - GET /api/info - Wisp info")
  io.println("    - GET /middleware/demo - Middleware demo")
  io.println("    - GET /error/demo - Error handling demo")

  process.sleep_forever()
}

fn handle_request(req: wisp.Request) -> wisp.Response {
  use <- wisp.log_request(req)
  use <- wisp.rescue_crashes

  case wisp.path_segments(req) {
    ["health"] -> health_check()
    ["status"] -> server_status()
    ["api", "info"] -> wisp_info()
    ["middleware", "demo"] -> middleware_demo()
    ["error", "demo"] -> error_demo()
    _ -> wisp.not_found()
  }
}

fn health_check() -> wisp.Response {
  json.object([
    #("status", json.string("ok")),
    #("framework", json.string("Wisp")),
    #("runtime", json.string("Erlang/OTP")),
  ])
  |> json.to_string
  |> wisp.json_response(200)
}

fn server_status() -> wisp.Response {
  json.object([
    #("status", json.string("running")),
    #("framework", json.string("Wisp")),
    #("version", json.string("2.2.2")),
    #("target", json.string("Erlang")),
  ])
  |> json.to_string
  |> wisp.json_response(200)
}

fn wisp_info() -> wisp.Response {
  json.object([
    #("name", json.string("Wisp")),
    #("description", json.string("Practical web framework for Gleam")),
    #("features", json.array([
      "Built-in middleware",
      "Crash rescue",
      "Request logging",
      "Static file serving",
      "Session management",
      "HTML escaping",
      "WebSocket support",
    ], json.string)),
    #("strengths", json.array([
      "Zero FFI needed",
      "Erlang fault tolerance",
      "Hot code reloading",
      "OTP supervision",
      "Production ready",
    ], json.string)),
  ])
  |> json.to_string
  |> wisp.json_response(200)
}

fn middleware_demo() -> wisp.Response {
  json.object([
    #("message", json.string("This endpoint demonstrates middleware")),
    #("middleware_passed", json.bool(True)),
    #("note", json.string("Request was logged and crash rescue is active")),
  ])
  |> json.to_string
  |> wisp.json_response(200)
}

fn error_demo() -> wisp.Response {
  let _ = panic as "Intentional error for demonstration"
  
  json.object([
    #("message", json.string("This should never be reached")),
  ])
  |> json.to_string
  |> wisp.json_response(200)
}
