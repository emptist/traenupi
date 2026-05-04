import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";
import type * as $jsonx from "../traenupi_core/jsonx.d.mts";

export class TypeMismatch extends _.CustomType {
  /** @deprecated */
  constructor(path: string, expected: string, found: string);
  /** @deprecated */
  path: string;
  /** @deprecated */
  expected: string;
  /** @deprecated */
  found: string;
}
export function SchemaError$TypeMismatch(
  path: string,
  expected: string,
  found: string,
): SchemaError$;
export function SchemaError$isTypeMismatch(value: SchemaError$): boolean;
export function SchemaError$TypeMismatch$0(value: SchemaError$): string;
export function SchemaError$TypeMismatch$path(value: SchemaError$): string;
export function SchemaError$TypeMismatch$1(value: SchemaError$): string;
export function SchemaError$TypeMismatch$expected(value: SchemaError$): string;
export function SchemaError$TypeMismatch$2(value: SchemaError$): string;
export function SchemaError$TypeMismatch$found(value: SchemaError$): string;

export class MissingField extends _.CustomType {
  /** @deprecated */
  constructor(path: string, field: string);
  /** @deprecated */
  path: string;
  /** @deprecated */
  field: string;
}
export function SchemaError$MissingField(
  path: string,
  field: string,
): SchemaError$;
export function SchemaError$isMissingField(value: SchemaError$): boolean;
export function SchemaError$MissingField$0(value: SchemaError$): string;
export function SchemaError$MissingField$path(value: SchemaError$): string;
export function SchemaError$MissingField$1(value: SchemaError$): string;
export function SchemaError$MissingField$field(value: SchemaError$): string;

export class ExtraField extends _.CustomType {
  /** @deprecated */
  constructor(path: string, field: string);
  /** @deprecated */
  path: string;
  /** @deprecated */
  field: string;
}
export function SchemaError$ExtraField(
  path: string,
  field: string,
): SchemaError$;
export function SchemaError$isExtraField(value: SchemaError$): boolean;
export function SchemaError$ExtraField$0(value: SchemaError$): string;
export function SchemaError$ExtraField$path(value: SchemaError$): string;
export function SchemaError$ExtraField$1(value: SchemaError$): string;
export function SchemaError$ExtraField$field(value: SchemaError$): string;

export class InvalidValue extends _.CustomType {
  /** @deprecated */
  constructor(path: string, message: string);
  /** @deprecated */
  path: string;
  /** @deprecated */
  message: string;
}
export function SchemaError$InvalidValue(
  path: string,
  message: string,
): SchemaError$;
export function SchemaError$isInvalidValue(value: SchemaError$): boolean;
export function SchemaError$InvalidValue$0(value: SchemaError$): string;
export function SchemaError$InvalidValue$path(value: SchemaError$): string;
export function SchemaError$InvalidValue$1(value: SchemaError$): string;
export function SchemaError$InvalidValue$message(value: SchemaError$): string;

export class ArrayItemError extends _.CustomType {
  /** @deprecated */
  constructor(path: string, index: number, error: SchemaError$);
  /** @deprecated */
  path: string;
  /** @deprecated */
  index: number;
  /** @deprecated */
  error: SchemaError$;
}
export function SchemaError$ArrayItemError(
  path: string,
  index: number,
  error: SchemaError$,
): SchemaError$;
export function SchemaError$isArrayItemError(value: SchemaError$): boolean;
export function SchemaError$ArrayItemError$0(value: SchemaError$): string;
export function SchemaError$ArrayItemError$path(value: SchemaError$): string;
export function SchemaError$ArrayItemError$1(value: SchemaError$): number;
export function SchemaError$ArrayItemError$index(value: SchemaError$): number;
export function SchemaError$ArrayItemError$2(value: SchemaError$): SchemaError$;
export function SchemaError$ArrayItemError$error(value: SchemaError$): SchemaError$;

export class CustomError extends _.CustomType {
  /** @deprecated */
  constructor(path: string, message: string);
  /** @deprecated */
  path: string;
  /** @deprecated */
  message: string;
}
export function SchemaError$CustomError(
  path: string,
  message: string,
): SchemaError$;
export function SchemaError$isCustomError(value: SchemaError$): boolean;
export function SchemaError$CustomError$0(value: SchemaError$): string;
export function SchemaError$CustomError$path(value: SchemaError$): string;
export function SchemaError$CustomError$1(value: SchemaError$): string;
export function SchemaError$CustomError$message(value: SchemaError$): string;

