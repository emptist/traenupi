import gleam/dict.{type Dict}
import gleam/int
import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/option.{type Option, None, Some}

pub type HttpMethod {
  Get
  Post
  Put
  Delete
  Patch
  Head
  Options
}

pub type HttpError {
  NetworkError(message: String)
  InvalidUrl(url: String)
  InvalidResponse(message: String)
  Timeout
  StatusError(status: Int, body: String)
}

pub type HttpResponse {
  HttpResponse(
    status: Int,
    headers: Dict(String, String),
    body: String,
  )
}

pub type HttpRequest {
  HttpRequest(
    method: HttpMethod,
    url: String,
    headers: Dict(String, String),
    body: Option(String),
  )
}

pub fn new_request(method: HttpMethod, url: String) -> HttpRequest {
  HttpRequest(
    method: method,
    url: url,
    headers: dict.new(),
    body: None,
  )
}

pub fn get(url: String) -> HttpRequest {
  new_request(Get, url)
}

pub fn post(url: String) -> HttpRequest {
  new_request(Post, url)
}

pub fn put(url: String) -> HttpRequest {
  new_request(Put, url)
}

pub fn delete(url: String) -> HttpRequest {
  new_request(Delete, url)
}

pub fn with_header(request: HttpRequest, key: String, value: String) -> HttpRequest {
  HttpRequest(..request, headers: dict.insert(request.headers, key, value))
}

pub fn with_body(request: HttpRequest, body: String) -> HttpRequest {
  HttpRequest(..request, body: Some(body))
}

pub fn with_json_content_type(request: HttpRequest) -> HttpRequest {
  with_header(request, "Content-Type", "application/json")
}

pub fn with_bearer_token(request: HttpRequest, token: String) -> HttpRequest {
  with_header(request, "Authorization", "Bearer " <> token)
}

pub fn with_accept_json(request: HttpRequest) -> HttpRequest {
  with_header(request, "Accept", "application/json")
}

pub fn method_to_string(method: HttpMethod) -> String {
  case method {
    Get -> "GET"
    Post -> "POST"
    Put -> "PUT"
    Delete -> "DELETE"
    Patch -> "PATCH"
    Head -> "HEAD"
    Options -> "OPTIONS"
  }
}

pub fn is_success(status: Int) -> Bool {
  status >= 200 && status < 300
}

pub fn is_redirect(status: Int) -> Bool {
  status >= 300 && status < 400
}

pub fn is_client_error(status: Int) -> Bool {
  status >= 400 && status < 500
}

pub fn is_server_error(status: Int) -> Bool {
  status >= 500 && status < 600
}

pub type FetchResponse {
  FetchResponse(status: Int, body: String)
}

@external(javascript, "../http_ffi.mjs", "fetch")
pub fn do_fetch(
  method: String,
  url: String,
  headers: List(#(String, String)),
  body: Option(String),
) -> Promise(Result(FetchResponse, String))

pub fn send(
  request: HttpRequest,
) -> Promise(Result(HttpResponse, HttpError)) {
  let method_str = method_to_string(request.method)
  let headers_list = dict.to_list(request.headers)

  use result <- await(do_fetch(
    method_str,
    request.url,
    headers_list,
    request.body,
  ))
  resolve(case result {
    Ok(resp) ->
      case is_success(resp.status) {
        True ->
          Ok(HttpResponse(
            status: resp.status,
            headers: dict.new(),
            body: resp.body,
          ))
        False -> Error(StatusError(status: resp.status, body: resp.body))
      }
    Error(msg) -> Error(NetworkError(message: msg))
  })
}

pub fn error_to_string(error: HttpError) -> String {
  case error {
    NetworkError(message: m) -> "Network error: " <> m
    InvalidUrl(url: u) -> "Invalid URL: " <> u
    InvalidResponse(message: m) -> "Invalid response: " <> m
    Timeout -> "Request timed out"
    StatusError(status: s, body: b) ->
      "HTTP " <> int.to_string(s) <> ": " <> b
  }
}
