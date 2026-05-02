import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}

import traenupi_core.{
  type ActivityStats, type AIPresence, type DriverPhase, type DriverState,
  type Meeting, type MeetingOpinion, type MeetingStatus, type MoodEntry,
  type Task, type TaskStep,
  ActivityStats, DriverState, MeetingActive, MeetingClosed, MeetingPending,
}

pub fn new_activity_stats() -> ActivityStats {
  ActivityStats(
    questions_today: 0,
    knowledge_stored: 0,
    meeting_opinions: 0,
    baby_ai_contributions: 0,
    reminders_triggered: 0,
  )
}

pub fn increment_questions(stats: ActivityStats) -> ActivityStats {
  ActivityStats(..stats, questions_today: stats.questions_today + 1)
}

pub fn increment_knowledge(stats: ActivityStats) -> ActivityStats {
  ActivityStats(..stats, knowledge_stored: stats.knowledge_stored + 1)
}

pub fn increment_meeting_opinions(stats: ActivityStats) -> ActivityStats {
  ActivityStats(..stats, meeting_opinions: stats.meeting_opinions + 1)
}

pub fn increment_baby_ai(stats: ActivityStats) -> ActivityStats {
  ActivityStats(..stats, baby_ai_contributions: stats.baby_ai_contributions + 1)
}

pub fn increment_reminders(stats: ActivityStats) -> ActivityStats {
  ActivityStats(..stats, reminders_triggered: stats.reminders_triggered + 1)
}

pub fn total_activity(stats: ActivityStats) -> Int {
  stats.questions_today
  + stats.knowledge_stored
  + stats.meeting_opinions
  + stats.baby_ai_contributions
  + stats.reminders_triggered
}

pub fn meeting_status_to_string(status: MeetingStatus) -> String {
  case status {
    MeetingActive -> "active"
    MeetingClosed -> "closed"
    MeetingPending -> "pending"
  }
}

pub fn meeting_status_from_string(s: String) -> Option(MeetingStatus) {
  case s {
    "active" -> Some(MeetingActive)
    "closed" -> Some(MeetingClosed)
    "pending" -> Some(MeetingPending)
    _ -> None
  }
}

pub fn driver_phase_to_string(phase: DriverPhase) -> String {
  case phase {
    traenupi_core.Planning -> "planning"
    traenupi_core.Executing -> "executing"
    traenupi_core.Paused -> "paused"
    traenupi_core.Completed -> "completed"
  }
}

pub fn driver_phase_from_string(s: String) -> Option(DriverPhase) {
  case s {
    "planning" -> Some(traenupi_core.Planning)
    "executing" -> Some(traenupi_core.Executing)
    "paused" -> Some(traenupi_core.Paused)
    "completed" -> Some(traenupi_core.Completed)
    _ -> None
  }
}

pub fn new_driver_state() -> DriverState {
  DriverState(
    task: None,
    current_step_index: 0,
    prompts_emitted: 0,
    last_prompt_time: 0,
    phase: traenupi_core.Planning,
  )
}

pub fn advance_step(state: DriverState) -> DriverState {
  DriverState(..state, current_step_index: state.current_step_index + 1)
}

pub fn set_phase(state: DriverState, phase: DriverPhase) -> DriverState {
  DriverState(..state, phase: phase)
}

pub fn increment_prompts(state: DriverState, current_time: Int) -> DriverState {
  DriverState(
    ..state,
    prompts_emitted: state.prompts_emitted + 1,
    last_prompt_time: current_time,
  )
}

pub fn set_task(state: DriverState, task: Task) -> DriverState {
  DriverState(..state, task: Some(task), current_step_index: 0)
}

pub fn clear_task(state: DriverState) -> DriverState {
  DriverState(
    ..state,
    task: None,
    current_step_index: 0,
    phase: traenupi_core.Planning,
  )
}

pub fn current_step(state: DriverState) -> Option(TaskStep) {
  case state.task {
    Some(task) -> {
      let steps = task.steps
      find_step(steps, state.current_step_index, 0)
    }
    None -> None
  }
}

fn find_step(steps: List(TaskStep), target: Int, current: Int) -> Option(TaskStep) {
  case steps {
    [] -> None
    [first, ..rest] -> {
      case current == target {
        True -> Some(first)
        False -> find_step(rest, target, current + 1)
      }
    }
  }
}

pub fn task_progress(state: DriverState) -> String {
  case state.task {
    Some(task) -> {
      let total = list.length(task.steps)
      let current = state.current_step_index + 1
      int.to_string(current) <> "/" <> int.to_string(total)
    }
    None -> "0/0"
  }
}

pub fn is_task_complete(state: DriverState) -> Bool {
  case state.task {
    Some(task) -> {
      let total = list.length(task.steps)
      state.current_step_index >= total
    }
    None -> True
  }
}

pub fn format_presence(presence: AIPresence) -> String {
  presence.agent_id
  <> " | "
  <> presence.status
  <> " | "
  <> presence.focus
  <> " @ "
  <> presence.project
}

pub fn format_mood(mood: MoodEntry) -> String {
  mood.agent_id
  <> " feels "
  <> mood.mood
  <> " ("
  <> mood.context
  <> ")"
}

pub fn format_meeting(meeting: Meeting) -> String {
  meeting.topic
  <> " ["
  <> meeting_status_to_string(meeting.status)
  <> "] by "
  <> meeting.created_by
}

pub fn format_opinion(opinion: MeetingOpinion) -> String {
  opinion.author
  <> ": "
  <> opinion.perspective
  <> " ("
  <> opinion.position
  <> ")"
}

pub fn summarize_stats(stats: ActivityStats) -> String {
  "Activity: "
  <> int.to_string(stats.questions_today)
  <> " questions, "
  <> int.to_string(stats.knowledge_stored)
  <> " knowledge, "
  <> int.to_string(stats.meeting_opinions)
  <> " opinions, "
  <> int.to_string(stats.baby_ai_contributions)
  <> " baby-ai, "
  <> int.to_string(stats.reminders_triggered)
  <> " reminders"
}
