/// <reference types="./utils.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, toList, isEqual } from "../gleam.mjs";
import * as $traenupi_core from "../traenupi_core.mjs";
import { Action, AntiWeakness, Checkpoint, Completion, Reflect, Verify } from "../traenupi_core.mjs";

export const ansi_reset = "\\x1b[0m";

export function category_to_string(category) {
  if (category instanceof Action) {
    return "action";
  } else if (category instanceof Verify) {
    return "verify";
  } else if (category instanceof Reflect) {
    return "reflect";
  } else if (category instanceof AntiWeakness) {
    return "anti_weakness";
  } else if (category instanceof Checkpoint) {
    return "checkpoint";
  } else {
    return "completion";
  }
}

export function category_from_string(s) {
  if (s === "action") {
    return new Some(new Action());
  } else if (s === "verify") {
    return new Some(new Verify());
  } else if (s === "reflect") {
    return new Some(new Reflect());
  } else if (s === "anti_weakness") {
    return new Some(new AntiWeakness());
  } else if (s === "checkpoint") {
    return new Some(new Checkpoint());
  } else if (s === "completion") {
    return new Some(new Completion());
  } else {
    return new None();
  }
}

export function weakness_to_string(weakness) {
  if (weakness instanceof $traenupi_core.ContextLoss) {
    return "context_loss";
  } else if (weakness instanceof $traenupi_core.IncompleteFollowThrough) {
    return "incomplete_follow_through";
  } else if (weakness instanceof $traenupi_core.PlanningDrift) {
    return "planning_drift";
  } else if (weakness instanceof $traenupi_core.ErrorAmnesia) {
    return "error_amnesia";
  } else if (weakness instanceof $traenupi_core.VerificationNeglect) {
    return "verification_neglect";
  } else if (weakness instanceof $traenupi_core.EdgeCaseBlindness) {
    return "edge_case_blindness";
  } else if (weakness instanceof $traenupi_core.QualityDrift) {
    return "quality_drift";
  } else if (weakness instanceof $traenupi_core.VerificationGap) {
    return "verification_gap";
  } else if (weakness instanceof $traenupi_core.Overconfidence) {
    return "overconfidence";
  } else {
    return "scope_creep";
  }
}

export function weakness_from_string(s) {
  if (s === "context_loss") {
    return new Some(new $traenupi_core.ContextLoss());
  } else if (s === "incomplete_follow_through") {
    return new Some(new $traenupi_core.IncompleteFollowThrough());
  } else if (s === "planning_drift") {
    return new Some(new $traenupi_core.PlanningDrift());
  } else if (s === "error_amnesia") {
    return new Some(new $traenupi_core.ErrorAmnesia());
  } else if (s === "verification_neglect") {
    return new Some(new $traenupi_core.VerificationNeglect());
  } else if (s === "edge_case_blindness") {
    return new Some(new $traenupi_core.EdgeCaseBlindness());
  } else if (s === "quality_drift") {
    return new Some(new $traenupi_core.QualityDrift());
  } else if (s === "verification_gap") {
    return new Some(new $traenupi_core.VerificationGap());
  } else if (s === "overconfidence") {
    return new Some(new $traenupi_core.Overconfidence());
  } else if (s === "scope_creep") {
    return new Some(new $traenupi_core.ScopeCreep());
  } else {
    return new None();
  }
}

export function parse_cli_output(output) {
  let _pipe = output;
  let _pipe$1 = $string.trim(_pipe);
  let _pipe$2 = $string.split(_pipe$1, "\n");
  let _pipe$3 = $list.map(
    _pipe$2,
    (line) => {
      let _pipe$3 = line;
      let _pipe$4 = $string.trim(_pipe$3);
      let _pipe$5 = $string.split(_pipe$4, "|");
      return $list.map(_pipe$5, $string.trim);
    },
  );
  return $list.filter(_pipe$3, (row) => { return !isEqual(row, toList([])); });
}

export function parse_key_value(output, delimiter) {
  let _pipe = output;
  let _pipe$1 = $string.trim(_pipe);
  let _pipe$2 = $string.split(_pipe$1, "\n");
  return $list.filter_map(
    _pipe$2,
    (line) => {
      let $ = $string.split_once(line, delimiter);
      if ($ instanceof Ok) {
        let key = $[0][0];
        let value = $[0][1];
        return new Ok([$string.trim(key), $string.trim(value)]);
      } else {
        return new Error(undefined);
      }
    },
  );
}

export function category_icon(category) {
  if (category instanceof Action) {
    return ">>";
  } else if (category instanceof Verify) {
    return "??";
  } else if (category instanceof Reflect) {
    return "~~";
  } else if (category instanceof AntiWeakness) {
    return "!!";
  } else if (category instanceof Checkpoint) {
    return "##";
  } else {
    return "**";
  }
}

export function category_color(category) {
  if (category instanceof Action) {
    return "\\x1b[36m";
  } else if (category instanceof Verify) {
    return "\\x1b[32m";
  } else if (category instanceof Reflect) {
    return "\\x1b[33m";
  } else if (category instanceof AntiWeakness) {
    return "\\x1b[35m";
  } else if (category instanceof Checkpoint) {
    return "\\x1b[31m";
  } else {
    return "\\x1b[42m\\x1b[37m";
  }
}

export function format_prompt(category, title, body) {
  let color = category_color(category);
  let icon = category_icon(category);
  let reset = ansi_reset;
  return (((((color + icon) + " ") + title) + reset) + "\n") + body;
}
