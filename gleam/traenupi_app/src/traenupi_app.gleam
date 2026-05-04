//// TraeNuPI HTTP Server Entry Point
////
//// Starts the TraeNuPI HTTP server with database connectivity.

import gleam/io
import gleam/option.{Some}
import traenupi/http
import node_pg

pub fn main() {
  io.println("=== TraeNuPI HTTP Server ===")
  io.println("")
  
  let db_config = node_pg.create_config(
    Some("postgres"),
    Some("postgres"),
    Some("localhost"),
    Some(5432),
    Some("nezha"),
  )
  
  http.start_server(3000, db_config)
}
