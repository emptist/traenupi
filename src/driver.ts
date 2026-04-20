import type { DriverConfig, DriverState, Prompt, Task, WeaknessType } from "./common/types.js";
import {
  generateStepPrompts,
  generateCheckpointPrompt,
  generateCompletionPrompt,
  getRandomAntiWeaknessPrompt,
} from "./prompts.js";

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

const CATEGORY_COLORS: Record<string, string> = {
  action: ANSI.cyan,
  verify: ANSI.green,
  reflect: ANSI.yellow,
  anti_weakness: ANSI.magenta,
  checkpoint: ANSI.red,
  completion: ANSI.bgGreen + ANSI.white,
};

const CATEGORY_ICONS: Record<string, string> = {
  action: ">>",
  verify: "??",
  reflect: "~~",
  anti_weakness: "!!",
  checkpoint: "##",
  completion: "**",
};

export class PromptDriver {
  private config: DriverConfig;
  private state: DriverState;
  private promptQueue: Prompt[] = [];
  private usedPromptIds: Set<string> = new Set();
  private abortController: AbortController | null = null;

  constructor(config: DriverConfig) {
    this.config = config;
    this.state = {
      task: null,
      currentStepIndex: 0,
      promptsEmitted: 0,
      lastPromptTime: 0,
      phase: "planning",
    };
  }

  getState(): DriverState {
    return { ...this.state };
  }

  setTask(task: Task): void {
    this.state.task = task;
    this.state.currentStepIndex = 0;
    this.state.phase = "executing";
    this.buildPromptQueue();
  }

  private buildPromptQueue(): void {
    this.promptQueue = [];
    const task = this.state.task;
    if (!task) return;

    for (const step of task.steps) {
      const stepPrompts = generateStepPrompts(step);
      this.promptQueue.push(...stepPrompts);

      const checkpoint = generateCheckpointPrompt(step);
      this.promptQueue.push(checkpoint);

      const antiWeakness = getRandomAntiWeaknessPrompt(
        this.config.weaknessWeights ?? {},
        this.usedPromptIds,
      );
      this.promptQueue.push(antiWeakness);
      this.usedPromptIds.add(antiWeakness.id);
    }

    const completion = generateCompletionPrompt(task);
    this.promptQueue.push(completion);
  }

  private formatPrompt(prompt: Prompt): string {
    const color = CATEGORY_COLORS[prompt.category] ?? ANSI.white;
    const icon = CATEGORY_ICONS[prompt.category] ?? ">>";
    const timestamp = new Date().toISOString().slice(11, 19);

    const lines: string[] = [];

    lines.push("");
    lines.push(
      `${ANSI.dim}[${timestamp}]${ANSI.reset} ${color}${ANSI.bold}${icon} [${prompt.category.toUpperCase()}] ${prompt.title}${ANSI.reset}`,
    );

    if (prompt.weakness) {
      lines.push(
        `${ANSI.dim}weakness: ${prompt.weakness}${ANSI.reset}`,
      );
    }

    lines.push(
      `${color}${ANSI.bold}${"─".repeat(60)}${ANSI.reset}`,
    );

    const bodyLines = prompt.body.split("\n");
    for (const line of bodyLines) {
      lines.push(`${color}${line}${ANSI.reset}`);
    }

    if (prompt.checklist && prompt.checklist.length > 0) {
      lines.push("");
      lines.push(`${ANSI.bold}Checklist:${ANSI.reset}`);
      for (const item of prompt.checklist) {
        lines.push(`  ${ANSI.dim}[ ]${ANSI.reset} ${item}`);
      }
    }

    lines.push(
      `${color}${ANSI.bold}${"─".repeat(60)}${ANSI.reset}`,
    );
    lines.push("");

    return lines.join("\n");
  }

  private emitPrompt(prompt: Prompt): void {
    const formatted = this.formatPrompt(prompt);
    process.stdout.write(formatted);
    this.state.promptsEmitted += 1;
    this.state.lastPromptTime = Date.now();
  }

