import gleam/dict
import gleam/list
import gleam/int
import gleam/string as str
import gleam/option.{type Option, None, Some}
import traenupi_core/jsonx.{type JsonValue, JsonArray, JsonObject}

pub type JsonPathError {
  InvalidPath(message: String)
  PathNotFound(path: String)
  InvalidIndex(index: Int, length: Int)
  TypeMismatch(expected: String, found: String)
}

pub type PathSegment {
  Root
  Field(name: String)
  Index(idx: Int)
  Wildcard
  RecursiveField(name: String)
  Slice(start: Option(Int), stop: Option(Int), step: Option(Int))
}

pub type JsonPath {
  JsonPath(segments: List(PathSegment))
}

pub fn parse(path: String) -> Result(JsonPath, JsonPathError) {
  case path {
    "$" -> Ok(JsonPath(segments: [Root]))
    "" -> Error(InvalidPath(message: "Empty path"))
    _ -> {
      case str.first(path) {
        Ok("$") -> parse_segments(str.drop_start(path, 1))
        _ -> Error(InvalidPath(message: "Path must start with $"))
      }
    }
  }
}

fn parse_segments(path: String) -> Result(JsonPath, JsonPathError) {
  case path {
    "" -> Ok(JsonPath(segments: [Root]))
    _ -> {
      let segments = parse_all_segments(path, [])
      case segments {
        Ok(segs) -> Ok(JsonPath(segments: [Root, ..segs]))
        Error(e) -> Error(e)
      }
    }
  }
}

