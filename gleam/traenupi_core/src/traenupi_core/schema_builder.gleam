import gleam/dict
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import gleam/float
import gleam/int
import traenupi_core/jsonx.{type JsonValue, JsonNull, JsonBool, JsonNumber, JsonString, JsonArray, JsonObject}
import traenupi_core/schema.{
  type Schema, NullSchema, BoolSchema, NumberSchema, StringSchema, ArraySchema, ObjectSchema,
  OneOfSchema, AllOfSchema, AnyOfSchema, NotSchema, ConstSchema, EnumSchema,
  type NumberConstraints, NumberConstraints, type StringConstraints, StringConstraints,
  type ArrayConstraints, ArrayConstraints, type ObjectConstraints, ObjectConstraints,
  type StringFormat, EmailFormat, UriFormat, DateFormat, TimeFormat, DateTimeFormat, UuidFormat, HostnameFormat, Ipv4Format, Ipv6Format,
  all_of, any_of,
}

pub fn schema_to_json(schema: Schema) -> JsonValue {
  case schema {
    NullSchema -> JsonObject(dict.from_list([#("type", JsonString("null"))]))
    BoolSchema -> JsonObject(dict.from_list([#("type", JsonString("boolean"))]))
    NumberSchema(constraints) -> number_schema_to_json(constraints)
    StringSchema(constraints) -> string_schema_to_json(constraints)
    ArraySchema(constraints) -> array_schema_to_json(constraints)
    ObjectSchema(constraints) -> object_schema_to_json(constraints)
    OneOfSchema(schemas) -> JsonObject(dict.from_list([
      #("oneOf", JsonArray(list.map(schemas, schema_to_json)))
    ]))
    AllOfSchema(schemas) -> JsonObject(dict.from_list([
      #("allOf", JsonArray(list.map(schemas, schema_to_json)))
    ]))
    AnyOfSchema(schemas) -> JsonObject(dict.from_list([
      #("anyOf", JsonArray(list.map(schemas, schema_to_json)))
    ]))
    NotSchema(inner) -> JsonObject(dict.from_list([
      #("not", schema_to_json(inner))
    ]))
    ConstSchema(value) -> JsonObject(dict.from_list([
      #("const", value)
    ]))
    EnumSchema(values) -> JsonObject(dict.from_list([
      #("enum", JsonArray(values))
    ]))
  }
}

fn number_schema_to_json(constraints: NumberConstraints) -> JsonValue {
  let base = dict.from_list([#("type", JsonString("number"))])
  
  let base = case constraints.minimum {
    Some(min) -> dict.insert(base, "minimum", JsonNumber(min))
    None -> base
  }
  
  let base = case constraints.maximum {
    Some(max) -> dict.insert(base, "maximum", JsonNumber(max))
    None -> base
  }
  
  let base = case constraints.exclusive_minimum {
    Some(min) -> dict.insert(base, "exclusiveMinimum", JsonNumber(min))
    None -> base
  }
  
  let base = case constraints.exclusive_maximum {
    Some(max) -> dict.insert(base, "exclusiveMaximum", JsonNumber(max))
    None -> base
  }
  
  let base = case constraints.multiple_of {
    Some(multiple) -> dict.insert(base, "multipleOf", JsonNumber(multiple))
    None -> base
  }
  
  JsonObject(base)
}

fn string_schema_to_json(constraints: StringConstraints) -> JsonValue {
  let base = dict.from_list([#("type", JsonString("string"))])
  
  let base = case constraints.min_length {
    Some(min) -> dict.insert(base, "minLength", JsonNumber(int.to_float(min)))
    None -> base
  }
  
  let base = case constraints.max_length {
    Some(max) -> dict.insert(base, "maxLength", JsonNumber(int.to_float(max)))
    None -> base
  }
  
  let base = case constraints.pattern {
    Some(pattern) -> dict.insert(base, "pattern", JsonString(pattern))
    None -> base
  }
  
  let base = case constraints.format {
    Some(format) -> dict.insert(base, "format", JsonString(format_to_string(format)))
    None -> base
  }
  
  JsonObject(base)
}

fn format_to_string(format: StringFormat) -> String {
  case format {
    EmailFormat -> "email"
    UriFormat -> "uri"
    DateFormat -> "date"
    TimeFormat -> "time"
    DateTimeFormat -> "date-time"
    UuidFormat -> "uuid"
    HostnameFormat -> "hostname"
    Ipv4Format -> "ipv4"
    Ipv6Format -> "ipv6"
  }
}

fn array_schema_to_json(constraints: ArrayConstraints) -> JsonValue {
  let base = dict.from_list([#("type", JsonString("array"))])
  
  let base = case constraints.items {
    Some(items_schema) -> dict.insert(base, "items", schema_to_json(items_schema))
    None -> base
  }
  
  let base = case constraints.min_items {
    Some(min) -> dict.insert(base, "minItems", JsonNumber(int.to_float(min)))
    None -> base
  }
  
  let base = case constraints.max_items {
    Some(max) -> dict.insert(base, "maxItems", JsonNumber(int.to_float(max)))
    None -> base
  }
  
  let base = case constraints.unique_items {
    True -> dict.insert(base, "uniqueItems", JsonBool(True))
    False -> base
  }
  
  JsonObject(base)
}

fn object_schema_to_json(constraints: ObjectConstraints) -> JsonValue {
  let base = dict.from_list([#("type", JsonString("object"))])
  
  let properties = dict.map_values(constraints.properties, fn(_, schema) {
    schema_to_json(schema)
  })
  
  let base = case dict.size(properties) > 0 {
    True -> dict.insert(base, "properties", JsonObject(properties))
    False -> base
  }
  
  let base = case constraints.required {
    [] -> base
    fields -> dict.insert(base, "required", JsonArray(list.map(fields, JsonString)))
  }
  
  let base = case constraints.additional_properties {
    Some(additional_schema) -> dict.insert(base, "additionalProperties", schema_to_json(additional_schema))
    None -> dict.insert(base, "additionalProperties", JsonBool(False))
  }
  
  let base = case constraints.min_properties {
    Some(min) -> dict.insert(base, "minProperties", JsonNumber(int.to_float(min)))
    None -> base
  }
  
  let base = case constraints.max_properties {
    Some(max) -> dict.insert(base, "maxProperties", JsonNumber(int.to_float(max)))
    None -> base
  }
  
  JsonObject(base)
}

pub fn schema_to_string(schema: Schema) -> String {
  let json = schema_to_json(schema)
  json_to_pretty_string(json, 0)
}

fn json_to_pretty_string(json: JsonValue, indent: Int) -> String {
  let indent_str = string.repeat("  ", indent)
  let next_indent = indent + 1
  let next_indent_str = string.repeat("  ", next_indent)
  
  case json {
    JsonNull -> "null"
    JsonBool(True) -> "true"
    JsonBool(False) -> "false"
    JsonNumber(n) -> {
      let truncated = float.truncate(n)
      case int.to_float(truncated) == n {
        True -> int.to_string(truncated)
        False -> float.to_string(n)
      }
    }
    JsonString(s) -> "\"" <> escape_json_string(s) <> "\""
    JsonArray(items) -> {
      case items {
        [] -> "[]"
        _ -> {
          let formatted = list.map(items, fn(item) {
            next_indent_str <> json_to_pretty_string(item, next_indent)
          })
          "[\n" <> string.join(formatted, ",\n") <> "\n" <> indent_str <> "]"
        }
      }
    }
    JsonObject(obj) -> {
      case dict.size(obj) {
        0 -> "{}"
        _ -> {
          let pairs = dict.to_list(obj)
          let formatted = list.map(pairs, fn(pair) {
            let #(key, value) = pair
            next_indent_str <> "\"" <> escape_json_string(key) <> "\": " <> json_to_pretty_string(value, next_indent)
          })
          "{\n" <> string.join(formatted, ",\n") <> "\n" <> indent_str <> "}"
        }
      }
    }
  }
}

fn escape_json_string(s: String) -> String {
  s
  |> string.replace("\\", "\\\\")
  |> string.replace("\"", "\\\"")
  |> string.replace("\n", "\\n")
  |> string.replace("\r", "\\r")
  |> string.replace("\t", "\\t")
}

pub fn merge_schemas(base: Schema, override: Schema) -> Schema {
  all_of([base, override])
}

pub fn make_nullable(schema: Schema) -> Schema {
  any_of([schema, NullSchema])
}

pub fn string_schema() -> Schema {
  StringSchema(StringConstraints(
    min_length: None,
    max_length: None,
    pattern: None,
    format: None,
  ))
}

pub fn number_schema() -> Schema {
  NumberSchema(NumberConstraints(
    minimum: None,
    maximum: None,
    exclusive_minimum: None,
    exclusive_maximum: None,
    multiple_of: None,
  ))
}

pub fn integer_schema() -> Schema {
  NumberSchema(NumberConstraints(
    minimum: None,
    maximum: None,
    exclusive_minimum: None,
    exclusive_maximum: None,
    multiple_of: Some(1.0),
  ))
}

pub fn array_schema() -> Schema {
  ArraySchema(ArrayConstraints(
    items: None,
    min_items: None,
    max_items: None,
    unique_items: False,
  ))
}

pub fn object_schema() -> Schema {
  ObjectSchema(ObjectConstraints(
    properties: dict.new(),
    required: [],
    additional_properties: None,
    pattern_properties: dict.new(),
    min_properties: None,
    max_properties: None,
  ))
}

pub fn boolean_schema() -> Schema {
  BoolSchema
}

pub fn null_schema() -> Schema {
  NullSchema
}
