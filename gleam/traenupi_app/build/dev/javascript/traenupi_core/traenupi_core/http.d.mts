import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Get extends _.CustomType {}
export function HttpMethod$Get(): HttpMethod$;
export function HttpMethod$isGet(value: HttpMethod$): boolean;

export class Post extends _.CustomType {}
export function HttpMethod$Post(): HttpMethod$;
export function HttpMethod$isPost(value: HttpMethod$): boolean;

export class Put extends _.CustomType {}
export function HttpMethod$Put(): HttpMethod$;
export function HttpMethod$isPut(value: HttpMethod$): boolean;

export class Delete extends _.CustomType {}
export function HttpMethod$Delete(): HttpMethod$;
export function HttpMethod$isDelete(value: HttpMethod$): boolean;

export class Patch extends _.CustomType {}
export function HttpMethod$Patch(): HttpMethod$;
export function HttpMethod$isPatch(value: HttpMethod$): boolean;

export class Head extends _.CustomType {}
export function HttpMethod$Head(): HttpMethod$;
export function HttpMethod$isHead(value: HttpMethod$): boolean;

export class Options extends _.CustomType {}
export function HttpMethod$Options(): HttpMethod$;
export function HttpMethod$isOptions(value: HttpMethod$): boolean;

export type HttpMethod$ = Get | Post | Put | Delete | Patch | Head | Options;

export class NetworkError extends _.CustomType {
  /** @deprecated */
  constructor(message: string);
  /** @deprecated */
  message: string;
}
export function HttpError$NetworkError(message: string): HttpError$;
export function HttpError$isNetworkError(value: HttpError$): boolean;
export function HttpError$NetworkError$0(value: HttpError$): string;
export function HttpError$NetworkError$message(value: HttpError$): string;

export class InvalidUrl extends _.CustomType {
  /** @deprecated */
  constructor(url: string);
  /** @deprecated */
  url: string;
}
export function HttpError$InvalidUrl(url: string): HttpError$;
export function HttpError$isInvalidUrl(value: HttpError$): boolean;
export function HttpError$InvalidUrl$0(value: HttpError$): string;
export function HttpError$InvalidUrl$url(value: HttpError$): string;

export class InvalidResponse extends _.CustomType {
  /** @deprecated */
  constructor(message: string);
  /** @deprecated */
  message: string;
}
export function HttpError$InvalidResponse(message: string): HttpError$;
export function HttpError$isInvalidResponse(value: HttpError$): boolean;
export function HttpError$InvalidResponse$0(value: HttpError$): string;
export function HttpError$InvalidResponse$message(value: HttpError$): string;

export class Timeout extends _.CustomType {}
export function HttpError$Timeout(): HttpError$;
export function HttpError$isTimeout(value: HttpError$): boolean;

export class StatusError extends _.CustomType {
  /** @deprecated */
  constructor(status: number, body: string);
  /** @deprecated */
  status: number;
  /** @deprecated */
  body: string;
}
export function HttpError$StatusError(status: number, body: string): HttpError$;
export function HttpError$isStatusError(value: HttpError$): boolean;
export function HttpError$StatusError$0(value: HttpError$): number;
export function HttpError$StatusError$status(value: HttpError$): number;
export function HttpError$StatusError$1(value: HttpError$): string;
export function HttpError$StatusError$body(value: HttpError$): string;

export type HttpError$ = NetworkError | InvalidUrl | InvalidResponse | Timeout | StatusError;

export class HttpResponse extends _.CustomType {
  /** @deprecated */
  constructor(
    status: number,
    headers: $dict.Dict$<string, string>,
    body: string
  );
  /** @deprecated */
  status: number;
  /** @deprecated */
  headers: $dict.Dict$<string, string>;
  /** @deprecated */
  body: string;
}
export function HttpResponse$HttpResponse(
  status: number,
  headers: $dict.Dict$<string, string>,
  body: string,
): HttpResponse$;
export function HttpResponse$isHttpResponse(value: HttpResponse$): boolean;
export function HttpResponse$HttpResponse$0(value: HttpResponse$): number;
export function HttpResponse$HttpResponse$status(value: HttpResponse$): number;
export function HttpResponse$HttpResponse$1(value: HttpResponse$): $dict.Dict$<
  string,
  string
