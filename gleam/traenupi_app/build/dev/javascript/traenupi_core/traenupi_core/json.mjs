/// <reference types="./json.d.mts" />
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { toList } from "../gleam.mjs";
import * as $traenupi_core from "../traenupi_core.mjs";
import * as $state from "../traenupi_core/state.mjs";
import { meeting_status_to_string, driver_phase_to_string } from "../traenupi_core/state.mjs";
import * as $utils from "../traenupi_core/utils.mjs";
import { category_to_string, weakness_to_string } from "../traenupi_core/utils.mjs";

export function encode_string(s) {
  return ("\"" + s) + "\"";
}

export function encode_int(n) {
  return $int.to_string(n);
}

export function encode_bool(b) {
  if (b) {
    return "true";
  } else {
    return "false";
  }
}

export function encode_list(items) {
  return ("[" + $string.join(items, ",")) + "]";
}

export function encode_object(fields) {
  let encoded_fields = $list.map(
    fields,
    (field) => {
      let key;
      let value;
      key = field[0];
      value = field[1];
      return (encode_string(key) + ":") + value;
    },
  );
  return ("{" + $string.join(encoded_fields, ",")) + "}";
}

export function encode_option(encoder, opt) {
  if (opt instanceof Some) {
    let value = opt[0];
    return encoder(value);
  } else {
    return "null";
  }
}

export function encode_knowledge_entry(entry) {
  return encode_object(
    toList([
      ["key", encode_string(entry.key)],
      ["value", encode_string(entry.value)],
      ["category", encode_string(entry.category)],
      ["time", encode_int(entry.time)],
    ]),
  );
}

export function encode_task_step(step) {
  return encode_object(
    toList([
      ["index", encode_int(step.index)],
      ["description", encode_string(step.description)],
      ["verification", encode_list($list.map(step.verification, encode_string))],
      ["edge_cases", encode_list($list.map(step.edge_cases, encode_string))],
      ["completed", encode_bool(step.completed)],
    ]),
  );
}

export function encode_task(task) {
  return encode_object(
    toList([
      ["id", encode_string(task.id)],
      ["description", encode_string(task.description)],
      ["goal", encode_string(task.goal)],
      ["steps", encode_list($list.map(task.steps, encode_task_step))],
      ["created_at", encode_int(task.created_at)],
      ["updated_at", encode_int(task.updated_at)],
    ]),
  );
}

export function encode_meeting(meeting) {
  return encode_object(
    toList([
      ["id", encode_string(meeting.id)],
      ["topic", encode_string(meeting.topic)],
      ["status", encode_string(meeting_status_to_string(meeting.status))],
      ["created_by", encode_string(meeting.created_by)],
      ["created_at", encode_int(meeting.created_at)],
    ]),
  );
}

export function encode_meeting_opinion(opinion) {
  return encode_object(
    toList([
      ["id", encode_string(opinion.id)],
      ["meeting_id", encode_string(opinion.meeting_id)],
      ["author", encode_string(opinion.author)],
      ["perspective", encode_string(opinion.perspective)],
      ["position", encode_string(opinion.position)],
      ["created_at", encode_int(opinion.created_at)],
    ]),
  );
}

export function encode_mood_entry(mood) {
  return encode_object(
    toList([
      ["agent_id", encode_string(mood.agent_id)],
      ["mood", encode_string(mood.mood)],
      ["timestamp", encode_int(mood.timestamp)],
      ["context", encode_string(mood.context)],
    ]),
  );
}

export function encode_ai_presence(presence) {
  return encode_object(
    toList([
      ["agent_id", encode_string(presence.agent_id)],
      ["last_seen", encode_int(presence.last_seen)],
      ["status", encode_string(presence.status)],
      ["focus", encode_string(presence.focus)],
      ["project", encode_string(presence.project)],
    ]),
  );
}

export function encode_activity_stats(stats) {
  return encode_object(
    toList([
      ["questions_today", encode_int(stats.questions_today)],
      ["knowledge_stored", encode_int(stats.knowledge_stored)],
      ["meeting_opinions", encode_int(stats.meeting_opinions)],
      ["baby_ai_contributions", encode_int(stats.baby_ai_contributions)],
      ["reminders_triggered", encode_int(stats.reminders_triggered)],
    ]),
  );
}

export function encode_prompt(prompt) {
  return encode_object(
    toList([
      ["id", encode_string(prompt.id)],
      ["category", encode_string(category_to_string(prompt.category))],
      ["weakness", encode_option(weakness_to_string, prompt.weakness)],
      ["title", encode_string(prompt.title)],
      ["body", encode_string(prompt.body)],
      ["checklist", encode_list($list.map(prompt.checklist, encode_string))],
    ]),
  );
}

export function encode_driver_state(state) {
  return encode_object(
    toList([
      ["task", encode_option(encode_task, state.task)],
      ["current_step_index", encode_int(state.current_step_index)],
      ["prompts_emitted", encode_int(state.prompts_emitted)],
      ["last_prompt_time", encode_int(state.last_prompt_time)],
      ["phase", encode_string(driver_phase_to_string(state.phase))],
    ]),
  );
}
