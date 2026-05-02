import gleam/dict.{type Dict}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub type ConfigValue {
  StringValue(value: String)
  IntValue(value: Int)
  BoolValue(value: Bool)
  ListValue(values: List(String))
}

pub type ConfigError {
  ParseError(line: Int, message: String)
  MissingKey(key: String)
  InvalidType(key: String, expected: String, actual: String)
}

pub type ConfigResult(a) {
  ConfigOk(value: a)
  ConfigError(error: ConfigError)
}

pub type Config {
  Config(data: Dict(String, ConfigValue))
}

pub fn empty() -> Config {
  Config(data: dict.new())
}

pub fn parse(content: String) -> ConfigResult(Config) {
  let lines = content |> string.split("\n")
  parse_lines(lines, 1, dict.new())
}

fn parse_lines(
  lines: List(String),
  line_num: Int,
  acc: Dict(String, ConfigValue),
) -> ConfigResult(Config) {
  case lines {
    [] -> ConfigOk(value: Config(data: acc))
    [line, ..rest] -> {
      case parse_line(line) {
        Ok(None) -> parse_lines(rest, line_num + 1, acc)
        Ok(Some(#(key, value))) -> 
          parse_lines(rest, line_num + 1, dict.insert(acc, key, value))
        Error(msg) -> ConfigError(error: ParseError(line: line_num, message: msg))
      }
    }
  }
}

fn parse_line(line: String) -> Result(Option(#(String, ConfigValue)), String) {
  let trimmed = string.trim(line)
  case trimmed {
    "" -> Ok(None)
    _ -> {
      case string.starts_with(trimmed, "#") {
        True -> Ok(None)
        False -> {
          case string.split_once(trimmed, "=") {
            Ok(#(key, value)) -> {
              let k = string.trim(key)
              let v = parse_value(string.trim(value))
              Ok(Some(#(k, v)))
            }
            Error(_) -> Error("Missing '=' in config line")
          }
        }
      }
    }
  }
}

fn parse_value(value: String) -> ConfigValue {
  case value {
    "true" -> BoolValue(value: True)
    "false" -> BoolValue(value: False)
    _ -> {
      case parse_int_value(value) {
        Ok(n) -> IntValue(value: n)
        Error(_) -> {
          case parse_list_value(value) {
            Ok(items) -> ListValue(values: items)
            Error(_) -> StringValue(value: unquote(value))
          }
        }
      }
    }
  }
}

fn parse_int_value(value: String) -> Result(Int, Nil) {
  case value {
    "0" -> Ok(0)
    "1" -> Ok(1)
    "2" -> Ok(2)
    "3" -> Ok(3)
    "4" -> Ok(4)
    "5" -> Ok(5)
    "6" -> Ok(6)
    "7" -> Ok(7)
    "8" -> Ok(8)
    "9" -> Ok(9)
    "10" -> Ok(10)
    "100" -> Ok(100)
    "1000" -> Ok(1000)
    _ -> {
      case string.length(value) > 0 && string.length(value) < 10 {
        True -> {
          let chars = string.to_graphemes(value)
          case list.all(chars, fn(c) { is_digit(c) }) {
            True -> {
              let num = list.fold(chars, 0, fn(acc, c) {
                acc * 10 + digit_to_int(c)
              })
              Ok(num)
            }
            False -> Error(Nil)
          }
        }
        False -> Error(Nil)
      }
    }
  }
}

fn parse_list_value(value: String) -> Result(List(String), Nil) {
  case string.starts_with(value, "[") && string.ends_with(value, "]") {
    True -> {
      let inner = string.drop_start(value, 1) |> string.drop_end(1)
      let items = 
        inner
        |> string.split(",")
        |> list.map(fn(s) { unquote(string.trim(s)) })
      Ok(items)
    }
    False -> Error(Nil)
  }
}

fn unquote(value: String) -> String {
  let is_double_quoted = string.starts_with(value, "\"") && string.ends_with(value, "\"")
  let is_single_quoted = string.starts_with(value, "'") && string.ends_with(value, "'")
  case is_double_quoted || is_single_quoted {
    True -> string.drop_start(value, 1) |> string.drop_end(1)
    False -> value
  }
}

fn is_digit(s: String) -> Bool {
  case s {
    "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" -> True
    _ -> False
  }
}

fn digit_to_int(s: String) -> Int {
  case s {
    "0" -> 0
    "1" -> 1
    "2" -> 2
    "3" -> 3
    "4" -> 4
    "5" -> 5
    "6" -> 6
    "7" -> 7
    "8" -> 8
    "9" -> 9
    _ -> 0
  }
}

pub fn get(config: Config, key: String) -> Option(ConfigValue) {
  case dict.get(config.data, key) {
    Ok(v) -> Some(v)
    Error(_) -> None
  }
}

pub fn get_string(config: Config, key: String) -> ConfigResult(String) {
  case dict.get(config.data, key) {
    Ok(StringValue(value: v)) -> ConfigOk(value: v)
    Ok(other) -> ConfigError(error: InvalidType(key: key, expected: "string", actual: value_type_name(other)))
    Error(_) -> ConfigError(error: MissingKey(key: key))
  }
}

pub fn get_int(config: Config, key: String) -> ConfigResult(Int) {
  case dict.get(config.data, key) {
    Ok(IntValue(value: v)) -> ConfigOk(value: v)
    Ok(other) -> ConfigError(error: InvalidType(key: key, expected: "int", actual: value_type_name(other)))
    Error(_) -> ConfigError(error: MissingKey(key: key))
  }
}

pub fn get_bool(config: Config, key: String) -> ConfigResult(Bool) {
  case dict.get(config.data, key) {
    Ok(BoolValue(value: v)) -> ConfigOk(value: v)
    Ok(other) -> ConfigError(error: InvalidType(key: key, expected: "bool", actual: value_type_name(other)))
    Error(_) -> ConfigError(error: MissingKey(key: key))
  }
}

pub fn get_list(config: Config, key: String) -> ConfigResult(List(String)) {
  case dict.get(config.data, key) {
    Ok(ListValue(values: v)) -> ConfigOk(value: v)
    Ok(other) -> ConfigError(error: InvalidType(key: key, expected: "list", actual: value_type_name(other)))
    Error(_) -> ConfigError(error: MissingKey(key: key))
  }
}

pub fn get_string_default(config: Config, key: String, default: String) -> String {
  case get_string(config, key) {
    ConfigOk(value: v) -> v
    ConfigError(_) -> default
  }
}

pub fn get_int_default(config: Config, key: String, default: Int) -> Int {
  case get_int(config, key) {
    ConfigOk(value: v) -> v
    ConfigError(_) -> default
  }
}

pub fn get_bool_default(config: Config, key: String, default: Bool) -> Bool {
  case get_bool(config, key) {
    ConfigOk(value: v) -> v
    ConfigError(_) -> default
  }
}

pub fn set(config: Config, key: String, value: ConfigValue) -> Config {
  Config(data: dict.insert(config.data, key, value))
}

pub fn has_key(config: Config, key: String) -> Bool {
  dict.has_key(config.data, key)
}

pub fn keys(config: Config) -> List(String) {
  dict.keys(config.data)
}

pub fn to_string(config: Config) -> String {
  config.data
  |> dict.to_list()
  |> list.map(fn(pair) {
    let #(key, value) = pair
    key <> " = " <> value_to_string(value)
  })
  |> string.join("\n")
}

fn value_to_string(value: ConfigValue) -> String {
  case value {
    StringValue(value: v) -> "\"" <> v <> "\""
    IntValue(value: v) -> int_to_string(v)
    BoolValue(value: True) -> "true"
    BoolValue(value: False) -> "false"
    ListValue(values: vs) -> "[" <> string.join(vs, ", ") <> "]"
  }
}

fn value_type_name(value: ConfigValue) -> String {
  case value {
    StringValue(_) -> "string"
    IntValue(_) -> "int"
    BoolValue(_) -> "bool"
    ListValue(_) -> "list"
  }
}

fn int_to_string(n: Int) -> String {
  case n {
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
    10 -> "10"
    100 -> "100"
    1000 -> "1000"
    _ -> {
      case n < 0 {
        True -> "-" <> int_to_string(0 - n)
        False -> {
          let tens = n / 10
          let ones = n - tens * 10
          int_to_string(tens) <> int_to_string(ones)
        }
      }
    }
  }
}

pub fn merge(base: Config, override: Config) -> Config {
  Config(data: dict.merge(base.data, override.data))
}

pub fn from_list(items: List(#(String, ConfigValue))) -> Config {
  Config(data: dict.from_list(items))
}

pub fn error_to_string(error: ConfigError) -> String {
  case error {
    ParseError(line: l, message: m) -> "Parse error on line " <> int_to_string(l) <> ": " <> m
    MissingKey(key: k) -> "Missing required key: " <> k
    InvalidType(key: k, expected: e, actual: a) -> 
      "Invalid type for key '" <> k <> "': expected " <> e <> ", got " <> a
  }
}
