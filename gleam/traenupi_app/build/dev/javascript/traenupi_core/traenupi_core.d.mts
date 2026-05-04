import type * as $option from "../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "./gleam.d.mts";

export class Action extends _.CustomType {}
export function PromptCategory$Action(): PromptCategory$;
export function PromptCategory$isAction(value: PromptCategory$): boolean;

export class Verify extends _.CustomType {}
export function PromptCategory$Verify(): PromptCategory$;
export function PromptCategory$isVerify(value: PromptCategory$): boolean;

export class Reflect extends _.CustomType {}
export function PromptCategory$Reflect(): PromptCategory$;
export function PromptCategory$isReflect(value: PromptCategory$): boolean;

export class AntiWeakness extends _.CustomType {}
export function PromptCategory$AntiWeakness(): PromptCategory$;
export function PromptCategory$isAntiWeakness(value: PromptCategory$): boolean;

export class Checkpoint extends _.CustomType {}
export function PromptCategory$Checkpoint(): PromptCategory$;
export function PromptCategory$isCheckpoint(value: PromptCategory$): boolean;

export class Completion extends _.CustomType {}
export function PromptCategory$Completion(): PromptCategory$;
export function PromptCategory$isCompletion(value: PromptCategory$): boolean;

export type PromptCategory$ = Action | Verify | Reflect | AntiWeakness | Checkpoint | Completion;

export class ContextLoss extends _.CustomType {}
export function WeaknessType$ContextLoss(): WeaknessType$;
export function WeaknessType$isContextLoss(value: WeaknessType$): boolean;

export class IncompleteFollowThrough extends _.CustomType {}
export function WeaknessType$IncompleteFollowThrough(): WeaknessType$;
export function WeaknessType$isIncompleteFollowThrough(
  value: WeaknessType$,
): boolean;

export class PlanningDrift extends _.CustomType {}
export function WeaknessType$PlanningDrift(): WeaknessType$;
export function WeaknessType$isPlanningDrift(value: WeaknessType$): boolean;

export class ErrorAmnesia extends _.CustomType {}
export function WeaknessType$ErrorAmnesia(): WeaknessType$;
export function WeaknessType$isErrorAmnesia(value: WeaknessType$): boolean;

export class VerificationNeglect extends _.CustomType {}
export function WeaknessType$VerificationNeglect(): WeaknessType$;
export function WeaknessType$isVerificationNeglect(
  value: WeaknessType$,
): boolean;

export class EdgeCaseBlindness extends _.CustomType {}
export function WeaknessType$EdgeCaseBlindness(): WeaknessType$;
export function WeaknessType$isEdgeCaseBlindness(value: WeaknessType$): boolean;

export class QualityDrift extends _.CustomType {}
export function WeaknessType$QualityDrift(): WeaknessType$;
export function WeaknessType$isQualityDrift(value: WeaknessType$): boolean;

export class VerificationGap extends _.CustomType {}
export function WeaknessType$VerificationGap(): WeaknessType$;
export function WeaknessType$isVerificationGap(value: WeaknessType$): boolean;

export class Overconfidence extends _.CustomType {}
export function WeaknessType$Overconfidence(): WeaknessType$;
export function WeaknessType$isOverconfidence(value: WeaknessType$): boolean;

export class ScopeCreep extends _.CustomType {}
export function WeaknessType$ScopeCreep(): WeaknessType$;
export function WeaknessType$isScopeCreep(value: WeaknessType$): boolean;

export type WeaknessType$ = ContextLoss | IncompleteFollowThrough | PlanningDrift | ErrorAmnesia | VerificationNeglect | EdgeCaseBlindness | QualityDrift | VerificationGap | Overconfidence | ScopeCreep;

