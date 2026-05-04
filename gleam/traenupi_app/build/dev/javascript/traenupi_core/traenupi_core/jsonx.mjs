/// <reference types="./jsonx.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $float from "../../gleam_stdlib/gleam/float.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $result from "../../gleam_stdlib/gleam/result.mjs";
import * as $str from "../../gleam_stdlib/gleam/string.mjs";
import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
} from "../gleam.mjs";

export class JsonNull extends $CustomType {}
export const JsonValue$JsonNull = () => new JsonNull();
export const JsonValue$isJsonNull = (value) => value instanceof JsonNull;

export class JsonBool extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const JsonValue$JsonBool = ($0) => new JsonBool($0);
export const JsonValue$isJsonBool = (value) => value instanceof JsonBool;
export const JsonValue$JsonBool$0 = (value) => value[0];

export class JsonNumber extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const JsonValue$JsonNumber = ($0) => new JsonNumber($0);
export const JsonValue$isJsonNumber = (value) => value instanceof JsonNumber;
export const JsonValue$JsonNumber$0 = (value) => value[0];

export class JsonString extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const JsonValue$JsonString = ($0) => new JsonString($0);
export const JsonValue$isJsonString = (value) => value instanceof JsonString;
export const JsonValue$JsonString$0 = (value) => value[0];

export class JsonArray extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const JsonValue$JsonArray = ($0) => new JsonArray($0);
export const JsonValue$isJsonArray = (value) => value instanceof JsonArray;
export const JsonValue$JsonArray$0 = (value) => value[0];

export class JsonObject extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const JsonValue$JsonObject = ($0) => new JsonObject($0);
export const JsonValue$isJsonObject = (value) => value instanceof JsonObject;
export const JsonValue$JsonObject$0 = (value) => value[0];

export class UnexpectedType extends $CustomType {
  constructor(expected, found) {
    super();
    this.expected = expected;
    this.found = found;
  }
}
export const JsonError$UnexpectedType = (expected, found) =>
  new UnexpectedType(expected, found);
export const JsonError$isUnexpectedType = (value) =>
  value instanceof UnexpectedType;
export const JsonError$UnexpectedType$expected = (value) => value.expected;
export const JsonError$UnexpectedType$0 = (value) => value.expected;
export const JsonError$UnexpectedType$found = (value) => value.found;
export const JsonError$UnexpectedType$1 = (value) => value.found;

export class MissingField extends $CustomType {
  constructor(field) {
    super();
    this.field = field;
  }
}
export const JsonError$MissingField = (field) => new MissingField(field);
export const JsonError$isMissingField = (value) =>
  value instanceof MissingField;
export const JsonError$MissingField$field = (value) => value.field;
export const JsonError$MissingField$0 = (value) => value.field;

export class InvalidJson extends $CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
export const JsonError$InvalidJson = (message) => new InvalidJson(message);
export const JsonError$isInvalidJson = (value) => value instanceof InvalidJson;
export const JsonError$InvalidJson$message = (value) => value.message;
export const JsonError$InvalidJson$0 = (value) => value.message;

export class IndexOutOfBounds extends $CustomType {
  constructor(index, length) {
    super();
    this.index = index;
    this.length = length;
  }
}
export const JsonError$IndexOutOfBounds = (index, length) =>
  new IndexOutOfBounds(index, length);
export const JsonError$isIndexOutOfBounds = (value) =>
  value instanceof IndexOutOfBounds;
export const JsonError$IndexOutOfBounds$index = (value) => value.index;
export const JsonError$IndexOutOfBounds$0 = (value) => value.index;
export const JsonError$IndexOutOfBounds$length = (value) => value.length;
export const JsonError$IndexOutOfBounds$1 = (value) => value.length;

export class DecodeResult extends $CustomType {
  constructor($0, $1) {
    super();
    this[0] = $0;
    this[1] = $1;
  }
}
export const DecodeResult$DecodeResult = ($0, $1) => new DecodeResult($0, $1);
export const DecodeResult$isDecodeResult = (value) =>
  value instanceof DecodeResult;
