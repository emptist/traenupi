import type * as _ from "../gleam.d.mts";

export class EmptyField extends _.CustomType {
  /** @deprecated */
  constructor(field: string);
  /** @deprecated */
  field: string;
}
export function ValidationError$EmptyField(field: string): ValidationError$;
export function ValidationError$isEmptyField(value: ValidationError$): boolean;
export function ValidationError$EmptyField$0(value: ValidationError$): string;
export function ValidationError$EmptyField$field(value: ValidationError$): string;

export class InvalidFormat extends _.CustomType {
  /** @deprecated */
  constructor(field: string, reason: string);
  /** @deprecated */
  field: string;
  /** @deprecated */
  reason: string;
}
export function ValidationError$InvalidFormat(
  field: string,
  reason: string,
): ValidationError$;
export function ValidationError$isInvalidFormat(
  value: ValidationError$,
): boolean;
export function ValidationError$InvalidFormat$0(value: ValidationError$): string;
export function ValidationError$InvalidFormat$field(
  value: ValidationError$,
): string;
export function ValidationError$InvalidFormat$1(value: ValidationError$): string;
export function ValidationError$InvalidFormat$reason(
  value: ValidationError$,
): string;

export class OutOfRange extends _.CustomType {
  /** @deprecated */
  constructor(field: string, min: number, max: number, actual: number);
  /** @deprecated */
  field: string;
  /** @deprecated */
  min: number;
  /** @deprecated */
  max: number;
  /** @deprecated */
  actual: number;
}
export function ValidationError$OutOfRange(
  field: string,
  min: number,
  max: number,
  actual: number,
): ValidationError$;
export function ValidationError$isOutOfRange(value: ValidationError$): boolean;
export function ValidationError$OutOfRange$0(value: ValidationError$): string;
export function ValidationError$OutOfRange$field(value: ValidationError$): string;
export function ValidationError$OutOfRange$1(
  value: ValidationError$,
): number;
export function ValidationError$OutOfRange$min(value: ValidationError$): number;
export function ValidationError$OutOfRange$2(value: ValidationError$): number;
export function ValidationError$OutOfRange$max(value: ValidationError$): number;
export function ValidationError$OutOfRange$3(value: ValidationError$): number;
export function ValidationError$OutOfRange$actual(value: ValidationError$): number;

export class InvalidLength extends _.CustomType {
  /** @deprecated */
  constructor(field: string, min: number, max: number, actual: number);
  /** @deprecated */
  field: string;
  /** @deprecated */
  min: number;
  /** @deprecated */
  max: number;
  /** @deprecated */
  actual: number;
}
export function ValidationError$InvalidLength(
  field: string,
  min: number,
  max: number,
  actual: number,
): ValidationError$;
export function ValidationError$isInvalidLength(
  value: ValidationError$,
): boolean;
export function ValidationError$InvalidLength$0(value: ValidationError$): string;
export function ValidationError$InvalidLength$field(
  value: ValidationError$,
): string;
export function ValidationError$InvalidLength$1(value: ValidationError$): number;
export function ValidationError$InvalidLength$min(
  value: ValidationError$,
): number;
export function ValidationError$InvalidLength$2(value: ValidationError$): number;
export function ValidationError$InvalidLength$max(
  value: ValidationError$,
): number;
export function ValidationError$InvalidLength$3(value: ValidationError$): number;
export function ValidationError$InvalidLength$actual(
  value: ValidationError$,
): number;

export class MissingRequired extends _.CustomType {
  /** @deprecated */
  constructor(field: string);
  /** @deprecated */
  field: string;
}
export function ValidationError$MissingRequired(
  field: string,
): ValidationError$;
export function ValidationError$isMissingRequired(
  value: ValidationError$,
): boolean;
export function ValidationError$MissingRequired$0(value: ValidationError$): string;
export function ValidationError$MissingRequired$field(
  value: ValidationError$,
): string;

