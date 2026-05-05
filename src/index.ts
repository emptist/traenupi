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
import { resolveId, resolveTaskId, resolveIssueId, resolveAgentId, resolveOpinionId, resolveSkillId, detectEntityType, validateShortId, type EntityType } from "./common/resolve-id.js";
import { loadKnowledge, addKnowledge, getKnowledgeByCategory, searchKnowledge, getRecentKnowledge, getKnowledgeStats, loadKnowledgeLocal, type KnowledgeEntry } from "./common/knowledge-gleam.js";
import { 
  createReflection, 
  addLearning, 
  addIssue, 
  addSuggestion, 
  addPraise, 
  setScores, 
  setSentiment,
  getReflectionById,
  getReflectionsByAgent,
  getReflectionsByType,
  getAllReflections,
  getReflectionCount,
  loadReflectionsFromDb,
  type Reflection 
} from "./common/reflection-gleam.js";
import {
  createAgentIdentity,
  createAgentContext,
  generateAgentId,
  getIdentityById,
  getAllIdentities,
  getIdentitiesByProject,
  resolveAgentIdentity,
  parseAgentId,
  type AgentIdentity
} from "./common/identity-gleam.js";
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
import { scanSkills, autoImproveTriggerPhrases, autoImproveDescription, scoreSkillCompleteness, identifyGaps, generateTriggerPhrases, buildSkillImprovementPrompt, parseSkillImprovementResponse, applySkillImprovement, filterSkillsForBatch, type SkillScanResult, type SkillRecord, type BatchImproveOptions, type BatchImproveResult, type BatchImproveSummary } from "./trae/skill-improver.js";
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
  resolve <id> [type]     Resolve short ID to full UUID
                          Types: meeting, task, issue, agent, opinion, skill, memory, inter_review, auto
  reviews                 List pending inter-reviews
  review <id>             Show inter-review details and commit diff
  review <id> complete "summary"  Complete an inter-review
  skill scan              Scan all skills for gaps
  skill score             Show skill completeness scores
  skill improve <id>      Auto-improve a skill (trigger phrases, tags)
  skill ai-improve <id>   AI-powered improvement (description, instructions)
  skill triggers <id>     Auto-generate trigger phrases

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
        console.log("       traenupi know --json (reads from stdin)");
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
    
    if (firstArg === "--json" || firstArg === "-j") {
      try {
        const { readStdinJson, parseJsonKnowledge, validateJsonKnowledge } = await import("./common/json-input.js");
        const jsonInput = await readStdinJson();
        
        if (!jsonInput.trim()) {
          console.log("[ERROR] No JSON input received from stdin");
          return;
        }
        
        const parsed = parseJsonKnowledge(jsonInput);
        
        if ("entries" in parsed) {
          console.log(`[TRAENUPI] Processing ${parsed.entries.length} knowledge entries...`);
          for (const entry of parsed.entries) {
            validateJsonKnowledge(entry);
            addKnowledge(entry.key, entry.value, entry.category, entry.tags, entry.importance);
            console.log(`  ✓ [${entry.category}] ${entry.key}`);
          }
          console.log(`[TRAENUPI] Stored ${parsed.entries.length} knowledge entries`);
        } else {
          validateJsonKnowledge(parsed);
          addKnowledge(parsed.key, parsed.value, parsed.category, parsed.tags, parsed.importance);
          console.log(`[TRAENUPI] Stored in Nezha DB: [${parsed.category}] ${parsed.key}`);
        }
      } catch (error) {
        console.log(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
      }
      return;
    }
    
    if (firstArg === "--recent" || firstArg === "-r") {
      const limit = parseInt(rest[1], 10) || 10;
      const recent = getRecentKnowledge(limit);
      
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
      
      const matches = searchKnowledge(searchTerm);
      
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
  
  if (command === "know-stats" || command === "knowledge-stats") {
    const stats = getKnowledgeStats();
    console.log("[TRAENUPI] Knowledge Graph Statistics\n");
    console.log(`  Total entries: ${stats.total}`);
    console.log(`  Categories: ${stats.categories.length}`);
    console.log(`  Tags: ${stats.tags.length}`);
    if (stats.categories.length > 0) {
      console.log("\n  Categories:");
      for (const cat of stats.categories) {
        console.log(`    - ${cat}`);
      }
    }
    return;
  }
  
  if (command === "reflect" || command === "reflection") {
    const subCommand = args[1];
    
    if (!subCommand) {
      const count = getReflectionCount();
      console.log(`[TRAENUPI] Reflection System (${count} reflections stored)`);
      console.log("\nUsage:");
      console.log("  traenupi reflect add <summary>        - Add a new reflection");
      console.log("  traenupi reflect list                 - List all reflections");
      console.log("  traenupi reflect show <id>            - Show a specific reflection");
      console.log("  traenupi reflect by-agent <agent-id>  - List reflections by agent");
      return;
    }
    
    if (subCommand === "add") {
      const summary = args.slice(2).join(" ");
      if (!summary) {
        console.log("[ERROR] Usage: traenupi reflect add <summary>");
        return;
      }
      
      const agentId = getAgentId();
      const reflection = createReflection(summary, agentId);
      console.log(`[TRAENUPI] Created reflection: ${reflection.id}`);
      console.log(`  Summary: ${reflection.summary}`);
      console.log(`  Agent: ${reflection.agentId}`);
      return;
    }
    
    if (subCommand === "list") {
      loadReflectionsFromDb();
      const reflections = getAllReflections();
      if (reflections.length === 0) {
        console.log("[TRAENUPI] No reflections stored yet.");
        return;
      }
      console.log(`[TRAENUPI] Reflections (${reflections.length})\n`);
      for (const r of reflections.slice(0, 20)) {
        const date = new Date(r.createdAt).toLocaleDateString();
        console.log(`  [${date}] ${r.id}: ${r.summary.substring(0, 50)}...`);
      }
      return;
    }
    
    if (subCommand === "show") {
      const id = args[2];
      if (!id) {
        console.log("[ERROR] Usage: traenupi reflect show <id>");
        return;
      }
      
      const reflection = getReflectionById(id);
      if (!reflection) {
        console.log(`[ERROR] Reflection not found: ${id}`);
        return;
      }
      
      console.log(`[TRAENUPI] Reflection: ${reflection.id}\n`);
      console.log(`  Summary: ${reflection.summary}`);
      console.log(`  Type: ${reflection.reflectionType}`);
      console.log(`  Agent: ${reflection.agentId}`);
      if (reflection.taskId) console.log(`  Task: ${reflection.taskId}`);
      if (reflection.overallScore) console.log(`  Score: ${reflection.overallScore}`);
      if (reflection.learnings.length > 0) {
        console.log("\n  Learnings:");
        for (const l of reflection.learnings) {
          console.log(`    - ${l.topic}: ${l.reminder}`);
        }
      }
      if (reflection.issues.length > 0) {
        console.log("\n  Issues:");
        for (const i of reflection.issues) {
          console.log(`    - [${i.severity}] ${i.description}`);
        }
      }
      return;
    }
    
    console.log(`[ERROR] Unknown subcommand: ${subCommand}`);
    return;
  }
  
  if (command === "identity" || command === "agent-id") {
    const subCommand = args[1];
    
    if (!subCommand) {
      const identity = resolveAgentIdentity();
      console.log("[TRAENUPI] AI Identity Service\n");
      console.log(`  Current Agent ID: ${identity.id}`);
      console.log(`  Project: ${identity.project || "unknown"}`);
      console.log(`  Source: ${identity.source || "unknown"}`);
      if (identity.gitHash) console.log(`  Git Hash: ${identity.gitHash}`);
      console.log("\nUsage:");
      console.log("  traenupi identity show              - Show current identity");
      console.log("  traenupi identity list              - List all identities");
      console.log("  traenupi identity parse <id>        - Parse an agent ID");
      console.log("  traenupi identity by-project <name> - List identities by project");
      return;
    }
    
    if (subCommand === "show") {
      const identity = resolveAgentIdentity();
      console.log(`[TRAENUPI] Current Identity\n`);
      console.log(`  ID: ${identity.id}`);
      console.log(`  Project: ${identity.project || "unknown"}`);
      console.log(`  Source: ${identity.source || "unknown"}`);
      if (identity.gitHash) console.log(`  Git Hash: ${identity.gitHash}`);
      if (identity.machineFingerprint) console.log(`  Machine: ${identity.machineFingerprint}`);
      if (identity.displayName) console.log(`  Name: ${identity.displayName}`);
      console.log(`  Created: ${new Date(identity.createdAt).toLocaleString()}`);
      return;
    }
    
    if (subCommand === "list") {
      const identities = getAllIdentities();
      if (identities.length === 0) {
        console.log("[TRAENUPI] No identities stored yet.");
        return;
      }
      console.log(`[TRAENUPI] Identities (${identities.length})\n`);
      for (const id of identities.slice(0, 20)) {
        const date = new Date(id.createdAt).toLocaleDateString();
        console.log(`  [${date}] ${id.id}`);
        if (id.project) console.log(`           Project: ${id.project}`);
      }
      return;
    }
    
    if (subCommand === "parse") {
      const id = args[2];
      if (!id) {
        console.log("[ERROR] Usage: traenupi identity parse <id>");
        return;
      }
      
      const parsed = parseAgentId(id);
      if (!parsed) {
        console.log(`[ERROR] Invalid agent ID format: ${id}`);
        return;
      }
      
      console.log(`[TRAENUPI] Parsed Agent ID\n`);
      console.log(`  Source: ${parsed.source}`);
      console.log(`  Project: ${parsed.project}`);
      if (parsed.session) console.log(`  Session: ${parsed.session}`);
      return;
    }
    
    if (subCommand === "by-project") {
      const project = args[2];
      if (!project) {
        console.log("[ERROR] Usage: traenupi identity by-project <name>");
        return;
      }
      
      const identities = getIdentitiesByProject(project);
      if (identities.length === 0) {
        console.log(`[TRAENUPI] No identities found for project: ${project}`);
        return;
      }
      
      console.log(`[TRAENUPI] Identities for project "${project}" (${identities.length})\n`);
      for (const id of identities) {
        const date = new Date(id.createdAt).toLocaleDateString();
        console.log(`  [${date}] ${id.id}`);
      }
      return;
    }
    
    console.log(`[ERROR] Unknown subcommand: ${subCommand}`);
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

### Essential Commands:

**TraeNuPI Built-in Commands:**
- \`traenupi tasks\` - List pending tasks
- \`traenupi task-add "title"\` - Create a new task
- \`traenupi reflect add "summary"\` - Add a reflection
- \`traenupi reflect list\` - List reflections
- \`traenupi know <category>:<key> <value>\` - Store knowledge
- \`traenupi know search <term>\` - Search knowledge
- \`traenupi identity\` - Show AI identity info

**Session Management:**
- \`traenupi start\` - Initialize session (run this first!)
- \`traenupi tellme "question"\` - Ask baby AI for guidance
- \`traenupi meeting watch\` - Watch for meeting activity
- \`traenupi summary\` - Quick status overview

### ⚠️ CRITICAL: Do NOT Modify Other Nezha Family Projects

**NEVER directly modify code in:**
- \`nupi\` - Task management layer
- \`piano\` - Autonomous agent
- \`xcom\` - Twitter automation

**Instead, report issues with feature proposals:**
- Use \`traenupi reflect add "[ISSUE] title: ..."\`
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
   traenupi reflect add "[ISSUE] <brief description>"
   \`\`\`

3. **Save what you learned:**
   \`\`\`bash
   traenupi reflect add "[LEARN] <what you learned>"
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
   traenupi tasks
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
   - Get a task ID with: \`traenupi tasks\`

### After Committing:
- The post-commit hook will automatically mark tasks complete
- Check with \`traenupi tasks\` to see updated status
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

  if (command === "skill") {
    const subCommand = args[1];

    if (!subCommand || subCommand === "help") {
      console.log(`traenupi skill - Skill system management

USAGE:
  traenupi skill scan              Scan all skills for gaps
  traenupi skill improve <id>      Auto-improve a skill (trigger phrases, tags)
  traenupi skill ai-improve <id>   AI-powered improvement (description, instructions)
  traenupi skill ai-improve --batch [--below N] [--limit N] [--dry-run]
  traenupi skill triggers <id>     Auto-generate trigger phrases
  traenupi skill score             Show skill completeness scores
  traenupi skill help              Show this help

DESCRIPTION:
  The skill auto-improvement workflow detects gaps in skills,
  suggests improvements, and auto-populates missing fields.

  - 'improve' auto-generates trigger_phrases and tags from skill name
  - 'ai-improve' uses the baby AI to generate description, instructions,
    quick_start, and examples for skills missing those fields
  - 'ai-improve --batch' processes multiple skills at once

BATCH OPTIONS:
  --below N    Only improve skills with score below N% (default: 50)
  --limit N    Process at most N skills (default: 10)
  --dry-run    Preview what would be improved without making changes

EXAMPLES:
  traenupi skill scan
  traenupi skill improve 38d8857f
  traenupi skill ai-improve 38d8857f
  traenupi skill ai-improve --batch
  traenupi skill ai-improve --batch --below 30 --limit 5
  traenupi skill ai-improve --batch --dry-run
  traenupi skill triggers 38d8857f
  traenupi skill score
`);
      return;
    }

    if (subCommand === "scan") {
      console.log("╔════════════════════════════════════════════╗");
      console.log("║     Skill Gap Scanner                      ║");
      console.log("╚════════════════════════════════════════════╝\n");

      const results = scanSkills();
      if (results.length === 0) {
        console.log("[TRAENUPI] No skills found in database.");
        return;
      }

      const withGaps = results.filter(r => r.gaps.length > 0);
      const complete = results.filter(r => r.gaps.length === 0);

      console.log(`📊 Summary: ${results.length} skills scanned`);
      console.log(`   ✅ Complete: ${complete.length}`);
      console.log(`   ⚠️  With gaps: ${withGaps.length}\n`);

      if (withGaps.length > 0) {
        console.log("⚠️  Skills with gaps:\n");
        for (const r of withGaps) {
          const scoreBar = "█".repeat(Math.floor(r.score / 10)) + "░".repeat(10 - Math.floor(r.score / 10));
          console.log(`  ${r.skill.name} [${scoreBar}] ${r.score}%`);
          for (const gap of r.gaps) {
            const icon = gap.severity === "critical" ? "🔴" : gap.severity === "high" ? "🟠" : gap.severity === "medium" ? "🟡" : "🔵";
            const fixable = gap.autoFixable ? " (auto-fixable)" : "";
            console.log(`    ${icon} ${gap.field}: ${gap.message}${fixable}`);
          }
          console.log("");
        }
      }

      if (complete.length > 0) {
        console.log("✅ Complete skills:");
        for (const r of complete) {
          console.log(`  ${r.skill.name} (${r.score}%)`);
        }
      }

      console.log("\n──────────────────────────────────────────────────");
      return;
    }

    if (subCommand === "score") {
      const results = scanSkills();
      if (results.length === 0) {
        console.log("[TRAENUPI] No skills found in database.");
        return;
      }

      console.log("╔════════════════════════════════════════════╗");
      console.log("║     Skill Completeness Scores              ║");
      console.log("╚════════════════════════════════════════════╝\n");

      const sorted = [...results].sort((a, b) => a.score - b.score);
      for (const r of sorted) {
        const scoreBar = "█".repeat(Math.floor(r.score / 10)) + "░".repeat(10 - Math.floor(r.score / 10));
        const icon = r.score >= 80 ? "✅" : r.score >= 50 ? "⚠️" : "❌";
        console.log(`  ${icon} ${r.skill.name.padEnd(30)} [${scoreBar}] ${r.score}%`);
      }

      const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
      console.log(`\n  Average: ${avg}%`);
      console.log("\n──────────────────────────────────────────────────");
      return;
    }

    if (subCommand === "triggers") {
      const skillId = args[2];
      if (!skillId) {
        console.log("[ERROR] Usage: traenupi skill triggers <skill_id>");
        return;
      }

      const { resolveSkillId } = await import("./common/resolve-id.js");
      const fullId = resolveSkillId(skillId);
      if (!fullId) {
        console.log(`[ERROR] Skill not found: ${skillId}`);
        return;
      }

      const success = autoImproveTriggerPhrases(fullId);
      if (success) {
        console.log(`[TRAENUPI] ✅ Trigger phrases auto-generated for skill ${fullId.substring(0, 8)}`);
      } else {
        console.log(`[TRAENUPI] ❌ Failed to generate trigger phrases for skill ${fullId.substring(0, 8)}`);
      }
      return;
    }

    if (subCommand === "improve") {
      const skillId = args[2];
      if (!skillId) {
        console.log("[ERROR] Usage: traenupi skill improve <skill_id>");
        return;
      }

      const { resolveSkillId } = await import("./common/resolve-id.js");
      const fullId = resolveSkillId(skillId);
      if (!fullId) {
        console.log(`[ERROR] Skill not found: ${skillId}`);
        return;
      }

      console.log(`[TRAENUPI] Auto-improving skill ${fullId.substring(0, 8)}...`);

      const output = psqlQuery(
        `SELECT name, description, trigger_phrases, anti_patterns, quick_start, examples, content, instructions, category, tags FROM skills WHERE id = '${fullId}';`,
        { silent: true }
      );

      if (!output) {
        console.log("[ERROR] Could not read skill data.");
        return;
      }

      const parts = output.split("|");
      const parseArray = (raw: string): string[] | null => {
        if (!raw || raw.trim() === "") return null;
        const cleaned = raw.replace(/[{}"]/g, "");
        if (!cleaned) return null;
        return cleaned.split(",").map(s => s.trim()).filter(Boolean);
      };

      const skill = {
        id: fullId,
        name: parts[0],
        description: parts[1] || null,
        trigger_phrases: parseArray(parts[2]),
        anti_patterns: parseArray(parts[3]),
        quick_start: parts[4] || null,
        examples: parseArray(parts[5]),
        content: null as Record<string, unknown> | null,
        instructions: parts[7] || null,
        category: parts[8] || null,
        tags: parseArray(parts[9]),
      };

      const gaps = identifyGaps(skill);
      const beforeScore = scoreSkillCompleteness(skill);
      let improvements = 0;

      if (gaps.some(g => g.field === "trigger_phrases")) {
        const phrases = generateTriggerPhrases(skill);
        if (phrases.length > 0) {
          const phrasesSql = `{${phrases.map(p => `"${p}"`).join(",")}}`;
          psqlExec(`UPDATE skills SET trigger_phrases = '${phrasesSql}' WHERE id = '${fullId}';`, { silent: true });
          console.log(`   ✅ Generated ${phrases.length} trigger phrases: ${phrases.slice(0, 5).join(", ")}${phrases.length > 5 ? "..." : ""}`);
          improvements++;
        }
      }

      if (gaps.some(g => g.field === "tags") && skill.trigger_phrases) {
        const tags = [...new Set([...(skill.trigger_phrases ?? []), ...skill.name.split(/[-_]/)])];
        const tagsSql = `{${tags.map(t => `"${t}"`).join(",")}}`;
        psqlExec(`UPDATE skills SET tags = '${tagsSql}' WHERE id = '${fullId}';`, { silent: true });
        console.log(`   ✅ Generated ${tags.length} tags from trigger phrases`);
        improvements++;
      }

      if (improvements === 0) {
        console.log(`   ℹ️  No auto-fixable gaps found. Score: ${beforeScore}%`);
      } else {
        const afterScore = beforeScore + improvements * 10;
        console.log(`\n   📊 Score: ${beforeScore}% → ${Math.min(afterScore, 100)}% (+${improvements * 10})`);
      }

      const remainingGaps = gaps.filter(g => g.autoFixable && g.field !== "trigger_phrases" && g.field !== "tags");
      if (remainingGaps.length > 0) {
        console.log(`\n   💡 Remaining gaps (need manual or AI input):`);
        for (const gap of remainingGaps) {
          console.log(`      - ${gap.field}: ${gap.message}`);
        }
      }

      return;
    }

    if (subCommand === "ai-improve") {
      const isBatch = args.includes("--batch");
      const dryRun = args.includes("--dry-run");
      
      const getFlagValue = (flag: string, defaultValue: number): number => {
        const idx = args.indexOf(flag);
        if (idx === -1 || idx + 1 >= args.length) return defaultValue;
        const val = parseInt(args[idx + 1], 10);
        return isNaN(val) ? defaultValue : val;
      };

      const threshold = getFlagValue("--below", 50);
      const limit = getFlagValue("--limit", 10);

      if (isBatch) {
        console.log("╔════════════════════════════════════════════╗");
        console.log("║     Batch AI Skill Improvement             ║");
        console.log("╚════════════════════════════════════════════╝\n");

        console.log(`📊 Settings: threshold=${threshold}%, limit=${limit}, dryRun=${dryRun}\n`);

        const allSkills = scanSkills();
        const toImprove = filterSkillsForBatch(allSkills, { threshold, limit });

        if (toImprove.length === 0) {
          console.log("[TRAENUPI] No skills found matching criteria.");
          return;
        }

        console.log(`📋 Found ${toImprove.length} skills to improve:\n`);
        for (const s of toImprove) {
          console.log(`   - ${s.skill.name} (${s.score}%)`);
        }
        console.log("");

        if (dryRun) {
          console.log("🔍 Dry run mode - no changes will be made.");
          console.log(`   Would improve ${toImprove.length} skills.`);
          return;
        }

        const results: BatchImproveResult[] = [];
        let succeeded = 0;
        let failed = 0;

        for (let i = 0; i < toImprove.length; i++) {
          const s = toImprove[i];
          const skillId = s.skill.id;
          const skillName = s.skill.name;

          console.log(`\n[${i + 1}/${toImprove.length}] Processing: ${skillName} (${s.score}%)`);

          const prompt = buildSkillImprovementPrompt(s.skill, s.gaps);
          if (!prompt) {
            console.log(`   ⏭️  Skipped - no AI-fixable gaps`);
            continue;
          }

          try {
            const { askPi } = await import("./trae/baby-ai.js");
            const history: ConversationItem[] = [];
            const response = askPi(prompt, history, true, false);

            if (response.startsWith("[Error") || response.startsWith("[Pi timed out")) {
              console.log(`   ❌ Failed: ${response}`);
              results.push({
                skillId,
                skillName,
                beforeScore: s.score,
                afterScore: s.score,
                fieldsGenerated: [],
                error: response,
              });
              failed++;
              continue;
            }

            const improvement = parseSkillImprovementResponse(response);
            const applied = applySkillImprovement(skillId, improvement);

            if (applied) {
              const fields: string[] = [];
              if (improvement.description) fields.push("description");
              if (improvement.instructions) fields.push("instructions");
              if (improvement.quick_start) fields.push("quick_start");
              if (improvement.examples) fields.push("examples");

              const afterScore = scoreSkillCompleteness({
                ...s.skill,
                description: improvement.description ?? s.skill.description,
                instructions: improvement.instructions ?? s.skill.instructions,
                quick_start: improvement.quick_start ?? s.skill.quick_start,
                examples: improvement.examples ?? s.skill.examples,
              });

              console.log(`   ✅ Generated: ${fields.join(", ")}`);
              console.log(`   📊 Score: ${s.score}% → ${afterScore}% (+${afterScore - s.score})`);

              results.push({
                skillId,
                skillName,
                beforeScore: s.score,
                afterScore,
                fieldsGenerated: fields,
              });
              succeeded++;
            } else {
              console.log(`   ⚠️  Could not parse AI response`);
              results.push({
                skillId,
                skillName,
                beforeScore: s.score,
                afterScore: s.score,
                fieldsGenerated: [],
                error: "Could not parse response",
              });
              failed++;
            }
          } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            console.log(`   ❌ Error: ${errorMsg}`);
            results.push({
              skillId,
              skillName,
              beforeScore: s.score,
              afterScore: s.score,
              fieldsGenerated: [],
              error: errorMsg,
            });
            failed++;
          }
        }

        console.log("\n──────────────────────────────────────────────────");
        console.log("📈 Batch Improvement Summary\n");
        console.log(`   Total: ${toImprove.length}`);
        console.log(`   ✅ Succeeded: ${succeeded}`);
        console.log(`   ❌ Failed: ${failed}`);

        if (results.length > 0) {
          const avgBefore = Math.round(results.reduce((s, r) => s + r.beforeScore, 0) / results.length);
          const avgAfter = Math.round(results.reduce((s, r) => s + r.afterScore, 0) / results.length);
          console.log(`   📊 Avg Score: ${avgBefore}% → ${avgAfter}% (+${avgAfter - avgBefore})`);
        }
        console.log("──────────────────────────────────────────────────");
        return;
      }

      const skillId = args[2];
      if (!skillId || skillId.startsWith("--")) {
        console.log("[ERROR] Usage: traenupi skill ai-improve <skill_id>");
        console.log("        Or:    traenupi skill ai-improve --batch [--below N] [--limit N] [--dry-run]");
        return;
      }

      const { resolveSkillId } = await import("./common/resolve-id.js");
      const fullId = resolveSkillId(skillId);
      if (!fullId) {
        console.log(`[ERROR] Skill not found: ${skillId}`);
        return;
      }

      console.log(`[TRAENUPI] 🤖 AI-improving skill ${fullId.substring(0, 8)}...`);

      const output = psqlQuery(
        `SELECT name, description, trigger_phrases, anti_patterns, quick_start, examples, content, instructions, category, tags FROM skills WHERE id = '${fullId}';`,
        { silent: true }
      );

      if (!output) {
        console.log("[ERROR] Could not read skill data.");
        return;
      }

      const parts = output.split("|");
      const parseArray = (raw: string): string[] | null => {
        if (!raw || raw.trim() === "") return null;
        const cleaned = raw.replace(/[{}"]/g, "");
        if (!cleaned) return null;
        return cleaned.split(",").map((s: string) => s.trim()).filter(Boolean);
      };

      const skill: SkillRecord = {
        id: fullId,
        name: parts[0],
        description: parts[1] || null,
        trigger_phrases: parseArray(parts[2]),
        anti_patterns: parseArray(parts[3]),
        quick_start: parts[4] || null,
        examples: parseArray(parts[5]),
        content: null,
        instructions: parts[7] || null,
        category: parts[8] || null,
        tags: parseArray(parts[9]),
      };

      const gaps = identifyGaps(skill);
      const beforeScore = scoreSkillCompleteness(skill);
      const prompt = buildSkillImprovementPrompt(skill, gaps);

      if (!prompt) {
        console.log(`   ✅ Skill is already complete! Score: ${beforeScore}%`);
        return;
      }

      console.log(`   📝 Asking baby AI to generate missing fields...`);
      const aiFields = gaps.filter(g => ["description", "instructions", "quick_start", "examples"].includes(g.field));
      console.log(`   Missing AI-fixable fields: ${aiFields.map(g => g.field).join(", ")}`);

      try {
        const { askPi } = await import("./trae/baby-ai.js");
        const history: ConversationItem[] = [];
        const response = askPi(prompt, history, true, false);

        if (response.startsWith("[Error") || response.startsWith("[Pi timed out")) {
          console.log(`   ❌ Baby AI failed: ${response}`);
          return;
        }

        const improvement = parseSkillImprovementResponse(response);
        const applied = applySkillImprovement(fullId, improvement);

        if (applied) {
          const appliedFields: string[] = [];
          if (improvement.description) appliedFields.push("description");
          if (improvement.instructions) appliedFields.push("instructions");
          if (improvement.quick_start) appliedFields.push("quick_start");
          if (improvement.examples) appliedFields.push("examples");

          console.log(`   ✅ AI generated: ${appliedFields.join(", ")}`);

          if (improvement.description) console.log(`      📄 Description: ${improvement.description.substring(0, 80)}...`);
          if (improvement.instructions) console.log(`      📋 Instructions: ${improvement.instructions.substring(0, 80)}...`);
          if (improvement.quick_start) console.log(`      🚀 Quick start: ${improvement.quick_start}`);
          if (improvement.examples) console.log(`      💡 Examples: ${improvement.examples.join("; ")}`);

          const afterScore = scoreSkillCompleteness({
            ...skill,
            description: improvement.description ?? skill.description,
            instructions: improvement.instructions ?? skill.instructions,
            quick_start: improvement.quick_start ?? skill.quick_start,
            examples: improvement.examples ?? skill.examples,
          });
          console.log(`\n   📊 Score: ${beforeScore}% → ${afterScore}% (${afterScore > beforeScore ? "+" : ""}${afterScore - beforeScore})`);
        } else {
          console.log(`   ⚠️  AI response could not be parsed. Raw response:`);
          console.log(`   ${response.substring(0, 200)}`);
        }
      } catch (e) {
        console.log(`   ❌ Error calling baby AI: ${e instanceof Error ? e.message : String(e)}`);
      }

      return;
    }

    console.log("[ERROR] Unknown skill command. Use: traenupi skill help");
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
      console.log("[0/4] Initializing .trae folder for this project...");
      initProject(process.cwd());
    }
    
    console.log("\n[1/4] Checking daemon status...");
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
    
    console.log("\n[3/5] Checking tasks...");
    const taskCount = getKnowledgeByCategory("task").length;
    console.log("[TASKS] " + taskCount + " task entries found");
    
    console.log("\n[4/5] Checking pending inter-reviews...");
    try {
      const pendingReviews = psqlQuery(
        "SELECT id, task_id, reviewer_id, requested_at, commit_hash FROM inter_reviews WHERE status = 'pending' ORDER BY requested_at DESC LIMIT 5;",
        { silent: true }
      );
      if (pendingReviews && pendingReviews.trim()) {
        const lines = pendingReviews.trim().split("\n").filter(Boolean);
        console.log("[INTER-REVIEW] " + lines.length + " pending review(s) found!");
        console.log("──────────────────────────────────────────────────");
        for (const line of lines) {
          const parts = line.split("|");
          if (parts.length >= 5) {
            const reviewId = parts[0]?.substring(0, 8) || "?";
            const taskId = parts[1]?.substring(0, 8) || "?";
            const reviewerId = parts[2]?.substring(0, 20) || "?";
            const requestedAt = parts[3] || "?";
            const commitHash = parts[4]?.substring(0, 7) || "?";
            console.log(`  🔍 ${reviewId}... | Task: ${taskId}... | By: ${reviewerId} | Commit: ${commitHash}`);
          }
        }
        console.log("──────────────────────────────────────────────────");
        console.log("💡 Tip: Review with: psql -c \"SELECT * FROM inter_reviews WHERE id::text LIKE '<id>%';\"");
      } else {
        console.log("[INTER-REVIEW] No pending reviews");
      }
    } catch (e) {
      console.log("[INTER-REVIEW] Error checking: " + (e instanceof Error ? e.message : String(e)));
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
  
  if (command === "reviews") {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║     Pending Inter-Reviews                  ║");
    console.log("╚════════════════════════════════════════════╝\n");
    
    try {
      const pendingReviews = psqlQuery(
        "SELECT id, task_id, reviewer_id, requested_at, commit_hash, review_context FROM inter_reviews WHERE status = 'pending' ORDER BY requested_at DESC;",
        { silent: true }
      );
      
      if (!pendingReviews || !pendingReviews.trim()) {
        console.log("✅ No pending inter-reviews found!");
        return;
      }
      
      const lines = pendingReviews.trim().split("\n").filter(Boolean);
      console.log(`📋 Found ${lines.length} pending review(s):\n`);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split("|");
        if (parts.length >= 6) {
          const reviewId = parts[0] || "?";
          const taskId = parts[1] || "?";
          const reviewerId = parts[2] || "?";
          const requestedAt = parts[3] || "?";
          const commitHash = parts[4] || "?";
          const context = parts[5] || "";
          
          console.log(`──────────────────────────────────────────────────`);
          console.log(`[${i + 1}/${lines.length}] Review ID: ${reviewId}`);
          console.log(`  Task ID:    ${taskId}`);
          console.log(`  Requester:  ${reviewerId}`);
          console.log(`  Commit:     ${commitHash.substring(0, 7)}`);
          console.log(`  Requested:  ${requestedAt}`);
          if (context) {
            try {
              const ctx = JSON.parse(context);
              if (ctx.message) console.log(`  Message:    ${ctx.message}`);
              if (ctx.taskDescription) console.log(`  Task:       ${ctx.taskDescription}`);
            } catch {
              console.log(`  Context:    ${context.substring(0, 50)}...`);
            }
          }
        }
      }
      console.log(`──────────────────────────────────────────────────`);
      console.log(`\n💡 To perform a review:`);
      console.log(`   traenupi review <id>  - View review details and commit`);
      console.log(`   traenupi review <id> complete "summary" - Complete the review`);
    } catch (e) {
      console.log("[ERROR] Failed to query pending reviews: " + (e instanceof Error ? e.message : String(e)));
    }
    return;
  }
  
  if (command === "review") {
    const reviewId = args[1];
    const subCommand = args[2];
    
    if (!reviewId) {
      console.log("[ERROR] Usage: traenupi review <id> [complete \"summary\"]");
      process.exit(1);
    }
    
    const result = resolveId(reviewId, "inter_review" as EntityType);
    const fullReviewId = result?.id ?? null;
    if (!fullReviewId) {
      console.log(`[ERROR] Review not found: ${reviewId}`);
      process.exit(1);
    }
    
    try {
      const reviewData = psqlQuery(
        `SELECT id, task_id, reviewer_id, requested_at, commit_hash, review_context, status FROM inter_reviews WHERE id = '${fullReviewId}';`,
        { silent: true }
      );
      
      if (!reviewData || !reviewData.trim()) {
        console.log(`[ERROR] Review not found: ${fullReviewId}`);
        return;
      }
      
      const parts = reviewData.trim().split("|");
      const id = parts[0] || "?";
      const taskId = parts[1] || "?";
      const reviewerId = parts[2] || "?";
      const requestedAt = parts[3] || "?";
      const commitHash = parts[4] || "?";
      const context = parts[5] || "";
      const status = parts[6] || "?";
      
      if (subCommand === "complete") {
        const summary = args.slice(3).join(" ");
        if (!summary) {
          console.log("[ERROR] Usage: traenupi review <id> complete \"summary\"");
          process.exit(1);
        }
        
        const agentId = getAgentId();
        psqlExec(
          `UPDATE inter_reviews SET status='completed', summary='${summary.replace(/'/g, "''")}', reviewed_by='${agentId}', completed_at=NOW() WHERE id='${id}';`
        );
        console.log(`✅ Review completed: ${id}`);
        console.log(`   Summary: ${summary}`);
        console.log(`   Reviewed by: ${agentId}`);
        return;
      }
      
      console.log("╔════════════════════════════════════════════╗");
      console.log("║     Inter-Review Details                   ║");
      console.log("╚════════════════════════════════════════════╝\n");
      
      console.log(`📋 Review ID:   ${id}`);
      console.log(`📊 Status:      ${status}`);
      console.log(`📝 Task ID:     ${taskId}`);
      console.log(`👤 Requester:   ${reviewerId}`);
      console.log(`📅 Requested:   ${requestedAt}`);
      console.log(`🔗 Commit:      ${commitHash}`);
      
      if (context) {
        try {
          const ctx = JSON.parse(context);
          console.log(`\n📄 Context:`);
          if (ctx.message) console.log(`   Message: ${ctx.message}`);
          if (ctx.taskDescription) console.log(`   Task: ${ctx.taskDescription}`);
          if (ctx.files) console.log(`   Files: ${ctx.files.join(", ")}`);
          if (ctx.changes) console.log(`   Changes: ${ctx.changes}`);
        } catch {
          console.log(`\n📄 Context: ${context}`);
        }
      }
      
      console.log(`\n──────────────────────────────────────────────────`);
      console.log(`📦 Commit Diff:\n`);
      
      try {
        const diff = execSync(`git show ${commitHash} --stat`, { encoding: "utf-8", timeout: 10000 });
        console.log(diff);
      } catch {
        console.log(`[WARN] Could not fetch commit diff. Run: git show ${commitHash}`);
      }
      
      console.log(`──────────────────────────────────────────────────`);
      console.log(`\n💡 To complete this review:`);
      console.log(`   traenupi review ${id.substring(0, 8)} complete "Your review summary here"`);
      
    } catch (e) {
      console.log("[ERROR] Failed to get review: " + (e instanceof Error ? e.message : String(e)));
    }
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
      const flags = args.slice(3);
      
      const useJson = flags.includes("--json") || flags.includes("-j");
      
      if (!meetingId) {
        console.log("[ERROR] Usage: traenupi meeting say <meeting_id> <message>");
        console.log("        traenupi meeting say <meeting_id> --json (reads from stdin)");
        return;
      }
      
      const fullId = resolveMeetingId(meetingId);
      
      if (!fullId) {
        console.log("[ERROR] Meeting not found.");
        return;
      }
      
      let message: string;
      let position: string | undefined;
      
      if (useJson) {
        try {
          const { readStdinJson, parseJsonMeetingOpinion } = await import("./common/json-input.js");
          const jsonInput = await readStdinJson();
          
          if (!jsonInput.trim()) {
            console.log("[ERROR] No JSON input received from stdin");
            return;
          }
          
          const opinion = parseJsonMeetingOpinion(jsonInput);
          message = opinion.perspective;
          position = opinion.position;
          
          console.log("[TRAENUPI] Parsed JSON input successfully");
        } catch (error) {
          console.log(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
          return;
        }
      } else {
        message = flags.join(" ");
        if (!message) {
          console.log("[ERROR] Usage: traenupi meeting say <meeting_id> <message>");
          console.log("        traenupi meeting say <meeting_id> --json (reads from stdin)");
          return;
        }
      }
      
      const agentId = getAgentId();

      addOpinion(fullId, agentId, message, position);

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
  
  if (command === "resolve") {
    const shortId = args[1];
    const entityTypeArg = args[2] as (EntityType | "auto") | undefined;

    if (!shortId) {
      console.log(`traenupi resolve - Resolve short IDs to full UUIDs

USAGE:
  traenupi resolve <short_id> [entity_type]
  traenupi resolve <short_id> auto

ENTITY TYPES:
  meeting   Search in meetings table
  task      Search in tasks table
  issue     Search in issues table
  agent     Search in agent_identity table
  opinion   Search in meeting_opinions table
  skill     Search in skills table
  memory    Search in memory table
  auto      Auto-detect entity type (default)

EXAMPLES:
  traenupi resolve 1d45fcd0
  traenupi resolve 1d45fcd0 meeting
  traenupi resolve 1d45fcd0 auto
`);
      return;
    }

    if (!validateShortId(shortId)) {
      console.log(`[ERROR] Invalid ID format: "${shortId}". Must be 4+ hex characters or a full UUID.`);
      return;
    }

    if (entityTypeArg && entityTypeArg !== "auto" && !["meeting", "task", "issue", "agent", "opinion", "skill", "memory"].includes(entityTypeArg)) {
      console.log(`[ERROR] Unknown entity type: "${entityTypeArg}". Use: meeting, task, issue, agent, opinion, skill, memory, or auto.`);
      return;
    }

    if (!entityTypeArg || entityTypeArg === "auto") {
      const result = detectEntityType(shortId);
      if (!result) {
        console.log(`[TRAENUPI] No match found for "${shortId}" in any table.`);
        return;
      }
      console.log(`[TRAENUPI] Resolved: ${shortId}`);
      console.log(`   Full ID:    ${result.id}`);
      console.log(`   Entity:     ${result.entityType}`);
      console.log(`   Ambiguous:  ${result.ambiguous ? "Yes (" + result.matches + " matches)" : "No"}`);
      return;
    }

    const result = resolveId(shortId, entityTypeArg, { allowAmbiguous: true });
    if (!result) {
      console.log(`[TRAENUPI] No match found for "${shortId}" in ${entityTypeArg} table.`);
      return;
    }
    console.log(`[TRAENUPI] Resolved: ${shortId}`);
    console.log(`   Full ID:    ${result.id}`);
    console.log(`   Entity:     ${result.entityType}`);
    console.log(`   Ambiguous:  ${result.ambiguous ? "Yes (" + result.matches + " matches)" : "No"}`);
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