export const DecodeResult$DecodeResult$0 = (value) => value[0];
export const DecodeResult$DecodeResult$1 = (value) => value[1];

export function null$() {
  return new JsonNull();
}

export function bool(value) {
  return new JsonBool(value);
}

export function int(value) {
  return new JsonNumber($int.to_float(value));
}

export function float(value) {
  return new JsonNumber(value);
}

export function string(value) {
  return new JsonString(value);
}

export function array(values) {
  return new JsonArray(values);
}

export function object(pairs) {
  return new JsonObject($dict.from_list(pairs));
}

export function nullable(value) {
  if (value instanceof Some) {
    let v = value[0];
    return v;
  } else {
    return new JsonNull();
  }
}

export function json_value_type(value) {
  if (value instanceof JsonNull) {
    return "Null";
  } else if (value instanceof JsonBool) {
    return "Bool";
  } else if (value instanceof JsonNumber) {
    return "Number";
  } else if (value instanceof JsonString) {
    return "String";
  } else if (value instanceof JsonArray) {
    return "Array";
  } else {
    return "Object";
  }
}

export function is_null(value) {
  if (value instanceof JsonNull) {
    return true;
  } else {
    return false;
  }
}

export function is_bool(value) {
  if (value instanceof JsonBool) {
    return true;
  } else {
    return false;
  }
}

export function is_number(value) {
  if (value instanceof JsonNumber) {
    return true;
  } else {
    return false;
  }
}

export function is_string(value) {
  if (value instanceof JsonString) {
    return true;
  } else {
    return false;
  }
}

export function is_array(value) {
  if (value instanceof JsonArray) {
    return true;
  } else {
    return false;
  }
}

export function is_object(value) {
  if (value instanceof JsonObject) {
    return true;
  } else {
    return false;
  }
}

export function json_to_bool(value) {
  if (value instanceof JsonBool) {
    let b = value[0];
    return new Ok(b);
  } else {
    return new Error(new UnexpectedType("Bool", json_value_type(value)));
  }
}

export function json_to_number(value) {
  if (value instanceof JsonNumber) {
    let n = value[0];
    return new Ok(n);
  } else {
    return new Error(new UnexpectedType("Number", json_value_type(value)));
  }
}

export function json_to_int(value) {
  if (value instanceof JsonNumber) {
    let n = value[0];
    return new Ok($float.round(n));
  } else {
    return new Error(new UnexpectedType("Number", json_value_type(value)));
  }
}

export function json_to_string(value) {
  if (value instanceof JsonString) {
    let s = value[0];
    return new Ok(s);
  } else {
    return new Error(new UnexpectedType("String", json_value_type(value)));
  }
}

export function json_to_array(value) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return new Ok(arr);
  } else {
    return new Error(new UnexpectedType("Array", json_value_type(value)));
  }
}

export function json_to_object(value) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    return new Ok(obj);
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(value)));
  }
}

export function json_to_option(value) {
  if (value instanceof JsonNull) {
    return new None();
  } else {
    return new Some(value);
  }
}

export function get_field(value, field) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    let $ = $dict.get(obj, field);
    if ($ instanceof Ok) {
      return $;
    } else {
      return new Error(new MissingField(field));
    }
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(value)));
  }
}

export function get_field_as(value, field, converter) {
  let _pipe = get_field(value, field);
  return $result.try$(_pipe, converter);
}

function nth(loop$lst, loop$index) {
  while (true) {
    let lst = loop$lst;
    let index = loop$index;
    if (lst instanceof $Empty) {
      return new Error(undefined);
    } else if (index === 0) {
      let first = lst.head;
      return new Ok(first);
    } else {
      let n = index;
      let rest = lst.tail;
      loop$lst = rest;
      loop$index = n - 1;
    }
  }
}