export class Prompt extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    category: PromptCategory$,
    weakness: $option.Option$<WeaknessType$>,
    title: string,
    body: string,
    checklist: _.List<string>
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  category: PromptCategory$;
  /** @deprecated */
  weakness: $option.Option$<WeaknessType$>;
  /** @deprecated */
  title: string;
  /** @deprecated */
  body: string;
  /** @deprecated */
  checklist: _.List<string>;
}
export function Prompt$Prompt(
  id: string,
  category: PromptCategory$,
  weakness: $option.Option$<WeaknessType$>,
  title: string,
  body: string,
  checklist: _.List<string>,
): Prompt$;
export function Prompt$isPrompt(value: Prompt$): boolean;
export function Prompt$Prompt$0(value: Prompt$): string;
export function Prompt$Prompt$id(value: Prompt$): string;
export function Prompt$Prompt$1(value: Prompt$): PromptCategory$;
export function Prompt$Prompt$category(value: Prompt$): PromptCategory$;
export function Prompt$Prompt$2(value: Prompt$): $option.Option$<WeaknessType$>;
export function Prompt$Prompt$weakness(value: Prompt$): $option.Option$<
  WeaknessType$
>;
export function Prompt$Prompt$3(value: Prompt$): string;
export function Prompt$Prompt$title(value: Prompt$): string;
export function Prompt$Prompt$4(value: Prompt$): string;
export function Prompt$Prompt$body(value: Prompt$): string;
export function Prompt$Prompt$5(value: Prompt$): _.List<string>;
export function Prompt$Prompt$checklist(value: Prompt$): _.List<string>;

export type Prompt$ = Prompt;

export class TaskStep extends _.CustomType {
  /** @deprecated */
  constructor(
    index: number,
    description: string,
    verification: _.List<string>,
    edge_cases: _.List<string>,
    completed: boolean
  );
  /** @deprecated */
  index: number;
  /** @deprecated */
  description: string;
  /** @deprecated */
  verification: _.List<string>;
  /** @deprecated */
  edge_cases: _.List<string>;
  /** @deprecated */
  completed: boolean;
}
export function TaskStep$TaskStep(
  index: number,
  description: string,
  verification: _.List<string>,
  edge_cases: _.List<string>,
  completed: boolean,
): TaskStep$;
export function TaskStep$isTaskStep(value: TaskStep$): boolean;
export function TaskStep$TaskStep$0(value: TaskStep$): number;
export function TaskStep$TaskStep$index(value: TaskStep$): number;
export function TaskStep$TaskStep$1(value: TaskStep$): string;
export function TaskStep$TaskStep$description(value: TaskStep$): string;
export function TaskStep$TaskStep$2(value: TaskStep$): _.List<string>;
export function TaskStep$TaskStep$verification(value: TaskStep$): _.List<string>;
export function TaskStep$TaskStep$3(
  value: TaskStep$,
): _.List<string>;
export function TaskStep$TaskStep$edge_cases(value: TaskStep$): _.List<string>;
export function TaskStep$TaskStep$4(value: TaskStep$): boolean;
export function TaskStep$TaskStep$completed(value: TaskStep$): boolean;

export type TaskStep$ = TaskStep;

export class Task extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    description: string,
    goal: string,
    steps: _.List<TaskStep$>,
    created_at: number,
    updated_at: number
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  description: string;
  /** @deprecated */
  goal: string;
  /** @deprecated */
  steps: _.List<TaskStep$>;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  updated_at: number;
}
export function Task$Task(
  id: string,
  description: string,
  goal: string,
  steps: _.List<TaskStep$>,
  created_at: number,
  updated_at: number,
): Task$;
export function Task$isTask(value: Task$): boolean;
export function Task$Task$0(value: Task$): string;
export function Task$Task$id(value: Task$): string;
export function Task$Task$1(value: Task$): string;
export function Task$Task$description(value: Task$): string;
export function Task$Task$2(value: Task$): string;
export function Task$Task$goal(value: Task$): string;
export function Task$Task$3(value: Task$): _.List<TaskStep$>;
export function Task$Task$steps(value: Task$): _.List<TaskStep$>;
export function Task$Task$4(value: Task$): number;
export function Task$Task$created_at(value: Task$): number;
export function Task$Task$5(value: Task$): number;
export function Task$Task$updated_at(value: Task$): number;

