/// <reference types="./validation.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, toList, Empty as $Empty, CustomType as $CustomType } from "../gleam.mjs";

export class EmptyField extends $CustomType {
  constructor(field) {
    super();
    this.field = field;
  }
}
export const ValidationError$EmptyField = (field) => new EmptyField(field);
export const ValidationError$isEmptyField = (value) =>
  value instanceof EmptyField;
export const ValidationError$EmptyField$field = (value) => value.field;
export const ValidationError$EmptyField$0 = (value) => value.field;

export class InvalidFormat extends $CustomType {
  constructor(field, reason) {
    super();
    this.field = field;
    this.reason = reason;
  }
}
export const ValidationError$InvalidFormat = (field, reason) =>
  new InvalidFormat(field, reason);
export const ValidationError$isInvalidFormat = (value) =>
  value instanceof InvalidFormat;
export const ValidationError$InvalidFormat$field = (value) => value.field;
export const ValidationError$InvalidFormat$0 = (value) => value.field;
export const ValidationError$InvalidFormat$reason = (value) => value.reason;
export const ValidationError$InvalidFormat$1 = (value) => value.reason;

export class OutOfRange extends $CustomType {
  constructor(field, min, max, actual) {
    super();
    this.field = field;
    this.min = min;
    this.max = max;
    this.actual = actual;
  }
}
export const ValidationError$OutOfRange = (field, min, max, actual) =>
  new OutOfRange(field, min, max, actual);
export const ValidationError$isOutOfRange = (value) =>
  value instanceof OutOfRange;
export const ValidationError$OutOfRange$field = (value) => value.field;
export const ValidationError$OutOfRange$0 = (value) => value.field;
export const ValidationError$OutOfRange$min = (value) => value.min;
export const ValidationError$OutOfRange$1 = (value) => value.min;
export const ValidationError$OutOfRange$max = (value) => value.max;
export const ValidationError$OutOfRange$2 = (value) => value.max;
export const ValidationError$OutOfRange$actual = (value) => value.actual;
export const ValidationError$OutOfRange$3 = (value) => value.actual;

export class InvalidLength extends $CustomType {
  constructor(field, min, max, actual) {
    super();
    this.field = field;
    this.min = min;
    this.max = max;
    this.actual = actual;
  }
}
export const ValidationError$InvalidLength = (field, min, max, actual) =>
  new InvalidLength(field, min, max, actual);
export const ValidationError$isInvalidLength = (value) =>
  value instanceof InvalidLength;
export const ValidationError$InvalidLength$field = (value) => value.field;
export const ValidationError$InvalidLength$0 = (value) => value.field;
export const ValidationError$InvalidLength$min = (value) => value.min;
export const ValidationError$InvalidLength$1 = (value) => value.min;
export const ValidationError$InvalidLength$max = (value) => value.max;
export const ValidationError$InvalidLength$2 = (value) => value.max;
export const ValidationError$InvalidLength$actual = (value) => value.actual;
export const ValidationError$InvalidLength$3 = (value) => value.actual;

export class MissingRequired extends $CustomType {
  constructor(field) {
    super();
    this.field = field;
  }
}
export const ValidationError$MissingRequired = (field) =>
  new MissingRequired(field);
export const ValidationError$isMissingRequired = (value) =>
  value instanceof MissingRequired;
export const ValidationError$MissingRequired$field = (value) => value.field;
export const ValidationError$MissingRequired$0 = (value) => value.field;

export class InvalidValue extends $CustomType {
  constructor(field, value, allowed) {
    super();
    this.field = field;
    this.value = value;
    this.allowed = allowed;
  }
}
export const ValidationError$InvalidValue = (field, value, allowed) =>
  new InvalidValue(field, value, allowed);
export const ValidationError$isInvalidValue = (value) =>
  value instanceof InvalidValue;
export const ValidationError$InvalidValue$field = (value) => value.field;
export const ValidationError$InvalidValue$0 = (value) => value.field;
export const ValidationError$InvalidValue$value = (value) => value.value;
export const ValidationError$InvalidValue$1 = (value) => value.value;
export const ValidationError$InvalidValue$allowed = (value) => value.allowed;
export const ValidationError$InvalidValue$2 = (value) => value.allowed;

export const ValidationError$field = (value) => value.field;