export function get_index(value, index) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    let $ = nth(arr, index);
    if ($ instanceof Ok) {
      return $;
    } else {
      return new Error(new IndexOutOfBounds(index, $list.length(arr)));
    }
  } else {
    return new Error(new UnexpectedType("Array", json_value_type(value)));
  }
}

export function get_index_as(value, index, converter) {
  let _pipe = get_index(value, index);
  return $result.try$(_pipe, converter);
}

export function map_json_array(value, f) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return new Ok($list.map(arr, f));
  } else {
    return new Error(new UnexpectedType("Array", json_value_type(value)));
  }
}

export function filter_json_array(value, predicate) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return new Ok($list.filter(arr, predicate));
  } else {
    return new Error(new UnexpectedType("Array", json_value_type(value)));
  }
}

export function keys(value) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    return new Ok($dict.keys(obj));
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(value)));
  }
}

export function values(value) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    return new Ok($dict.values(obj));
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(value)));
  }
}

function merge_dicts(base, override) {
  let base_list = $dict.to_list(base);
  let override_list = $dict.to_list(override);
  return $dict.from_list($list.append(base_list, override_list));
}

export function merge_objects(base, override) {
  if (base instanceof JsonObject && override instanceof JsonObject) {
    let base_dict = base[0];
    let override_dict = override[0];
    let merged = merge_dicts(base_dict, override_dict);
    return new Ok(new JsonObject(merged));
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(base)));
  }
}

export function set_field(value, field, new_value) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    return new Ok(new JsonObject($dict.insert(obj, field, new_value)));
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(value)));
  }
}

export function remove_field(value, field) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    return new Ok(new JsonObject($dict.delete$(obj, field)));
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(value)));
  }
}

export function array_length(value) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return new Ok($list.length(arr));
  } else {
    return new Error(new UnexpectedType("Array", json_value_type(value)));
  }
}

export function object_length(value) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    return new Ok($dict.size(obj));
  } else {
    return new Error(new UnexpectedType("Object", json_value_type(value)));
  }
}

export function append_to_array(value, item) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return new Ok(new JsonArray($list.append(arr, toList([item]))));
  } else {
    return new Error(new UnexpectedType("Array", json_value_type(value)));
  }
}

export function prepend_to_array(value, item) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return new Ok(new JsonArray(listPrepend(item, arr)));
  } else {
    return new Error(new UnexpectedType("Array", json_value_type(value)));
  }
}

export function path_get(value, path) {
  return $list.try_fold(
    path,
    value,
    (current, key) => { return get_field(current, key); },
  );
}

export function path_set(value, path, new_value) {
  if (path instanceof $Empty) {
    return new Ok(new_value);
  } else {
    let $ = path.tail;
    if ($ instanceof $Empty) {
      let key = path.head;
      return set_field(value, key, new_value);
    } else {
      let key = path.head;
      let rest = $;
      let $1 = get_field(value, key);
      if ($1 instanceof Ok) {
        let nested = $1[0];
        let $2 = path_set(nested, rest, new_value);
        if ($2 instanceof Ok) {
          let u = $2[0];
          return set_field(value, key, u);
        } else {
          return $2;
        }
      } else {
        let $2 = path_set(new JsonObject($dict.new$()), rest, new_value);
        if ($2 instanceof Ok) {
          let u = $2[0];
          return set_field(value, key, u);
        } else {
          return $2;
        }
      }
    }
  }
}

function escape_string(s) {
  let _pipe = s;
  let _pipe$1 = $str.replace(_pipe, "\\", "\\\\");
  let _pipe$2 = $str.replace(_pipe$1, "\"", "\\\"");
  let _pipe$3 = $str.replace(_pipe$2, "\n", "\\n");
  let _pipe$4 = $str.replace(_pipe$3, "\r", "\\r");
  return $str.replace(_pipe$4, "\t", "\\t");
}

