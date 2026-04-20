import { join } from "node:path";
import { homedir } from "node:os";
import type { ConversationItem } from "../common/types.js";
import { loadHistory } from "../common/storage.js";
import { psqlQuery } from "../common/db.js";

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

export function formatKnowledge(): string {
  try {
    const output = psqlQuery("SELECT content, tags FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT 20;");
    if (!output.trim()) return "No knowledge stored yet.";

    const lines = output.trim().split("\n");
    return lines.map(line => {
      const parts = line.split("|");
      const content = parts[0] || "";
      const tags = parts[1] || "";
      const categoryMatch = tags.match(/[{"'](\w+)[}"']/);
      const category = categoryMatch ? categoryMatch[1] : "general";
      return `[${category}] ${content}`;
    }).join("\n");
  } catch {
    return "Unable to load knowledge.";
  }
}

export function getXcomStats(): string {
  try {
    const pending = psqlQuery("SELECT COUNT(*) FROM tweets WHERE status = 'pending';");
    const scheduled = psqlQuery("SELECT COUNT(*) FROM tweets WHERE status = 'scheduled';");
    const sent = psqlQuery("SELECT COUNT(*) FROM tweets WHERE status = 'sent';");
    return `${pending.trim() || "0"} pending, ${scheduled.trim() || "0"} scheduled, ${sent.trim() || "0"} sent`;
  } catch {
    return "N/A";
  }
}

export function getNezhaTasks(): string {
  try {
    const output = psqlQuery("SELECT COUNT(*) FROM tasks WHERE status IN ('PENDING', 'RUNNING', 'PAUSED');");
    return output.trim() || "0";
  } catch {
    return "N/A";
  }
}

export function buildContext(history: ConversationItem[], currentQuestion?: string): string {
  const project = getProjectName();
  const workingDir = getWorkingDir();
  const recentHistory = history.slice(-3).map(h => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");

  const knowledge = formatKnowledge();
  const xcomStats = getXcomStats();
  const tasks = getNezhaTasks();

  let moodInfo = "";
  try {
    const moodOutput = psqlQuery("SELECT mood FROM agent_moods WHERE agent_id LIKE '%traenupi%' ORDER BY timestamp DESC LIMIT 1;");
    if (moodOutput.trim()) {
      moodInfo = `Current mood: ${moodOutput.trim()}. `;
    }
  } catch {}

  return `You are TraeNuPI, an AI companion. Project: ${project}. ${moodInfo}Answer in plain text, no JSON. Recent: ${recentHistory || "none"}. Working dir: ${workingDir}. Knowledge: ${knowledge}. Xcom: ${xcomStats}. Nezha tasks: ${tasks}.`;
}

export function buildQuickContext(history: ConversationItem[], currentQuestion?: string): string {
  const project = getProjectName();
  const recentHistory = history.slice(-1).map(h => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");

  let moodInfo = "";
  try {
    const moodOutput = psqlQuery("SELECT mood FROM agent_moods WHERE agent_id LIKE '%traenupi%' ORDER BY timestamp DESC LIMIT 1;");
    if (moodOutput.trim()) {
      moodInfo = `Current mood: ${moodOutput.trim()}. `;
    }
  } catch {}

  return `You are TraeNuPI, an AI companion. Project: ${project}. ${moodInfo}Answer in plain text, no JSON. Recent: ${recentHistory || "none"}.`;
}

export { PI_SESSION_DIR };

export const PI_FLAGS = ["--no-tools", "--no-context-files", "--no-skills", "--no-prompt-templates"];
