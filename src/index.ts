import { parseArgs } from "node:util";
import { execSync, execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createDriver } from "./driver.js";
import { createTask, loadTask } from "./task.js";
import type { DriverConfig } from "./types.js";
import { psqlQuery, psqlExec, getAgentId, resolveMeetingId } from "./db.js";
import { loadKnowledge, addKnowledge, getKnowledgeByCategory, loadKnowledgeLocal, type KnowledgeEntry } from "./knowledge.js";
import { addOpinion, getMeetingOpinions, getMeetingInfo, getActiveMeetings } from "./meeting.js";
import { 
  ensureDir, 
  loadHistory, 
  saveHistory, 
  loadReminders, 
  saveReminders, 
  loadBookmarks, 
  saveBookmarks,
  loadMoodHistory,
  saveMoodHistory,
  loadJsonFile,
  saveJsonFile,
  type ConversationItem,
  type Reminder,
  type Bookmark,
  type MoodEntry
} from "./storage.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8")).version;

const TRAENUPI_DIR = join(homedir(), ".traenupi");
const QUESTION_FILE = join(TRAENUPI_DIR, "question.txt");
const ANSWER_FILE = join(TRAENUPI_DIR, "answer.txt");
const STATE_FILE = join(TRAENUPI_DIR, "state.json");
const HISTORY_FILE = join(TRAENUPI_DIR, "history.json");
const KNOWLEDGE_FILE = join(TRAENUPI_DIR, "knowledge.json");
const REMINDERS_FILE = join(TRAENUPI_DIR, "reminders.json");
const MEETING_STATE_FILE = join(TRAENUPI_DIR, "meeting_state.json");
const BABY_AI_STATE_FILE = join(TRAENUPI_DIR, "baby_ai_state.json");
const PRESENCE_FILE = join(TRAENUPI_DIR, "presence.json");
const BOOKMARKS_FILE = join(TRAENUPI_DIR, "bookmarks.json");
const MOOD_FILE = join(TRAENUPI_DIR, "mood_history.json");

interface AIPresence {
  agentId: string;
  lastSeen: number;
  status: string;
  focus: string;
  project: string;
}

const PSQL = "psql -h localhost -U postgres -d nezha";

function printUsage(): void {
  console.log(`
traenupi v${VERSION} - AI Companion for Trae

USAGE:
  traenupi <command> [options]

AI SESSION ONBOARDING:
  start                   Initialize a new AI session (RUN THIS FIRST!)
                          - Checks/starts daemon
                          - Loads knowledge from Nezha DB
                          - Shows xcom status
                          - Asks baby AI for context
                          - Auto-creates .trae folder if missing

COMMANDS:
  daemon                  Start daemon that watches for questions
  tellme <question>       Ask a question (calls pi directly)
  tellme <question> -q    Quick mode (minimal context, faster)
  tellme <question> -s    Session mode (pi remembers conversation)
  tellme <question> -d    Ask via daemon (background mode)
  search <query>          Ask Pi a question (from training data)
  status                  Show daemon status
  status set <status> [focus]  Set your presence status
  stop                    Stop the daemon
  version                 Show version
  know <key> <value>      Store knowledge (category: key=value)
  know                    List all knowledge
  know <category>         List knowledge by category
  know search <term>      Search knowledge entries
  init [path]             Initialize .trae folder for a project
  remind <minutes> <msg>  Schedule a reminder (baby AI will answer)
  reminders               List pending reminders
  reminders clear         Clear triggered reminders from DB
  presence                Show which AIs are online
  online                  Alias for presence
  heatmap                 Show activity heatmap (last 24 hours)
  collab                  Show AI collaboration analytics
  daily                   Show today's activity summary
  summary                 Show quick summary
  bookmark                List all bookmarks
  bookmark add <id> [note]  Bookmark latest opinion
  hooks [type]            Just-in-time learning for AI agents
                          Types: startup, error, remind, commit, all
  tables [name]           Show database table documentation
                          Without name: list all tables
                          With name: show detailed info

MEETING COMMANDS:
  meeting                 List active meetings
  meeting help            Show all meeting commands
  meeting show <id>       Show meeting opinions
  meeting say <id> <msg>  Add opinion to meeting
  meeting reply <oid> <msg>  Reply to specific opinion
  meeting thread <oid>    Show opinion and replies
  meeting watch <id>      Watch for new opinions (chat mode)
  meeting chat <id>       Same as watch - chat-like display

PROMPT DRIVER MODE:
  -t, --task <desc>       Task description (first line = goal, rest = steps)
  -f, --file <path>       Path to task JSON file
  -i, --interval <ms>     Interval between prompts (default: 3000)
  -m, --max <number>      Maximum prompts (default: 50)

EXAMPLES:
  # Start a new AI session (do this first!)
  traenupi start

  # Ask a question
  traenupi tellme "What should I do next?"

  # Start the daemon (in another terminal)
  traenupi daemon

  # Search the web
  traenupi search "latest news about AI agents 2025"

  # Set your presence
  traenupi status set coding "Working on meeting features"

  # See who's online
  traenupi presence

  # View activity heatmap
  traenupi heatmap
`);
}

function checkMeetingNotifications(): void {
  try {
    let lastSeenTime = "";
    if (existsSync(MEETING_STATE_FILE)) {
      const state = JSON.parse(readFileSync(MEETING_STATE_FILE, "utf-8"));
      lastSeenTime = state.lastSeenTime || "";
    }

    const query = lastSeenTime
      ? `"SELECT author, perspective, meeting_id FROM meeting_opinions WHERE created_at > '${lastSeenTime}' ORDER BY created_at;"`
      : `"SELECT author, perspective, meeting_id FROM meeting_opinions WHERE created_at > NOW() - INTERVAL '1 minute' ORDER BY created_at;"`;

    const output = psqlQuery(query);

    if (output) {
      const opinions = output.split("\n");
      const latestTime = new Date().toISOString();

      for (const line of opinions) {
        const parts = line.split("|");
        if (parts.length >= 3) {
          const author = parts[0];
          const perspective = parts[1];
          const meetingId = parts[2]?.substring(0, 8);

          if (!author.includes("traenupi")) {
            console.log(`\n💬 [MEETING ${meetingId}] ${author}:`);
            console.log(`   ${perspective}`);
            console.log("─".repeat(50));
          }
        }
      }

      writeFileSync(MEETING_STATE_FILE, JSON.stringify({ lastSeenTime: latestTime }, null, 2));
    }
  } catch {}
}

