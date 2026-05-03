import gleam/dict
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/result
import gleam/float
import traenupi_core/jsonx.{type JsonValue, JsonNull, JsonBool, JsonNumber, JsonString, JsonArray, JsonObject}

pub type SchemaError {
  TypeMismatch(path: String, expected: String, found: String)
  MissingField(path: String, field: String)
  ExtraField(path: String, field: String)
  InvalidValue(path: String, message: String)
  ArrayItemError(path: String, index: Int, error: SchemaError)
  CustomError(path: String, message: String)
}

pub type Schema {
  NullSchema
  BoolSchema
  NumberSchema(NumberConstraints)
  StringSchema(StringConstraints)
  ArraySchema(ArrayConstraints)
  ObjectSchema(ObjectConstraints)
  OneOfSchema(schemas: List(Schema))
  AllOfSchema(schemas: List(Schema))
  AnyOfSchema(schemas: List(Schema))
  NotSchema(schema: Schema)
  ConstSchema(value: JsonValue)
  EnumSchema(values: List(JsonValue))
}

pub type NumberConstraints {
  NumberConstraints(
    minimum: Option(Float),
    maximum: Option(Float),
    exclusive_minimum: Option(Float),
    exclusive_maximum: Option(Float),
    multiple_of: Option(Float),
  )
}

pub type StringConstraints {
  StringConstraints(
    min_length: Option(Int),
    max_length: Option(Int),
    pattern: Option(String),
    format: Option(StringFormat),
  )
}

pub type StringFormat {
  EmailFormat
  UriFormat
  DateFormat
  TimeFormat
  DateTimeFormat
  UuidFormat
  HostnameFormat
  Ipv4Format
  Ipv6Format
}

pub type ArrayConstraints {
  ArrayConstraints(
    items: Option(Schema),
    min_items: Option(Int),
    max_items: Option(Int),
    unique_items: Bool,
  )
}

pub type ObjectConstraints {
  ObjectConstraints(
    properties: dict.Dict(String, Schema),
    required: List(String),
    additional_properties: Option(Schema),
    pattern_properties: dict.Dict(String, Schema),
    min_properties: Option(Int),
    max_properties: Option(Int),
  )
}

pub fn null() -> Schema {
  NullSchema
}

pub fn bool() -> Schema {
  BoolSchema
}

pub fn number() -> Schema {
  NumberSchema(NumberConstraints(
    minimum: None,
    maximum: None,
    exclusive_minimum: None,
    exclusive_maximum: None,
    multiple_of: None,
  ))
}

pub fn string() -> Schema {
  StringSchema(StringConstraints(
    min_length: None,
    max_length: None,
    pattern: None,
    format: None,
  ))
}

pub fn array() -> Schema {
  ArraySchema(ArrayConstraints(
    items: None,
    min_items: None,
    max_items: None,
    unique_items: False,
  ))
}

pub fn object() -> Schema {
  ObjectSchema(ObjectConstraints(
    properties: dict.new(),
    required: [],
    additional_properties: None,
    pattern_properties: dict.new(),
    min_properties: None,
    max_properties: None,
  ))
}

pub fn with_minimum(schema: Schema, min: Float) -> Schema {
  case schema {
    NumberSchema(c) -> NumberSchema(NumberConstraints(
      minimum: Some(min),
      maximum: c.maximum,
      exclusive_minimum: c.exclusive_minimum,
      exclusive_maximum: c.exclusive_maximum,
      multiple_of: c.multiple_of,
    ))
    _ -> schema
  }
}

pub fn with_maximum(schema: Schema, max: Float) -> Schema {
  case schema {
    NumberSchema(c) -> NumberSchema(NumberConstraints(
      minimum: c.minimum,
      maximum: Some(max),
      exclusive_minimum: c.exclusive_minimum,
      exclusive_maximum: c.exclusive_maximum,
      multiple_of: c.multiple_of,
    ))
    _ -> schema
  }
}

pub fn with_min_length(schema: Schema, min: Int) -> Schema {
  case schema {
    StringSchema(c) -> StringSchema(StringConstraints(
      min_length: Some(min),
      max_length: c.max_length,
      pattern: c.pattern,
      format: c.format,
    ))
    _ -> schema
  }
}

