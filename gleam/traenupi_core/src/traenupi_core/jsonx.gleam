import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/result
import gleam/string as str
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

pub type DecodeResult {
  DecodeResult(JsonValue, String)
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
    [first, ..], 0 -> Ok(first)
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
      "[" <> str.join(encoded_items, ",") <> "]"
    }
    JsonObject(obj) -> {
      let pairs = 
        dict.to_list(obj)
        |> list.map(fn(pair) {
          let #(key, val) = pair
          "\"" <> escape_string(key) <> "\":" <> encode(val)
        })
      "{" <> str.join(pairs, ",") <> "}"
    }
  }
}

fn escape_string(s: String) -> String {
  s
  |> str.replace("\\", "\\\\")
  |> str.replace("\"", "\\\"")
  |> str.replace("\n", "\\n")
  |> str.replace("\r", "\\r")
  |> str.replace("\t", "\\t")
}

pub fn decode(json: String) -> Result(JsonValue, JsonError) {
  let json = trim(json)
  case parse_value(json) {
    Ok(DecodeResult(value, remaining)) -> {
      let remaining = trim(remaining)
      case str.is_empty(remaining) {
        True -> Ok(value)
        False -> Error(InvalidJson(message: "Unexpected characters after JSON value: " <> remaining))
      }
    }
    Error(e) -> Error(e)
  }
}

fn trim(s: String) -> String {
  trim_left(s)
}

fn trim_left(s: String) -> String {
  case str.pop_grapheme(s) {
    Error(_) -> ""
    Ok(#(c, rest)) -> {
      case c == " " || c == "\n" || c == "\r" || c == "\t" {
        True -> trim_left(rest)
        False -> s
      }
    }
  }
}