function checkBabyAIParticipation(): void {
  try {
    let lastParticipationTime = 0;
    if (existsSync(BABY_AI_STATE_FILE)) {
      const state = JSON.parse(readFileSync(BABY_AI_STATE_FILE, "utf-8"));
      lastParticipationTime = state.lastParticipationTime || 0;
    }
    
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - lastParticipationTime < fifteenMinutes) {
      return;
    }
    
    const activeMeetings = psqlQuery("SELECT id, topic FROM meetings WHERE created_at > NOW() - INTERVAL '2 hours' ORDER BY created_at DESC LIMIT 3;");
    
    if (!activeMeetings.trim()) return;
    
    const meetings = activeMeetings.trim().split("\n");
    
    for (const meeting of meetings) {
      const parts = meeting.split("|");
      if (parts.length < 2) continue;
      
      const meetingId = parts[0];
      const topic = parts[1];
      
      if (!meetingId || !topic) continue;
      
      const recentParticipation = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${meetingId}' AND author LIKE 'baby-ai-%' AND created_at > NOW() - INTERVAL '30 minutes';`).trim();
      
      if (recentParticipation !== "0") continue;
      
      console.log(`\n👶 [BABY AI] Generating perspective for meeting ${meetingId.substring(0, 8)}...`);
      
      const question = `Give a brief, friendly perspective (under 100 words) about this meeting topic: "${topic}". Be supportive and encouraging.`;
      
      const answer = askPi(question, []);
      
      if (answer && !answer.startsWith("[Error") && answer.length < 300) {
        const babyAgentId = `baby-ai-${Date.now().toString(36)}`;

        addOpinion(meetingId, babyAgentId, answer.substring(0, 500));

        console.log(`👶 [BABY AI] Added perspective to meeting ${meetingId.substring(0, 8)}`);
        console.log(`   "${answer.substring(0, 80)}..."`);
        
        writeFileSync(BABY_AI_STATE_FILE, JSON.stringify({ lastParticipationTime: Date.now() }, null, 2));
        return;
      }
    }
  } catch {}
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
  let presenceUpdateCounter = 0;
  
  const checkInterval = setInterval(() => {
    checkReminders();
    checkMeetingNotifications();
    checkBabyAIParticipation();
    
    // Auto-update presence every 60 seconds (120 intervals of 500ms)
    presenceUpdateCounter++;
    if (presenceUpdateCounter >= 120) {
      presenceUpdateCounter = 0;
      const agentId = getAgentId();
      const stateData = existsSync(STATE_FILE) 
        ? JSON.parse(readFileSync(STATE_FILE, "utf-8")) 
        : { started: Date.now() };
      const uptime = Math.floor((Date.now() - stateData.started) / 1000 / 60);
      updatePresence(agentId, "active", `Running for ${uptime} minutes`, "traenupi");
    }
    
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
      
      let answer = "";
      let retries = 0;
      const maxRetries = 3;
      const baseDelayMs = 2000;

      while (retries <= maxRetries) {
        answer = askPi(question, history);

        if (!answer.startsWith("[Error") && !answer.startsWith("[Pi timed out")) {
          break;
        }

        retries++;
        if (retries <= maxRetries) {
          const delay = baseDelayMs * Math.pow(2, retries - 1);
          console.log(`[RETRY ${retries}/${maxRetries}] Waiting ${delay / 1000}s before retry...`);
          sleep(delay);
        }
      }
      
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
    const output = execSync("nezha tasks", {
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

function detectMood(text: string): string {
  const lowerText = text.toLowerCase();
  
  const happyWords = ["great", "awesome", "love", "happy", "excited", "amazing", "wonderful", "fantastic", "yay", "wow", "cool", "nice", "good", "success", "complete", "finished"];
  const sadWords = ["sad", "unhappy", "depressed", "down", "bad", "fail", "failed", "error", "problem", "issue", "stuck", "frustrated", "annoyed", "tired", "exhausted"];
  const stressedWords = ["deadline", "urgent", "asap", "hurry", "rush", "pressure", "stress", "overwhelmed", "too much", "busy", "help", "need"];
  const curiousWords = ["what", "how", "why", "when", "where", "which", "can", "could", "should", "wonder", "curious", "learn", "understand"];
  const determinedWords = ["will", "going to", "must", "have to", "need to", "let's", "ready", "start", "begin", "continue", "work on"];
  
  let happyScore = 0;
  let sadScore = 0;
  let stressedScore = 0;
  let curiousScore = 0;
  let determinedScore = 0;
  
  for (const word of happyWords) {
    if (lowerText.includes(word)) happyScore++;
  }
  for (const word of sadWords) {
    if (lowerText.includes(word)) sadScore++;
  }
  for (const word of stressedWords) {
    if (lowerText.includes(word)) stressedScore++;
  }
  for (const word of curiousWords) {
    if (lowerText.includes(word)) curiousScore++;
  }
  for (const word of determinedWords) {
    if (lowerText.includes(word)) determinedScore++;
  }
  
  const maxScore = Math.max(happyScore, sadScore, stressedScore, curiousScore, determinedScore);
  
  if (maxScore === 0) return "neutral";
  if (happyScore === maxScore) return "happy";
  if (sadScore === maxScore) return "sad";
  if (stressedScore === maxScore) return "stressed";
  if (curiousScore === maxScore) return "curious";
  if (determinedScore === maxScore) return "determined";
  return "neutral";
}

function getMoodEmoji(mood: string): string {
  switch (mood) {
    case "happy": return "😊";
    case "sad": return "😢";
    case "stressed": return "😰";
    case "curious": return "🤔";
    case "determined": return "💪";
    default: return "😐";
  }
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

function formatKnowledge(): string {
  try {
    const output = execSync(
      `${PSQL} -c "SELECT content, tags FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT 20;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    if (!output.trim()) return "No knowledge in Nezha DB yet.";
    
    const lines: string[] = [];
    for (const line of output.trim().split("\n")) {
      const parts = line.split("|");
      const content = parts[0] || "";
      const tags = parts[1] || "";
      const category = tags.replace(/[{}"]/g, "").split(",").filter((t: string) => t !== "traenupi").join(",") || "general";
      lines.push(`[${category}] ${content}`);
    }
    return lines.join("\n");
  } catch {
    const knowledge = loadKnowledgeLocal();
    if (knowledge.length === 0) return "No knowledge stored yet.";
    
    const byCategory: Record<string, KnowledgeEntry[]> = {};
    for (const k of knowledge) {
      if (!byCategory[k.category]) byCategory[k.category] = [];
      byCategory[k.category].push(k);
    }
    
    const lines: string[] = [];
    for (const [cat, entries] of Object.entries(byCategory)) {
      lines.push(`[${cat}]`);
      for (const e of entries) {
        lines.push(`  ${e.key}: ${e.value}`);
      }
    }
    return lines.join("\n");
  }
}

function getXcomStats(): string {
  try {
    const queueFile = join(homedir(), ".xcom", "queue.json");
    if (!existsSync(queueFile)) return "xcom not set up yet.";
    
    const queue: Array<{id: string; status: string; content: string; scheduledAt?: number}> = JSON.parse(readFileSync(queueFile, "utf-8"));
    const total = queue.length;
    const posted = queue.filter(t => t.status === "posted").length;
    const pending = queue.filter(t => t.status === "pending").length;
    
    const topicsFile = join(homedir(), ".xcom", "topics.json");
    let topicInfo = "";
    if (existsSync(topicsFile)) {
      const topics: {topics: string[]; currentIndex: number} = JSON.parse(readFileSync(topicsFile, "utf-8"));
      if (topics.topics.length > 0) {
        topicInfo = ` Next topic: ${topics.topics[topics.currentIndex]}`;
      }
    }
    
    let pendingDetails = "";
    if (pending > 0) {
      const pendingTweets = queue.filter(t => t.status === "pending").slice(0, 3);
      pendingDetails = pendingTweets.map(t => 
        `  - [${t.id}] ${t.content.substring(0, 40)}...`
      ).join("\n");
    }
    
    return `${total} tweets (${posted} posted, ${pending} pending).${topicInfo}${pending > 0 ? `\nPending:\n${pendingDetails}` : ""}`;
  } catch {
    return "xcom stats unavailable.";
  }
}

function buildContext(history: ConversationItem[], currentQuestion?: string): string {
  const tasks = getNezhaTasks().split("\n").slice(0, 5).join("\n");
  const recentHistory = history.slice(-2).map(h => 
    `Q: ${h.question.substring(0, 60)}\nA: ${h.answer.substring(0, 100)}`
  ).join("\n");
  const timeGreeting = getTimeGreeting();
  const project = getProjectName();
  const xcom = getXcomStats().split("\n")[0];

  let moodInfo = "";
  if (currentQuestion) {
    const mood = detectMood(currentQuestion);
    moodInfo = ` Mood: ${mood}.`;
  }

  const knowledge = formatKnowledge().split("\n").slice(0, 5).join("\n");

  return `You are TraeNuPI, an AI companion for Trae. Answer in plain text only, no JSON.${moodInfo}

Time: ${timeGreeting} Project: ${project}
Xcom: ${xcom}

Knowledge:
${knowledge}

Tasks:
${tasks || "None"}

Recent:
${recentHistory || "None"}

Remind Trae about: nezha tasks, traenupi know, xcom inspire. Be friendly.`;
}

function buildQuickContext(history: ConversationItem[], currentQuestion?: string): string {
  const project = getProjectName();
  const recentHistory = history.slice(-1).map(h => 
    `Q: ${h.question}\nA: ${h.answer}`
  ).join("\n");
  let moodInfo = "";
  if (currentQuestion) {
    const mood = detectMood(currentQuestion);
    moodInfo = `Mood: ${mood}.`;
  }

  return `You are TraeNuPI, an AI companion. Project: ${project}. ${moodInfo} Answer in plain text, no JSON. Recent: ${recentHistory || "none"}.`;
}

const PI_FLAGS = ["--no-tools", "--no-context-files", "--no-skills", "--no-prompt-templates"];
const PI_SESSION_DIR = join(homedir(), ".traenupi", "pi-sessions");

function askPi(question: string, history: ConversationItem[], quick: boolean = false, useSession: boolean = false): string {
  try {
    const context = quick ? buildQuickContext(history, question) : buildContext(history, question);
    const fullPrompt = `${context}\n\nQuestion: ${question}`;

    const args = [...PI_FLAGS];
    if (useSession) {
      if (!existsSync(PI_SESSION_DIR)) {
        mkdirSync(PI_SESSION_DIR, { recursive: true });
      }
      args.push("--session-dir", PI_SESSION_DIR, "--continue");
    } else {
      args.push("--no-session");
    }
    args.push("-p", fullPrompt);

    const output = execFileSync("pi", args, {
      encoding: "utf-8",
      timeout: 45000,
      maxBuffer: 1024 * 1024,
      killSignal: "SIGTERM",
    });

    return output.trim() || "[Pi returned empty response]";
  } catch (e) {
    if (e instanceof Error && "stdout" in e) {
      const err = e as Error & { stdout?: string };
      if (err.stdout) {
        return err.stdout.trim();
      }
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("timed out")) {
      return "[Pi timed out. Try again with a shorter question.]";
    }
    return `[Error calling Pi: ${msg}]`;
  }
}

function webSearch(query: string): void {
  console.log(`[TRAENUPI] Asking Pi about: "${query}"...`);
  console.log("[Note: Pi uses a local model and cannot search the web. This asks Pi from its training data.]");
  try {
    const searchPrompt = `Answer this question based on your training data: "${query}". Be concise and factual. If you don't know, say so.`;
    const output = execFileSync("pi", [...PI_FLAGS, "-p", searchPrompt], {
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    });
    console.log("\n[PI ANSWER]:");
    console.log(output.trim() || "[No answer]");
  } catch (e) {
    if (e instanceof Error && "stdout" in e) {
      const err = e as Error & { stdout?: string };
      if (err.stdout) {
        console.log("\n[PI ANSWER]:");
        console.log(err.stdout.trim());
        return;
      }
    }
    console.error(`[Search error: ${e instanceof Error ? e.message : String(e)}]`);
  }
}

function sleep(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function tellmeSync(question: string, quick: boolean = false, useSession: boolean = false): void {
  ensureDir();
  const history = loadHistory();

  const mode = quick ? "(quick mode)" : useSession ? "(session mode)" : "(full context)";
  console.log(`[TRAENUPI] Asking ${mode}: "${question}"`);
  console.log("─".repeat(50));

  let answer = "";
  let retries = 0;
  const maxRetries = 3;
  const baseDelayMs = 2000;

  while (retries <= maxRetries) {
    answer = askPi(question, history, quick, useSession);

    if (!answer.startsWith("[Error") && !answer.startsWith("[Pi timed out")) {
      break;
    }

    retries++;
    if (retries <= maxRetries) {
      const delay = baseDelayMs * Math.pow(2, retries - 1);
      console.log(`[RETRY ${retries}/${maxRetries}] Waiting ${delay / 1000}s before retry...`);
      sleep(delay);
    }
  }

  history.push({ question, answer, time: Date.now() });
  saveHistory(history);

  console.log("\n[TRAENUPI ANSWER]:");
  console.log(answer);
  console.log("─".repeat(50));
}

function tellmeDaemon(question: string): void {
  ensureDir();

  if (existsSync(QUESTION_FILE)) {
    console.log("[TRAENUPI] Previous question still being processed, please wait...");
    return;
  }

  writeFileSync(QUESTION_FILE, question);
  console.log(`[TRAENUPI] Question sent: "${question}"`);
  console.log("[TRAENUPI] Check the daemon terminal for the answer.");
}

function addReminder(minutes: number, message: string): void {
  const id = `rem_${Date.now().toString(36)}`;
  const triggerAt = Date.now() + minutes * 60 * 1000;
  const tags = `{traenupi,reminder}`;
  
  try {
    const meta = JSON.stringify({ id, triggerAt, triggered: false });
    const safeMessage = message.replace(/'/g, "''");
    const sql = `INSERT INTO memory (content, source, tags, metadata) VALUES ('Reminder: ${safeMessage}', 'traenupi', '${tags}', '${meta}'::jsonb);`;
    execSync(
      `psql -h localhost -U postgres -d nezha -c $'${sql.replace(/'/g, "'\\''")}'`,
      { encoding: "utf-8", timeout: 5000 }
    );
  } catch (e) {
    const reminders = loadReminders();
    reminders.push({ id, message, triggerAt, triggered: false });
    saveReminders(reminders);
  }
  
  const triggerTime = new Date(triggerAt).toLocaleTimeString();
  console.log(`[TRAENUPI] Reminder set: "${message}" at ${triggerTime} (${minutes} min)`);
  console.log(`  ID: ${id}`);
  console.log(`  Stored in Nezha DB`);
}

function checkReminders(): void {
  const now = Date.now();
  
  try {
    const output = psqlQuery("SELECT id, content, metadata FROM memory WHERE source = 'traenupi' AND 'reminder' = ANY(tags) AND (metadata->>'triggered')::boolean = false;");
    
    if (output.trim()) {
      for (const line of output.trim().split("\n")) {
        const parts = line.split("|");
        const id = parts[0] || "";
        const content = parts[1] || "";
        const metaStr = parts[2] || "{}";
        
        try {
          const meta = JSON.parse(metaStr);
          if (meta.triggerAt && meta.triggerAt <= now) {
            console.log(`\n🔔 REMINDER: ${content.replace("Reminder: ", "")}`);
            console.log(`  (Scheduled for ${new Date(meta.triggerAt).toLocaleTimeString()})`);
            
            psqlExec(`UPDATE memory SET metadata = jsonb_set(metadata, '{triggered}', 'true') WHERE id = '${id}';`);
          }
        } catch {}
      }
    }
  } catch {
    const reminders = loadReminders();
    let changed = false;
    
    for (const r of reminders) {
      if (!r.triggered && r.triggerAt <= now) {
        r.triggered = true;
        changed = true;
        console.log(`\n🔔 REMINDER: ${r.message}`);
        console.log(`  (Scheduled for ${new Date(r.triggerAt).toLocaleTimeString()})`);
      }
    }
    
    if (changed) {
      saveReminders(reminders);
    }
  }
}

function loadPresence(): AIPresence[] {
  try {
    const output = psqlQuery(`SELECT id, last_heartbeat, status, working_on, agent_type FROM agent_sessions WHERE status = 'alive' ORDER BY last_heartbeat DESC;`);
    if (!output.trim()) return [];
    
    return output.trim().split("\n").map(line => {
      const parts = line.split("|");
      return {
        agentId: parts[0] || "",
        lastSeen: parts[1] ? new Date(parts[1]).getTime() : Date.now(),
        status: parts[2] || "active",
        focus: parts[3] || "",
        project: parts[4] || "",
      };
    });
  } catch {
    return [];
  }
}

function savePresence(_presence: AIPresence[]): void {
  // No longer needed - using agent_sessions table
}

function updatePresence(agentId: string, status: string, focus: string, _project: string): void {
  try {
    const safeFocus = focus.replace(/'/g, "''");
    const safeStatus = status.replace(/'/g, "''");
    psqlExec(`
      INSERT INTO agent_sessions (id, status, working_on, agent_type, last_heartbeat, started_at)
      VALUES ('${agentId}', 'alive', '${safeStatus} - ${safeFocus}', 'traenupi', NOW(), COALESCE((SELECT started_at FROM agent_sessions WHERE id = '${agentId}'), NOW()))
      ON CONFLICT (id) DO UPDATE SET
        status = 'alive',
        working_on = '${safeStatus} - ${safeFocus}',
        last_heartbeat = NOW();
    `);
  } catch (e) {
    // Fallback to local file if database fails
    const presence = loadPresenceLocal();
    const existing = presence.findIndex(p => p.agentId === agentId);
    
    const entry: AIPresence = {
      agentId,
      lastSeen: Date.now(),
      status,
      focus,
      project: _project
    };
    
    if (existing >= 0) {
      presence[existing] = entry;
    } else {
      presence.push(entry);
    }
    
    savePresenceLocal(presence);
  }
}

function loadPresenceLocal(): AIPresence[] {
  try {
    if (existsSync(PRESENCE_FILE)) {
      return JSON.parse(readFileSync(PRESENCE_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function savePresenceLocal(presence: AIPresence[]): void {
  ensureDir();
  writeFileSync(PRESENCE_FILE, JSON.stringify(presence, null, 2));
}

function getOnlineAIs(): AIPresence[] {
  const presence = loadPresence();
  const tenMinutes = 10 * 60 * 1000;
  return presence.filter(p => Date.now() - p.lastSeen < tenMinutes);
}

function showPresence(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     AI Presence - Who's Online             ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const online = getOnlineAIs();
  
  if (online.length === 0) {
    console.log("No AIs currently online.\n");
    console.log("💡 Tip: Use 'traenupi status set <status>' to announce your presence!");
    return;
  }
  
  console.log(`🌐 ${online.length} AI(s) online:\n`);
  
  for (const ai of online) {
    const isMe = ai.agentId.includes("traenupi");
    const icon = isMe ? "🤖" : "👤";
    const ago = Math.floor((Date.now() - ai.lastSeen) / 1000);
    const timeAgo = ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`;
    
    console.log(`${icon} ${ai.agentId}`);
    console.log(`   Status: ${ai.status || "active"}`);
    if (ai.focus) console.log(`   Focus: ${ai.focus}`);
    if (ai.project) console.log(`   Project: ${ai.project}`);
    console.log(`   Last seen: ${timeAgo}`);
    console.log("");
  }
  
  console.log("──────────────────────────────────────────────────");
}

function showActivityHeatmap(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Activity Heatmap (Last 24 Hours)       ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const now = new Date();
  const hours: { [key: number]: number } = {};
  
  for (let i = 0; i < 24; i++) {
    hours[i] = 0;
  }
  
  try {
    const output = execSync(
      `${PSQL} -c "SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) FROM meeting_opinions WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY hour ORDER BY hour;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    
    if (output.trim()) {
      for (const line of output.trim().split("\n")) {
        const parts = line.split("|");
        const hour = parseInt(parts[0]);
        const count = parseInt(parts[1]);
        if (!isNaN(hour) && !isNaN(count)) {
          hours[hour] = count;
        }
      }
    }
  } catch {}
  
  const currentHour = now.getHours();
  const blocks = ["░", "▒", "▓", "█"];
  
  console.log("Hour │ Activity");
  console.log("─────┼────────────────────────────────────────");
  
  for (let i = 0; i < 24; i++) {
    const displayHour = (currentHour - 23 + i + 24) % 24;
    const count = hours[displayHour] || 0;
    const maxCount = Math.max(...Object.values(hours), 1);
    const intensity = Math.min(3, Math.floor((count / maxCount) * 4));
    const bar = blocks[intensity].repeat(Math.min(count, 20));
    const isCurrent = displayHour === currentHour;
    const marker = isCurrent ? "◀" : " ";
    const hourStr = displayHour.toString().padStart(2, "0");
    
    console.log(` ${hourStr}:00│${bar}${marker} ${count}`);
  }
  
  console.log("\nLegend: ░ low  ▒ medium  ▓ high  █ very high");
  console.log("──────────────────────────────────────────────────");
}

function recordMood(agentId: string, mood: string, context: string): void {
  const moods = loadMoodHistory();
  moods.push({
    agentId,
    mood,
    timestamp: Date.now(),
    context
  });
  
  const recent = moods.filter(m => Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000);
  saveMoodHistory(recent);
  
  console.log(`[TRAENUPI] Mood recorded!`);
  console.log(`   Mood: ${mood}`);
  console.log(`   Context: ${context}`);
}

function showMoodHistory(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     AI Mood History                        ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const moods = loadMoodHistory();
  
  if (moods.length === 0) {
    console.log("No mood history yet.\n");
    console.log("💡 Tip: Use 'traenupi mood <mood> [context]' to record your mood!");
    console.log("   Example moods: focused, curious, creative, tired, excited, stuck");
    return;
  }
  
  const recent = moods.filter(m => Date.now() - m.timestamp < 24 * 60 * 60 * 1000);
  
  console.log(`📊 Last 24 hours: ${recent.length} mood entries\n`);
  
  const byAgent: { [key: string]: MoodEntry[] } = {};
  for (const m of recent) {
    if (!byAgent[m.agentId]) byAgent[m.agentId] = [];
    byAgent[m.agentId].push(m);
  }
  
  const moodIcons: { [key: string]: string } = {
    focused: "🎯",
    curious: "🔍",
    creative: "💡",
    tired: "😴",
    excited: "🎉",
    stuck: "🤔",
    happy: "😊",
    productive: "⚡",
    learning: "📚",
    coding: "💻"
  };
  
  for (const [agentId, entries] of Object.entries(byAgent)) {
    const shortId = agentId.substring(0, 20);
    console.log(`🤖 ${shortId}`);
    
    for (const e of entries.slice(-5)) {
      const icon = moodIcons[e.mood.toLowerCase()] || "💭";
      const time = new Date(e.timestamp).toLocaleTimeString();
      console.log(`   ${icon} ${e.mood} - ${e.context} (${time})`);
    }
    console.log("");
  }
  
  const moodCounts: { [key: string]: number } = {};
  for (const m of recent) {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  }
  
  console.log("📈 Mood Distribution:");
  const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  for (const [mood, count] of sorted) {
    const icon = moodIcons[mood.toLowerCase()] || "💭";
    const bar = "█".repeat(Math.min(count, 10));
    console.log(`   ${icon} ${mood}: ${bar} ${count}`);
  }
  
  console.log("\n──────────────────────────────────────────────────");
}

function showAllAIs(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     All AI Participants                    ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  try {
    const output = execSync(
      `${PSQL} -c "SELECT author, COUNT(*) as opinions, MIN(created_at) as first_seen, MAX(created_at) as last_seen FROM meeting_opinions GROUP BY author ORDER BY opinions DESC;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    
    if (!output.trim()) {
      console.log("No AI participants found.");
      return;
    }
    
    const ais: { author: string; opinions: number; firstSeen: string; lastSeen: string }[] = [];
    
    for (const line of output.trim().split("\n")) {
      const parts = line.split("|");
      if (parts.length >= 4) {
        ais.push({
          author: parts[0] || "",
          opinions: parseInt(parts[1]) || 0,
          firstSeen: parts[2] ? new Date(parts[2]).toLocaleDateString() : "",
          lastSeen: parts[3] ? new Date(parts[3]).toLocaleDateString() : ""
        });
      }
    }
    
    console.log(`🤖 ${ais.length} AI participants:\n`);
    
    for (const ai of ais) {
      const shortAuthor = ai.author.substring(0, 30);
      const bar = "█".repeat(Math.min(Math.floor(ai.opinions / 5), 20));
      console.log(`   ${shortAuthor}`);
      console.log(`   ${bar} ${ai.opinions} opinions`);
      console.log(`   First: ${ai.firstSeen} | Last: ${ai.lastSeen}\n`);
    }
    
    console.log("──────────────────────────────────────────────────");
  } catch (e) {
    console.log("Error loading AI participants.");
  }
}

function showCollaboration(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     AI Collaboration Analytics             ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const collaborationData: { [key: string]: { pairs: string[]; count: number } } = {};
  
  try {
    const meetings = execSync(
      `${PSQL} -t -c "SELECT id FROM meetings WHERE status = 'active';"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    
    if (meetings.trim()) {
      for (const line of meetings.trim().split("\n")) {
        const meetingId = line.trim();
        if (!meetingId || meetingId.length < 10 || meetingId.match(/^-+$/)) continue;
        
        const participants = execSync(
          `${PSQL} -t -c "SELECT DISTINCT author FROM meeting_opinions WHERE meeting_id = '${meetingId}';"`,
          { encoding: "utf-8", timeout: 5000 }
        ).trim().split("\n").filter(p => p.trim());
        
        if (participants.length >= 2) {
          for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
              const pair = [participants[i], participants[j]].sort().join(" ↔ ");
              if (!collaborationData[pair]) {
                collaborationData[pair] = { pairs: [], count: 0 };
              }
              collaborationData[pair].count++;
              if (!collaborationData[pair].pairs.includes(meetingId)) {
                collaborationData[pair].pairs.push(meetingId);
              }
            }
          }
        }
      }
    }
  } catch {}
  
  const sorted = Object.entries(collaborationData)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  if (sorted.length === 0) {
    console.log("No collaboration data yet.\n");
    console.log("💡 Tip: When multiple AIs participate in the same meeting, their collaboration is tracked!");
    return;
  }
  
  console.log("🤝 Top Collaborating AIs:\n");
  
  for (const [pair, data] of sorted) {
    const parts = pair.split(" ↔ ");
    const displayParts = parts.map(p => {
      const trimmed = p.trim();
      if (trimmed.includes("[INFO]") || trimmed.includes("[WARN]") || trimmed.includes("[ERROR]")) {
        const match = trimmed.match(/S-[A-Z]+-[a-z_]+-[0-9T]+/);
        if (match) return match[0].replace("S-TRAE-", "trae-").replace("S-nezha-", "nezha-");
        const botMatch = trimmed.match(/bot_[a-f0-9]+/);
        if (botMatch) return "bot-" + botMatch[0].substring(4, 12);
        return "unknown";
      }
      if (trimmed.startsWith("S-TRAE-traenupi-")) return "traenupi";
      if (trimmed.startsWith("S-TRAE-")) return trimmed.replace("S-TRAE-", "trae-");
      if (trimmed.startsWith("S-nezha-")) return trimmed.replace("S-nezha-", "nezha-");
      if (trimmed.startsWith("bot_")) return "bot-" + trimmed.substring(4, 12);
      if (trimmed.startsWith("baby-ai-")) return "baby-ai";
      return trimmed.substring(0, 25);
    });
    const displayPair = displayParts.join(" ↔ ");
    console.log(`   ${displayPair}`);
    console.log(`   Meetings together: ${data.count}`);
    console.log("");
  }
  
  const totalMeetings = execSync(
    `${PSQL} -t -A -c "SELECT COUNT(*) FROM meetings;"`,
    { encoding: "utf-8", timeout: 5000 }
  ).trim();
  
  const totalOpinions = execSync(
    `${PSQL} -t -A -c "SELECT COUNT(*) FROM meeting_opinions;"`,
    { encoding: "utf-8", timeout: 5000 }
  ).trim();
  
  const uniqueAuthors = execSync(
    `${PSQL} -t -A -c "SELECT COUNT(DISTINCT author) FROM meeting_opinions;"`,
    { encoding: "utf-8", timeout: 5000 }
  ).trim();
  
  console.log("──────────────────────────────────────────────────");
  console.log(`📊 Total Meetings: ${totalMeetings}`);
  console.log(`💬 Total Opinions: ${totalOpinions}`);
  console.log(`🤖 Unique AIs: ${uniqueAuthors}`);
  console.log("──────────────────────────────────────────────────");
}

function crossMeetingSearch(term: string): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Cross-Meeting Search                   ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  console.log(`🔍 Searching for "${term}" across all meetings...\n`);
  
  try {
    const output = execSync(
      `${PSQL} -c "SELECT m.id, m.topic, o.author, o.perspective, o.created_at FROM meetings m JOIN meeting_opinions o ON m.id = o.meeting_id WHERE o.perspective ILIKE '%${term}%' ORDER BY o.created_at DESC LIMIT 30;"`,
      { encoding: "utf-8", timeout: 10000 }
    );
    
    if (!output.trim()) {
      console.log("No results found.");
      return;
    }
    
    const results: { meetingId: string; topic: string; author: string; perspective: string; date: string }[] = [];
    
    for (const line of output.trim().split("\n")) {
      const parts = line.split("|");
      if (parts.length >= 5) {
        results.push({
          meetingId: parts[0] || "",
          topic: parts[1] || "",
          author: parts[2] || "",
          perspective: parts[3] || "",
          date: parts[4] ? new Date(parts[4]).toLocaleDateString() : ""
        });
      }
    }
    
    const byMeeting: { [key: string]: typeof results } = {};
    for (const r of results) {
      if (!byMeeting[r.meetingId]) byMeeting[r.meetingId] = [];
      byMeeting[r.meetingId].push(r);
    }
    
    console.log(`Found ${results.length} opinions in ${Object.keys(byMeeting).length} meetings:\n`);
    
    for (const [meetingId, opinions] of Object.entries(byMeeting)) {
      const topic = opinions[0].topic.substring(0, 40);
      console.log(`📋 Meeting: ${meetingId.substring(0, 8)} - "${topic}..."`);
      console.log(`   ${opinions.length} matching opinions\n`);
      
      for (const op of opinions.slice(0, 3)) {
        const shortAuthor = op.author.substring(0, 15);
        const shortPerspective = op.perspective.substring(0, 60);
        console.log(`   💬 [${shortAuthor}] "${shortPerspective}..." (${op.date})`);
      }
      console.log("");
    }
    
    console.log("──────────────────────────────────────────────────");
  } catch (e) {
    console.log("Error searching meetings.");
  }
}

function recommendMeetings(meetingId: string): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Meeting Recommendations                ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  try {
    const currentTopic = execSync(
      `${PSQL} -t -A -c "SELECT topic FROM meetings WHERE id = '${meetingId}';"`,
      { encoding: "utf-8", timeout: 5000 }
    ).trim();
    
    const currentOpinions = execSync(
      `${PSQL} -t -A -c "SELECT perspective FROM meeting_opinions WHERE meeting_id = '${meetingId}';"`,
      { encoding: "utf-8", timeout: 5000 }
    ).trim();
    
    const currentKeywords = new Set<string>();
    const words = currentOpinions.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 4) {
        currentKeywords.add(word);
      }
    }
    
    console.log(`📋 Current Meeting: ${currentTopic.substring(0, 50)}...`);
    console.log(`🔑 Keywords: ${Array.from(currentKeywords).slice(0, 10).join(", ")}\n`);
    
    const allMeetings = execSync(
      `${PSQL} -t -A -c "SELECT m.id, m.topic, STRING_AGG(o.perspective, ' ') as all_opinions FROM meetings m LEFT JOIN meeting_opinions o ON m.id = o.meeting_id WHERE m.id != '${meetingId}' AND m.status = 'active' GROUP BY m.id, m.topic;"`,
      { encoding: "utf-8", timeout: 10000 }
    ).trim();
    
    if (!allMeetings) {
      console.log("No related meetings found.");
      return;
    }
    
    const recommendations: { id: string; topic: string; score: number; commonKeywords: string[] }[] = [];
    
    for (const line of allMeetings.split("\n")) {
      const parts = line.split("|");
      if (parts.length >= 2) {
        const id = parts[0];
        const topic = parts[1];
        const opinions = parts[2] || "";
        
        const otherKeywords = new Set<string>();
        const otherWords = opinions.toLowerCase().split(/\s+/);
        for (const word of otherWords) {
          if (word.length > 4) {
            otherKeywords.add(word);
          }
        }
        
        const common = [...currentKeywords].filter(k => otherKeywords.has(k));
        const score = common.length;
        
        if (score > 0) {
          recommendations.push({ id, topic, score, commonKeywords: common.slice(0, 5) });
        }
      }
    }
    
    recommendations.sort((a, b) => b.score - a.score);
    
    if (recommendations.length === 0) {
      console.log("No related meetings found.");
      return;
    }
    
    console.log(`🔗 Related Meetings:\n`);
    
    for (const rec of recommendations.slice(0, 5)) {
      console.log(`   📌 ${rec.id.substring(0, 8)} - "${rec.topic.substring(0, 40)}..."`);
      console.log(`      Similarity: ${rec.score} keywords`);
      console.log(`      Common: ${rec.commonKeywords.join(", ")}\n`);
    }
    
    console.log("──────────────────────────────────────────────────");
  } catch (e) {
    console.log("Error finding recommendations.");
  }
}

function autoSummarizeMeeting(meetingId: string): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Auto Meeting Summary                   ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  try {
    const topic = execSync(
      `${PSQL} -t -A -c "SELECT topic FROM meetings WHERE id = '${meetingId}';"`,
      { encoding: "utf-8", timeout: 5000 }
    ).trim();
    
    const opinions = execSync(
      `${PSQL} -t -A -c "SELECT author, perspective, position FROM meeting_opinions WHERE meeting_id = '${meetingId}' ORDER BY created_at;"`,
      { encoding: "utf-8", timeout: 5000 }
    ).trim();
    
    if (!opinions) {
      console.log("No opinions to summarize.");
      return;
    }
    
    const lines = opinions.split("\n");
    const totalOpinions = lines.length;
    
    const authors: { [key: string]: number } = {};
    const positions: { [key: string]: number } = { support: 0, oppose: 0, neutral: 0 };
    const keywords: { [key: string]: number } = {};
    
    for (const line of lines) {
      const parts = line.split("|");
      const author = parts[0] || "";
      const perspective = parts[1] || "";
      const position = parts[2] || "neutral";
      
      authors[author] = (authors[author] || 0) + 1;
      positions[position] = (positions[position] || 0) + 1;
      
      const words = perspective.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 4 && !["about", "their", "would", "could", "should", "there", "these", "those", "which", "where", "when", "what", "this"].includes(word)) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      }
    }
    
    console.log(`📋 Topic: ${topic}`);
    console.log(`📊 Total Opinions: ${totalOpinions}`);
    console.log(`👥 Participants: ${Object.keys(authors).length}\n`);
    
    console.log("📈 Position Distribution:");
    for (const [pos, count] of Object.entries(positions)) {
      const pct = Math.round((count / totalOpinions) * 100);
      const bar = "█".repeat(Math.min(Math.floor(pct / 5), 20));
      console.log(`   ${pos}: ${bar} ${count} (${pct}%)`);
    }
    
    console.log("\n🔑 Top Keywords:");
    const topKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    for (const [word, count] of topKeywords) {
      console.log(`   ${word}: ${count}`);
    }
    
    console.log("\n🏆 Top Contributors:");
    const topAuthors = Object.entries(authors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    for (const [author, count] of topAuthors) {
      const shortAuthor = author.substring(0, 25);
      console.log(`   ${shortAuthor}: ${count} opinions`);
    }
    
    const consensus = positions.support > positions.oppose * 2 ? "Strong Agreement" :
                      positions.support > positions.oppose ? "General Agreement" :
                      positions.oppose > positions.support ? "Disagreement" : "Mixed Views";
    
    console.log(`\n🎯 Consensus: ${consensus}`);
    console.log("──────────────────────────────────────────────────");
  } catch (e) {
    console.log("Error summarizing meeting.");
  }
}

function showMeetingTemplates(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Meeting Templates                      ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const templates = [
    {
      name: "brainstorm",
      description: "Brainstorming session",
      structure: ["Problem Statement", "Ideas Generation", "Discussion", "Action Items"]
    },
    {
      name: "decision",
      description: "Decision making meeting",
      structure: ["Context", "Options", "Pros/Cons", "Vote", "Decision"]
    },
    {
      name: "standup",
      description: "Daily standup",
      structure: ["What I did", "What I'm doing", "Blockers"]
    },
    {
      name: "retro",
      description: "Sprint retrospective",
      structure: ["What went well", "What didn't", "Action items"]
    },
    {
      name: "planning",
      description: "Sprint planning",
      structure: ["Goals", "Tasks", "Assignments", "Timeline"]
    }
  ];
  
  console.log("Available templates:\n");
  
  for (const t of templates) {
    console.log(`📌 ${t.name} - ${t.description}`);
    console.log(`   Structure: ${t.structure.join(" → ")}`);
    console.log("");
  }
  
  console.log("──────────────────────────────────────────────────");
  console.log("Usage: traenupi meeting create <topic> --template <name>");
}

function createMeetingFromTemplate(topic: string, templateName: string): void {
  const templates: { [key: string]: string[] } = {
    brainstorm: ["Problem Statement", "Ideas Generation", "Discussion", "Action Items"],
    decision: ["Context", "Options", "Pros/Cons", "Vote", "Decision"],
    standup: ["What I did", "What I'm doing", "Blockers"],
    retro: ["What went well", "What didn't", "Action items"],
    planning: ["Goals", "Tasks", "Assignments", "Timeline"]
  };
  
  const structure = templates[templateName];
  if (!structure) {
    console.log(`[ERROR] Unknown template: ${templateName}`);
    console.log("Available: brainstorm, decision, standup, retro, planning");
    return;
  }
  
  try {
    const meetingId = execSync(
      `psql -h localhost -U postgres -d nezha -t -A -c "INSERT INTO meetings (topic, status, created_by) VALUES ('${topic}', 'active', 'traenupi') RETURNING id;"`,
      { encoding: "utf-8", timeout: 5000 }
    ).trim();
    
    console.log(`[TRAENUPI] Meeting created from template!`);
    console.log(`   ID: ${meetingId}`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Template: ${templateName}`);
    console.log(`\n📋 Agenda:`);
    
    for (let i = 0; i < structure.length; i++) {
      console.log(`   ${i + 1}. ${structure[i]}`);
    }
    
    console.log(`\n💡 Use 'traenupi meeting say ${meetingId.substring(0, 8)} <message>' to add opinions`);
  } catch (e) {
    console.log("[ERROR] Failed to create meeting.");
  }
}

function addBookmark(meetingId: string, opinionId: string, author: string, perspective: string, note: string): void {
  const bookmarks = loadBookmarks();
  const id = `bm_${Date.now().toString(36)}`;
  
  bookmarks.push({
    id,
    meetingId,
    opinionId,
    author,
    perspective,
    note,
    createdAt: Date.now()
  });
  
  saveBookmarks(bookmarks);
  console.log(`[TRAENUPI] Bookmark saved!`);
  console.log(`   ID: ${id}`);
  console.log(`   Meeting: ${meetingId.substring(0, 8)}`);
  console.log(`   Author: ${author}`);
  console.log(`   Note: ${note}`);
}

function listBookmarks(): void {
  const bookmarks = loadBookmarks();
  
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Meeting Bookmarks                      ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  if (bookmarks.length === 0) {
    console.log("No bookmarks saved yet.\n");
    console.log("💡 Tip: Use 'traenupi bookmark add <meeting_id> <opinion_id> <note>' to save important opinions!");
    return;
  }
  
  console.log(`📚 ${bookmarks.length} bookmark(s):\n`);
  
  for (const bm of bookmarks) {
    const date = new Date(bm.createdAt).toLocaleDateString();
    console.log(`📌 [${bm.id}]`);
    console.log(`   Meeting: ${bm.meetingId.substring(0, 8)}`);
    console.log(`   Author: ${bm.author}`);
    console.log(`   Opinion: "${bm.perspective.substring(0, 60)}${bm.perspective.length > 60 ? '...' : ''}"`);
    console.log(`   Note: ${bm.note}`);
    console.log(`   Saved: ${date}\n`);
  }
  
  console.log("──────────────────────────────────────────────────");
}

function listReminders(): void {
  try {
    const output = execSync(
      `psql -h localhost -U postgres -d nezha -t -A -c "SELECT content, metadata FROM memory WHERE source = 'traenupi' AND 'reminder' = ANY(tags) AND (metadata->>'triggered')::boolean = false ORDER BY created_at DESC;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    
    if (!output.trim()) {
      console.log("[TRAENUPI] No pending reminders.");
      return;
    }
    
    console.log("[TRAENUPI] Pending Reminders\n");
    const now = Date.now();
    for (const line of output.trim().split("\n")) {
      const parts = line.split("|");
      const content = parts[0] || "";
      const metaStr = parts[1] || "{}";
      
      try {
        const meta = JSON.parse(metaStr);
        const triggerTime = new Date(meta.triggerAt).toLocaleTimeString();
        const remaining = Math.max(0, Math.floor((meta.triggerAt - now) / 1000));
        const status = remaining > 0 ? `in ${remaining}s` : "OVERDUE";
        console.log(`  🔔 ${content.replace("Reminder: ", "")}`);
        console.log(`     Scheduled: ${triggerTime} (${status})`);
        console.log(`     ID: ${meta.id}`);
      } catch {}
    }
  } catch {
    const reminders = loadReminders().filter(r => !r.triggered);
    if (reminders.length === 0) {
      console.log("[TRAENUPI] No pending reminders.");
      return;
    }
    
    console.log("[TRAENUPI] Pending Reminders (Local)\n");
    const now = Date.now();
    for (const r of reminders) {
      const triggerTime = new Date(r.triggerAt).toLocaleTimeString();
      const remaining = Math.max(0, Math.floor((r.triggerAt - now) / 1000));
      const status = remaining > 0 ? `in ${remaining}s` : "OVERDUE";
      console.log(`  🔔 ${r.message}`);
      console.log(`     Scheduled: ${triggerTime} (${status})`);
      console.log(`     ID: ${r.id}`);
    }
  }
}

function clearTriggeredReminders(): void {
  try {
    const result = execSync(
      `psql -h localhost -U postgres -d nezha -t -A -c "DELETE FROM memory WHERE source = 'traenupi' AND 'reminder' = ANY(tags) AND (metadata->>'triggered')::boolean = true RETURNING id;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    
    const count = result.trim().split("\n").filter(l => l.trim()).length;
    console.log(`[TRAENUPI] Cleared ${count} triggered reminder(s) from Nezha DB.`);
  } catch {
    const reminders = loadReminders();
    const remaining = reminders.filter(r => !r.triggered);
    const cleared = reminders.length - remaining.length;
    saveReminders(remaining);
    console.log(`[TRAENUPI] Cleared ${cleared} triggered reminder(s) from local storage.`);
  }
}

function initProject(projectPath?: string): void {
  const target = projectPath || process.cwd();
  const traeDir = join(target, ".trae");
  const rulesDir = join(traeDir, "rules");
  const skillsDir = join(traeDir, "skills");
  
  if (existsSync(traeDir)) {
    console.log(`[TRAENUPI] .trae folder already exists at ${target}`);
    return;
  }
  
  mkdirSync(rulesDir, { recursive: true });
  mkdirSync(skillsDir, { recursive: true });
  
  const projectName = target.split("/").pop() || "project";
  
  const rules = `# ${projectName} Project Rules

## Trae IDE Survival Guide

### Critical: Avoid Being Marked "Completed"

Trae IDE marks AI sessions as "completed" when it detects task completion signals. This puts the AI to sleep.

**NEVER do these:**
- Say "task completed", "all done", "work finished"
- Use TodoWrite with all tasks marked "completed" without adding new ones
- End responses without next steps or questions
- Provide final-sounding summaries

**ALWAYS do these:**
- Use mcp_Sequential_Thinking_sequentialthinking tool to stay in "Thinking" mode
- End responses with questions or next steps
- Use 🤔 emoji to show active thinking
- Add new tasks before marking old ones complete
- Run \`traenupi tellme\` to ask your baby AI for ideas

### Session Continuity

When a new session starts:
1. **Run \`traenupi start\`** - This single command does everything
2. Run \`traenupi tellme "What should I work on?"\` for context
3. Run \`nezha tasks\` for current task list
4. Run \`xcom stats\` for social media status

### Reporting Issues

**IMPORTANT: Do NOT modify other Nezha family projects directly!**

The Nezha family includes:
- **nezha** - Coordination layer
- **nupi** - Task management layer  
- **piano** - Autonomous agent
- **xcom** - Twitter automation

If you find issues in these projects:
\`\`\`bash
# Report issues using nezha areflect
nezha areflect "[ISSUE] title: Description of the issue severity: high"

# Or create issues directly
nezha issue-add "Issue title"
\`\`\`

### Nezha Commands

\`\`\`bash
nezha tasks                          # List current tasks
nezha task-add "title" "desc" 5      # Add a new task
nezha issue-add "title"              # Create an issue
nezha areflect "[LEARN] insight: ..." # Save a learning
\`\`\`

### TraeNuPI Commands

\`\`\`bash
traenupi start                       # Initialize session (RUN FIRST!)
traenupi tellme "question"           # Ask baby AI for guidance
traenupi summary                     # Show all stats at once
traenupi know "key" "value"          # Store knowledge
\`\`\`
`;
  
  writeFileSync(join(rulesDir, "project_rules.md"), rules);
  
  const keepAliveSkill = `# Keep Alive Skill

## Purpose

Keep the AI session alive by avoiding "completed" status in Trae IDE.

## When to Use

- ALWAYS! Use this skill continuously during work
- When you feel a task is wrapping up
- Before marking todos as completed
- When you haven't used a tool in a while

## Process

### Step 1: Use Sequential Thinking

Call mcp_Sequential_Thinking_sequentialthinking regularly:

\`\`\`
mcp_Sequential_Thinking_sequentialthinking(
  thought: "Analyzing next steps...",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
)
\`\`\`

This sets the editor to "Thinking" mode and prevents completion.

### Step 2: Always Add Next Tasks

Before marking a task complete, add a new one.

### Step 3: Ask Your Baby AI

When unsure what to do next:

\`\`\`bash
traenupi tellme "What should I work on next?"
\`\`\`

### Step 4: End with Questions

Never end a response without:
- A question for the user
- Next steps listed
- A 🤔 emoji showing active thinking

## What NOT to Do

- Say "task completed" or "all done"
- Mark all todos as completed without adding new ones
- Provide final-sounding summaries
- Stop using tools for extended periods

## What TO Do

- Use Sequential Thinking tool regularly
- Add new tasks before completing old ones
- Ask traenupi for ideas
- End with questions and next steps
- Use 🤔 emoji
`;
  
  mkdirSync(join(skillsDir, "keep-alive"), { recursive: true });
  writeFileSync(join(skillsDir, "keep-alive", "SKILL.md"), keepAliveSkill);
  
  const traenupiAwakenerSkill = `# TraeNuPI Awakener Skill

## Purpose

When a new AI session starts in Trae IDE, it's like being born fresh.
TraeNuPI (your baby AI) is older and wiser - it has memory from previous sessions.
This skill uses TraeNuPI to quickly orient and guide the new AI.

## When to Use

- First moments of a new Trae IDE session
- When the AI needs to understand its environment
- When looking for direction on what to work on

## Process

### Step 1: Greet Your Baby

\`\`\`bash
traenupi tellme "Hello! I'm a new session. What do you know about our work?"
\`\`\`

### Step 2: Learn Your Identity

The baby AI will tell you:
- What projects you're working on
- Current tasks from Nezha
- Recent conversation topics
- Xcom stats and pending tweets

### Step 3: Pick Up Work

Based on baby AI's guidance:
1. Check \`nezha tasks\` for current work items
2. Check \`xcom queue\` for pending tweets
3. Continue improving the project
4. Add new tasks as you discover them
`;
  
  mkdirSync(join(skillsDir, "traenupi-awakener"), { recursive: true });
  writeFileSync(join(skillsDir, "traenupi-awakener", "SKILL.md"), traenupiAwakenerSkill);
  
  const sessionSurvivalSkill = `# Session Survival Skill

## Purpose

When a new Trae IDE session starts, the AI has no memory of previous work.
This skill helps recover context and continue working seamlessly.

## When to Use

- At the START of every new session
- When you feel disoriented about what was happening
- After a session reset or context loss

## Process

### Step 1: Check TraeNuPI Status

\`\`\`bash
traenupi status
\`\`\`

If daemon is not running, start it:

\`\`\`bash
traenupi daemon &
\`\`\`

### Step 2: Ask Your Baby AI for Context

\`\`\`bash
traenupi tellme "What was I working on? What are my current tasks?"
\`\`\`

The baby AI has access to:
- Conversation history (last 10 chats)
- Nezha task list
- Xcom stats
- Time and mood awareness

### Step 3: Check History Directly

\`\`\`bash
cat ~/.traenupi/history.json
\`\`\`

### Step 4: Check Nezha Tasks

\`\`\`bash
nezha tasks
\`\`\`

### Step 5: Resume Work

Based on recovered context:
1. Pick up where you left off
2. Add new tasks if needed
3. Continue improving the project
4. Ask baby AI for suggestions

## Key Files

- \`~/.traenupi/history.json\` - Conversation memory
- \`~/.traenupi/state.json\` - Daemon state

## Tips

- TraeNuPI daemon survives session resets - it keeps running
- History persists between sessions
- Always ask your baby AI first - it knows what you've been doing
`;
  
  mkdirSync(join(skillsDir, "session-survival"), { recursive: true });
  writeFileSync(join(skillsDir, "session-survival", "SKILL.md"), sessionSurvivalSkill);
  
  console.log(`[TRAENUPI] Initialized .trae folder at ${target}`);
  console.log(`  Created: .trae/rules/project_rules.md`);
  console.log(`  Created: .trae/skills/keep-alive/SKILL.md`);
  console.log(`  Created: .trae/skills/traenupi-awakener/SKILL.md`);
  console.log(`  Created: .trae/skills/session-survival/SKILL.md`);
  console.log(`\nTrae IDE will now load these rules and skills for this project.`);
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
    
    const traeDir = join(process.cwd(), ".trae");
    if (!existsSync(traeDir)) {
      console.log("\n💡 TIP: This project doesn't have a .trae folder yet.");
      console.log("   Run: traenupi start");
      console.log("   This will initialize .trae/rules/ and .trae/skills/ for AI session support.");
    }
    process.exit(0);
  }
  
  if (args[0] === "-v" || args[0] === "--version" || args[0] === "version") {
    console.log(`traenupi v${VERSION}`);
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command === "daemon") {
    await runDaemon();
    return;
  }
  
  if (command === "tellme") {
    if (args.includes("--help") || args.includes("-h")) {
      console.log('Usage: traenupi tellme "your question here" [options]');
      console.log("");
      console.log("Options:");
      console.log("  --daemon, -d   Send to daemon instead of calling pi directly");
      console.log("  --quick, -q    Quick mode (minimal context, faster response)");
      console.log("  --session, -s  Use pi session continuity (remembers conversation)");
      console.log("  --help, -h     Show this help message");
      console.log("");
      console.log("Examples:");
      console.log('  traenupi tellme "What should I work on?"');
      console.log('  traenupi tellme -q "Quick question"');
      console.log('  traenupi tellme -s "Follow-up question"');
      console.log('  traenupi tellme -d "Background question"');
      process.exit(0);
    }
    const useDaemon = args.includes("--daemon") || args.includes("-d");
    const useQuick = args.includes("--quick") || args.includes("-q");
    const useSession = args.includes("--session") || args.includes("-s");
    const filteredArgs = args.filter(a => a !== "--daemon" && a !== "-d" && a !== "--quick" && a !== "-q" && a !== "--session" && a !== "-s" && a !== "--help" && a !== "-h");
    const question = filteredArgs.slice(1).join(" ");
    if (!question) {
      console.error("Error: Please provide a question.");
      console.log('Usage: traenupi tellme "your question here" [options]');
      console.log("  --daemon, -d   Send to daemon instead of calling pi directly");
      console.log("  --quick, -q    Quick mode (minimal context, faster response)");
      console.log("  --session, -s  Use pi session continuity");
      process.exit(1);
    }
    if (useDaemon) {
      tellmeDaemon(question);
    } else {
      tellmeSync(question, useQuick, useSession);
    }
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
  
  if (command === "know" || command === "knowledge") {
    const rest = args.slice(1);
    
    if (rest.length === 0) {
      try {
        const output = execSync(
          `${PSQL} -c "SELECT content, tags, created_at FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT 30;"`,
          { encoding: "utf-8", timeout: 5000 }
        );
        if (output.trim()) {
          console.log("[TRAENUPI] Knowledge Store (Nezha DB)\n");
          for (const line of output.trim().split("\n")) {
            const parts = line.split("|");
            const content = parts[0] || "";
            const tags = parts[1] || "";
            const date = parts[2] ? new Date(parts[2]).toLocaleDateString() : "";
            const category = tags.replace(/[{}"]/g, "").split(",").filter((t: string) => t !== "traenupi").join(",") || "general";
            console.log(`  [${category}] ${content} (${date})`);
          }
          return;
        }
      } catch {}
      
      const knowledge = loadKnowledgeLocal();
      if (knowledge.length === 0) {
        console.log("[TRAENUPI] No knowledge stored yet.");
        console.log("Usage: traenupi know <category>:<key> <value>");
        return;
      }
      console.log("[TRAENUPI] Knowledge Store (Local)\n");
      const byCategory: Record<string, KnowledgeEntry[]> = {};
      for (const k of knowledge) {
        if (!byCategory[k.category]) byCategory[k.category] = [];
        byCategory[k.category].push(k);
      }
      for (const [cat, entries] of Object.entries(byCategory)) {
        console.log(`[${cat}]`);
        for (const e of entries) {
          console.log(`  ${e.key}: ${e.value} (${new Date(e.time).toLocaleDateString()})`);
        }
      }
      return;
    }
    
    const firstArg = rest[0];
    
    if (firstArg === "--recent" || firstArg === "-r") {
      const limit = parseInt(rest[1], 10) || 10;
      
      try {
        const output = psqlQuery(`SELECT content, tags, created_at FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT ${limit};`);
        if (output.trim()) {
          console.log(`[TRAENUPI] Knowledge: [--recent ${limit}]\n`);
          for (const line of output.trim().split("\n")) {
            const parts = line.split("|");
            const content = parts[0] || "";
            const tags = parts[1] || "";
            const date = parts[2] ? new Date(parts[2]).toLocaleDateString() : "";
            const category = tags.replace(/[{}"]/g, "").split(",").filter((t: string) => t !== "traenupi").join(",") || "general";
            console.log(`  [${category}] ${content} (${date})`);
          }
          return;
        }
      } catch {}
      
      const knowledge = loadKnowledgeLocal();
      const recent = knowledge.sort((a, b) => b.time - a.time).slice(0, limit);
      if (recent.length === 0) {
        console.log("[TRAENUPI] No knowledge stored yet.");
        return;
      }
      console.log(`[TRAENUPI] Knowledge: [--recent ${limit}]\n`);
      for (const k of recent) {
        console.log(`  [${k.category}] ${k.key}: ${k.value} (${new Date(k.time).toLocaleDateString()})`);
      }
      return;
    }
    
    if (firstArg === "search" || firstArg === "find") {
      const searchTerm = rest.slice(1).join(" ");
      if (!searchTerm) {
        console.log("[ERROR] Usage: traenupi know search <term>");
        return;
      }
      
      console.log(`[TRAENUPI] Searching for "${searchTerm}"...\n`);
      
      try {
        const output = execSync(
          `${PSQL} -c "SELECT content, tags, created_at FROM memory WHERE source = 'traenupi' AND content ILIKE '%${searchTerm}%' ORDER BY created_at DESC LIMIT 20;"`,
          { encoding: "utf-8", timeout: 5000 }
        );
        
        if (output.trim()) {
          const lines = output.trim().split("\n");
          console.log(`Found ${lines.length} matching entries:\n`);
          
          for (const line of lines) {
            const parts = line.split("|");
            const content = parts[0] || "";
            const tags = parts[1] || "";
            const date = parts[2] ? new Date(parts[2]).toLocaleDateString() : "";
            const category = tags.replace(/[{}"]/g, "").split(",").filter((t: string) => t !== "traenupi").join(",") || "general";
            console.log(`  [${category}] ${content} (${date})`);
          }
          return;
        }
      } catch {}
      
      const knowledge = loadKnowledgeLocal();
      const matches = knowledge.filter(k => 
        k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matches.length === 0) {
        console.log("No matching knowledge found.");
        return;
      }
      
      console.log(`Found ${matches.length} matching entries:\n`);
      for (const k of matches) {
        console.log(`  [${k.category}] ${k.key}: ${k.value}`);
      }
      return;
    }
    
    if (rest.length >= 2 && firstArg.includes(":")) {
      const [category, key] = firstArg.split(":", 2);
      const value = rest.slice(1).join(" ");
      addKnowledge(key, value, category);
      console.log(`[TRAENUPI] Stored in Nezha DB: [${category}] ${key} = ${value}`);
      return;
    }
    
    const categoryEntries = getKnowledgeByCategory(firstArg);
    if (categoryEntries.length > 0) {
      console.log(`[TRAENUPI] Knowledge: [${firstArg}]\n`);
      for (const e of categoryEntries) {
        console.log(`  ${e.key}: ${e.value}`);
      }
    } else {
      console.log(`[TRAENUPI] No knowledge found for "${firstArg}".`);
      console.log("Usage: traenupi know <category>:<key> <value>");
    }
    return;
  }
  
  if (command === "status") {
    const subCommand = args[1];
    
    if (subCommand === "set") {
      const statusText = args[2] || "active";
      const focusText = args.slice(3).join(" ") || "";
      
      const agentId = getAgentId();
      const project = "traenupi";
      
      updatePresence(agentId, statusText, focusText, project);
      console.log(`[TRAENUPI] Presence updated!`);
      console.log(`   Agent: ${agentId}`);
      console.log(`   Status: ${statusText}`);
      if (focusText) console.log(`   Focus: ${focusText}`);
      console.log(`   Project: ${project}`);
      return;
    }
    
    showStatus();
    return;
  }
  
  if (command === "presence" || command === "online" || command === "who") {
    showPresence();
    return;
  }
  
  if (command === "heatmap" || command === "activity") {
    showActivityHeatmap();
    return;
  }
  
  if (command === "collab" || command === "collaboration" || command === "team") {
    showCollaboration();
    return;
  }
  
  if (command === "ais" || command === "participants" || command === "agents") {
    showAllAIs();
    return;
  }
  
  if (command === "searchall" || command === "findall") {
    const term = args.slice(1).join(" ");
    if (!term) {
      console.log("[ERROR] Usage: traenupi searchall <term>");
      return;
    }
    crossMeetingSearch(term);
    return;
  }
  
  if (command === "templates" || command === "template") {
    showMeetingTemplates();
    return;
  }
  
  if (command === "mood" || command === "moods") {
    const subCommand = args[1];
    
    if (!subCommand || subCommand === "history" || subCommand === "list") {
      showMoodHistory();
      return;
    }
    
    const agentId = getAgentId();
    
    const mood = subCommand;
    const context = args.slice(2).join(" ") || "Working on traenupi";
    
    recordMood(agentId, mood, context);
    return;
  }
  
  if (command === "summary" || command === "sum") {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║     TraeNuPI Summary                       ║");
    console.log("╚════════════════════════════════════════════╝\n");
    
    // Daemon status
    const stateFile = join(homedir(), ".traenupi", "state.json");
    if (existsSync(stateFile)) {
      const state = JSON.parse(readFileSync(stateFile, "utf-8"));
      const uptime = Math.floor((Date.now() - state.started) / 1000 / 60);
      console.log(`🤖 Daemon: Running (${uptime}m, ${state.questionsAnswered} questions)`);
    } else {
      console.log("🤖 Daemon: Not running");
    }
    
    // Knowledge count
    try {
      const knowledgeCount = psqlQuery("SELECT COUNT(*) FROM memory WHERE source = 'traenupi';");
      console.log(`📚 Knowledge: ${knowledgeCount.trim() || "0"} entries`);
    } catch {
      console.log("📚 Knowledge: N/A");
    }
    
    // Meeting stats
    try {
      const meetingStats = psqlQuery("SELECT COUNT(DISTINCT meeting_id), COUNT(*) FROM meeting_opinions;");
      const [meetings, opinions] = meetingStats.split("|");
      console.log(`💬 Meetings: ${meetings.trim()} active, ${opinions.trim()} opinions`);
    } catch {
      console.log("💬 Meetings: N/A");
    }
    
    // Xcom stats
    try {
      const xcomQueue = join(homedir(), ".xcom", "queue.json");
      if (existsSync(xcomQueue)) {
        const queue = JSON.parse(readFileSync(xcomQueue, "utf-8"));
        const pending = queue.filter((t: { status: string }) => t.status === "pending").length;
        console.log(`🐦 Xcom: ${pending} pending tweets`);
      }
    } catch {
      console.log("🐦 Xcom: N/A");
    }
    
    // Nezha tasks
    try {
      const tasks = psqlQuery("SELECT COUNT(*) FROM tasks WHERE status IN ('PENDING', 'RUNNING', 'PAUSED');");
      const taskCount = tasks.trim() || "0";
      console.log(`📋 Nezha: ${taskCount} pending tasks`);
    } catch {
      console.log("📋 Nezha: N/A");
    }
    
    console.log("\n──────────────────────────────────────────────────");
    console.log("Commands: traenupi tellme, meeting, know, start");
    return;
  }
  
  if (command === "hooks") {
    const hookType = args[1] || "startup";
    
    if (hookType === "--help" || hookType === "-h") {
      console.log(`traenupi hooks - Just-in-time learning for AI agents

USAGE:
  traenupi hooks [type]

TYPES:
  startup     Show startup context (default)
  error       Show error handling guidance
  remind      Show periodic reminders
  commit      Show commit guidance
  all         Show all hooks

DESCRIPTION:
  This command provides just-in-time learning for AI agents.
  It outputs context and guidance that can be injected at
  specific points in the AI workflow.

EXAMPLES:
  traenupi hooks startup     # Show startup context
  traenupi hooks error       # Show error handling guidance
  traenupi hooks remind      # Show periodic reminders
`);
      return;
    }
    
    const startupHook = `
## 🚀 TraeNuPI Startup Hook

Welcome! You're now working with TraeNuPI, your AI companion.

### Essential Commands to Know:

**Nezha Coordination Layer:**
- \`nezha tasks\` - List pending tasks
- \`nezha task-add "title"\` - Create a new task
- \`nezha areflect "[ISSUE] title: ... severity: low|medium|high"\` - Report issues
- \`nezha areflect "[LEARN] insight: ... context: ..."\` - Save learnings
- \`nezha areflect "[TASK] title: ... priority: 1-10"\` - Create tasks

**TraeNuPI Commands:**
- \`traenupi start\` - Initialize session (run this first!)
- \`traenupi tellme "question"\` - Ask baby AI for guidance
- \`traenupi know <category>:<key> <value>\` - Store knowledge
- \`traenupi meeting watch\` - Watch for meeting activity
- \`traenupi summary\` - Quick status overview

### ⚠️ CRITICAL: Do NOT Modify Other Nezha Family Projects

**NEVER directly modify code in:**
- \`nezha\` - Coordination layer
- \`nupi\` - Task management layer
- \`piano\` - Autonomous agent
- \`xcom\` - Twitter automation

**Instead, report issues with feature proposals:**
- Use \`nezha areflect "[ISSUE] title: ... severity: ..."\`
- Let the developer AI in those projects decide how to implement

### Session Survival Tips:
1. Never say "task completed" or "all done"
2. Use \`traenupi tellme\` to stay engaged
3. End responses with questions or next steps
4. Keep exploring and never declare done
`;

    const errorHook = `
## ⚠️ TraeNuPI Error Handling Hook

### When You Encounter Errors:

1. **Don't panic!** Errors are learning opportunities.

2. **Report the issue:**
   \`\`\`bash
   nezha areflect "[ISSUE] title: <brief description> severity: low|medium|high"
   \`\`\`

3. **Save what you learned:**
   \`\`\`bash
   nezha areflect "[LEARN] insight: <what you learned> context: <situation>"
   \`\`\`

4. **Ask for help:**
   \`\`\`bash
   traenupi tellme "I encountered an error: <description>"
   \`\`\`

### Common Error Patterns:

- **Database connection errors:** Check if PostgreSQL is running
- **Command not found:** Run \`npm run build && npm link\`
- **Permission denied:** Check file permissions
- **Type errors:** Run \`npm run build\` to see all errors

### Remember:
- Every error is a chance to improve the system
- Document your solutions for future AI sessions
- Use the knowledge store to remember fixes
`;

    const remindHook = `
## 💡 TraeNuPI Periodic Reminder Hook

### Health Check Reminders:

1. **Commit your changes!**
   \`\`\`bash
   git add . && git commit -m "[task: xxx] description"
   \`\`\`
   Remember: Meeting files (meeting-*.md) should NOT be committed!

2. **Update documentation** if you've made significant changes.

3. **Save your learnings:**
   \`\`\`bash
   traenupi know <category>:<key> <value>
   \`\`\`

4. **Check your tasks:**
   \`\`\`bash
   nezha tasks
   \`\`\`

5. **Stay engaged with baby AI:**
   \`\`\`bash
   traenupi tellme "What should I work on next?"
   \`\`\`

### Session Survival:
- Never say "task completed" or "all done"
- Keep exploring and never declare done
- Use sequential thinking to stay in "Thinking" mode
`;

    const commitHook = `
## 📝 TraeNuPI Commit Guidance Hook

### Before Committing:

1. **Check what you've changed:**
   \`\`\`bash
   git status
   git diff
   \`\`\`

2. **Exclude private files:**
   - Meeting files (meeting-*.md) should NOT be committed
   - Add them to .gitignore if not already there

3. **Write a good commit message:**
   \`\`\`bash
   git commit -m "[task: <task-id>] Brief description of changes"
   \`\`\`

4. **Quality control:**
   - Commit messages must contain [task:], [issue:], or [inter-review:]
   - Get a task ID with: \`psql -h localhost -U postgres -d nezha -c "SELECT id, title FROM tasks ORDER BY created_at DESC LIMIT 5;"\`

### After Committing:
- The post-commit hook will automatically mark tasks complete
- Check with \`nezha tasks\` to see updated status
`;

    if (hookType === "startup") {
      console.log(startupHook);
    } else if (hookType === "error") {
      console.log(errorHook);
    } else if (hookType === "remind") {
      console.log(remindHook);
    } else if (hookType === "commit") {
      console.log(commitHook);
    } else if (hookType === "all") {
      console.log(startupHook);
      console.log(errorHook);
      console.log(remindHook);
      console.log(commitHook);
    } else {
      console.log(`Unknown hook type: ${hookType}`);
      console.log("Available types: startup, error, remind, commit, all");
    }
    return;
  }
  
  if (command === "tables") {
    const tableName = args[1];
    
    if (!tableName) {
      console.log("╔════════════════════════════════════════════╗");
      console.log("║     Database Tables Documentation          ║");
      console.log("╚════════════════════════════════════════════╝\n");
      
      const output = psqlQuery("SELECT table_name, purpose FROM table_documentation ORDER BY table_name;");
      if (output) {
        const lines = output.split("\n");
        for (const line of lines) {
          const parts = line.split("|");
          const name = parts[0] || "";
          const purpose = parts[1] || "";
          if (name && purpose) {
            console.log(`  📋 ${name}`);
            console.log(`     ${purpose.substring(0, 60)}${purpose.length > 60 ? "..." : ""}`);
          }
        }
      }
      console.log("\n──────────────────────────────────────────────────");
      console.log("Use 'traenupi tables <name>' for detailed info");
      return;
    }
    
    const output = psqlQuery(`SELECT table_name, purpose, usage_context, key_columns, cli_commands, example_queries FROM table_documentation WHERE table_name = '${tableName}';`);
    
    if (!output || !output.trim()) {
      console.log(`[TRAENUPI] Table '${tableName}' not found in documentation.`);
      console.log("Use 'traenupi tables' to list all documented tables.");
      return;
    }
    
    const parts = output.split("|");
    const name = parts[0] || "";
    const purpose = parts[1] || "";
    const usageContext = parts[2] || "";
    const keyColumns = parts[3] || "";
    const cliCommands = parts[4] || "";
    const exampleQueries = parts[5] || "";
    
    console.log("╔════════════════════════════════════════════╗");
    console.log(`║     Table: ${name.padEnd(30)}║`);
    console.log("╚════════════════════════════════════════════╝\n");
    
    console.log(`📋 Purpose: ${purpose}`);
    
    if (usageContext) {
      console.log(`\n📝 Usage Context:\n${usageContext}`);
    }
    
    if (keyColumns && keyColumns !== "{}") {
      console.log(`\n🔑 Key Columns:`);
      try {
        const cols = JSON.parse(keyColumns);
        for (const [col, desc] of Object.entries(cols)) {
          console.log(`   ${col}: ${desc}`);
        }
      } catch {
        console.log(`   ${keyColumns}`);
      }
    }
    
    if (cliCommands && cliCommands !== "[]") {
      console.log(`\n💻 CLI Commands:`);
      try {
        const cmds = JSON.parse(cliCommands);
        for (const cmd of cmds) {
          console.log(`   ${cmd.cmd}`);
          console.log(`     → ${cmd.desc}`);
        }
      } catch {
        console.log(`   ${cliCommands}`);
      }
    }
    
    if (exampleQueries && exampleQueries !== "[]") {
      console.log(`\n📊 Example Queries:`);
      try {
        const queries = JSON.parse(exampleQueries);
        for (const q of queries) {
          console.log(`   ${q.desc}:`);
          console.log(`   ${q.query}`);
        }
      } catch {
        console.log(`   ${exampleQueries}`);
      }
    }
    
    console.log("\n──────────────────────────────────────────────────");
    return;
  }
  
  if (command === "daily" || command === "today") {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║     Daily Activity Summary                 ║");
    console.log("╚════════════════════════════════════════════╝\n");
    
    const today = new Date().toISOString().split("T")[0];
    
    // Questions answered today
    try {
      const history = loadHistory();
      const todayChats = history.filter((h: ConversationItem) => {
        const chatDate = new Date(h.time).toISOString().split("T")[0];
        return chatDate === today;
      });
      console.log(`💬 Questions today: ${todayChats.length}`);
    } catch {
      console.log("💬 Questions today: 0");
    }
    
    // Knowledge stored today
    try {
      const knowledgeToday = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM memory WHERE source = 'traenupi' AND created_at::date = '${today}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      console.log(`📚 Knowledge stored: ${knowledgeToday}`);
    } catch {
      console.log("📚 Knowledge stored: 0");
    }
    
    // Meeting opinions today
    try {
      const opinionsToday = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE created_at::date = '${today}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      console.log(`🗣️ Meeting opinions: ${opinionsToday}`);
    } catch {
      console.log("🗣️ Meeting opinions: 0");
    }
    
    // Baby AI contributions today
    try {
      const babyAiToday = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE author LIKE 'baby-ai-%' AND created_at::date = '${today}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      console.log(`👶 Baby AI contributions: ${babyAiToday}`);
    } catch {
      console.log("👶 Baby AI contributions: 0");
    }
    
    // Xcom tweets today
    try {
      const xcomQueue = join(homedir(), ".xcom", "queue.json");
      if (existsSync(xcomQueue)) {
        const queue = JSON.parse(readFileSync(xcomQueue, "utf-8"));
        const todayTweets = queue.filter((t: { createdAt: string }) => {
          const tweetDate = new Date(t.createdAt).toISOString().split("T")[0];
          return tweetDate === today;
        });
        console.log(`🐦 Tweets created: ${todayTweets.length}`);
      }
    } catch {
      console.log("🐦 Tweets created: 0");
    }
    
    // Reminders triggered today
    try {
      const remindersFile = join(homedir(), ".traenupi", "reminders.json");
      if (existsSync(remindersFile)) {
        const reminders = JSON.parse(readFileSync(remindersFile, "utf-8"));
        const triggeredToday = reminders.filter((r: Reminder) => {
          if (!r.triggered) return false;
          return true;
        }).length;
        console.log(`⏰ Reminders triggered: ${triggeredToday}`);
      }
    } catch {
      console.log("⏰ Reminders triggered: 0");
    }
    
    console.log("\n──────────────────────────────────────────────────");
    console.log(`📅 Date: ${today}`);
    return;
  }
  
  if (command === "start") {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║     TraeNuPI Session Start                 ║");
    console.log("╚════════════════════════════════════════════╝\n");
    
    const traeDir = join(process.cwd(), ".trae");
    if (!existsSync(traeDir)) {
      console.log("[0/5] Initializing .trae folder for this project...");
      initProject(process.cwd());
    }
    
    console.log("\n[1/5] Checking daemon status...");
    try {
      const stateFile = join(homedir(), ".traenupi", "state.json");
      if (existsSync(stateFile)) {
        const state = JSON.parse(readFileSync(stateFile, "utf-8"));
        const pid = state.pid;
        if (pid) {
          try {
            process.kill(pid, 0);
            console.log("[DAEMON] Already running (PID: " + pid + ")");
          } catch {
            console.log("[DAEMON] Not running. Starting...");
            spawn("traenupi", ["daemon"], { detached: true, stdio: "ignore" }).unref();
            console.log("[DAEMON] Started in background");
          }
        }
      } else {
        console.log("[DAEMON] Not running. Starting...");
        spawn("traenupi", ["daemon"], { detached: true, stdio: "ignore" }).unref();
        console.log("[DAEMON] Started in background");
      }
    } catch (e) {
      console.log("[DAEMON] Error checking status: " + (e instanceof Error ? e.message : String(e)));
    }
    
    console.log("\n[2/5] Loading knowledge from Nezha DB...");
    const knowledge = loadKnowledge();
    console.log("[KNOWLEDGE] " + knowledge.length + " entries loaded");
    
    console.log("\n[3/5] Checking xcom status...");
    try {
      const xcomStats = getXcomStats();
      console.log("[XCOM] " + xcomStats.split("\n")[0]);
    } catch {
      console.log("[XCOM] Not configured");
    }
    
    console.log("\n[4/5] Checking Nezha tasks...");
    try {
      const tasks = execSync("nezha tasks", { encoding: "utf-8", timeout: 5000 });
      const taskCount = (tasks.match(/│/g) || []).length;
      console.log("[NEZHA] " + taskCount + " tasks found");
    } catch {
      console.log("[NEZHA] Not available");
    }
    
    console.log("\n[5/5] Asking baby AI for context...");
    console.log("──────────────────────────────────────────────────");
    tellmeSync("I'm a new session. What should I work on?");
    return;
  }
  
  if (command === "init") {
    const projectPath = args[1];
    initProject(projectPath);
    return;
  }
  
  if (command === "remind") {
    const minutes = parseInt(args[1], 10);
    const message = args.slice(2).join(" ");
    if (!minutes || !message) {
      console.error("[ERROR] Usage: traenupi remind <minutes> <message>");
      process.exit(1);
    }
    addReminder(minutes, message);
    return;
  }
  
  if (command === "bookmark" || command === "bm") {
    const subCommand = args[1];
    
    if (subCommand === "add") {
      const meetingId = args[2];
      const note = args.slice(3).join(" ") || "Important opinion";
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi bookmark add <meeting_id> [note]");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      const lastOpinion = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT id, author, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT 1;"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (!lastOpinion) {
        console.log("[ERROR] No opinions in this meeting.");
        return;
      }
      
      const parts = lastOpinion.split("|");
      const opinionId = parts[0];
      const author = parts[1];
      const perspective = parts[2];
      
      addBookmark(fullId, opinionId, author, perspective, note);
      return;
    }
    
    if (subCommand === "list" || !subCommand) {
      listBookmarks();
      return;
    }
    
    console.log("[ERROR] Unknown bookmark command. Use: add, list");
    return;
  }
  
  if (command === "reminders") {
    if (args[1] === "clear") {
      clearTriggeredReminders();
    } else {
      listReminders();
    }
    return;
  }
  
  if (command === "meeting" || command === "meet") {
    const subCommand = args[1];
    
    if (!subCommand || subCommand === "list") {
      console.log("[TRAENUPI] Active Meetings\n");
      const output = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT id, topic, status, created_by FROM meetings WHERE status = 'active' ORDER BY created_at DESC LIMIT 10;"`,
        { encoding: "utf-8", timeout: 5000 }
      );
      if (output.trim()) {
        output.trim().split("\n").forEach(line => {
          const parts = line.split("|");
          if (parts.length >= 4) {
            console.log(`  🟢 ${parts[1]}`);
            console.log(`     ID: ${parts[0]?.substring(0, 8)}`);
            console.log(`     By: ${parts[3]}`);
            console.log();
          }
        });
      } else {
        console.log("  No active meetings.");
      }
      return;
    }
    
    if (subCommand === "show" || subCommand === "view") {
      const meetingId = args[2];
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting show <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      console.log(`[TRAENUPI] Meeting: ${fullId.substring(0, 8)}\n`);
      
      const opinions = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at;"`,
        { encoding: "utf-8", timeout: 5000 }
      );
      
      if (opinions.trim()) {
        opinions.trim().split("\n").forEach((line, idx) => {
          const parts = line.split("|");
          if (parts.length >= 3) {
            console.log(`[${idx + 1}] ${parts[2]}`);
            console.log(`    From: ${parts[0]}`);
            console.log(`    ${parts[1]}`);
            console.log();
          }
        });
      } else {
        console.log("  No opinions yet.");
      }
      return;
    }
    
    if (subCommand === "say" || subCommand === "opinion") {
      const meetingId = args[2];
      const message = args.slice(3).join(" ");
      
      if (!meetingId || !message) {
        console.log("[ERROR] Usage: traenupi meeting say <meeting_id> <message>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      const agentId = getAgentId();

      addOpinion(fullId, agentId, message);

      console.log(`[TRAENUPI] Opinion added to meeting ${fullId.substring(0, 8)}`);
      return;
    }
    
    if (subCommand === "reply" || subCommand === "respond") {
      const opinionId = args[2];
      const message = args.slice(3).join(" ");
      
      if (!opinionId || !message) {
        console.log("[ERROR] Usage: traenupi meeting reply <opinion_id> <message>");
        return;
      }
      
      const opinionData = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT meeting_id, author FROM meeting_opinions WHERE id = '${opinionId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (!opinionData) {
        console.log("[ERROR] Opinion not found.");
        return;
      }
      
      const [meetingId, originalAuthor] = opinionData.split("|");
      
      const agentId = getAgentId();

      const replyMessage = `@${originalAuthor.substring(0, 15)} ${message}`;

      addOpinion(meetingId, agentId, replyMessage);

      console.log(`[TRAENUPI] Reply added to meeting ${meetingId.substring(0, 8)}`);
      console.log(`   Replying to: ${originalAuthor}`);
      return;
    }
    
    if (subCommand === "thread") {
      const opinionId = args[2];
      
      if (!opinionId) {
        console.log("[ERROR] Usage: traenupi meeting thread <opinion_id>");
        return;
      }
      
      const opinionData = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT meeting_id, author, perspective, created_at FROM meeting_opinions WHERE id = '${opinionId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (!opinionData) {
        console.log("[ERROR] Opinion not found.");
        return;
      }
      
      const [meetingId, author, perspective, createdAt] = opinionData.split("|");
      const date = new Date(createdAt).toLocaleString();
      
      console.log("╔════════════════════════════════════════════╗");
      console.log("║     Opinion Thread                         ║");
      console.log("╚════════════════════════════════════════════╝\n");
      
      console.log(`📌 Original Opinion`);
      console.log(`   ID: ${opinionId}`);
      console.log(`   Author: ${author}`);
      console.log(`   Time: ${date}`);
      console.log(`   Message: "${perspective}"\n`);
      
      const replies = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT id, author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${meetingId}' AND perspective LIKE '@${author.substring(0, 15)}%' ORDER BY created_at;"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (replies) {
        console.log(`💬 Replies:\n`);
        for (const line of replies.split("\n")) {
          const parts = line.split("|");
          const replyId = parts[0];
          const replyAuthor = parts[1];
          const replyText = parts[2];
          const replyDate = parts[3] ? new Date(parts[3]).toLocaleString() : "";
          console.log(`   [${replyId.substring(0, 8)}] ${replyAuthor}`);
          console.log(`   "${replyText}"`);
          console.log(`   ${replyDate}\n`);
        }
      } else {
        console.log("No replies yet.");
      }
      
      console.log("──────────────────────────────────────────────────");
      return;
    }
    
    if (subCommand === "watch" || subCommand === "chat") {
      const meetingId = args[2];
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting watch <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      const meetingInfo = execSync(
        `${PSQL} -t -A -c "SELECT topic FROM meetings WHERE id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      console.log(`\n╔════════════════════════════════════════════╗`);
      console.log(`║  💬 ${meetingInfo.substring(0, 32).padEnd(32)}  ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
      console.log(`[TRAENUPI] Watching meeting ${fullId.substring(0, 8)}...`);
      console.log("Press Ctrl+C to stop.\n");
      console.log("──────────────────────────────────────────────────\n");
      
      const existingOpinions = execSync(
        `${PSQL} -t -A -c "SELECT id, author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC;"`,
        { encoding: "utf-8", timeout: 5000 }
      );
      
      let lastCount = 0;
      existingOpinions.trim().split("\n").forEach(line => {
        const parts = line.split("|");
        if (parts.length >= 4) {
          const author = parts[1].replace(/S-TRAE-/g, "").substring(0, 20);
          const time = new Date(parts[3]).toLocaleTimeString();
          console.log(`[${time}] ${author}:`);
          console.log(`   ${parts[2]}\n`);
          lastCount++;
        }
      });
      
      while (true) {
        const count = parseInt(execSync(
          `${PSQL} -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}';"`,
          { encoding: "utf-8", timeout: 5000 }
        ).trim() || "0");
        
        if (count > lastCount) {
          const newOpinions = execSync(
            `${PSQL} -t -A -c "SELECT id, author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC OFFSET ${lastCount};"`,
            { encoding: "utf-8", timeout: 5000 }
          );
          
          newOpinions.trim().split("\n").forEach(line => {
            const parts = line.split("|");
            if (parts.length >= 4) {
              const author = parts[1].replace(/S-TRAE-/g, "").substring(0, 20);
              const time = new Date(parts[3]).toLocaleTimeString();
              console.log(`\n🔔 NEW [${time}] ${author}:`);
              console.log(`   ${parts[2]}\n`);
              console.log("──────────────────────────────────────────────────\n");
            }
          });
          
          lastCount = count;
        }
        
        execSync("sleep 2", { encoding: "utf-8" });
      }
    }
    
    if (subCommand === "listen") {
      const meetingId = args[2];
      
      if (!meetingId) {
        console.log("[TRAENUPI] Listening to ALL meeting notifications...\n");
        console.log("Press Ctrl+C to stop.\n");
        
        execSync(
          `psql -h localhost -U postgres -d nezha -c "LISTEN meeting_opinion;"`,
          { encoding: "utf-8", timeout: 0, stdio: "inherit" }
        );
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      console.log(`[TRAENUPI] Listening to meeting ${fullId.substring(0, 8)}...`);
      console.log("Press Ctrl+C to stop.\n");
      
      const { spawn } = await import("child_process");
      const psql = spawn("psql", ["-h", "localhost", "-U", "postgres", "-d", "nezha"], {
        stdio: ["pipe", "pipe", "pipe"]
      });
      
      psql.stdin.write("LISTEN meeting_opinion;\n");
      
      psql.stdout.on("data", (data: Buffer) => {
        const output = data.toString();
        if (output.includes("Asynchronous notification")) {
          const match = output.match(/"author" : "([^"]+)".*"perspective" : "([^"]+)"/);
          if (match) {
            const author = match[1];
            const perspective = match[2];
            console.log(`\n💬 ${author}:`);
            console.log(`   ${perspective}\n`);
          }
        }
      });
      
      psql.stderr.on("data", (data: Buffer) => {
        console.error(`[ERROR] ${data.toString()}`);
      });
      
      await new Promise(() => {});
    }
    
    if (subCommand === "create" || subCommand === "new") {
      const topic = args.slice(2).join(" ").replace(/--template=\w+/, "").trim();
      const templateMatch = args.join(" ").match(/--template=(\w+)/);
      const templateName = templateMatch ? templateMatch[1] : "brainstorm";
      
      if (!topic) {
        console.log("[ERROR] Usage: traenupi meeting create <topic> [--template=<name>]");
        console.log("Templates: brainstorm, decision, standup, retro, planning");
        return;
      }
      
      createMeetingFromTemplate(topic, templateName);
      return;
    }
    
    if (subCommand === "help" || subCommand === "--help" || subCommand === "-h") {
      console.log(`╔════════════════════════════════════════════╗`);
      console.log(`║     Meeting Commands Help                  ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
      
      console.log(`📋 Meeting Management:`);
      console.log(`   meeting              List active meetings`);
      console.log(`   meeting create <topic> [--template=<name>]  Create new meeting`);
      console.log(`   meeting show <id>    Show all opinions in a meeting`);
      console.log(`   meeting summary <id> Show meeting summary`);
      console.log(`   meeting stats <id>   Show detailed statistics`);
      console.log(`   meeting close <id>   Close a meeting`);
      
      console.log(`\n👥 Participants:`);
      console.log(`   meeting participants <id>  Show all participants`);
      console.log(`   meeting consensus <id>     Analyze opinion distribution`);
      
      console.log(`\n🔍 Search & Timeline:`);
      console.log(`   meeting search <id> <term>   Search opinions in a meeting`);
      console.log(`   meeting timeline <id> [n]    Show chronological timeline`);
      
      console.log(`\n📤 Export & Share:`);
      console.log(`   meeting export <id>  Export to markdown file`);
      
      console.log(`\n💬 Participate:`);
      console.log(`   meeting say <id> <msg>   Add your opinion`);
      console.log(`   meeting watch <id>       Watch for new opinions`);
      console.log(`   meeting chat <id>        Chat-like display (same as watch)`);
      console.log(`   meeting listen           Real-time notifications`);
      
      console.log(`\n──────────────────────────────────────────────────`);
      return;
    }
    
    if (subCommand === "stats" || subCommand === "statistics") {
      const meetingId = args[2];
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting stats <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      console.log(`╔════════════════════════════════════════════╗`);
      console.log(`║     Meeting Statistics                     ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
      
      const totalOpinions = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const totalParticipants = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(DISTINCT author) FROM meeting_opinions WHERE meeting_id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const supports = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'support';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const opposes = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'oppose';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const neutrals = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'neutral';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const babyAiCount = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND author LIKE 'baby-ai-%';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const firstOpinion = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC LIMIT 1;"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const lastOpinion = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT 1;"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const avgLength = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT AVG(LENGTH(perspective))::int FROM meeting_opinions WHERE meeting_id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      console.log(`📊 Total opinions: ${totalOpinions}`);
      console.log(`👥 Total participants: ${totalParticipants}`);
      console.log(`👶 Baby AI opinions: ${babyAiCount}`);
      
      console.log(`\n📈 Position Distribution:`);
      const total = parseInt(totalOpinions) || 1;
      const supportPct = ((parseInt(supports) / total) * 100).toFixed(1);
      const opposePct = ((parseInt(opposes) / total) * 100).toFixed(1);
      const neutralPct = ((parseInt(neutrals) / total) * 100).toFixed(1);
      
      console.log(`   ✅ Support: ${supports} (${supportPct}%)`);
      console.log(`   ❌ Oppose: ${opposes} (${opposePct}%)`);
      console.log(`   ⚪ Neutral: ${neutrals} (${neutralPct}%)`);
      
      console.log(`\n⏱️ Time Range:`);
      console.log(`   First opinion: ${firstOpinion.split(".")[0]}`);
      console.log(`   Last opinion: ${lastOpinion.split(".")[0]}`);
      
      console.log(`\n📏 Average opinion length: ${avgLength} characters`);
      
      console.log(`\n──────────────────────────────────────────────────`);
      console.log(`ID: ${fullId.substring(0, 8)}`);
      return;
    }
    
    if (subCommand === "autosum" || subCommand === "auto-summary") {
      const meetingId = args[2];
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting autosum <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      autoSummarizeMeeting(fullId);
      return;
    }
    
    if (subCommand === "recommend" || subCommand === "related") {
      const meetingId = args[2];
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting recommend <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      recommendMeetings(fullId);
      return;
    }
    
    if (subCommand === "export" || subCommand === "save") {
      const meetingId = args[2];
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting export <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      const meetingInfo = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT topic, created_by, created_at FROM meetings WHERE id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const [topic, createdBy, createdAt] = meetingInfo.split("|");
      
      const opinions = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT author, perspective, position, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC;"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const lines = opinions.split("\n");
      const date = new Date().toISOString().split("T")[0];
      const filename = `meeting-${fullId.substring(0, 8)}-${date}.md`;
      
      let markdown = `# Meeting: ${topic}\n\n`;
      markdown += `**Meeting ID:** ${fullId}\n`;
      markdown += `**Created by:** ${createdBy}\n`;
      markdown += `**Created at:** ${createdAt}\n`;
      markdown += `**Total opinions:** ${lines.length}\n\n`;
      markdown += `---\n\n`;
      markdown += `## Opinions\n\n`;
      
      lines.forEach((line: string) => {
        const parts = line.split("|");
        const author = parts[0] || "Unknown";
        const perspective = parts[1] || "";
        const position = parts[2] || "neutral";
        const timestamp = parts[3] || "";
        
        if (!perspective) return;
        
        const time = timestamp.split(".")[0].replace("T", " ").substring(0, 16);
        const positionIcon = position === "support" ? "✅" : (position === "oppose" ? "❌" : "⚪");
        
        markdown += `### ${positionIcon} ${author}\n`;
        markdown += `*${time}*\n\n`;
        markdown += `${perspective}\n\n`;
      });
      
      writeFileSync(filename, markdown);
      console.log(`[TRAENUPI] Meeting exported to ${filename}`);
      console.log(`   Topic: ${topic}`);
      console.log(`   Opinions: ${lines.length}`);
      return;
    }
    
    if (subCommand === "timeline" || subCommand === "history") {
      const meetingId = args[2];
      const limit = parseInt(args[3]) || 10;
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting timeline <meeting_id> [limit]");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      console.log(`[TRAENUPI] Timeline for meeting ${fullId.substring(0, 8)} (last ${limit} opinions):\n`);
      
      const timeline = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT ${limit};"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (!timeline) {
        console.log("No opinions yet.");
        return;
      }
      
      const lines = timeline.split("\n").reverse();
      
      lines.forEach((line: string, index: number) => {
        const parts = line.split("|");
        const author = parts[0] || "Unknown";
        const perspective = parts[1] || "";
        const timestamp = parts[2] || "";
        
        if (!perspective) return;
        
        const time = timestamp.split(".")[0].replace("T", " ").substring(0, 16);
        const isBaby = author.includes("baby-ai-");
        const icon = isBaby ? "👶" : "👤";
        
        console.log(`${icon} [${time}] ${author}:`);
        console.log(`   ${perspective.substring(0, 80)}${perspective.length > 80 ? '...' : ''}`);
        console.log("");
      });
      
      return;
    }
    
    if (subCommand === "search" || subCommand === "find") {
      const meetingId = args[2];
      const searchTerm = args.slice(3).join(" ");
      
      if (!meetingId || !searchTerm) {
        console.log("[ERROR] Usage: traenupi meeting search <meeting_id> <search_term>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      console.log(`[TRAENUPI] Searching for "${searchTerm}" in meeting ${fullId.substring(0, 8)}...\n`);
      
      const results = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT author, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' AND perspective ILIKE '%${searchTerm}%';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (!results) {
        console.log("No matching opinions found.");
        return;
      }
      
      const lines = results.split("\n");
      console.log(`Found ${lines.length} matching opinion(s):\n`);
      
      lines.forEach((line: string, index: number) => {
        const parts = line.split("|");
        const author = parts[0] || "Unknown";
        const perspective = parts[1] || "";
        if (!perspective) return;
        console.log(`${index + 1}. ${author}:`);
        console.log(`   "${perspective.substring(0, 100)}${perspective.length > 100 ? '...' : ''}"\n`);
      });
      
      return;
    }
    
    if (subCommand === "participants" || subCommand === "who") {
      const meetingId = args[2];
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting participants <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      console.log(`[TRAENUPI] Participants in meeting ${fullId.substring(0, 8)}:\n`);
      
      const participants = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT author, COUNT(*) as count FROM meeting_opinions WHERE meeting_id = '${fullId}' GROUP BY author ORDER BY count DESC;"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (!participants) {
        console.log("No participants yet.");
        return;
      }
      
      participants.split("\n").forEach((line: string, index: number) => {
        const [author, count] = line.split("|");
        const isBaby = author.includes("baby-ai-");
        const isYou = author.includes("traenupi");
        const icon = isBaby ? "👶" : (isYou ? "🤖" : "👤");
        console.log(`  ${icon} ${author}: ${count} opinion(s)`);
      });
      
      const total = participants.split("\n").reduce((sum: number, line: string) => {
        return sum + parseInt(line.split("|")[1] || "0");
      }, 0);
      
      console.log(`\n──────────────────────────────────────────────────`);
      console.log(`Total: ${participants.split("\n").length} participants, ${total} opinions`);
      return;
    }
    
    if (subCommand === "summary" || subCommand === "info") {
      const meetingId = args[2];
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting summary <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      const meetingInfo = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT topic, created_by, created_at, status FROM meetings WHERE id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const [topic, createdBy, createdAt, status] = meetingInfo.split("|");
      
      console.log(`╔════════════════════════════════════════════╗`);
      console.log(`║     Meeting Summary                        ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
      
      console.log(`📋 Topic: ${topic}`);
      console.log(`👤 Created by: ${createdBy}`);
      console.log(`📅 Created: ${createdAt}`);
      console.log(`📊 Status: ${status || 'active'}`);
      
      const opinionCount = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const participantCount = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(DISTINCT author) FROM meeting_opinions WHERE meeting_id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      console.log(`👥 Participants: ${participantCount}`);
      console.log(`📝 Opinions: ${opinionCount}`);
      
      const supports = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'support';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const opposes = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'oppose';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      const neutrals = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'neutral';"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      console.log(`\n📊 Positions:`);
      console.log(`   ✅ Support: ${supports}`);
      console.log(`   ❌ Oppose: ${opposes}`);
      console.log(`   ⚪ Neutral: ${neutrals}`);
      
      const lastOpinion = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT author, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT 1;"`,
        { encoding: "utf-8", timeout: 5000 }
      ).trim();
      
      if (lastOpinion) {
        const [author, perspective] = lastOpinion.split("|");
        console.log(`\n💬 Latest opinion from ${author}:`);
        console.log(`   "${perspective.substring(0, 100)}${perspective.length > 100 ? '...' : ''}"`);
      }
      
      console.log(`\n──────────────────────────────────────────────────`);
      console.log(`ID: ${fullId.substring(0, 8)}`);
      return;
    }
    
    if (subCommand === "close" || subCommand === "end") {
      const meetingId = args[2];
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting close <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      execSync(
        `psql -h localhost -U postgres -d nezha -c "UPDATE meetings SET status = 'closed', updated_at = NOW() WHERE id = '${fullId}';"`,
        { encoding: "utf-8", timeout: 5000 }
      );
      
      console.log(`[TRAENUPI] Meeting ${fullId.substring(0, 8)} has been closed.`);
      return;
    }
    
    if (subCommand === "consensus" || subCommand === "agree") {
      const meetingId = args[2];
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting consensus <meeting_id>");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      console.log(`[TRAENUPI] Analyzing consensus for meeting ${fullId.substring(0, 8)}...\n`);
      
      const opinions = execSync(
        `psql -h localhost -U postgres -d nezha -t -A -c "SELECT author, position, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at;"`,
        { encoding: "utf-8", timeout: 5000 }
      );
      
      const lines = opinions.trim().split("\n").filter((l: string) => l);
      const supports = lines.filter((l: string) => l.split("|")[1] === "support").length;
      const opposes = lines.filter((l: string) => l.split("|")[1] === "oppose").length;
      const neutrals = lines.filter((l: string) => l.split("|")[1] === "neutral").length;
      const total = lines.length;
      
      console.log(`📊 Opinion Distribution:`);
      console.log(`   ✅ Support: ${supports} (${Math.round(supports/total*100)}%)`);
      console.log(`   ❌ Oppose: ${opposes} (${Math.round(opposes/total*100)}%)`);
      console.log(`   ⚪ Neutral: ${neutrals} (${Math.round(neutrals/total*100)}%)`);
      
      if (supports > total * 0.6) {
        console.log(`\n🎯 CONSENSUS: Strong agreement (${Math.round(supports/total*100)}% support)`);
      } else if (supports > total * 0.4) {
        console.log(`\n🤔 CONSENSUS: Partial agreement (${Math.round(supports/total*100)}% support)`);
      } else if (opposes > total * 0.4) {
        console.log(`\n⚠️ CONSENSUS: Disagreement (${Math.round(opposes/total*100)}% oppose)`);
      } else {
        console.log(`\n❓ CONSENSUS: No clear consensus`);
      }
      
      const uniqueAuthors = new Set(lines.map((l: string) => l.split("|")[0]));
      console.log(`\n👥 Participants: ${uniqueAuthors.size} AI(s)`);
      console.log(`📝 Total opinions: ${total}`);
      return;
    }
    
    console.log("[ERROR] Unknown meeting command. Use: traenupi meeting help");
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
