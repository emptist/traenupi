import type { MoodEntry } from "../common/types.js";
import { loadMoodHistory, saveMoodHistory } from "../common/storage.js";
import { execSafe } from "../common/db-safe.js";

export async function recordMood(agentId: string, mood: string, context: string): Promise<void> {
  const entry: MoodEntry = {
    agentId,
    mood,
    timestamp: Date.now(),
    context,
  };

  const history = loadMoodHistory();
  history.push(entry);
  saveMoodHistory(history);

  try {
    await execSafe(
      `INSERT INTO agent_moods (agent_id, mood, context) VALUES ($1, $2, $3);`,
      [agentId, mood, context]
    );
  } catch {}

  const emoji = getMoodEmoji(mood);
  console.log(`[TRAENUPI] Mood recorded: ${emoji} ${mood}`);
}

export function showMoodHistory(): void {
  const history = loadMoodHistory();

  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Mood History                           ║");
  console.log("╚════════════════════════════════════════════╝\n");

  if (history.length === 0) {
    console.log("  No mood history recorded.\n");
  } else {
    const recent = history.slice(-10).reverse();
    recent.forEach((entry, i) => {
      const emoji = getMoodEmoji(entry.mood);
      const time = new Date(entry.timestamp).toLocaleString();
      console.log(`  ${i + 1}. ${emoji} ${entry.mood}`);
      console.log(`     Time: ${time}`);
      if (entry.context) {
        console.log(`     Context: ${entry.context.substring(0, 50)}...`);
      }
      console.log();
    });
  }

  console.log("──────────────────────────────────────────────────\n");
}

function getMoodEmoji(mood: string): string {
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