export class Valid extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const ValidationResult$Valid = (value) => new Valid(value);
export const ValidationResult$isValid = (value) => value instanceof Valid;
export const ValidationResult$Valid$value = (value) => value.value;
export const ValidationResult$Valid$0 = (value) => value.value;

export class Invalid extends $CustomType {
  constructor(errors) {
    super();
    this.errors = errors;
  }
}
export const ValidationResult$Invalid = (errors) => new Invalid(errors);
export const ValidationResult$isInvalid = (value) => value instanceof Invalid;
export const ValidationResult$Invalid$errors = (value) => value.errors;
export const ValidationResult$Invalid$0 = (value) => value.errors;

export function valid(value) {
  return new Valid(value);
}

export function invalid(error) {
  return new Invalid(toList([error]));
}

export function invalid_multiple(errors) {
  return new Invalid(errors);
}

export function combine(results) {
  let _block;
  let _pipe = results;
  _block = $list.fold(
    _pipe,
    toList([]),
    (acc, r) => {
      if (r instanceof Valid) {
        return acc;
      } else {
        let e = r.errors;
        return $list.append(acc, e);
      }
    },
  );
  let errors = _block;
  if (errors instanceof $Empty) {
    let _block$1;
    let _pipe$1 = results;
    _block$1 = $list.filter_map(
      _pipe$1,
      (r) => {
        if (r instanceof Valid) {
          let v = r.value;
          return new Ok(v);
        } else {
          return new Error(undefined);
        }
      },
    );
    let values = _block$1;
    return new Valid(values);
  } else {
    return new Invalid(errors);
  }
}

export function map_result(result, f) {
  if (result instanceof Valid) {
    let v = result.value;
    return new Valid(f(v));
  } else {
    return result;
  }
}

export function and_then(result, f) {
  if (result instanceof Valid) {
    let v = result.value;
    return f(v);
  } else {
    return result;
  }
}

export function is_not_empty(value, field) {
  let $ = $string.trim(value);
  if ($ === "") {
    return invalid(new EmptyField(field));
  } else {
    let trimmed = $;
    return valid(trimmed);
  }
}

export function has_min_length(value, min, field) {
  let len = $string.length(value);
  let $ = len >= min;
  if ($) {
    return valid(value);
  } else {
    return invalid(new InvalidLength(field, min, 0, len));
  }
}

export function has_max_length(value, max, field) {
  let len = $string.length(value);
  let $ = len <= max;
  if ($) {
    return valid(value);
  } else {
    return invalid(new InvalidLength(field, 0, max, len));
  }
}

export function has_length_range(value, min, max, field) {
  let len = $string.length(value);
  let $ = (len >= min) && (len <= max);
  if ($) {
    return valid(value);
  } else {
    return invalid(new InvalidLength(field, min, max, len));
  }
}

export function is_in_range(value, min, max, field) {
  let $ = (value >= min) && (value <= max);
  if ($) {
    return valid(value);
  } else {
    return invalid(new OutOfRange(field, min, max, value));
  }
}

export function is_positive(value, field) {
  let $ = value > 0;
  if ($) {
    return valid(value);
  } else {
    return invalid(new OutOfRange(field, 1, 0, value));
  }
}

export function is_non_negative(value, field) {
  let $ = value >= 0;
  if ($) {
    return valid(value);
  } else {
    return invalid(new OutOfRange(field, 0, 0, value));
  }
}

export function is_one_of(value, allowed, field) {
  let $ = $list.contains(allowed, value);
  if ($) {
    return valid(value);
  } else {
    return invalid(new InvalidValue(field, value, allowed));
  }
}

export function matches_pattern(value, pattern, field) {
  let $ = $string.contains(value, pattern);
  if ($) {
    return valid(value);
  } else {
    return invalid(new InvalidFormat(field, "Must contain: " + pattern));
  }
}

export function is_valid_id(value) {
  let trimmed = $string.trim(value);
  if (trimmed === "") {
    return invalid(new EmptyField("id"));
  } else {
    let $ = ($string.length(trimmed) >= 4) && ($string.length(trimmed) <= 64);
    if ($) {
      return valid(trimmed);
    } else {
      return invalid(new InvalidLength("id", 4, 64, $string.length(trimmed)));
    }
  }
}

