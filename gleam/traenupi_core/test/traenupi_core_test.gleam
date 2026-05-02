import gleeunit
import gleeunit/should
import gleam/list
import gleam/option.{Some, None}
import gleam/string

import traenupi_core.{Action, Verify, Reflect, AntiWeakness, Checkpoint, Completion}
import traenupi_core/utils.{
  category_to_string, category_from_string, category_icon,
  weakness_to_string, weakness_from_string,
  parse_cli_output, parse_key_value,
}
import traenupi_core/state.{
  new_activity_stats, increment_questions, increment_knowledge,
  total_activity, meeting_status_to_string, meeting_status_from_string,
  driver_phase_to_string, driver_phase_from_string, new_driver_state,
  advance_step, is_task_complete,
}

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn category_to_string_test() {
  category_to_string(Action) |> should.equal("action")
  category_to_string(Verify) |> should.equal("verify")
  category_to_string(Reflect) |> should.equal("reflect")
  category_to_string(AntiWeakness) |> should.equal("anti_weakness")
  category_to_string(Checkpoint) |> should.equal("checkpoint")
  category_to_string(Completion) |> should.equal("completion")
}

pub fn category_from_string_test() {
  category_from_string("action") |> should.equal(Some(Action))
  category_from_string("verify") |> should.equal(Some(Verify))
  category_from_string("unknown") |> should.equal(None)
}

pub fn category_icon_test() {
  category_icon(Action) |> should.equal(">>")
  category_icon(Verify) |> should.equal("??")
  category_icon(Reflect) |> should.equal("~~")
}

pub fn weakness_to_string_test() {
  weakness_to_string(traenupi_core.ContextLoss) |> should.equal("context_loss")
  weakness_to_string(traenupi_core.PlanningDrift) |> should.equal("planning_drift")
}

pub fn weakness_from_string_test() {
  weakness_from_string("context_loss") |> should.equal(Some(traenupi_core.ContextLoss))
  weakness_from_string("unknown") |> should.equal(None)
}

pub fn parse_cli_output_test() {
  let output = "item1|value1\nitem2|value2"
  let result = parse_cli_output(output)
  should.equal(list.length(result), 2)
}

pub fn parse_key_value_test() {
  let output = "name: John\nage: 30"
  let result = parse_key_value(output, ":")
  should.equal(list.length(result), 2)
}

pub fn new_activity_stats_test() {
  let stats = new_activity_stats()
  should.equal(stats.questions_today, 0)
  should.equal(stats.knowledge_stored, 0)
}

pub fn increment_questions_test() {
  let stats = new_activity_stats()
  let updated = increment_questions(stats)
  should.equal(updated.questions_today, 1)
  should.equal(updated.knowledge_stored, 0)
}

pub fn increment_knowledge_test() {
  let stats = new_activity_stats()
  let updated = increment_knowledge(stats)
  should.equal(updated.knowledge_stored, 1)
}

pub fn total_activity_test() {
  let stats = new_activity_stats()
  |> increment_questions()
  |> increment_questions()
  |> increment_knowledge()
  
  should.equal(total_activity(stats), 3)
}

pub fn meeting_status_to_string_test() {
  meeting_status_to_string(traenupi_core.MeetingActive) |> should.equal("active")
  meeting_status_to_string(traenupi_core.MeetingClosed) |> should.equal("closed")
  meeting_status_to_string(traenupi_core.MeetingPending) |> should.equal("pending")
}

pub fn meeting_status_from_string_test() {
  meeting_status_from_string("active") |> should.equal(Some(traenupi_core.MeetingActive))
  meeting_status_from_string("closed") |> should.equal(Some(traenupi_core.MeetingClosed))
  meeting_status_from_string("unknown") |> should.equal(None)
}

