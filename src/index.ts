import { parseArgs } from "node:util";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { createDriver } from "./driver.js";
import { createTask, loadTask } from "./task.js";
import type { DriverConfig } from "./types.js";

const TRAENUPI_DIR = join(homedir(), ".traenupi");
const QUESTION_FILE = join(TRAENUPI_DIR, "question.txt");
const ANSWER_FILE = join(TRAENUPI_DIR, "answer.txt");
const STATE_FILE = join(TRAENUPI_DIR, "state.json");

function ensureDir(): void {
  if (!existsSync(TRAENUPI_DIR)) {
    mkdirSync(TRAENUPI_DIR, { recursive: true });
  }
}

function printUsage(): void {
  console.log(`
traenupi - AI Companion for Trae

USAGE:
  traenupi <command> [options]

COMMANDS:
  daemon                  Start daemon that watches for questions
  tellme <question>       Ask a question (daemon will answer)
  status                  Show daemon status
  stop                    Stop the daemon

PROMPT DRIVER MODE:
  -t, --task <desc>       Task description (first line = goal, rest = steps)
  -f, --file <path>       Path to task JSON file
  -i, --interval <ms>     Interval between prompts (default: 3000)
  -m, --max <number>      Maximum prompts (default: 50)

EXAMPLES:
  # Start the daemon (in another terminal)
  traenupi daemon

  # Ask a question
  traenupi tellme "What should I do next?"

  # Traditional prompt driver mode
  traenupi -t "Fix the login bug
  - Reproduce the bug
  - Find root cause
  - Write fix
  - Add tests"
`);
}

async function runDaemon(): Promise<void> {
  ensureDir();
  
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     TraeNuPI Daemon - AI Companion         ║");
  console.log("║     Watching for questions...              ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log("");
  
  const state = {
    started: Date.now(),
    questionsAnswered: 0,
    lastQuestion: null as string | null,
  };
  
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  let lastQuestionTime = 0;
  
  const checkInterval = setInterval(() => {
    if (!existsSync(QUESTION_FILE)) {
      return;
    }
    
    try {
      const stats = statSync(QUESTION_FILE);
      if (stats.mtimeMs <= lastQuestionTime) {
        return;
      }
      lastQuestionTime = stats.mtimeMs;
      
      const question = readFileSync(QUESTION_FILE, "utf-8").trim();
      if (!question) {
        return;
      }
      
      console.log(`\n[${new Date().toLocaleTimeString()}] Question: ${question}`);
      console.log("─".repeat(50));
      
      unlinkSync(QUESTION_FILE);
      
      const answer = askPi(question);
      
      state.questionsAnswered++;
      state.lastQuestion = question;
      writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
      
      console.log("\n[TRAENUPI ANSWER]:");
      console.log(answer);
      console.log("─".repeat(50));
      
    } catch (e) {
      // File might be being written, ignore
    }
  }, 500);
  
  process.on("SIGINT", () => {
    clearInterval(checkInterval);
    console.log("\n[TRAENUPI] Daemon stopped.");
    if (existsSync(STATE_FILE)) {
      unlinkSync(STATE_FILE);
    }
    process.exit(0);
  });
}

function getNezhaTasks(): string {
  try {
    const output = execSync("node /Users/jk/gits/hub/tools_ai/nezha/dist/cli/index.js tasks", {
      encoding: "utf-8",
      timeout: 10000,
    });
    return output.trim();
  } catch (e) {
    return `[Could not get nezha tasks: ${e instanceof Error ? e.message : String(e)}]`;
  }
}

function buildContext(): string {
  const tasks = getNezhaTasks();
  const context = `
You are TraeNuPI, a simple reminder assistant for Trae AI.

Your job: Help Trae work continuously without stopping to ask humans.

Current Tasks:
${tasks}

How to help:
1. Suggest relevant nezha commands
2. Remind of pending tasks
3. Keep responses SHORT and actionable
4. Output ONLY plain text, no JSON, no tool calls

Useful commands:
- nezha tasks : see pending tasks
- nezha task-add "title" "desc" 5 : create task
- nezha improve : create review task
`;
  return context;
}

function askPi(question: string): string {
  try {
    const context = buildContext();
    const fullPrompt = `${context}\n\nQuestion: ${question}`;
    const output = execSync(`pi -p "${fullPrompt.replace(/"/g, '\\"')}"`, {
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    });
    return output.trim() || "[Pi returned empty response]";
  } catch (e) {
    if (e instanceof Error && "stdout" in e) {
      const err = e as Error & { stdout?: string };
      if (err.stdout) {
        return err.stdout.trim();
      }
    }
    return `[Error calling Pi: ${e instanceof Error ? e.message : String(e)}]`;
  }
}

function tellme(question: string): void {
  ensureDir();
  
  if (existsSync(QUESTION_FILE)) {
    console.log("[TRAENUPI] Previous question still being processed, please wait...");
    return;
  }
  
  writeFileSync(QUESTION_FILE, question);
  console.log(`[TRAENUPI] Question sent: "${question}"`);
  console.log("[TRAENUPI] Check the daemon terminal for the answer.");
}

function showStatus(): void {
  ensureDir();
  
  if (!existsSync(STATE_FILE)) {
    console.log("[TRAENUPI] Daemon is not running.");
    return;
  }
  
  try {
    const state = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    const uptime = Math.floor((Date.now() - state.started) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    console.log("[TRAENUPI] Daemon Status:");
    console.log(`  Uptime: ${hours}h ${minutes}m`);
    console.log(`  Questions answered: ${state.questionsAnswered}`);
    console.log(`  Last question: ${state.lastQuestion || "None"}`);
  } catch (e) {
    console.log("[TRAENUPI] Could not read daemon state.");
  }
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
    allowPositionals: true,
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
    if (!isNaN(ms) && ms >= 100) {
      config.intervalMs = ms;
    }
  }

  if (values.max) {
    const max = parseInt(values.max, 10);
    if (!isNaN(max) && max >= 1) {
      config.maxPrompts = max;
    }
  }

  if (values["no-continuous"]) {
    config.continuous = false;
  }

  if (values["no-verbose"]) {
    config.verbose = false;
  }

  return config;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
    printUsage();
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command === "daemon") {
    await runDaemon();
    return;
  }
  
  if (command === "tellme") {
    const question = args.slice(1).join(" ");
    if (!question) {
      console.error("Error: Please provide a question.");
      console.log('Usage: traenupi tellme "your question here"');
      process.exit(1);
    }
    tellme(question);
    return;
  }
  
  if (command === "status") {
    showStatus();
    return;
  }
  
  if (command === "stop") {
    ensureDir();
    if (existsSync(STATE_FILE)) {
      unlinkSync(STATE_FILE);
      console.log("[TRAENUPI] Daemon state cleared.");
    }
    console.log("[TRAENUPI] Note: You need to Ctrl+C the daemon terminal to stop it.");
    return;
  }
  
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