export function encode(value) {
  if (value instanceof JsonNull) {
    return "null";
  } else if (value instanceof JsonBool) {
    let b = value[0];
    if (b) {
      return "true";
    } else {
      return "false";
    }
  } else if (value instanceof JsonNumber) {
    let n = value[0];
    return $float.to_string(n);
  } else if (value instanceof JsonString) {
    let s = value[0];
    return ("\"" + escape_string(s)) + "\"";
  } else if (value instanceof JsonArray) {
    let arr = value[0];
    let encoded_items = $list.map(arr, encode);
    return ("[" + $str.join(encoded_items, ",")) + "]";
  } else {
    let obj = value[0];
    let _block;
    let _pipe = $dict.to_list(obj);
    _block = $list.map(
      _pipe,
      (pair) => {
        let key;
        let val;
        key = pair[0];
        val = pair[1];
        return (("\"" + escape_string(key)) + "\":") + encode(val);
      },
    );
    let pairs = _block;
    return ("{" + $str.join(pairs, ",")) + "}";
  }
}

function trim_left(loop$s) {
  while (true) {
    let s = loop$s;
    let $ = $str.pop_grapheme(s);
    if ($ instanceof Ok) {
      let c = $[0][0];
      let rest = $[0][1];
      let $1 = (((c === " ") || (c === "\n")) || (c === "\r")) || (c === "\t");
      if ($1) {
        loop$s = rest;
      } else {
        return s;
      }
    } else {
      return "";
    }
  }
}

function trim(s) {
  return trim_left(s);
}

function is_digit(c) {
  return (((((((((c === "0") || (c === "1")) || (c === "2")) || (c === "3")) || (c === "4")) || (c === "5")) || (c === "6")) || (c === "7")) || (c === "8")) || (c === "9");
}

function parse_null(json) {
  let $ = $str.slice(json, 0, 3);
  if ($ === "ull") {
    return new Ok(new DecodeResult(new JsonNull(), $str.drop_start(json, 3)));
  } else {
    return new Error(new InvalidJson("Expected 'null'"));
  }
}

function parse_true(json) {
  let $ = $str.slice(json, 0, 3);
  if ($ === "rue") {
    return new Ok(
      new DecodeResult(new JsonBool(true), $str.drop_start(json, 3)),
    );
  } else {
    return new Error(new InvalidJson("Expected 'true'"));
  }
}

function parse_false(json) {
  let $ = $str.slice(json, 0, 4);
  if ($ === "alse") {
    return new Ok(
      new DecodeResult(new JsonBool(false), $str.drop_start(json, 4)),
    );
  } else {
    return new Error(new InvalidJson("Expected 'false'"));
  }
}

function extract_number_chars(loop$json, loop$acc) {
  while (true) {
    let json = loop$json;
    let acc = loop$acc;
    let $ = $str.pop_grapheme(json);
    if ($ instanceof Ok) {
      let c = $[0][0];
      let rest = $[0][1];
      let $1 = ((((is_digit(c) || (c === "-")) || (c === "+")) || (c === ".")) || (c === "e")) || (c === "E");
      if ($1) {
        loop$json = rest;
        loop$acc = acc + c;
      } else {
        return [acc, json];
      }
    } else {
      return [acc, ""];
    }
  }
}

function extract_number(json) {
  return extract_number_chars(json, "");
}

function parse_number(json) {
  let $ = extract_number(json);
  let num_str;
  let remaining;
  num_str = $[0];
  remaining = $[1];
  let $1 = $int.parse(num_str);
  if ($1 instanceof Ok) {
    let n = $1[0];
    return new Ok(new DecodeResult(new JsonNumber($int.to_float(n)), remaining));
  } else {
    let $2 = $float.parse(num_str);
    if ($2 instanceof Ok) {
      let n = $2[0];
      return new Ok(new DecodeResult(new JsonNumber(n), remaining));
    } else {
      return new Error(new InvalidJson("Invalid number: " + num_str));
    }
  }
}