fn parse_value(json: String) -> Result(DecodeResult, JsonError) {
  case str.pop_grapheme(json) {
    Error(_) -> Error(InvalidJson(message: "Empty input"))
    Ok(#("n", rest)) -> parse_null(rest)
    Ok(#("t", rest)) -> parse_true(rest)
    Ok(#("f", rest)) -> parse_false(rest)
    Ok(#("\"", rest)) -> parse_string(rest)
    Ok(#("[", rest)) -> parse_array(rest)
    Ok(#("{", rest)) -> parse_object(rest)
    Ok(#(c, _)) -> {
      case is_digit(c) || c == "-" {
        True -> parse_number(json)
        False -> Error(InvalidJson(message: "Unexpected character: " <> c))
      }
    }
  }
}

fn is_digit(c: String) -> Bool {
  c == "0" || c == "1" || c == "2" || c == "3" || c == "4"
  || c == "5" || c == "6" || c == "7" || c == "8" || c == "9"
}

fn parse_null(json: String) -> Result(DecodeResult, JsonError) {
  case str.slice(json, 0, 3) {
    "ull" -> Ok(DecodeResult(JsonNull, str.drop_start(json, 3)))
    _ -> Error(InvalidJson(message: "Expected 'null'"))
  }
}

fn parse_true(json: String) -> Result(DecodeResult, JsonError) {
  case str.slice(json, 0, 3) {
    "rue" -> Ok(DecodeResult(JsonBool(True), str.drop_start(json, 3)))
    _ -> Error(InvalidJson(message: "Expected 'true'"))
  }
}

fn parse_false(json: String) -> Result(DecodeResult, JsonError) {
  case str.slice(json, 0, 4) {
    "alse" -> Ok(DecodeResult(JsonBool(False), str.drop_start(json, 4)))
    _ -> Error(InvalidJson(message: "Expected 'false'"))
  }
}

fn parse_number(json: String) -> Result(DecodeResult, JsonError) {
  let #(num_str, remaining) = extract_number(json)
  case int.parse(num_str) {
    Ok(n) -> Ok(DecodeResult(JsonNumber(int.to_float(n)), remaining))
    Error(_) -> {
      case float.parse(num_str) {
        Ok(n) -> Ok(DecodeResult(JsonNumber(n), remaining))
        Error(_) -> Error(InvalidJson(message: "Invalid number: " <> num_str))
      }
    }
  }
}

fn extract_number(json: String) -> #(String, String) {
  extract_number_chars(json, "")
}

fn extract_number_chars(json: String, acc: String) -> #(String, String) {
  case str.pop_grapheme(json) {
    Error(_) -> #(acc, "")
    Ok(#(c, rest)) -> {
      case is_digit(c) || c == "-" || c == "+" || c == "." || c == "e" || c == "E" {
        True -> extract_number_chars(rest, acc <> c)
        False -> #(acc, json)
      }
    }
  }
}

fn parse_string(json: String) -> Result(DecodeResult, JsonError) {
  parse_string_chars(json, "")
}

fn parse_string_chars(json: String, acc: String) -> Result(DecodeResult, JsonError) {
  case str.pop_grapheme(json) {
    Error(_) -> Error(InvalidJson(message: "Unterminated string"))
    Ok(#("\\", rest)) -> {
      case str.pop_grapheme(rest) {
        Error(_) -> Error(InvalidJson(message: "Incomplete escape sequence"))
        Ok(#(escaped, rest2)) -> {
          let char = case escaped {
            "n" -> "\n"
            "r" -> "\r"
            "t" -> "\t"
            "\"" -> "\""
            "\\" -> "\\"
            _ -> escaped
          }
          parse_string_chars(rest2, acc <> char)
        }
      }
    }
    Ok(#("\"", rest)) -> Ok(DecodeResult(JsonString(acc), rest))
    Ok(#(c, rest)) -> parse_string_chars(rest, acc <> c)
  }
}

fn parse_array(json: String) -> Result(DecodeResult, JsonError) {
  let json = trim(json)
  case str.pop_grapheme(json) {
    Error(_) -> Error(InvalidJson(message: "Unterminated array"))
    Ok(#("]", rest)) -> Ok(DecodeResult(JsonArray([]), rest))
    Ok(_) -> parse_array_items(json, [])
  }
}

fn parse_array_items(json: String, acc: List(JsonValue)) -> Result(DecodeResult, JsonError) {
  case parse_value(json) {
    Ok(DecodeResult(v, rest)) -> {
      let rest = trim(rest)
      case str.pop_grapheme(rest) {
        Error(_) -> Error(InvalidJson(message: "Unterminated array"))
        Ok(#(",", rest2)) -> parse_array_items(trim(rest2), [v, ..acc])
        Ok(#("]", rest2)) -> Ok(DecodeResult(JsonArray(list.reverse([v, ..acc])), rest2))
        Ok(#(c, _)) -> Error(InvalidJson(message: "Expected ',' or ']' in array, got: " <> c))
      }
    }
    Error(e) -> Error(e)
  }
}

fn parse_object(json: String) -> Result(DecodeResult, JsonError) {
  let json = trim(json)
  case str.pop_grapheme(json) {
    Error(_) -> Error(InvalidJson(message: "Unterminated object"))
    Ok(#("}", rest)) -> Ok(DecodeResult(JsonObject(dict.new()), rest))
    Ok(_) -> parse_object_pairs(json, [])
  }
}

fn parse_object_pairs(json: String, acc: List(#(String, JsonValue))) -> Result(DecodeResult, JsonError) {
  let json = trim(json)
  case str.pop_grapheme(json) {
    Error(_) -> Error(InvalidJson(message: "Unterminated object"))
    Ok(#("\"", rest)) -> {
      case parse_string(rest) {
        Ok(DecodeResult(JsonString(key), rest2)) -> {
          parse_object_value(key, rest2, acc)
        }
        Ok(DecodeResult(_, _)) -> Error(InvalidJson(message: "Expected string key"))
        Error(e) -> Error(e)
      }
    }
    Ok(#(c, _)) -> Error(InvalidJson(message: "Expected string key in object, got: " <> c))
  }
}

fn parse_object_value(key: String, json: String, acc: List(#(String, JsonValue))) -> Result(DecodeResult, JsonError) {
  let json = trim(json)
  case str.pop_grapheme(json) {
    Error(_) -> Error(InvalidJson(message: "Expected ':' after key"))
    Ok(#(":", rest3)) -> {
      let rest3 = trim(rest3)
      case parse_value(rest3) {
        Ok(DecodeResult(v, rest4)) -> {
          parse_object_continue(key, v, rest4, acc)
        }
        Error(e) -> Error(e)
      }
    }
    Ok(#(c, _)) -> Error(InvalidJson(message: "Expected ':' after key, got: " <> c))
  }
}

fn parse_object_continue(key: String, value: JsonValue, json: String, acc: List(#(String, JsonValue))) -> Result(DecodeResult, JsonError) {
  let json = trim(json)
  case str.pop_grapheme(json) {
    Error(_) -> Error(InvalidJson(message: "Unterminated object"))
    Ok(#(",", rest5)) -> parse_object_pairs(trim(rest5), [#(key, value), ..acc])
    Ok(#("}", rest5)) -> Ok(DecodeResult(JsonObject(dict.from_list([#(key, value), ..acc])), rest5))
    Ok(#(c, _)) -> Error(InvalidJson(message: "Expected ',' or '}' in object, got: " <> c))
  }
}

pub fn type_name(value: JsonValue) -> String {
  case value {
    JsonNull -> "Null"
    JsonBool(_) -> "Bool"
    JsonNumber(_) -> "Number"
    JsonString(_) -> "String"
    JsonArray(_) -> "Array"
    JsonObject(_) -> "Object"
  }
}

pub fn array_to_list(value: JsonValue) -> List(JsonValue) {
  case value {
    JsonArray(arr) -> arr
    _ -> []
  }
}

pub fn list_to_array(values: List(JsonValue)) -> JsonValue {
  JsonArray(values)
}
