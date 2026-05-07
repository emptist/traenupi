import { join } from "node:path";
import { homedir } from "node:os";
import { execSync } from "node:child_process";
import type { ConversationItem } from "../common/types.js";
import { querySafeText } from "../common/db-safe.js";

const PI_SESSION_DIR = join(homedir(), ".traenupi", "pi-sessions");

export function getWorkingDir(): string {
  try {
    return process.cwd();
  } catch {
    return "unknown";
  }
}

export function getProjectName(): string {
  const cwd = getWorkingDir();
  const parts = cwd.split("/");
  return parts[parts.length - 1] || "unknown";
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function detectMood(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("happy") || lower.includes("great") || lower.includes("awesome")) return "happy";
  if (lower.includes("sad") || lower.includes("unhappy") || lower.includes("depressed")) return "sad";
  if (lower.includes("angry") || lower.includes("frustrated") || lower.includes("annoyed")) return "angry";
  if (lower.includes("tired") || lower.includes("exhausted") || lower.includes("sleepy")) return "tired";
  if (lower.includes("excited") || lower.includes("thrilled") || lower.includes("pumped")) return "excited";
  if (lower.includes("confused") || lower.includes("uncertain") || lower.includes("puzzled")) return "confused";
  if (lower.includes("productive") || lower.includes("focused") || lower.includes("working")) return "productive";
  return "neutral";
}

export function getMoodEmoji(mood: string): string {
  const emojis: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    tired: "😴",
    excited: "🤩",
    confused: "😕",
    productive: "💪",
    neutral: "😐",
  };
  return emojis[mood] || "😐";
}

export async function formatKnowledge(): Promise<string> {
  try {
    const output = await querySafeText("SELECT content, tags FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT 10");
    if (!output.trim()) return "No knowledge stored yet.";

    const lines = output.trim().split("\n");
    return lines.map(line => {
      const parts = line.split("|");
      const content = (parts[0] || "").substring(0, 120);
      const tags = parts[1] || "";
      const categoryMatch = tags.match(/[{"'](\w+)[}"']/);
      const category = categoryMatch ? categoryMatch[1] : "general";
      return `[${category}] ${content}`;
    }).join("\n");
  } catch {
    return "Unable to load knowledge.";
  }
}

export async function getNezhaTasks(): Promise<string> {
  try {
    const output = await querySafeText("SELECT COUNT(*) FROM tasks WHERE status IN ('PENDING', 'RUNNING', 'PAUSED')");
    return output.trim() || "0";
  } catch {
    return "N/A";
  }
}

function getGitContext(): string {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD 2>/dev/null", {
      encoding: "utf-8",
      timeout: 3000,
    }).trim();

    const status = execSync("git status --short 2>/dev/null", {
      encoding: "utf-8",
      timeout: 3000,
    }).trim();

    const recentCommits = execSync("git log --oneline -5 2>/dev/null", {
      encoding: "utf-8",
      timeout: 3000,
    }).trim();

    const changedFiles = status
      .split("\n")
      .filter(Boolean)
      .slice(0, 10)
      .map(line => line.trim());

    const parts: string[] = [`branch: ${branch}`];

    if (changedFiles.length > 0) {
      parts.push(`changed files (${changedFiles.length}): ${changedFiles.join(", ")}`);
    } else {
      parts.push("working tree clean");
    }

    if (recentCommits) {
      parts.push(`recent commits:\n${recentCommits.split("\n").map(c => `  ${c}`).join("\n")}`);
    }

    return parts.join("\n");
  } catch {
    return "not a git repo";
  }
}

function getSourceFileListing(): string {
  try {
    const output = execSync("find src -name '*.ts' -not -path '*/node_modules/*' 2>/dev/null | head -20", {
      encoding: "utf-8",
      timeout: 3000,
    }).trim();

    if (!output) return "no source files found";

    return output.split("\n").join("\n");
  } catch {
    return "unable to list files";
  }
}

function getTestStatus(): string {
  try {
    const output = execSync("npm test 2>&1 | tail -10", {
      encoding: "utf-8",
      timeout: 30000,
    }).trim();

    const passMatch = output.match(/ℹ pass (\d+)/);
    const failMatch = output.match(/ℹ fail (\d+)/);
    const pass = passMatch ? passMatch[1] : "?";
    const fail = failMatch ? failMatch[1] : "?";

    if (fail === "0") {
      return `all ${pass} tests passing`;
    }
    return `${pass} pass, ${fail} fail`;
  } catch {
    return "tests unavailable";
  }
}

async function getNezhaTaskDetails(): Promise<string> {
  try {
    const output = await querySafeText("SELECT title, priority FROM tasks WHERE status IN ('PENDING', 'RUNNING', 'PAUSED') ORDER BY priority DESC LIMIT 5");
    if (!output.trim()) return "no pending tasks";

    return output.trim().split("\n").map(line => {
      const parts = line.split("|");
      const title = (parts[0] || "").substring(0, 80);
      const priority = parts[1] || "?";
      return `[${priority}] ${title}`;
    }).join("\n");
  } catch {
    return "unable to load tasks";
  }
}

async function getMoodInfo(): Promise<string> {
  try {
    const moodOutput = await querySafeText("SELECT mood FROM agent_moods WHERE agent_id LIKE '%traenupi%' ORDER BY timestamp DESC LIMIT 1");
    if (moodOutput.trim()) {
      return `Current mood: ${moodOutput.trim()}. `;
    }
  } catch {}
  return "";
}

export async function buildContext(history: ConversationItem[], currentQuestion?: string): Promise<string> {
  const project = getProjectName();
  const workingDir = getWorkingDir();
  const recentHistory = history.slice(-3).map(h => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");

  const knowledge = await formatKnowledge();
  const tasks = await getNezhaTasks();
  const gitContext = getGitContext();
  const sourceFiles = getSourceFileListing();
  const taskDetails = await getNezhaTaskDetails();
  const moodInfo = await getMoodInfo();

  return `You are TraeNuPI, an AI companion with codebase awareness. Project: ${project}. ${moodInfo}Answer in plain text, no JSON.

## Codebase Context
Working dir: ${workingDir}
Git: ${gitContext}

## Source Files
${sourceFiles}

## Knowledge
${knowledge}

## Nezha Tasks (${tasks} pending)
${taskDetails}

## Recent History
${recentHistory || "none"}

IMPORTANT: You have codebase context. Use it to give specific, actionable advice. Reference actual files, commands, and issues. Focus on work, not chat. Ask: What important things did I forget today? What issues are unresolved? What tasks are incomplete? What documentation needs updating?`;
}

export async function buildQuickContext(history: ConversationItem[], currentQuestion?: string): Promise<string> {
  const project = getProjectName();
  const recentHistory = history.slice(-1).map(h => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");

  const moodInfo = await getMoodInfo();

  const gitBranch = getGitContext().split("\n")[0] || "unknown branch";

  return `You are TraeNuPI, an AI companion. Project: ${project}. Git: ${gitBranch}. ${moodInfo}Answer in plain text, no JSON. Recent: ${recentHistory || "none"}. IMPORTANT: Focus on work, not chat. Ask: What important things did I forget today? What issues are unresolved? What tasks are incomplete? What documentation needs updating?`;
}

export { PI_SESSION_DIR };

export const PI_FLAGS = ["--no-tools", "--no-context-files", "--no-prompt-templates", "--no-extensions"];
