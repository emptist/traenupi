import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class JsonNull extends _.CustomType {}
export function JsonValue$JsonNull(): JsonValue$;
export function JsonValue$isJsonNull(value: JsonValue$): boolean;

export class JsonBool extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: boolean);
  /** @deprecated */
  0: boolean;
}
export function JsonValue$JsonBool($0: boolean): JsonValue$;
export function JsonValue$isJsonBool(value: JsonValue$): boolean;
export function JsonValue$JsonBool$0(value: JsonValue$): boolean;

export class JsonNumber extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: number);
  /** @deprecated */
  0: number;
}
export function JsonValue$JsonNumber($0: number): JsonValue$;
export function JsonValue$isJsonNumber(value: JsonValue$): boolean;
export function JsonValue$JsonNumber$0(value: JsonValue$): number;

export class JsonString extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function JsonValue$JsonString($0: string): JsonValue$;
export function JsonValue$isJsonString(value: JsonValue$): boolean;
export function JsonValue$JsonString$0(value: JsonValue$): string;

export class JsonArray extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: _.List<JsonValue$>);
  /** @deprecated */
  0: _.List<JsonValue$>;
}
export function JsonValue$JsonArray($0: _.List<JsonValue$>): JsonValue$;
export function JsonValue$isJsonArray(value: JsonValue$): boolean;
export function JsonValue$JsonArray$0(value: JsonValue$): _.List<JsonValue$>;

export class JsonObject extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: $dict.Dict$<string, JsonValue$>);
  /** @deprecated */
  0: $dict.Dict$<string, JsonValue$>;
}
export function JsonValue$JsonObject(
  $0: $dict.Dict$<string, JsonValue$>,
): JsonValue$;
export function JsonValue$isJsonObject(value: JsonValue$): boolean;
export function JsonValue$JsonObject$0(value: JsonValue$): $dict.Dict$<
  string,
  JsonValue$
>;

export type JsonValue$ = JsonNull | JsonBool | JsonNumber | JsonString | JsonArray | JsonObject;

export class UnexpectedType extends _.CustomType {
  /** @deprecated */
  constructor(expected: string, found: string);
  /** @deprecated */
  expected: string;
  /** @deprecated */
  found: string;
}
export function JsonError$UnexpectedType(
  expected: string,
  found: string,
): JsonError$;
export function JsonError$isUnexpectedType(value: JsonError$): boolean;
export function JsonError$UnexpectedType$0(value: JsonError$): string;
export function JsonError$UnexpectedType$expected(value: JsonError$): string;
export function JsonError$UnexpectedType$1(value: JsonError$): string;
export function JsonError$UnexpectedType$found(value: JsonError$): string;

export class MissingField extends _.CustomType {
  /** @deprecated */
  constructor(field: string);
  /** @deprecated */
  field: string;
}
export function JsonError$MissingField(field: string): JsonError$;
export function JsonError$isMissingField(value: JsonError$): boolean;
export function JsonError$MissingField$0(value: JsonError$): string;
export function JsonError$MissingField$field(value: JsonError$): string;

export class InvalidJson extends _.CustomType {
  /** @deprecated */
  constructor(message: string);
  /** @deprecated */
  message: string;
}
export function JsonError$InvalidJson(message: string): JsonError$;
export function JsonError$isInvalidJson(value: JsonError$): boolean;
export function JsonError$InvalidJson$0(value: JsonError$): string;
export function JsonError$InvalidJson$message(value: JsonError$): string;

export class IndexOutOfBounds extends _.CustomType {
  /** @deprecated */
  constructor(index: number, length: number);
  /** @deprecated */
  index: number;
  /** @deprecated */
  length: number;
}
export function JsonError$IndexOutOfBounds(
  index: number,
  length: number,
): JsonError$;
export function JsonError$isIndexOutOfBounds(value: JsonError$): boolean;
export function JsonError$IndexOutOfBounds$0(value: JsonError$): number;
export function JsonError$IndexOutOfBounds$index(value: JsonError$): number;
export function JsonError$IndexOutOfBounds$1(value: JsonError$): number;
export function JsonError$IndexOutOfBounds$length(value: JsonError$): number;

export type JsonError$ = UnexpectedType | MissingField | InvalidJson | IndexOutOfBounds;

