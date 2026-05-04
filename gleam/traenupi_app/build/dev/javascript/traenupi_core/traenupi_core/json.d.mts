import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";
import type * as $traenupi_core from "../traenupi_core.d.mts";

export function encode_string(s: string): string;

export function encode_int(n: number): string;

export function encode_bool(b: boolean): string;

export function encode_list(items: _.List<string>): string;

export function encode_object(fields: _.List<[string, string]>): string;

export function encode_option<HZY>(
  encoder: (x0: HZY) => string,
  opt: $option.Option$<HZY>
): string;

export function encode_knowledge_entry(entry: $traenupi_core.KnowledgeEntry$): string;

export function encode_task_step(step: $traenupi_core.TaskStep$): string;

export function encode_task(task: $traenupi_core.Task$): string;

export function encode_meeting(meeting: $traenupi_core.Meeting$): string;

export function encode_meeting_opinion(opinion: $traenupi_core.MeetingOpinion$): string;

export function encode_mood_entry(mood: $traenupi_core.MoodEntry$): string;

export function encode_ai_presence(presence: $traenupi_core.AIPresence$): string;

export function encode_activity_stats(stats: $traenupi_core.ActivityStats$): string;

export function encode_prompt(prompt: $traenupi_core.Prompt$): string;

export function encode_driver_state(state: $traenupi_core.DriverState$): string;
