import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as $traenupi_core from "../traenupi_core.d.mts";

export function new_activity_stats(): $traenupi_core.ActivityStats$;

export function increment_questions(stats: $traenupi_core.ActivityStats$): $traenupi_core.ActivityStats$;

export function increment_knowledge(stats: $traenupi_core.ActivityStats$): $traenupi_core.ActivityStats$;

export function increment_meeting_opinions(stats: $traenupi_core.ActivityStats$): $traenupi_core.ActivityStats$;

export function increment_baby_ai(stats: $traenupi_core.ActivityStats$): $traenupi_core.ActivityStats$;

export function increment_reminders(stats: $traenupi_core.ActivityStats$): $traenupi_core.ActivityStats$;

export function total_activity(stats: $traenupi_core.ActivityStats$): number;

export function meeting_status_to_string(status: $traenupi_core.MeetingStatus$): string;

export function meeting_status_from_string(s: string): $option.Option$<
  $traenupi_core.MeetingStatus$
>;

export function driver_phase_to_string(phase: $traenupi_core.DriverPhase$): string;

export function driver_phase_from_string(s: string): $option.Option$<
  $traenupi_core.DriverPhase$
>;

export function new_driver_state(): $traenupi_core.DriverState$;

export function advance_step(state: $traenupi_core.DriverState$): $traenupi_core.DriverState$;

export function set_phase(
  state: $traenupi_core.DriverState$,
  phase: $traenupi_core.DriverPhase$
): $traenupi_core.DriverState$;

export function increment_prompts(
  state: $traenupi_core.DriverState$,
  current_time: number
): $traenupi_core.DriverState$;

export function set_task(
  state: $traenupi_core.DriverState$,
  task: $traenupi_core.Task$
): $traenupi_core.DriverState$;

export function clear_task(state: $traenupi_core.DriverState$): $traenupi_core.DriverState$;

export function current_step(state: $traenupi_core.DriverState$): $option.Option$<
  $traenupi_core.TaskStep$
>;

export function task_progress(state: $traenupi_core.DriverState$): string;

export function is_task_complete(state: $traenupi_core.DriverState$): boolean;

export function format_presence(presence: $traenupi_core.AIPresence$): string;

export function format_mood(mood: $traenupi_core.MoodEntry$): string;

export function format_meeting(meeting: $traenupi_core.Meeting$): string;

export function format_opinion(opinion: $traenupi_core.MeetingOpinion$): string;

export function summarize_stats(stats: $traenupi_core.ActivityStats$): string;
