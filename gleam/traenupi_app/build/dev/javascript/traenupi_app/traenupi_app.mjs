/// <reference types="./traenupi_app.d.mts" />
import * as $io from "../gleam_stdlib/gleam/io.mjs";
import * as $option from "../gleam_stdlib/gleam/option.mjs";
import { Some } from "../gleam_stdlib/gleam/option.mjs";
import * as $node_pg from "../node_pg/node_pg.mjs";
import * as $http from "./traenupi/http.mjs";

export function main() {
  $io.println("=== TraeNuPI HTTP Server ===");
  $io.println("");
  let db_config = $node_pg.create_config(
    new Some("postgres"),
    new Some("postgres"),
    new Some("localhost"),
    new Some(5432),
    new Some("nezha"),
  );
  return $http.start_server(3000, db_config);
}
