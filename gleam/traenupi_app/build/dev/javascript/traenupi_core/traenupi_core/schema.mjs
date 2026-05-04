/// <reference types="./schema.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $float from "../../gleam_stdlib/gleam/float.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $result from "../../gleam_stdlib/gleam/result.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
  divideFloat,
  isEqual,
} from "../gleam.mjs";
import * as $jsonx from "../traenupi_core/jsonx.mjs";
import { JsonNull, JsonBool, JsonNumber, JsonString, JsonArray, JsonObject } from "../traenupi_core/jsonx.mjs";

export class TypeMismatch extends $CustomType {
  constructor(path, expected, found) {
    super();
    this.path = path;
    this.expected = expected;
    this.found = found;
  }
}
export const SchemaError$TypeMismatch = (path, expected, found) =>
  new TypeMismatch(path, expected, found);
export const SchemaError$isTypeMismatch = (value) =>
  value instanceof TypeMismatch;
export const SchemaError$TypeMismatch$path = (value) => value.path;
export const SchemaError$TypeMismatch$0 = (value) => value.path;
export const SchemaError$TypeMismatch$expected = (value) => value.expected;
export const SchemaError$TypeMismatch$1 = (value) => value.expected;
export const SchemaError$TypeMismatch$found = (value) => value.found;
export const SchemaError$TypeMismatch$2 = (value) => value.found;

export class MissingField extends $CustomType {
  constructor(path, field) {
    super();
    this.path = path;
    this.field = field;
  }
}
export const SchemaError$MissingField = (path, field) =>
  new MissingField(path, field);
export const SchemaError$isMissingField = (value) =>
  value instanceof MissingField;
export const SchemaError$MissingField$path = (value) => value.path;
export const SchemaError$MissingField$0 = (value) => value.path;
export const SchemaError$MissingField$field = (value) => value.field;
export const SchemaError$MissingField$1 = (value) => value.field;

export class ExtraField extends $CustomType {
  constructor(path, field) {
    super();
    this.path = path;
    this.field = field;
  }
}
export const SchemaError$ExtraField = (path, field) =>
  new ExtraField(path, field);
export const SchemaError$isExtraField = (value) => value instanceof ExtraField;
export const SchemaError$ExtraField$path = (value) => value.path;
export const SchemaError$ExtraField$0 = (value) => value.path;
export const SchemaError$ExtraField$field = (value) => value.field;
export const SchemaError$ExtraField$1 = (value) => value.field;

export class InvalidValue extends $CustomType {
  constructor(path, message) {
    super();
    this.path = path;
    this.message = message;
  }
}
export const SchemaError$InvalidValue = (path, message) =>
  new InvalidValue(path, message);
export const SchemaError$isInvalidValue = (value) =>
  value instanceof InvalidValue;
export const SchemaError$InvalidValue$path = (value) => value.path;
export const SchemaError$InvalidValue$0 = (value) => value.path;
export const SchemaError$InvalidValue$message = (value) => value.message;
export const SchemaError$InvalidValue$1 = (value) => value.message;

export class ArrayItemError extends $CustomType {
  constructor(path, index, error) {
    super();
    this.path = path;
    this.index = index;
    this.error = error;
  }
}
export const SchemaError$ArrayItemError = (path, index, error) =>
  new ArrayItemError(path, index, error);
export const SchemaError$isArrayItemError = (value) =>
  value instanceof ArrayItemError;
export const SchemaError$ArrayItemError$path = (value) => value.path;
export const SchemaError$ArrayItemError$0 = (value) => value.path;
export const SchemaError$ArrayItemError$index = (value) => value.index;
export const SchemaError$ArrayItemError$1 = (value) => value.index;
export const SchemaError$ArrayItemError$error = (value) => value.error;
export const SchemaError$ArrayItemError$2 = (value) => value.error;

export class CustomError extends $CustomType {
  constructor(path, message) {
    super();
    this.path = path;
    this.message = message;
  }
}
export const SchemaError$CustomError = (path, message) =>
  new CustomError(path, message);
export const SchemaError$isCustomError = (value) =>
  value instanceof CustomError;
export const SchemaError$CustomError$path = (value) => value.path;
export const SchemaError$CustomError$0 = (value) => value.path;
export const SchemaError$CustomError$message = (value) => value.message;
export const SchemaError$CustomError$1 = (value) => value.message;

export const SchemaError$path = (value) => value.path;

export class NullSchema extends $CustomType {}
export const Schema$NullSchema = () => new NullSchema();
export const Schema$isNullSchema = (value) => value instanceof NullSchema;

export class BoolSchema extends $CustomType {}
export const Schema$BoolSchema = () => new BoolSchema();
export const Schema$isBoolSchema = (value) => value instanceof BoolSchema;

export class NumberSchema extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Schema$NumberSchema = ($0) => new NumberSchema($0);
export const Schema$isNumberSchema = (value) => value instanceof NumberSchema;
export const Schema$NumberSchema$0 = (value) => value[0];

export class StringSchema extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Schema$StringSchema = ($0) => new StringSchema($0);
export const Schema$isStringSchema = (value) => value instanceof StringSchema;
export const Schema$StringSchema$0 = (value) => value[0];

export class ArraySchema extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Schema$ArraySchema = ($0) => new ArraySchema($0);
export const Schema$isArraySchema = (value) => value instanceof ArraySchema;
export const Schema$ArraySchema$0 = (value) => value[0];