  async run(): Promise<void> {
    if (!this.state.task) {
      throw new Error("No task set. Call setTask() before run().");
    }

    this.abortController = new AbortController();

    if (this.config.verbose) {
      this.emitBanner();
    }

    const emitNext = (): boolean => {
      if (this.state.promptsEmitted >= (this.config.maxPrompts ?? 50)) {
        return false;
      }

      if (this.promptQueue.length > 0) {
        const prompt = this.promptQueue.shift()!;
        this.emitPrompt(prompt);

        if (prompt.category === "checkpoint") {
          this.advanceStep();
        }

        if (prompt.category === "completion") {
          this.state.phase = "completed";
          return false;
        }

        return true;
      }

      if (this.config.continuous) {
        const antiWeakness = getRandomAntiWeaknessPrompt(
          this.config.weaknessWeights ?? {},
          this.usedPromptIds,
        );
        this.emitPrompt(antiWeakness);
        this.usedPromptIds.add(antiWeakness.id);
        return true;
      }

      return false;
    };

    return new Promise((resolve) => {
      const signal = this.abortController!.signal;

      const tick = () => {
        if (signal.aborted) {
          resolve();
          return;
        }

        const hasMore = emitNext();
        if (!hasMore) {
          this.emitSummary();
          resolve();
          return;
        }

        setTimeout(tick, this.config.intervalMs);
      };

      tick();
    });
  }

  stop(): void {
    this.abortController?.abort();
  }

  private advanceStep(): void {
    const task = this.state.task;
    if (!task) return;

    if (this.state.currentStepIndex < task.steps.length) {
      task.steps[this.state.currentStepIndex].completed = true;
      this.state.currentStepIndex += 1;
    }

    if (this.state.currentStepIndex >= task.steps.length) {
      this.state.phase = "completed";
    }
  }

  private emitBanner(): void {
    const task = this.state.task;
    const lines = [
      "",
      `${ANSI.bgBlue}${ANSI.white}${ANSI.bold} TRAENUPI - Prompt Driver ${ANSI.reset}`,
      "",
      `${ANSI.bold}Goal:${ANSI.reset} ${task?.goal ?? "N/A"}`,
      `${ANSI.bold}Steps:${ANSI.reset} ${task?.steps.length ?? 0}`,
      `${ANSI.bold}Interval:${ANSI.reset} ${this.config.intervalMs}ms`,
      `${ANSI.bold}Max Prompts:${ANSI.reset} ${this.config.maxPrompts}`,
      `${ANSI.bold}Continuous:${ANSI.reset} ${this.config.continuous}`,
      "",
      `${ANSI.dim}Weakness weights:${ANSI.reset}`,
    ];

    for (const [weakness, weight] of Object.entries(this.config.weaknessWeights ?? {})) {
      const bar = "█".repeat(weight as number) + "░".repeat(5 - (weight as number));
      lines.push(
        `  ${ANSI.dim}${weakness.padEnd(28)}${ANSI.reset} ${ANSI.magenta}${bar}${ANSI.reset} ${weight}`,
      );
    }

    lines.push("");
    lines.push(`${ANSI.bold}${"═".repeat(60)}${ANSI.reset}`);
    lines.push("");

    process.stdout.write(lines.join("\n"));
  }

  private emitSummary(): void {
    const lines = [
      "",
      `${ANSI.bgCyan}${ANSI.white}${ANSI.bold} SESSION COMPLETE ${ANSI.reset}`,
      "",
      `${ANSI.bold}Prompts emitted:${ANSI.reset} ${this.state.promptsEmitted}`,
      `${ANSI.bold}Final phase:${ANSI.reset} ${this.state.phase}`,
      `${ANSI.bold}Steps completed:${ANSI.reset} ${this.state.currentStepIndex}/${this.state.task?.steps.length ?? 0}`,
      "",
    ];

    if (this.state.phase === "completed") {
      lines.push(
        `${ANSI.green}${ANSI.bold}All steps have been driven. Verify completion manually.${ANSI.reset}`,
      );
    } else {
      lines.push(
        `${ANSI.yellow}${ANSI.bold}Session ended before all steps were driven.${ANSI.reset}`,
      );
    }

    lines.push("");
    process.stdout.write(lines.join("\n"));
  }
}

export function createDriver(config: Partial<DriverConfig> = {}): PromptDriver {
  const merged: DriverConfig = {
    intervalMs: config.intervalMs ?? 3000,
    maxPrompts: config.maxPrompts ?? 50,
    taskFile: config.taskFile,
    taskDescription: config.taskDescription,
    continuous: config.continuous ?? true,
    verbose: config.verbose ?? true,
    weaknessWeights: config.weaknessWeights ?? {
      context_loss: 3,
      incomplete_follow_through: 4,
      edge_case_blindness: 3,
      quality_drift: 2,
      verification_gap: 4,
      planning_drift: 2,
      overconfidence: 2,
      scope_creep: 1,
      error_amnesia: 2,
      verification_neglect: 3,
    },
  };

  return new PromptDriver(merged);
}
