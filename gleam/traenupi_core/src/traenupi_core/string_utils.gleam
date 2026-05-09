import gleam/string
import gleam/list

pub fn truncate(str: String, max_length: Int) -> String {
  let current_length = string.length(str)
  case current_length <= max_length {
    True -> str
    False -> {
      let truncated = string.slice(str, 0, max_length - 3)
      string.append(truncated, "...")
    }
  }
}

pub fn capitalize(str: String) -> String {
  case string.is_empty(str) {
    True -> str
    False -> {
      let first = string.slice(str, 0, 1)
      let rest = string.slice(str, 1, string.length(str))
      string.append(string.uppercase(first), rest)
    }
  }
}

fn is_hex_char(c: String) -> Bool {
  let lower = string.lowercase(c)
  case lower {
    "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" -> True
    _ -> False
  }
}

fn all_chars_valid(str: String, validator: fn(String) -> Bool) -> Bool {
  let chars = string.to_graphemes(str)
  list.all(chars, validator)
}

pub fn is_valid_short_id(str: String) -> Bool {
  let min_length = 4
  case string.length(str) < min_length {
    True -> False
    False -> {
      let cleaned = string.replace(str, "-", "")
      string.length(cleaned) == string.length(str)
        && all_chars_valid(cleaned, is_hex_char)
    }
  }
}
