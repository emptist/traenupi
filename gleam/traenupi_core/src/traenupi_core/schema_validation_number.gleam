import gleam/float
import gleam/option.{type Option, None, Some}
import gleam/string
import traenupi_core/schema_types.{
  type SchemaError, type NumberConstraints, TypeMismatch, InvalidValue,
}
import traenupi_core/jsonx.{type JsonValue, JsonNumber}

pub fn validate_number(
  value: JsonValue,
  constraints: NumberConstraints,
  path: String,
) -> Result(Nil, SchemaError) {
  case value {
    JsonNumber(n) -> validate_number_constraints(n, constraints, path)
    _ -> Error(TypeMismatch(path: path, expected: "number", found: "unknown"))
  }
}

fn validate_number_constraints(
  n: Float,
  constraints: NumberConstraints,
  path: String,
) -> Result(Nil, SchemaError) {
  case validate_minimum(n, constraints.minimum, path) {
    Error(e) -> Error(e)
    Ok(_) -> case validate_maximum(n, constraints.maximum, path) {
      Error(e) -> Error(e)
      Ok(_) -> case validate_exclusive_minimum(n, constraints.exclusive_minimum, path) {
        Error(e) -> Error(e)
        Ok(_) -> case validate_exclusive_maximum(n, constraints.exclusive_maximum, path) {
          Error(e) -> Error(e)
          Ok(_) -> validate_multiple_of(n, constraints.multiple_of, path)
        }
      }
    }
  }
}

fn validate_minimum(
  n: Float,
  minimum: Option(Float),
  path: String,
) -> Result(Nil, SchemaError) {
  case minimum {
    Some(min) if n <. min ->
      Error(InvalidValue(
        path: path,
        message: "Value " <> string.inspect(n) <> " is less than minimum " <> string.inspect(min),
      ))
    _ -> Ok(Nil)
  }
}

fn validate_maximum(
  n: Float,
  maximum: Option(Float),
  path: String,
) -> Result(Nil, SchemaError) {
  case maximum {
    Some(max) if n >. max ->
      Error(InvalidValue(
        path: path,
        message: "Value " <> string.inspect(n) <> " is greater than maximum " <> string.inspect(max),
      ))
    _ -> Ok(Nil)
  }
}

fn validate_exclusive_minimum(
  n: Float,
  exclusive_minimum: Option(Float),
  path: String,
) -> Result(Nil, SchemaError) {
  case exclusive_minimum {
    Some(min) if n <=. min ->
      Error(InvalidValue(
        path: path,
        message: "Value " <> string.inspect(n) <> " is not greater than exclusive minimum " <> string.inspect(min),
      ))
    _ -> Ok(Nil)
  }
}

fn validate_exclusive_maximum(
  n: Float,
  exclusive_maximum: Option(Float),
  path: String,
) -> Result(Nil, SchemaError) {
  case exclusive_maximum {
    Some(max) if n >=. max ->
      Error(InvalidValue(
        path: path,
        message: "Value " <> string.inspect(n) <> " is not less than exclusive maximum " <> string.inspect(max),
      ))
    _ -> Ok(Nil)
  }
}

fn validate_multiple_of(
  n: Float,
  multiple_of: Option(Float),
  path: String,
) -> Result(Nil, SchemaError) {
  case multiple_of {
    Some(divisor) -> {
      let quotient = n /. divisor
      let remainder = n -. divisor *. float.floor(quotient)
      case remainder {
        r if r == 0.0 -> Ok(Nil)
        _ ->
          Error(InvalidValue(
            path: path,
            message: "Value " <> string.inspect(n) <> " is not a multiple of " <> string.inspect(divisor),
          ))
      }
    }
    None -> Ok(Nil)
  }
}
