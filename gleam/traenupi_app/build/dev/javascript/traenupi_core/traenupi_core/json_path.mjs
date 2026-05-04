/// <reference types="./json_path.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $str from "../../gleam_stdlib/gleam/string.mjs";
import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
} from "../gleam.mjs";
import * as $jsonx from "../traenupi_core/jsonx.mjs";
import { JsonArray, JsonObject } from "../traenupi_core/jsonx.mjs";

export class InvalidPath extends $CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
export const JsonPathError$InvalidPath = (message) => new InvalidPath(message);
export const JsonPathError$isInvalidPath = (value) =>
  value instanceof InvalidPath;
export const JsonPathError$InvalidPath$message = (value) => value.message;
export const JsonPathError$InvalidPath$0 = (value) => value.message;

export class PathNotFound extends $CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
export const JsonPathError$PathNotFound = (path) => new PathNotFound(path);
export const JsonPathError$isPathNotFound = (value) =>
  value instanceof PathNotFound;
export const JsonPathError$PathNotFound$path = (value) => value.path;
export const JsonPathError$PathNotFound$0 = (value) => value.path;

export class InvalidIndex extends $CustomType {
  constructor(index, length) {
    super();
    this.index = index;
    this.length = length;
  }
}
export const JsonPathError$InvalidIndex = (index, length) =>
  new InvalidIndex(index, length);
export const JsonPathError$isInvalidIndex = (value) =>
  value instanceof InvalidIndex;
export const JsonPathError$InvalidIndex$index = (value) => value.index;
export const JsonPathError$InvalidIndex$0 = (value) => value.index;
export const JsonPathError$InvalidIndex$length = (value) => value.length;
export const JsonPathError$InvalidIndex$1 = (value) => value.length;

export class TypeMismatch extends $CustomType {
  constructor(expected, found) {
    super();
    this.expected = expected;
    this.found = found;
  }
}
export const JsonPathError$TypeMismatch = (expected, found) =>
  new TypeMismatch(expected, found);
export const JsonPathError$isTypeMismatch = (value) =>
  value instanceof TypeMismatch;
export const JsonPathError$TypeMismatch$expected = (value) => value.expected;
export const JsonPathError$TypeMismatch$0 = (value) => value.expected;
export const JsonPathError$TypeMismatch$found = (value) => value.found;
export const JsonPathError$TypeMismatch$1 = (value) => value.found;

export class Root extends $CustomType {}
export const PathSegment$Root = () => new Root();
export const PathSegment$isRoot = (value) => value instanceof Root;

export class Field extends $CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
}
export const PathSegment$Field = (name) => new Field(name);
export const PathSegment$isField = (value) => value instanceof Field;
export const PathSegment$Field$name = (value) => value.name;
export const PathSegment$Field$0 = (value) => value.name;

export class Index extends $CustomType {
  constructor(idx) {
    super();
    this.idx = idx;
  }
}
export const PathSegment$Index = (idx) => new Index(idx);
export const PathSegment$isIndex = (value) => value instanceof Index;
export const PathSegment$Index$idx = (value) => value.idx;
export const PathSegment$Index$0 = (value) => value.idx;

export class Wildcard extends $CustomType {}
export const PathSegment$Wildcard = () => new Wildcard();
export const PathSegment$isWildcard = (value) => value instanceof Wildcard;

export class RecursiveField extends $CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
}
export const PathSegment$RecursiveField = (name) => new RecursiveField(name);
export const PathSegment$isRecursiveField = (value) =>
  value instanceof RecursiveField;
export const PathSegment$RecursiveField$name = (value) => value.name;
export const PathSegment$RecursiveField$0 = (value) => value.name;

export class Slice extends $CustomType {
  constructor(start, stop, step) {
    super();
    this.start = start;
    this.stop = stop;
    this.step = step;
  }
}
export const PathSegment$Slice = (start, stop, step) =>
  new Slice(start, stop, step);
export const PathSegment$isSlice = (value) => value instanceof Slice;
export const PathSegment$Slice$start = (value) => value.start;
export const PathSegment$Slice$0 = (value) => value.start;
export const PathSegment$Slice$stop = (value) => value.stop;
export const PathSegment$Slice$1 = (value) => value.stop;
export const PathSegment$Slice$step = (value) => value.step;
export const PathSegment$Slice$2 = (value) => value.step;