export class ObjectSchema extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Schema$ObjectSchema = ($0) => new ObjectSchema($0);
export const Schema$isObjectSchema = (value) => value instanceof ObjectSchema;
export const Schema$ObjectSchema$0 = (value) => value[0];

export class OneOfSchema extends $CustomType {
  constructor(schemas) {
    super();
    this.schemas = schemas;
  }
}
export const Schema$OneOfSchema = (schemas) => new OneOfSchema(schemas);
export const Schema$isOneOfSchema = (value) => value instanceof OneOfSchema;
export const Schema$OneOfSchema$schemas = (value) => value.schemas;
export const Schema$OneOfSchema$0 = (value) => value.schemas;

export class AllOfSchema extends $CustomType {
  constructor(schemas) {
    super();
    this.schemas = schemas;
  }
}
export const Schema$AllOfSchema = (schemas) => new AllOfSchema(schemas);
export const Schema$isAllOfSchema = (value) => value instanceof AllOfSchema;
export const Schema$AllOfSchema$schemas = (value) => value.schemas;
export const Schema$AllOfSchema$0 = (value) => value.schemas;

export class AnyOfSchema extends $CustomType {
  constructor(schemas) {
    super();
    this.schemas = schemas;
  }
}
export const Schema$AnyOfSchema = (schemas) => new AnyOfSchema(schemas);
export const Schema$isAnyOfSchema = (value) => value instanceof AnyOfSchema;
export const Schema$AnyOfSchema$schemas = (value) => value.schemas;
export const Schema$AnyOfSchema$0 = (value) => value.schemas;

export class NotSchema extends $CustomType {
  constructor(schema) {
    super();
    this.schema = schema;
  }
}
export const Schema$NotSchema = (schema) => new NotSchema(schema);
export const Schema$isNotSchema = (value) => value instanceof NotSchema;
export const Schema$NotSchema$schema = (value) => value.schema;
export const Schema$NotSchema$0 = (value) => value.schema;

export class ConstSchema extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const Schema$ConstSchema = (value) => new ConstSchema(value);
export const Schema$isConstSchema = (value) => value instanceof ConstSchema;
export const Schema$ConstSchema$value = (value) => value.value;
export const Schema$ConstSchema$0 = (value) => value.value;

export class EnumSchema extends $CustomType {
  constructor(values) {
    super();
    this.values = values;
  }
}
export const Schema$EnumSchema = (values) => new EnumSchema(values);
export const Schema$isEnumSchema = (value) => value instanceof EnumSchema;
export const Schema$EnumSchema$values = (value) => value.values;
export const Schema$EnumSchema$0 = (value) => value.values;

export class NumberConstraints extends $CustomType {
  constructor(minimum, maximum, exclusive_minimum, exclusive_maximum, multiple_of) {
    super();
    this.minimum = minimum;
    this.maximum = maximum;
    this.exclusive_minimum = exclusive_minimum;
    this.exclusive_maximum = exclusive_maximum;
    this.multiple_of = multiple_of;
  }
}
export const NumberConstraints$NumberConstraints = (minimum, maximum, exclusive_minimum, exclusive_maximum, multiple_of) =>
  new NumberConstraints(minimum,
  maximum,
  exclusive_minimum,
  exclusive_maximum,
  multiple_of);
export const NumberConstraints$isNumberConstraints = (value) =>
  value instanceof NumberConstraints;
export const NumberConstraints$NumberConstraints$minimum = (value) =>
  value.minimum;
export const NumberConstraints$NumberConstraints$0 = (value) => value.minimum;
export const NumberConstraints$NumberConstraints$maximum = (value) =>
  value.maximum;
export const NumberConstraints$NumberConstraints$1 = (value) => value.maximum;
export const NumberConstraints$NumberConstraints$exclusive_minimum = (value) =>
  value.exclusive_minimum;
export const NumberConstraints$NumberConstraints$2 = (value) =>
  value.exclusive_minimum;
export const NumberConstraints$NumberConstraints$exclusive_maximum = (value) =>
  value.exclusive_maximum;
export const NumberConstraints$NumberConstraints$3 = (value) =>
  value.exclusive_maximum;
export const NumberConstraints$NumberConstraints$multiple_of = (value) =>
  value.multiple_of;
export const NumberConstraints$NumberConstraints$4 = (value) =>
  value.multiple_of;

export class StringConstraints extends $CustomType {
  constructor(min_length, max_length, pattern, format) {
    super();
    this.min_length = min_length;
    this.max_length = max_length;
    this.pattern = pattern;
    this.format = format;
  }
}
export const StringConstraints$StringConstraints = (min_length, max_length, pattern, format) =>
  new StringConstraints(min_length, max_length, pattern, format);
export const StringConstraints$isStringConstraints = (value) =>
  value instanceof StringConstraints;
export const StringConstraints$StringConstraints$min_length = (value) =>
  value.min_length;
export const StringConstraints$StringConstraints$0 = (value) =>
  value.min_length;
export const StringConstraints$StringConstraints$max_length = (value) =>
  value.max_length;
export const StringConstraints$StringConstraints$1 = (value) =>
  value.max_length;
export const StringConstraints$StringConstraints$pattern = (value) =>
  value.pattern;
export const StringConstraints$StringConstraints$2 = (value) => value.pattern;
export const StringConstraints$StringConstraints$format = (value) =>
  value.format;
export const StringConstraints$StringConstraints$3 = (value) => value.format;

export class EmailFormat extends $CustomType {}
export const StringFormat$EmailFormat = () => new EmailFormat();
export const StringFormat$isEmailFormat = (value) =>
  value instanceof EmailFormat;

