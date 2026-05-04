/// <reference types="./schema_builder.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $float from "../../gleam_stdlib/gleam/float.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { toList, Empty as $Empty } from "../gleam.mjs";
import * as $jsonx from "../traenupi_core/jsonx.mjs";
import { JsonNull, JsonBool, JsonNumber, JsonString, JsonArray, JsonObject } from "../traenupi_core/jsonx.mjs";
import * as $schema from "../traenupi_core/schema.mjs";
import {
  NullSchema,
  BoolSchema,
  NumberSchema,
  StringSchema,
  ArraySchema,
  ObjectSchema,
  OneOfSchema,
  AllOfSchema,
  AnyOfSchema,
  NotSchema,
  ConstSchema,
  EnumSchema,
  NumberConstraints,
  StringConstraints,
  ArrayConstraints,
  ObjectConstraints,
  EmailFormat,
  UriFormat,
  DateFormat,
  TimeFormat,
  DateTimeFormat,
  UuidFormat,
  HostnameFormat,
  Ipv4Format,
  Ipv6Format,
  all_of,
  any_of,
} from "../traenupi_core/schema.mjs";

function number_schema_to_json(constraints) {
  let base = $dict.from_list(toList([["type", new JsonString("number")]]));
  let _block;
  let $ = constraints.minimum;
  if ($ instanceof Some) {
    let min = $[0];
    _block = $dict.insert(base, "minimum", new JsonNumber(min));
  } else {
    _block = base;
  }
  let base$1 = _block;
  let _block$1;
  let $1 = constraints.maximum;
  if ($1 instanceof Some) {
    let max = $1[0];
    _block$1 = $dict.insert(base$1, "maximum", new JsonNumber(max));
  } else {
    _block$1 = base$1;
  }
  let base$2 = _block$1;
  let _block$2;
  let $2 = constraints.exclusive_minimum;
  if ($2 instanceof Some) {
    let min = $2[0];
    _block$2 = $dict.insert(base$2, "exclusiveMinimum", new JsonNumber(min));
  } else {
    _block$2 = base$2;
  }
  let base$3 = _block$2;
  let _block$3;
  let $3 = constraints.exclusive_maximum;
  if ($3 instanceof Some) {
    let max = $3[0];
    _block$3 = $dict.insert(base$3, "exclusiveMaximum", new JsonNumber(max));
  } else {
    _block$3 = base$3;
  }
  let base$4 = _block$3;
  let _block$4;
  let $4 = constraints.multiple_of;
  if ($4 instanceof Some) {
    let multiple = $4[0];
    _block$4 = $dict.insert(base$4, "multipleOf", new JsonNumber(multiple));
  } else {
    _block$4 = base$4;
  }
  let base$5 = _block$4;
  return new JsonObject(base$5);
}

function format_to_string(format) {
  if (format instanceof EmailFormat) {
    return "email";
  } else if (format instanceof UriFormat) {
    return "uri";
  } else if (format instanceof DateFormat) {
    return "date";
  } else if (format instanceof TimeFormat) {
    return "time";
  } else if (format instanceof DateTimeFormat) {
    return "date-time";
  } else if (format instanceof UuidFormat) {
    return "uuid";
  } else if (format instanceof HostnameFormat) {
    return "hostname";
  } else if (format instanceof Ipv4Format) {
    return "ipv4";
  } else {
    return "ipv6";
  }
}

function string_schema_to_json(constraints) {
  let base = $dict.from_list(toList([["type", new JsonString("string")]]));
  let _block;
  let $ = constraints.min_length;
  if ($ instanceof Some) {
    let min = $[0];
    _block = $dict.insert(base, "minLength", new JsonNumber($int.to_float(min)));
  } else {
    _block = base;
  }
  let base$1 = _block;
  let _block$1;
  let $1 = constraints.max_length;
  if ($1 instanceof Some) {
    let max = $1[0];
    _block$1 = $dict.insert(
      base$1,
      "maxLength",
      new JsonNumber($int.to_float(max)),
    );
  } else {
    _block$1 = base$1;
  }
  let base$2 = _block$1;
  let _block$2;
  let $2 = constraints.pattern;
  if ($2 instanceof Some) {
    let pattern = $2[0];
    _block$2 = $dict.insert(base$2, "pattern", new JsonString(pattern));
  } else {
    _block$2 = base$2;
  }
  let base$3 = _block$2;
  let _block$3;
  let $3 = constraints.format;
  if ($3 instanceof Some) {
    let format = $3[0];
    _block$3 = $dict.insert(
      base$3,
      "format",
      new JsonString(format_to_string(format)),
    );
  } else {
    _block$3 = base$3;
  }
  let base$4 = _block$3;
  return new JsonObject(base$4);
}