export class JsonPath extends $CustomType {
  constructor(segments) {
    super();
    this.segments = segments;
  }
}
export const JsonPath$JsonPath = (segments) => new JsonPath(segments);
export const JsonPath$isJsonPath = (value) => value instanceof JsonPath;
export const JsonPath$JsonPath$segments = (value) => value.segments;
export const JsonPath$JsonPath$0 = (value) => value.segments;

function parse_quoted_field(path) {
  let parts = $str.split(path, "'");
  if (parts instanceof $Empty) {
    return new Error(new InvalidPath("Unterminated quoted field"));
  } else {
    let $ = parts.tail;
    if ($ instanceof $Empty) {
      let name = parts.head;
      let rest = $;
      if (name === "") {
        return new Error(new InvalidPath("Unterminated quoted field"));
      } else {
        let remaining = $str.join(rest, "'");
        let _block;
        let $1 = $str.first(remaining);
        if ($1 instanceof Ok) {
          let $2 = $1[0];
          if ($2 === "]") {
            _block = $str.drop_start(remaining, 1);
          } else {
            _block = remaining;
          }
        } else {
          _block = remaining;
        }
        let remaining$1 = _block;
        return new Ok([new Field(name), remaining$1]);
      }
    } else {
      let $1 = $.head;
      if ($1 === "") {
        let name = parts.head;
        let rest = $.tail;
        let remaining = $str.join(rest, "'");
        let _block;
        let $2 = $str.first(remaining);
        if ($2 instanceof Ok) {
          let $3 = $2[0];
          if ($3 === "]") {
            _block = $str.drop_start(remaining, 1);
          } else {
            _block = remaining;
          }
        } else {
          _block = remaining;
        }
        let remaining$1 = _block;
        return new Ok([new Field(name), remaining$1]);
      } else {
        let name = parts.head;
        let rest = $;
        if (name === "") {
          return new Error(new InvalidPath("Unterminated quoted field"));
        } else {
          let remaining = $str.join(rest, "'");
          let _block;
          let $2 = $str.first(remaining);
          if ($2 instanceof Ok) {
            let $3 = $2[0];
            if ($3 === "]") {
              _block = $str.drop_start(remaining, 1);
            } else {
              _block = remaining;
            }
          } else {
            _block = remaining;
          }
          let remaining$1 = _block;
          return new Ok([new Field(name), remaining$1]);
        }
      }
    }
  }
}

function list_first(list) {
  if (list instanceof $Empty) {
    return new Error(undefined);
  } else {
    let first = list.head;
    return new Ok(first);
  }
}

function list_second(list) {
  if (list instanceof $Empty) {
    return new Error(undefined);
  } else {
    let $ = list.tail;
    if ($ instanceof $Empty) {
      return new Error(undefined);
    } else {
      let second = $.head;
      return new Ok(second);
    }
  }
}