export type SchemaError$ = TypeMismatch | MissingField | ExtraField | InvalidValue | ArrayItemError | CustomError;

export function SchemaError$path(value: SchemaError$): string;

export class NullSchema extends _.CustomType {}
export function Schema$NullSchema(): Schema$;
export function Schema$isNullSchema(value: Schema$): boolean;

export class BoolSchema extends _.CustomType {}
export function Schema$BoolSchema(): Schema$;
export function Schema$isBoolSchema(value: Schema$): boolean;

export class NumberSchema extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: NumberConstraints$);
  /** @deprecated */
  0: NumberConstraints$;
}
export function Schema$NumberSchema($0: NumberConstraints$): Schema$;
export function Schema$isNumberSchema(value: Schema$): boolean;
export function Schema$NumberSchema$0(value: Schema$): NumberConstraints$;

export class StringSchema extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: StringConstraints$);
  /** @deprecated */
  0: StringConstraints$;
}
export function Schema$StringSchema($0: StringConstraints$): Schema$;
export function Schema$isStringSchema(value: Schema$): boolean;
export function Schema$StringSchema$0(value: Schema$): StringConstraints$;

export class ArraySchema extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: ArrayConstraints$);
  /** @deprecated */
  0: ArrayConstraints$;
}
export function Schema$ArraySchema($0: ArrayConstraints$): Schema$;
export function Schema$isArraySchema(value: Schema$): boolean;
export function Schema$ArraySchema$0(value: Schema$): ArrayConstraints$;

export class ObjectSchema extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: ObjectConstraints$);
  /** @deprecated */
  0: ObjectConstraints$;
}
export function Schema$ObjectSchema($0: ObjectConstraints$): Schema$;
export function Schema$isObjectSchema(value: Schema$): boolean;
export function Schema$ObjectSchema$0(value: Schema$): ObjectConstraints$;

export class OneOfSchema extends _.CustomType {
  /** @deprecated */
  constructor(schemas: _.List<Schema$>);
  /** @deprecated */
  schemas: _.List<Schema$>;
}
export function Schema$OneOfSchema(schemas: _.List<Schema$>): Schema$;
export function Schema$isOneOfSchema(value: Schema$): boolean;
export function Schema$OneOfSchema$0(value: Schema$): _.List<Schema$>;
export function Schema$OneOfSchema$schemas(value: Schema$): _.List<Schema$>;

export class AllOfSchema extends _.CustomType {
  /** @deprecated */
  constructor(schemas: _.List<Schema$>);
  /** @deprecated */
  schemas: _.List<Schema$>;
}
export function Schema$AllOfSchema(schemas: _.List<Schema$>): Schema$;
export function Schema$isAllOfSchema(value: Schema$): boolean;
export function Schema$AllOfSchema$0(value: Schema$): _.List<Schema$>;
export function Schema$AllOfSchema$schemas(value: Schema$): _.List<Schema$>;

export class AnyOfSchema extends _.CustomType {
  /** @deprecated */
  constructor(schemas: _.List<Schema$>);
  /** @deprecated */
  schemas: _.List<Schema$>;
}
export function Schema$AnyOfSchema(schemas: _.List<Schema$>): Schema$;
export function Schema$isAnyOfSchema(value: Schema$): boolean;
export function Schema$AnyOfSchema$0(value: Schema$): _.List<Schema$>;
export function Schema$AnyOfSchema$schemas(value: Schema$): _.List<Schema$>;

export class NotSchema extends _.CustomType {
  /** @deprecated */
  constructor(schema: Schema$);
  /** @deprecated */
  schema: Schema$;
}
export function Schema$NotSchema(schema: Schema$): Schema$;
export function Schema$isNotSchema(value: Schema$): boolean;
export function Schema$NotSchema$0(value: Schema$): Schema$;
export function Schema$NotSchema$schema(value: Schema$): Schema$;

