/// <reference types="./state.d.mts" />
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import { Empty as $Empty } from "../gleam.mjs";
import * as $traenupi_core from "../traenupi_core.mjs";
import {
  ActivityStats,
  DriverState,
  MeetingActive,
  MeetingClosed,
  MeetingPending,
} from "../traenupi_core.mjs";

export function new_activity_stats() {
  return new ActivityStats(0, 0, 0, 0, 0);
}

export function increment_questions(stats) {
  return new ActivityStats(
    stats.questions_today + 1,
    stats.knowledge_stored,
    stats.meeting_opinions,
    stats.baby_ai_contributions,
    stats.reminders_triggered,
  );
}

export function increment_knowledge(stats) {
  return new ActivityStats(
    stats.questions_today,
    stats.knowledge_stored + 1,
    stats.meeting_opinions,
    stats.baby_ai_contributions,
    stats.reminders_triggered,
  );
}

export function increment_meeting_opinions(stats) {
  return new ActivityStats(
    stats.questions_today,
    stats.knowledge_stored,
    stats.meeting_opinions + 1,
    stats.baby_ai_contributions,
    stats.reminders_triggered,
  );
}

export function increment_baby_ai(stats) {
  return new ActivityStats(
    stats.questions_today,
    stats.knowledge_stored,
    stats.meeting_opinions,
    stats.baby_ai_contributions + 1,
    stats.reminders_triggered,
  );
}

export function increment_reminders(stats) {
  return new ActivityStats(
    stats.questions_today,
    stats.knowledge_stored,
    stats.meeting_opinions,
    stats.baby_ai_contributions,
    stats.reminders_triggered + 1,
  );
}

export function total_activity(stats) {
  return (((stats.questions_today + stats.knowledge_stored) + stats.meeting_opinions) + stats.baby_ai_contributions) + stats.reminders_triggered;
}

export function meeting_status_to_string(status) {
  if (status instanceof MeetingActive) {
    return "active";
  } else if (status instanceof MeetingClosed) {
    return "closed";
  } else {
    return "pending";
  }
}

export function meeting_status_from_string(s) {
  if (s === "active") {
    return new Some(new MeetingActive());
  } else if (s === "closed") {
    return new Some(new MeetingClosed());
  } else if (s === "pending") {
    return new Some(new MeetingPending());
  } else {
    return new None();
  }
}

export function driver_phase_to_string(phase) {
  if (phase instanceof $traenupi_core.Planning) {
    return "planning";
  } else if (phase instanceof $traenupi_core.Executing) {
    return "executing";
  } else if (phase instanceof $traenupi_core.Paused) {
    return "paused";
  } else {
    return "completed";
  }
}

export function driver_phase_from_string(s) {
  if (s === "planning") {
    return new Some(new $traenupi_core.Planning());
  } else if (s === "executing") {
    return new Some(new $traenupi_core.Executing());
  } else if (s === "paused") {
    return new Some(new $traenupi_core.Paused());
  } else if (s === "completed") {
    return new Some(new $traenupi_core.Completed());
  } else {
    return new None();
  }
}

export function new_driver_state() {
  return new DriverState(new None(), 0, 0, 0, new $traenupi_core.Planning());
}

export function advance_step(state) {
  return new DriverState(
    state.task,
    state.current_step_index + 1,
    state.prompts_emitted,
    state.last_prompt_time,
    state.phase,
  );
}

export function set_phase(state, phase) {
  return new DriverState(
    state.task,
    state.current_step_index,
    state.prompts_emitted,
    state.last_prompt_time,
    phase,
  );
}

export function increment_prompts(state, current_time) {
  return new DriverState(
    state.task,
    state.current_step_index,
    state.prompts_emitted + 1,
    current_time,
    state.phase,
  );
}

export function set_task(state, task) {
  return new DriverState(
    new Some(task),
    0,
    state.prompts_emitted,
    state.last_prompt_time,
    state.phase,
  );
}

export function clear_task(state) {
  return new DriverState(
    new None(),
    0,
    state.prompts_emitted,
    state.last_prompt_time,
    new $traenupi_core.Planning(),
  );
}

function find_step(loop$steps, loop$target, loop$current) {
  while (true) {
    let steps = loop$steps;
    let target = loop$target;
    let current = loop$current;
    if (steps instanceof $Empty) {
      return new None();
    } else {
      let first = steps.head;
      let rest = steps.tail;
      let $ = current === target;
      if ($) {
        return new Some(first);
      } else {
        loop$steps = rest;
        loop$target = target;
        loop$current = current + 1;
      }
    }
  }
}

export function current_step(state) {
  let $ = state.task;
  if ($ instanceof Some) {
    let task = $[0];
    let steps = task.steps;
    return find_step(steps, state.current_step_index, 0);
  } else {
    return $;
  }
}

export function task_progress(state) {
  let $ = state.task;
  if ($ instanceof Some) {
    let task = $[0];
    let total = $list.length(task.steps);
    let current = state.current_step_index + 1;
    return ($int.to_string(current) + "/") + $int.to_string(total);
  } else {
    return "0/0";
  }
}

export function is_task_complete(state) {
  let $ = state.task;
  if ($ instanceof Some) {
    let task = $[0];
    let total = $list.length(task.steps);
    return state.current_step_index >= total;
  } else {
    return true;
  }
}

export function format_presence(presence) {
  return (((((presence.agent_id + " | ") + presence.status) + " | ") + presence.focus) + " @ ") + presence.project;
}

export function format_mood(mood) {
  return ((((mood.agent_id + " feels ") + mood.mood) + " (") + mood.context) + ")";
}

export function format_meeting(meeting) {
  return (((meeting.topic + " [") + meeting_status_to_string(meeting.status)) + "] by ") + meeting.created_by;
}

export function format_opinion(opinion) {
  return ((((opinion.author + ": ") + opinion.perspective) + " (") + opinion.position) + ")";
}

export function summarize_stats(stats) {
  return ((((((((("Activity: " + $int.to_string(stats.questions_today)) + " questions, ") + $int.to_string(
    stats.knowledge_stored,
  )) + " knowledge, ") + $int.to_string(stats.meeting_opinions)) + " opinions, ") + $int.to_string(
    stats.baby_ai_contributions,
  )) + " baby-ai, ") + $int.to_string(stats.reminders_triggered)) + " reminders";
}
