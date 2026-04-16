import { parseArgs } from "node:util";
import { createDriver } from "./driver.js";
import { createTask, loadTask } from "./task.js";
import type { DriverConfig, WeaknessType } from "./types.js";

function printUsage(): void {
  console.log(`
traenupi - Prompt Driver for AI Work Continuity

USAGE:
  traenupi [OPTIONS]

OPTIONS:
  -t, --task <description>   Task description (first line = goal, rest = steps)
  -f, --file <path>          Path to task JSON file
  -i, --interval <ms>        Interval between prompts in ms (default: 3000)
  -m, --max <number>         Maximum number of prompts (default: 50)
  -c, --continuous           Keep emitting anti-weakness prompts after steps (default: true)
  --no-continuous            Stop after all step prompts are emitted
  -v, --verbose              Show banner and extra info (default: true)
  --no-verbose               Minimal output
  -h, --help                 Show this help

TASK FILE FORMAT (JSON):
  {
    "goal": "Clear statement of what to achieve",
    "steps": [
      {
        "description": "What to do in this step",
        "verification": ["How to verify this step is done"],
        "edgeCases": ["Edge cases to consider"]
      }
    ]
  }

EXAMPLES:
  traenupi -t "Build a REST API
  - Design the API schema
  - Implement endpoints
  - Write integration tests
  - Deploy to staging"

  traenupi -f task.json -i 5000 -m 100

  traenupi -t "Fix the login bug" --no-continuous -m 20
`);
}

function parseCliArgs(): Partial<DriverConfig> & { help?: boolean } {
  const { values } = parseArgs({
    options: {
      task: { type: "string", short: "t" },
      file: { type: "string", short: "f" },
      interval: { type: "string", short: "i" },
      max: { type: "string", short: "m" },
      continuous: { type: "boolean", short: "c", default: true },
      "no-continuous": { type: "boolean", default: false },
      verbose: { type: "boolean", short: "v", default: true },
      "no-verbose": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    return { help: true };
  }

  const config: Partial<DriverConfig> & { help?: boolean } = {};

  if (values.task) {
    config.taskDescription = values.task;
  }

  if (values.file) {
    config.taskFile = values.file;
  }

  if (values.interval) {
    const ms = parseInt(values.interval, 10);
    if (isNaN(ms) || ms < 100) {
      console.error("Error: interval must be a number >= 100ms");
      process.exit(1);
    }
    config.intervalMs = ms;
  }

  if (values.max) {
    const max = parseInt(values.max, 10);
    if (isNaN(max) || max < 1) {
      console.error("Error: max must be a positive number");
      process.exit(1);
    }
    config.maxPrompts = max;
  }

  if (values["no-continuous"]) {
    config.continuous = false;
  } else if (values.continuous !== undefined) {
    config.continuous = values.continuous;
  }

  if (values["no-verbose"]) {
    config.verbose = false;
  } else if (values.verbose !== undefined) {
    config.verbose = values.verbose;
  }

  return config;
}

async function main(): Promise<void> {
  const cliConfig = parseCliArgs();

  if (cliConfig.help) {
    printUsage();
    process.exit(0);
  }

  if (!cliConfig.taskDescription && !cliConfig.taskFile) {
    console.error("Error: Provide a task with -t <description> or -f <task-file>");
    printUsage();
    process.exit(1);
  }

  const driver = createDriver(cliConfig);

  try {
    const task = cliConfig.taskFile
      ? loadTask(cliConfig.taskFile)
      : createTask(cliConfig.taskDescription!);

    driver.setTask(task);

    process.on("SIGINT", () => {
      driver.stop();
    });

    process.on("SIGTERM", () => {
      driver.stop();
    });

    await driver.run();
  } catch (err) {
    console.error(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