export class InvalidValue extends _.CustomType {
  /** @deprecated */
  constructor(field: string, value: string, allowed: _.List<string>);
  /** @deprecated */
  field: string;
  /** @deprecated */
  value: string;
  /** @deprecated */
  allowed: _.List<string>;
}
export function ValidationError$InvalidValue(
  field: string,
  value: string,
  allowed: _.List<string>,
): ValidationError$;
export function ValidationError$isInvalidValue(
  value: ValidationError$,
): boolean;
export function ValidationError$InvalidValue$0(value: ValidationError$): string;
export function ValidationError$InvalidValue$field(value: ValidationError$): string;
export function ValidationError$InvalidValue$1(
  value: ValidationError$,
): string;
export function ValidationError$InvalidValue$value(value: ValidationError$): string;
export function ValidationError$InvalidValue$2(
  value: ValidationError$,
): _.List<string>;
export function ValidationError$InvalidValue$allowed(value: ValidationError$): _.List<
  string
>;

export type ValidationError$ = EmptyField | InvalidFormat | OutOfRange | InvalidLength | MissingRequired | InvalidValue;

export function ValidationError$field(value: ValidationError$): string;

export class Valid<MUZ> extends _.CustomType {
  /** @deprecated */
  constructor(value: MUZ);
  /** @deprecated */
  value: MUZ;
}
export function ValidationResult$Valid<MUZ>(value: MUZ): ValidationResult$<MUZ>;
export function ValidationResult$isValid<MUZ>(
  value: ValidationResult$<MUZ>,
): boolean;
export function ValidationResult$Valid$0<MUZ>(value: ValidationResult$<MUZ>): MUZ;
export function ValidationResult$Valid$value<MUZ>(
  value: ValidationResult$<MUZ>,
): MUZ;

export class Invalid extends _.CustomType {
  /** @deprecated */
  constructor(errors: _.List<ValidationError$>);
  /** @deprecated */
  errors: _.List<ValidationError$>;
}
export function ValidationResult$Invalid<MUZ>(
  errors: _.List<ValidationError$>,
): ValidationResult$<MUZ>;
export function ValidationResult$isInvalid<MUZ>(
  value: ValidationResult$<MUZ>,
): boolean;
export function ValidationResult$Invalid$0<MUZ>(value: ValidationResult$<MUZ>): _.List<
  ValidationError$
>;
export function ValidationResult$Invalid$errors<MUZ>(value: ValidationResult$<
    MUZ
  >): _.List<ValidationError$>;

export type ValidationResult$<MUZ> = Valid<MUZ> | Invalid;

export function valid<MVA>(value: MVA): ValidationResult$<MVA>;

export function invalid(error: ValidationError$): ValidationResult$<any>;

export function invalid_multiple(errors: _.List<ValidationError$>): ValidationResult$<
  any
>;

export function combine<MVH>(results: _.List<ValidationResult$<MVH>>): ValidationResult$<
  _.List<MVH>
>;

export function map_result<MVM, MVO>(
  result: ValidationResult$<MVM>,
  f: (x0: MVM) => MVO
): ValidationResult$<MVO>;

export function and_then<MVQ, MVS>(
  result: ValidationResult$<MVQ>,
  f: (x0: MVQ) => ValidationResult$<MVS>
): ValidationResult$<MVS>;

export function is_not_empty(value: string, field: string): ValidationResult$<
  string
>;

export function has_min_length(value: string, min: number, field: string): ValidationResult$<
  string
>;

export function has_max_length(value: string, max: number, field: string): ValidationResult$<
  string
>;

export function has_length_range(
  value: string,
  min: number,
  max: number,
  field: string
): ValidationResult$<string>;

export function is_in_range(
  value: number,
  min: number,
  max: number,
  field: string
): ValidationResult$<number>;

export function is_positive(value: number, field: string): ValidationResult$<
  number
>;

export function is_non_negative(value: number, field: string): ValidationResult$<
  number
>;

export function is_one_of(value: string, allowed: _.List<string>, field: string): ValidationResult$<
  string
>;

export function matches_pattern(value: string, pattern: string, field: string): ValidationResult$<
  string
>;

export function is_valid_id(value: string): ValidationResult$<string>;

export function is_valid_timestamp(value: number): ValidationResult$<number>;

export function is_valid_category(value: string): ValidationResult$<string>;

export function is_valid_weakness(value: string): ValidationResult$<string>;

export function is_valid_meeting_status(value: string): ValidationResult$<
  string
>;

export function is_valid_mood(value: string): ValidationResult$<string>;

export function error_to_string(error: ValidationError$): string;

export function errors_to_string(errors: _.List<ValidationError$>): string;
