import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { getAgentId } from "../common/db.js";
import { querySafe, execSafe } from "../common/db-safe.js";
import { loadHistory, saveHistory, ensureDir, loadState, saveState } from "../common/storage.js";
import { checkReminders } from "./reminders.js";
import { updatePresence } from "./presence.js";

const TRAENUPI_DIR = join(homedir(), ".traenupi");
const QUESTION_FILE = join(TRAENUPI_DIR, "question.txt");
const ANSWER_FILE = join(TRAENUPI_DIR, "answer.txt");
const STATE_FILE = join(TRAENUPI_DIR, "state.json");

interface MeetingNotificationRow {
  id: string;
  topic: string;
  author: string;
  perspective: string;
}

interface MeetingStatsRow {
  id: string;
  topic: string;
  opinions: string;
}

export async function checkMeetingNotifications(): Promise<void> {
  try {
    const rows = await querySafe<MeetingNotificationRow>(`
      SELECT m.id, m.topic, o.author, o.perspective
      FROM meetings m
      JOIN meeting_opinions o ON m.id = o.meeting_id
      WHERE o.created_at > NOW() - INTERVAL '5 minutes'
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    if (rows.length > 0) {
      console.log("\n📢 New Meeting Activity:");
      rows.forEach(row => {
        const topic = (row.topic || "").substring(0, 30);
        const perspective = (row.perspective || "").substring(0, 60);
        const author = (row.author || "").substring(0, 20);
        console.log(`  💬 ${topic}: "${perspective}..." by ${author}`);
      });
      console.log();
    }
  } catch {}
}

export async function checkTraeNuPIFeatures(): Promise<void> {
  try {
    const features = [
      "traenupi tasks - List current tasks",
      "traenupi task-add <title> - Add a new task",
      "traenupi reflect add <summary> - Add a reflection",
      "traenupi know cat:key <value> - Store knowledge",
      "traenupi identity - Show AI identity",
      "traenupi tellme <question> - Ask Baby AI",
      "traenupi know search <term> - Search knowledge",
    ];

    const rows = await querySafe<{ created_at: string }>(`
      SELECT created_at FROM memory
      WHERE source = 'traenupi'
      AND tags @> ARRAY['traenupi', 'features', 'reminder']
      ORDER BY created_at DESC
      LIMIT 1
    `, [], { silent: true });

    const lastTime = rows.length > 0 ? new Date(rows[0].created_at).getTime() : 0;
    const now = Date.now();
    const hoursSinceLastReminder = (now - lastTime) / (1000 * 60 * 60);

    if (hoursSinceLastReminder >= 4) {
      const randomFeature = features[Math.floor(Math.random() * features.length)];
      console.log("\n🧠 TraeNuPI Feature Reminder:");
      console.log(`  ${randomFeature}`);
      console.log("  Run 'traenupi --help' for more commands.\n");

      await execSafe(`
        INSERT INTO memory (source, content, tags, importance, agent_id)
        VALUES ($1, $2, $3, $4, $5)
      `, ['traenupi', `Reminded about: ${randomFeature}`, '{traenupi,features,reminder}', 5, getAgentId()]);
    }
  } catch {}
}

export async function checkBabyAIParticipation(): Promise<void> {
  try {
    const rows = await querySafe<MeetingStatsRow>(`
      SELECT m.id, m.topic, COUNT(o.id) as opinions
      FROM meetings m
      LEFT JOIN meeting_opinions o ON m.id = o.meeting_id
      WHERE m.status = 'active'
      GROUP BY m.id, m.topic
      HAVING COUNT(o.id) > 0
      ORDER BY opinions DESC
      LIMIT 5
    `);

    if (rows.length > 0) {
      const countRows = await querySafe<{ count: string }>(`
        SELECT COUNT(*) as count FROM meeting_opinions
        WHERE author LIKE '%traenupi%'
        AND created_at > NOW() - INTERVAL '1 hour'
      `);

      const count = parseInt(countRows[0]?.count || "0") || 0;
      if (count < 3) {
        console.log("\n🤖 Baby AI Reminder: Consider participating in active meetings!");
        console.log("  Use 'traenupi meeting' to see active discussions.\n");
      }
    }
  } catch {}
}

export function runDaemon(): void {
  ensureDir();

  const state = loadState();
  state.started = state.started || Date.now();
  saveState(state);

  console.log("╔════════════════════════════════════════════╗");
  console.log("║     TraeNuPI Daemon Started                ║");
  console.log("╚════════════════════════════════════════════╝\n");

  const agentId = getAgentId();
  updatePresence(agentId, "active", "Running daemon", "traenupi");

  let presenceUpdateCounter = 0;

  const checkInterval = setInterval(async () => {
    try {
      await checkReminders();
      await checkMeetingNotifications();
      await checkBabyAIParticipation();
      await checkTraeNuPIFeatures();

      presenceUpdateCounter++;
      if (presenceUpdateCounter >= 120) {
        presenceUpdateCounter = 0;
        const currentState = loadState();
        const uptime = Math.floor((Date.now() - (currentState.started as number)) / 1000 / 60);
        updatePresence(agentId, "active", `Running for ${uptime} minutes`, "traenupi");
      }

      if (existsSync(QUESTION_FILE)) {
        try {
          const question = readFileSync(QUESTION_FILE, "utf-8").trim();
          if (question) {
            console.log(`\n[QUESTION] ${question}`);
            const history = loadHistory();
            const answer = askPiSimple(question, history);
            writeFileSync(ANSWER_FILE, answer);
            console.log(`[ANSWER] Written to ${ANSWER_FILE}`);
            history.push({ question, answer, time: Date.now() });
            saveHistory(history);
            writeFileSync(QUESTION_FILE, "");
          }
        } catch (e) {
          console.error("[DAEMON ERROR]", e);
        }
      }
    } catch (e) {
      console.error("[DAEMON LOOP ERROR]", e);
    }
  }, 500);

  process.on("SIGINT", () => {
    clearInterval(checkInterval);
    console.log("\n[TRAENUPI] Daemon stopped.");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    clearInterval(checkInterval);
    console.log("\n[TRAENUPI] Daemon stopped.");
    process.exit(0);
  });
}

function askPiSimple(question: string, history: { question: string; answer: string; time: number }[]): string {
  try {
    const recentHistory = history.slice(-3).map(h => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");
    const prompt = `You are TraeNuPI, an AI companion. Recent: ${recentHistory || "none"}. Answer in plain text.\n\nQuestion: ${question}`;

    const output = execSync("pi --no-tools --no-context-files --no-prompt-templates --no-session -p " + JSON.stringify(prompt), {
      encoding: "utf-8",
      timeout: 45000,
      maxBuffer: 1024 * 1024,
    });

    return output.trim() || "[No response]";
  } catch (e) {
    return `[Error: ${e instanceof Error ? e.message : String(e)}]`;
  }
}

export async function showStatus(): Promise<void> {
  const state = loadState();
  const uptime = Math.floor((Date.now() - (state.started as number)) / 1000 / 60);

  console.log("╔════════════════════════════════════════════╗");
  console.log("║     TraeNuPI Status                        ║");
  console.log("╚════════════════════════════════════════════╝\n");

  console.log(`🤖 Daemon: Running (${uptime}m)`);

  try {
    const rows = await querySafe<{ count: string }>("SELECT COUNT(*) as count FROM memory WHERE source = $1 AND content LIKE 'Question:%'", ['traenupi']);
    console.log(`📚 Questions answered: ${rows[0]?.count || "0"}`);
  } catch {
    console.log("📚 Questions answered: N/A");
  }

  console.log("\n──────────────────────────────────────────────────\n");
}
