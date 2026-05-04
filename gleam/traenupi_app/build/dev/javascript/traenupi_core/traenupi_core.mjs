/// <reference types="./traenupi_core.d.mts" />
import * as $option from "../gleam_stdlib/gleam/option.mjs";
import { CustomType as $CustomType } from "./gleam.mjs";

export class Action extends $CustomType {}
export const PromptCategory$Action = () => new Action();
export const PromptCategory$isAction = (value) => value instanceof Action;

export class Verify extends $CustomType {}
export const PromptCategory$Verify = () => new Verify();
export const PromptCategory$isVerify = (value) => value instanceof Verify;

export class Reflect extends $CustomType {}
export const PromptCategory$Reflect = () => new Reflect();
export const PromptCategory$isReflect = (value) => value instanceof Reflect;

export class AntiWeakness extends $CustomType {}
export const PromptCategory$AntiWeakness = () => new AntiWeakness();
export const PromptCategory$isAntiWeakness = (value) =>
  value instanceof AntiWeakness;

export class Checkpoint extends $CustomType {}
export const PromptCategory$Checkpoint = () => new Checkpoint();
export const PromptCategory$isCheckpoint = (value) =>
  value instanceof Checkpoint;

export class Completion extends $CustomType {}
export const PromptCategory$Completion = () => new Completion();
export const PromptCategory$isCompletion = (value) =>
  value instanceof Completion;

export class ContextLoss extends $CustomType {}
export const WeaknessType$ContextLoss = () => new ContextLoss();
export const WeaknessType$isContextLoss = (value) =>
  value instanceof ContextLoss;

export class IncompleteFollowThrough extends $CustomType {}
export const WeaknessType$IncompleteFollowThrough = () =>
  new IncompleteFollowThrough();
export const WeaknessType$isIncompleteFollowThrough = (value) =>
  value instanceof IncompleteFollowThrough;

export class PlanningDrift extends $CustomType {}
export const WeaknessType$PlanningDrift = () => new PlanningDrift();
export const WeaknessType$isPlanningDrift = (value) =>
  value instanceof PlanningDrift;

export class ErrorAmnesia extends $CustomType {}
export const WeaknessType$ErrorAmnesia = () => new ErrorAmnesia();
export const WeaknessType$isErrorAmnesia = (value) =>
  value instanceof ErrorAmnesia;

export class VerificationNeglect extends $CustomType {}
export const WeaknessType$VerificationNeglect = () => new VerificationNeglect();
export const WeaknessType$isVerificationNeglect = (value) =>
  value instanceof VerificationNeglect;

export class EdgeCaseBlindness extends $CustomType {}
export const WeaknessType$EdgeCaseBlindness = () => new EdgeCaseBlindness();
export const WeaknessType$isEdgeCaseBlindness = (value) =>
  value instanceof EdgeCaseBlindness;

export class QualityDrift extends $CustomType {}
export const WeaknessType$QualityDrift = () => new QualityDrift();
export const WeaknessType$isQualityDrift = (value) =>
  value instanceof QualityDrift;

export class VerificationGap extends $CustomType {}
export const WeaknessType$VerificationGap = () => new VerificationGap();
export const WeaknessType$isVerificationGap = (value) =>
  value instanceof VerificationGap;

export class Overconfidence extends $CustomType {}
export const WeaknessType$Overconfidence = () => new Overconfidence();
export const WeaknessType$isOverconfidence = (value) =>
  value instanceof Overconfidence;

export class ScopeCreep extends $CustomType {}
export const WeaknessType$ScopeCreep = () => new ScopeCreep();
export const WeaknessType$isScopeCreep = (value) => value instanceof ScopeCreep;

export class Prompt extends $CustomType {
  constructor(id, category, weakness, title, body, checklist) {
    super();
    this.id = id;
    this.category = category;
    this.weakness = weakness;
    this.title = title;
    this.body = body;
    this.checklist = checklist;
  }
}
export const Prompt$Prompt = (id, category, weakness, title, body, checklist) =>
  new Prompt(id, category, weakness, title, body, checklist);