>;
export function HttpResponse$HttpResponse$headers(value: HttpResponse$): $dict.Dict$<
  string,
  string
>;
export function HttpResponse$HttpResponse$2(value: HttpResponse$): string;
export function HttpResponse$HttpResponse$body(value: HttpResponse$): string;

export type HttpResponse$ = HttpResponse;

export class HttpRequest extends _.CustomType {
  /** @deprecated */
  constructor(
    method: HttpMethod$,
    url: string,
    headers: $dict.Dict$<string, string>,
    body: $option.Option$<string>
  );
  /** @deprecated */
  method: HttpMethod$;
  /** @deprecated */
  url: string;
  /** @deprecated */
  headers: $dict.Dict$<string, string>;
  /** @deprecated */
  body: $option.Option$<string>;
}
export function HttpRequest$HttpRequest(
  method: HttpMethod$,
  url: string,
  headers: $dict.Dict$<string, string>,
  body: $option.Option$<string>,
): HttpRequest$;
export function HttpRequest$isHttpRequest(value: HttpRequest$): boolean;
export function HttpRequest$HttpRequest$0(value: HttpRequest$): HttpMethod$;
export function HttpRequest$HttpRequest$method(value: HttpRequest$): HttpMethod$;
export function HttpRequest$HttpRequest$1(
  value: HttpRequest$,
): string;
export function HttpRequest$HttpRequest$url(value: HttpRequest$): string;
export function HttpRequest$HttpRequest$2(value: HttpRequest$): $dict.Dict$<
  string,
  string
>;
export function HttpRequest$HttpRequest$headers(value: HttpRequest$): $dict.Dict$<
  string,
  string
>;
export function HttpRequest$HttpRequest$3(value: HttpRequest$): $option.Option$<
  string
>;
export function HttpRequest$HttpRequest$body(value: HttpRequest$): $option.Option$<
  string
>;

export type HttpRequest$ = HttpRequest;

export class FetchResponse extends _.CustomType {
  /** @deprecated */
  constructor(status: number, body: string);
  /** @deprecated */
  status: number;
  /** @deprecated */
  body: string;
}
export function FetchResponse$FetchResponse(
  status: number,
  body: string,
): FetchResponse$;
export function FetchResponse$isFetchResponse(value: FetchResponse$): boolean;
export function FetchResponse$FetchResponse$0(value: FetchResponse$): number;
export function FetchResponse$FetchResponse$status(value: FetchResponse$): number;
export function FetchResponse$FetchResponse$1(
  value: FetchResponse$,
): string;
export function FetchResponse$FetchResponse$body(value: FetchResponse$): string;

export type FetchResponse$ = FetchResponse;

export function new_request(method: HttpMethod$, url: string): HttpRequest$;

export function get(url: string): HttpRequest$;

export function post(url: string): HttpRequest$;

export function put(url: string): HttpRequest$;

export function delete$(url: string): HttpRequest$;

export function with_header(request: HttpRequest$, key: string, value: string): HttpRequest$;

export function with_body(request: HttpRequest$, body: string): HttpRequest$;

export function with_json_content_type(request: HttpRequest$): HttpRequest$;

export function with_bearer_token(request: HttpRequest$, token: string): HttpRequest$;

export function with_accept_json(request: HttpRequest$): HttpRequest$;

export function method_to_string(method: HttpMethod$): string;

export function is_success(status: number): boolean;

export function is_redirect(status: number): boolean;

export function is_client_error(status: number): boolean;

export function is_server_error(status: number): boolean;

export function fetch(request: HttpRequest$): _.Result<FetchResponse$, string>;

export function send(request: HttpRequest$): _.Result<HttpResponse$, HttpError$>;

export function get_string(url: string): _.Result<string, HttpError$>;

export function post_string(url: string, body: string): _.Result<
  string,
  HttpError$
>;

export function error_to_string(error: HttpError$): string;