function parse_slice(start_str, rest) {
  let _block;
  let $ = $str.trim(start_str);
  if ($ === "") {
    _block = new Ok(new None());
  } else {
    let s = $;
    let $1 = $int.parse(s);
    if ($1 instanceof Ok) {
      let n = $1[0];
      _block = new Ok(new Some(n));
    } else {
      _block = new Error(new InvalidPath("Invalid slice start"));
    }
  }
  let start_result = _block;
  if (start_result instanceof Ok) {
    let start = start_result[0];
    let $1 = $str.split(rest, "]");
    if ($1 instanceof $Empty) {
      return new Error(new InvalidPath("Unterminated slice"));
    } else {
      let $2 = $1.tail;
      if ($2 instanceof $Empty) {
        return new Error(new InvalidPath("Unterminated slice"));
      } else {
        let $3 = $2.tail;
        if ($3 instanceof $Empty) {
          let end_part = $1.head;
          let remaining = $2.head;
          let parts = $str.split(end_part, ":");
          let _block$1;
          let $4 = list_first(parts);
          if ($4 instanceof Ok) {
            let s = $4[0];
            let $5 = $str.trim(s);
            if ($5 === "") {
              _block$1 = new Ok(new None());
            } else {
              let v = $5;
              let $6 = $int.parse(v);
              if ($6 instanceof Ok) {
                let n = $6[0];
                _block$1 = new Ok(new Some(n));
              } else {
                _block$1 = new Error(new InvalidPath("Invalid slice stop"));
              }
            }
          } else {
            _block$1 = new Ok(new None());
          }
          let stop_result = _block$1;
          if (stop_result instanceof Ok) {
            let stop = stop_result[0];
            let _block$2;
            let $5 = list_second(parts);
            if ($5 instanceof Ok) {
              let s = $5[0];
              let $6 = $str.trim(s);
              if ($6 === "") {
                _block$2 = new Ok(new None());
              } else {
                let v = $6;
                let $7 = $int.parse(v);
                if ($7 instanceof Ok) {
                  let n = $7[0];
                  _block$2 = new Ok(new Some(n));
                } else {
                  _block$2 = new Error(new InvalidPath("Invalid slice step"));
                }
              }
            } else {
              _block$2 = new Ok(new None());
            }
            let step_result = _block$2;
            if (step_result instanceof Ok) {
              let step = step_result[0];
              return new Ok([new Slice(start, stop, step), remaining]);
            } else {
              return step_result;
            }
          } else {
            return stop_result;
          }
        } else {
          return new Error(new InvalidPath("Unterminated slice"));
        }
      }
    }
  } else {
    return start_result;
  }
}

function parse_index_or_slice(path) {
  let parts = $str.split(path, ":");
  if (parts instanceof $Empty) {
    return new Error(new InvalidPath("Empty expression"));
  } else {
    let $ = parts.tail;
    if ($ instanceof $Empty) {
      let first = parts.head;
      let $1 = $str.split(first, "]");
      if ($1 instanceof $Empty) {
        return new Error(new InvalidPath("Unterminated bracket"));
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          return new Error(new InvalidPath("Unterminated bracket"));
        } else {
          let $3 = $2.tail;
          if ($3 instanceof $Empty) {
            let idx_str = $1.head;
            let rest = $2.head;
            let $4 = $int.parse($str.trim(idx_str));
            if ($4 instanceof Ok) {
              let idx = $4[0];
              return new Ok([new Index(idx), rest]);
            } else {
              return new Error(new InvalidPath("Invalid index: " + idx_str));
            }
          } else {
            return new Error(new InvalidPath("Unterminated bracket"));
          }
        }
      }
    } else {
      let first = parts.head;
      let rest = $;
      let rest_joined = $str.join(rest, ":");
      return parse_slice(first, rest_joined);
    }
  }
}

function parse_bracket(path) {
  let $ = $str.first(path);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 === "'") {
      return parse_quoted_field($str.drop_start(path, 1));
    } else if ($1 === "*") {
      return new Ok([new Wildcard(), $str.drop_start(path, 2)]);
    } else {
      return parse_index_or_slice(path);
    }
  } else {
    return new Error(new InvalidPath("Invalid bracket expression"));
  }
}

function list_at(loop$list, loop$index) {
  while (true) {
    let list = loop$list;
    let index = loop$index;
    if (list instanceof $Empty) {
      return new Error(undefined);
    } else {
      let first = list.head;
      let rest = list.tail;
      if (index === 0) {
        return new Ok(first);
      } else {
        loop$list = rest;
        loop$index = index - 1;
      }
    }
  }
}

