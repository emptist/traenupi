import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Help extends _.CustomType {}
export function CliCommand$Help(): CliCommand$;
export function CliCommand$isHelp(value: CliCommand$): boolean;

export class Version extends _.CustomType {}
export function CliCommand$Version(): CliCommand$;
export function CliCommand$isVersion(value: CliCommand$): boolean;

export class Status extends _.CustomType {}
export function CliCommand$Status(): CliCommand$;
export function CliCommand$isStatus(value: CliCommand$): boolean;

export class Tellme extends _.CustomType {
  /** @deprecated */
  constructor(question: string);
  /** @deprecated */
  question: string;
}
export function CliCommand$Tellme(question: string): CliCommand$;
export function CliCommand$isTellme(value: CliCommand$): boolean;
export function CliCommand$Tellme$0(value: CliCommand$): string;
export function CliCommand$Tellme$question(value: CliCommand$): string;

export class Know extends _.CustomType {
  /** @deprecated */
  constructor(key: string, value: string);
  /** @deprecated */
  key: string;
  /** @deprecated */
  value: string;
}
export function CliCommand$Know(key: string, value: string): CliCommand$;
export function CliCommand$isKnow(value: CliCommand$): boolean;
export function CliCommand$Know$0(value: CliCommand$): string;
export function CliCommand$Know$key(value: CliCommand$): string;
export function CliCommand$Know$1(value: CliCommand$): string;
export function CliCommand$Know$value(value: CliCommand$): string;

export class Search extends _.CustomType {
  /** @deprecated */
  constructor(query: string);
  /** @deprecated */
  query: string;
}
export function CliCommand$Search(query: string): CliCommand$;
export function CliCommand$isSearch(value: CliCommand$): boolean;
export function CliCommand$Search$0(value: CliCommand$): string;
export function CliCommand$Search$query(value: CliCommand$): string;

export class Remind extends _.CustomType {
  /** @deprecated */
  constructor(minutes: number, message: string);
  /** @deprecated */
  minutes: number;
  /** @deprecated */
  message: string;
}
export function CliCommand$Remind(
  minutes: number,
  message: string,
): CliCommand$;
export function CliCommand$isRemind(value: CliCommand$): boolean;
export function CliCommand$Remind$0(value: CliCommand$): number;
export function CliCommand$Remind$minutes(value: CliCommand$): number;
export function CliCommand$Remind$1(value: CliCommand$): string;
export function CliCommand$Remind$message(value: CliCommand$): string;

export class Review extends _.CustomType {
  /** @deprecated */
  constructor(review_id: string, action: $option.Option$<string>);
  /** @deprecated */
  review_id: string;
  /** @deprecated */
  action: $option.Option$<string>;
}
export function CliCommand$Review(
  review_id: string,
  action: $option.Option$<string>,
): CliCommand$;
export function CliCommand$isReview(value: CliCommand$): boolean;
export function CliCommand$Review$0(value: CliCommand$): string;
export function CliCommand$Review$review_id(value: CliCommand$): string;
export function CliCommand$Review$1(value: CliCommand$): $option.Option$<string>;
export function CliCommand$Review$action(
  value: CliCommand$,
): $option.Option$<string>;

export class Tasks extends _.CustomType {}
export function CliCommand$Tasks(): CliCommand$;
export function CliCommand$isTasks(value: CliCommand$): boolean;

export class Unknown extends _.CustomType {
  /** @deprecated */
  constructor(command: string, args: _.List<string>);
  /** @deprecated */
  command: string;
  /** @deprecated */
  args: _.List<string>;
}
export function CliCommand$Unknown(
  command: string,
  args: _.List<string>,
): CliCommand$;
export function CliCommand$isUnknown(value: CliCommand$): boolean;
export function CliCommand$Unknown$0(value: CliCommand$): string;
export function CliCommand$Unknown$command(value: CliCommand$): string;
export function CliCommand$Unknown$1(value: CliCommand$): _.List<string>;
export function CliCommand$Unknown$args(value: CliCommand$): _.List<string>;

export type CliCommand$ = Help | Version | Status | Tellme | Know | Search | Remind | Review | Tasks | Unknown;

export class ParseOk extends _.CustomType {
  /** @deprecated */
  constructor(command: CliCommand$);
  /** @deprecated */
  command: CliCommand$;
}
export function ParseResult$ParseOk(command: CliCommand$): ParseResult$;
export function ParseResult$isParseOk(value: ParseResult$): boolean;
export function ParseResult$ParseOk$0(value: ParseResult$): CliCommand$;
export function ParseResult$ParseOk$command(value: ParseResult$): CliCommand$;

export class ParseError extends _.CustomType {
  /** @deprecated */
  constructor(message: string);
  /** @deprecated */
  message: string;
}
export function ParseResult$ParseError(message: string): ParseResult$;
export function ParseResult$isParseError(value: ParseResult$): boolean;
export function ParseResult$ParseError$0(value: ParseResult$): string;
export function ParseResult$ParseError$message(value: ParseResult$): string;

export type ParseResult$ = ParseOk | ParseError;

export function parse_args(args: _.List<string>): ParseResult$;

export function command_to_string(cmd: CliCommand$): string;

export function is_valid_command(cmd: string): boolean;

export function get_help_text(): string;