fn parse_all_segments(path: String, acc: List(PathSegment)) -> Result(List(PathSegment), JsonPathError) {
  case path {
    "" -> Ok(list.reverse(acc))
    _ -> {
      case parse_single_segment(path) {
        Ok(#(segment, remaining)) -> parse_all_segments(remaining, [segment, ..acc])
        Error(e) -> Error(e)
      }
    }
  }
}

fn parse_single_segment(path: String) -> Result(#(PathSegment, String), JsonPathError) {
  case str.first(path) {
    Ok(".") -> {
      case str.first(str.drop_start(path, 1)) {
        Ok(".") -> {
          let rest = str.drop_start(path, 2)
          parse_recursive_field(rest)
        }
        Ok("*") -> Ok(#(Wildcard, str.drop_start(path, 2)))
        _ -> parse_field(str.drop_start(path, 1))
      }
    }
    Ok("[") -> parse_bracket(str.drop_start(path, 1))
    _ -> Error(InvalidPath(message: "Unexpected character in path: " <> path))
  }
}

fn parse_field(path: String) -> Result(#(PathSegment, String), JsonPathError) {
  let field_name = take_identifier(path)
  case field_name {
    "" -> Error(InvalidPath(message: "Expected field name"))
    _ -> Ok(#(Field(field_name), str.drop_start(path, str.length(field_name))))
  }
}

fn parse_recursive_field(path: String) -> Result(#(PathSegment, String), JsonPathError) {
  let field_name = take_identifier(path)
  case field_name {
    "" -> Error(InvalidPath(message: "Expected field name after .."))
    _ -> Ok(#(RecursiveField(field_name), str.drop_start(path, str.length(field_name))))
  }
}

fn parse_bracket(path: String) -> Result(#(PathSegment, String), JsonPathError) {
  case str.first(path) {
    Ok("'") -> parse_quoted_field(str.drop_start(path, 1))
    Ok("*") -> Ok(#(Wildcard, str.drop_start(path, 2)))
    Ok(_) -> parse_index_or_slice(path)
    _ -> Error(InvalidPath(message: "Invalid bracket expression"))
  }
}

fn parse_quoted_field(path: String) -> Result(#(PathSegment, String), JsonPathError) {
  let parts = str.split(path, "'")
  case parts {
    [name, "", ..rest] -> {
      let remaining = str.join(rest, "'")
      let remaining = case str.first(remaining) {
        Ok("]") -> str.drop_start(remaining, 1)
        _ -> remaining
      }
      Ok(#(Field(name), remaining))
    }
    [name, ..rest] -> {
      case name {
        "" -> Error(InvalidPath(message: "Unterminated quoted field"))
        _ -> {
          let remaining = str.join(rest, "'")
          let remaining = case str.first(remaining) {
            Ok("]") -> str.drop_start(remaining, 1)
            _ -> remaining
          }
          Ok(#(Field(name), remaining))
        }
      }
    }
    [] -> Error(InvalidPath(message: "Unterminated quoted field"))
  }
}

fn parse_index_or_slice(path: String) -> Result(#(PathSegment, String), JsonPathError) {
  let parts = str.split(path, ":")
  case parts {
    [first] -> {
      case str.split(first, "]") {
        [idx_str, rest] -> {
          case int.parse(str.trim(idx_str)) {
            Ok(idx) -> Ok(#(Index(idx), rest))
            Error(_) -> Error(InvalidPath(message: "Invalid index: " <> idx_str))
          }
        }
        _ -> Error(InvalidPath(message: "Unterminated bracket"))
      }
    }
    [first, ..rest] -> {
      let rest_joined = str.join(rest, ":")
      parse_slice(first, rest_joined)
    }
    [] -> Error(InvalidPath(message: "Empty expression"))
  }
}

fn parse_slice(start_str: String, rest: String) -> Result(#(PathSegment, String), JsonPathError) {
  let start_result = case str.trim(start_str) {
    "" -> Ok(None)
    s -> case int.parse(s) {
      Ok(n) -> Ok(Some(n))
      Error(_) -> Error(InvalidPath(message: "Invalid slice start"))
    }
  }
  
  case start_result {
    Error(e) -> Error(e)
    Ok(start) -> {
      case str.split(rest, "]") {
        [end_part, remaining] -> {
          let parts = str.split(end_part, ":")
          let stop_result = case list_first(parts) {
            Ok(s) -> case str.trim(s) {
              "" -> Ok(None)
              v -> case int.parse(v) {
                Ok(n) -> Ok(Some(n))
                Error(_) -> Error(InvalidPath(message: "Invalid slice stop"))
              }
            }
            Error(_) -> Ok(None)
          }
          case stop_result {
            Error(e) -> Error(e)
            Ok(stop) -> {
              let step_result = case list_second(parts) {
                Ok(s) -> case str.trim(s) {
                  "" -> Ok(None)
                  v -> case int.parse(v) {
                    Ok(n) -> Ok(Some(n))
                    Error(_) -> Error(InvalidPath(message: "Invalid slice step"))
                  }
                }
                Error(_) -> Ok(None)
              }
              case step_result {
                Error(e) -> Error(e)
                Ok(step) -> Ok(#(Slice(start, stop, step), remaining))
              }
            }
          }
        }
        _ -> Error(InvalidPath(message: "Unterminated slice"))
      }
    }
  }
}

fn list_first(list: List(a)) -> Result(a, Nil) {
  case list {
    [first, ..] -> Ok(first)
    [] -> Error(Nil)
  }
}

fn list_second(list: List(a)) -> Result(a, Nil) {
  case list {
    [_, second, ..] -> Ok(second)
    _ -> Error(Nil)
  }
}

fn list_at(list: List(a), index: Int) -> Result(a, Nil) {
  case list {
    [first, ..rest] -> {
      case index {
        0 -> Ok(first)
        _ -> list_at(rest, index - 1)
      }
    }
    [] -> Error(Nil)
  }
}

fn take_identifier(path: String) -> String {
  path
  |> str.to_graphemes
  |> list.take_while(fn(c) { is_identifier_char(c) })
  |> str.join(with: "")
}

fn is_identifier_char(c: String) -> Bool {
  case c {
    "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m"
    | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
    | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
    | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
    | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
    | "_" -> True
    _ -> False
  }
}

pub fn query(path: JsonPath, value: JsonValue) -> Result(List(JsonValue), JsonPathError) {
  query_segments(path.segments, [value])
}

fn query_segments(segments: List(PathSegment), values: List(JsonValue)) -> Result(List(JsonValue), JsonPathError) {
  case segments {
    [] -> Ok(values)
    [segment, ..rest] -> {
      let result = list.fold(values, Ok([]), fn(acc, value) {
        case acc {
          Ok(results) -> {
            case apply_segment(segment, value) {
              Ok(new_values) -> Ok(list.append(results, new_values))
              Error(e) -> Error(e)
            }
          }
          Error(e) -> Error(e)
        }
      })
      case result {
        Ok(new_values) -> query_segments(rest, new_values)
        Error(e) -> Error(e)
      }
    }
  }
}

fn apply_segment(segment: PathSegment, value: JsonValue) -> Result(List(JsonValue), JsonPathError) {
  case segment {
    Root -> Ok([value])
    Field(name) -> get_field(name, value)
    Index(idx) -> get_index(idx, value)
    Wildcard -> get_all_children(value)
    RecursiveField(name) -> get_recursive_field(name, value, [])
    Slice(start, stop, step) -> get_slice(start, stop, step, value)
  }
}

fn get_field(name: String, value: JsonValue) -> Result(List(JsonValue), JsonPathError) {
  case value {
    JsonObject(obj) -> {
      case dict.get(obj, name) {
        Ok(v) -> Ok([v])
        Error(_) -> Ok([])
      }
    }
    _ -> Error(TypeMismatch(expected: "Object", found: jsonx.type_name(value)))
  }
}

fn get_index(idx: Int, value: JsonValue) -> Result(List(JsonValue), JsonPathError) {
  case value {
    JsonArray(arr) -> {
      let len = list.length(arr)
      let actual_idx = case idx < 0 {
        True -> len + idx
        False -> idx
      }
      case list_at(arr, actual_idx) {
        Ok(v) -> Ok([v])
        Error(_) -> Ok([])
      }
    }
    _ -> Error(TypeMismatch(expected: "Array", found: jsonx.type_name(value)))
  }
}

fn get_all_children(value: JsonValue) -> Result(List(JsonValue), JsonPathError) {
  case value {
    JsonObject(obj) -> Ok(dict.values(obj))
    JsonArray(arr) -> Ok(arr)
    _ -> Ok([])
  }
}

fn get_recursive_field(name: String, value: JsonValue, acc: List(JsonValue)) -> Result(List(JsonValue), JsonPathError) {
  case value {
    JsonObject(obj) -> {
      let direct = case dict.get(obj, name) {
        Ok(v) -> [v]
        Error(_) -> []
      }
      let nested = list.fold(dict.to_list(obj), [], fn(acc2, pair) {
        let #(_, child) = pair
        case get_recursive_field(name, child, []) {
          Ok(found) -> list.append(acc2, found)
          Error(_) -> acc2
        }
      })
      Ok(list.append(acc, list.append(direct, nested)))
    }
    JsonArray(arr) -> {
      let nested = list.fold(arr, [], fn(acc2, child) {
        case get_recursive_field(name, child, []) {
          Ok(found) -> list.append(acc2, found)
          Error(_) -> acc2
        }
      })
      Ok(list.append(acc, nested))
    }
    _ -> Ok(acc)
  }
}

fn get_slice(start: Option(Int), stop: Option(Int), step: Option(Int), value: JsonValue) -> Result(List(JsonValue), JsonPathError) {
  case value {
    JsonArray(arr) -> {
      let len = list.length(arr)
      let start_idx = option.unwrap(start, 0)
      let stop_idx = option.unwrap(stop, len)
      let step_val = option.unwrap(step, 1)
      
      let actual_start = case start_idx < 0 {
        True -> len + start_idx
        False -> start_idx
      }
      let actual_stop = case stop_idx < 0 {
        True -> len + stop_idx
        False -> stop_idx
      }
      
      let slice = slice_array(arr, actual_start, actual_stop, step_val, [])
      Ok(slice)
    }
    _ -> Error(TypeMismatch(expected: "Array", found: jsonx.type_name(value)))
  }
}

fn slice_array(arr: List(a), start: Int, stop: Int, step: Int, acc: List(a)) -> List(a) {
  case step {
    0 -> list.reverse(acc)
    _ -> {
      case start >= stop, step > 0 {
        True, True -> list.reverse(acc)
        False, True -> {
          case list_at(arr, start) {
            Ok(v) -> slice_array(arr, start + step, stop, step, [v, ..acc])
            Error(_) -> list.reverse(acc)
          }
        }
        _, _ -> list.reverse(acc)
      }
    }
  }
}

pub fn query_one(path: JsonPath, value: JsonValue) -> Result(JsonValue, JsonPathError) {
  case query(path, value) {
    Ok([v]) -> Ok(v)
    Ok([]) -> Error(PathNotFound(path_to_string(path)))
    Ok(values) -> Ok(JsonArray(values))
    Error(e) -> Error(e)
  }
}

pub fn path_to_string(path: JsonPath) -> String {
  list.fold(path.segments, "", fn(acc, segment) {
    acc <> segment_to_string(segment)
  })
}

fn segment_to_string(segment: PathSegment) -> String {
  case segment {
    Root -> "$"
    Field(name) -> "." <> name
    Index(idx) -> "[" <> int.to_string(idx) <> "]"
    Wildcard -> ".*"
    RecursiveField(name) -> ".." <> name
    Slice(start, stop, step) -> {
      let start_str = case start {
        Some(i) -> int.to_string(i)
        None -> ""
      }
      let stop_str = case stop {
        Some(i) -> int.to_string(i)
        None -> ""
      }
      let step_str = case step {
        Some(i) -> int.to_string(i)
        None -> ""
      }
      
      case step {
        None -> "[" <> start_str <> ":" <> stop_str <> "]"
        Some(_) -> "[" <> start_str <> ":" <> stop_str <> ":" <> step_str <> "]"
      }
    }
  }
}
