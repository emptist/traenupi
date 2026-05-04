import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Debug extends _.CustomType {}
export function LogLevel$Debug(): LogLevel$;
export function LogLevel$isDebug(value: LogLevel$): boolean;

export class Info extends _.CustomType {}
export function LogLevel$Info(): LogLevel$;
export function LogLevel$isInfo(value: LogLevel$): boolean;

export class Warn extends _.CustomType {}
export function LogLevel$Warn(): LogLevel$;
export function LogLevel$isWarn(value: LogLevel$): boolean;

export class Error extends _.CustomType {}
export function LogLevel$Error(): LogLevel$;
export function LogLevel$isError(value: LogLevel$): boolean;

export type LogLevel$ = Debug | Info | Warn | Error;

export class Logger extends _.CustomType {
  /** @deprecated */
  constructor(
    level: LogLevel$,
    prefix: $option.Option$<string>,
    use_colors: boolean
  );
  /** @deprecated */
  level: LogLevel$;
  /** @deprecated */
  prefix: $option.Option$<string>;
  /** @deprecated */
  use_colors: boolean;
}
export function Logger$Logger(
  level: LogLevel$,
  prefix: $option.Option$<string>,
  use_colors: boolean,
): Logger$;
export function Logger$isLogger(value: Logger$): boolean;
export function Logger$Logger$0(value: Logger$): LogLevel$;
export function Logger$Logger$level(value: Logger$): LogLevel$;
export function Logger$Logger$1(value: Logger$): $option.Option$<string>;
export function Logger$Logger$prefix(value: Logger$): $option.Option$<string>;
export function Logger$Logger$2(value: Logger$): boolean;
export function Logger$Logger$use_colors(value: Logger$): boolean;

export type Logger$ = Logger;

export function new$(): Logger$;

export function with_level(logger: Logger$, level: LogLevel$): Logger$;

export function with_prefix(logger: Logger$, prefix: string): Logger$;

export function with_colors(logger: Logger$, use_colors: boolean): Logger$;

export function level_to_string(level: LogLevel$): string;

export function level_to_priority(level: LogLevel$): number;

export function debug(logger: Logger$, message: string): Logger$;

export function info(logger: Logger$, message: string): Logger$;

export function warn(logger: Logger$, message: string): Logger$;

export function error(logger: Logger$, message: string): Logger$;

export function log(logger: Logger$, level: LogLevel$, message: string): Logger$;

export function debug_fn(logger: Logger$, message_fn: () => string): Logger$;

export function info_fn(logger: Logger$, message_fn: () => string): Logger$;

export function with_context(logger: Logger$, context: string): Logger$;

export function format_key_value(key: string, value: string): string;

export function format_error(error_type: string, details: string): string;

export function format_success(operation: string, result: string): string;

export function global_logger(): Logger$;

export function log_debug(message: string): undefined;

export function log_info(message: string): undefined;

export function log_warn(message: string): undefined;

export function log_error(message: string): undefined;