function escape_json_string(s) {
  let _pipe = s;
  let _pipe$1 = $string.replace(_pipe, "\\", "\\\\");
  let _pipe$2 = $string.replace(_pipe$1, "\"", "\\\"");
  let _pipe$3 = $string.replace(_pipe$2, "\n", "\\n");
  let _pipe$4 = $string.replace(_pipe$3, "\r", "\\r");
  return $string.replace(_pipe$4, "\t", "\\t");
}

function json_to_pretty_string(json, indent) {
  let indent_str = $string.repeat("  ", indent);
  let next_indent = indent + 1;
  let next_indent_str = $string.repeat("  ", next_indent);
  if (json instanceof JsonNull) {
    return "null";
  } else if (json instanceof JsonBool) {
    let $ = json[0];
    if ($) {
      return "true";
    } else {
      return "false";
    }
  } else if (json instanceof JsonNumber) {
    let n = json[0];
    let truncated = $float.truncate(n);
    let $ = $int.to_float(truncated) === n;
    if ($) {
      return $int.to_string(truncated);
    } else {
      return $float.to_string(n);
    }
  } else if (json instanceof JsonString) {
    let s = json[0];
    return ("\"" + escape_json_string(s)) + "\"";
  } else if (json instanceof JsonArray) {
    let items = json[0];
    if (items instanceof $Empty) {
      return "[]";
    } else {
      let formatted = $list.map(
        items,
        (item) => {
          return next_indent_str + json_to_pretty_string(item, next_indent);
        },
      );
      return ((("[\n" + $string.join(formatted, ",\n")) + "\n") + indent_str) + "]";
    }
  } else {
    let obj = json[0];
    let $ = $dict.size(obj);
    if ($ === 0) {
      return "{}";
    } else {
      let pairs = $dict.to_list(obj);
      let formatted = $list.map(
        pairs,
        (pair) => {
          let key;
          let value;
          key = pair[0];
          value = pair[1];
          return (((next_indent_str + "\"") + escape_json_string(key)) + "\": ") + json_to_pretty_string(
            value,
            next_indent,
          );
        },
      );
      return ((("{\n" + $string.join(formatted, ",\n")) + "\n") + indent_str) + "}";
    }
  }
}

export function merge_schemas(base, override) {
  return all_of(toList([base, override]));
}

export function make_nullable(schema) {
  return any_of(toList([schema, new NullSchema()]));
}

export function string_schema() {
  return new StringSchema(
    new StringConstraints(new None(), new None(), new None(), new None()),
  );
}

export function number_schema() {
  return new NumberSchema(
    new NumberConstraints(
      new None(),
      new None(),
      new None(),
      new None(),
      new None(),
    ),
  );
}

export function integer_schema() {
  return new NumberSchema(
    new NumberConstraints(
      new None(),
      new None(),
      new None(),
      new None(),
      new Some(1.0),
    ),
  );
}

export function array_schema() {
  return new ArraySchema(
    new ArrayConstraints(new None(), new None(), new None(), false),
  );
}

export function object_schema() {
  return new ObjectSchema(
    new ObjectConstraints(
      $dict.new$(),
      toList([]),
      new None(),
      $dict.new$(),
      new None(),
      new None(),
    ),
  );
}

export function boolean_schema() {
  return new BoolSchema();
}

export function null_schema() {
  return new NullSchema();
}

function array_schema_to_json(constraints) {
  let base = $dict.from_list(toList([["type", new JsonString("array")]]));
  let _block;
  let $ = constraints.items;
  if ($ instanceof Some) {
    let items_schema = $[0];
    _block = $dict.insert(base, "items", schema_to_json(items_schema));
  } else {
    _block = base;
  }
  let base$1 = _block;
  let _block$1;
  let $1 = constraints.min_items;
  if ($1 instanceof Some) {
    let min = $1[0];
    _block$1 = $dict.insert(
      base$1,
      "minItems",
      new JsonNumber($int.to_float(min)),
    );
  } else {
    _block$1 = base$1;
  }
  let base$2 = _block$1;
  let _block$2;
  let $2 = constraints.max_items;
  if ($2 instanceof Some) {
    let max = $2[0];
    _block$2 = $dict.insert(
      base$2,
      "maxItems",
      new JsonNumber($int.to_float(max)),
    );
  } else {
    _block$2 = base$2;
  }
  let base$3 = _block$2;
  let _block$3;
  let $3 = constraints.unique_items;
  if ($3) {
    _block$3 = $dict.insert(base$3, "uniqueItems", new JsonBool(true));
  } else {
    _block$3 = base$3;
  }
  let base$4 = _block$3;
  return new JsonObject(base$4);
}