function parse_string_chars(loop$json, loop$acc) {
  while (true) {
    let json = loop$json;
    let acc = loop$acc;
    let $ = $str.pop_grapheme(json);
    if ($ instanceof Ok) {
      let $1 = $[0][0];
      if ($1 === "\\") {
        let rest = $[0][1];
        let $2 = $str.pop_grapheme(rest);
        if ($2 instanceof Ok) {
          let escaped = $2[0][0];
          let rest2 = $2[0][1];
          let _block;
          if (escaped === "n") {
            _block = "\n";
          } else if (escaped === "r") {
            _block = "\r";
          } else if (escaped === "t") {
            _block = "\t";
          } else if (escaped === "\"") {
            _block = escaped;
          } else if (escaped === "\\") {
            _block = escaped;
          } else {
            _block = escaped;
          }
          let char = _block;
          loop$json = rest2;
          loop$acc = acc + char;
        } else {
          return new Error(new InvalidJson("Incomplete escape sequence"));
        }
      } else if ($1 === "\"") {
        let rest = $[0][1];
        return new Ok(new DecodeResult(new JsonString(acc), rest));
      } else {
        let c = $1;
        let rest = $[0][1];
        loop$json = rest;
        loop$acc = acc + c;
      }
    } else {
      return new Error(new InvalidJson("Unterminated string"));
    }
  }
}

function parse_string(json) {
  return parse_string_chars(json, "");
}

export function type_name(value) {
  if (value instanceof JsonNull) {
    return "Null";
  } else if (value instanceof JsonBool) {
    return "Bool";
  } else if (value instanceof JsonNumber) {
    return "Number";
  } else if (value instanceof JsonString) {
    return "String";
  } else if (value instanceof JsonArray) {
    return "Array";
  } else {
    return "Object";
  }
}

export function array_to_list(value) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return arr;
  } else {
    return toList([]);
  }
}

export function list_to_array(values) {
  return new JsonArray(values);
}

function parse_array_items(loop$json, loop$acc) {
  while (true) {
    let json = loop$json;
    let acc = loop$acc;
    let $ = parse_value(json);
    if ($ instanceof Ok) {
      let v = $[0][0];
      let rest = $[0][1];
      let rest$1 = trim(rest);
      let $1 = $str.pop_grapheme(rest$1);
      if ($1 instanceof Ok) {
        let $2 = $1[0][0];
        if ($2 === ",") {
          let rest2 = $1[0][1];
          loop$json = trim(rest2);
          loop$acc = listPrepend(v, acc);
        } else if ($2 === "]") {
          let rest2 = $1[0][1];
          return new Ok(
            new DecodeResult(
              new JsonArray($list.reverse(listPrepend(v, acc))),
              rest2,
            ),
          );
        } else {
          let c = $2;
          return new Error(
            new InvalidJson("Expected ',' or ']' in array, got: " + c),
          );
        }
      } else {
        return new Error(new InvalidJson("Unterminated array"));
      }
    } else {
      return $;
    }
  }
}

function parse_value(json) {
  let $ = $str.pop_grapheme(json);
  if ($ instanceof Ok) {
    let $1 = $[0][0];
    if ($1 === "n") {
      let rest = $[0][1];
      return parse_null(rest);
    } else if ($1 === "t") {
      let rest = $[0][1];
      return parse_true(rest);
    } else if ($1 === "f") {
      let rest = $[0][1];
      return parse_false(rest);
    } else if ($1 === "\"") {
      let rest = $[0][1];
      return parse_string(rest);
    } else if ($1 === "[") {
      let rest = $[0][1];
      return parse_array(rest);
    } else if ($1 === "{") {
      let rest = $[0][1];
      return parse_object(rest);
    } else {
      let c = $1;
      let $2 = is_digit(c) || (c === "-");
      if ($2) {
        return parse_number(json);
      } else {
        return new Error(new InvalidJson("Unexpected character: " + c));
      }
    }
  } else {
    return new Error(new InvalidJson("Empty input"));
  }
}