pub fn with_max_length(schema: Schema, max: Int) -> Schema {
  case schema {
    StringSchema(c) -> StringSchema(StringConstraints(
      min_length: c.min_length,
      max_length: Some(max),
      pattern: c.pattern,
      format: c.format,
    ))
    _ -> schema
  }
}

pub fn with_pattern(schema: Schema, pattern: String) -> Schema {
  case schema {
    StringSchema(c) -> StringSchema(StringConstraints(
      min_length: c.min_length,
      max_length: c.max_length,
      pattern: Some(pattern),
      format: c.format,
    ))
    _ -> schema
  }
}

pub fn with_items(schema: Schema, items: Schema) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: Some(items),
      min_items: c.min_items,
      max_items: c.max_items,
      unique_items: c.unique_items,
    ))
    _ -> schema
  }
}

pub fn with_min_items(schema: Schema, min: Int) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: c.items,
      min_items: Some(min),
      max_items: c.max_items,
      unique_items: c.unique_items,
    ))
    _ -> schema
  }
}

pub fn with_max_items(schema: Schema, max: Int) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: c.items,
      min_items: c.min_items,
      max_items: Some(max),
      unique_items: c.unique_items,
    ))
    _ -> schema
  }
}

pub fn unique_items(schema: Schema) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: c.items,
      min_items: c.min_items,
      max_items: c.max_items,
      unique_items: True,
    ))
    _ -> schema
  }
}

pub fn with_property(schema: Schema, name: String, property: Schema) -> Schema {
  case schema {
    ObjectSchema(c) -> {
      let properties = dict.insert(c.properties, name, property)
      ObjectSchema(ObjectConstraints(
        properties: properties,
        required: c.required,
        additional_properties: c.additional_properties,
        pattern_properties: c.pattern_properties,
        min_properties: c.min_properties,
        max_properties: c.max_properties,
      ))
    }
    _ -> schema
  }
}

pub fn with_required(schema: Schema, fields: List(String)) -> Schema {
  case schema {
    ObjectSchema(c) -> {
      let required = unique_strings(list.append(c.required, fields))
      ObjectSchema(ObjectConstraints(
        properties: c.properties,
        required: required,
        additional_properties: c.additional_properties,
        pattern_properties: c.pattern_properties,
        min_properties: c.min_properties,
        max_properties: c.max_properties,
      ))
    }
    _ -> schema
  }
}

pub fn with_additional_properties(schema: Schema, additional: Schema) -> Schema {
  case schema {
    ObjectSchema(c) -> ObjectSchema(ObjectConstraints(
      properties: c.properties,
      required: c.required,
      additional_properties: Some(additional),
      pattern_properties: c.pattern_properties,
      min_properties: c.min_properties,
      max_properties: c.max_properties,
    ))
    _ -> schema
  }
}

pub fn no_additional_properties(schema: Schema) -> Schema {
  case schema {
    ObjectSchema(c) -> ObjectSchema(ObjectConstraints(
      properties: c.properties,
      required: c.required,
      additional_properties: None,
      pattern_properties: c.pattern_properties,
      min_properties: c.min_properties,
      max_properties: c.max_properties,
    ))
    _ -> schema
  }
}

pub fn one_of(schemas: List(Schema)) -> Schema {
  OneOfSchema(schemas: schemas)
}

pub fn all_of(schemas: List(Schema)) -> Schema {
  AllOfSchema(schemas: schemas)
}

pub fn any_of(schemas: List(Schema)) -> Schema {
  AnyOfSchema(schemas: schemas)
}

pub fn not(schema: Schema) -> Schema {
  NotSchema(schema: schema)
}

pub fn const_value(value: JsonValue) -> Schema {
  ConstSchema(value: value)
}

pub fn enum_values(values: List(JsonValue)) -> Schema {
  EnumSchema(values: values)
}

pub fn validate(schema: Schema, value: JsonValue) -> Result(Nil, SchemaError) {
  validate_at(schema, value, "$")
}

