@external(javascript, "./time_utils_ffi.mjs", "now")
pub fn now() -> Int

@external(javascript, "./time_utils_ffi.mjs", "generate_id")
pub fn generate_id(prefix: String) -> String

@external(javascript, "./time_utils_ffi.mjs", "generate_uuid")
pub fn generate_uuid() -> String
