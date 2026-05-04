import type * as $http from "../../gleam/http.d.mts";
import type * as $request from "../../gleam/http/request.d.mts";
import type * as $response from "../../gleam/http/response.d.mts";

export type Service = (x0: $request.Request$<any>) => $response.Response$<any>;

export type Middleware = (
  x0: (x0: $request.Request$<any>) => $response.Response$<any>
) => (x0: $request.Request$<any>) => $response.Response$<any>;

export function map_response_body<ELA, ELB, ELD>(
  service: (x0: ELA) => $response.Response$<ELB>,
  mapper: (x0: ELB) => ELD
): (x0: ELA) => $response.Response$<ELD>;

export function prepend_response_header<ELF, ELG>(
  service: (x0: ELF) => $response.Response$<ELG>,
  key: string,
  value: string
): (x0: ELF) => $response.Response$<ELG>;

export function method_override<ELS, ELU>(
  service: (x0: $request.Request$<ELS>) => ELU
): (x0: $request.Request$<ELS>) => ELU;
