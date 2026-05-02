import gleam/dict.{type Dict}
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
pub fn fetch(request: HttpRequest) -> Result(FetchResponse, String)

pub fn send(request: HttpRequest) -> Result(HttpResponse, HttpError) {
  case fetch(request) {
    Ok(resp) -> {
      let response = HttpResponse(
        status: resp.status,
        headers: dict.new(),
        body: resp.body,
      )
      case is_success(resp.status) {
        True -> Ok(response)
        False -> Error(StatusError(status: resp.status, body: resp.body))
      }
    }
    Error(msg) -> Error(NetworkError(message: msg))
  }
}

pub fn get_string(url: String) -> Result(String, HttpError) {
  case send(get(url)) {
    Ok(resp) -> Ok(resp.body)
    Error(e) -> Error(e)
  }
}

pub fn post_string(url: String, body: String) -> Result(String, HttpError) {
  case send(post(url) |> with_body(body)) {
    Ok(resp) -> Ok(resp.body)
    Error(e) -> Error(e)
  }
}

pub fn error_to_string(error: HttpError) -> String {
  case error {
    NetworkError(message: m) -> "Network error: " <> m
    InvalidUrl(url: u) -> "Invalid URL: " <> u
    InvalidResponse(message: m) -> "Invalid response: " <> m
    Timeout -> "Request timed out"
    StatusError(status: s, body: b) -> 
      "HTTP " <> int_to_string(s) <> ": " <> b
  }
}

fn int_to_string(n: Int) -> String {
  case n {
    200 -> "200"
    201 -> "201"
    204 -> "204"
    400 -> "400"
    401 -> "401"
    403 -> "403"
    404 -> "404"
    500 -> "500"
    502 -> "502"
    503 -> "503"
    _ -> {
      case n < 10 {
        True -> digit_to_str(n)
        False -> {
          let tens = n / 10
          let ones = n - tens * 10
          int_to_string(tens) <> digit_to_str(ones)
        }
      }
    }
  }
}

fn digit_to_str(d: Int) -> String {
  case d {
    0 -> "0"
    1 -> "1"
    2 -> "2"
    3 -> "3"
    4 -> "4"
    5 -> "5"
    6 -> "6"
    7 -> "7"
    8 -> "8"
    9 -> "9"
    _ -> ""
  }
}