export type Task$ = Task;

export class KnowledgeEntry extends _.CustomType {
  /** @deprecated */
  constructor(key: string, value: string, category: string, time: number);
  /** @deprecated */
  key: string;
  /** @deprecated */
  value: string;
  /** @deprecated */
  category: string;
  /** @deprecated */
  time: number;
}
export function KnowledgeEntry$KnowledgeEntry(
  key: string,
  value: string,
  category: string,
  time: number,
): KnowledgeEntry$;
export function KnowledgeEntry$isKnowledgeEntry(
  value: KnowledgeEntry$,
): boolean;
export function KnowledgeEntry$KnowledgeEntry$0(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$key(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$1(
  value: KnowledgeEntry$,
): string;
export function KnowledgeEntry$KnowledgeEntry$value(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$2(
  value: KnowledgeEntry$,
): string;
export function KnowledgeEntry$KnowledgeEntry$category(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$3(
  value: KnowledgeEntry$,
): number;
export function KnowledgeEntry$KnowledgeEntry$time(value: KnowledgeEntry$): number;

export type KnowledgeEntry$ = KnowledgeEntry;

export class MeetingActive extends _.CustomType {}
export function MeetingStatus$MeetingActive(): MeetingStatus$;
export function MeetingStatus$isMeetingActive(value: MeetingStatus$): boolean;

export class MeetingClosed extends _.CustomType {}
export function MeetingStatus$MeetingClosed(): MeetingStatus$;
export function MeetingStatus$isMeetingClosed(value: MeetingStatus$): boolean;

export class MeetingPending extends _.CustomType {}
export function MeetingStatus$MeetingPending(): MeetingStatus$;
export function MeetingStatus$isMeetingPending(value: MeetingStatus$): boolean;

export type MeetingStatus$ = MeetingActive | MeetingClosed | MeetingPending;

export class Meeting extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    topic: string,
    status: MeetingStatus$,
    created_by: string,
    created_at: number
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  topic: string;
  /** @deprecated */
  status: MeetingStatus$;
  /** @deprecated */
  created_by: string;
  /** @deprecated */
  created_at: number;
}
export function Meeting$Meeting(
  id: string,
  topic: string,
  status: MeetingStatus$,
  created_by: string,
  created_at: number,
): Meeting$;
export function Meeting$isMeeting(value: Meeting$): boolean;
export function Meeting$Meeting$0(value: Meeting$): string;
export function Meeting$Meeting$id(value: Meeting$): string;
export function Meeting$Meeting$1(value: Meeting$): string;
export function Meeting$Meeting$topic(value: Meeting$): string;
export function Meeting$Meeting$2(value: Meeting$): MeetingStatus$;
export function Meeting$Meeting$status(value: Meeting$): MeetingStatus$;
export function Meeting$Meeting$3(value: Meeting$): string;
export function Meeting$Meeting$created_by(value: Meeting$): string;
export function Meeting$Meeting$4(value: Meeting$): number;
export function Meeting$Meeting$created_at(value: Meeting$): number;

export type Meeting$ = Meeting;

export class MeetingOpinion extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    meeting_id: string,
    author: string,
    perspective: string,
    position: string,
    created_at: number
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  meeting_id: string;
  /** @deprecated */
  author: string;
  /** @deprecated */
  perspective: string;
  /** @deprecated */
  position: string;
  /** @deprecated */
  created_at: number;
}
export function MeetingOpinion$MeetingOpinion(
  id: string,
  meeting_id: string,
  author: string,
  perspective: string,
  position: string,
  created_at: number,
): MeetingOpinion$;
export function MeetingOpinion$isMeetingOpinion(
  value: MeetingOpinion$,
): boolean;
export function MeetingOpinion$MeetingOpinion$0(value: MeetingOpinion$): string;
export function MeetingOpinion$MeetingOpinion$id(value: MeetingOpinion$): string;
export function MeetingOpinion$MeetingOpinion$1(
  value: MeetingOpinion$,
): string;
export function MeetingOpinion$MeetingOpinion$meeting_id(value: MeetingOpinion$): string;
export function MeetingOpinion$MeetingOpinion$2(
  value: MeetingOpinion$,
): string;
export function MeetingOpinion$MeetingOpinion$author(value: MeetingOpinion$): string;
export function MeetingOpinion$MeetingOpinion$3(
  value: MeetingOpinion$,
): string;
export function MeetingOpinion$MeetingOpinion$perspective(value: MeetingOpinion$): string;
export function MeetingOpinion$MeetingOpinion$4(
  value: MeetingOpinion$,
): string;
export function MeetingOpinion$MeetingOpinion$position(value: MeetingOpinion$): string;
export function MeetingOpinion$MeetingOpinion$5(
  value: MeetingOpinion$,
): number;
export function MeetingOpinion$MeetingOpinion$created_at(value: MeetingOpinion$): number;

export type MeetingOpinion$ = MeetingOpinion;

export class Reminder extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    message: string,
    trigger_at: number,
    triggered: boolean
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  message: string;
  /** @deprecated */
  trigger_at: number;
  /** @deprecated */
  triggered: boolean;
}
export function Reminder$Reminder(
  id: string,
  message: string,
  trigger_at: number,
  triggered: boolean,
): Reminder$;
export function Reminder$isReminder(value: Reminder$): boolean;
export function Reminder$Reminder$0(value: Reminder$): string;
export function Reminder$Reminder$id(value: Reminder$): string;
export function Reminder$Reminder$1(value: Reminder$): string;
export function Reminder$Reminder$message(value: Reminder$): string;
export function Reminder$Reminder$2(value: Reminder$): number;
export function Reminder$Reminder$trigger_at(value: Reminder$): number;
export function Reminder$Reminder$3(value: Reminder$): boolean;
export function Reminder$Reminder$triggered(value: Reminder$): boolean;

export type Reminder$ = Reminder;

export class Bookmark extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    meeting_id: string,
    opinion_id: string,
    author: string,
    perspective: string,
    note: string,
    created_at: number
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  meeting_id: string;
  /** @deprecated */
  opinion_id: string;
  /** @deprecated */
  author: string;
  /** @deprecated */
  perspective: string;
  /** @deprecated */
  note: string;
  /** @deprecated */
  created_at: number;
}
export function Bookmark$Bookmark(
  id: string,
  meeting_id: string,
  opinion_id: string,
  author: string,
  perspective: string,
  note: string,
  created_at: number,
): Bookmark$;
export function Bookmark$isBookmark(value: Bookmark$): boolean;
export function Bookmark$Bookmark$0(value: Bookmark$): string;
export function Bookmark$Bookmark$id(value: Bookmark$): string;
export function Bookmark$Bookmark$1(value: Bookmark$): string;
export function Bookmark$Bookmark$meeting_id(value: Bookmark$): string;
export function Bookmark$Bookmark$2(value: Bookmark$): string;
export function Bookmark$Bookmark$opinion_id(value: Bookmark$): string;
export function Bookmark$Bookmark$3(value: Bookmark$): string;
export function Bookmark$Bookmark$author(value: Bookmark$): string;
export function Bookmark$Bookmark$4(value: Bookmark$): string;
export function Bookmark$Bookmark$perspective(value: Bookmark$): string;
export function Bookmark$Bookmark$5(value: Bookmark$): string;
export function Bookmark$Bookmark$note(value: Bookmark$): string;
export function Bookmark$Bookmark$6(value: Bookmark$): number;
export function Bookmark$Bookmark$created_at(value: Bookmark$): number;

