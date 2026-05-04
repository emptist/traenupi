/// <reference types="./config.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, Empty as $Empty, CustomType as $CustomType } from "../gleam.mjs";

export class StringValue extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const ConfigValue$StringValue = (value) => new StringValue(value);
export const ConfigValue$isStringValue = (value) =>
  value instanceof StringValue;
export const ConfigValue$StringValue$value = (value) => value.value;
export const ConfigValue$StringValue$0 = (value) => value.value;

export class IntValue extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const ConfigValue$IntValue = (value) => new IntValue(value);
export const ConfigValue$isIntValue = (value) => value instanceof IntValue;
export const ConfigValue$IntValue$value = (value) => value.value;
export const ConfigValue$IntValue$0 = (value) => value.value;

export class BoolValue extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const ConfigValue$BoolValue = (value) => new BoolValue(value);
export const ConfigValue$isBoolValue = (value) => value instanceof BoolValue;
export const ConfigValue$BoolValue$value = (value) => value.value;
export const ConfigValue$BoolValue$0 = (value) => value.value;

export class ListValue extends $CustomType {
  constructor(values) {
    super();
    this.values = values;
  }
}
export const ConfigValue$ListValue = (values) => new ListValue(values);
export const ConfigValue$isListValue = (value) => value instanceof ListValue;
export const ConfigValue$ListValue$values = (value) => value.values;
export const ConfigValue$ListValue$0 = (value) => value.values;

export class ParseError extends $CustomType {
  constructor(line, message) {
    super();
    this.line = line;
    this.message = message;
  }
}
export const ConfigError$ParseError = (line, message) =>
  new ParseError(line, message);
export const ConfigError$isParseError = (value) => value instanceof ParseError;
export const ConfigError$ParseError$line = (value) => value.line;
export const ConfigError$ParseError$0 = (value) => value.line;
export const ConfigError$ParseError$message = (value) => value.message;
export const ConfigError$ParseError$1 = (value) => value.message;

export class MissingKey extends $CustomType {
  constructor(key) {
    super();
    this.key = key;
  }
}
export const ConfigError$MissingKey = (key) => new MissingKey(key);
export const ConfigError$isMissingKey = (value) => value instanceof MissingKey;
export const ConfigError$MissingKey$key = (value) => value.key;
export const ConfigError$MissingKey$0 = (value) => value.key;

export class InvalidType extends $CustomType {
  constructor(key, expected, actual) {
    super();
    this.key = key;
    this.expected = expected;
    this.actual = actual;
  }
}
export const ConfigError$InvalidType = (key, expected, actual) =>
  new InvalidType(key, expected, actual);
export const ConfigError$isInvalidType = (value) =>
  value instanceof InvalidType;
export const ConfigError$InvalidType$key = (value) => value.key;
export const ConfigError$InvalidType$0 = (value) => value.key;
export const ConfigError$InvalidType$expected = (value) => value.expected;
export const ConfigError$InvalidType$1 = (value) => value.expected;
export const ConfigError$InvalidType$actual = (value) => value.actual;
export const ConfigError$InvalidType$2 = (value) => value.actual;

export class ConfigOk extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const ConfigResult$ConfigOk = (value) => new ConfigOk(value);
export const ConfigResult$isConfigOk = (value) => value instanceof ConfigOk;
export const ConfigResult$ConfigOk$value = (value) => value.value;
export const ConfigResult$ConfigOk$0 = (value) => value.value;

export class ConfigError extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const ConfigResult$ConfigError = (error) => new ConfigError(error);
export const ConfigResult$isConfigError = (value) =>
  value instanceof ConfigError;
export const ConfigResult$ConfigError$error = (value) => value.error;
export const ConfigResult$ConfigError$0 = (value) => value.error;

export class Config extends $CustomType {
  constructor(data) {
    super();
    this.data = data;
  }
}
export const Config$Config = (data) => new Config(data);
export const Config$isConfig = (value) => value instanceof Config;
export const Config$Config$data = (value) => value.data;
export const Config$Config$0 = (value) => value.data;

export function empty() {
  return new Config($dict.new$());
}

function unquote(value) {
  let is_double_quoted = $string.starts_with(value, "\"") && $string.ends_with(
    value,
    "\"",
  );
  let is_single_quoted = $string.starts_with(value, "'") && $string.ends_with(
    value,
    "'",
  );
  let $ = is_double_quoted || is_single_quoted;
  if ($) {
    let _pipe = $string.drop_start(value, 1);
    return $string.drop_end(_pipe, 1);
  } else {
    return value;
  }
}

