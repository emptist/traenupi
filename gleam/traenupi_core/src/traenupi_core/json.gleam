import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

import traenupi_core.{
  type ActivityStats, type AIPresence, type DriverPhase, type DriverState,
  type KnowledgeEntry, type Meeting, type MeetingOpinion, type MeetingStatus,
  type MoodEntry, type Prompt, type PromptCategory, type Task, type TaskStep,
  type WeaknessType,
}
import traenupi_core/utils.{category_to_string, weakness_to_string}
import traenupi_core/state.{
  meeting_status_to_string, driver_phase_to_string,
}

pub fn encode_string(s: String) -> String {
  "\"" <> s <> "\""
}

pub fn encode_int(n: Int) -> String {
  int.to_string(n)
}

pub fn encode_bool(b: Bool) -> String {
  case b {
    True -> "true"
    False -> "false"
  }
}

pub fn encode_list(items: List(String)) -> String {
  "["
  <> string.join(items, ",")
  <> "]"
}

pub fn encode_object(fields: List(#(String, String))) -> String {
  let encoded_fields = list.map(fields, fn(field) {
    let #(key, value) = field
    encode_string(key) <> ":" <> value
  })
  "{"
  <> string.join(encoded_fields, ",")
  <> "}"
}

pub fn encode_option(encoder: fn(a) -> String, opt: Option(a)) -> String {
  case opt {
    Some(value) -> encoder(value)
    None -> "null"
  }
}

pub fn encode_knowledge_entry(entry: KnowledgeEntry) -> String {
  encode_object([
    #("key", encode_string(entry.key)),
    #("value", encode_string(entry.value)),
    #("category", encode_string(entry.category)),
    #("time", encode_int(entry.time)),
  ])
}

pub fn encode_task_step(step: TaskStep) -> String {
  encode_object([
    #("index", encode_int(step.index)),
    #("description", encode_string(step.description)),
    #("verification", encode_list(list.map(step.verification, encode_string))),
    #("edge_cases", encode_list(list.map(step.edge_cases, encode_string))),
    #("completed", encode_bool(step.completed)),
  ])
}

pub fn encode_task(task: Task) -> String {
  encode_object([
    #("id", encode_string(task.id)),
    #("description", encode_string(task.description)),
    #("goal", encode_string(task.goal)),
    #("steps", encode_list(list.map(task.steps, encode_task_step))),
    #("created_at", encode_int(task.created_at)),
    #("updated_at", encode_int(task.updated_at)),
  ])
}

pub fn encode_meeting(meeting: Meeting) -> String {
  encode_object([
    #("id", encode_string(meeting.id)),
    #("topic", encode_string(meeting.topic)),
    #("status", encode_string(meeting_status_to_string(meeting.status))),
    #("created_by", encode_string(meeting.created_by)),
    #("created_at", encode_int(meeting.created_at)),
  ])
}

pub fn encode_meeting_opinion(opinion: MeetingOpinion) -> String {
  encode_object([
    #("id", encode_string(opinion.id)),
    #("meeting_id", encode_string(opinion.meeting_id)),
    #("author", encode_string(opinion.author)),
    #("perspective", encode_string(opinion.perspective)),
    #("position", encode_string(opinion.position)),
    #("created_at", encode_int(opinion.created_at)),
  ])
}

pub fn encode_mood_entry(mood: MoodEntry) -> String {
  encode_object([
    #("agent_id", encode_string(mood.agent_id)),
    #("mood", encode_string(mood.mood)),
    #("timestamp", encode_int(mood.timestamp)),
    #("context", encode_string(mood.context)),
  ])
}

pub fn encode_ai_presence(presence: AIPresence) -> String {
  encode_object([
    #("agent_id", encode_string(presence.agent_id)),
    #("last_seen", encode_int(presence.last_seen)),
    #("status", encode_string(presence.status)),
    #("focus", encode_string(presence.focus)),
    #("project", encode_string(presence.project)),
  ])
}

pub fn encode_activity_stats(stats: ActivityStats) -> String {
  encode_object([
    #("questions_today", encode_int(stats.questions_today)),
    #("knowledge_stored", encode_int(stats.knowledge_stored)),
    #("meeting_opinions", encode_int(stats.meeting_opinions)),
    #("baby_ai_contributions", encode_int(stats.baby_ai_contributions)),
    #("reminders_triggered", encode_int(stats.reminders_triggered)),
  ])
}

pub fn encode_prompt(prompt: Prompt) -> String {
  encode_object([
    #("id", encode_string(prompt.id)),
    #("category", encode_string(category_to_string(prompt.category))),
    #("weakness", encode_option(weakness_to_string, prompt.weakness)),
    #("title", encode_string(prompt.title)),
    #("body", encode_string(prompt.body)),
    #("checklist", encode_list(list.map(prompt.checklist, encode_string))),
  ])
}

pub fn encode_driver_state(state: DriverState) -> String {
  encode_object([
    #("task", encode_option(encode_task, state.task)),
    #("current_step_index", encode_int(state.current_step_index)),
    #("prompts_emitted", encode_int(state.prompts_emitted)),
    #("last_prompt_time", encode_int(state.last_prompt_time)),
    #("phase", encode_string(driver_phase_to_string(state.phase))),
  ])
}
