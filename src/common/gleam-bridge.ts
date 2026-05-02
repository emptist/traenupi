import {
  PromptCategory$Action,
  PromptCategory$Verify,
  PromptCategory$Reflect,
  PromptCategory$AntiWeakness,
  PromptCategory$Checkpoint,
  PromptCategory$Completion,
  type PromptCategory$,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core.mjs";

import {
  category_to_string,
  category_from_string,
  category_icon,
  category_color,
  format_prompt,
  parse_cli_output,
  parse_key_value,
  ansi_reset,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/utils.mjs";

export function demoGleamIntegration(): void {
  console.log("=== Gleam + TypeScript Integration Demo ===\n");

  const actionCategory: PromptCategory$ = PromptCategory$Action();
  const verifyCategory: PromptCategory$ = PromptCategory$Verify();

  console.log("Category to string:");
  console.log(`  Action -> ${category_to_string(actionCategory)}`);
  console.log(`  Verify -> ${category_to_string(verifyCategory)}`);

  console.log("\nCategory from string:");
  const parsed = category_from_string("anti_weakness");
  console.log(`  "anti_weakness" -> ${parsed ? "AntiWeakness" : "None"}`);

  console.log("\nCategory icons:");
  console.log(`  Action: ${category_icon(actionCategory)}`);
  console.log(`  Verify: ${category_icon(verifyCategory)}`);

  console.log("\nFormatted prompt:");
  const formatted = format_prompt(
    PromptCategory$Checkpoint(),
    "Verify Implementation",
    "Check that all tests pass before proceeding."
  );
  console.log(formatted);

  console.log("\nCLI output parsing:");
  const cliOutput = "item1|value1\nitem2|value2\nitem3|value3";
  const parsedOutput = parse_cli_output(cliOutput);
  console.log(`  Input: "${cliOutput.replace(/\n/g, "\\n")}"`);
  console.log(`  Parsed: ${JSON.stringify(parsedOutput)}`);

  console.log("\nKey-value parsing:");
  const kvOutput = "name: John\nage: 30\ncity: Tokyo";
  const parsedKv = parse_key_value(kvOutput, ":");
  console.log(`  Input: "${kvOutput.replace(/\n/g, "\\n")}"`);
  console.log(`  Parsed: ${JSON.stringify(parsedKv)}`);

  console.log(`\n${ansi_reset}Demo complete!`);
}

export {
  PromptCategory$Action,
  PromptCategory$Verify,
  PromptCategory$Reflect,
  PromptCategory$AntiWeakness,
  PromptCategory$Checkpoint,
  PromptCategory$Completion,
  type PromptCategory$,
  category_to_string,
  category_from_string,
  category_icon,
  category_color,
  format_prompt,
  parse_cli_output,
  parse_key_value,
  ansi_reset,
};