function parse_list_value(value) {
  let $ = $string.starts_with(value, "[") && $string.ends_with(value, "]");
  if ($) {
    let _block;
    let _pipe = $string.drop_start(value, 1);
    _block = $string.drop_end(_pipe, 1);
    let inner = _block;
    let _block$1;
    let _pipe$1 = inner;
    let _pipe$2 = $string.split(_pipe$1, ",");
    _block$1 = $list.map(_pipe$2, (s) => { return unquote($string.trim(s)); });
    let items = _block$1;
    return new Ok(items);
  } else {
    return new Error(undefined);
  }
}

function is_digit(s) {
  if (s === "0") {
    return true;
  } else if (s === "1") {
    return true;
  } else if (s === "2") {
    return true;
  } else if (s === "3") {
    return true;
  } else if (s === "4") {
    return true;
  } else if (s === "5") {
    return true;
  } else if (s === "6") {
    return true;
  } else if (s === "7") {
    return true;
  } else if (s === "8") {
    return true;
  } else if (s === "9") {
    return true;
  } else {
    return false;
  }
}

function digit_to_int(s) {
  if (s === "0") {
    return 0;
  } else if (s === "1") {
    return 1;
  } else if (s === "2") {
    return 2;
  } else if (s === "3") {
    return 3;
  } else if (s === "4") {
    return 4;
  } else if (s === "5") {
    return 5;
  } else if (s === "6") {
    return 6;
  } else if (s === "7") {
    return 7;
  } else if (s === "8") {
    return 8;
  } else if (s === "9") {
    return 9;
  } else {
    return 0;
  }
}

function parse_int_value(value) {
  if (value === "0") {
    return new Ok(0);
  } else if (value === "1") {
    return new Ok(1);
  } else if (value === "2") {
    return new Ok(2);
  } else if (value === "3") {
    return new Ok(3);
  } else if (value === "4") {
    return new Ok(4);
  } else if (value === "5") {
    return new Ok(5);
  } else if (value === "6") {
    return new Ok(6);
  } else if (value === "7") {
    return new Ok(7);
  } else if (value === "8") {
    return new Ok(8);
  } else if (value === "9") {
    return new Ok(9);
  } else if (value === "10") {
    return new Ok(10);
  } else if (value === "100") {
    return new Ok(100);
  } else if (value === "1000") {
    return new Ok(1000);
  } else {
    let $ = ($string.length(value) > 0) && ($string.length(value) < 10);
    if ($) {
      let chars = $string.to_graphemes(value);
      let $1 = $list.all(chars, (c) => { return is_digit(c); });
      if ($1) {
        let num = $list.fold(
          chars,
          0,
          (acc, c) => { return acc * 10 + digit_to_int(c); },
        );
        return new Ok(num);
      } else {
        return new Error(undefined);
      }
    } else {
      return new Error(undefined);
    }
  }
}

function parse_value(value) {
  if (value === "true") {
    return new BoolValue(true);
  } else if (value === "false") {
    return new BoolValue(false);
  } else {
    let $ = parse_int_value(value);
    if ($ instanceof Ok) {
      let n = $[0];
      return new IntValue(n);
    } else {
      let $1 = parse_list_value(value);
      if ($1 instanceof Ok) {
        let items = $1[0];
        return new ListValue(items);
      } else {
        return new StringValue(unquote(value));
      }
    }
  }
}

function parse_line(line) {
  let trimmed = $string.trim(line);
  if (trimmed === "") {
    return new Ok(new None());
  } else {
    let $ = $string.starts_with(trimmed, "#");
    if ($) {
      return new Ok(new None());
    } else {
      let $1 = $string.split_once(trimmed, "=");
      if ($1 instanceof Ok) {
        let key = $1[0][0];
        let value = $1[0][1];
        let k = $string.trim(key);
        let v = parse_value($string.trim(value));
        return new Ok(new Some([k, v]));
      } else {
        return new Error("Missing '=' in config line");
      }
    }
  }
}

function parse_lines(loop$lines, loop$line_num, loop$acc) {
  while (true) {
    let lines = loop$lines;
    let line_num = loop$line_num;
    let acc = loop$acc;
    if (lines instanceof $Empty) {
      return new ConfigOk(new Config(acc));
    } else {
      let line = lines.head;
      let rest = lines.tail;
      let $ = parse_line(line);
      if ($ instanceof Ok) {
        let $1 = $[0];
        if ($1 instanceof Some) {
          let key = $1[0][0];
          let value = $1[0][1];
          loop$lines = rest;
          loop$line_num = line_num + 1;
          loop$acc = $dict.insert(acc, key, value);
        } else {
          loop$lines = rest;
          loop$line_num = line_num + 1;
          loop$acc = acc;
        }
      } else {
        let msg = $[0];
        return new ConfigError(new ParseError(line_num, msg));
      }
    }
  }
}