function parse_array(json) {
  let json$1 = trim(json);
  let $ = $str.pop_grapheme(json$1);
  if ($ instanceof Ok) {
    let $1 = $[0][0];
    if ($1 === "]") {
      let rest = $[0][1];
      return new Ok(new DecodeResult(new JsonArray(toList([])), rest));
    } else {
      return parse_array_items(json$1, toList([]));
    }
  } else {
    return new Error(new InvalidJson("Unterminated array"));
  }
}

export function decode(json) {
  let json$1 = trim(json);
  let $ = parse_value(json$1);
  if ($ instanceof Ok) {
    let value = $[0][0];
    let remaining = $[0][1];
    let remaining$1 = trim(remaining);
    let $1 = $str.is_empty(remaining$1);
    if ($1) {
      return new Ok(value);
    } else {
      return new Error(
        new InvalidJson(
          "Unexpected characters after JSON value: " + remaining$1,
        ),
      );
    }
  } else {
    return $;
  }
}

function parse_object_continue(key, value, json, acc) {
  let json$1 = trim(json);
  let $ = $str.pop_grapheme(json$1);
  if ($ instanceof Ok) {
    let $1 = $[0][0];
    if ($1 === ",") {
      let rest5 = $[0][1];
      return parse_object_pairs(trim(rest5), listPrepend([key, value], acc));
    } else if ($1 === "}") {
      let rest5 = $[0][1];
      return new Ok(
        new DecodeResult(
          new JsonObject($dict.from_list(listPrepend([key, value], acc))),
          rest5,
        ),
      );
    } else {
      let c = $1;
      return new Error(
        new InvalidJson("Expected ',' or '}' in object, got: " + c),
      );
    }
  } else {
    return new Error(new InvalidJson("Unterminated object"));
  }
}

function parse_object_pairs(json, acc) {
  let json$1 = trim(json);
  let $ = $str.pop_grapheme(json$1);
  if ($ instanceof Ok) {
    let $1 = $[0][0];
    if ($1 === "\"") {
      let rest = $[0][1];
      let $2 = parse_string(rest);
      if ($2 instanceof Ok) {
        let $3 = $2[0][0];
        if ($3 instanceof JsonString) {
          let rest2 = $2[0][1];
          let key = $3[0];
          return parse_object_value(key, rest2, acc);
        } else {
          return new Error(new InvalidJson("Expected string key"));
        }
      } else {
        return $2;
      }
    } else {
      let c = $1;
      return new Error(
        new InvalidJson("Expected string key in object, got: " + c),
      );
    }
  } else {
    return new Error(new InvalidJson("Unterminated object"));
  }
}

function parse_object_value(key, json, acc) {
  let json$1 = trim(json);
  let $ = $str.pop_grapheme(json$1);
  if ($ instanceof Ok) {
    let $1 = $[0][0];
    if ($1 === ":") {
      let rest3 = $[0][1];
      let rest3$1 = trim(rest3);
      let $2 = parse_value(rest3$1);
      if ($2 instanceof Ok) {
        let v = $2[0][0];
        let rest4 = $2[0][1];
        return parse_object_continue(key, v, rest4, acc);
      } else {
        return $2;
      }
    } else {
      let c = $1;
      return new Error(new InvalidJson("Expected ':' after key, got: " + c));
    }
  } else {
    return new Error(new InvalidJson("Expected ':' after key"));
  }
}

function parse_object(json) {
  let json$1 = trim(json);
  let $ = $str.pop_grapheme(json$1);
  if ($ instanceof Ok) {
    let $1 = $[0][0];
    if ($1 === "}") {
      let rest = $[0][1];
      return new Ok(new DecodeResult(new JsonObject($dict.new$()), rest));
    } else {
      return parse_object_pairs(json$1, toList([]));
    }
  } else {
    return new Error(new InvalidJson("Unterminated object"));
  }
}
