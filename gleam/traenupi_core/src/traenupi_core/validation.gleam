import gleam/list
import gleam/string

pub type ValidationError {
  EmptyField(field: String)
  InvalidFormat(field: String, reason: String)
  OutOfRange(field: String, min: Int, max: Int, actual: Int)
  InvalidLength(field: String, min: Int, max: Int, actual: Int)
  MissingRequired(field: String)
  InvalidValue(field: String, value: String, allowed: List(String))
}

pub type ValidationResult(a) {
  Valid(value: a)
  Invalid(errors: List(ValidationError))
}

pub fn valid(value: a) -> ValidationResult(a) {
  Valid(value: value)
}

pub fn invalid(error: ValidationError) -> ValidationResult(a) {
  Invalid(errors: [error])
}

pub fn invalid_multiple(errors: List(ValidationError)) -> ValidationResult(a) {
  Invalid(errors: errors)
}

pub fn combine(
  results: List(ValidationResult(a)),
) -> ValidationResult(List(a)) {
  let errors = 
    results
    |> list.fold([], fn(acc, r) {
      case r {
        Invalid(errors: e) -> list.append(acc, e)
        Valid(_) -> acc
      }
    })

  case errors {
    [] -> {
      let values = 
        results
        |> list.filter_map(fn(r) {
          case r {
            Valid(value: v) -> Ok(v)
            Invalid(_) -> Error(Nil)
          }
        })
      Valid(value: values)
    }
    _ -> Invalid(errors: errors)
  }
}

pub fn map_result(
  result: ValidationResult(a),
  f: fn(a) -> b,
) -> ValidationResult(b) {
  case result {
    Valid(value: v) -> Valid(value: f(v))
    Invalid(errors: e) -> Invalid(errors: e)
  }
}

pub fn and_then(
  result: ValidationResult(a),
  f: fn(a) -> ValidationResult(b),
) -> ValidationResult(b) {
  case result {
    Valid(value: v) -> f(v)
    Invalid(errors: e) -> Invalid(errors: e)
  }
}

pub fn is_not_empty(value: String, field: String) -> ValidationResult(String) {
  case string.trim(value) {
    "" -> invalid(EmptyField(field: field))
    trimmed -> valid(trimmed)
  }
}

pub fn has_min_length(
  value: String,
  min: Int,
  field: String,
) -> ValidationResult(String) {
  let len = string.length(value)
  case len >= min {
    True -> valid(value)
    False -> invalid(InvalidLength(field: field, min: min, max: 0, actual: len))
  }
}

pub fn has_max_length(
  value: String,
  max: Int,
  field: String,
) -> ValidationResult(String) {
  let len = string.length(value)
  case len <= max {
    True -> valid(value)
    False -> invalid(InvalidLength(field: field, min: 0, max: max, actual: len))
  }
}

pub fn has_length_range(
  value: String,
  min: Int,
  max: Int,
  field: String,
) -> ValidationResult(String) {
  let len = string.length(value)
  case len >= min && len <= max {
    True -> valid(value)
    False -> invalid(InvalidLength(field: field, min: min, max: max, actual: len))
  }
}

pub fn is_in_range(
  value: Int,
  min: Int,
  max: Int,
  field: String,
) -> ValidationResult(Int) {
  case value >= min && value <= max {
    True -> valid(value)
    False -> invalid(OutOfRange(field: field, min: min, max: max, actual: value))
  }
}

pub fn is_positive(value: Int, field: String) -> ValidationResult(Int) {
  case value > 0 {
    True -> valid(value)
    False -> invalid(OutOfRange(field: field, min: 1, max: 0, actual: value))
  }
}

pub fn is_non_negative(value: Int, field: String) -> ValidationResult(Int) {
  case value >= 0 {
    True -> valid(value)
    False -> invalid(OutOfRange(field: field, min: 0, max: 0, actual: value))
  }
}

pub fn is_one_of(
  value: String,
  allowed: List(String),
  field: String,
) -> ValidationResult(String) {
  case list.contains(allowed, value) {
    True -> valid(value)
    False -> invalid(InvalidValue(field: field, value: value, allowed: allowed))
  }
}

