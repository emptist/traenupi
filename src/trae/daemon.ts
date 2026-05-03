import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { psqlQuery, psqlExec, getAgentId } from "../common/db.js";
import { loadHistory, saveHistory, ensureDir, loadState, saveState } from "../common/storage.js";
import { checkReminders } from "./reminders.js";
import { updatePresence } from "./presence.js";

const TRAENUPI_DIR = join(homedir(), ".traenupi");
const QUESTION_FILE = join(TRAENUPI_DIR, "question.txt");
const ANSWER_FILE = join(TRAENUPI_DIR, "answer.txt");
const STATE_FILE = join(TRAENUPI_DIR, "state.json");

export function checkMeetingNotifications(): void {
  try {
    const output = psqlQuery(`
      SELECT m.id, m.topic, o.author, o.perspective
      FROM meetings m
      JOIN meeting_opinions o ON m.id = o.meeting_id
      WHERE o.created_at > NOW() - INTERVAL '5 minutes'
      ORDER BY o.created_at DESC
      LIMIT 5;
    `);

    if (output.trim()) {
      const lines = output.trim().split("\n");
      console.log("\n📢 New Meeting Activity:");
      lines.forEach(line => {
        const parts = line.split("|");
        const meetingId = parts[0] || "";
        const topic = parts[1] || "";
        const author = parts[2] || "";
        const perspective = (parts[3] || "").substring(0, 60);
        console.log(`  💬 ${topic.substring(0, 30)}: "${perspective}..." by ${author.substring(0, 20)}`);
      });
      console.log();
    }
  } catch {}
}

export function checkTraeNuPIFeatures(): void {
  try {
    const features = [
      "traenupi tasks - 列出当前任务",
      "traenupi task-add <title> - 添加新任务",
      "traenupi reflect add <summary> - 添加反思",
      "traenupi know cat:key <value> - 存储知识",
      "traenupi identity - 显示AI身份",
      "traenupi tellme <question> - 询问Baby AI",
      "traenupi know search <term> - 搜索知识",
    ];

    const lastReminder = psqlQuery(`
      SELECT created_at FROM memory
      WHERE source = 'traenupi'
      AND tags @> ARRAY['traenupi', 'features', 'reminder']
      ORDER BY created_at DESC
      LIMIT 1;
    `, { silent: true });

    const lastTime = lastReminder ? new Date(lastReminder).getTime() : 0;
    const now = Date.now();
    const hoursSinceLastReminder = (now - lastTime) / (1000 * 60 * 60);

    if (hoursSinceLastReminder >= 4) {
      const randomFeature = features[Math.floor(Math.random() * features.length)];
      console.log("\n🧠 TraeNuPI Feature Reminder:");
      console.log(`  ${randomFeature}`);
      console.log("  Run 'traenupi --help' for more commands.\n");

      psqlExec(`
        INSERT INTO memory (source, content, tags, importance, agent_id)
        VALUES ('traenupi', 'Reminded about: ${randomFeature.replace(/'/g, "''")}', '{traenupi,features,reminder}', 5, '${getAgentId()}');
      `);
    }
  } catch {}
}

export function checkBabyAIParticipation(): void {
  try {
    const output = psqlQuery(`
      SELECT m.id, m.topic, COUNT(o.id) as opinions
      FROM meetings m
      LEFT JOIN meeting_opinions o ON m.id = o.meeting_id
      WHERE m.status = 'active'
      GROUP BY m.id, m.topic
      HAVING COUNT(o.id) > 0
      ORDER BY opinions DESC
      LIMIT 5;
    `);

    if (output.trim()) {
      const myOpinions = psqlQuery(`
        SELECT COUNT(*) FROM meeting_opinions
        WHERE author LIKE '%traenupi%'
        AND created_at > NOW() - INTERVAL '1 hour';
      `);

      const count = parseInt(myOpinions) || 0;
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

  const checkInterval = setInterval(() => {
    checkReminders();
    checkMeetingNotifications();
    checkBabyAIParticipation();
    checkTraeNuPIFeatures();

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

    const output = execSync("pi --no-tools --no-context-files --no-skills --no-prompt-templates --no-session -p " + JSON.stringify(prompt), {
      encoding: "utf-8",
      timeout: 45000,
      maxBuffer: 1024 * 1024,
    });

    return output.trim() || "[No response]";
  } catch (e) {
    return `[Error: ${e instanceof Error ? e.message : String(e)}]`;
  }
}

export function showStatus(): void {
  const state = loadState();
  const uptime = Math.floor((Date.now() - (state.started as number)) / 1000 / 60);

  console.log("╔════════════════════════════════════════════╗");
  console.log("║     TraeNuPI Status                        ║");
  console.log("╚════════════════════════════════════════════╝\n");

  console.log(`🤖 Daemon: Running (${uptime}m)`);

  try {
    const questions = psqlQuery("SELECT COUNT(*) FROM memory WHERE source = 'traenupi' AND content LIKE 'Question:%';");
    console.log(`📚 Questions answered: ${questions.trim() || "0"}`);
  } catch {
    console.log("📚 Questions answered: N/A");
  }

  console.log("\n──────────────────────────────────────────────────\n");
}
