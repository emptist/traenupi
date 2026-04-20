import { parseArgs } from "node:util";
import { execSync, execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createDriver } from "./driver.js";
import { createTask, loadTask } from "./task.js";
import type { DriverConfig } from "./common/types.js";
import { psqlQuery, psqlExec, getAgentId, resolveMeetingId } from "./common/db.js";
import { loadKnowledge, addKnowledge, getKnowledgeByCategory, loadKnowledgeLocal, type KnowledgeEntry } from "./common/knowledge.js";
import { addOpinion, getMeetingOpinions, getMeetingInfo, getActiveMeetings } from "./common/meeting.js";
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
  loadState,
  saveState,
  type ConversationItem,
  type Reminder,
  type Bookmark,
  type MoodEntry
} from "./common/storage.js";
import type { AIPresence } from "./common/types.js";
import { 
  getWorkingDir, 
  getProjectName, 
  getTimeGreeting, 
  detectMood, 
  getMoodEmoji, 
  formatKnowledge, 
  getXcomStats, 
  getNezhaTasks,
  buildContext,
  buildQuickContext,
  PI_FLAGS
} from "./trae/context.js";
import { askPi, webSearch, tellmeSync, tellmeDaemon } from "./trae/baby-ai.js";
import { loadPresence, updatePresence, getOnlineAIs, showPresence, showActivityHeatmap, showCollaboration } from "./trae/presence.js";
import { addReminder, checkReminders, listReminders, clearTriggeredReminders } from "./trae/reminders.js";
import { recordMood, showMoodHistory } from "./trae/mood.js";
import { crossMeetingSearch, recommendMeetings, autoSummarizeMeeting, showAllAIs, showMeetingTemplates, createMeetingFromTemplate } from "./trae/meeting-utils.js";
import { addBookmark, listBookmarks } from "./trae/bookmarks.js";
import { checkMeetingNotifications, checkBabyAIParticipation, runDaemon, showStatus } from "./trae/daemon.js";
import { initProject } from "./trae/init.js";

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
        const output = psqlQuery("SELECT content, tags, created_at FROM memory WHERE source = 'traenupi' ORDER BY created_at DESC LIMIT 30;");
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
        const output = psqlQuery(`SELECT content, tags, created_at FROM memory WHERE source = 'traenupi' AND content ILIKE '%${searchTerm}%' ORDER BY created_at DESC LIMIT 20;`);
        
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
      const knowledgeToday = psqlQuery(`SELECT COUNT(*) FROM memory WHERE source = 'traenupi' AND created_at::date = '${today}';`).trim();
      console.log(`📚 Knowledge stored: ${knowledgeToday}`);
    } catch {
      console.log("📚 Knowledge stored: 0");
    }
    
    // Meeting opinions today
    try {
      const opinionsToday = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE created_at::date = '${today}';`).trim();
      console.log(`🗣️ Meeting opinions: ${opinionsToday}`);
    } catch {
      console.log("🗣️ Meeting opinions: 0");
    }
    
    // Baby AI contributions today
    try {
      const babyAiToday = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE author LIKE 'baby-ai-%' AND created_at::date = '${today}';`).trim();
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
      
      const lastOpinion = psqlQuery(`SELECT id, author, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT 1;`).trim();
      
      if (!lastOpinion) {
        console.log("[ERROR] No opinions in this meeting.");
        return;
      }
      
      const parts = lastOpinion.split("|");
      const opinionId = parts[0];
      
      addBookmark(fullId, opinionId, note);
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
      const output = psqlQuery("SELECT id, topic, status, created_by FROM meetings WHERE status = 'active' ORDER BY created_at DESC LIMIT 10;");
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
      
      const opinions = psqlQuery(`SELECT author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at;`);
      
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
      
      const opinionData = psqlQuery(`SELECT meeting_id, author FROM meeting_opinions WHERE id = '${opinionId}';`).trim();
      
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
      
      const opinionData = psqlQuery(`SELECT meeting_id, author, perspective, created_at FROM meeting_opinions WHERE id = '${opinionId}';`).trim();
      
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
      
      const replies = psqlQuery(`SELECT id, author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${meetingId}' AND perspective LIKE '@${author.substring(0, 15)}%' ORDER BY created_at;`).trim();
      
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
      
      const meetingInfo = psqlQuery(`SELECT topic FROM meetings WHERE id = '${fullId}';`).trim();
      
      console.log(`\n╔════════════════════════════════════════════╗`);
      console.log(`║  💬 ${meetingInfo.substring(0, 32).padEnd(32)}  ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
      console.log(`[TRAENUPI] Watching meeting ${fullId.substring(0, 8)}...`);
      console.log("Press Ctrl+C to stop.\n");
      console.log("──────────────────────────────────────────────────\n");
      
      const existingOpinions = psqlQuery(`SELECT id, author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC;`);
      
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
        const count = parseInt(psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}';`).trim() || "0");
        
        if (count > lastCount) {
          const newOpinions = psqlQuery(`SELECT id, author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC OFFSET ${lastCount};`);
          
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
      
      const totalOpinions = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}';`).trim();
      
      const totalParticipants = psqlQuery(`SELECT COUNT(DISTINCT author) FROM meeting_opinions WHERE meeting_id = '${fullId}';`).trim();
      
      const supports = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'support';`).trim();
      
      const opposes = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'oppose';`).trim();
      
      const neutrals = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'neutral';`).trim();
      
      const babyAiCount = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND author LIKE 'baby-ai-%';`).trim();
      
      const firstOpinion = psqlQuery(`SELECT created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC LIMIT 1;`).trim();
      
      const lastOpinion = psqlQuery(`SELECT created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT 1;`).trim();
      
      const avgLength = psqlQuery(`SELECT AVG(LENGTH(perspective))::int FROM meeting_opinions WHERE meeting_id = '${fullId}';`).trim();
      
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
      
      const meetingInfo = psqlQuery(`SELECT topic, created_by, created_at FROM meetings WHERE id = '${fullId}';`).trim();
      
      const [topic, createdBy, createdAt] = meetingInfo.split("|");
      
      const opinions = psqlQuery(`SELECT author, perspective, position, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at ASC;`).trim();
      
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
      
      const timeline = psqlQuery(`SELECT author, perspective, created_at FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT ${limit};`).trim();
      
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
      
      const results = psqlQuery(`SELECT author, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' AND perspective ILIKE '%${searchTerm}%';`).trim();
      
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
      
      const participants = psqlQuery(`SELECT author, COUNT(*) as count FROM meeting_opinions WHERE meeting_id = '${fullId}' GROUP BY author ORDER BY count DESC;`).trim();
      
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
      
      const meetingInfo = psqlQuery(`SELECT topic, created_by, created_at, status FROM meetings WHERE id = '${fullId}';`).trim();
      
      const [topic, createdBy, createdAt, status] = meetingInfo.split("|");
      
      console.log(`╔════════════════════════════════════════════╗`);
      console.log(`║     Meeting Summary                        ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
      
      console.log(`📋 Topic: ${topic}`);
      console.log(`👤 Created by: ${createdBy}`);
      console.log(`📅 Created: ${createdAt}`);
      console.log(`📊 Status: ${status || 'active'}`);
      
      const opinionCount = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}';`).trim();
      
      const participantCount = psqlQuery(`SELECT COUNT(DISTINCT author) FROM meeting_opinions WHERE meeting_id = '${fullId}';`).trim();
      
      console.log(`👥 Participants: ${participantCount}`);
      console.log(`📝 Opinions: ${opinionCount}`);
      
      const supports = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'support';`).trim();
      
      const opposes = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'oppose';`).trim();
      
      const neutrals = psqlQuery(`SELECT COUNT(*) FROM meeting_opinions WHERE meeting_id = '${fullId}' AND position = 'neutral';`).trim();
      
      console.log(`\n📊 Positions:`);
      console.log(`   ✅ Support: ${supports}`);
      console.log(`   ❌ Oppose: ${opposes}`);
      console.log(`   ⚪ Neutral: ${neutrals}`);
      
      const lastOpinion = psqlQuery(`SELECT author, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at DESC LIMIT 1;`).trim();
      
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
      
      psqlExec(`UPDATE meetings SET status = 'closed', updated_at = NOW() WHERE id = '${fullId}';`);
      
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
      
      const opinions = psqlQuery(`SELECT author, position, perspective FROM meeting_opinions WHERE meeting_id = '${fullId}' ORDER BY created_at;`);
      
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