export type Bookmark$ = Bookmark;

export class MoodEntry extends _.CustomType {
  /** @deprecated */
  constructor(
    agent_id: string,
    mood: string,
    timestamp: number,
    context: string
  );
  /** @deprecated */
  agent_id: string;
  /** @deprecated */
  mood: string;
  /** @deprecated */
  timestamp: number;
  /** @deprecated */
  context: string;
}
export function MoodEntry$MoodEntry(
  agent_id: string,
  mood: string,
  timestamp: number,
  context: string,
): MoodEntry$;
export function MoodEntry$isMoodEntry(value: MoodEntry$): boolean;
export function MoodEntry$MoodEntry$0(value: MoodEntry$): string;
export function MoodEntry$MoodEntry$agent_id(value: MoodEntry$): string;
export function MoodEntry$MoodEntry$1(value: MoodEntry$): string;
export function MoodEntry$MoodEntry$mood(value: MoodEntry$): string;
export function MoodEntry$MoodEntry$2(value: MoodEntry$): number;
export function MoodEntry$MoodEntry$timestamp(value: MoodEntry$): number;
export function MoodEntry$MoodEntry$3(value: MoodEntry$): string;
export function MoodEntry$MoodEntry$context(value: MoodEntry$): string;

export type MoodEntry$ = MoodEntry;

