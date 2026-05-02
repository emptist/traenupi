import gleeunit
import gleeunit/should
import gleam/dict
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
  is_valid_category, is_valid_weakness,
  valid, invalid, combine,
} as validation

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
  validation.error_to_string(validation.EmptyField(field: "name")) |> should.equal("name cannot be empty")
  validation.error_to_string(validation.OutOfRange(field: "age", min: 0, max: 100, actual: 150)) |> should.equal("age must be between 0 and 100, got 150")
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

import traenupi_core/config.{
  StringValue, IntValue,
  ConfigOk, ConfigError,
  parse, get_string, get_int, get_bool, get_list,
  get_string_default, get_int_default, get_bool_default,
  set, has_key, to_string, merge, from_list, empty,
} as config

pub fn config_parse_empty_test() {
  let result = parse("")
  case result {
    ConfigOk(value: cfg) -> should.equal(has_key(cfg, "any"), False)
    ConfigError(error: e) -> should.equal(config.error_to_string(e), "should not error")
  }
}

pub fn config_parse_simple_test() {
  let result = parse("name = test\nvalue = 123")
  case result {
    ConfigOk(value: cfg) -> {
      should.equal(has_key(cfg, "name"), True)
      should.equal(has_key(cfg, "value"), True)
    }
    ConfigError(error: e) -> should.equal(config.error_to_string(e), "should not error")
  }
}

pub fn config_parse_comments_test() {
  let result = parse("# this is a comment\nkey = value\n# another comment")
  case result {
    ConfigOk(value: cfg) -> {
      should.equal(has_key(cfg, "key"), True)
      should.equal(has_key(cfg, "this"), False)
    }
    ConfigError(error: e) -> should.equal(config.error_to_string(e), "should not error")
  }
}

pub fn config_parse_types_test() {
  let result = parse("str = hello\nnum = 42\nflag = true\nitems = [a, b, c]")
  case result {
    ConfigOk(value: cfg) -> {
      case get_string(cfg, "str") {
        ConfigOk(value: v) -> should.equal(v, "hello")
        ConfigError(_) -> should.equal(True, False)
      }
      case get_int(cfg, "num") {
        ConfigOk(value: v) -> should.equal(v, 42)
        ConfigError(_) -> should.equal(True, False)
      }
      case get_bool(cfg, "flag") {
        ConfigOk(value: v) -> should.equal(v, True)
        ConfigError(_) -> should.equal(True, False)
      }
      case get_list(cfg, "items") {
        ConfigOk(value: v) -> should.equal(v, ["a", "b", "c"])
        ConfigError(_) -> should.equal(True, False)
      }
    }
    ConfigError(error: e) -> should.equal(config.error_to_string(e), "should not error")
  }
}

pub fn config_get_missing_key_test() {
  let cfg = empty()
  case get_string(cfg, "missing") {
    ConfigOk(value: _) -> should.equal(True, False)
    ConfigError(error: e) -> should.equal(config.error_to_string(e), "Missing required key: missing")
  }
}

pub fn config_get_default_test() {
  let cfg = empty()
  should.equal(get_string_default(cfg, "name", "default"), "default")
  should.equal(get_int_default(cfg, "count", 10), 10)
  should.equal(get_bool_default(cfg, "flag", True), True)
}

pub fn config_set_test() {
  let cfg = empty()
  let cfg2 = set(cfg, "key", StringValue(value: "value"))
  should.equal(has_key(cfg2, "key"), True)
  case get_string(cfg2, "key") {
    ConfigOk(value: v) -> should.equal(v, "value")
    ConfigError(_) -> should.equal(True, False)
  }
}

