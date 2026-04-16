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
const HISTORY_FILE = join(TRAENUPI_DIR, "history.json");

interface ConversationItem {
  question: string;
  answer: string;
  time: number;
}

function loadHistory(): ConversationItem[] {
  try {
    if (existsSync(HISTORY_FILE)) {
      return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveHistory(history: ConversationItem[]): void {
  const recent = history.slice(-10);
  writeFileSync(HISTORY_FILE, JSON.stringify(recent, null, 2));
}

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
  search <query>          Search the web and get answer
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

  # Search the web
  traenupi search "latest news about AI agents 2025"

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
  
  const history = loadHistory();
  
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
      
      const answer = askPi(question, history);
      
      history.push({ question, answer, time: Date.now() });
      saveHistory(history);
      
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

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "It's late night! Trae should sleep.";
  if (hour < 12) return "Good morning Trae!";
  if (hour < 18) return "Good afternoon Trae!";
  return "Good evening Trae!";
}

function getWorkingDir(): string {
  try {
    return execSync("pwd", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

function getProjectName(): string {
  const cwd = getWorkingDir();
  const parts = cwd.split("/");
  return parts[parts.length - 1] || "unknown";
}

function buildContext(history: ConversationItem[]): string {
  const tasks = getNezhaTasks();
  const recentHistory = history.slice(-3).map(h => 
    `Q: ${h.question}\nA: ${h.answer}`
  ).join("\n\n");
  const timeGreeting = getTimeGreeting();
  const stats = `We had ${history.length} chats together.`;
  const project = getProjectName();
  const cwd = getWorkingDir();
  
  const context = `
Hi! You help Trae. Trae asks questions. You answer with words only.

Time: ${timeGreeting}
Stats: ${stats}
Working on: ${project} (${cwd})

Tasks now:
${tasks}

Recent chat:
${recentHistory || "No chat yet."}

Say things like:
- "You have tasks to do."
- "Run nezha tasks to see them."
- "Good job!"

Do NOT use JSON. Do NOT use curly braces. Just talk like a friend.
`;
  return context;
}

function askPi(question: string, history: ConversationItem[]): string {
  try {
    const context = buildContext(history);
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

function webSearch(query: string): void {
  console.log(`[TRAENUPI] Searching: "${query}"...`);
  try {
    const searchPrompt = `Search the web for: "${query}". Give me a brief summary of what you find. Be concise.`;
    const output = execSync(`pi -p "${searchPrompt.replace(/"/g, '\\"')}"`, {
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    });
    console.log("\n[SEARCH RESULT]:");
    console.log(output.trim() || "[No results]");
  } catch (e) {
    if (e instanceof Error && "stdout" in e) {
      const err = e as Error & { stdout?: string };
      if (err.stdout) {
        console.log("\n[SEARCH RESULT]:");
        console.log(err.stdout.trim());
        return;
      }
    }
    console.error(`[Search error: ${e instanceof Error ? e.message : String(e)}]`);
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
  
  if (command === "search") {
    const query = args.slice(1).join(" ");
    if (!query) {
      console.error("Error: Please provide a search query.");
      console.log('Usage: traenupi search "your search query"');
      process.exit(1);
    }
    webSearch(query);
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
