import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

import traenupi_core.{
  type PromptCategory, type WeaknessType, Action, AntiWeakness, Checkpoint,
  Completion, Reflect, Verify,
}

pub fn category_to_string(category: PromptCategory) -> String {
  case category {
    Action -> "action"
    Verify -> "verify"
    Reflect -> "reflect"
    AntiWeakness -> "anti_weakness"
    Checkpoint -> "checkpoint"
    Completion -> "completion"
  }
}

pub fn category_from_string(s: String) -> Option(PromptCategory) {
  case s {
    "action" -> Some(Action)
    "verify" -> Some(Verify)
    "reflect" -> Some(Reflect)
    "anti_weakness" -> Some(AntiWeakness)
    "checkpoint" -> Some(Checkpoint)
    "completion" -> Some(Completion)
    _ -> None
  }
}

pub fn weakness_to_string(weakness: WeaknessType) -> String {
  case weakness {
    traenupi_core.ContextLoss -> "context_loss"
    traenupi_core.IncompleteFollowThrough -> "incomplete_follow_through"
    traenupi_core.PlanningDrift -> "planning_drift"
    traenupi_core.ErrorAmnesia -> "error_amnesia"
    traenupi_core.VerificationNeglect -> "verification_neglect"
    traenupi_core.EdgeCaseBlindness -> "edge_case_blindness"
    traenupi_core.QualityDrift -> "quality_drift"
    traenupi_core.VerificationGap -> "verification_gap"
    traenupi_core.Overconfidence -> "overconfidence"
    traenupi_core.ScopeCreep -> "scope_creep"
  }
}

pub fn weakness_from_string(s: String) -> Option(WeaknessType) {
  case s {
    "context_loss" -> Some(traenupi_core.ContextLoss)
    "incomplete_follow_through" -> Some(traenupi_core.IncompleteFollowThrough)
    "planning_drift" -> Some(traenupi_core.PlanningDrift)
    "error_amnesia" -> Some(traenupi_core.ErrorAmnesia)
    "verification_neglect" -> Some(traenupi_core.VerificationNeglect)
    "edge_case_blindness" -> Some(traenupi_core.EdgeCaseBlindness)
    "quality_drift" -> Some(traenupi_core.QualityDrift)
    "verification_gap" -> Some(traenupi_core.VerificationGap)
    "overconfidence" -> Some(traenupi_core.Overconfidence)
    "scope_creep" -> Some(traenupi_core.ScopeCreep)
    _ -> None
  }
}

pub fn parse_cli_output(output: String) -> List(List(String)) {
  output
  |> string.trim()
  |> string.split("\n")
  |> list.map(fn(line) {
    line
    |> string.trim()
    |> string.split("|")
    |> list.map(string.trim)
  })
  |> list.filter(fn(row) { row != [] })
}

pub fn parse_key_value(
  output: String,
  delimiter: String,
) -> List(#(String, String)) {
  output
  |> string.trim()
  |> string.split("\n")
  |> list.filter_map(fn(line) {
    case string.split_once(line, delimiter) {
      Ok(#(key, value)) -> Ok(#(string.trim(key), string.trim(value)))
      Error(_) -> Error(Nil)
    }
  })
}

pub fn category_icon(category: PromptCategory) -> String {
  case category {
    Action -> ">>"
    Verify -> "??"
    Reflect -> "~~"
    AntiWeakness -> "!!"
    Checkpoint -> "##"
    Completion -> "**"
  }
}

pub fn category_color(category: PromptCategory) -> String {
  case category {
    Action -> "\\x1b[36m"
    Verify -> "\\x1b[32m"
    Reflect -> "\\x1b[33m"
    AntiWeakness -> "\\x1b[35m"
    Checkpoint -> "\\x1b[31m"
    Completion -> "\\x1b[42m\\x1b[37m"
  }
}

pub const ansi_reset: String = "\\x1b[0m"

pub fn format_prompt(
  category: PromptCategory,
  title: String,
  body: String,
) -> String {
  let color = category_color(category)
  let icon = category_icon(category)
  let reset = ansi_reset

  color <> icon <> " " <> title <> reset <> "\n" <> body
}
