import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/result
import gleam/string
import gleam/int
import gleam/float

pub type JsonValue {
  JsonNull
  JsonBool(Bool)
  JsonNumber(Float)
  JsonString(String)
  JsonArray(List(JsonValue))
  JsonObject(Dict(String, JsonValue))
}

pub type JsonError {
  UnexpectedType(expected: String, found: String)
  MissingField(field: String)
  InvalidJson(message: String)
  IndexOutOfBounds(index: Int, length: Int)
}

pub fn null() -> JsonValue {
  JsonNull
}

pub fn bool(value: Bool) -> JsonValue {
  JsonBool(value)
}

pub fn int(value: Int) -> JsonValue {
  JsonNumber(int.to_float(value))
}

pub fn float(value: Float) -> JsonValue {
  JsonNumber(value)
}

pub fn string(value: String) -> JsonValue {
  JsonString(value)
}

pub fn array(values: List(JsonValue)) -> JsonValue {
  JsonArray(values)
}

pub fn object(pairs: List(#(String, JsonValue))) -> JsonValue {
  JsonObject(dict.from_list(pairs))
}

pub fn nullable(value: Option(JsonValue)) -> JsonValue {
  case value {
    Some(v) -> v
    None -> JsonNull
  }
}

pub fn json_value_type(value: JsonValue) -> String {
  case value {
    JsonNull -> "Null"
    JsonBool(_) -> "Bool"
    JsonNumber(_) -> "Number"
    JsonString(_) -> "String"
    JsonArray(_) -> "Array"
    JsonObject(_) -> "Object"
  }
}

pub fn is_null(value: JsonValue) -> Bool {
  case value {
    JsonNull -> True
    _ -> False
  }
}

pub fn is_bool(value: JsonValue) -> Bool {
  case value {
    JsonBool(_) -> True
    _ -> False
  }
}

pub fn is_number(value: JsonValue) -> Bool {
  case value {
    JsonNumber(_) -> True
    _ -> False
  }
}

pub fn is_string(value: JsonValue) -> Bool {
  case value {
    JsonString(_) -> True
    _ -> False
  }
}

pub fn is_array(value: JsonValue) -> Bool {
  case value {
    JsonArray(_) -> True
    _ -> False
  }
}

pub fn is_object(value: JsonValue) -> Bool {
  case value {
    JsonObject(_) -> True
    _ -> False
  }
}

pub fn json_to_bool(value: JsonValue) -> Result(Bool, JsonError) {
  case value {
    JsonBool(b) -> Ok(b)
    _ -> Error(UnexpectedType(expected: "Bool", found: json_value_type(value)))
  }
}

pub fn json_to_number(value: JsonValue) -> Result(Float, JsonError) {
  case value {
    JsonNumber(n) -> Ok(n)
    _ -> Error(UnexpectedType(expected: "Number", found: json_value_type(value)))
  }
}

pub fn json_to_int(value: JsonValue) -> Result(Int, JsonError) {
  case value {
    JsonNumber(n) -> Ok(float.round(n))
    _ -> Error(UnexpectedType(expected: "Number", found: json_value_type(value)))
  }
}

pub fn json_to_string(value: JsonValue) -> Result(String, JsonError) {
  case value {
    JsonString(s) -> Ok(s)
    _ -> Error(UnexpectedType(expected: "String", found: json_value_type(value)))
  }
}

pub fn json_to_array(value: JsonValue) -> Result(List(JsonValue), JsonError) {
  case value {
    JsonArray(arr) -> Ok(arr)
    _ -> Error(UnexpectedType(expected: "Array", found: json_value_type(value)))
  }
}

pub fn json_to_object(value: JsonValue) -> Result(Dict(String, JsonValue), JsonError) {
  case value {
    JsonObject(obj) -> Ok(obj)
    _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(value)))
  }
}

pub fn json_to_option(value: JsonValue) -> Option(JsonValue) {
  case value {
    JsonNull -> None
    _ -> Some(value)
  }
}

pub fn get_field(value: JsonValue, field: String) -> Result(JsonValue, JsonError) {
  case value {
    JsonObject(obj) -> {
      case dict.get(obj, field) {
        Ok(v) -> Ok(v)
        Error(_) -> Error(MissingField(field: field))
      }
    }
    _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(value)))
  }
}

pub fn get_field_as(
  value: JsonValue,
  field: String,
  converter: fn(JsonValue) -> Result(a, JsonError),
) -> Result(a, JsonError) {
  get_field(value, field)
  |> result.try(converter)
}

pub fn get_index(value: JsonValue, index: Int) -> Result(JsonValue, JsonError) {
  case value {
    JsonArray(arr) -> {
      case nth(arr, index) {
        Ok(v) -> Ok(v)
        Error(_) -> Error(IndexOutOfBounds(index: index, length: list.length(arr)))
      }
    }
    _ -> Error(UnexpectedType(expected: "Array", found: json_value_type(value)))
  }
}

pub fn get_index_as(
  value: JsonValue,
  index: Int,
  converter: fn(JsonValue) -> Result(a, JsonError),
) -> Result(a, JsonError) {
  get_index(value, index)
  |> result.try(converter)
}

