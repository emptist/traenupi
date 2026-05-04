import gleam/javascript/promise.{type Promise}

pub type StreamCallback =
  fn(String, Bool) -> Nil

pub type StreamHandle {
  StreamHandle(cleanup: fn() -> Nil)
}

@external(javascript, "./streaming_ffi.mjs", "createStreamingRequest")
pub fn create_streaming_request(
  url: String,
  headers: List(#(String, String)),
  body: String,
  on_chunk: StreamCallback,
) -> Promise(Result(StreamHandle, String))

@external(javascript, "./streaming_ffi.mjs", "cancelStream")
pub fn cancel_stream(handle: StreamHandle) -> Nil
