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

import {
  JsonValue$JsonNull,
  JsonValue$JsonBool,
  JsonValue$JsonNumber,
  JsonValue$JsonString,
  JsonValue$JsonArray,
  JsonValue$JsonObject,
  type JsonValue$,
  type JsonError$,
  null$ as jsonNull,
  bool as jsonBool,
  int as jsonInt,
  float as jsonFloat,
  string as jsonString,
  array as jsonArray,
  object as jsonObject,
  encode as jsonEncode,
  decode as jsonDecode,
  get_field as jsonGetField,
  get_index as jsonGetIndex,
  is_null as jsonIsNull,
  is_bool as jsonIsBool,
  is_number as jsonIsNumber,
  is_string as jsonIsString,
  is_array as jsonIsArray,
  is_object as jsonIsObject,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/jsonx.mjs";

import {
  new_graph,
  new_entry,
  with_tags,
  add_entry,
  remove_entry,
  get_entry,
  find_by_key,
  find_by_tag,
  find_by_category,
  search,
  count_entries,
  get_all_tags,
  get_all_categories,
  type KnowledgeGraph$,
  type KnowledgeEntry$,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/knowledge.mjs";

import {
  new_reflection,
  with_task,
  with_learning,
  with_issue,
  with_suggestion,
  with_praise,
  with_scores,
  with_type,
  with_sentiment,
  new_store as new_reflection_store,
  store_reflection,
  get_reflection,
  get_all_reflections,
  get_reflections_by_agent,
  get_reflections_by_type,
  count_reflections,
  reflection_type_to_string,
  reflection_type_from_string,
  sentiment_to_string,
  sentiment_from_string,
  severity_to_string,
  severity_from_string,
  type Reflection$,
  type ReflectionStore$,
  type ReflectionType$,
  type Sentiment$,
  type Severity$,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/reflection.mjs";

import {
  new_bus,
  subscribe,
  unsubscribe,
  publish,
  get_history,
  get_subscriptions,
  get_subscription_count,
  clear,
  clear_history,
  event_type_to_string,
  event_type_from_string,
  event_to_json,
  Event as GleamEvent,
  type EventBus$,
  type Event$,
  type EventType$,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/event_bus.mjs";

import {
  new_context,
  with_project,
  with_git_hash,
  with_source,
  with_branch,
  with_session,
  with_inner,
  generate_semantic_id,
  create_identity,
  new_store as new_identity_store,
  store_identity,
  get_identity,
  list_identities,
  get_identities_by_project,
  get_identities_by_source,
  count_identities,
  source_to_string,
  source_from_string,
  identity_to_json,
  parse_identity_id,
  is_session_identity,
  is_global_identity,
  is_inner_identity,
  type AgentContext$,
  type AgentIdentity$,
  type IdentityStore$,
  type AgentSource$,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/identity.mjs";

import { toList, Ok, Error as GleamError, type Result, type List } from "../../gleam/traenupi_core/build/dev/javascript/gleam_stdlib/gleam.mjs";
import { Some, None, type Option$ } from "../../gleam/traenupi_core/build/dev/javascript/gleam_stdlib/gleam/option.mjs";

export { toList, type List, type Option$, Some, None };

export function listToArray<T>(list: List<T> | T[]): T[] {
  if (Array.isArray(list)) return list;
  if (list && typeof list === "object" && "toArray" in list) {
    return (list as unknown as { toArray: () => T[] }).toArray();
  }
  if (list && typeof list === "object" && Symbol.iterator in list) {
    return Array.from(list as unknown as Iterable<T>);
  }
  return [];
}

export function optionToNullable<T>(option: Option$<T> | T | null | undefined): T | undefined {
  if (option === null || option === undefined) return undefined;
  if (typeof option === "object" && option !== null) {
    const opt = option as unknown as { 0?: T };
    if ("0" in opt) {
      return opt[0];
    }
    return undefined;
  }
  return option as T;
}

export function nullableToOption<T>(value: T | undefined | null): T | null {
  if (value === undefined || value === null) return null;
  return value;
}

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

export function demoJsonParsing(): void {
  console.log("=== JSON Parsing Demo ===\n");

  const testCases = [
    "null",
    "true",
    "false",
    "42",
    "3.14",
    "-10",
    "\"hello world\"",
    "[1, 2, 3]",
    "{\"name\": \"Alice\", \"age\": 30}",
    "{\"nested\": {\"deep\": {\"value\": 123}}}",
  ];

  console.log("Decoding JSON strings:");
  for (const json of testCases) {
    const result = jsonDecode(json);
    if (result.isOk()) {
      const encoded = jsonEncode((result as Ok<JsonValue$, JsonError$>)[0]);
      console.log(`  "${json}" -> ${encoded}`);
    } else {
      console.log(`  "${json}" -> Error: ${JSON.stringify((result as GleamError<JsonValue$, JsonError$>)[0])}`);
    }
  }

  console.log("\nBuilding JSON values:");
  const nullVal = jsonNull();
  const boolVal = jsonBool(true);
  const numVal = jsonInt(42);
  const strVal = jsonString("hello");
  const arrVal = jsonArray(toList([jsonInt(1), jsonInt(2), jsonInt(3)]));
  const objVal = jsonObject(toList([
    ["name", jsonString("Alice")],
    ["age", jsonInt(30)],
    ["active", jsonBool(true)],
  ]));

  console.log(`  null: ${jsonEncode(nullVal)}`);
  console.log(`  bool: ${jsonEncode(boolVal)}`);
  console.log(`  number: ${jsonEncode(numVal)}`);
  console.log(`  string: ${jsonEncode(strVal)}`);
  console.log(`  array: ${jsonEncode(arrVal)}`);
  console.log(`  object: ${jsonEncode(objVal)}`);

  console.log("\nType checking:");
  console.log(`  is_null(null): ${jsonIsNull(nullVal)}`);
  console.log(`  is_bool(true): ${jsonIsBool(boolVal)}`);
  console.log(`  is_number(42): ${jsonIsNumber(numVal)}`);
  console.log(`  is_string("hello"): ${jsonIsString(strVal)}`);
  console.log(`  is_array([1,2,3]): ${jsonIsArray(arrVal)}`);
  console.log(`  is_object({...}): ${jsonIsObject(objVal)}`);

  console.log("\nField access:");
  const fieldResult = jsonGetField(objVal, "name");
  if (fieldResult.isOk()) {
    console.log(`  get_field(obj, "name"): ${jsonEncode((fieldResult as Ok<JsonValue$, JsonError$>)[0])}`);
  }

  console.log("\nError handling:");
  const errorCases = [
    "",
    "invalid",
    "{\"a\":}",
    "[1, 2, 3,]",
  ];
  for (const json of errorCases) {
    const result = jsonDecode(json);
    if (!result.isOk()) {
      console.log(`  "${json}" -> Error (expected)`);
    } else {
      console.log(`  "${json}" -> Unexpected success!`);
    }
  }
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
  JsonValue$JsonNull,
  JsonValue$JsonBool,
  JsonValue$JsonNumber,
  JsonValue$JsonString,
  JsonValue$JsonArray,
  JsonValue$JsonObject,
  type JsonValue$,
  type JsonError$,
  jsonNull,
  jsonBool,
  jsonInt,
  jsonFloat,
  jsonString,
  jsonArray,
  jsonObject,
  jsonEncode,
  jsonDecode,
  jsonGetField,
  jsonGetIndex,
  jsonIsNull,
  jsonIsBool,
  jsonIsNumber,
  jsonIsString,
  jsonIsArray,
  jsonIsObject,
  new_graph,
  new_entry,
  with_tags,
  add_entry,
  remove_entry,
  get_entry,
  find_by_key,
  find_by_tag,
  find_by_category,
  search,
  count_entries,
  get_all_tags,
  get_all_categories,
  type KnowledgeGraph$,
  type KnowledgeEntry$,
  new_reflection,
  with_task,
  with_learning,
  with_issue,
  with_suggestion,
  with_praise,
  with_scores,
  with_type,
  with_sentiment,
  new_reflection_store,
  store_reflection,
  get_reflection,
  get_all_reflections,
  get_reflections_by_agent,
  get_reflections_by_type,
  count_reflections,
  reflection_type_to_string,
  reflection_type_from_string,
  sentiment_to_string,
  sentiment_from_string,
  severity_to_string,
  severity_from_string,
  type Reflection$,
  type ReflectionStore$,
  type ReflectionType$,
  type Sentiment$,
  type Severity$,
  new_bus,
  subscribe,
  unsubscribe,
  publish,
  get_history,
  get_subscriptions,
  get_subscription_count,
  clear,
  clear_history,
  event_type_to_string,
  event_type_from_string,
  event_to_json,
  GleamEvent,
  type EventBus$,
  type Event$,
  type EventType$,
  new_context,
  with_project,
  with_git_hash,
  with_source,
  with_branch,
  with_session,
  with_inner,
  generate_semantic_id,
  create_identity,
  new_identity_store,
  store_identity,
  get_identity,
  list_identities,
  get_identities_by_project,
  get_identities_by_source,
  count_identities,
  source_to_string,
  source_from_string,
  identity_to_json,
  parse_identity_id,
  is_session_identity,
  is_global_identity,
  is_inner_identity,
  type AgentContext$,
  type AgentIdentity$,
  type IdentityStore$,
  type AgentSource$,
};
