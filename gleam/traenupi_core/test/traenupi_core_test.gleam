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
