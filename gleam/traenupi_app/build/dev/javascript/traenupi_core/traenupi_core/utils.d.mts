import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";
import type * as $traenupi_core from "../traenupi_core.d.mts";

export const ansi_reset: string;

export function category_to_string(category: $traenupi_core.PromptCategory$): string;

export function category_from_string(s: string): $option.Option$<
  $traenupi_core.PromptCategory$
>;

export function weakness_to_string(weakness: $traenupi_core.WeaknessType$): string;

export function weakness_from_string(s: string): $option.Option$<
  $traenupi_core.WeaknessType$
>;

export function parse_cli_output(output: string): _.List<_.List<string>>;

export function parse_key_value(output: string, delimiter: string): _.List<
  [string, string]
>;

export function category_icon(category: $traenupi_core.PromptCategory$): string;

export function category_color(category: $traenupi_core.PromptCategory$): string;

export function format_prompt(
  category: $traenupi_core.PromptCategory$,
  title: string,
  body: string
): string;