export class UriFormat extends $CustomType {}
export const StringFormat$UriFormat = () => new UriFormat();
export const StringFormat$isUriFormat = (value) => value instanceof UriFormat;

export class DateFormat extends $CustomType {}
export const StringFormat$DateFormat = () => new DateFormat();
export const StringFormat$isDateFormat = (value) => value instanceof DateFormat;

export class TimeFormat extends $CustomType {}
export const StringFormat$TimeFormat = () => new TimeFormat();
export const StringFormat$isTimeFormat = (value) => value instanceof TimeFormat;

export class DateTimeFormat extends $CustomType {}
export const StringFormat$DateTimeFormat = () => new DateTimeFormat();
export const StringFormat$isDateTimeFormat = (value) =>
  value instanceof DateTimeFormat;

export class UuidFormat extends $CustomType {}
export const StringFormat$UuidFormat = () => new UuidFormat();
export const StringFormat$isUuidFormat = (value) => value instanceof UuidFormat;

export class HostnameFormat extends $CustomType {}
export const StringFormat$HostnameFormat = () => new HostnameFormat();
export const StringFormat$isHostnameFormat = (value) =>
  value instanceof HostnameFormat;

export class Ipv4Format extends $CustomType {}
export const StringFormat$Ipv4Format = () => new Ipv4Format();
export const StringFormat$isIpv4Format = (value) => value instanceof Ipv4Format;

export class Ipv6Format extends $CustomType {}
export const StringFormat$Ipv6Format = () => new Ipv6Format();
export const StringFormat$isIpv6Format = (value) => value instanceof Ipv6Format;

export class ArrayConstraints extends $CustomType {
  constructor(items, min_items, max_items, unique_items) {
    super();
    this.items = items;
    this.min_items = min_items;
    this.max_items = max_items;
    this.unique_items = unique_items;
  }
}
export const ArrayConstraints$ArrayConstraints = (items, min_items, max_items, unique_items) =>
  new ArrayConstraints(items, min_items, max_items, unique_items);
export const ArrayConstraints$isArrayConstraints = (value) =>
  value instanceof ArrayConstraints;
export const ArrayConstraints$ArrayConstraints$items = (value) => value.items;
export const ArrayConstraints$ArrayConstraints$0 = (value) => value.items;
export const ArrayConstraints$ArrayConstraints$min_items = (value) =>
  value.min_items;
export const ArrayConstraints$ArrayConstraints$1 = (value) => value.min_items;
export const ArrayConstraints$ArrayConstraints$max_items = (value) =>
  value.max_items;
export const ArrayConstraints$ArrayConstraints$2 = (value) => value.max_items;
export const ArrayConstraints$ArrayConstraints$unique_items = (value) =>
  value.unique_items;
export const ArrayConstraints$ArrayConstraints$3 = (value) =>
  value.unique_items;

export class ObjectConstraints extends $CustomType {
  constructor(properties, required, additional_properties, pattern_properties, min_properties, max_properties) {
    super();
    this.properties = properties;
    this.required = required;
    this.additional_properties = additional_properties;
    this.pattern_properties = pattern_properties;
    this.min_properties = min_properties;
    this.max_properties = max_properties;
  }
}
export const ObjectConstraints$ObjectConstraints = (properties, required, additional_properties, pattern_properties, min_properties, max_properties) =>
  new ObjectConstraints(properties,
  required,
  additional_properties,
  pattern_properties,
  min_properties,
  max_properties);
export const ObjectConstraints$isObjectConstraints = (value) =>
  value instanceof ObjectConstraints;
export const ObjectConstraints$ObjectConstraints$properties = (value) =>
  value.properties;
export const ObjectConstraints$ObjectConstraints$0 = (value) =>
  value.properties;
export const ObjectConstraints$ObjectConstraints$required = (value) =>
  value.required;
export const ObjectConstraints$ObjectConstraints$1 = (value) => value.required;
export const ObjectConstraints$ObjectConstraints$additional_properties = (value) =>
  value.additional_properties;
export const ObjectConstraints$ObjectConstraints$2 = (value) =>
  value.additional_properties;
export const ObjectConstraints$ObjectConstraints$pattern_properties = (value) =>
  value.pattern_properties;
export const ObjectConstraints$ObjectConstraints$3 = (value) =>
  value.pattern_properties;
export const ObjectConstraints$ObjectConstraints$min_properties = (value) =>
  value.min_properties;
export const ObjectConstraints$ObjectConstraints$4 = (value) =>
  value.min_properties;
export const ObjectConstraints$ObjectConstraints$max_properties = (value) =>
  value.max_properties;
export const ObjectConstraints$ObjectConstraints$5 = (value) =>
  value.max_properties;

export function null$() {
  return new NullSchema();
}

export function bool() {
  return new BoolSchema();
}