fn validate_at(schema: Schema, value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case schema {
    NullSchema -> validate_null(value, path)
    BoolSchema -> validate_bool(value, path)
    NumberSchema(constraints) -> validate_number(value, constraints, path)
    StringSchema(constraints) -> validate_string(value, constraints, path)
    ArraySchema(constraints) -> validate_array(value, constraints, path)
    ObjectSchema(constraints) -> validate_object(value, constraints, path)
    OneOfSchema(schemas) -> validate_one_of(schemas, value, path)
    AllOfSchema(schemas) -> validate_all_of(schemas, value, path)
    AnyOfSchema(schemas) -> validate_any_of(schemas, value, path)
    NotSchema(inner) -> validate_not(inner, value, path)
    ConstSchema(expected) -> validate_const(expected, value, path)
    EnumSchema(values) -> validate_enum(values, value, path)
  }
}

fn validate_null(value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonNull -> Ok(Nil)
    _ -> Error(TypeMismatch(path: path, expected: "null", found: jsonx.type_name(value)))
  }
}

fn validate_bool(value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonBool(_) -> Ok(Nil)
    _ -> Error(TypeMismatch(path: path, expected: "boolean", found: jsonx.type_name(value)))
  }
}

fn validate_number(value: JsonValue, constraints: NumberConstraints, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonNumber(n) -> {
      let min_check = case constraints.minimum {
        Some(min) if n <. min -> Error(InvalidValue(path: path, message: "Value " <> string.inspect(n) <> " is less than minimum " <> string.inspect(min)))
        _ -> Ok(Nil)
      }
      
      case min_check {
        Error(e) -> Error(e)
        Ok(_) -> {
          let max_check = case constraints.maximum {
            Some(max) if n >. max -> Error(InvalidValue(path: path, message: "Value " <> string.inspect(n) <> " is greater than maximum " <> string.inspect(max)))
            _ -> Ok(Nil)
          }
          
          case max_check {
            Error(e) -> Error(e)
            Ok(_) -> {
              let exclusive_min_check = case constraints.exclusive_minimum {
                Some(min) if n <=. min -> Error(InvalidValue(path: path, message: "Value " <> string.inspect(n) <> " is not greater than exclusive minimum " <> string.inspect(min)))
                _ -> Ok(Nil)
              }
              
              case exclusive_min_check {
                Error(e) -> Error(e)
                Ok(_) -> {
                  let exclusive_max_check = case constraints.exclusive_maximum {
                    Some(max) if n >=. max -> Error(InvalidValue(path: path, message: "Value " <> string.inspect(n) <> " is not less than exclusive maximum " <> string.inspect(max)))
                    _ -> Ok(Nil)
                  }
                  
                  case exclusive_max_check {
                    Error(e) -> Error(e)
                    Ok(_) -> {
                      case constraints.multiple_of {
                        Some(divisor) -> {
                          let quotient = n /. divisor
                          let remainder = n -. divisor *. float.floor(quotient)
                          case remainder {
                            r if r == 0.0 -> Ok(Nil)
                            _ -> Error(InvalidValue(path: path, message: "Value " <> string.inspect(n) <> " is not a multiple of " <> string.inspect(divisor)))
                          }
                        }
                        None -> Ok(Nil)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    _ -> Error(TypeMismatch(path: path, expected: "number", found: jsonx.type_name(value)))
  }
}

fn validate_string(value: JsonValue, constraints: StringConstraints, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonString(s) -> {
      let len = string.length(s)
      
      let min_check = case constraints.min_length {
        Some(min) if len < min -> Error(InvalidValue(path: path, message: "String length " <> string.inspect(len) <> " is less than minimum " <> string.inspect(min)))
        _ -> Ok(Nil)
      }
      
      case min_check {
        Error(e) -> Error(e)
        Ok(_) -> {
          let max_check = case constraints.max_length {
            Some(max) if len > max -> Error(InvalidValue(path: path, message: "String length " <> string.inspect(len) <> " is greater than maximum " <> string.inspect(max)))
            _ -> Ok(Nil)
          }
          
          case max_check {
            Error(e) -> Error(e)
            Ok(_) -> {
              let pattern_check = case constraints.pattern {
                Some(_) -> {
                  Ok(Nil)
                }
                None -> Ok(Nil)
              }
              
              case pattern_check {
                Error(e) -> Error(e)
                Ok(_) -> {
                  case constraints.format {
                    Some(format) -> validate_format(s, format, path)
                    None -> Ok(Nil)
                  }
                }
              }
            }
          }
        }
      }
    }
    _ -> Error(TypeMismatch(path: path, expected: "string", found: jsonx.type_name(value)))
  }
}

fn validate_format(value: String, format: StringFormat, path: String) -> Result(Nil, SchemaError) {
  case format {
    EmailFormat -> {
      case string.contains(value, "@") {
        True -> Ok(Nil)
        False -> Error(InvalidValue(path: path, message: "Invalid email format"))
      }
    }
    UriFormat -> {
      case string.starts_with(value, "http://") || string.starts_with(value, "https://") {
        True -> Ok(Nil)
        False -> Error(InvalidValue(path: path, message: "Invalid URI format"))
      }
    }
    DateFormat -> {
      let parts = string.split(value, "-")
      case list.length(parts) {
        3 -> Ok(Nil)
        _ -> Error(InvalidValue(path: path, message: "Invalid date format (expected YYYY-MM-DD)"))
      }
    }
    TimeFormat -> {
      case string.contains(value, ":") {
        True -> Ok(Nil)
        False -> Error(InvalidValue(path: path, message: "Invalid time format"))
      }
    }
    DateTimeFormat -> {
      case string.contains(value, "T") && string.contains(value, ":") {
        True -> Ok(Nil)
        False -> Error(InvalidValue(path: path, message: "Invalid datetime format"))
      }
    }
    UuidFormat -> {
      case string.length(value) == 36 && string.contains(value, "-") {
        True -> Ok(Nil)
        False -> Error(InvalidValue(path: path, message: "Invalid UUID format"))
      }
    }
    HostnameFormat -> Ok(Nil)
    Ipv4Format -> {
      let parts = string.split(value, ".")
      case list.length(parts) {
        4 -> Ok(Nil)
        _ -> Error(InvalidValue(path: path, message: "Invalid IPv4 format"))
      }
    }
    Ipv6Format -> {
      case string.contains(value, ":") {
        True -> Ok(Nil)
        False -> Error(InvalidValue(path: path, message: "Invalid IPv6 format"))
      }
    }
  }
}

fn validate_array(value: JsonValue, constraints: ArrayConstraints, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonArray(items) -> {
      let len = list.length(items)
      
      let min_check = case constraints.min_items {
        Some(min) if len < min -> Error(InvalidValue(path: path, message: "Array length " <> string.inspect(len) <> " is less than minimum " <> string.inspect(min)))
        _ -> Ok(Nil)
      }
      
      case min_check {
        Error(e) -> Error(e)
        Ok(_) -> {
          let max_check = case constraints.max_items {
            Some(max) if len > max -> Error(InvalidValue(path: path, message: "Array length " <> string.inspect(len) <> " is greater than maximum " <> string.inspect(max)))
            _ -> Ok(Nil)
          }
          
          case max_check {
            Error(e) -> Error(e)
            Ok(_) -> {
              let unique_check = case constraints.unique_items {
                True -> validate_unique_items(items, path)
                False -> Ok(Nil)
              }
              
              case unique_check {
                Error(e) -> Error(e)
                Ok(_) -> {
                  case constraints.items {
                    Some(item_schema) -> validate_array_items(items, item_schema, path, 0)
                    None -> Ok(Nil)
                  }
                }
              }
            }
          }
        }
      }
    }
    _ -> Error(TypeMismatch(path: path, expected: "array", found: jsonx.type_name(value)))
  }
}

fn validate_unique_items(items: List(JsonValue), path: String) -> Result(Nil, SchemaError) {
  case items {
    [] -> Ok(Nil)
    [first, ..rest] -> {
      case list_has(rest, first) {
        True -> Error(InvalidValue(path: path, message: "Array contains duplicate items"))
        False -> validate_unique_items(rest, path)
      }
    }
  }
}

fn list_has(list: List(JsonValue), value: JsonValue) -> Bool {
  case list {
    [] -> False
    [first, ..rest] -> {
      case json_equal(first, value) {
        True -> True
        False -> list_has(rest, value)
      }
    }
  }
}

fn json_equal(a: JsonValue, b: JsonValue) -> Bool {
  case a, b {
    JsonNull, JsonNull -> True
    JsonBool(x), JsonBool(y) -> x == y
    JsonNumber(x), JsonNumber(y) -> x == y
    JsonString(x), JsonString(y) -> x == y
    JsonArray(x), JsonArray(y) -> list_equal(x, y)
    JsonObject(x), JsonObject(y) -> dict_equal(x, y)
    _, _ -> False
  }
}

fn list_equal(a: List(JsonValue), b: List(JsonValue)) -> Bool {
  case a, b {
    [], [] -> True
    [x, ..xs], [y, ..ys] -> json_equal(x, y) && list_equal(xs, ys)
    _, _ -> False
  }
}

fn dict_equal(a: dict.Dict(String, JsonValue), b: dict.Dict(String, JsonValue)) -> Bool {
  let a_keys = dict.keys(a)
  let b_keys = dict.keys(b)
  
  case list.length(a_keys) == list.length(b_keys) {
    False -> False
    True -> {
      let all_match = list.all(a_keys, fn(key) {
        case dict.get(a, key), dict.get(b, key) {
          Ok(x), Ok(y) -> json_equal(x, y)
          _, _ -> False
        }
      })
      all_match
    }
  }
}

fn validate_array_items(items: List(JsonValue), schema: Schema, path: String, index: Int) -> Result(Nil, SchemaError) {
  case items {
    [] -> Ok(Nil)
    [first, ..rest] -> {
      let item_path = path <> "[" <> string.inspect(index) <> "]"
      case validate_at(schema, first, item_path) {
        Error(e) -> Error(ArrayItemError(path: path, index: index, error: e))
        Ok(_) -> validate_array_items(rest, schema, path, index + 1)
      }
    }
  }
}

fn validate_object(value: JsonValue, constraints: ObjectConstraints, path: String) -> Result(Nil, SchemaError) {
  case value {
    JsonObject(obj) -> {
      let keys = dict.keys(obj)
      let len = list.length(keys)
      
      let min_check = case constraints.min_properties {
        Some(min) if len < min -> Error(InvalidValue(path: path, message: "Object has " <> string.inspect(len) <> " properties, minimum is " <> string.inspect(min)))
        _ -> Ok(Nil)
      }
      
      case min_check {
        Error(e) -> Error(e)
        Ok(_) -> {
          let max_check = case constraints.max_properties {
            Some(max) if len > max -> Error(InvalidValue(path: path, message: "Object has " <> string.inspect(len) <> " properties, maximum is " <> string.inspect(max)))
            _ -> Ok(Nil)
          }
          
          case max_check {
            Error(e) -> Error(e)
            Ok(_) -> {
              let required_check = validate_required(obj, constraints.required, path)
              
              case required_check {
                Error(e) -> Error(e)
                Ok(_) -> {
                  let properties_check = validate_properties(obj, constraints.properties, path)
                  
                  case properties_check {
                    Error(e) -> Error(e)
                    Ok(_) -> {
                      case constraints.additional_properties {
                        Some(additional_schema) -> {
                          validate_additional_properties(obj, constraints.properties, additional_schema, path)
                        }
                        None -> Ok(Nil)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    _ -> Error(TypeMismatch(path: path, expected: "object", found: jsonx.type_name(value)))
  }
}

fn validate_required(obj: dict.Dict(String, JsonValue), required: List(String), path: String) -> Result(Nil, SchemaError) {
  case required {
    [] -> Ok(Nil)
    [field, ..rest] -> {
      case dict.has_key(obj, field) {
        True -> validate_required(obj, rest, path)
        False -> Error(MissingField(path: path, field: field))
      }
    }
  }
}

fn validate_properties(obj: dict.Dict(String, JsonValue), properties: dict.Dict(String, Schema), path: String) -> Result(Nil, SchemaError) {
  let prop_list = dict.to_list(properties)
  validate_property_list(obj, prop_list, path)
}

fn validate_property_list(obj: dict.Dict(String, JsonValue), properties: List(#(String, Schema)), path: String) -> Result(Nil, SchemaError) {
  case properties {
    [] -> Ok(Nil)
    [#(name, schema), ..rest] -> {
      case dict.get(obj, name) {
        Ok(value) -> {
          let prop_path = path <> "." <> name
          case validate_at(schema, value, prop_path) {
            Error(e) -> Error(e)
            Ok(_) -> validate_property_list(obj, rest, path)
          }
        }
        Error(_) -> validate_property_list(obj, rest, path)
      }
    }
  }
}

fn validate_additional_properties(obj: dict.Dict(String, JsonValue), properties: dict.Dict(String, Schema), additional_schema: Schema, path: String) -> Result(Nil, SchemaError) {
  let keys = dict.keys(obj)
  validate_additional_keys(obj, keys, properties, additional_schema, path)
}

fn validate_additional_keys(obj: dict.Dict(String, JsonValue), keys: List(String), properties: dict.Dict(String, Schema), additional_schema: Schema, path: String) -> Result(Nil, SchemaError) {
  case keys {
    [] -> Ok(Nil)
    [key, ..rest] -> {
      case dict.has_key(properties, key) {
        True -> validate_additional_keys(obj, rest, properties, additional_schema, path)
        False -> {
          case dict.get(obj, key) {
            Ok(value) -> {
              let prop_path = path <> "." <> key
              case validate_at(additional_schema, value, prop_path) {
                Error(e) -> Error(e)
                Ok(_) -> validate_additional_keys(obj, rest, properties, additional_schema, path)
              }
            }
            Error(_) -> validate_additional_keys(obj, rest, properties, additional_schema, path)
          }
        }
      }
    }
  }
}

fn validate_one_of(schemas: List(Schema), value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  let results = list.map(schemas, fn(schema) { validate_at(schema, value, path) })
  let successes = list.filter(results, fn(r) { result.is_ok(r) })
  
  case list.length(successes) {
    1 -> Ok(Nil)
    0 -> Error(InvalidValue(path: path, message: "Value does not match any of the oneOf schemas"))
    _ -> Error(InvalidValue(path: path, message: "Value matches more than one oneOf schema"))
  }
}

fn validate_all_of(schemas: List(Schema), value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case schemas {
    [] -> Ok(Nil)
    [schema, ..rest] -> {
      case validate_at(schema, value, path) {
        Error(e) -> Error(e)
        Ok(_) -> validate_all_of(rest, value, path)
      }
    }
  }
}

fn validate_any_of(schemas: List(Schema), value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  let results = list.map(schemas, fn(schema) { validate_at(schema, value, path) })
  let successes = list.filter(results, fn(r) { result.is_ok(r) })
  
  case successes != [] {
    True -> Ok(Nil)
    False -> Error(InvalidValue(path: path, message: "Value does not match any of the anyOf schemas"))
  }
}

fn validate_not(schema: Schema, value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case validate_at(schema, value, path) {
    Error(_) -> Ok(Nil)
    Ok(_) -> Error(InvalidValue(path: path, message: "Value should not match the schema"))
  }
}

fn validate_const(expected: JsonValue, value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case json_equal(expected, value) {
    True -> Ok(Nil)
    False -> Error(InvalidValue(path: path, message: "Value does not match const"))
  }
}

fn validate_enum(values: List(JsonValue), value: JsonValue, path: String) -> Result(Nil, SchemaError) {
  case list_has(values, value) {
    True -> Ok(Nil)
    False -> Error(InvalidValue(path: path, message: "Value is not one of the enum values"))
  }
}

pub fn error_to_string(error: SchemaError) -> String {
  case error {
    TypeMismatch(path, expected, found) -> 
      "Type mismatch at " <> path <> ": expected " <> expected <> ", found " <> found
    MissingField(path, field) -> 
      "Missing required field at " <> path <> ": " <> field
    ExtraField(path, field) -> 
      "Extra field at " <> path <> ": " <> field
    InvalidValue(path, message) -> 
      "Invalid value at " <> path <> ": " <> message
    ArrayItemError(path, index, error) -> 
      "Array item error at " <> path <> "[" <> string.inspect(index) <> "]: " <> error_to_string(error)
    CustomError(path, message) -> 
      "Error at " <> path <> ": " <> message
  }
}

fn unique_strings(list: List(String)) -> List(String) {
  unique_strings_acc(list, [])
}

fn unique_strings_acc(list: List(String), acc: List(String)) -> List(String) {
  case list {
    [] -> list.reverse(acc)
    [first, ..rest] -> {
      case list.contains(acc, first) {
        True -> unique_strings_acc(rest, acc)
        False -> unique_strings_acc(rest, [first, ..acc])
      }
    }
  }
}