pub fn driver_phase_to_string_test() {
  driver_phase_to_string(traenupi_core.Planning) |> should.equal("planning")
  driver_phase_to_string(traenupi_core.Executing) |> should.equal("executing")
  driver_phase_to_string(traenupi_core.Paused) |> should.equal("paused")
  driver_phase_to_string(traenupi_core.Completed) |> should.equal("completed")
}

pub fn driver_phase_from_string_test() {
  driver_phase_from_string("planning") |> should.equal(Some(traenupi_core.Planning))
  driver_phase_from_string("executing") |> should.equal(Some(traenupi_core.Executing))
  driver_phase_from_string("unknown") |> should.equal(None)
}

pub fn new_driver_state_test() {
  let state = new_driver_state()
  should.equal(state.current_step_index, 0)
  should.equal(state.prompts_emitted, 0)
  should.equal(state.task, None)
}

pub fn advance_step_test() {
  let state = new_driver_state()
  let updated = advance_step(state)
  should.equal(updated.current_step_index, 1)
}

pub fn is_task_complete_no_task_test() {
  let state = new_driver_state()
  should.equal(is_task_complete(state), True)
}

import traenupi_core/cli.{
  Help, Version, Status, Tellme, Know,
  Search, Remind, Review, Tasks, Unknown, ParseOk, ParseError,
  parse_args, is_valid_command, get_help_text,
}

pub fn parse_args_help_test() {
  parse_args([]) |> should.equal(ParseOk(Help))
  parse_args(["help"]) |> should.equal(ParseOk(Help))
  parse_args(["--help"]) |> should.equal(ParseOk(Help))
  parse_args(["-h"]) |> should.equal(ParseOk(Help))
}

pub fn parse_args_version_test() {
  parse_args(["version"]) |> should.equal(ParseOk(Version))
  parse_args(["--version"]) |> should.equal(ParseOk(Version))
  parse_args(["-v"]) |> should.equal(ParseOk(Version))
}

pub fn parse_args_status_test() {
  parse_args(["status"]) |> should.equal(ParseOk(Status))
}

pub fn parse_args_tellme_test() {
  parse_args(["tellme"]) |> should.equal(ParseError("tellme requires a question argument"))
  parse_args(["tellme", "hello"]) |> should.equal(ParseOk(Tellme(question: "hello")))
  parse_args(["tellme", "what", "is", "this"]) |> should.equal(ParseOk(Tellme(question: "what is this")))
}

pub fn parse_args_know_test() {
  parse_args(["know"]) |> should.equal(ParseError("know requires key and value arguments"))
  parse_args(["know", "key1"]) |> should.equal(ParseError("know requires a value argument"))
  parse_args(["know", "key1", "value1"]) |> should.equal(ParseOk(Know(key: "key1", value: "value1")))
}

pub fn parse_args_search_test() {
  parse_args(["search"]) |> should.equal(ParseError("search requires a query argument"))
  parse_args(["search", "test"]) |> should.equal(ParseOk(Search(query: "test")))
}

pub fn parse_args_remind_test() {
  parse_args(["remind"]) |> should.equal(ParseError("remind requires minutes and message arguments"))
  parse_args(["remind", "abc", "msg"]) |> should.equal(ParseError("remind: first argument must be a number (minutes)"))
  parse_args(["remind", "5"]) |> should.equal(ParseError("remind requires a message argument"))
  parse_args(["remind", "5", "test", "msg"]) |> should.equal(ParseOk(Remind(minutes: 5, message: "test msg")))
}

pub fn parse_args_review_test() {
  parse_args(["review"]) |> should.equal(ParseError("review requires a review_id argument"))
  parse_args(["review", "abc123"]) |> should.equal(ParseOk(Review(review_id: "abc123", action: None)))
  parse_args(["review", "abc123", "complete"]) |> should.equal(ParseOk(Review(review_id: "abc123", action: Some("complete"))))
}

pub fn parse_args_tasks_test() {
  parse_args(["tasks"]) |> should.equal(ParseOk(Tasks))
}