function is_identifier_char(c) {
  if (c === "a") {
    return true;
  } else if (c === "b") {
    return true;
  } else if (c === "c") {
    return true;
  } else if (c === "d") {
    return true;
  } else if (c === "e") {
    return true;
  } else if (c === "f") {
    return true;
  } else if (c === "g") {
    return true;
  } else if (c === "h") {
    return true;
  } else if (c === "i") {
    return true;
  } else if (c === "j") {
    return true;
  } else if (c === "k") {
    return true;
  } else if (c === "l") {
    return true;
  } else if (c === "m") {
    return true;
  } else if (c === "n") {
    return true;
  } else if (c === "o") {
    return true;
  } else if (c === "p") {
    return true;
  } else if (c === "q") {
    return true;
  } else if (c === "r") {
    return true;
  } else if (c === "s") {
    return true;
  } else if (c === "t") {
    return true;
  } else if (c === "u") {
    return true;
  } else if (c === "v") {
    return true;
  } else if (c === "w") {
    return true;
  } else if (c === "x") {
    return true;
  } else if (c === "y") {
    return true;
  } else if (c === "z") {
    return true;
  } else if (c === "A") {
    return true;
  } else if (c === "B") {
    return true;
  } else if (c === "C") {
    return true;
  } else if (c === "D") {
    return true;
  } else if (c === "E") {
    return true;
  } else if (c === "F") {
    return true;
  } else if (c === "G") {
    return true;
  } else if (c === "H") {
    return true;
  } else if (c === "I") {
    return true;
  } else if (c === "J") {
    return true;
  } else if (c === "K") {
    return true;
  } else if (c === "L") {
    return true;
  } else if (c === "M") {
    return true;
  } else if (c === "N") {
    return true;
  } else if (c === "O") {
    return true;
  } else if (c === "P") {
    return true;
  } else if (c === "Q") {
    return true;
  } else if (c === "R") {
    return true;
  } else if (c === "S") {
    return true;
  } else if (c === "T") {
    return true;
  } else if (c === "U") {
    return true;
  } else if (c === "V") {
    return true;
  } else if (c === "W") {
    return true;
  } else if (c === "X") {
    return true;
  } else if (c === "Y") {
    return true;
  } else if (c === "Z") {
    return true;
  } else if (c === "0") {
    return true;
  } else if (c === "1") {
    return true;
  } else if (c === "2") {
    return true;
  } else if (c === "3") {
    return true;
  } else if (c === "4") {
    return true;
  } else if (c === "5") {
    return true;
  } else if (c === "6") {
    return true;
  } else if (c === "7") {
    return true;
  } else if (c === "8") {
    return true;
  } else if (c === "9") {
    return true;
  } else if (c === "_") {
    return true;
  } else {
    return false;
  }
}

function take_identifier(path) {
  let _pipe = path;
  let _pipe$1 = $str.to_graphemes(_pipe);
  let _pipe$2 = $list.take_while(
    _pipe$1,
    (c) => { return is_identifier_char(c); },
  );
  return $str.join(_pipe$2, "");
}

function parse_field(path) {
  let field_name = take_identifier(path);
  if (field_name === "") {
    return new Error(new InvalidPath("Expected field name"));
  } else {
    return new Ok(
      [new Field(field_name), $str.drop_start(path, $str.length(field_name))],
    );
  }
}

function parse_recursive_field(path) {
  let field_name = take_identifier(path);
  if (field_name === "") {
    return new Error(new InvalidPath("Expected field name after .."));
  } else {
    return new Ok(
      [
        new RecursiveField(field_name),
        $str.drop_start(path, $str.length(field_name)),
      ],
    );
  }
}

function parse_single_segment(path) {
  let $ = $str.first(path);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 === ".") {
      let $2 = $str.first($str.drop_start(path, 1));
      if ($2 instanceof Ok) {
        let $3 = $2[0];
        if ($3 === ".") {
          let rest = $str.drop_start(path, 2);
          return parse_recursive_field(rest);
        } else if ($3 === "*") {
          return new Ok([new Wildcard(), $str.drop_start(path, 2)]);
        } else {
          return parse_field($str.drop_start(path, 1));
        }
      } else {
        return parse_field($str.drop_start(path, 1));
      }
    } else if ($1 === "[") {
      return parse_bracket($str.drop_start(path, 1));
    } else {
      return new Error(new InvalidPath("Unexpected character in path: " + path));
    }
  } else {
    return new Error(new InvalidPath("Unexpected character in path: " + path));
  }
}

function parse_all_segments(loop$path, loop$acc) {
  while (true) {
    let path = loop$path;
    let acc = loop$acc;
    if (path === "") {
      return new Ok($list.reverse(acc));
    } else {
      let $ = parse_single_segment(path);
      if ($ instanceof Ok) {
        let segment = $[0][0];
        let remaining = $[0][1];
        loop$path = remaining;
        loop$acc = listPrepend(segment, acc);
      } else {
        return $;
      }
    }
  }
}

