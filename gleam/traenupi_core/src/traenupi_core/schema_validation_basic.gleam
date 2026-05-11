import gleam/string
import traenupi_core/schema_types.{type SchemaError, TypeMismatch}
import traenupi_core/jsonx.{
  type JsonValue, JsonNull, JsonBool, JsonNumber, JsonString, JsonArray,
  JsonObject,
}

pub fn validate_null(value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonNull -> Ok(Nil)
    _ -> Error(TypeMismatch(path: path, expected: "null", found: type_name(value)))
  }
}

pub fn validate_bool(value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonBool(_) -> Ok(Nil)
    _ -> Error(TypeMismatch(path: path, expected: "boolean", found: type_name(value)))
  }
}

fn type_name(value: JsonValue) -> String {
  case value {
    JsonNull -> "null"
    JsonBool(_) -> "boolean"
    JsonNumber(_) -> "number"
    JsonString(_) -> "string"
    JsonArray(_) -> "array"
    JsonObject(_) -> "object"
  }
}
