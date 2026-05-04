import type * as $conversation from "../../conversation/conversation.d.mts";
import type * as $request from "../../gleam_http/gleam/http/request.d.mts";
import type * as $response from "../../gleam_http/gleam/http/response.d.mts";
import type * as $promise from "../../gleam_javascript/gleam/javascript/promise.d.mts";
import type * as $glen from "../../glen/glen.d.mts";
import type * as $node_pg from "../../node_pg/node_pg.d.mts";
import type * as _ from "../gleam.d.mts";

export class AppState extends _.CustomType {
  /** @deprecated */
  constructor(db_client: $node_pg.Client$, db_connected: boolean);
  /** @deprecated */
  db_client: $node_pg.Client$;
  /** @deprecated */
  db_connected: boolean;
}
export function AppState$AppState(
  db_client: $node_pg.Client$,
  db_connected: boolean,
): AppState$;
export function AppState$isAppState(value: AppState$): boolean;
export function AppState$AppState$0(value: AppState$): $node_pg.Client$;
export function AppState$AppState$db_client(value: AppState$): $node_pg.Client$;
export function AppState$AppState$1(value: AppState$): boolean;
export function AppState$AppState$db_connected(value: AppState$): boolean;

export type AppState$ = AppState;

export function start_server(port: number, db_config: $node_pg.Config$): $promise.Promise$<
  undefined
>;
