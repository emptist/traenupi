/// <reference types="./http.d.mts" />
import * as $promise from "../../gleam_javascript/gleam/javascript/promise.mjs";
import * as $json from "../../gleam_json/gleam/json.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $io from "../../gleam_stdlib/gleam/io.mjs";
import * as $node_pg from "../../node_pg/node_pg.mjs";
import { Ok, toList, CustomType as $CustomType } from "../gleam.mjs";
import {
  createServer as create_server_internal,
  listen as listen_internal,
  writeResponse as write_response_internal,
} from "./http_ffi.mjs";

export class Request extends $CustomType {
  constructor(method, path, headers) {
    super();
    this.method = method;
    this.path = path;
    this.headers = headers;
  }
}
export const Request$Request = (method, path, headers) =>
  new Request(method, path, headers);
export const Request$isRequest = (value) => value instanceof Request;
export const Request$Request$method = (value) => value.method;
export const Request$Request$0 = (value) => value.method;
export const Request$Request$path = (value) => value.path;
export const Request$Request$1 = (value) => value.path;
export const Request$Request$headers = (value) => value.headers;
export const Request$Request$2 = (value) => value.headers;

export class Response extends $CustomType {
  constructor(status, headers, body) {
    super();
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}
export const Response$Response = (status, headers, body) =>
  new Response(status, headers, body);
export const Response$isResponse = (value) => value instanceof Response;
export const Response$Response$status = (value) => value.status;
export const Response$Response$0 = (value) => value.status;
export const Response$Response$headers = (value) => value.headers;
export const Response$Response$1 = (value) => value.headers;
export const Response$Response$body = (value) => value.body;
export const Response$Response$2 = (value) => value.body;

export class AppState extends $CustomType {
  constructor(db_client, db_connected) {
    super();
    this.db_client = db_client;
    this.db_connected = db_connected;
  }
}
export const AppState$AppState = (db_client, db_connected) =>
  new AppState(db_client, db_connected);
export const AppState$isAppState = (value) => value instanceof AppState;
export const AppState$AppState$db_client = (value) => value.db_client;
export const AppState$AppState$0 = (value) => value.db_client;
export const AppState$AppState$db_connected = (value) => value.db_connected;
export const AppState$AppState$1 = (value) => value.db_connected;

function server_status(state) {
  let _block;
  let $ = state.db_connected;
  if ($) {
    _block = "connected";
  } else {
    _block = "disconnected";
  }
  let db_status = _block;
  return new Response(
    200,
    toList([["content-type", "application/json"]]),
    $json.to_string(
      $json.object(
        toList([
          ["status", $json.string("running")],
          ["database", $json.string(db_status)],
          ["version", $json.string("1.0.0")],
          ["client", $json.string("node_pg")],
        ]),
      ),
    ),
  );
}

function api_tasks(_) {
  return new Response(
    200,
    toList([["content-type", "application/json"]]),
    $json.to_string(
      $json.object(
        toList([
          [
            "tasks",
            $json.array(
              toList([]),
              (_) => {
                return $json.object(
                  toList([
                    ["id", $json.string("1")],
                    ["title", $json.string("Sample task")],
                    ["status", $json.string("pending")],
                  ]),
                );
              },
            ),
          ],
        ]),
      ),
    ),
  );
}

function not_found() {
  return new Response(
    404,
    toList([["content-type", "application/json"]]),
    $json.to_string(
      $json.object(toList([["error", $json.string("Not found")]])),
    ),
  );
}

function get_timestamp() {
  return "2026-05-04T00:00:00Z";
}

function health_check() {
  return new Response(
    200,
    toList([["content-type", "application/json"]]),
    $json.to_string(
      $json.object(
        toList([
          ["status", $json.string("ok")],
          ["service", $json.string("TraeNuPI")],
          ["timestamp", $json.string(get_timestamp())],
        ]),
      ),
    ),
  );
}

function handle_request(req, state) {
  let $ = req.path;
  if ($ === "/health") {
    return health_check();
  } else if ($ === "/status") {
    return server_status(state);
  } else if ($ === "/api/tasks") {
    return api_tasks(state);
  } else {
    return not_found();
  }
}

export function start_server(port, db_config) {
  let client = $node_pg.new_client(db_config);
  $io.println("Starting TraeNuPI HTTP server on port " + $int.to_string(port));
  $io.println("Connecting to database...");
  return $promise.await$(
    $node_pg.connect(client),
    (result) => {
      if (result instanceof Ok) {
        $io.println("✓ Database connected");
        let state = new AppState(client, true);
        let handler = (req) => {
          let response = handle_request(req, state);
          return (res) => {
            return write_response_internal(
              res,
              response.status,
              response.headers,
              response.body,
            );
          };
        };
        let server = create_server_internal(handler);
        let callback = () => {
          $io.println("✓ HTTP server started on port " + $int.to_string(port));
          $io.println("  Endpoints:");
          $io.println("    - GET /health  - Health check");
          $io.println("    - GET /status  - Server status");
          return $io.println("    - GET /api/tasks - List tasks");
        };
        listen_internal(server, port, callback);
        return $promise.resolve(undefined);
      } else {
        let error = result[0];
        $io.println("✗ Database connection failed: " + error.message);
        return $promise.resolve(undefined);
      }
    },
  );
}
