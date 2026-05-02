import {
  PromptCategory$Action,
  PromptCategory$Verify,
  PromptCategory$Reflect,
  PromptCategory$AntiWeakness,
  PromptCategory$Checkpoint,
  PromptCategory$Completion,
  type PromptCategory$,
  type ActivityStats$,
  type DriverState$,
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

import {
  new_activity_stats,
  increment_questions,
  increment_knowledge,
  increment_meeting_opinions,
  increment_baby_ai,
  increment_reminders,
  total_activity,
  meeting_status_to_string,
  meeting_status_from_string,
  driver_phase_to_string,
  driver_phase_from_string,
  new_driver_state,
  advance_step,
  set_phase,
  increment_prompts,
  task_progress,
  is_task_complete,
  summarize_stats,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/state.mjs";

import {
  encode_activity_stats,
  encode_driver_state,
  encode_task,
  encode_knowledge_entry,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/json.mjs";

import {
  parse_args,
  command_to_string,
  is_valid_command,
  get_help_text,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/cli.mjs";

import {
  is_not_empty,
  has_min_length,
  has_max_length,
  is_in_range,
  is_positive,
  is_non_negative,
  is_one_of,
  is_valid_id,
  is_valid_category,
  is_valid_weakness,
  error_to_string,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/validation.mjs";

import { toList } from "../../gleam/traenupi_core/build/dev/javascript/gleam_stdlib/gleam.mjs";

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
  console.log(`  Parsed rows: ${JSON.stringify(parsedOutput).length} chars`);

  console.log("\nKey-value parsing:");
  const kvOutput = "name: John\nage: 30\ncity: Tokyo";
  const parsedKv = parse_key_value(kvOutput, ":");
  console.log(`  Input: "${kvOutput.replace(/\n/g, "\\n")}"`);
  console.log(`  Parsed pairs: ${JSON.stringify(parsedKv).length} chars`);

  console.log("\n--- State Management Demo ---");

  console.log("\nActivity Stats:");
  let stats = new_activity_stats();
  console.log(`  Initial: questions=${stats.questions_today}, knowledge=${stats.knowledge_stored}`);
  stats = increment_questions(stats);
  stats = increment_questions(stats);
  stats = increment_knowledge(stats);
  console.log(`  After 2 questions, 1 knowledge: total=${total_activity(stats)}`);
  console.log(`  Summary: ${summarize_stats(stats)}`);

  console.log("\nDriver State:");
  const driverState = new_driver_state();
  console.log(`  Initial phase: ${driver_phase_to_string(driverState.phase)}`);
  console.log(`  Task progress: ${task_progress(driverState)}`);
  console.log(`  Is complete: ${is_task_complete(driverState)}`);

  const advancedState = advance_step(driverState);
  console.log(`  After advance: step=${advancedState.current_step_index}`);

  console.log("\nJSON Encoding:");
  console.log(`  ActivityStats: ${encode_activity_stats(stats).substring(0, 80)}...`);
  console.log(`  DriverState: ${encode_driver_state(driverState).substring(0, 80)}...`);

  console.log(`\n${ansi_reset}Demo complete!`);
}

export function demoCliParsing(): void {
  console.log("=== CLI Parsing Demo ===\n");

  const testCases = [
    [],
    ["help"],
    ["tellme", "what", "is", "this"],
    ["know", "key1", "value1"],
    ["remind", "5", "test message"],
    ["invalid", "arg1", "arg2"],
  ];

  for (const args of testCases) {
    const result = parse_args(toList(args));
    console.log(`  ${JSON.stringify(args)} -> ${JSON.stringify(result)}`);
  }

  console.log("\nHelp text:");
  console.log(get_help_text());
}

export {
  PromptCategory$Action,
  PromptCategory$Verify,
  PromptCategory$Reflect,
  PromptCategory$AntiWeakness,
  PromptCategory$Checkpoint,
  PromptCategory$Completion,
  type PromptCategory$,
  type ActivityStats$,
  type DriverState$,
  category_to_string,
  category_from_string,
  category_icon,
  category_color,
  format_prompt,
  parse_cli_output,
  parse_key_value,
  ansi_reset,
  new_activity_stats,
  increment_questions,
  increment_knowledge,
  increment_meeting_opinions,
  increment_baby_ai,
  increment_reminders,
  total_activity,
  meeting_status_to_string,
  meeting_status_from_string,
  driver_phase_to_string,
  driver_phase_from_string,
  new_driver_state,
  advance_step,
  set_phase,
  increment_prompts,
  task_progress,
  is_task_complete,
  summarize_stats,
  encode_activity_stats,
  encode_driver_state,
  encode_task,
  encode_knowledge_entry,
  parse_args,
  command_to_string,
  is_valid_command,
  get_help_text,
  is_not_empty,
  has_min_length,
  has_max_length,
  is_in_range,
  is_positive,
  is_non_negative,
  is_one_of,
  is_valid_id,
  is_valid_category,
  is_valid_weakness,
  error_to_string,
};