fn nth(lst: List(a), index: Int) -> Result(a, Nil) {
  case lst, index {
    [], _ -> Error(Nil)
    [first, ..rest], 0 -> Ok(first)
    [_, ..rest], n -> nth(rest, n - 1)
  }
}

pub fn map_json_array(
  value: JsonValue,
  f: fn(JsonValue) -> a,
) -> Result(List(a), JsonError) {
  case value {
    JsonArray(arr) -> Ok(list.map(arr, f))
    _ -> Error(UnexpectedType(expected: "Array", found: json_value_type(value)))
  }
}

pub fn filter_json_array(
  value: JsonValue,
  predicate: fn(JsonValue) -> Bool,
) -> Result(List(JsonValue), JsonError) {
  case value {
    JsonArray(arr) -> Ok(list.filter(arr, predicate))
    _ -> Error(UnexpectedType(expected: "Array", found: json_value_type(value)))
  }
}

pub fn keys(value: JsonValue) -> Result(List(String), JsonError) {
  case value {
    JsonObject(obj) -> Ok(dict.keys(obj))
    _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(value)))
  }
}

pub fn values(value: JsonValue) -> Result(List(JsonValue), JsonError) {
  case value {
    JsonObject(obj) -> Ok(dict.values(obj))
    _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(value)))
  }
}

pub fn merge_objects(base: JsonValue, override: JsonValue) -> Result(JsonValue, JsonError) {
  case base, override {
    JsonObject(base_dict), JsonObject(override_dict) -> {
      let merged = merge_dicts(base_dict, override_dict)
      Ok(JsonObject(merged))
    }
    _, _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(base)))
  }
}

fn merge_dicts(base: Dict(String, a), override: Dict(String, a)) -> Dict(String, a) {
  let base_list = dict.to_list(base)
  let override_list = dict.to_list(override)
  dict.from_list(list.append(base_list, override_list))
}

pub fn set_field(value: JsonValue, field: String, new_value: JsonValue) -> Result(JsonValue, JsonError) {
  case value {
    JsonObject(obj) -> Ok(JsonObject(dict.insert(obj, field, new_value)))
    _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(value)))
  }
}

pub fn remove_field(value: JsonValue, field: String) -> Result(JsonValue, JsonError) {
  case value {
    JsonObject(obj) -> Ok(JsonObject(dict.delete(obj, field)))
    _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(value)))
  }
}

pub fn array_length(value: JsonValue) -> Result(Int, JsonError) {
  case value {
    JsonArray(arr) -> Ok(list.length(arr))
    _ -> Error(UnexpectedType(expected: "Array", found: json_value_type(value)))
  }
}

pub fn object_length(value: JsonValue) -> Result(Int, JsonError) {
  case value {
    JsonObject(obj) -> Ok(dict.size(obj))
    _ -> Error(UnexpectedType(expected: "Object", found: json_value_type(value)))
  }
}

pub fn append_to_array(value: JsonValue, item: JsonValue) -> Result(JsonValue, JsonError) {
  case value {
    JsonArray(arr) -> Ok(JsonArray(list.append(arr, [item])))
    _ -> Error(UnexpectedType(expected: "Array", found: json_value_type(value)))
  }
}

pub fn prepend_to_array(value: JsonValue, item: JsonValue) -> Result(JsonValue, JsonError) {
  case value {
    JsonArray(arr) -> Ok(JsonArray([item, ..arr]))
    _ -> Error(UnexpectedType(expected: "Array", found: json_value_type(value)))
  }
}

pub fn path_get(value: JsonValue, path: List(String)) -> Result(JsonValue, JsonError) {
  list.try_fold(path, value, fn(current, key) {
    get_field(current, key)
  })
}

pub fn path_set(value: JsonValue, path: List(String), new_value: JsonValue) -> Result(JsonValue, JsonError) {
  case path {
    [] -> Ok(new_value)
    [key] -> set_field(value, key, new_value)
    [key, ..rest] -> {
      case get_field(value, key) {
        Ok(nested) -> {
          case path_set(nested, rest, new_value) {
            Ok(u) -> set_field(value, key, u)
            Error(e) -> Error(e)
          }
        }
        Error(_) -> {
          case path_set(JsonObject(dict.new()), rest, new_value) {
            Ok(u) -> set_field(value, key, u)
            Error(e) -> Error(e)
          }
        }
      }
    }
  }
}

pub fn encode(value: JsonValue) -> String {
  case value {
    JsonNull -> "null"
    JsonBool(b) -> {
      case b {
        True -> "true"
        False -> "false"
      }
    }
    JsonNumber(n) -> float.to_string(n)
    JsonString(s) -> "\"" <> escape_string(s) <> "\""
    JsonArray(arr) -> {
      let encoded_items = list.map(arr, encode)
      "[" <> string.join(encoded_items, ",") <> "]"
    }
    JsonObject(obj) -> {
      let pairs = 
        dict.to_list(obj)
        |> list.map(fn(pair) {
          let #(key, val) = pair
          "\"" <> escape_string(key) <> "\":" <> encode(val)
        })
      "{" <> string.join(pairs, ",") <> "}"
    }
  }
}

fn escape_string(s: String) -> String {
  s
  |> string.replace("\\", "\\\\")
  |> string.replace("\"", "\\\"")
  |> string.replace("\n", "\\n")
  |> string.replace("\r", "\\r")
  |> string.replace("\t", "\\t")
}
