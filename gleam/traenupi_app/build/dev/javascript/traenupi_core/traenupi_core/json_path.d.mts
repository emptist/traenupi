import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";
import type * as $jsonx from "../traenupi_core/jsonx.d.mts";

export class InvalidPath extends _.CustomType {
  /** @deprecated */
  constructor(message: string);
  /** @deprecated */
  message: string;
}
export function JsonPathError$InvalidPath(message: string): JsonPathError$;
export function JsonPathError$isInvalidPath(value: JsonPathError$): boolean;
export function JsonPathError$InvalidPath$0(value: JsonPathError$): string;
export function JsonPathError$InvalidPath$message(value: JsonPathError$): string;

export class PathNotFound extends _.CustomType {
  /** @deprecated */
  constructor(path: string);
  /** @deprecated */
  path: string;
}
export function JsonPathError$PathNotFound(path: string): JsonPathError$;
export function JsonPathError$isPathNotFound(value: JsonPathError$): boolean;
export function JsonPathError$PathNotFound$0(value: JsonPathError$): string;
export function JsonPathError$PathNotFound$path(value: JsonPathError$): string;

export class InvalidIndex extends _.CustomType {
  /** @deprecated */
  constructor(index: number, length: number);
  /** @deprecated */
  index: number;
  /** @deprecated */
  length: number;
}
export function JsonPathError$InvalidIndex(
  index: number,
  length: number,
): JsonPathError$;
export function JsonPathError$isInvalidIndex(value: JsonPathError$): boolean;
export function JsonPathError$InvalidIndex$0(value: JsonPathError$): number;
export function JsonPathError$InvalidIndex$index(value: JsonPathError$): number;
export function JsonPathError$InvalidIndex$1(value: JsonPathError$): number;
export function JsonPathError$InvalidIndex$length(value: JsonPathError$): number;

export class TypeMismatch extends _.CustomType {
  /** @deprecated */
  constructor(expected: string, found: string);
  /** @deprecated */
  expected: string;
  /** @deprecated */
  found: string;
}
export function JsonPathError$TypeMismatch(
  expected: string,
  found: string,
): JsonPathError$;
export function JsonPathError$isTypeMismatch(value: JsonPathError$): boolean;
export function JsonPathError$TypeMismatch$0(value: JsonPathError$): string;
export function JsonPathError$TypeMismatch$expected(value: JsonPathError$): string;
export function JsonPathError$TypeMismatch$1(
  value: JsonPathError$,
): string;
export function JsonPathError$TypeMismatch$found(value: JsonPathError$): string;

export type JsonPathError$ = InvalidPath | PathNotFound | InvalidIndex | TypeMismatch;

export class Root extends _.CustomType {}
export function PathSegment$Root(): PathSegment$;
export function PathSegment$isRoot(value: PathSegment$): boolean;

export class Field extends _.CustomType {
  /** @deprecated */
  constructor(name: string);
  /** @deprecated */
  name: string;
}
export function PathSegment$Field(name: string): PathSegment$;
export function PathSegment$isField(value: PathSegment$): boolean;
export function PathSegment$Field$0(value: PathSegment$): string;
export function PathSegment$Field$name(value: PathSegment$): string;

export class Index extends _.CustomType {
  /** @deprecated */
  constructor(idx: number);
  /** @deprecated */
  idx: number;
}
export function PathSegment$Index(idx: number): PathSegment$;
export function PathSegment$isIndex(value: PathSegment$): boolean;
export function PathSegment$Index$0(value: PathSegment$): number;
export function PathSegment$Index$idx(value: PathSegment$): number;

export class Wildcard extends _.CustomType {}
export function PathSegment$Wildcard(): PathSegment$;
export function PathSegment$isWildcard(value: PathSegment$): boolean;

export class RecursiveField extends _.CustomType {
  /** @deprecated */
  constructor(name: string);
  /** @deprecated */
  name: string;
}
export function PathSegment$RecursiveField(name: string): PathSegment$;
export function PathSegment$isRecursiveField(value: PathSegment$): boolean;
export function PathSegment$RecursiveField$0(value: PathSegment$): string;
export function PathSegment$RecursiveField$name(value: PathSegment$): string;

export class Slice extends _.CustomType {
  /** @deprecated */
  constructor(
    start: $option.Option$<number>,
    stop: $option.Option$<number>,
    step: $option.Option$<number>
  );
  /** @deprecated */
  start: $option.Option$<number>;
  /** @deprecated */
  stop: $option.Option$<number>;
  /** @deprecated */
  step: $option.Option$<number>;
}
export function PathSegment$Slice(
  start: $option.Option$<number>,
  stop: $option.Option$<number>,
  step: $option.Option$<number>,
): PathSegment$;
export function PathSegment$isSlice(value: PathSegment$): boolean;
export function PathSegment$Slice$0(value: PathSegment$): $option.Option$<
  number
>;
export function PathSegment$Slice$start(value: PathSegment$): $option.Option$<
  number
>;
export function PathSegment$Slice$1(value: PathSegment$): $option.Option$<
  number
>;
export function PathSegment$Slice$stop(value: PathSegment$): $option.Option$<
  number
>;
export function PathSegment$Slice$2(value: PathSegment$): $option.Option$<
  number
>;
export function PathSegment$Slice$step(value: PathSegment$): $option.Option$<
  number
>;

export type PathSegment$ = Root | Field | Index | Wildcard | RecursiveField | Slice;

export class JsonPath extends _.CustomType {
  /** @deprecated */
  constructor(segments: _.List<PathSegment$>);
  /** @deprecated */
  segments: _.List<PathSegment$>;
}
export function JsonPath$JsonPath(segments: _.List<PathSegment$>): JsonPath$;
export function JsonPath$isJsonPath(value: JsonPath$): boolean;
export function JsonPath$JsonPath$0(value: JsonPath$): _.List<PathSegment$>;
export function JsonPath$JsonPath$segments(value: JsonPath$): _.List<
  PathSegment$
>;

export type JsonPath$ = JsonPath;

export function parse(path: string): _.Result<JsonPath$, JsonPathError$>;

export function query(path: JsonPath$, value: $jsonx.JsonValue$): _.Result<
  _.List<$jsonx.JsonValue$>,
  JsonPathError$
>;

export function path_to_string(path: JsonPath$): string;

export function query_one(path: JsonPath$, value: $jsonx.JsonValue$): _.Result<
  $jsonx.JsonValue$,
  JsonPathError$
>;