export class AIPresence extends _.CustomType {
  /** @deprecated */
  constructor(
    agent_id: string,
    last_seen: number,
    status: string,
    focus: string,
    project: string
  );
  /** @deprecated */
  agent_id: string;
  /** @deprecated */
  last_seen: number;
  /** @deprecated */
  status: string;
  /** @deprecated */
  focus: string;
  /** @deprecated */
  project: string;
}
export function AIPresence$AIPresence(
  agent_id: string,
  last_seen: number,
  status: string,
  focus: string,
  project: string,
): AIPresence$;
export function AIPresence$isAIPresence(value: AIPresence$): boolean;
export function AIPresence$AIPresence$0(value: AIPresence$): string;
export function AIPresence$AIPresence$agent_id(value: AIPresence$): string;
export function AIPresence$AIPresence$1(value: AIPresence$): number;
export function AIPresence$AIPresence$last_seen(value: AIPresence$): number;
export function AIPresence$AIPresence$2(value: AIPresence$): string;
export function AIPresence$AIPresence$status(value: AIPresence$): string;
export function AIPresence$AIPresence$3(value: AIPresence$): string;
export function AIPresence$AIPresence$focus(value: AIPresence$): string;
export function AIPresence$AIPresence$4(value: AIPresence$): string;
export function AIPresence$AIPresence$project(value: AIPresence$): string;

export type AIPresence$ = AIPresence;

export class ActivityStats extends _.CustomType {
  /** @deprecated */
  constructor(
    questions_today: number,
    knowledge_stored: number,
    meeting_opinions: number,
    baby_ai_contributions: number,
    reminders_triggered: number
  );
  /** @deprecated */
  questions_today: number;
  /** @deprecated */
  knowledge_stored: number;
  /** @deprecated */
  meeting_opinions: number;
  /** @deprecated */
  baby_ai_contributions: number;
  /** @deprecated */
  reminders_triggered: number;
}
export function ActivityStats$ActivityStats(
  questions_today: number,
  knowledge_stored: number,
  meeting_opinions: number,
  baby_ai_contributions: number,
  reminders_triggered: number,
): ActivityStats$;
export function ActivityStats$isActivityStats(value: ActivityStats$): boolean;
export function ActivityStats$ActivityStats$0(value: ActivityStats$): number;
export function ActivityStats$ActivityStats$questions_today(value: ActivityStats$): number;
export function ActivityStats$ActivityStats$1(
  value: ActivityStats$,
): number;
export function ActivityStats$ActivityStats$knowledge_stored(value: ActivityStats$): number;
export function ActivityStats$ActivityStats$2(
  value: ActivityStats$,
): number;
export function ActivityStats$ActivityStats$meeting_opinions(value: ActivityStats$): number;
export function ActivityStats$ActivityStats$3(
  value: ActivityStats$,
): number;
export function ActivityStats$ActivityStats$baby_ai_contributions(value: ActivityStats$): number;
export function ActivityStats$ActivityStats$4(
  value: ActivityStats$,
): number;
export function ActivityStats$ActivityStats$reminders_triggered(value: ActivityStats$): number;

