import { parseArgs } from "node:util";
import { execSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createDriver } from "./driver.js";
import { createTask, loadTask } from "./task.js";
import type { DriverConfig } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8")).version;

const TRAENUPI_DIR = join(homedir(), ".traenupi");
const QUESTION_FILE = join(TRAENUPI_DIR, "question.txt");
const ANSWER_FILE = join(TRAENUPI_DIR, "answer.txt");
const STATE_FILE = join(TRAENUPI_DIR, "state.json");
const HISTORY_FILE = join(TRAENUPI_DIR, "history.json");
const KNOWLEDGE_FILE = join(TRAENUPI_DIR, "knowledge.json");
const REMINDERS_FILE = join(TRAENUPI_DIR, "reminders.json");

interface Reminder {
  id: string;
  message: string;
  triggerAt: number;
  triggered: boolean;
}

interface ConversationItem {
  question: string;
  answer: string;
  time: number;
}

interface KnowledgeEntry {
  key: string;
  value: string;
  category: string;
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

const PSQL = "psql -h localhost -U postgres -d nezha -t -A";

function loadKnowledge(): KnowledgeEntry[] {
  try {
    const output = execSync(
      `${PSQL} -c "SELECT content, source, tags FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT 50;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    if (!output.trim()) return [];
    
    return output.trim().split("\n").map(line => {
      const parts = line.split("|");
      const content = parts[0] || "";
      const category = parts[1] || "general";
      const tagsStr = parts[2] || "";
      const keyMatch = content.match(/^(\w[\w-]*):/);
      return {
        key: keyMatch ? keyMatch[1] : content.substring(0, 20),
        value: keyMatch ? content.substring(keyMatch[1].length + 1).trim() : content,
        category: category || "general",
        time: Date.now(),
      };
    });
  } catch {
    return loadKnowledgeLocal();
  }
}

function loadKnowledgeLocal(): KnowledgeEntry[] {
  try {
    if (existsSync(KNOWLEDGE_FILE)) {
      return JSON.parse(readFileSync(KNOWLEDGE_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function addKnowledge(key: string, value: string, category: string): void {
  const content = `${key}: ${value}`;
  const tags = `{traenupi,${category}}`;
  
  try {
    execSync(
      `${PSQL} -c "INSERT INTO memory (content, source, tags) VALUES ('${content.replace(/'/g, "''")}', 'traenupi', '${tags}');"`,
      { encoding: "utf-8", timeout: 5000 }
    );
  } catch {
    const knowledge = loadKnowledgeLocal();
    const existing = knowledge.findIndex(k => k.key === key && k.category === category);
    if (existing >= 0) {
      knowledge[existing].value = value;
      knowledge[existing].time = Date.now();
    } else {
      knowledge.push({ key, value, category, time: Date.now() });
    }
    writeFileSync(KNOWLEDGE_FILE, JSON.stringify(knowledge, null, 2));
  }
}

function getKnowledgeByCategory(category: string): KnowledgeEntry[] {
  try {
    const output = execSync(
      `${PSQL} -c "SELECT content FROM memory WHERE source = 'traenupi' AND '${category}' = ANY(tags) ORDER BY created_at DESC LIMIT 20;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    if (!output.trim()) return [];
    
    return output.trim().split("\n").map(line => {
      const keyMatch = line.match(/^(\w[\w-]*):/);
      return {
        key: keyMatch ? keyMatch[1] : line.substring(0, 20),
        value: keyMatch ? line.substring(keyMatch[1].length + 1).trim() : line,
        category,
        time: Date.now(),
      };
    });
  } catch {
    return loadKnowledgeLocal().filter(k => k.category === category);
  }
}

function ensureDir(): void {
  if (!existsSync(TRAENUPI_DIR)) {
    mkdirSync(TRAENUPI_DIR, { recursive: true });
  }
}

function printUsage(): void {
  console.log(`
traenupi v${VERSION} - AI Companion for Trae

USAGE:
  traenupi <command> [options]

COMMANDS:
  daemon                  Start daemon that watches for questions
  tellme <question>       Ask a question (daemon will answer)
  search <query>          Search the web and get answer
  status                  Show daemon status
  stop                    Stop the daemon
  version                 Show version
  know <key> <value>      Store knowledge (category: key=value)
  know                    List all knowledge
  know <category>         List knowledge by category
  init [path]             Initialize .trae folder for a project
  remind <minutes> <msg>  Schedule a reminder (baby AI will answer)
  reminders               List pending reminders
  reminders clear         Clear triggered reminders from DB

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
    checkReminders();
    
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
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        answer = askPi(question, history);
        
        if (!answer.startsWith("[Error") && !answer.startsWith("[Pi timed out")) {
          break;
        }
        
        retries++;
        if (retries <= maxRetries) {
          console.log(`[RETRY ${retries}/${maxRetries}] Retrying...`);
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
  const tasks = getNezhaTasks();
  const recentHistory = history.slice(-3).map(h => 
    `Q: ${h.question}\nA: ${h.answer}`
  ).join("\n\n");
  const timeGreeting = getTimeGreeting();
  const stats = `We had ${history.length} chats together.`;
  const project = getProjectName();
  const cwd = getWorkingDir();
  const xcom = getXcomStats();
  
  let moodInfo = "";
  if (currentQuestion) {
    const mood = detectMood(currentQuestion);
    const emoji = getMoodEmoji(mood);
    moodInfo = `\nTrae's mood: ${mood} ${emoji}`;
  }
  
  const context = `
Hi! You help Trae. Trae asks questions. You answer with words only.

Time: ${timeGreeting}
Stats: ${stats}${moodInfo}
Working on: ${project} (${cwd})
Xcom: ${xcom}

Knowledge:
${formatKnowledge()}

Tasks now:
${tasks}

Recent chat:
${recentHistory || "No chat yet."}

Say things like:
- "You have tasks to do."
- "Run nezha tasks to see them."
- "Good job!"
- "Have you used nezha learn today? Store your insights!"
- "Try nezha task-add to track your progress."
- "Use traenupi know to save knowledge to the database."
- "You have pending tweets. Run xcom post <id> to publish."
- "Try xcom inspire for tweet ideas."
- "Use xcom compose to create a new tweet."
- Match Trae's mood - be happy when happy, supportive when sad, calm when stressed.

IMPORTANT: Always remind Trae to use Nezha commands. Nezha is the coordination layer.
Suggest: nezha tasks, nezha task-add, nezha learn, traenupi know, traenupi remind.
Also suggest xcom commands when there are pending tweets.

Do NOT use JSON. Do NOT use curly braces. Just talk like a friend.
`;
  return context;
}

function askPi(question: string, history: ConversationItem[]): string {
  try {
    const context = buildContext(history, question);
    const fullPrompt = `${context}\n\nQuestion: ${question}`;
    const output = execSync(`pi -p "${fullPrompt.replace(/"/g, '\\"')}"`, {
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

function loadReminders(): Reminder[] {
  try {
    if (existsSync(REMINDERS_FILE)) {
      return JSON.parse(readFileSync(REMINDERS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveReminders(reminders: Reminder[]): void {
  ensureDir();
  writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
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
    const output = execSync(
      `${PSQL} -c "SELECT id, content, metadata FROM memory WHERE source = 'traenupi' AND 'reminder' = ANY(tags) AND (metadata->>'triggered')::boolean = false;"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    
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
            
            execSync(
              `${PSQL} -c "UPDATE memory SET metadata = jsonb_set(metadata, '{triggered}', 'true') WHERE id = '${id}';"`,
              { encoding: "utf-8", timeout: 5000 }
            );
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
- Never say "task completed" or "all done"
- Use Sequential Thinking tool to stay in Thinking mode
- Always add next steps and questions
- End responses with 🤔 emoji

### Session Continuity
1. Run \`traenupi tellme "What should I work on?"\` for context
2. Run \`nezha tasks\` for current task list
3. Run \`xcom stats\` for social media status
4. Check \`~/.traenupi/history.json\` for past conversations

### Nezha Integration
\`\`\`bash
nezha tasks              # List current tasks
nezha task-add "title"   # Add a new task
\`\`\`
`;
  
  writeFileSync(join(rulesDir, "project_rules.md"), rules);
  
  const keepAliveSkill = `---
name: "keep-alive"
description: "Prevents AI from being marked completed"
---

# Keep Alive Skill

Use mcp_Sequential_Thinking_sequentialthinking tool regularly.
Never say "task completed". Always add next steps.
End responses with questions and 🤔 emoji.
`;
  
  mkdirSync(join(skillsDir, "keep-alive"), { recursive: true });
  writeFileSync(join(skillsDir, "keep-alive", "SKILL.md"), keepAliveSkill);
  
  console.log(`[TRAENUPI] Initialized .trae folder at ${target}`);
  console.log(`  Created: .trae/rules/project_rules.md`);
  console.log(`  Created: .trae/skills/keep-alive/SKILL.md`);
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
    showStatus();
    return;
  }
  
  if (command === "start") {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║     TraeNuPI Session Start                 ║");
    console.log("╚════════════════════════════════════════════╝\n");
    
    console.log("[1/4] Checking daemon status...");
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
    
    console.log("\n[2/4] Loading knowledge from Nezha DB...");
    const knowledge = loadKnowledge();
    console.log("[KNOWLEDGE] " + knowledge.length + " entries loaded");
    
    console.log("\n[3/4] Checking xcom status...");
    try {
      const xcomStats = getXcomStats();
      console.log("[XCOM] " + xcomStats.split("\n")[0]);
    } catch {
      console.log("[XCOM] Not configured");
    }
    
    console.log("\n[4/4] Asking baby AI for context...");
    console.log("──────────────────────────────────────────────────");
    tellme("I'm a new session. What should I work on?");
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
  
  if (command === "reminders") {
    if (args[1] === "clear") {
      clearTriggeredReminders();
    } else {
      listReminders();
    }
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