export function number() {
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

export function string() {
  return new StringSchema(
    new StringConstraints(new None(), new None(), new None(), new None()),
  );
}

export function array() {
  return new ArraySchema(
    new ArrayConstraints(new None(), new None(), new None(), false),
  );
}

export function object() {
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

export function with_minimum(schema, min) {
  if (schema instanceof NumberSchema) {
    let c = schema[0];
    return new NumberSchema(
      new NumberConstraints(
        new Some(min),
        c.maximum,
        c.exclusive_minimum,
        c.exclusive_maximum,
        c.multiple_of,
      ),
    );
  } else {
    return schema;
  }
}

export function with_maximum(schema, max) {
  if (schema instanceof NumberSchema) {
    let c = schema[0];
    return new NumberSchema(
      new NumberConstraints(
        c.minimum,
        new Some(max),
        c.exclusive_minimum,
        c.exclusive_maximum,
        c.multiple_of,
      ),
    );
  } else {
    return schema;
  }
}

export function with_min_length(schema, min) {
  if (schema instanceof StringSchema) {
    let c = schema[0];
    return new StringSchema(
      new StringConstraints(new Some(min), c.max_length, c.pattern, c.format),
    );
  } else {
    return schema;
  }
}

export function with_max_length(schema, max) {
  if (schema instanceof StringSchema) {
    let c = schema[0];
    return new StringSchema(
      new StringConstraints(c.min_length, new Some(max), c.pattern, c.format),
    );
  } else {
    return schema;
  }
}

export function with_pattern(schema, pattern) {
  if (schema instanceof StringSchema) {
    let c = schema[0];
    return new StringSchema(
      new StringConstraints(
        c.min_length,
        c.max_length,
        new Some(pattern),
        c.format,
      ),
    );
  } else {
    return schema;
  }
}

export function with_items(schema, items) {
  if (schema instanceof ArraySchema) {
    let c = schema[0];
    return new ArraySchema(
      new ArrayConstraints(
        new Some(items),
        c.min_items,
        c.max_items,
        c.unique_items,
      ),
    );
  } else {
    return schema;
  }
}

export function with_min_items(schema, min) {
  if (schema instanceof ArraySchema) {
    let c = schema[0];
    return new ArraySchema(
      new ArrayConstraints(c.items, new Some(min), c.max_items, c.unique_items),
    );
  } else {
    return schema;
  }
}

export function with_max_items(schema, max) {
  if (schema instanceof ArraySchema) {
    let c = schema[0];
    return new ArraySchema(
      new ArrayConstraints(c.items, c.min_items, new Some(max), c.unique_items),
    );
  } else {
    return schema;
  }
}

export function unique_items(schema) {
  if (schema instanceof ArraySchema) {
    let c = schema[0];
    return new ArraySchema(
      new ArrayConstraints(c.items, c.min_items, c.max_items, true),
    );
  } else {
    return schema;
  }
}

export function with_property(schema, name, property) {
  if (schema instanceof ObjectSchema) {
    let c = schema[0];
    let properties = $dict.insert(c.properties, name, property);
    return new ObjectSchema(
      new ObjectConstraints(
        properties,
        c.required,
        c.additional_properties,
        c.pattern_properties,
        c.min_properties,
        c.max_properties,
      ),
    );
  } else {
    return schema;
  }
}

export function with_additional_properties(schema, additional) {
  if (schema instanceof ObjectSchema) {
    let c = schema[0];
    return new ObjectSchema(
      new ObjectConstraints(
        c.properties,
        c.required,
        new Some(additional),
        c.pattern_properties,
        c.min_properties,
        c.max_properties,
      ),
    );
  } else {
    return schema;
  }
}

export function no_additional_properties(schema) {
  if (schema instanceof ObjectSchema) {
    let c = schema[0];
    return new ObjectSchema(
      new ObjectConstraints(
        c.properties,
        c.required,
        new None(),
        c.pattern_properties,
        c.min_properties,
        c.max_properties,
      ),
    );
  } else {
    return schema;
  }
}

export function one_of(schemas) {
  return new OneOfSchema(schemas);
}

export function all_of(schemas) {
  return new AllOfSchema(schemas);
}

export function any_of(schemas) {
  return new AnyOfSchema(schemas);
}

export function not(schema) {
  return new NotSchema(schema);
}

export function const_value(value) {
  return new ConstSchema(value);
}

export function enum_values(values) {
  return new EnumSchema(values);
}

function validate_null(value, path) {
  if (value instanceof JsonNull) {
    return new Ok(undefined);
  } else {
    return new Error(new TypeMismatch(path, "null", $jsonx.type_name(value)));
  }
}

function validate_bool(value, path) {
  if (value instanceof JsonBool) {
    return new Ok(undefined);
  } else {
    return new Error(new TypeMismatch(path, "boolean", $jsonx.type_name(value)));
  }
}

function validate_number(value, constraints, path) {
  if (value instanceof JsonNumber) {
    let n = value[0];
    let _block;
    let $ = constraints.minimum;
    if ($ instanceof Some) {
      let min = $[0];
      if (n < min) {
        _block = new Error(
          new InvalidValue(
            path,
            (("Value " + $string.inspect(n)) + " is less than minimum ") + $string.inspect(
              min,
            ),
          ),
        );
      } else {
        _block = new Ok(undefined);
      }
    } else {
      _block = new Ok(undefined);
    }
    let min_check = _block;
    if (min_check instanceof Ok) {
      let _block$1;
      let $1 = constraints.maximum;
      if ($1 instanceof Some) {
        let max = $1[0];
        if (n > max) {
          _block$1 = new Error(
            new InvalidValue(
              path,
              (("Value " + $string.inspect(n)) + " is greater than maximum ") + $string.inspect(
                max,
              ),
            ),
          );
        } else {
          _block$1 = new Ok(undefined);
        }
      } else {
        _block$1 = new Ok(undefined);
      }
      let max_check = _block$1;
      if (max_check instanceof Ok) {
        let _block$2;
        let $2 = constraints.exclusive_minimum;
        if ($2 instanceof Some) {
          let min = $2[0];
          if (n <= min) {
            _block$2 = new Error(
              new InvalidValue(
                path,
                (("Value " + $string.inspect(n)) + " is not greater than exclusive minimum ") + $string.inspect(
                  min,
                ),
              ),
            );
          } else {
            _block$2 = new Ok(undefined);
          }
        } else {
          _block$2 = new Ok(undefined);
        }
        let exclusive_min_check = _block$2;
        if (exclusive_min_check instanceof Ok) {
          let _block$3;
          let $3 = constraints.exclusive_maximum;
          if ($3 instanceof Some) {
            let max = $3[0];
            if (n >= max) {
              _block$3 = new Error(
                new InvalidValue(
                  path,
                  (("Value " + $string.inspect(n)) + " is not less than exclusive maximum ") + $string.inspect(
                    max,
                  ),
                ),
              );
            } else {
              _block$3 = new Ok(undefined);
            }
          } else {
            _block$3 = new Ok(undefined);
          }
          let exclusive_max_check = _block$3;
          if (exclusive_max_check instanceof Ok) {
            let $4 = constraints.multiple_of;
            if ($4 instanceof Some) {
              let divisor = $4[0];
              let quotient = divideFloat(n, divisor);
              let remainder = n - (divisor * $float.floor(quotient));
              let r = remainder;
              if (r === 0.0) {
                return new Ok(undefined);
              } else {
                return new Error(
                  new InvalidValue(
                    path,
                    (("Value " + $string.inspect(n)) + " is not a multiple of ") + $string.inspect(
                      divisor,
                    ),
                  ),
                );
              }
            } else {
              return new Ok(undefined);
            }
          } else {
            return exclusive_max_check;
          }
        } else {
          return exclusive_min_check;
        }
      } else {
        return max_check;
      }
    } else {
      return min_check;
    }
  } else {
    return new Error(new TypeMismatch(path, "number", $jsonx.type_name(value)));
  }
}

function validate_format(value, format, path) {
  if (format instanceof EmailFormat) {
    let $ = $string.contains(value, "@");
    if ($) {
      return new Ok(undefined);
    } else {
      return new Error(new InvalidValue(path, "Invalid email format"));
    }
  } else if (format instanceof UriFormat) {
    let $ = $string.starts_with(value, "http://") || $string.starts_with(
      value,
      "https://",
    );
    if ($) {
      return new Ok(undefined);
    } else {
      return new Error(new InvalidValue(path, "Invalid URI format"));
    }
  } else if (format instanceof DateFormat) {
    let parts = $string.split(value, "-");
    let $ = $list.length(parts);
    if ($ === 3) {
      return new Ok(undefined);
    } else {
      return new Error(
        new InvalidValue(path, "Invalid date format (expected YYYY-MM-DD)"),
      );
    }
  } else if (format instanceof TimeFormat) {
    let $ = $string.contains(value, ":");
    if ($) {
      return new Ok(undefined);
    } else {
      return new Error(new InvalidValue(path, "Invalid time format"));
    }
  } else if (format instanceof DateTimeFormat) {
    let $ = $string.contains(value, "T") && $string.contains(value, ":");
    if ($) {
      return new Ok(undefined);
    } else {
      return new Error(new InvalidValue(path, "Invalid datetime format"));
    }
  } else if (format instanceof UuidFormat) {
    let $ = ($string.length(value) === 36) && $string.contains(value, "-");
    if ($) {
      return new Ok(undefined);
    } else {
      return new Error(new InvalidValue(path, "Invalid UUID format"));
    }
  } else if (format instanceof HostnameFormat) {
    return new Ok(undefined);
  } else if (format instanceof Ipv4Format) {
    let parts = $string.split(value, ".");
    let $ = $list.length(parts);
    if ($ === 4) {
      return new Ok(undefined);
    } else {
      return new Error(new InvalidValue(path, "Invalid IPv4 format"));
    }
  } else {
    let $ = $string.contains(value, ":");
    if ($) {
      return new Ok(undefined);
    } else {
      return new Error(new InvalidValue(path, "Invalid IPv6 format"));
    }
  }
}

function validate_string(value, constraints, path) {
  if (value instanceof JsonString) {
    let s = value[0];
    let len = $string.length(s);
    let _block;
    let $ = constraints.min_length;
    if ($ instanceof Some) {
      let min = $[0];
      if (len < min) {
        _block = new Error(
          new InvalidValue(
            path,
            (("String length " + $string.inspect(len)) + " is less than minimum ") + $string.inspect(
              min,
            ),
          ),
        );
      } else {
        _block = new Ok(undefined);
      }
    } else {
      _block = new Ok(undefined);
    }
    let min_check = _block;
    if (min_check instanceof Ok) {
      let _block$1;
      let $1 = constraints.max_length;
      if ($1 instanceof Some) {
        let max = $1[0];
        if (len > max) {
          _block$1 = new Error(
            new InvalidValue(
              path,
              (("String length " + $string.inspect(len)) + " is greater than maximum ") + $string.inspect(
                max,
              ),
            ),
          );
        } else {
          _block$1 = new Ok(undefined);
        }
      } else {
        _block$1 = new Ok(undefined);
      }
      let max_check = _block$1;
      if (max_check instanceof Ok) {
        let _block$2;
        let $2 = constraints.pattern;
        if ($2 instanceof Some) {
          _block$2 = new Ok(undefined);
        } else {
          _block$2 = new Ok(undefined);
        }
        let pattern_check = _block$2;
        if (pattern_check instanceof Ok) {
          let $3 = constraints.format;
          if ($3 instanceof Some) {
            let format = $3[0];
            return validate_format(s, format, path);
          } else {
            return new Ok(undefined);
          }
        } else {
          return pattern_check;
        }
      } else {
        return max_check;
      }
    } else {
      return min_check;
    }
  } else {
    return new Error(new TypeMismatch(path, "string", $jsonx.type_name(value)));
  }
}

function validate_required(loop$obj, loop$required, loop$path) {
  while (true) {
    let obj = loop$obj;
    let required = loop$required;
    let path = loop$path;
    if (required instanceof $Empty) {
      return new Ok(undefined);
    } else {
      let field = required.head;
      let rest = required.tail;
      let $ = $dict.has_key(obj, field);
      if ($) {
        loop$obj = obj;
        loop$required = rest;
        loop$path = path;
      } else {
        return new Error(new MissingField(path, field));
      }
    }
  }
}

export function error_to_string(error) {
  if (error instanceof TypeMismatch) {
    let path = error.path;
    let expected = error.expected;
    let found = error.found;
    return (((("Type mismatch at " + path) + ": expected ") + expected) + ", found ") + found;
  } else if (error instanceof MissingField) {
    let path = error.path;
    let field = error.field;
    return (("Missing required field at " + path) + ": ") + field;
  } else if (error instanceof ExtraField) {
    let path = error.path;
    let field = error.field;
    return (("Extra field at " + path) + ": ") + field;
  } else if (error instanceof InvalidValue) {
    let path = error.path;
    let message = error.message;
    return (("Invalid value at " + path) + ": ") + message;
  } else if (error instanceof ArrayItemError) {
    let path = error.path;
    let index = error.index;
    let error$1 = error.error;
    return (((("Array item error at " + path) + "[") + $string.inspect(index)) + "]: ") + error_to_string(
      error$1,
    );
  } else {
    let path = error.path;
    let message = error.message;
    return (("Error at " + path) + ": ") + message;
  }
}

function unique_strings_acc(loop$list, loop$acc) {
  while (true) {
    let list = loop$list;
    let acc = loop$acc;
    if (list instanceof $Empty) {
      return $list.reverse(acc);
    } else {
      let first = list.head;
      let rest = list.tail;
      let $ = $list.contains(acc, first);
      if ($) {
        loop$list = rest;
        loop$acc = acc;
      } else {
        loop$list = rest;
        loop$acc = listPrepend(first, acc);
      }
    }
  }
}

function unique_strings(list) {
  return unique_strings_acc(list, toList([]));
}

export function with_required(schema, fields) {
  if (schema instanceof ObjectSchema) {
    let c = schema[0];
    let required = unique_strings($list.append(c.required, fields));
    return new ObjectSchema(
      new ObjectConstraints(
        c.properties,
        required,
        c.additional_properties,
        c.pattern_properties,
        c.min_properties,
        c.max_properties,
      ),
    );
  } else {
    return schema;
  }
}

function validate_array_items(loop$items, loop$schema, loop$path, loop$index) {
  while (true) {
    let items = loop$items;
    let schema = loop$schema;
    let path = loop$path;
    let index = loop$index;
    if (items instanceof $Empty) {
      return new Ok(undefined);
    } else {
      let first = items.head;
      let rest = items.tail;
      let item_path = ((path + "[") + $string.inspect(index)) + "]";
      let $ = validate_at(schema, first, item_path);
      if ($ instanceof Ok) {
        loop$items = rest;
        loop$schema = schema;
        loop$path = path;
        loop$index = index + 1;
      } else {
        let e = $[0];
        return new Error(new ArrayItemError(path, index, e));
      }
    }
  }
}

function validate_at(schema, value, path) {
  if (schema instanceof NullSchema) {
    return validate_null(value, path);
  } else if (schema instanceof BoolSchema) {
    return validate_bool(value, path);
  } else if (schema instanceof NumberSchema) {
    let constraints = schema[0];
    return validate_number(value, constraints, path);
  } else if (schema instanceof StringSchema) {
    let constraints = schema[0];
    return validate_string(value, constraints, path);
  } else if (schema instanceof ArraySchema) {
    let constraints = schema[0];
    return validate_array(value, constraints, path);
  } else if (schema instanceof ObjectSchema) {
    let constraints = schema[0];
    return validate_object(value, constraints, path);
  } else if (schema instanceof OneOfSchema) {
    let schemas = schema.schemas;
    return validate_one_of(schemas, value, path);
  } else if (schema instanceof AllOfSchema) {
    let schemas = schema.schemas;
    return validate_all_of(schemas, value, path);
  } else if (schema instanceof AnyOfSchema) {
    let schemas = schema.schemas;
    return validate_any_of(schemas, value, path);
  } else if (schema instanceof NotSchema) {
    let inner = schema.schema;
    return validate_not(inner, value, path);
  } else if (schema instanceof ConstSchema) {
    let expected = schema.value;
    return validate_const(expected, value, path);
  } else {
    let values = schema.values;
    return validate_enum(values, value, path);
  }
}

function validate_array(value, constraints, path) {
  if (value instanceof JsonArray) {
    let items = value[0];
    let len = $list.length(items);
    let _block;
    let $ = constraints.min_items;
    if ($ instanceof Some) {
      let min = $[0];
      if (len < min) {
        _block = new Error(
          new InvalidValue(
            path,
            (("Array length " + $string.inspect(len)) + " is less than minimum ") + $string.inspect(
              min,
            ),
          ),
        );
      } else {
        _block = new Ok(undefined);
      }
    } else {
      _block = new Ok(undefined);
    }
    let min_check = _block;
    if (min_check instanceof Ok) {
      let _block$1;
      let $1 = constraints.max_items;
      if ($1 instanceof Some) {
        let max = $1[0];
        if (len > max) {
          _block$1 = new Error(
            new InvalidValue(
              path,
              (("Array length " + $string.inspect(len)) + " is greater than maximum ") + $string.inspect(
                max,
              ),
            ),
          );
        } else {
          _block$1 = new Ok(undefined);
        }
      } else {
        _block$1 = new Ok(undefined);
      }
      let max_check = _block$1;
      if (max_check instanceof Ok) {
        let _block$2;
        let $2 = constraints.unique_items;
        if ($2) {
          _block$2 = validate_unique_items(items, path);
        } else {
          _block$2 = new Ok(undefined);
        }
        let unique_check = _block$2;
        if (unique_check instanceof Ok) {
          let $3 = constraints.items;
          if ($3 instanceof Some) {
            let item_schema = $3[0];
            return validate_array_items(items, item_schema, path, 0);
          } else {
            return new Ok(undefined);
          }
        } else {
          return unique_check;
        }
      } else {
        return max_check;
      }
    } else {
      return min_check;
    }
  } else {
    return new Error(new TypeMismatch(path, "array", $jsonx.type_name(value)));
  }
}

export function validate(schema, value) {
  return validate_at(schema, value, "$");
}

function validate_property_list(loop$obj, loop$properties, loop$path) {
  while (true) {
    let obj = loop$obj;
    let properties = loop$properties;
    let path = loop$path;
    if (properties instanceof $Empty) {
      return new Ok(undefined);
    } else {
      let rest = properties.tail;
      let name = properties.head[0];
      let schema = properties.head[1];
      let $ = $dict.get(obj, name);
      if ($ instanceof Ok) {
        let value = $[0];
        let prop_path = (path + ".") + name;
        let $1 = validate_at(schema, value, prop_path);
        if ($1 instanceof Ok) {
          loop$obj = obj;
          loop$properties = rest;
          loop$path = path;
        } else {
          return $1;
        }
      } else {
        loop$obj = obj;
        loop$properties = rest;
        loop$path = path;
      }
    }
  }
}

function validate_properties(obj, properties, path) {
  let prop_list = $dict.to_list(properties);
  return validate_property_list(obj, prop_list, path);
}

function validate_additional_keys(
  loop$obj,
  loop$keys,
  loop$properties,
  loop$additional_schema,
  loop$path
) {
  while (true) {
    let obj = loop$obj;
    let keys = loop$keys;
    let properties = loop$properties;
    let additional_schema = loop$additional_schema;
    let path = loop$path;
    if (keys instanceof $Empty) {
      return new Ok(undefined);
    } else {
      let key = keys.head;
      let rest = keys.tail;
      let $ = $dict.has_key(properties, key);
      if ($) {
        loop$obj = obj;
        loop$keys = rest;
        loop$properties = properties;
        loop$additional_schema = additional_schema;
        loop$path = path;
      } else {
        let $1 = $dict.get(obj, key);
        if ($1 instanceof Ok) {
          let value = $1[0];
          let prop_path = (path + ".") + key;
          let $2 = validate_at(additional_schema, value, prop_path);
          if ($2 instanceof Ok) {
            loop$obj = obj;
            loop$keys = rest;
            loop$properties = properties;
            loop$additional_schema = additional_schema;
            loop$path = path;
          } else {
            return $2;
          }
        } else {
          loop$obj = obj;
          loop$keys = rest;
          loop$properties = properties;
          loop$additional_schema = additional_schema;
          loop$path = path;
        }
      }
    }
  }
}

function validate_additional_properties(
  obj,
  properties,
  additional_schema,
  path
) {
  let keys = $dict.keys(obj);
  return validate_additional_keys(
    obj,
    keys,
    properties,
    additional_schema,
    path,
  );
}

function validate_object(value, constraints, path) {
  if (value instanceof JsonObject) {
    let obj = value[0];
    let keys = $dict.keys(obj);
    let len = $list.length(keys);
    let _block;
    let $ = constraints.min_properties;
    if ($ instanceof Some) {
      let min = $[0];
      if (len < min) {
        _block = new Error(
          new InvalidValue(
            path,
            (("Object has " + $string.inspect(len)) + " properties, minimum is ") + $string.inspect(
              min,
            ),
          ),
        );
      } else {
        _block = new Ok(undefined);
      }
    } else {
      _block = new Ok(undefined);
    }
    let min_check = _block;
    if (min_check instanceof Ok) {
      let _block$1;
      let $1 = constraints.max_properties;
      if ($1 instanceof Some) {
        let max = $1[0];
        if (len > max) {
          _block$1 = new Error(
            new InvalidValue(
              path,
              (("Object has " + $string.inspect(len)) + " properties, maximum is ") + $string.inspect(
                max,
              ),
            ),
          );
        } else {
          _block$1 = new Ok(undefined);
        }
      } else {
        _block$1 = new Ok(undefined);
      }
      let max_check = _block$1;
      if (max_check instanceof Ok) {
        let required_check = validate_required(obj, constraints.required, path);
        if (required_check instanceof Ok) {
          let properties_check = validate_properties(
            obj,
            constraints.properties,
            path,
          );
          if (properties_check instanceof Ok) {
            let $2 = constraints.additional_properties;
            if ($2 instanceof Some) {
              let additional_schema = $2[0];
              return validate_additional_properties(
                obj,
                constraints.properties,
                additional_schema,
                path,
              );
            } else {
              return new Ok(undefined);
            }
          } else {
            return properties_check;
          }
        } else {
          return required_check;
        }
      } else {
        return max_check;
      }
    } else {
      return min_check;
    }
  } else {
    return new Error(new TypeMismatch(path, "object", $jsonx.type_name(value)));
  }
}

function validate_one_of(schemas, value, path) {
  let results = $list.map(
    schemas,
    (schema) => { return validate_at(schema, value, path); },
  );
  let successes = $list.filter(results, (r) => { return $result.is_ok(r); });
  let $ = $list.length(successes);
  if ($ === 1) {
    return new Ok(undefined);
  } else if ($ === 0) {
    return new Error(
      new InvalidValue(path, "Value does not match any of the oneOf schemas"),
    );
  } else {
    return new Error(
      new InvalidValue(path, "Value matches more than one oneOf schema"),
    );
  }
}

function validate_all_of(loop$schemas, loop$value, loop$path) {
  while (true) {
    let schemas = loop$schemas;
    let value = loop$value;
    let path = loop$path;
    if (schemas instanceof $Empty) {
      return new Ok(undefined);
    } else {
      let schema = schemas.head;
      let rest = schemas.tail;
      let $ = validate_at(schema, value, path);
      if ($ instanceof Ok) {
        loop$schemas = rest;
        loop$value = value;
        loop$path = path;
      } else {
        return $;
      }
    }
  }
}

function validate_any_of(schemas, value, path) {
  let results = $list.map(
    schemas,
    (schema) => { return validate_at(schema, value, path); },
  );
  let successes = $list.filter(results, (r) => { return $result.is_ok(r); });
  let $ = !isEqual(successes, toList([]));
  if ($) {
    return new Ok(undefined);
  } else {
    return new Error(
      new InvalidValue(path, "Value does not match any of the anyOf schemas"),
    );
  }
}

function validate_not(schema, value, path) {
  let $ = validate_at(schema, value, path);
  if ($ instanceof Ok) {
    return new Error(
      new InvalidValue(path, "Value should not match the schema"),
    );
  } else {
    return new Ok(undefined);
  }
}

function list_equal(a, b) {
  if (a instanceof $Empty) {
    if (b instanceof $Empty) {
      return true;
    } else {
      return false;
    }
  } else if (b instanceof $Empty) {
    return false;
  } else {
    let x = a.head;
    let xs = a.tail;
    let y = b.head;
    let ys = b.tail;
    return json_equal(x, y) && list_equal(xs, ys);
  }
}

function json_equal(a, b) {
  if (a instanceof JsonNull) {
    if (b instanceof JsonNull) {
      return true;
    } else {
      return false;
    }
  } else if (a instanceof JsonBool) {
    if (b instanceof JsonBool) {
      let x = a[0];
      let y = b[0];
      return x === y;
    } else {
      return false;
    }
  } else if (a instanceof JsonNumber) {
    if (b instanceof JsonNumber) {
      let x = a[0];
      let y = b[0];
      return x === y;
    } else {
      return false;
    }
  } else if (a instanceof JsonString) {
    if (b instanceof JsonString) {
      let x = a[0];
      let y = b[0];
      return x === y;
    } else {
      return false;
    }
  } else if (a instanceof JsonArray) {
    if (b instanceof JsonArray) {
      let x = a[0];
      let y = b[0];
      return list_equal(x, y);
    } else {
      return false;
    }
  } else if (b instanceof JsonObject) {
    let x = a[0];
    let y = b[0];
    return dict_equal(x, y);
  } else {
    return false;
  }
}

function list_has(loop$list, loop$value) {
  while (true) {
    let list = loop$list;
    let value = loop$value;
    if (list instanceof $Empty) {
      return false;
    } else {
      let first = list.head;
      let rest = list.tail;
      let $ = json_equal(first, value);
      if ($) {
        return $;
      } else {
        loop$list = rest;
        loop$value = value;
      }
    }
  }
}

function validate_unique_items(loop$items, loop$path) {
  while (true) {
    let items = loop$items;
    let path = loop$path;
    if (items instanceof $Empty) {
      return new Ok(undefined);
    } else {
      let first = items.head;
      let rest = items.tail;
      let $ = list_has(rest, first);
      if ($) {
        return new Error(
          new InvalidValue(path, "Array contains duplicate items"),
        );
      } else {
        loop$items = rest;
        loop$path = path;
      }
    }
  }
}

function dict_equal(a, b) {
  let a_keys = $dict.keys(a);
  let b_keys = $dict.keys(b);
  let $ = $list.length(a_keys) === $list.length(b_keys);
  if ($) {
    let all_match = $list.all(
      a_keys,
      (key) => {
        let $1 = $dict.get(a, key);
        let $2 = $dict.get(b, key);
        if ($1 instanceof Ok && $2 instanceof Ok) {
          let x = $1[0];
          let y = $2[0];
          return json_equal(x, y);
        } else {
          return false;
        }
      },
    );
    return all_match;
  } else {
    return $;
  }
}

function validate_const(expected, value, path) {
  let $ = json_equal(expected, value);
  if ($) {
    return new Ok(undefined);
  } else {
    return new Error(new InvalidValue(path, "Value does not match const"));
  }
}

function validate_enum(values, value, path) {
  let $ = list_has(values, value);
  if ($) {
    return new Ok(undefined);
  } else {
    return new Error(
      new InvalidValue(path, "Value is not one of the enum values"),
    );
  }
}