export function parse(content) {
  let _block;
  let _pipe = content;
  _block = $string.split(_pipe, "\n");
  let lines = _block;
  return parse_lines(lines, 1, $dict.new$());
}

export function get(config, key) {
  let $ = $dict.get(config.data, key);
  if ($ instanceof Ok) {
    let v = $[0];
    return new Some(v);
  } else {
    return new None();
  }
}

export function set(config, key, value) {
  return new Config($dict.insert(config.data, key, value));
}

export function has_key(config, key) {
  return $dict.has_key(config.data, key);
}

export function keys(config) {
  return $dict.keys(config.data);
}

function value_type_name(value) {
  if (value instanceof StringValue) {
    return "string";
  } else if (value instanceof IntValue) {
    return "int";
  } else if (value instanceof BoolValue) {
    return "bool";
  } else {
    return "list";
  }
}

export function get_string(config, key) {
  let $ = $dict.get(config.data, key);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 instanceof StringValue) {
      let v = $1.value;
      return new ConfigOk(v);
    } else {
      let other = $1;
      return new ConfigError(
        new InvalidType(key, "string", value_type_name(other)),
      );
    }
  } else {
    return new ConfigError(new MissingKey(key));
  }
}

export function get_int(config, key) {
  let $ = $dict.get(config.data, key);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 instanceof IntValue) {
      let v = $1.value;
      return new ConfigOk(v);
    } else {
      let other = $1;
      return new ConfigError(
        new InvalidType(key, "int", value_type_name(other)),
      );
    }
  } else {
    return new ConfigError(new MissingKey(key));
  }
}

export function get_bool(config, key) {
  let $ = $dict.get(config.data, key);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 instanceof BoolValue) {
      let v = $1.value;
      return new ConfigOk(v);
    } else {
      let other = $1;
      return new ConfigError(
        new InvalidType(key, "bool", value_type_name(other)),
      );
    }
  } else {
    return new ConfigError(new MissingKey(key));
  }
}

export function get_list(config, key) {
  let $ = $dict.get(config.data, key);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 instanceof ListValue) {
      let v = $1.values;
      return new ConfigOk(v);
    } else {
      let other = $1;
      return new ConfigError(
        new InvalidType(key, "list", value_type_name(other)),
      );
    }
  } else {
    return new ConfigError(new MissingKey(key));
  }
}

export function get_string_default(config, key, default$) {
  let $ = get_string(config, key);
  if ($ instanceof ConfigOk) {
    let v = $.value;
    return v;
  } else {
    return default$;
  }
}

export function get_int_default(config, key, default$) {
  let $ = get_int(config, key);
  if ($ instanceof ConfigOk) {
    let v = $.value;
    return v;
  } else {
    return default$;
  }
}

export function get_bool_default(config, key, default$) {
  let $ = get_bool(config, key);
  if ($ instanceof ConfigOk) {
    let v = $.value;
    return v;
  } else {
    return default$;
  }
}

function int_to_string(n) {
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
  } else if (n === 100) {
    return "100";
  } else if (n === 1000) {
    return "1000";
  } else {
    let $ = n < 0;
    if ($) {
      return "-" + int_to_string(0 - n);
    } else {
      let tens = globalThis.Math.trunc(n / 10);
      let ones = n - tens * 10;
      return int_to_string(tens) + int_to_string(ones);
    }
  }
}

function value_to_string(value) {
  if (value instanceof StringValue) {
    let v = value.value;
    return ("\"" + v) + "\"";
  } else if (value instanceof IntValue) {
    let v = value.value;
    return int_to_string(v);
  } else if (value instanceof BoolValue) {
    let $ = value.value;
    if ($) {
      return "true";
    } else {
      return "false";
    }
  } else {
    let vs = value.values;
    return ("[" + $string.join(vs, ", ")) + "]";
  }
}

export function to_string(config) {
  let _pipe = config.data;
  let _pipe$1 = $dict.to_list(_pipe);
  let _pipe$2 = $list.map(
    _pipe$1,
    (pair) => {
      let key;
      let value;
      key = pair[0];
      value = pair[1];
      return (key + " = ") + value_to_string(value);
    },
  );
  return $string.join(_pipe$2, "\n");
}

export function merge(base, override) {
  return new Config($dict.merge(base.data, override.data));
}

export function from_list(items) {
  return new Config($dict.from_list(items));
}

export function error_to_string(error) {
  if (error instanceof ParseError) {
    let l = error.line;
    let m = error.message;
    return (("Parse error on line " + int_to_string(l)) + ": ") + m;
  } else if (error instanceof MissingKey) {
    let k = error.key;
    return "Missing required key: " + k;
  } else {
    let k = error.key;
    let e = error.expected;
    let a = error.actual;
    return (((("Invalid type for key '" + k) + "': expected ") + e) + ", got ") + a;
  }
}