export class ConstSchema extends _.CustomType {
  /** @deprecated */
  constructor(value: $jsonx.JsonValue$);
  /** @deprecated */
  value: $jsonx.JsonValue$;
}
export function Schema$ConstSchema(value: $jsonx.JsonValue$): Schema$;
export function Schema$isConstSchema(value: Schema$): boolean;
export function Schema$ConstSchema$0(value: Schema$): $jsonx.JsonValue$;
export function Schema$ConstSchema$value(value: Schema$): $jsonx.JsonValue$;

export class EnumSchema extends _.CustomType {
  /** @deprecated */
  constructor(values: _.List<$jsonx.JsonValue$>);
  /** @deprecated */
  values: _.List<$jsonx.JsonValue$>;
}
export function Schema$EnumSchema(values: _.List<$jsonx.JsonValue$>): Schema$;
export function Schema$isEnumSchema(value: Schema$): boolean;
export function Schema$EnumSchema$0(value: Schema$): _.List<$jsonx.JsonValue$>;
export function Schema$EnumSchema$values(value: Schema$): _.List<
  $jsonx.JsonValue$
>;

export type Schema$ = NullSchema | BoolSchema | NumberSchema | StringSchema | ArraySchema | ObjectSchema | OneOfSchema | AllOfSchema | AnyOfSchema | NotSchema | ConstSchema | EnumSchema;