export function schema_to_json(schema) {
  if (schema instanceof NullSchema) {
    return new JsonObject(
      $dict.from_list(toList([["type", new JsonString("null")]])),
    );
  } else if (schema instanceof BoolSchema) {
    return new JsonObject(
      $dict.from_list(toList([["type", new JsonString("boolean")]])),
    );
  } else if (schema instanceof NumberSchema) {
    let constraints = schema[0];
    return number_schema_to_json(constraints);
  } else if (schema instanceof StringSchema) {
    let constraints = schema[0];
    return string_schema_to_json(constraints);
  } else if (schema instanceof ArraySchema) {
    let constraints = schema[0];
    return array_schema_to_json(constraints);
  } else if (schema instanceof ObjectSchema) {
    let constraints = schema[0];
    return object_schema_to_json(constraints);
  } else if (schema instanceof OneOfSchema) {
    let schemas = schema.schemas;
    return new JsonObject(
      $dict.from_list(
        toList([["oneOf", new JsonArray($list.map(schemas, schema_to_json))]]),
      ),
    );
  } else if (schema instanceof AllOfSchema) {
    let schemas = schema.schemas;
    return new JsonObject(
      $dict.from_list(
        toList([["allOf", new JsonArray($list.map(schemas, schema_to_json))]]),
      ),
    );
  } else if (schema instanceof AnyOfSchema) {
    let schemas = schema.schemas;
    return new JsonObject(
      $dict.from_list(
        toList([["anyOf", new JsonArray($list.map(schemas, schema_to_json))]]),
      ),
    );
  } else if (schema instanceof NotSchema) {
    let inner = schema.schema;
    return new JsonObject(
      $dict.from_list(toList([["not", schema_to_json(inner)]])),
    );
  } else if (schema instanceof ConstSchema) {
    let value = schema.value;
    return new JsonObject($dict.from_list(toList([["const", value]])));
  } else {
    let values = schema.values;
    return new JsonObject(
      $dict.from_list(toList([["enum", new JsonArray(values)]])),
    );
  }
}

function object_schema_to_json(constraints) {
  let base = $dict.from_list(toList([["type", new JsonString("object")]]));
  let properties = $dict.map_values(
    constraints.properties,
    (_, schema) => { return schema_to_json(schema); },
  );
  let _block;
  let $ = $dict.size(properties) > 0;
  if ($) {
    _block = $dict.insert(base, "properties", new JsonObject(properties));
  } else {
    _block = base;
  }
  let base$1 = _block;
  let _block$1;
  let $1 = constraints.required;
  if ($1 instanceof $Empty) {
    _block$1 = base$1;
  } else {
    let fields = $1;
    _block$1 = $dict.insert(
      base$1,
      "required",
      new JsonArray(
        $list.map(fields, (var0) => { return new JsonString(var0); }),
      ),
    );
  }
  let base$2 = _block$1;
  let _block$2;
  let $2 = constraints.additional_properties;
  if ($2 instanceof Some) {
    let additional_schema = $2[0];
    _block$2 = $dict.insert(
      base$2,
      "additionalProperties",
      schema_to_json(additional_schema),
    );
  } else {
    _block$2 = $dict.insert(base$2, "additionalProperties", new JsonBool(false));
  }
  let base$3 = _block$2;
  let _block$3;
  let $3 = constraints.min_properties;
  if ($3 instanceof Some) {
    let min = $3[0];
    _block$3 = $dict.insert(
      base$3,
      "minProperties",
      new JsonNumber($int.to_float(min)),
    );
  } else {
    _block$3 = base$3;
  }
  let base$4 = _block$3;
  let _block$4;
  let $4 = constraints.max_properties;
  if ($4 instanceof Some) {
    let max = $4[0];
    _block$4 = $dict.insert(
      base$4,
      "maxProperties",
      new JsonNumber($int.to_float(max)),
    );
  } else {
    _block$4 = base$4;
  }
  let base$5 = _block$4;
  return new JsonObject(base$5);
}

export function schema_to_string(schema) {
  let json = schema_to_json(schema);
  return json_to_pretty_string(json, 0);
}
