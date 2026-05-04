/// <reference types="./http.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import { Ok, Error, CustomType as $CustomType } from "../gleam.mjs";
import { fetch } from "../http_ffi.mjs";

export { fetch };

export class Get extends $CustomType {}
export const HttpMethod$Get = () => new Get();
export const HttpMethod$isGet = (value) => value instanceof Get;

export class Post extends $CustomType {}
export const HttpMethod$Post = () => new Post();
export const HttpMethod$isPost = (value) => value instanceof Post;

export class Put extends $CustomType {}
export const HttpMethod$Put = () => new Put();
export const HttpMethod$isPut = (value) => value instanceof Put;

export class Delete extends $CustomType {}
export const HttpMethod$Delete = () => new Delete();
export const HttpMethod$isDelete = (value) => value instanceof Delete;

export class Patch extends $CustomType {}
export const HttpMethod$Patch = () => new Patch();
export const HttpMethod$isPatch = (value) => value instanceof Patch;

export class Head extends $CustomType {}
export const HttpMethod$Head = () => new Head();
export const HttpMethod$isHead = (value) => value instanceof Head;

export class Options extends $CustomType {}
export const HttpMethod$Options = () => new Options();
export const HttpMethod$isOptions = (value) => value instanceof Options;

export class NetworkError extends $CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
export const HttpError$NetworkError = (message) => new NetworkError(message);
export const HttpError$isNetworkError = (value) =>
  value instanceof NetworkError;
export const HttpError$NetworkError$message = (value) => value.message;
export const HttpError$NetworkError$0 = (value) => value.message;

export class InvalidUrl extends $CustomType {
  constructor(url) {
    super();
    this.url = url;
  }
}
export const HttpError$InvalidUrl = (url) => new InvalidUrl(url);
export const HttpError$isInvalidUrl = (value) => value instanceof InvalidUrl;
export const HttpError$InvalidUrl$url = (value) => value.url;
export const HttpError$InvalidUrl$0 = (value) => value.url;

export class InvalidResponse extends $CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
export const HttpError$InvalidResponse = (message) =>
  new InvalidResponse(message);
export const HttpError$isInvalidResponse = (value) =>
  value instanceof InvalidResponse;
export const HttpError$InvalidResponse$message = (value) => value.message;
export const HttpError$InvalidResponse$0 = (value) => value.message;

export class Timeout extends $CustomType {}
export const HttpError$Timeout = () => new Timeout();
export const HttpError$isTimeout = (value) => value instanceof Timeout;

export class StatusError extends $CustomType {
  constructor(status, body) {
    super();
    this.status = status;
    this.body = body;
  }
}
export const HttpError$StatusError = (status, body) =>
  new StatusError(status, body);
export const HttpError$isStatusError = (value) => value instanceof StatusError;
export const HttpError$StatusError$status = (value) => value.status;
export const HttpError$StatusError$0 = (value) => value.status;
export const HttpError$StatusError$body = (value) => value.body;
export const HttpError$StatusError$1 = (value) => value.body;

