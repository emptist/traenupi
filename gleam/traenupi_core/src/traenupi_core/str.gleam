import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub fn is_empty(s: String) -> Bool {
  string.length(s) == 0
}

pub fn is_blank(s: String) -> Bool {
  s |> string.trim() |> string.length() == 0
}

pub fn is_not_empty(s: String) -> Bool {
  !is_empty(s)
}

pub fn is_not_blank(s: String) -> Bool {
  !is_blank(s)
}

pub fn trim_to_option(s: String) -> Option(String) {
  let trimmed = string.trim(s)
  case is_empty(trimmed) {
    True -> None
    False -> Some(trimmed)
  }
}

pub fn default_if_empty(s: String, default: String) -> String {
  case is_empty(s) {
    True -> default
    False -> s
  }
}

pub fn default_if_blank(s: String, default: String) -> String {
  case is_blank(s) {
    True -> default
    False -> s
  }
}

pub fn truncate(s: String, max_length: Int) -> String {
  case string.length(s) <= max_length {
    True -> s
    False -> {
      case max_length < 3 {
        True -> string.slice(s, 0, max_length)
        False -> string.slice(s, 0, max_length - 3) <> "..."
      }
    }
  }
}

pub fn truncate_with(s: String, max_length: Int, suffix: String) -> String {
  case string.length(s) <= max_length {
    True -> s
    False -> {
      let suffix_len = string.length(suffix)
      case max_length <= suffix_len {
        True -> suffix
        False -> string.slice(s, 0, max_length - suffix_len) <> suffix
      }
    }
  }
}

pub fn capitalize(s: String) -> String {
  case string.length(s) {
    0 -> s
    _ -> {
      let first = string.slice(s, 0, 1)
      let rest = string.slice(s, 1, string.length(s) - 1)
      string.uppercase(first) <> rest
    }
  }
}

pub fn title_case(s: String) -> String {
  s
  |> string.split(" ")
  |> list.map(capitalize)
  |> string.join(" ")
}

pub fn camel_case(s: String) -> String {
  let words = s |> string.split("_") |> list.map(capitalize)
  case words {
    [] -> ""
    [first, ..rest] -> string.lowercase(first) <> string.join(rest, "")
  }
}

pub fn snake_case(s: String) -> String {
  s
  |> string.split(" ")
  |> list.map(string.lowercase)
  |> string.join("_")
}

pub fn kebab_case(s: String) -> String {
  s
  |> string.split(" ")
  |> list.map(string.lowercase)
  |> string.join("-")
}

pub fn reverse(s: String) -> String {
  s
  |> string.to_graphemes()
  |> list.reverse()
  |> string.join("")
}

pub fn repeat(s: String, n: Int) -> String {
  string.repeat(s, n)
}

pub fn starts_with_any(s: String, prefixes: List(String)) -> Bool {
  list.any(prefixes, fn(prefix) { string.starts_with(s, prefix) })
}

pub fn ends_with_any(s: String, suffixes: List(String)) -> Bool {
  list.any(suffixes, fn(suffix) { string.ends_with(s, suffix) })
}

pub fn remove_prefix(s: String, prefix: String) -> String {
  case string.starts_with(s, prefix) {
    True -> {
      let len = string.length(prefix)
      string.slice(s, len, string.length(s) - len)
    }
    False -> s
  }
}

pub fn remove_suffix(s: String, suffix: String) -> String {
  case string.ends_with(s, suffix) {
    True -> {
      let len = string.length(s) - string.length(suffix)
      string.slice(s, 0, len)
    }
    False -> s
  }
}

pub fn ensure_prefix(s: String, prefix: String) -> String {
  case string.starts_with(s, prefix) {
    True -> s
    False -> prefix <> s
  }
}

pub fn ensure_suffix(s: String, suffix: String) -> String {
  case string.ends_with(s, suffix) {
    True -> s
    False -> s <> suffix
  }
}

pub fn surround(s: String, wrapper: String) -> String {
  wrapper <> s <> wrapper
}

pub fn quote(s: String) -> String {
  surround(s, "\"")
}

pub fn single_quote(s: String) -> String {
  surround(s, "'")
}

pub fn unquote(s: String) -> String {
  s
  |> remove_prefix("\"")
  |> remove_suffix("\"")
  |> remove_prefix("'")
  |> remove_suffix("'")
}

