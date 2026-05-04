import type * as $promise from "../../gleam_javascript/gleam/javascript/promise.d.mts";
import type * as $node_pg from "../../node_pg/node_pg.d.mts";
import type * as _ from "../gleam.d.mts";

export type Server$ = any;

export class Request extends _.CustomType {
  /** @deprecated */
  constructor(method: string, path: string, headers: _.List<[string, string]>);
  /** @deprecated */
  method: string;
  /** @deprecated */
  path: string;
  /** @deprecated */
  headers: _.List<[string, string]>;
}
export function Request$Request(
  method: string,
  path: string,
  headers: _.List<[string, string]>,
): Request$;
export function Request$isRequest(value: Request$): boolean;
export function Request$Request$0(value: Request$): string;
export function Request$Request$method(value: Request$): string;
export function Request$Request$1(value: Request$): string;
export function Request$Request$path(value: Request$): string;
export function Request$Request$2(value: Request$): _.List<[string, string]>;
export function Request$Request$headers(value: Request$): _.List<
  [string, string]
>;

export type Request$ = Request;

export class Response extends _.CustomType {
  /** @deprecated */
  constructor(status: number, headers: _.List<[string, string]>, body: string);
  /** @deprecated */
  status: number;
  /** @deprecated */
  headers: _.List<[string, string]>;
  /** @deprecated */
  body: string;
}
export function Response$Response(
  status: number,
  headers: _.List<[string, string]>,
  body: string,
): Response$;
export function Response$isResponse(value: Response$): boolean;
export function Response$Response$0(value: Response$): number;
export function Response$Response$status(value: Response$): number;
export function Response$Response$1(value: Response$): _.List<[string, string]>;
export function Response$Response$headers(value: Response$): _.List<
  [string, string]
>;
export function Response$Response$2(value: Response$): string;
export function Response$Response$body(value: Response$): string;

export type Response$ = Response;

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