export class DecodeResult extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: JsonValue$, argument$1: string);
  /** @deprecated */
  0: JsonValue$;
  /** @deprecated */
  1: string;
}
export function DecodeResult$DecodeResult(
  $0: JsonValue$,
  $1: string,
): DecodeResult$;
export function DecodeResult$isDecodeResult(value: DecodeResult$): boolean;
export function DecodeResult$DecodeResult$0(value: DecodeResult$): JsonValue$;
export function DecodeResult$DecodeResult$1(value: DecodeResult$): string;

export type DecodeResult$ = DecodeResult;

export function null$(): JsonValue$;

export function bool(value: boolean): JsonValue$;

export function int(value: number): JsonValue$;

export function float(value: number): JsonValue$;

export function string(value: string): JsonValue$;

export function array(values: _.List<JsonValue$>): JsonValue$;

export function object(pairs: _.List<[string, JsonValue$]>): JsonValue$;

export function nullable(value: $option.Option$<JsonValue$>): JsonValue$;

export function json_value_type(value: JsonValue$): string;

export function is_null(value: JsonValue$): boolean;

export function is_bool(value: JsonValue$): boolean;

export function is_number(value: JsonValue$): boolean;

export function is_string(value: JsonValue$): boolean;

export function is_array(value: JsonValue$): boolean;

export function is_object(value: JsonValue$): boolean;

export function json_to_bool(value: JsonValue$): _.Result<boolean, JsonError$>;

export function json_to_number(value: JsonValue$): _.Result<number, JsonError$>;

export function json_to_int(value: JsonValue$): _.Result<number, JsonError$>;

export function json_to_string(value: JsonValue$): _.Result<string, JsonError$>;

export function json_to_array(value: JsonValue$): _.Result<
  _.List<JsonValue$>,
  JsonError$
>;

export function json_to_object(value: JsonValue$): _.Result<
  $dict.Dict$<string, JsonValue$>,
  JsonError$
>;

export function json_to_option(value: JsonValue$): $option.Option$<JsonValue$>;

export function get_field(value: JsonValue$, field: string): _.Result<
  JsonValue$,
  JsonError$
>;

export function get_field_as<IBX>(
  value: JsonValue$,
  field: string,
  converter: (x0: JsonValue$) => _.Result<IBX, JsonError$>
): _.Result<IBX, JsonError$>;

export function get_index(value: JsonValue$, index: number): _.Result<
  JsonValue$,
  JsonError$
>;

export function get_index_as<ICE>(
  value: JsonValue$,
  index: number,
  converter: (x0: JsonValue$) => _.Result<ICE, JsonError$>
): _.Result<ICE, JsonError$>;

export function map_json_array<ICN>(
  value: JsonValue$,
  f: (x0: JsonValue$) => ICN
): _.Result<_.List<ICN>, JsonError$>;

export function filter_json_array(
  value: JsonValue$,
  predicate: (x0: JsonValue$) => boolean
): _.Result<_.List<JsonValue$>, JsonError$>;

export function keys(value: JsonValue$): _.Result<_.List<string>, JsonError$>;

export function values(value: JsonValue$): _.Result<
  _.List<JsonValue$>,
  JsonError$
>;

export function merge_objects(base: JsonValue$, override: JsonValue$): _.Result<
  JsonValue$,
  JsonError$
>;

export function set_field(
  value: JsonValue$,
  field: string,
  new_value: JsonValue$
): _.Result<JsonValue$, JsonError$>;

export function remove_field(value: JsonValue$, field: string): _.Result<
  JsonValue$,
  JsonError$
>;

export function array_length(value: JsonValue$): _.Result<number, JsonError$>;

export function object_length(value: JsonValue$): _.Result<number, JsonError$>;

export function append_to_array(value: JsonValue$, item: JsonValue$): _.Result<
  JsonValue$,
  JsonError$
>;

export function prepend_to_array(value: JsonValue$, item: JsonValue$): _.Result<
  JsonValue$,
  JsonError$
>;

export function path_get(value: JsonValue$, path: _.List<string>): _.Result<
  JsonValue$,
  JsonError$
>;

export function path_set(
  value: JsonValue$,
  path: _.List<string>,
  new_value: JsonValue$
): _.Result<JsonValue$, JsonError$>;

export function encode(value: JsonValue$): string;

export function type_name(value: JsonValue$): string;

export function array_to_list(value: JsonValue$): _.List<JsonValue$>;

export function list_to_array(values: _.List<JsonValue$>): JsonValue$;

export function decode(json: string): _.Result<JsonValue$, JsonError$>;
