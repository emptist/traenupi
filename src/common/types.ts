export interface DbQueryOptions {
  timeout?: number;
  silent?: boolean;
}

export interface KnowledgeEntry {
  key: string;
  value: string;
  category: string;
  time: number;
}

export interface MeetingOpinion {
  id: string;
  meetingId: string;
  author: string;
  perspective: string;
  position: string;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  topic: string;
  status: string;
  createdBy: string;
  createdAt: Date;
}

export interface ConversationItem {
  question: string;
  answer: string;
  time: number;
}

export interface Reminder {
  id: string;
  message: string;
  triggerAt: number;
  triggered: boolean;
}

export interface Bookmark {
  id: string;
  meetingId: string;
  opinionId: string;
  author: string;
  perspective: string;
  note: string;
  createdAt: number;
}

export interface MoodEntry {
  agentId: string;
  mood: string;
  timestamp: number;
  context: string;
}

export interface AIPresence {
  agentId: string;
  lastSeen: number;
  status: string;
  focus: string;
  project: string;
}

export interface ActivityStats {
  questionsToday: number;
  knowledgeStored: number;
  meetingOpinions: number;
  babyAiContributions: number;
  tweetsCreated: number;
  remindersTriggered: number;
}

export type PromptCategory = "action" | "verify" | "reflect" | "anti_weakness" | "checkpoint" | "completion";

export type WeaknessType = "context_loss" | "incomplete_follow_through" | "planning_drift" | "error_amnesia" | "verification_neglect" | "edge_case_blindness" | "quality_drift" | "verification_gap" | "overconfidence" | "scope_creep";

export interface Prompt {
  id: string;
  category: PromptCategory;
  weakness?: WeaknessType;
  title: string;
  body: string;
  checklist?: string[];
}

export interface TaskStep {
  index: number;
  description: string;
  verification: string[];
  edgeCases: string[];
  completed: boolean;
}

export interface Task {
  id: string;
  description: string;
  goal: string;
  steps: TaskStep[];
  createdAt: number;
}

export interface DriverConfig {
  intervalMs?: number;
  maxPromptsPerStep?: number;
  maxPrompts?: number;
  antiWeaknessProbability?: number;
  checkpointInterval?: number;
  continuous?: boolean;
  verbose?: boolean;
  help?: boolean;
  taskDescription?: string;
  taskFile?: string;
  weaknessWeights?: Record<WeaknessType, number>;
  onPrompt?: (prompt: Prompt) => void;
  onComplete?: (task: Task) => void;
  onError?: (error: Error) => void;
}

export interface DriverState {
  task: Task | null;
  currentStepIndex: number;
  promptsEmitted: number;
  lastPromptTime: number;
  phase: "planning" | "executing" | "completed" | "error";
}