pub fn parse_args_unknown_test() {
  parse_args(["foobar", "arg1", "arg2"]) |> should.equal(ParseOk(Unknown(command: "foobar", args: ["arg1", "arg2"])))
}

pub fn is_valid_command_test() {
  is_valid_command("help") |> should.equal(True)
  is_valid_command("tellme") |> should.equal(True)
  is_valid_command("unknown") |> should.equal(False)
}

pub fn get_help_text_test() {
  let help = get_help_text()
  should.equal(string.contains(help, "tellme"), True)
}

import traenupi_core/validation.{
  Valid, Invalid,
  is_not_empty, has_min_length, has_max_length, is_in_range,
  is_positive, is_non_negative, is_one_of, is_valid_id,
  is_valid_category, is_valid_weakness, error_to_string,
  valid, invalid, combine,
}

pub fn is_not_empty_test() {
  is_not_empty("hello", "field") |> should.equal(Valid(value: "hello"))
  is_not_empty("  trimmed  ", "field") |> should.equal(Valid(value: "trimmed"))
  is_not_empty("", "field") |> should.equal(Invalid(errors: [validation.EmptyField(field: "field")]))
}

pub fn has_min_length_test() {
  has_min_length("hello", 3, "field") |> should.equal(Valid(value: "hello"))
  has_min_length("hi", 3, "field") |> should.equal(Invalid(errors: [validation.InvalidLength(field: "field", min: 3, max: 0, actual: 2)]))
}

pub fn has_max_length_test() {
  has_max_length("hi", 5, "field") |> should.equal(Valid(value: "hi"))
  has_max_length("hello world", 5, "field") |> should.equal(Invalid(errors: [validation.InvalidLength(field: "field", min: 0, max: 5, actual: 11)]))
}

pub fn is_in_range_test() {
  is_in_range(5, 1, 10, "field") |> should.equal(Valid(value: 5))
  is_in_range(0, 1, 10, "field") |> should.equal(Invalid(errors: [validation.OutOfRange(field: "field", min: 1, max: 10, actual: 0)]))
}

pub fn is_positive_test() {
  is_positive(5, "field") |> should.equal(Valid(value: 5))
  is_positive(0, "field") |> should.equal(Invalid(errors: [validation.OutOfRange(field: "field", min: 1, max: 0, actual: 0)]))
  is_positive(-1, "field") |> should.equal(Invalid(errors: [validation.OutOfRange(field: "field", min: 1, max: 0, actual: -1)]))
}

pub fn is_non_negative_test() {
  is_non_negative(0, "field") |> should.equal(Valid(value: 0))
  is_non_negative(5, "field") |> should.equal(Valid(value: 5))
  is_non_negative(-1, "field") |> should.equal(Invalid(errors: [validation.OutOfRange(field: "field", min: 0, max: 0, actual: -1)]))
}

pub fn is_one_of_test() {
  is_one_of("apple", ["apple", "banana", "cherry"], "fruit") |> should.equal(Valid(value: "apple"))
  is_one_of("grape", ["apple", "banana", "cherry"], "fruit") |> should.equal(Invalid(errors: [validation.InvalidValue(field: "fruit", value: "grape", allowed: ["apple", "banana", "cherry"])]))
}

pub fn is_valid_id_test() {
  is_valid_id("abc123") |> should.equal(Valid(value: "abc123"))
  is_valid_id("") |> should.equal(Invalid(errors: [validation.EmptyField(field: "id")]))
  is_valid_id("abc") |> should.equal(Invalid(errors: [validation.InvalidLength(field: "id", min: 4, max: 64, actual: 3)]))
}

pub fn is_valid_category_test() {
  is_valid_category("action") |> should.equal(Valid(value: "action"))
  is_valid_category("verify") |> should.equal(Valid(value: "verify"))
  is_valid_category("invalid") |> should.equal(Invalid(errors: [validation.InvalidValue(field: "category", value: "invalid", allowed: ["action", "verify", "reflect", "anti_weakness", "checkpoint", "completion"])]))
}

