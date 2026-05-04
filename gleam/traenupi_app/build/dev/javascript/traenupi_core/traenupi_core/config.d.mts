import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class StringValue extends _.CustomType {
  /** @deprecated */
  constructor(value: string);
  /** @deprecated */
  value: string;
}
export function ConfigValue$StringValue(value: string): ConfigValue$;
export function ConfigValue$isStringValue(value: ConfigValue$): boolean;
export function ConfigValue$StringValue$0(value: ConfigValue$): string;
export function ConfigValue$StringValue$value(value: ConfigValue$): string;

export class IntValue extends _.CustomType {
  /** @deprecated */
  constructor(value: number);
  /** @deprecated */
  value: number;
}
export function ConfigValue$IntValue(value: number): ConfigValue$;
export function ConfigValue$isIntValue(value: ConfigValue$): boolean;
export function ConfigValue$IntValue$0(value: ConfigValue$): number;
export function ConfigValue$IntValue$value(value: ConfigValue$): number;

export class BoolValue extends _.CustomType {
  /** @deprecated */
  constructor(value: boolean);
  /** @deprecated */
  value: boolean;
}
export function ConfigValue$BoolValue(value: boolean): ConfigValue$;
export function ConfigValue$isBoolValue(value: ConfigValue$): boolean;
export function ConfigValue$BoolValue$0(value: ConfigValue$): boolean;
export function ConfigValue$BoolValue$value(value: ConfigValue$): boolean;

export class ListValue extends _.CustomType {
  /** @deprecated */
  constructor(values: _.List<string>);
  /** @deprecated */
  values: _.List<string>;
}
export function ConfigValue$ListValue(values: _.List<string>): ConfigValue$;
export function ConfigValue$isListValue(value: ConfigValue$): boolean;
export function ConfigValue$ListValue$0(value: ConfigValue$): _.List<string>;
export function ConfigValue$ListValue$values(value: ConfigValue$): _.List<
  string
>;

export type ConfigValue$ = StringValue | IntValue | BoolValue | ListValue;

export class ParseError extends _.CustomType {
  /** @deprecated */
  constructor(line: number, message: string);
  /** @deprecated */
  line: number;
  /** @deprecated */
  message: string;
}
export function ConfigError$ParseError(
  line: number,
  message: string,
): ConfigError$;
export function ConfigError$isParseError(value: ConfigError$): boolean;
export function ConfigError$ParseError$0(value: ConfigError$): number;
export function ConfigError$ParseError$line(value: ConfigError$): number;
export function ConfigError$ParseError$1(value: ConfigError$): string;
export function ConfigError$ParseError$message(value: ConfigError$): string;

export class MissingKey extends _.CustomType {
  /** @deprecated */
  constructor(key: string);
  /** @deprecated */
  key: string;
}
export function ConfigError$MissingKey(key: string): ConfigError$;
export function ConfigError$isMissingKey(value: ConfigError$): boolean;
export function ConfigError$MissingKey$0(value: ConfigError$): string;
export function ConfigError$MissingKey$key(value: ConfigError$): string;

export class InvalidType extends _.CustomType {
  /** @deprecated */
  constructor(key: string, expected: string, actual: string);
  /** @deprecated */
  key: string;
  /** @deprecated */
  expected: string;
  /** @deprecated */
  actual: string;
}
export function ConfigError$InvalidType(
  key: string,
  expected: string,
  actual: string,
): ConfigError$;
export function ConfigError$isInvalidType(value: ConfigError$): boolean;
export function ConfigError$InvalidType$0(value: ConfigError$): string;
export function ConfigError$InvalidType$key(value: ConfigError$): string;
export function ConfigError$InvalidType$1(value: ConfigError$): string;
export function ConfigError$InvalidType$expected(value: ConfigError$): string;
export function ConfigError$InvalidType$2(value: ConfigError$): string;
export function ConfigError$InvalidType$actual(value: ConfigError$): string;

export type ConfigError$ = ParseError | MissingKey | InvalidType;

export class ConfigOk<GPU> extends _.CustomType {
  /** @deprecated */
  constructor(value: GPU);
  /** @deprecated */
  value: GPU;
}
export function ConfigResult$ConfigOk<GPU>(value: GPU): ConfigResult$<GPU>;
export function ConfigResult$isConfigOk<GPU>(
  value: ConfigResult$<GPU>,
): boolean;
export function ConfigResult$ConfigOk$0<GPU>(value: ConfigResult$<GPU>): GPU;
export function ConfigResult$ConfigOk$value<GPU>(value: ConfigResult$<GPU>): GPU;

export class ConfigError extends _.CustomType {
  /** @deprecated */
  constructor(error: ConfigError$);
  /** @deprecated */
  error: ConfigError$;
}
export function ConfigResult$ConfigError<GPU>(
  error: ConfigError$,
): ConfigResult$<GPU>;
export function ConfigResult$isConfigError<GPU>(
  value: ConfigResult$<GPU>,
): boolean;
export function ConfigResult$ConfigError$0<GPU>(value: ConfigResult$<GPU>): ConfigError$;
export function ConfigResult$ConfigError$error<GPU>(
  value: ConfigResult$<GPU>,
): ConfigError$;

export type ConfigResult$<GPU> = ConfigOk<GPU> | ConfigError;

export class Config extends _.CustomType {
  /** @deprecated */
  constructor(data: $dict.Dict$<string, ConfigValue$>);
  /** @deprecated */
  data: $dict.Dict$<string, ConfigValue$>;
}
export function Config$Config(data: $dict.Dict$<string, ConfigValue$>): Config$;
export function Config$isConfig(value: Config$): boolean;
export function Config$Config$0(value: Config$): $dict.Dict$<
  string,
  ConfigValue$
>;
export function Config$Config$data(value: Config$): $dict.Dict$<
  string,
  ConfigValue$
>;

export type Config$ = Config;

export function empty(): Config$;

export function parse(content: string): ConfigResult$<Config$>;

export function get(config: Config$, key: string): $option.Option$<ConfigValue$>;

export function set(config: Config$, key: string, value: ConfigValue$): Config$;

export function has_key(config: Config$, key: string): boolean;

export function keys(config: Config$): _.List<string>;

export function get_string(config: Config$, key: string): ConfigResult$<string>;

export function get_int(config: Config$, key: string): ConfigResult$<number>;

export function get_bool(config: Config$, key: string): ConfigResult$<boolean>;

export function get_list(config: Config$, key: string): ConfigResult$<
  _.List<string>
>;

export function get_string_default(
  config: Config$,
  key: string,
  default$: string
): string;

export function get_int_default(config: Config$, key: string, default$: number): number;

export function get_bool_default(
  config: Config$,
  key: string,
  default$: boolean
): boolean;

export function to_string(config: Config$): string;

export function merge(base: Config$, override: Config$): Config$;

export function from_list(items: _.List<[string, ConfigValue$]>): Config$;

export function error_to_string(error: ConfigError$): string;