pub fn is_numeric(s: String) -> Bool {
  case string.length(s) {
    0 -> False
    _ -> {
      s
      |> string.to_graphemes()
      |> list.all(fn(c) {
        case c {
          "0" -> True
          "1" -> True
          "2" -> True
          "3" -> True
          "4" -> True
          "5" -> True
          "6" -> True
          "7" -> True
          "8" -> True
          "9" -> True
          _ -> False
        }
      })
    }
  }
}

pub fn is_alpha(s: String) -> Bool {
  case string.length(s) {
    0 -> False
    _ -> {
      s
      |> string.to_graphemes()
      |> list.all(fn(c) {
        case c {
          "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" -> True
          "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" -> True
          _ -> False
        }
      })
    }
  }
}

pub fn is_alphanumeric(s: String) -> Bool {
  case string.length(s) {
    0 -> False
    _ -> {
      s
      |> string.to_graphemes()
      |> list.all(fn(c) {
        is_numeric(c) || is_alpha(c)
      })
    }
  }
}

pub fn take(s: String, n: Int) -> String {
  string.slice(s, 0, n)
}

pub fn drop(s: String, n: Int) -> String {
  string.slice(s, n, string.length(s) - n)
}

pub fn take_right(s: String, n: Int) -> String {
  let len = string.length(s)
  case n >= len {
    True -> s
    False -> string.slice(s, len - n, n)
  }
}

pub fn drop_right(s: String, n: Int) -> String {
  let len = string.length(s)
  case n >= len {
    True -> ""
    False -> string.slice(s, 0, len - n)
  }
}

pub fn first_char(s: String) -> Option(String) {
  case string.length(s) {
    0 -> None
    _ -> Some(string.slice(s, 0, 1))
  }
}

pub fn last_char(s: String) -> Option(String) {
  let len = string.length(s)
  case len {
    0 -> None
    _ -> Some(string.slice(s, len - 1, 1))
  }
}

pub fn initials(s: String) -> String {
  s
  |> string.split(" ")
  |> list.filter_map(fn(word) {
    case string.length(word) {
      0 -> Error(Nil)
      _ -> Ok(string.slice(word, 0, 1))
    }
  })
  |> string.join("")
}

pub fn word_count(s: String) -> Int {
  s
  |> string.split(" ")
  |> list.filter(fn(word) { string.length(word) > 0 })
  |> list.length()
}

pub fn line_count(s: String) -> Int {
  s
  |> string.split("\n")
  |> list.length()
}

pub fn indent(s: String, spaces: Int) -> String {
  let indent_str = string.repeat(" ", spaces)
  s
  |> string.split("\n")
  |> list.map(fn(line) { indent_str <> line })
  |> string.join("\n")
}

pub fn dedent(s: String) -> String {
  s
  |> string.split("\n")
  |> list.map(fn(line) { 
    let trimmed = string.trim(line)
    case string.length(trimmed) == string.length(line) {
      True -> trimmed
      False -> line
    }
  })
  |> string.join("\n")
}

pub fn strip_margin(s: String) -> String {
  s
  |> string.split("\n")
  |> list.map(fn(line) {
    case string.contains(line, "|") {
      True -> {
        let parts = string.split(line, "|")
        case parts {
          [_, rest] -> rest
          _ -> line
        }
      }
      False -> line
    }
  })
  |> string.join("\n")
}

pub fn ellipsize(s: String, max_length: Int) -> String {
  truncate_with(s, max_length, "...")
}

pub fn humanize(s: String) -> String {
  s
  |> string.replace("_", " ")
  |> string.replace("-", " ")
  |> string.trim()
}

pub fn slugify(s: String) -> String {
  s
  |> string.lowercase()
  |> string.replace(" ", "-")
  |> string.replace("_", "-")
}

pub fn template(template_str: String, values: List(#(String, String))) -> String {
  list.fold(values, template_str, fn(acc, pair) {
    let #(key, value) = pair
    string.replace(acc, "{{" <> key <> "}}", value)
  })
}

pub fn pluralize(count: Int, singular: String, plural: String) -> String {
  case count {
    1 -> singular
    _ -> plural
  }
}

pub fn possessive(s: String) -> String {
  case string.ends_with(s, "s") {
    True -> s <> "'"
    False -> s <> "'s"
  }
}