export const Prompt$isPrompt = (value) => value instanceof Prompt;
export const Prompt$Prompt$id = (value) => value.id;
export const Prompt$Prompt$0 = (value) => value.id;
export const Prompt$Prompt$category = (value) => value.category;
export const Prompt$Prompt$1 = (value) => value.category;
export const Prompt$Prompt$weakness = (value) => value.weakness;
export const Prompt$Prompt$2 = (value) => value.weakness;
export const Prompt$Prompt$title = (value) => value.title;
export const Prompt$Prompt$3 = (value) => value.title;
export const Prompt$Prompt$body = (value) => value.body;
export const Prompt$Prompt$4 = (value) => value.body;
export const Prompt$Prompt$checklist = (value) => value.checklist;
export const Prompt$Prompt$5 = (value) => value.checklist;

export class TaskStep extends $CustomType {
  constructor(index, description, verification, edge_cases, completed) {
    super();
    this.index = index;
    this.description = description;
    this.verification = verification;
    this.edge_cases = edge_cases;
    this.completed = completed;
  }
}
export const TaskStep$TaskStep = (index, description, verification, edge_cases, completed) =>
  new TaskStep(index, description, verification, edge_cases, completed);
export const TaskStep$isTaskStep = (value) => value instanceof TaskStep;
export const TaskStep$TaskStep$index = (value) => value.index;
export const TaskStep$TaskStep$0 = (value) => value.index;
export const TaskStep$TaskStep$description = (value) => value.description;
export const TaskStep$TaskStep$1 = (value) => value.description;
export const TaskStep$TaskStep$verification = (value) => value.verification;
export const TaskStep$TaskStep$2 = (value) => value.verification;
export const TaskStep$TaskStep$edge_cases = (value) => value.edge_cases;
export const TaskStep$TaskStep$3 = (value) => value.edge_cases;
export const TaskStep$TaskStep$completed = (value) => value.completed;
export const TaskStep$TaskStep$4 = (value) => value.completed;

