import { readFileSync } from "fs";
import type { Task, TaskStep } from "./types.js";

export interface TaskFileFormat {
  goal: string;
  description?: string;
  steps: Array<{
    description: string;
    verification?: string[];
    edgeCases?: string[];
  }>;
}

export function parseTaskFile(filePath: string): TaskFileFormat {
  const content = readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(content) as TaskFileFormat;

  if (!parsed.goal || typeof parsed.goal !== "string") {
    throw new Error("Task file must have a 'goal' string field");
  }

  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error("Task file must have a non-empty 'steps' array");
  }

  for (const [i, step] of parsed.steps.entries()) {
    if (!step.description || typeof step.description !== "string") {
      throw new Error(`Step ${i} must have a 'description' string field`);
    }
  }

  return parsed;
}

export function decomposeTaskFromDescription(description: string): TaskFileFormat {
  const lines = description
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const goal = lines[0] ?? description;

  const steps: TaskFileFormat["steps"] = lines.length > 1
    ? lines.slice(1).map((line) => ({
        description: line.replace(/^[-*\d.)\s]+/, ""),
        verification: [],
        edgeCases: [],
      }))
    : [
        {
          description: goal,
          verification: ["The task goal is achieved"],
          edgeCases: ["Error conditions are handled"],
        },
      ];

  return {
    goal,
    description,
    steps,
  };
}

export function createTaskFromFile(format: TaskFileFormat): Task {
  const steps: TaskStep[] = format.steps.map((step, index) => ({
    index,
    description: step.description,
    verification: step.verification ?? [`Step "${step.description}" is complete`],
    edgeCases: step.edgeCases ?? [`What if "${step.description}" fails?`],
    completed: false,
  }));

  return {
    id: `task_${Date.now()}`,
    description: format.description ?? format.goal,
    goal: format.goal,
    steps,
    createdAt: Date.now(),
  };
}

export function createTask(description: string): Task {
  const format = decomposeTaskFromDescription(description);
  return createTaskFromFile(format);
}

export function loadTask(filePath: string): Task {
  const format = parseTaskFile(filePath);
  return createTaskFromFile(format);
}