pub fn is_valid_weakness_test() {
  is_valid_weakness("context_loss") |> should.equal(Valid(value: "context_loss"))
  is_valid_weakness("invalid") |> should.equal(Invalid(errors: [validation.InvalidValue(field: "weakness", value: "invalid", allowed: ["context_loss", "incomplete_follow_through", "planning_drift", "error_amnesia", "verification_neglect", "edge_case_blindness", "quality_drift", "verification_gap", "overconfidence", "scope_creep"])]))
}

pub fn error_to_string_test() {
  error_to_string(validation.EmptyField(field: "name")) |> should.equal("name cannot be empty")
  error_to_string(validation.OutOfRange(field: "age", min: 0, max: 100, actual: 150)) |> should.equal("age must be between 0 and 100, got 150")
}

pub fn combine_valid_test() {
  let results = [valid("a"), valid("b"), valid("c")]
  combine(results) |> should.equal(Valid(value: ["a", "b", "c"]))
}

pub fn combine_invalid_test() {
  let results = [valid("a"), invalid(validation.EmptyField(field: "x")), valid("c")]
  combine(results) |> should.equal(Invalid(errors: [validation.EmptyField(field: "x")]))
}

import traenupi_core/property.{
  for_all, gen_positive_int, gen_non_negative_int, gen_non_empty_string,
  gen_string, check, default_num_tests,
}

pub fn property_is_not_empty_always_passes_for_non_empty_test() {
  let result = for_all(gen_non_empty_string, fn(s) {
    case is_not_empty(s, "field") {
      Valid(_) -> True
      Invalid(_) -> False
    }
  }, default_num_tests)
  check(result) |> should.equal(True)
}

pub fn property_is_not_empty_fails_for_empty_test() {
  let result = is_not_empty("", "field")
  case result {
    Invalid(_) -> should.equal(True, True)
    Valid(_) -> should.equal(False, True)
  }
}

pub fn property_is_positive_always_passes_for_positive_test() {
  let result = for_all(gen_positive_int, fn(n) {
    case is_positive(n, "field") {
      Valid(_) -> True
      Invalid(_) -> False
    }
  }, default_num_tests)
  check(result) |> should.equal(True)
}

pub fn property_is_non_negative_always_passes_for_non_negative_test() {
  let result = for_all(gen_non_negative_int, fn(n) {
    case is_non_negative(n, "field") {
      Valid(_) -> True
      Invalid(_) -> False
    }
  }, default_num_tests)
  check(result) |> should.equal(True)
}

pub fn property_string_trim_preserves_content_test() {
  let result = for_all(gen_non_empty_string, fn(s) {
    let trimmed = string.trim(s)
    string.length(trimmed) > 0
  }, default_num_tests)
  check(result) |> should.equal(True)
}

pub fn property_string_append_is_commutative_length_test() {
  let result = for_all(fn(seed) {
    let s1 = gen_string(seed)
    let s2 = gen_string(seed + 1000)
    #(s1, s2)
  }, fn(pair) {
    let #(s1, s2) = pair
    let combined = s1 <> s2
    string.length(combined) == string.length(s1) + string.length(s2)
  }, default_num_tests)
  check(result) |> should.equal(True)
}

pub fn property_category_roundtrip_test() {
  let result = for_all(fn(seed) {
    let idx = seed % 6
    case idx {
      0 -> "action"
      1 -> "verify"
      2 -> "reflect"
      3 -> "anti_weakness"
      4 -> "checkpoint"
      _ -> "completion"
    }
  }, fn(cat) {
    case category_from_string(cat) {
      Some(c) -> category_to_string(c) == cat
      None -> False
    }
  }, default_num_tests)
  check(result) |> should.equal(True)
}