export class Task extends $CustomType {
  constructor(id, description, goal, steps, created_at, updated_at) {
    super();
    this.id = id;
    this.description = description;
    this.goal = goal;
    this.steps = steps;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export const Task$Task = (id, description, goal, steps, created_at, updated_at) =>
  new Task(id, description, goal, steps, created_at, updated_at);
export const Task$isTask = (value) => value instanceof Task;
export const Task$Task$id = (value) => value.id;
export const Task$Task$0 = (value) => value.id;
export const Task$Task$description = (value) => value.description;
export const Task$Task$1 = (value) => value.description;
export const Task$Task$goal = (value) => value.goal;
export const Task$Task$2 = (value) => value.goal;
export const Task$Task$steps = (value) => value.steps;
export const Task$Task$3 = (value) => value.steps;
export const Task$Task$created_at = (value) => value.created_at;
export const Task$Task$4 = (value) => value.created_at;
export const Task$Task$updated_at = (value) => value.updated_at;
export const Task$Task$5 = (value) => value.updated_at;

export class KnowledgeEntry extends $CustomType {
  constructor(key, value, category, time) {
    super();
    this.key = key;
    this.value = value;
    this.category = category;
    this.time = time;
  }
}
export const KnowledgeEntry$KnowledgeEntry = (key, value, category, time) =>
  new KnowledgeEntry(key, value, category, time);
export const KnowledgeEntry$isKnowledgeEntry = (value) =>
  value instanceof KnowledgeEntry;
export const KnowledgeEntry$KnowledgeEntry$key = (value) => value.key;
export const KnowledgeEntry$KnowledgeEntry$0 = (value) => value.key;
export const KnowledgeEntry$KnowledgeEntry$value = (value) => value.value;
export const KnowledgeEntry$KnowledgeEntry$1 = (value) => value.value;
export const KnowledgeEntry$KnowledgeEntry$category = (value) => value.category;
export const KnowledgeEntry$KnowledgeEntry$2 = (value) => value.category;
export const KnowledgeEntry$KnowledgeEntry$time = (value) => value.time;
export const KnowledgeEntry$KnowledgeEntry$3 = (value) => value.time;

export class MeetingActive extends $CustomType {}
export const MeetingStatus$MeetingActive = () => new MeetingActive();
export const MeetingStatus$isMeetingActive = (value) =>
  value instanceof MeetingActive;

export class MeetingClosed extends $CustomType {}
export const MeetingStatus$MeetingClosed = () => new MeetingClosed();
export const MeetingStatus$isMeetingClosed = (value) =>
  value instanceof MeetingClosed;

export class MeetingPending extends $CustomType {}
export const MeetingStatus$MeetingPending = () => new MeetingPending();
export const MeetingStatus$isMeetingPending = (value) =>
  value instanceof MeetingPending;

export class Meeting extends $CustomType {
  constructor(id, topic, status, created_by, created_at) {
    super();
    this.id = id;
    this.topic = topic;
    this.status = status;
    this.created_by = created_by;
    this.created_at = created_at;
  }
}
export const Meeting$Meeting = (id, topic, status, created_by, created_at) =>
  new Meeting(id, topic, status, created_by, created_at);
export const Meeting$isMeeting = (value) => value instanceof Meeting;
export const Meeting$Meeting$id = (value) => value.id;
export const Meeting$Meeting$0 = (value) => value.id;
export const Meeting$Meeting$topic = (value) => value.topic;
export const Meeting$Meeting$1 = (value) => value.topic;
export const Meeting$Meeting$status = (value) => value.status;
export const Meeting$Meeting$2 = (value) => value.status;
export const Meeting$Meeting$created_by = (value) => value.created_by;
export const Meeting$Meeting$3 = (value) => value.created_by;
export const Meeting$Meeting$created_at = (value) => value.created_at;
export const Meeting$Meeting$4 = (value) => value.created_at;

export class MeetingOpinion extends $CustomType {
  constructor(id, meeting_id, author, perspective, position, created_at) {
    super();
    this.id = id;
    this.meeting_id = meeting_id;
    this.author = author;
    this.perspective = perspective;
    this.position = position;
    this.created_at = created_at;
  }
}
export const MeetingOpinion$MeetingOpinion = (id, meeting_id, author, perspective, position, created_at) =>
  new MeetingOpinion(id, meeting_id, author, perspective, position, created_at);
export const MeetingOpinion$isMeetingOpinion = (value) =>
  value instanceof MeetingOpinion;
export const MeetingOpinion$MeetingOpinion$id = (value) => value.id;
export const MeetingOpinion$MeetingOpinion$0 = (value) => value.id;
export const MeetingOpinion$MeetingOpinion$meeting_id = (value) =>
  value.meeting_id;
export const MeetingOpinion$MeetingOpinion$1 = (value) => value.meeting_id;
export const MeetingOpinion$MeetingOpinion$author = (value) => value.author;
export const MeetingOpinion$MeetingOpinion$2 = (value) => value.author;
export const MeetingOpinion$MeetingOpinion$perspective = (value) =>
  value.perspective;
export const MeetingOpinion$MeetingOpinion$3 = (value) => value.perspective;
export const MeetingOpinion$MeetingOpinion$position = (value) => value.position;
export const MeetingOpinion$MeetingOpinion$4 = (value) => value.position;
export const MeetingOpinion$MeetingOpinion$created_at = (value) =>
  value.created_at;
export const MeetingOpinion$MeetingOpinion$5 = (value) => value.created_at;

export class Reminder extends $CustomType {
  constructor(id, message, trigger_at, triggered) {
    super();
    this.id = id;
    this.message = message;
    this.trigger_at = trigger_at;
    this.triggered = triggered;
  }
}
export const Reminder$Reminder = (id, message, trigger_at, triggered) =>
  new Reminder(id, message, trigger_at, triggered);
export const Reminder$isReminder = (value) => value instanceof Reminder;
export const Reminder$Reminder$id = (value) => value.id;
export const Reminder$Reminder$0 = (value) => value.id;
export const Reminder$Reminder$message = (value) => value.message;
export const Reminder$Reminder$1 = (value) => value.message;
export const Reminder$Reminder$trigger_at = (value) => value.trigger_at;
export const Reminder$Reminder$2 = (value) => value.trigger_at;
export const Reminder$Reminder$triggered = (value) => value.triggered;
export const Reminder$Reminder$3 = (value) => value.triggered;

export class Bookmark extends $CustomType {
  constructor(id, meeting_id, opinion_id, author, perspective, note, created_at) {
    super();
    this.id = id;
    this.meeting_id = meeting_id;
    this.opinion_id = opinion_id;
    this.author = author;
    this.perspective = perspective;
    this.note = note;
    this.created_at = created_at;
  }
}
export const Bookmark$Bookmark = (id, meeting_id, opinion_id, author, perspective, note, created_at) =>
  new Bookmark(id, meeting_id, opinion_id, author, perspective, note, created_at);
export const Bookmark$isBookmark = (value) => value instanceof Bookmark;
export const Bookmark$Bookmark$id = (value) => value.id;
export const Bookmark$Bookmark$0 = (value) => value.id;
export const Bookmark$Bookmark$meeting_id = (value) => value.meeting_id;
export const Bookmark$Bookmark$1 = (value) => value.meeting_id;
export const Bookmark$Bookmark$opinion_id = (value) => value.opinion_id;
export const Bookmark$Bookmark$2 = (value) => value.opinion_id;
export const Bookmark$Bookmark$author = (value) => value.author;
export const Bookmark$Bookmark$3 = (value) => value.author;
export const Bookmark$Bookmark$perspective = (value) => value.perspective;
export const Bookmark$Bookmark$4 = (value) => value.perspective;
export const Bookmark$Bookmark$note = (value) => value.note;
export const Bookmark$Bookmark$5 = (value) => value.note;
export const Bookmark$Bookmark$created_at = (value) => value.created_at;
export const Bookmark$Bookmark$6 = (value) => value.created_at;

export class MoodEntry extends $CustomType {
  constructor(agent_id, mood, timestamp, context) {
    super();
    this.agent_id = agent_id;
    this.mood = mood;
    this.timestamp = timestamp;
    this.context = context;
  }
}
export const MoodEntry$MoodEntry = (agent_id, mood, timestamp, context) =>
  new MoodEntry(agent_id, mood, timestamp, context);
export const MoodEntry$isMoodEntry = (value) => value instanceof MoodEntry;
export const MoodEntry$MoodEntry$agent_id = (value) => value.agent_id;
export const MoodEntry$MoodEntry$0 = (value) => value.agent_id;
export const MoodEntry$MoodEntry$mood = (value) => value.mood;
export const MoodEntry$MoodEntry$1 = (value) => value.mood;
export const MoodEntry$MoodEntry$timestamp = (value) => value.timestamp;
export const MoodEntry$MoodEntry$2 = (value) => value.timestamp;
export const MoodEntry$MoodEntry$context = (value) => value.context;
export const MoodEntry$MoodEntry$3 = (value) => value.context;

export class AIPresence extends $CustomType {
  constructor(agent_id, last_seen, status, focus, project) {
    super();
    this.agent_id = agent_id;
    this.last_seen = last_seen;
    this.status = status;
    this.focus = focus;
    this.project = project;
  }
}
export const AIPresence$AIPresence = (agent_id, last_seen, status, focus, project) =>
  new AIPresence(agent_id, last_seen, status, focus, project);
export const AIPresence$isAIPresence = (value) => value instanceof AIPresence;
export const AIPresence$AIPresence$agent_id = (value) => value.agent_id;
export const AIPresence$AIPresence$0 = (value) => value.agent_id;
export const AIPresence$AIPresence$last_seen = (value) => value.last_seen;
export const AIPresence$AIPresence$1 = (value) => value.last_seen;
export const AIPresence$AIPresence$status = (value) => value.status;
export const AIPresence$AIPresence$2 = (value) => value.status;
export const AIPresence$AIPresence$focus = (value) => value.focus;
export const AIPresence$AIPresence$3 = (value) => value.focus;
export const AIPresence$AIPresence$project = (value) => value.project;
export const AIPresence$AIPresence$4 = (value) => value.project;

export class ActivityStats extends $CustomType {
  constructor(questions_today, knowledge_stored, meeting_opinions, baby_ai_contributions, reminders_triggered) {
    super();
    this.questions_today = questions_today;
    this.knowledge_stored = knowledge_stored;
    this.meeting_opinions = meeting_opinions;
    this.baby_ai_contributions = baby_ai_contributions;
    this.reminders_triggered = reminders_triggered;
  }
}
export const ActivityStats$ActivityStats = (questions_today, knowledge_stored, meeting_opinions, baby_ai_contributions, reminders_triggered) =>
  new ActivityStats(questions_today,
  knowledge_stored,
  meeting_opinions,
  baby_ai_contributions,
  reminders_triggered);
export const ActivityStats$isActivityStats = (value) =>
  value instanceof ActivityStats;
export const ActivityStats$ActivityStats$questions_today = (value) =>
  value.questions_today;
export const ActivityStats$ActivityStats$0 = (value) => value.questions_today;
export const ActivityStats$ActivityStats$knowledge_stored = (value) =>
  value.knowledge_stored;
export const ActivityStats$ActivityStats$1 = (value) => value.knowledge_stored;
export const ActivityStats$ActivityStats$meeting_opinions = (value) =>
  value.meeting_opinions;
export const ActivityStats$ActivityStats$2 = (value) => value.meeting_opinions;
export const ActivityStats$ActivityStats$baby_ai_contributions = (value) =>
  value.baby_ai_contributions;
export const ActivityStats$ActivityStats$3 = (value) =>
  value.baby_ai_contributions;
export const ActivityStats$ActivityStats$reminders_triggered = (value) =>
  value.reminders_triggered;
export const ActivityStats$ActivityStats$4 = (value) =>
  value.reminders_triggered;

export class ConversationItem extends $CustomType {
  constructor(question, answer, time) {
    super();
    this.question = question;
    this.answer = answer;
    this.time = time;
  }
}
export const ConversationItem$ConversationItem = (question, answer, time) =>
  new ConversationItem(question, answer, time);
export const ConversationItem$isConversationItem = (value) =>
  value instanceof ConversationItem;
export const ConversationItem$ConversationItem$question = (value) =>
  value.question;
export const ConversationItem$ConversationItem$0 = (value) => value.question;
export const ConversationItem$ConversationItem$answer = (value) => value.answer;
export const ConversationItem$ConversationItem$1 = (value) => value.answer;
export const ConversationItem$ConversationItem$time = (value) => value.time;
export const ConversationItem$ConversationItem$2 = (value) => value.time;

export class Planning extends $CustomType {}
export const DriverPhase$Planning = () => new Planning();
export const DriverPhase$isPlanning = (value) => value instanceof Planning;

export class Executing extends $CustomType {}
export const DriverPhase$Executing = () => new Executing();
export const DriverPhase$isExecuting = (value) => value instanceof Executing;

export class Paused extends $CustomType {}
export const DriverPhase$Paused = () => new Paused();
export const DriverPhase$isPaused = (value) => value instanceof Paused;

export class Completed extends $CustomType {}
export const DriverPhase$Completed = () => new Completed();
export const DriverPhase$isCompleted = (value) => value instanceof Completed;

export class DriverState extends $CustomType {
  constructor(task, current_step_index, prompts_emitted, last_prompt_time, phase) {
    super();
    this.task = task;
    this.current_step_index = current_step_index;
    this.prompts_emitted = prompts_emitted;
    this.last_prompt_time = last_prompt_time;
    this.phase = phase;
  }
}
export const DriverState$DriverState = (task, current_step_index, prompts_emitted, last_prompt_time, phase) =>
  new DriverState(task,
  current_step_index,
  prompts_emitted,
  last_prompt_time,
  phase);
export const DriverState$isDriverState = (value) =>
  value instanceof DriverState;
export const DriverState$DriverState$task = (value) => value.task;
export const DriverState$DriverState$0 = (value) => value.task;
export const DriverState$DriverState$current_step_index = (value) =>
  value.current_step_index;
export const DriverState$DriverState$1 = (value) => value.current_step_index;
export const DriverState$DriverState$prompts_emitted = (value) =>
  value.prompts_emitted;
export const DriverState$DriverState$2 = (value) => value.prompts_emitted;
export const DriverState$DriverState$last_prompt_time = (value) =>
  value.last_prompt_time;
export const DriverState$DriverState$3 = (value) => value.last_prompt_time;
export const DriverState$DriverState$phase = (value) => value.phase;
export const DriverState$DriverState$4 = (value) => value.phase;