function parse_segments(path) {
  if (path === "") {
    return new Ok(new JsonPath(toList([new Root()])));
  } else {
    let segments = parse_all_segments(path, toList([]));
    if (segments instanceof Ok) {
      let segs = segments[0];
      return new Ok(new JsonPath(listPrepend(new Root(), segs)));
    } else {
      return segments;
    }
  }
}

export function parse(path) {
  if (path === "$") {
    return new Ok(new JsonPath(toList([new Root()])));
  } else if (path === "") {
    return new Error(new InvalidPath("Empty path"));
  } else {
    let $ = $str.first(path);
    if ($ instanceof Ok) {
      let $1 = $[0];
      if ($1 === "$") {
        return parse_segments($str.drop_start(path, 1));
      } else {
        return new Error(new InvalidPath("Path must start with $"));
      }
    } else {
      return new Error(new InvalidPath("Path must start with $"));
    }
  }
}

function get_field(name, value) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    let $ = $dict.get(obj, name);
    if ($ instanceof Ok) {
      let v = $[0];
      return new Ok(toList([v]));
    } else {
      return new Ok(toList([]));
    }
  } else {
    return new Error(new TypeMismatch("Object", $jsonx.type_name(value)));
  }
}

function get_index(idx, value) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    let len = $list.length(arr);
    let _block;
    let $ = idx < 0;
    if ($) {
      _block = len + idx;
    } else {
      _block = idx;
    }
    let actual_idx = _block;
    let $1 = list_at(arr, actual_idx);
    if ($1 instanceof Ok) {
      let v = $1[0];
      return new Ok(toList([v]));
    } else {
      return new Ok(toList([]));
    }
  } else {
    return new Error(new TypeMismatch("Array", $jsonx.type_name(value)));
  }
}

function get_all_children(value) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    return new Ok(arr);
  } else if (value instanceof JsonObject) {
    let obj = value[0];
    return new Ok($dict.values(obj));
  } else {
    return new Ok(toList([]));
  }
}

function get_recursive_field(name, value, acc) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    let nested = $list.fold(
      arr,
      toList([]),
      (acc2, child) => {
        let $ = get_recursive_field(name, child, toList([]));
        if ($ instanceof Ok) {
          let found = $[0];
          return $list.append(acc2, found);
        } else {
          return acc2;
        }
      },
    );
    return new Ok($list.append(acc, nested));
  } else if (value instanceof JsonObject) {
    let obj = value[0];
    let _block;
    let $ = $dict.get(obj, name);
    if ($ instanceof Ok) {
      let v = $[0];
      _block = toList([v]);
    } else {
      _block = toList([]);
    }
    let direct = _block;
    let nested = $list.fold(
      $dict.to_list(obj),
      toList([]),
      (acc2, pair) => {
        let child;
        child = pair[1];
        let $1 = get_recursive_field(name, child, toList([]));
        if ($1 instanceof Ok) {
          let found = $1[0];
          return $list.append(acc2, found);
        } else {
          return acc2;
        }
      },
    );
    return new Ok($list.append(acc, $list.append(direct, nested)));
  } else {
    return new Ok(acc);
  }
}

function slice_array(loop$arr, loop$start, loop$stop, loop$step, loop$acc) {
  while (true) {
    let arr = loop$arr;
    let start = loop$start;
    let stop = loop$stop;
    let step = loop$step;
    let acc = loop$acc;
    if (step === 0) {
      return $list.reverse(acc);
    } else {
      let $ = start >= stop;
      let $1 = step > 0;
      if ($) {
        if ($1) {
          return $list.reverse(acc);
        } else {
          return $list.reverse(acc);
        }
      } else if ($1) {
        let $2 = list_at(arr, start);
        if ($2 instanceof Ok) {
          let v = $2[0];
          loop$arr = arr;
          loop$start = start + step;
          loop$stop = stop;
          loop$step = step;
          loop$acc = listPrepend(v, acc);
        } else {
          return $list.reverse(acc);
        }
      } else {
        return $list.reverse(acc);
      }
    }
  }
}

