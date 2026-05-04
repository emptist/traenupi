/// <reference types="./http.d.mts" />
import * as $promise from "../../gleam_javascript/gleam/javascript/promise.mjs";
import * as $json from "../../gleam_json/gleam/json.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $io from "../../gleam_stdlib/gleam/io.mjs";
import * as $glen from "../../glen/glen.mjs";
import * as $status from "../../glen/glen/status.mjs";
import * as $node_pg from "../../node_pg/node_pg.mjs";
import { Ok, toList, Empty as $Empty, CustomType as $CustomType } from "../gleam.mjs";
import { createServer as create_server_node } from "./http_ffi.mjs";

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
  let _pipe = $json.object(
    toList([
      ["status", $json.string("running")],
      ["database", $json.string(db_status)],
      ["version", $json.string("1.0.0")],
      ["client", $json.string("node_pg")],
      ["framework", $json.string("Glen")],
    ]),
  );
  let _pipe$1 = $json.to_string(_pipe);
  let _pipe$2 = $glen.json(_pipe$1, $status.ok);
  return $promise.resolve(_pipe$2);
}

function api_tasks(_) {
  let _pipe = $json.object(
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
  );
  let _pipe$1 = $json.to_string(_pipe);
  let _pipe$2 = $glen.json(_pipe$1, $status.ok);
  return $promise.resolve(_pipe$2);
}

function not_found() {
  let _pipe = $json.object(toList([["error", $json.string("Not found")]]));
  let _pipe$1 = $json.to_string(_pipe);
  let _pipe$2 = $glen.json(_pipe$1, $status.not_found);
  return $promise.resolve(_pipe$2);
}

function get_timestamp() {
  return "2026-05-04T00:00:00Z";
}

function health_check() {
  let _pipe = $json.object(
    toList([
      ["status", $json.string("ok")],
      ["service", $json.string("TraeNuPI")],
      ["timestamp", $json.string(get_timestamp())],
      ["framework", $json.string("Glen")],
    ]),
  );
  let _pipe$1 = $json.to_string(_pipe);
  let _pipe$2 = $glen.json(_pipe$1, $status.ok);
  return $promise.resolve(_pipe$2);
}

function handle_request(req, state) {
  let $ = $glen.path_segments(req);
  if ($ instanceof $Empty) {
    return not_found();
  } else {
    let $1 = $.tail;
    if ($1 instanceof $Empty) {
      let $2 = $.head;
      if ($2 === "health") {
        return health_check();
      } else if ($2 === "status") {
        return server_status(state);
      } else {
        return not_found();
      }
    } else {
      let $2 = $1.tail;
      if ($2 instanceof $Empty) {
        let $3 = $.head;
        if ($3 === "api") {
          let $4 = $1.head;
          if ($4 === "tasks") {
            return api_tasks(state);
          } else {
            return not_found();
          }
        } else {
          return not_found();
        }
      } else {
        return not_found();
      }
    }
  }
}

function handle_request_js(req, state) {
  let gleam_req = $glen.convert_request(req);
  let response = handle_request(gleam_req, state);
  return $promise.map(
    response,
    (res) => { return $glen.convert_response(res); },
  );
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
        $io.println("✓ HTTP server starting on port " + $int.to_string(port));
        $io.println("  Endpoints:");
        $io.println("    - GET /health  - Health check");
        $io.println("    - GET /status  - Server status");
        $io.println("    - GET /api/tasks - List tasks");
        create_server_node(
          port,
          (req) => { return handle_request_js(req, state); },
        );
        return $promise.resolve(undefined);
      } else {
        let error = result[0];
        $io.println("✗ Database connection failed: " + error.message);
        return $promise.resolve(undefined);
      }
    },
  );
}