export class NumberConstraints extends _.CustomType {
  /** @deprecated */
  constructor(
    minimum: $option.Option$<number>,
    maximum: $option.Option$<number>,
    exclusive_minimum: $option.Option$<number>,
    exclusive_maximum: $option.Option$<number>,
    multiple_of: $option.Option$<number>
  );
  /** @deprecated */
  minimum: $option.Option$<number>;
  /** @deprecated */
  maximum: $option.Option$<number>;
  /** @deprecated */
  exclusive_minimum: $option.Option$<number>;
  /** @deprecated */
  exclusive_maximum: $option.Option$<number>;
  /** @deprecated */
  multiple_of: $option.Option$<number>;
}
export function NumberConstraints$NumberConstraints(
  minimum: $option.Option$<number>,
  maximum: $option.Option$<number>,
  exclusive_minimum: $option.Option$<number>,
  exclusive_maximum: $option.Option$<number>,
  multiple_of: $option.Option$<number>,
): NumberConstraints$;
export function NumberConstraints$isNumberConstraints(
  value: NumberConstraints$,
): boolean;
export function NumberConstraints$NumberConstraints$0(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$minimum(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$1(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$maximum(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$2(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$exclusive_minimum(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$3(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$exclusive_maximum(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$4(value: NumberConstraints$): $option.Option$<
  number
>;
export function NumberConstraints$NumberConstraints$multiple_of(value: NumberConstraints$): $option.Option$<
  number
>;

export type NumberConstraints$ = NumberConstraints;

export class StringConstraints extends _.CustomType {
  /** @deprecated */
  constructor(
    min_length: $option.Option$<number>,
    max_length: $option.Option$<number>,
    pattern: $option.Option$<string>,
    format: $option.Option$<StringFormat$>
  );
  /** @deprecated */
  min_length: $option.Option$<number>;
  /** @deprecated */
  max_length: $option.Option$<number>;
  /** @deprecated */
  pattern: $option.Option$<string>;
  /** @deprecated */
  format: $option.Option$<StringFormat$>;
}
export function StringConstraints$StringConstraints(
  min_length: $option.Option$<number>,
  max_length: $option.Option$<number>,
  pattern: $option.Option$<string>,
  format: $option.Option$<StringFormat$>,
): StringConstraints$;
export function StringConstraints$isStringConstraints(
  value: StringConstraints$,
): boolean;
export function StringConstraints$StringConstraints$0(value: StringConstraints$): $option.Option$<
  number
>;
export function StringConstraints$StringConstraints$min_length(value: StringConstraints$): $option.Option$<
  number
>;
export function StringConstraints$StringConstraints$1(value: StringConstraints$): $option.Option$<
  number
>;
export function StringConstraints$StringConstraints$max_length(value: StringConstraints$): $option.Option$<
  number
>;
export function StringConstraints$StringConstraints$2(value: StringConstraints$): $option.Option$<
  string
>;
export function StringConstraints$StringConstraints$pattern(value: StringConstraints$): $option.Option$<
  string
>;
export function StringConstraints$StringConstraints$3(value: StringConstraints$): $option.Option$<
  StringFormat$
>;
export function StringConstraints$StringConstraints$format(value: StringConstraints$): $option.Option$<
  StringFormat$
>;

export type StringConstraints$ = StringConstraints;

export class EmailFormat extends _.CustomType {}
export function StringFormat$EmailFormat(): StringFormat$;
export function StringFormat$isEmailFormat(value: StringFormat$): boolean;

export class UriFormat extends _.CustomType {}
export function StringFormat$UriFormat(): StringFormat$;
export function StringFormat$isUriFormat(value: StringFormat$): boolean;

export class DateFormat extends _.CustomType {}
export function StringFormat$DateFormat(): StringFormat$;
export function StringFormat$isDateFormat(value: StringFormat$): boolean;

export class TimeFormat extends _.CustomType {}
export function StringFormat$TimeFormat(): StringFormat$;
export function StringFormat$isTimeFormat(value: StringFormat$): boolean;

export class DateTimeFormat extends _.CustomType {}
export function StringFormat$DateTimeFormat(): StringFormat$;
export function StringFormat$isDateTimeFormat(value: StringFormat$): boolean;

export class UuidFormat extends _.CustomType {}
export function StringFormat$UuidFormat(): StringFormat$;
export function StringFormat$isUuidFormat(value: StringFormat$): boolean;

export class HostnameFormat extends _.CustomType {}
export function StringFormat$HostnameFormat(): StringFormat$;
export function StringFormat$isHostnameFormat(value: StringFormat$): boolean;

export class Ipv4Format extends _.CustomType {}
export function StringFormat$Ipv4Format(): StringFormat$;
export function StringFormat$isIpv4Format(value: StringFormat$): boolean;

export class Ipv6Format extends _.CustomType {}
export function StringFormat$Ipv6Format(): StringFormat$;
export function StringFormat$isIpv6Format(value: StringFormat$): boolean;

export type StringFormat$ = EmailFormat | UriFormat | DateFormat | TimeFormat | DateTimeFormat | UuidFormat | HostnameFormat | Ipv4Format | Ipv6Format;

export class ArrayConstraints extends _.CustomType {
  /** @deprecated */
  constructor(
    items: $option.Option$<Schema$>,
    min_items: $option.Option$<number>,
    max_items: $option.Option$<number>,
    unique_items: boolean
  );
  /** @deprecated */
  items: $option.Option$<Schema$>;
  /** @deprecated */
  min_items: $option.Option$<number>;
  /** @deprecated */
  max_items: $option.Option$<number>;
  /** @deprecated */
  unique_items: boolean;
}
export function ArrayConstraints$ArrayConstraints(
  items: $option.Option$<Schema$>,
  min_items: $option.Option$<number>,
  max_items: $option.Option$<number>,
  unique_items: boolean,
): ArrayConstraints$;
export function ArrayConstraints$isArrayConstraints(
  value: ArrayConstraints$,
): boolean;
export function ArrayConstraints$ArrayConstraints$0(value: ArrayConstraints$): $option.Option$<
  Schema$
>;
export function ArrayConstraints$ArrayConstraints$items(value: ArrayConstraints$): $option.Option$<
  Schema$
>;
export function ArrayConstraints$ArrayConstraints$1(value: ArrayConstraints$): $option.Option$<
  number
>;
export function ArrayConstraints$ArrayConstraints$min_items(value: ArrayConstraints$): $option.Option$<
  number
>;
export function ArrayConstraints$ArrayConstraints$2(value: ArrayConstraints$): $option.Option$<
  number
>;
export function ArrayConstraints$ArrayConstraints$max_items(value: ArrayConstraints$): $option.Option$<
  number
>;
export function ArrayConstraints$ArrayConstraints$3(value: ArrayConstraints$): boolean;
export function ArrayConstraints$ArrayConstraints$unique_items(
  value: ArrayConstraints$,
): boolean;

export type ArrayConstraints$ = ArrayConstraints;

export class ObjectConstraints extends _.CustomType {
  /** @deprecated */
  constructor(
    properties: $dict.Dict$<string, Schema$>,
    required: _.List<string>,
    additional_properties: $option.Option$<Schema$>,
    pattern_properties: $dict.Dict$<string, Schema$>,
    min_properties: $option.Option$<number>,
    max_properties: $option.Option$<number>
  );
  /** @deprecated */
  properties: $dict.Dict$<string, Schema$>;
  /** @deprecated */
  required: _.List<string>;
  /** @deprecated */
  additional_properties: $option.Option$<Schema$>;
  /** @deprecated */
  pattern_properties: $dict.Dict$<string, Schema$>;
  /** @deprecated */
  min_properties: $option.Option$<number>;
  /** @deprecated */
  max_properties: $option.Option$<number>;
}
export function ObjectConstraints$ObjectConstraints(
  properties: $dict.Dict$<string, Schema$>,
  required: _.List<string>,
  additional_properties: $option.Option$<Schema$>,
  pattern_properties: $dict.Dict$<string, Schema$>,
  min_properties: $option.Option$<number>,
  max_properties: $option.Option$<number>,
): ObjectConstraints$;
export function ObjectConstraints$isObjectConstraints(
  value: ObjectConstraints$,
): boolean;
export function ObjectConstraints$ObjectConstraints$0(value: ObjectConstraints$): $dict.Dict$<
  string,
  Schema$
>;
export function ObjectConstraints$ObjectConstraints$properties(value: ObjectConstraints$): $dict.Dict$<
  string,
  Schema$
>;
export function ObjectConstraints$ObjectConstraints$1(value: ObjectConstraints$): _.List<
  string
>;
export function ObjectConstraints$ObjectConstraints$required(value: ObjectConstraints$): _.List<
  string
>;
export function ObjectConstraints$ObjectConstraints$2(value: ObjectConstraints$): $option.Option$<
  Schema$
>;
export function ObjectConstraints$ObjectConstraints$additional_properties(value: ObjectConstraints$): $option.Option$<
  Schema$
>;
export function ObjectConstraints$ObjectConstraints$3(value: ObjectConstraints$): $dict.Dict$<
  string,
  Schema$
>;
export function ObjectConstraints$ObjectConstraints$pattern_properties(value: ObjectConstraints$): $dict.Dict$<
  string,
  Schema$
>;
export function ObjectConstraints$ObjectConstraints$4(value: ObjectConstraints$): $option.Option$<
  number
>;
export function ObjectConstraints$ObjectConstraints$min_properties(value: ObjectConstraints$): $option.Option$<
  number
>;
export function ObjectConstraints$ObjectConstraints$5(value: ObjectConstraints$): $option.Option$<
  number
>;
export function ObjectConstraints$ObjectConstraints$max_properties(value: ObjectConstraints$): $option.Option$<
  number
>;

export type ObjectConstraints$ = ObjectConstraints;

export function null$(): Schema$;

export function bool(): Schema$;

export function number(): Schema$;

export function string(): Schema$;

export function array(): Schema$;

export function object(): Schema$;

export function with_minimum(schema: Schema$, min: number): Schema$;

export function with_maximum(schema: Schema$, max: number): Schema$;

export function with_min_length(schema: Schema$, min: number): Schema$;

export function with_max_length(schema: Schema$, max: number): Schema$;

export function with_pattern(schema: Schema$, pattern: string): Schema$;

export function with_items(schema: Schema$, items: Schema$): Schema$;

export function with_min_items(schema: Schema$, min: number): Schema$;

export function with_max_items(schema: Schema$, max: number): Schema$;

export function unique_items(schema: Schema$): Schema$;

export function with_property(schema: Schema$, name: string, property: Schema$): Schema$;

export function with_additional_properties(schema: Schema$, additional: Schema$): Schema$;

export function no_additional_properties(schema: Schema$): Schema$;

export function one_of(schemas: _.List<Schema$>): Schema$;

export function all_of(schemas: _.List<Schema$>): Schema$;

export function any_of(schemas: _.List<Schema$>): Schema$;

export function not(schema: Schema$): Schema$;

export function const_value(value: $jsonx.JsonValue$): Schema$;

export function enum_values(values: _.List<$jsonx.JsonValue$>): Schema$;

export function error_to_string(error: SchemaError$): string;

export function with_required(schema: Schema$, fields: _.List<string>): Schema$;

export function validate(schema: Schema$, value: $jsonx.JsonValue$): _.Result<
  undefined,
  SchemaError$
>;