function get_slice(start, stop, step, value) {
  if (value instanceof JsonArray) {
    let arr = value[0];
    let len = $list.length(arr);
    let start_idx = $option.unwrap(start, 0);
    let stop_idx = $option.unwrap(stop, len);
    let step_val = $option.unwrap(step, 1);
    let _block;
    let $ = start_idx < 0;
    if ($) {
      _block = len + start_idx;
    } else {
      _block = start_idx;
    }
    let actual_start = _block;
    let _block$1;
    let $1 = stop_idx < 0;
    if ($1) {
      _block$1 = len + stop_idx;
    } else {
      _block$1 = stop_idx;
    }
    let actual_stop = _block$1;
    let slice = slice_array(
      arr,
      actual_start,
      actual_stop,
      step_val,
      toList([]),
    );
    return new Ok(slice);
  } else {
    return new Error(new TypeMismatch("Array", $jsonx.type_name(value)));
  }
}

function apply_segment(segment, value) {
  if (segment instanceof Root) {
    return new Ok(toList([value]));
  } else if (segment instanceof Field) {
    let name = segment.name;
    return get_field(name, value);
  } else if (segment instanceof Index) {
    let idx = segment.idx;
    return get_index(idx, value);
  } else if (segment instanceof Wildcard) {
    return get_all_children(value);
  } else if (segment instanceof RecursiveField) {
    let name = segment.name;
    return get_recursive_field(name, value, toList([]));
  } else {
    let start = segment.start;
    let stop = segment.stop;
    let step = segment.step;
    return get_slice(start, stop, step, value);
  }
}

function query_segments(loop$segments, loop$values) {
  while (true) {
    let segments = loop$segments;
    let values = loop$values;
    if (segments instanceof $Empty) {
      return new Ok(values);
    } else {
      let segment = segments.head;
      let rest = segments.tail;
      let result = $list.fold(
        values,
        new Ok(toList([])),
        (acc, value) => {
          if (acc instanceof Ok) {
            let results = acc[0];
            let $ = apply_segment(segment, value);
            if ($ instanceof Ok) {
              let new_values = $[0];
              return new Ok($list.append(results, new_values));
            } else {
              return $;
            }
          } else {
            return acc;
          }
        },
      );
      if (result instanceof Ok) {
        let new_values = result[0];
        loop$segments = rest;
        loop$values = new_values;
      } else {
        return result;
      }
    }
  }
}

export function query(path, value) {
  return query_segments(path.segments, toList([value]));
}

function segment_to_string(segment) {
  if (segment instanceof Root) {
    return "$";
  } else if (segment instanceof Field) {
    let name = segment.name;
    return "." + name;
  } else if (segment instanceof Index) {
    let idx = segment.idx;
    return ("[" + $int.to_string(idx)) + "]";
  } else if (segment instanceof Wildcard) {
    return ".*";
  } else if (segment instanceof RecursiveField) {
    let name = segment.name;
    return ".." + name;
  } else {
    let start = segment.start;
    let stop = segment.stop;
    let step = segment.step;
    let _block;
    if (start instanceof Some) {
      let i = start[0];
      _block = $int.to_string(i);
    } else {
      _block = "";
    }
    let start_str = _block;
    let _block$1;
    if (stop instanceof Some) {
      let i = stop[0];
      _block$1 = $int.to_string(i);
    } else {
      _block$1 = "";
    }
    let stop_str = _block$1;
    let _block$2;
    if (step instanceof Some) {
      let i = step[0];
      _block$2 = $int.to_string(i);
    } else {
      _block$2 = "";
    }
    let step_str = _block$2;
    if (step instanceof Some) {
      return ((((("[" + start_str) + ":") + stop_str) + ":") + step_str) + "]";
    } else {
      return ((("[" + start_str) + ":") + stop_str) + "]";
    }
  }
}

export function path_to_string(path) {
  return $list.fold(
    path.segments,
    "",
    (acc, segment) => { return acc + segment_to_string(segment); },
  );
}

export function query_one(path, value) {
  let $ = query(path, value);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 instanceof $Empty) {
      return new Error(new PathNotFound(path_to_string(path)));
    } else {
      let $2 = $1.tail;
      if ($2 instanceof $Empty) {
        let v = $1.head;
        return new Ok(v);
      } else {
        let values = $1;
        return new Ok(new JsonArray(values));
      }
    }
  } else {
    return $;
  }
}