pub fn config_merge_test() {
  let base = from_list([#("a", StringValue(value: "1")), #("b", IntValue(value: 2))])
  let override = from_list([#("b", IntValue(value: 3)), #("c", StringValue(value: "4"))])
  let merged = merge(base, override)
  should.equal(has_key(merged, "a"), True)
  should.equal(has_key(merged, "b"), True)
  should.equal(has_key(merged, "c"), True)
  case get_int(merged, "b") {
    ConfigOk(value: v) -> should.equal(v, 3)
    ConfigError(_) -> should.equal(True, False)
  }
}

pub fn config_to_string_test() {
  let cfg = from_list([#("name", StringValue(value: "test")), #("count", IntValue(value: 5))])
  let str = to_string(cfg)
  should.equal(string.contains(str, "name"), True)
  should.equal(string.contains(str, "count"), True)
}

import traenupi_core/http.{
  Get, Post, Put, Delete,
  NetworkError, StatusError,
  get, post,
  with_header, with_body, with_bearer_token,
  method_to_string, is_success, is_redirect,
  is_client_error, is_server_error,
} as http

pub fn http_method_to_string_test() {
  should.equal(method_to_string(Get), "GET")
  should.equal(method_to_string(Post), "POST")
  should.equal(method_to_string(Put), "PUT")
  should.equal(method_to_string(Delete), "DELETE")
}

pub fn http_new_request_test() {
  let req = get("https://example.com")
  should.equal(req.method, Get)
  should.equal(req.url, "https://example.com")
}

pub fn http_with_header_test() {
  let req = get("https://example.com") |> with_header("X-Custom", "value")
  let has_key = dict.has_key(req.headers, "X-Custom")
  should.equal(has_key, True)
}

pub fn http_with_body_test() {
  let req = post("https://example.com") |> with_body("{\"key\": \"value\"}")
  case req.body {
    Some(b) -> should.equal(b, "{\"key\": \"value\"}")
    None -> should.equal(True, False)
  }
}

pub fn http_with_bearer_token_test() {
  let req = get("https://example.com") |> with_bearer_token("my-token")
  let auth = dict.get(req.headers, "Authorization")
  case auth {
    Ok(v) -> should.equal(v, "Bearer my-token")
    Error(_) -> should.equal(True, False)
  }
}

pub fn http_is_success_test() {
  should.equal(is_success(200), True)
  should.equal(is_success(201), True)
  should.equal(is_success(204), True)
  should.equal(is_success(299), True)
  should.equal(is_success(300), False)
  should.equal(is_success(400), False)
  should.equal(is_success(500), False)
}

pub fn http_is_redirect_test() {
  should.equal(is_redirect(301), True)
  should.equal(is_redirect(302), True)
  should.equal(is_redirect(399), True)
  should.equal(is_redirect(200), False)
  should.equal(is_redirect(400), False)
}

pub fn http_is_client_error_test() {
  should.equal(is_client_error(400), True)
  should.equal(is_client_error(404), True)
  should.equal(is_client_error(499), True)
  should.equal(is_client_error(200), False)
  should.equal(is_client_error(500), False)
}

pub fn http_is_server_error_test() {
  should.equal(is_server_error(500), True)
  should.equal(is_server_error(502), True)
  should.equal(is_server_error(599), True)
  should.equal(is_server_error(400), False)
  should.equal(is_server_error(200), False)
}

pub fn http_error_to_string_test() {
  should.equal(http.error_to_string(NetworkError(message: "connection failed")), "Network error: connection failed")
  should.equal(http.error_to_string(StatusError(status: 404, body: "Not Found")), "HTTP 404: Not Found")
}

import traenupi_core/logger.{
  Debug, Info, Warn, Error as LogError,
  new, with_level, with_prefix, with_colors,
  level_to_string, level_to_priority,
  format_key_value, format_error, format_success,
} as logger

pub fn logger_level_to_string_test() {
  should.equal(level_to_string(Debug), "DEBUG")
  should.equal(level_to_string(Info), "INFO")
  should.equal(level_to_string(Warn), "WARN")
  should.equal(level_to_string(LogError), "ERROR")
}

pub fn logger_level_to_priority_test() {
  should.equal(level_to_priority(Debug), 0)
  should.equal(level_to_priority(Info), 1)
  should.equal(level_to_priority(Warn), 2)
  should.equal(level_to_priority(LogError), 3)
}

pub fn logger_new_test() {
  let logger = new()
  should.equal(logger.level, Info)
  should.equal(logger.prefix, None)
  should.equal(logger.use_colors, True)
}

pub fn logger_with_level_test() {
  let logger = new() |> with_level(Debug)
  should.equal(logger.level, Debug)
}

pub fn logger_with_prefix_test() {
  let logger = new() |> with_prefix("MyApp")
  case logger.prefix {
    Some(p) -> should.equal(p, "MyApp")
    None -> should.equal(True, False)
  }
}

pub fn logger_with_colors_test() {
  let logger = new() |> with_colors(False)
  should.equal(logger.use_colors, False)
}

pub fn logger_format_key_value_test() {
  should.equal(format_key_value("key", "value"), "key=value")
  should.equal(format_key_value("status", "200"), "status=200")
}

pub fn logger_format_error_test() {
  should.equal(format_error("NetworkError", "connection failed"), "NetworkError: connection failed")
}

pub fn logger_format_success_test() {
  should.equal(format_success("Upload", "file saved"), "Upload succeeded: file saved")
}

import traenupi_core/async.{
  pending, fulfilled, rejected,
  is_pending, is_fulfilled, is_rejected, is_settled,
  map, map_error, then, recover,
  get_or_default,
  resolve, reject, from_result, to_result,
  state_to_string,
} as async

pub fn async_pending_test() {
  let p = pending()
  should.equal(is_pending(p), True)
  should.equal(is_fulfilled(p), False)
  should.equal(is_rejected(p), False)
}

pub fn async_fulfilled_test() {
  let p = fulfilled(42)
  should.equal(is_pending(p), False)
  should.equal(is_fulfilled(p), True)
  should.equal(is_rejected(p), False)
  should.equal(async.get(p), Some(42))
}

pub fn async_rejected_test() {
  let p = rejected("error")
  should.equal(is_pending(p), False)
  should.equal(is_fulfilled(p), False)
  should.equal(is_rejected(p), True)
  should.equal(async.get_error(p), Some("error"))
}

pub fn async_is_settled_test() {
  should.equal(is_settled(fulfilled(1)), True)
  should.equal(is_settled(rejected("err")), True)
  should.equal(is_settled(pending()), False)
}

pub fn async_map_test() {
  let p = fulfilled(10)
  let p2 = map(p, fn(x) { x * 2 })
  should.equal(async.get(p2), Some(20))
}

pub fn async_map_error_test() {
  let p = rejected("error")
  let p2 = map_error(p, fn(e) { "wrapped: " <> e })
  should.equal(async.get_error(p2), Some("wrapped: error"))
}

pub fn async_then_test() {
  let p = fulfilled(5)
  let p2 = then(p, fn(x) { fulfilled(x + 10) })
  should.equal(async.get(p2), Some(15))
}

pub fn async_recover_test() {
  let p = rejected("failed")
  let p2 = recover(p, fn(e) { fulfilled("recovered from " <> e) })
  should.equal(async.get(p2), Some("recovered from failed"))
}

pub fn async_get_or_default_test() {
  should.equal(get_or_default(fulfilled(42), 0), 42)
  should.equal(get_or_default(pending(), 0), 0)
  should.equal(get_or_default(rejected("err"), 0), 0)
}

pub fn async_resolve_reject_test() {
  let p1 = resolve(100)
  should.equal(async.get(p1), Some(100))
  
  let p2 = reject("oops")
  should.equal(async.get_error(p2), Some("oops"))
}

pub fn async_from_result_test() {
  let p1 = from_result(Ok(42))
  should.equal(async.get(p1), Some(42))
  
  let p2 = from_result(Error("failed"))
  should.equal(async.get_error(p2), Some("failed"))
}

pub fn async_to_result_test() {
  let r1 = to_result(fulfilled(42))
  should.equal(r1, Ok(42))
  
  let r2 = to_result(rejected("err"))
  should.equal(r2, Error("err"))
  
  let r3 = to_result(pending())
  should.equal(r3, Error("Promise is still pending"))
}

pub fn async_state_to_string_test() {
  should.equal(state_to_string(pending()), "pending")
  should.equal(state_to_string(fulfilled(1)), "fulfilled")
  should.equal(state_to_string(rejected("err")), "rejected")
}

import traenupi_core/fs.{
  NotFound, PermissionDenied, IoError,
  File, Directory, Symlink,
  error_to_string, file_type_to_string,
  is_file, is_directory,
  get_extension, get_filename, get_directory,
  join_path, normalize_path, has_extension,
  is_absolute_path, is_relative_path,
  parse_path, resolve_path, change_extension,
  format_size,
  type FileInfo,
} as fs

pub fn fs_error_to_string_test() {
  should.equal(error_to_string(NotFound("test.txt")), "File not found: test.txt")
  should.equal(error_to_string(PermissionDenied("secret.txt")), "Permission denied: secret.txt")
  should.equal(error_to_string(IoError("disk full")), "IO error: disk full")
}

pub fn fs_file_type_to_string_test() {
  should.equal(file_type_to_string(File), "file")
  should.equal(file_type_to_string(Directory), "directory")
  should.equal(file_type_to_string(Symlink), "symlink")
  should.equal(file_type_to_string(fs.Unknown), "unknown")
}

pub fn fs_is_file_test() {
  let file_info = fs.FileInfo(path: "test.txt", file_type: File, size: 100, is_readonly: False)
  should.equal(is_file(file_info), True)
  should.equal(is_directory(file_info), False)
}

pub fn fs_is_directory_test() {
  let dir_info = fs.FileInfo(path: "testdir", file_type: Directory, size: 0, is_readonly: False)
  should.equal(is_directory(dir_info), True)
  should.equal(is_file(dir_info), False)
}

pub fn fs_get_extension_test() {
  should.equal(get_extension("file.txt"), Some("txt"))
  should.equal(get_extension("archive.tar.gz"), Some("gz"))
  should.equal(get_extension("noextension"), None)
  should.equal(get_extension(".hidden"), None)
}

pub fn fs_get_filename_test() {
  should.equal(get_filename("/path/to/file.txt"), "file.txt")
  should.equal(get_filename("simple.txt"), "simple.txt")
  should.equal(get_filename("/"), "")
}

pub fn fs_get_directory_test() {
  should.equal(get_directory("/path/to/file.txt"), "/path/to")
  should.equal(get_directory("simple.txt"), ".")
  should.equal(get_directory("/file.txt"), "")
}

pub fn fs_join_path_test() {
  should.equal(join_path(["home", "user", "docs"]), "home/user/docs")
  should.equal(join_path(["a", "b", "c"]), "a/b/c")
}

pub fn fs_normalize_path_test() {
  should.equal(normalize_path("/home/./user/../docs"), "home/docs")
  should.equal(normalize_path("./file.txt"), "file.txt")
  should.equal(normalize_path("path/to/./file"), "path/to/file")
}

pub fn fs_has_extension_test() {
  should.equal(has_extension("file.txt", "txt"), True)
  should.equal(has_extension("file.txt", "pdf"), False)
  should.equal(has_extension("noextension", "txt"), False)
}

pub fn fs_is_absolute_path_test() {
  should.equal(is_absolute_path("/home/user"), True)
  should.equal(is_absolute_path("relative/path"), False)
  should.equal(is_absolute_path("./file"), False)
}

pub fn fs_is_relative_path_test() {
  should.equal(is_relative_path("/home/user"), False)
  should.equal(is_relative_path("relative/path"), True)
  should.equal(is_relative_path("./file"), True)
}

pub fn fs_parse_path_test() {
  should.equal(parse_path("a/b/../c"), [fs.Normal("a"), fs.Normal("b"), fs.ParentDir, fs.Normal("c")])
  should.equal(parse_path("./file.txt"), [fs.Normal("file.txt")])
}

pub fn fs_resolve_path_test() {
  should.equal(resolve_path("/home/user", "docs"), "home/user/docs")
  should.equal(resolve_path("/home/user", "/absolute"), "absolute")
}

pub fn fs_change_extension_test() {
  should.equal(change_extension("file.txt", "pdf"), "file.pdf")
  should.equal(change_extension("noextension", "txt"), "noextension.txt")
}

pub fn fs_format_size_test() {
  should.equal(format_size(512), "512 B")
  should.equal(format_size(1024), "1 KB")
  should.equal(format_size(1536), "1 KB")
  should.equal(format_size(1048576), "1 MB")
}

import traenupi_core/datetime.{
  type Month, type Weekday, type DateTime,
  January, February, March, April, May, June, July, August, September, October, November, December,
  Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday,
  month_to_int, int_to_month, weekday_to_int, int_to_weekday,
  month_to_string, weekday_to_string, month_to_short, weekday_to_short,
  is_leap_year, days_in_month, is_valid_date, is_valid_time,
  format_datetime, to_iso8601, to_date_string, to_time_string,
  create, create_full, add_days, add_hours, add_minutes, add_seconds,
  is_before, is_after, is_same_day, start_of_day, end_of_day,
}

pub fn datetime_month_to_int_test() {
  should.equal(month_to_int(January), 1)
  should.equal(month_to_int(June), 6)
  should.equal(month_to_int(December), 12)
}

pub fn datetime_int_to_month_test() {
  should.equal(int_to_month(1), Some(January))
  should.equal(int_to_month(6), Some(June))
  should.equal(int_to_month(12), Some(December))
  should.equal(int_to_month(13), None)
  should.equal(int_to_month(0), None)
}

pub fn datetime_weekday_to_int_test() {
  should.equal(weekday_to_int(Monday), 1)
  should.equal(weekday_to_int(Wednesday), 3)
  should.equal(weekday_to_int(Sunday), 7)
}

pub fn datetime_int_to_weekday_test() {
  should.equal(int_to_weekday(1), Some(Monday))
  should.equal(int_to_weekday(7), Some(Sunday))
  should.equal(int_to_weekday(8), None)
}

pub fn datetime_month_to_string_test() {
  should.equal(month_to_string(January), "January")
  should.equal(month_to_string(December), "December")
}

pub fn datetime_weekday_to_string_test() {
  should.equal(weekday_to_string(Monday), "Monday")
  should.equal(weekday_to_string(Sunday), "Sunday")
}

pub fn datetime_month_to_short_test() {
  should.equal(month_to_short(January), "Jan")
  should.equal(month_to_short(September), "Sep")
}

pub fn datetime_weekday_to_short_test() {
  should.equal(weekday_to_short(Monday), "Mon")
  should.equal(weekday_to_short(Thursday), "Thu")
}

pub fn datetime_is_leap_year_test() {
  should.equal(is_leap_year(2024), True)
  should.equal(is_leap_year(2023), False)
  should.equal(is_leap_year(2000), True)
  should.equal(is_leap_year(1900), False)
}

pub fn datetime_days_in_month_test() {
  should.equal(days_in_month(2024, January), 31)
  should.equal(days_in_month(2024, February), 29)
  should.equal(days_in_month(2023, February), 28)
  should.equal(days_in_month(2024, April), 30)
}

pub fn datetime_is_valid_date_test() {
  should.equal(is_valid_date(2024, January, 15), True)
  should.equal(is_valid_date(2024, February, 29), True)
  should.equal(is_valid_date(2023, February, 29), False)
  should.equal(is_valid_date(2024, January, 32), False)
}

pub fn datetime_is_valid_time_test() {
  should.equal(is_valid_time(12, 30, 45), True)
  should.equal(is_valid_time(23, 59, 59), True)
  should.equal(is_valid_time(24, 0, 0), False)
  should.equal(is_valid_time(12, 60, 0), False)
}

pub fn datetime_format_test() {
  let dt = create_full(2024, March, 15, 14, 30, 45)
  should.equal(to_iso8601(dt), "2024-03-15T14:30:45")
  should.equal(to_date_string(dt), "2024-03-15")
  should.equal(to_time_string(dt), "14:30:45")
}

pub fn datetime_format_custom_test() {
  let dt = create_full(2024, March, 15, 14, 30, 45)
  should.equal(format_datetime(dt, "%Y-%m-%d"), "2024-03-15")
  should.equal(format_datetime(dt, "%B %d, %Y"), "March 15, 2024")
}

pub fn datetime_add_days_test() {
  let dt = create(2024, March, 15)
  let dt2 = add_days(dt, 5)
  should.equal(dt2.day, 20)
  
  let dt3 = add_days(dt, 20)
  should.equal(dt3.month, April)
  should.equal(dt3.day, 4)
}

pub fn datetime_add_hours_test() {
  let dt = create_full(2024, March, 15, 10, 0, 0)
  let dt2 = add_hours(dt, 5)
  should.equal(dt2.hour, 15)
  
  let dt3 = add_hours(dt, 15)
  should.equal(dt3.day, 16)
  should.equal(dt3.hour, 1)
}

pub fn datetime_add_minutes_test() {
  let dt = create_full(2024, March, 15, 10, 30, 0)
  let dt2 = add_minutes(dt, 45)
  should.equal(dt2.hour, 11)
  should.equal(dt2.minute, 15)
}

pub fn datetime_add_seconds_test() {
  let dt = create_full(2024, March, 15, 10, 30, 30)
  let dt2 = add_seconds(dt, 45)
  should.equal(dt2.minute, 31)
  should.equal(dt2.second, 15)
}

pub fn datetime_compare_test() {
  let dt1 = create_full(2024, March, 15, 10, 0, 0)
  let dt2 = create_full(2024, March, 15, 12, 0, 0)
  let dt3 = create_full(2024, March, 16, 10, 0, 0)
  
  should.equal(is_before(dt1, dt2), True)
  should.equal(is_after(dt2, dt1), True)
  should.equal(is_before(dt1, dt3), True)
  should.equal(is_same_day(dt1, dt2), True)
  should.equal(is_same_day(dt1, dt3), False)
}

pub fn datetime_start_end_of_day_test() {
  let dt = create_full(2024, March, 15, 14, 30, 45)
  let start = start_of_day(dt)
  let end = end_of_day(dt)
  
  should.equal(start.hour, 0)
  should.equal(start.minute, 0)
  should.equal(start.second, 0)
  
  should.equal(end.hour, 23)
  should.equal(end.minute, 59)
  should.equal(end.second, 59)
}

import traenupi_core/str.{
  is_empty, is_blank, is_not_empty as str_not_empty, is_not_blank,
  trim_to_option, default_if_empty, default_if_blank,
  truncate, truncate_with, capitalize, title_case,
  camel_case, snake_case, kebab_case, reverse,
  starts_with_any, ends_with_any,
  remove_prefix, remove_suffix, ensure_prefix, ensure_suffix,
  surround, quote, single_quote, unquote,
  is_numeric, is_alpha, is_alphanumeric,
  take, drop, take_right, drop_right,
  first_char, last_char, initials, word_count,
  ellipsize, humanize, slugify, template,
  pluralize, possessive,
} as str_utils

pub fn str_is_empty_test() {
  should.equal(is_empty(""), True)
  should.equal(is_empty("hello"), False)
  should.equal(is_empty("  "), False)
}

pub fn str_is_blank_test() {
  should.equal(is_blank(""), True)
  should.equal(is_blank("  "), True)
  should.equal(is_blank("\t\n"), True)
  should.equal(is_blank("hello"), False)
}

pub fn str_trim_to_option_test() {
  should.equal(trim_to_option(""), None)
  should.equal(trim_to_option("  "), None)
  should.equal(trim_to_option("  hello  "), Some("hello"))
}

pub fn str_default_if_empty_test() {
  should.equal(default_if_empty("", "default"), "default")
  should.equal(default_if_empty("hello", "default"), "hello")
}

pub fn str_truncate_test() {
  should.equal(truncate("hello world", 5), "he...")
  should.equal(truncate("hello", 10), "hello")
}

pub fn str_truncate_with_test() {
  should.equal(truncate_with("hello world", 8, "..."), "hello...")
  should.equal(truncate_with("hello", 10, "..."), "hello")
}

pub fn str_capitalize_test() {
  should.equal(capitalize("hello"), "Hello")
  should.equal(capitalize("HELLO"), "HELLO")
  should.equal(capitalize(""), "")
}

pub fn str_title_case_test() {
  should.equal(title_case("hello world"), "Hello World")
  should.equal(title_case("the quick brown fox"), "The Quick Brown Fox")
}

pub fn str_snake_case_test() {
  should.equal(snake_case("hello world"), "hello_world")
  should.equal(snake_case("Hello World"), "hello_world")
}

pub fn str_kebab_case_test() {
  should.equal(kebab_case("hello world"), "hello-world")
  should.equal(kebab_case("Hello World"), "hello-world")
}

pub fn str_reverse_test() {
  should.equal(reverse("hello"), "olleh")
  should.equal(reverse(""), "")
  should.equal(reverse("a"), "a")
}

pub fn str_starts_with_any_test() {
  should.equal(starts_with_any("hello world", ["hi", "hello"]), True)
  should.equal(starts_with_any("hello world", ["hi", "hey"]), False)
}

pub fn str_ends_with_any_test() {
  should.equal(ends_with_any("hello.txt", [".txt", ".md"]), True)
  should.equal(ends_with_any("hello.md", [".txt", ".pdf"]), False)
}

pub fn str_remove_prefix_test() {
  should.equal(remove_prefix("hello world", "hello "), "world")
  should.equal(remove_prefix("hello world", "hi"), "hello world")
}

pub fn str_remove_suffix_test() {
  should.equal(remove_suffix("hello.txt", ".txt"), "hello")
  should.equal(remove_suffix("hello.txt", ".md"), "hello.txt")
}

pub fn str_ensure_prefix_test() {
  should.equal(ensure_prefix("world", "hello "), "hello world")
  should.equal(ensure_prefix("hello world", "hello "), "hello world")
}

pub fn str_ensure_suffix_test() {
  should.equal(ensure_suffix("hello", ".txt"), "hello.txt")
  should.equal(ensure_suffix("hello.txt", ".txt"), "hello.txt")
}

pub fn str_quote_test() {
  should.equal(quote("hello"), "\"hello\"")
  should.equal(single_quote("hello"), "'hello'")
}

pub fn str_unquote_test() {
  should.equal(unquote("\"hello\""), "hello")
  should.equal(unquote("'hello'"), "hello")
  should.equal(unquote("hello"), "hello")
}

pub fn str_is_numeric_test() {
  should.equal(is_numeric("12345"), True)
  should.equal(is_numeric("12.34"), False)
  should.equal(is_numeric("abc"), False)
  should.equal(is_numeric(""), False)
}

pub fn str_is_alpha_test() {
  should.equal(is_alpha("hello"), True)
  should.equal(is_alpha("HelloWorld"), True)
  should.equal(is_alpha("hello123"), False)
  should.equal(is_alpha(""), False)
}

pub fn str_is_alphanumeric_test() {
  should.equal(is_alphanumeric("hello123"), True)
  should.equal(is_alphanumeric("HelloWorld"), True)
  should.equal(is_alphanumeric("hello!"), False)
  should.equal(is_alphanumeric(""), False)
}

pub fn str_take_drop_test() {
  should.equal(take("hello world", 5), "hello")
  should.equal(drop("hello world", 6), "world")
  should.equal(take_right("hello world", 5), "world")
  should.equal(drop_right("hello world", 6), "hello")
}

pub fn str_first_last_char_test() {
  should.equal(first_char("hello"), Some("h"))
  should.equal(first_char(""), None)
  should.equal(last_char("hello"), Some("o"))
  should.equal(last_char(""), None)
}

pub fn str_initials_test() {
  should.equal(initials("John Doe"), "JD")
  should.equal(initials("Jane Marie Smith"), "JMS")
}

pub fn str_word_count_test() {
  should.equal(word_count("hello world"), 2)
  should.equal(word_count("the quick brown fox"), 4)
  should.equal(word_count(""), 0)
}

pub fn str_ellipsize_test() {
  should.equal(ellipsize("hello world", 8), "hello...")
  should.equal(ellipsize("hello", 10), "hello")
}

pub fn str_humanize_test() {
  should.equal(humanize("hello_world"), "hello world")
  should.equal(humanize("hello-world"), "hello world")
}

pub fn str_slugify_test() {
  should.equal(slugify("Hello World"), "hello-world")
  should.equal(slugify("hello_world"), "hello-world")
}

pub fn str_template_test() {
  let template_str = "Hello {{name}}, welcome to {{place}}!"
  let values = [#("name", "Alice"), #("place", "Wonderland")]
  should.equal(template(template_str, values), "Hello Alice, welcome to Wonderland!")
}

pub fn str_pluralize_test() {
  should.equal(pluralize(1, "cat", "cats"), "cat")
  should.equal(pluralize(2, "cat", "cats"), "cats")
  should.equal(pluralize(0, "cat", "cats"), "cats")
}

pub fn str_possessive_test() {
  should.equal(possessive("John"), "John's")
  should.equal(possessive("James"), "James'")
}

import traenupi_core/resultx.{
  option_to_result, result_to_option,
  is_ok, is_error, is_some, is_none,
  get_or_else as opt_get_or_else, get_or_default as opt_get_or_default,
  unwrap_or_else, unwrap_or_default,
  map_both, map_option,
  filter_option, filter_result,
  flatten_option, flatten_result,
  partition_results, partition_options,
  first_ok, first_some,
  all_ok, all_some,
  or_else, or_else_result,
  and_then, zip, zip_result,
  contains, contains_ok, contains_error,
  ok, err,
  transpose_option_result, transpose_result_option,
  fold_ok, fold_option,
}

pub fn resultx_option_to_result_test() {
  should.equal(option_to_result(Some(42), "error"), Ok(42))
  should.equal(option_to_result(None, "error"), Error("error"))
}

pub fn resultx_result_to_option_test() {
  should.equal(result_to_option(Ok(42)), Some(42))
  should.equal(result_to_option(Error("error")), None)
}

pub fn resultx_is_ok_error_test() {
  should.equal(is_ok(Ok(42)), True)
  should.equal(is_ok(Error("error")), False)
  should.equal(is_error(Ok(42)), False)
  should.equal(is_error(Error("error")), True)
}

pub fn resultx_is_some_none_test() {
  should.equal(is_some(Some(42)), True)
  should.equal(is_some(None), False)
  should.equal(is_none(Some(42)), False)
  should.equal(is_none(None), True)
}

pub fn resultx_get_or_else_test() {
  should.equal(opt_get_or_else(Some(42), fn() { 0 }), 42)
  should.equal(opt_get_or_else(None, fn() { 0 }), 0)
}

pub fn resultx_get_or_default_test() {
  should.equal(opt_get_or_default(Some(42), 0), 42)
  should.equal(opt_get_or_default(None, 0), 0)
}

pub fn resultx_unwrap_or_else_test() {
  should.equal(unwrap_or_else(Ok(42), fn(_) { 0 }), 42)
  should.equal(unwrap_or_else(Error("error"), fn(_) { 0 }), 0)
}

pub fn resultx_unwrap_or_default_test() {
  should.equal(unwrap_or_default(Ok(42), 0), 42)
  should.equal(unwrap_or_default(Error("error"), 0), 0)
}

pub fn resultx_map_both_test() {
  should.equal(map_both(Ok(42), fn(x) { x * 2 }, fn(e) { "error: " <> e }), Ok(84))
  should.equal(map_both(Error("fail"), fn(x) { x * 2 }, fn(e) { "error: " <> e }), Error("error: fail"))
}

pub fn resultx_map_option_test() {
  should.equal(map_option(Some(42), fn(x) { x * 2 }), Some(84))
  should.equal(map_option(None, fn(x) { x * 2 }), None)
}

pub fn resultx_filter_option_test() {
  should.equal(filter_option(Some(42), fn(x) { x > 10 }), Some(42))
  should.equal(filter_option(Some(5), fn(x) { x > 10 }), None)
  should.equal(filter_option(None, fn(x) { True }), None)
}

pub fn resultx_filter_result_test() {
  should.equal(filter_result(Ok(42), fn(x) { x > 10 }, "too small"), Ok(42))
  should.equal(filter_result(Ok(5), fn(x) { x > 10 }, "too small"), Error("too small"))
  should.equal(filter_result(Error("error"), fn(x) { True }, "too small"), Error("error"))
}

pub fn resultx_flatten_option_test() {
  should.equal(flatten_option(Some(Some(42))), Some(42))
  should.equal(flatten_option(Some(None)), None)
  should.equal(flatten_option(None), None)
}

pub fn resultx_flatten_result_test() {
  should.equal(flatten_result(Ok(Ok(42))), Ok(42))
  should.equal(flatten_result(Ok(Error("error"))), Error("error"))
  should.equal(flatten_result(Error("outer")), Error("outer"))
}

pub fn resultx_partition_results_test() {
  let results = [Ok(1), Error("a"), Ok(2), Error("b")]
  should.equal(partition_results(results), #([1, 2], ["a", "b"]))
}

pub fn resultx_partition_options_test() {
  let opts = [Some(1), None, Some(2), None]
  should.equal(partition_options(opts), #([1, 2], 2))
}

pub fn resultx_first_ok_test() {
  should.equal(first_ok([Error("a"), Ok(42), Ok(100)]), Some(42))
  should.equal(first_ok([Error("a"), Error("b")]), None)
}

pub fn resultx_first_some_test() {
  should.equal(first_some([None, Some(42), Some(100)]), Some(42))
  should.equal(first_some([None, None]), None)
}

pub fn resultx_all_ok_test() {
  should.equal(all_ok([Ok(1), Ok(2), Ok(3)]), Ok([1, 2, 3]))
  should.equal(all_ok([Ok(1), Error("a"), Ok(3)]), Error("a"))
}

pub fn resultx_all_some_test() {
  should.equal(all_some([Some(1), Some(2), Some(3)]), Some([1, 2, 3]))
  should.equal(all_some([Some(1), None, Some(3)]), None)
}

pub fn resultx_or_else_test() {
  should.equal(or_else(Some(42), fn() { Some(0) }), Some(42))
  should.equal(or_else(None, fn() { Some(0) }), Some(0))
  should.equal(or_else(None, fn() { None }), None)
}

pub fn resultx_or_else_result_test() {
  should.equal(or_else_result(Ok(42), fn() { Ok(0) }), Ok(42))
  should.equal(or_else_result(Error("a"), fn() { Ok(0) }), Ok(0))
  should.equal(or_else_result(Error("a"), fn() { Error("b") }), Error("b"))
}

pub fn resultx_and_then_test() {
  should.equal(and_then(Some(42), fn(x) { Some(x * 2) }), Some(84))
  should.equal(and_then(Some(42), fn(_) { None }), None)
  should.equal(and_then(None, fn(x) { Some(x * 2) }), None)
}

pub fn resultx_zip_test() {
  should.equal(zip(Some(1), Some(2)), Some(#(1, 2)))
  should.equal(zip(Some(1), None), None)
  should.equal(zip(None, Some(2)), None)
}

pub fn resultx_zip_result_test() {
  should.equal(zip_result(Ok(1), Ok(2)), Ok(#(1, 2)))
  should.equal(zip_result(Ok(1), Error("b")), Error("b"))
  should.equal(zip_result(Error("a"), Ok(2)), Error("a"))
}

pub fn resultx_contains_test() {
  should.equal(contains(Some(42), 42), True)
  should.equal(contains(Some(42), 100), False)
  should.equal(contains(None, 42), False)
}

pub fn resultx_contains_ok_test() {
  should.equal(contains_ok(Ok(42), 42), True)
  should.equal(contains_ok(Ok(42), 100), False)
  should.equal(contains_ok(Error("error"), 42), False)
}

pub fn resultx_contains_error_test() {
  should.equal(contains_error(Error("error"), "error"), True)
  should.equal(contains_error(Error("error"), "other"), False)
  should.equal(contains_error(Ok(42), "error"), False)
}

pub fn resultx_ok_err_test() {
  should.equal(ok(Ok(42)), Some(42))
  should.equal(ok(Error("error")), None)
  should.equal(err(Ok(42)), None)
  should.equal(err(Error("error")), Some("error"))
}

pub fn resultx_transpose_option_result_test() {
  should.equal(transpose_option_result(None), Ok(None))
  should.equal(transpose_option_result(Some(Ok(42))), Ok(Some(42)))
  should.equal(transpose_option_result(Some(Error("error"))), Error("error"))
}

pub fn resultx_transpose_result_option_test() {
  should.equal(transpose_result_option(Ok(None)), None)
  should.equal(transpose_result_option(Ok(Some(42))), Some(Ok(42)))
  should.equal(transpose_result_option(Error("error")), Some(Error("error")))
}

pub fn resultx_fold_ok_test() {
  should.equal(fold_ok(Ok(42), 0, fn(x, acc) { x + acc }), 42)
  should.equal(fold_ok(Error("error"), 0, fn(x, acc) { x + acc }), 0)
}

pub fn resultx_fold_option_test() {
  should.equal(fold_option(Some(42), 0, fn(x, acc) { x + acc }), 42)
  should.equal(fold_option(None, 0, fn(x, acc) { x + acc }), 0)
}
