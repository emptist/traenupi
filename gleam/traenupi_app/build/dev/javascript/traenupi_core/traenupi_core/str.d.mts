import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export function is_empty(s: string): boolean;

export function is_blank(s: string): boolean;

export function is_not_empty(s: string): boolean;

export function is_not_blank(s: string): boolean;

export function trim_to_option(s: string): $option.Option$<string>;

export function default_if_empty(s: string, default$: string): string;

export function default_if_blank(s: string, default$: string): string;

export function truncate(s: string, max_length: number): string;

export function truncate_with(s: string, max_length: number, suffix: string): string;

export function capitalize(s: string): string;

export function title_case(s: string): string;

export function camel_case(s: string): string;

export function snake_case(s: string): string;

export function kebab_case(s: string): string;

export function reverse(s: string): string;

export function repeat(s: string, n: number): string;

export function starts_with_any(s: string, prefixes: _.List<string>): boolean;

export function ends_with_any(s: string, suffixes: _.List<string>): boolean;

export function remove_prefix(s: string, prefix: string): string;

export function remove_suffix(s: string, suffix: string): string;

export function ensure_prefix(s: string, prefix: string): string;

export function ensure_suffix(s: string, suffix: string): string;

export function surround(s: string, wrapper: string): string;

export function quote(s: string): string;

export function single_quote(s: string): string;

export function unquote(s: string): string;

export function is_numeric(s: string): boolean;

export function is_alpha(s: string): boolean;

export function is_alphanumeric(s: string): boolean;

export function take(s: string, n: number): string;

export function drop(s: string, n: number): string;

export function take_right(s: string, n: number): string;

export function drop_right(s: string, n: number): string;

export function first_char(s: string): $option.Option$<string>;

export function last_char(s: string): $option.Option$<string>;

export function initials(s: string): string;

export function word_count(s: string): number;

export function line_count(s: string): number;

export function indent(s: string, spaces: number): string;

export function dedent(s: string): string;

export function strip_margin(s: string): string;

export function ellipsize(s: string, max_length: number): string;

export function humanize(s: string): string;

export function slugify(s: string): string;

export function template(template_str: string, values: _.List<[string, string]>): string;

export function pluralize(count: number, singular: string, plural: string): string;

export function possessive(s: string): string;