export type ActivityStats$ = ActivityStats;

export class ConversationItem extends _.CustomType {
  /** @deprecated */
  constructor(question: string, answer: string, time: number);
  /** @deprecated */
  question: string;
  /** @deprecated */
  answer: string;
  /** @deprecated */
  time: number;
}
export function ConversationItem$ConversationItem(
  question: string,
  answer: string,
  time: number,
): ConversationItem$;
export function ConversationItem$isConversationItem(
  value: ConversationItem$,
): boolean;
export function ConversationItem$ConversationItem$0(value: ConversationItem$): string;
export function ConversationItem$ConversationItem$question(
  value: ConversationItem$,
): string;
export function ConversationItem$ConversationItem$1(value: ConversationItem$): string;
export function ConversationItem$ConversationItem$answer(
  value: ConversationItem$,
): string;
export function ConversationItem$ConversationItem$2(value: ConversationItem$): number;
export function ConversationItem$ConversationItem$time(
  value: ConversationItem$,
): number;

export type ConversationItem$ = ConversationItem;

export class Planning extends _.CustomType {}
export function DriverPhase$Planning(): DriverPhase$;
export function DriverPhase$isPlanning(value: DriverPhase$): boolean;

export class Executing extends _.CustomType {}
export function DriverPhase$Executing(): DriverPhase$;
export function DriverPhase$isExecuting(value: DriverPhase$): boolean;

export class Paused extends _.CustomType {}
export function DriverPhase$Paused(): DriverPhase$;
export function DriverPhase$isPaused(value: DriverPhase$): boolean;

export class Completed extends _.CustomType {}
export function DriverPhase$Completed(): DriverPhase$;
export function DriverPhase$isCompleted(value: DriverPhase$): boolean;

export type DriverPhase$ = Planning | Executing | Paused | Completed;

export class DriverState extends _.CustomType {
  /** @deprecated */
  constructor(
    task: $option.Option$<Task$>,
    current_step_index: number,
    prompts_emitted: number,
    last_prompt_time: number,
    phase: DriverPhase$
  );
  /** @deprecated */
  task: $option.Option$<Task$>;
  /** @deprecated */
  current_step_index: number;
  /** @deprecated */
  prompts_emitted: number;
  /** @deprecated */
  last_prompt_time: number;
  /** @deprecated */
  phase: DriverPhase$;
}
export function DriverState$DriverState(
  task: $option.Option$<Task$>,
  current_step_index: number,
  prompts_emitted: number,
  last_prompt_time: number,
  phase: DriverPhase$,
): DriverState$;
export function DriverState$isDriverState(value: DriverState$): boolean;
export function DriverState$DriverState$0(value: DriverState$): $option.Option$<
  Task$
>;
export function DriverState$DriverState$task(value: DriverState$): $option.Option$<
  Task$
>;
export function DriverState$DriverState$1(value: DriverState$): number;
export function DriverState$DriverState$current_step_index(value: DriverState$): number;
export function DriverState$DriverState$2(
  value: DriverState$,
): number;
export function DriverState$DriverState$prompts_emitted(value: DriverState$): number;
export function DriverState$DriverState$3(
  value: DriverState$,
): number;
export function DriverState$DriverState$last_prompt_time(value: DriverState$): number;
export function DriverState$DriverState$4(
  value: DriverState$,
): DriverPhase$;
export function DriverState$DriverState$phase(value: DriverState$): DriverPhase$;

export type DriverState$ = DriverState;