export class HttpResponse extends $CustomType {
  constructor(status, headers, body) {
    super();
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}
export const HttpResponse$HttpResponse = (status, headers, body) =>
  new HttpResponse(status, headers, body);
export const HttpResponse$isHttpResponse = (value) =>
  value instanceof HttpResponse;
export const HttpResponse$HttpResponse$status = (value) => value.status;
export const HttpResponse$HttpResponse$0 = (value) => value.status;
export const HttpResponse$HttpResponse$headers = (value) => value.headers;
export const HttpResponse$HttpResponse$1 = (value) => value.headers;
export const HttpResponse$HttpResponse$body = (value) => value.body;
export const HttpResponse$HttpResponse$2 = (value) => value.body;

export class HttpRequest extends $CustomType {
  constructor(method, url, headers, body) {
    super();
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }
}
export const HttpRequest$HttpRequest = (method, url, headers, body) =>
  new HttpRequest(method, url, headers, body);
export const HttpRequest$isHttpRequest = (value) =>
  value instanceof HttpRequest;
export const HttpRequest$HttpRequest$method = (value) => value.method;
export const HttpRequest$HttpRequest$0 = (value) => value.method;
export const HttpRequest$HttpRequest$url = (value) => value.url;
export const HttpRequest$HttpRequest$1 = (value) => value.url;
export const HttpRequest$HttpRequest$headers = (value) => value.headers;
export const HttpRequest$HttpRequest$2 = (value) => value.headers;
export const HttpRequest$HttpRequest$body = (value) => value.body;
export const HttpRequest$HttpRequest$3 = (value) => value.body;

export class FetchResponse extends $CustomType {
  constructor(status, body) {
    super();
    this.status = status;
    this.body = body;
  }
}
export const FetchResponse$FetchResponse = (status, body) =>
  new FetchResponse(status, body);
export const FetchResponse$isFetchResponse = (value) =>
  value instanceof FetchResponse;
export const FetchResponse$FetchResponse$status = (value) => value.status;
export const FetchResponse$FetchResponse$0 = (value) => value.status;
export const FetchResponse$FetchResponse$body = (value) => value.body;
export const FetchResponse$FetchResponse$1 = (value) => value.body;

export function new_request(method, url) {
  return new HttpRequest(method, url, $dict.new$(), new None());
}

export function get(url) {
  return new_request(new Get(), url);
}

export function post(url) {
  return new_request(new Post(), url);
}

export function put(url) {
  return new_request(new Put(), url);
}

export function delete$(url) {
  return new_request(new Delete(), url);
}

export function with_header(request, key, value) {
  return new HttpRequest(
    request.method,
    request.url,
    $dict.insert(request.headers, key, value),
    request.body,
  );
}

export function with_body(request, body) {
  return new HttpRequest(
    request.method,
    request.url,
    request.headers,
    new Some(body),
  );
}

export function with_json_content_type(request) {
  return with_header(request, "Content-Type", "application/json");
}

export function with_bearer_token(request, token) {
  return with_header(request, "Authorization", "Bearer " + token);
}

export function with_accept_json(request) {
  return with_header(request, "Accept", "application/json");
}

export function method_to_string(method) {
  if (method instanceof Get) {
    return "GET";
  } else if (method instanceof Post) {
    return "POST";
  } else if (method instanceof Put) {
    return "PUT";
  } else if (method instanceof Delete) {
    return "DELETE";
  } else if (method instanceof Patch) {
    return "PATCH";
  } else if (method instanceof Head) {
    return "HEAD";
  } else {
    return "OPTIONS";
  }
}

export function is_success(status) {
  return (status >= 200) && (status < 300);
}

export function is_redirect(status) {
  return (status >= 300) && (status < 400);
}

export function is_client_error(status) {
  return (status >= 400) && (status < 500);
}

export function is_server_error(status) {
  return (status >= 500) && (status < 600);
}

export function send(request) {
  let $ = fetch(request);
  if ($ instanceof Ok) {
    let resp = $[0];
    let response = new HttpResponse(resp.status, $dict.new$(), resp.body);
    let $1 = is_success(resp.status);
    if ($1) {
      return new Ok(response);
    } else {
      return new Error(new StatusError(resp.status, resp.body));
    }
  } else {
    let msg = $[0];
    return new Error(new NetworkError(msg));
  }
}

export function get_string(url) {
  let $ = send(get(url));
  if ($ instanceof Ok) {
    let resp = $[0];
    return new Ok(resp.body);
  } else {
    return $;
  }
}

export function post_string(url, body) {
  let $ = send(
    (() => {
      let _pipe = post(url);
      return with_body(_pipe, body);
    })(),
  );
  if ($ instanceof Ok) {
    let resp = $[0];
    return new Ok(resp.body);
  } else {
    return $;
  }
}

function digit_to_str(d) {
  if (d === 0) {
    return "0";
  } else if (d === 1) {
    return "1";
  } else if (d === 2) {
    return "2";
  } else if (d === 3) {
    return "3";
  } else if (d === 4) {
    return "4";
  } else if (d === 5) {
    return "5";
  } else if (d === 6) {
    return "6";
  } else if (d === 7) {
    return "7";
  } else if (d === 8) {
    return "8";
  } else if (d === 9) {
    return "9";
  } else {
    return "";
  }
}

function int_to_string(n) {
  if (n === 200) {
    return "200";
  } else if (n === 201) {
    return "201";
  } else if (n === 204) {
    return "204";
  } else if (n === 400) {
    return "400";
  } else if (n === 401) {
    return "401";
  } else if (n === 403) {
    return "403";
  } else if (n === 404) {
    return "404";
  } else if (n === 500) {
    return "500";
  } else if (n === 502) {
    return "502";
  } else if (n === 503) {
    return "503";
  } else {
    let $ = n < 10;
    if ($) {
      return digit_to_str(n);
    } else {
      let tens = globalThis.Math.trunc(n / 10);
      let ones = n - tens * 10;
      return int_to_string(tens) + digit_to_str(ones);
    }
  }
}

export function error_to_string(error) {
  if (error instanceof NetworkError) {
    let m = error.message;
    return "Network error: " + m;
  } else if (error instanceof InvalidUrl) {
    let u = error.url;
    return "Invalid URL: " + u;
  } else if (error instanceof InvalidResponse) {
    let m = error.message;
    return "Invalid response: " + m;
  } else if (error instanceof Timeout) {
    return "Request timed out";
  } else {
    let s = error.status;
    let b = error.body;
    return (("HTTP " + int_to_string(s)) + ": ") + b;
  }
}