export function is_valid_timestamp(value) {
  let $ = value > 0;
  if ($) {
    return valid(value);
  } else {
    return invalid(new OutOfRange("timestamp", 1, 0, value));
  }
}

export function is_valid_category(value) {
  return is_one_of(
    value,
    toList([
      "action",
      "verify",
      "reflect",
      "anti_weakness",
      "checkpoint",
      "completion",
    ]),
    "category",
  );
}

export function is_valid_weakness(value) {
  return is_one_of(
    value,
    toList([
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
    ]),
    "weakness",
  );
}

export function is_valid_meeting_status(value) {
  return is_one_of(value, toList(["pending", "active", "closed"]), "status");
}

export function is_valid_mood(value) {
  return is_one_of(
    value,
    toList([
      "focused",
      "confused",
      "productive",
      "stuck",
      "learning",
      "satisfied",
    ]),
    "mood",
  );
}

function int_to_string_impl(n) {
  if (n === 0) {
    return "0";
  } else if (n === 1) {
    return "1";
  } else if (n === 2) {
    return "2";
  } else if (n === 3) {
    return "3";
  } else if (n === 4) {
    return "4";
  } else if (n === 5) {
    return "5";
  } else if (n === 6) {
    return "6";
  } else if (n === 7) {
    return "7";
  } else if (n === 8) {
    return "8";
  } else if (n === 9) {
    return "9";
  } else if (n === 10) {
    return "10";
  } else if (n === 11) {
    return "11";
  } else if (n === 12) {
    return "12";
  } else if (n === 13) {
    return "13";
  } else if (n === 14) {
    return "14";
  } else if (n === 15) {
    return "15";
  } else if (n === 16) {
    return "16";
  } else if (n === 17) {
    return "17";
  } else if (n === 18) {
    return "18";
  } else if (n === 19) {
    return "19";
  } else if (n === 20) {
    return "20";
  } else if (n === 30) {
    return "30";
  } else if (n === 40) {
    return "40";
  } else if (n === 50) {
    return "50";
  } else if (n === 60) {
    return "60";
  } else if (n === 64) {
    return "64";
  } else if (n === 100) {
    return "100";
  } else if (n === 150) {
    return "150";
  } else {
    let $ = n < 0;
    if ($) {
      return "-" + int_to_string_impl(0 - n);
    } else {
      let tens = globalThis.Math.trunc(n / 10);
      let ones = n - tens * 10;
      return int_to_string_impl(tens) + int_to_string_impl(ones);
    }
  }
}

function int_to_string(n) {
  return int_to_string_impl(n);
}

export function error_to_string(error) {
  if (error instanceof EmptyField) {
    let f = error.field;
    return f + " cannot be empty";
  } else if (error instanceof InvalidFormat) {
    let f = error.field;
    let r = error.reason;
    return (f + " has invalid format: ") + r;
  } else if (error instanceof OutOfRange) {
    let f = error.field;
    let min = error.min;
    let max = error.max;
    let actual = error.actual;
    let $ = max === 0;
    if ($) {
      return (((f + " must be at least ") + int_to_string(min)) + ", got ") + int_to_string(
        actual,
      );
    } else {
      return (((((f + " must be between ") + int_to_string(min)) + " and ") + int_to_string(
        max,
      )) + ", got ") + int_to_string(actual);
    }
  } else if (error instanceof InvalidLength) {
    let f = error.field;
    let min = error.min;
    let max = error.max;
    let actual = error.actual;
    let $ = max === 0;
    if ($) {
      return (((f + " must be at least ") + int_to_string(min)) + " characters, got ") + int_to_string(
        actual,
      );
    } else {
      return (((((f + " must be between ") + int_to_string(min)) + " and ") + int_to_string(
        max,
      )) + " characters, got ") + int_to_string(actual);
    }
  } else if (error instanceof MissingRequired) {
    let f = error.field;
    return f + " is required";
  } else {
    let f = error.field;
    let v = error.value;
    let a = error.allowed;
    return (((f + " has invalid value '") + v) + "'. Allowed: ") + $string.join(
      a,
      ", ",
    );
  }
}

export function errors_to_string(errors) {
  let _pipe = errors;
  let _pipe$1 = $list.map(_pipe, error_to_string);
  return $string.join(_pipe$1, "\n");
}
