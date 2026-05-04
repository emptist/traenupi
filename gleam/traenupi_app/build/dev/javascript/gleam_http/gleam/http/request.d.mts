import type * as $option from "../../../gleam_stdlib/gleam/option.d.mts";
import type * as $uri from "../../../gleam_stdlib/gleam/uri.d.mts";
import type * as _ from "../../gleam.d.mts";
import type * as $http from "../../gleam/http.d.mts";

export class Request<DXA> extends _.CustomType {
  /** @deprecated */
  constructor(
    method: $http.Method$,
    headers: _.List<[string, string]>,
    body: DXA,
    scheme: $http.Scheme$,
    host: string,
    port: $option.Option$<number>,
    path: string,
    query: $option.Option$<string>
  );
  /** @deprecated */
  method: $http.Method$;
  /** @deprecated */
  headers: _.List<[string, string]>;
  /** @deprecated */
  body: DXA;
  /** @deprecated */
  scheme: $http.Scheme$;
  /** @deprecated */
  host: string;
  /** @deprecated */
  port: $option.Option$<number>;
  /** @deprecated */
  path: string;
  /** @deprecated */
  query: $option.Option$<string>;
}
export function Request$Request<DXA>(
  method: $http.Method$,
  headers: _.List<[string, string]>,
  body: DXA,
  scheme: $http.Scheme$,
  host: string,
  port: $option.Option$<number>,
  path: string,
  query: $option.Option$<string>,
): Request$<DXA>;
export function Request$isRequest<DXA>(value: Request$<DXA>): boolean;
export function Request$Request$0<DXA>(value: Request$<DXA>): $http.Method$;
export function Request$Request$method<DXA>(value: Request$<DXA>): $http.Method$;
export function Request$Request$1<DXA>(
  value: Request$<DXA>,
): _.List<[string, string]>;
export function Request$Request$headers<DXA>(value: Request$<DXA>): _.List<
  [string, string]
>;
export function Request$Request$2<DXA>(value: Request$<DXA>): DXA;
export function Request$Request$body<DXA>(value: Request$<DXA>): DXA;
export function Request$Request$3<DXA>(value: Request$<DXA>): $http.Scheme$;
export function Request$Request$scheme<DXA>(value: Request$<DXA>): $http.Scheme$;
export function Request$Request$4<DXA>(
  value: Request$<DXA>,
): string;
export function Request$Request$host<DXA>(value: Request$<DXA>): string;
export function Request$Request$5<DXA>(value: Request$<DXA>): $option.Option$<
  number
>;
export function Request$Request$port<DXA>(value: Request$<DXA>): $option.Option$<
  number
>;
export function Request$Request$6<DXA>(value: Request$<DXA>): string;
export function Request$Request$path<DXA>(value: Request$<DXA>): string;
export function Request$Request$7<DXA>(value: Request$<DXA>): $option.Option$<
  string
>;
export function Request$Request$query<DXA>(value: Request$<DXA>): $option.Option$<
  string
>;

export type Request$<DXA> = Request<DXA>;

export function to_uri(request: Request$<any>): $uri.Uri$;

export function from_uri(uri: $uri.Uri$): _.Result<Request$<string>, undefined>;

export function get_header(request: Request$<any>, key: string): _.Result<
  string,
  undefined
>;

export function set_header<DXK>(
  request: Request$<DXK>,
  key: string,
  value: string
): Request$<DXK>;

export function prepend_header<DXN>(
  request: Request$<DXN>,
  key: string,
  value: string
): Request$<DXN>;

export function set_body<DXS>(req: Request$<any>, body: DXS): Request$<DXS>;

export function map<DXU, DXW>(
  request: Request$<DXU>,
  transform: (x0: DXU) => DXW
): Request$<DXW>;

export function path_segments(request: Request$<any>): _.List<string>;

export function get_query(request: Request$<any>): _.Result<
  _.List<[string, string]>,
  undefined
>;

export function set_query<DYG>(
  req: Request$<DYG>,
  query: _.List<[string, string]>
): Request$<DYG>;

export function set_method<DYK>(req: Request$<DYK>, method: $http.Method$): Request$<
  DYK
>;

export function new$(): Request$<string>;

export function to(url: string): _.Result<Request$<string>, undefined>;

export function set_scheme<DYR>(req: Request$<DYR>, scheme: $http.Scheme$): Request$<
  DYR
>;

export function set_host<DYU>(req: Request$<DYU>, host: string): Request$<DYU>;

export function set_port<DYX>(req: Request$<DYX>, port: number): Request$<DYX>;

export function set_path<DZA>(req: Request$<DZA>, path: string): Request$<DZA>;

export function set_cookie<DZD>(req: Request$<DZD>, name: string, value: string): Request$<
  DZD
>;

export function get_cookies(req: Request$<any>): _.List<[string, string]>;

export function remove_cookie<DZJ>(req: Request$<DZJ>, name: string): Request$<
  DZJ
>;