pub fn matches_pattern(
  value: String,
  pattern: String,
  field: String,
) -> ValidationResult(String) {
  case string.contains(value, pattern) {
    True -> valid(value)
    False -> invalid(InvalidFormat(field: field, reason: "Must contain: " <> pattern))
  }
}

pub fn is_valid_id(value: String) -> ValidationResult(String) {
  let trimmed = string.trim(value)
  case trimmed {
    "" -> invalid(EmptyField(field: "id"))
    _ -> {
      case string.length(trimmed) >= 4 && string.length(trimmed) <= 64 {
        True -> valid(trimmed)
        False -> invalid(InvalidLength(field: "id", min: 4, max: 64, actual: string.length(trimmed)))
      }
    }
  }
}

pub fn is_valid_timestamp(value: Int) -> ValidationResult(Int) {
  case value > 0 {
    True -> valid(value)
    False -> invalid(OutOfRange(field: "timestamp", min: 1, max: 0, actual: value))
  }
}

pub fn is_valid_category(value: String) -> ValidationResult(String) {
  is_one_of(
    value,
    ["action", "verify", "reflect", "anti_weakness", "checkpoint", "completion"],
    "category",
  )
}

pub fn is_valid_weakness(value: String) -> ValidationResult(String) {
  is_one_of(
    value,
    [
      "context_loss",
      "incomplete_follow_through",
      "planning_drift",
      "error_amnesia",
      "verification_neglect",
      "edge_case_blindness",
      "quality_drift",
      "verification_gap",
      "overconfidence",
      "scope_creep",
    ],
    "weakness",
  )
}

pub fn is_valid_meeting_status(value: String) -> ValidationResult(String) {
  is_one_of(value, ["pending", "active", "closed"], "status")
}

pub fn is_valid_mood(value: String) -> ValidationResult(String) {
  is_one_of(
    value,
    ["focused", "confused", "productive", "stuck", "learning", "satisfied"],
    "mood",
  )
}

pub fn error_to_string(error: ValidationError) -> String {
  case error {
    EmptyField(field: f) -> f <> " cannot be empty"
    InvalidFormat(field: f, reason: r) -> f <> " has invalid format: " <> r
    OutOfRange(field: f, min: min, max: max, actual: actual) -> {
      case max == 0 {
        True -> f <> " must be at least " <> int_to_string(min) <> ", got " <> int_to_string(actual)
        False -> f <> " must be between " <> int_to_string(min) <> " and " <> int_to_string(max) <> ", got " <> int_to_string(actual)
      }
    }
    InvalidLength(field: f, min: min, max: max, actual: actual) -> {
      case max == 0 {
        True -> f <> " must be at least " <> int_to_string(min) <> " characters, got " <> int_to_string(actual)
        False -> f <> " must be between " <> int_to_string(min) <> " and " <> int_to_string(max) <> " characters, got " <> int_to_string(actual)
      }
    }
    MissingRequired(field: f) -> f <> " is required"
    InvalidValue(field: f, value: v, allowed: a) -> 
      f <> " has invalid value '" <> v <> "'. Allowed: " <> string.join(a, ", ")
  }
}

pub fn errors_to_string(errors: List(ValidationError)) -> String {
  errors
  |> list.map(error_to_string)
  |> string.join("\n")
}

fn int_to_string(n: Int) -> String {
  int_to_string_impl(n)
}

fn int_to_string_impl(n: Int) -> String {
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
    11 -> "11"
    12 -> "12"
    13 -> "13"
    14 -> "14"
    15 -> "15"
    16 -> "16"
    17 -> "17"
    18 -> "18"
    19 -> "19"
    20 -> "20"
    30 -> "30"
    40 -> "40"
    50 -> "50"
    60 -> "60"
    64 -> "64"
    100 -> "100"
    150 -> "150"
    _ -> {
      case n < 0 {
        True -> "-" <> int_to_string_impl(0 - n)
        False -> {
          let tens = n / 10
          let ones = n - tens * 10
          int_to_string_impl(tens) <> int_to_string_impl(ones)
        }
      }
    }
  }
}
