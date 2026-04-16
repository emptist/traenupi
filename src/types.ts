export type PromptCategory =
  | "action"
  | "verify"
  | "reflect"
  | "anti_weakness"
  | "checkpoint"
  | "completion";

export type WeaknessType =
  | "context_loss"
  | "incomplete_follow_through"
  | "edge_case_blindness"
  | "quality_drift"
  | "verification_gap"
  | "planning_drift"
  | "overconfidence"
  | "scope_creep";

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
  intervalMs: number;
  maxPrompts: number;
  taskFile?: string;
  taskDescription?: string;
  continuous: boolean;
  verbose: boolean;
  weaknessWeights: Record<WeaknessType, number>;
}

export const DEFAULT_CONFIG: DriverConfig = {
  intervalMs: 3000,
  maxPrompts: 50,
  continuous: true,
  verbose: false,
  weaknessWeights: {
    context_loss: 3,
    incomplete_follow_through: 4,
    edge_case_blindness: 3,
    quality_drift: 2,
    verification_gap: 4,
    planning_drift: 2,
    overconfidence: 2,
    scope_creep: 1,
  },
};

export interface DriverState {
  task: Task | null;
  currentStepIndex: number;
  promptsEmitted: number;
  lastPromptTime: number;
  phase: "planning" | "executing" | "verifying" | "complete";
}
