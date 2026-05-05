# TraeNuPI - AI Companion for Trae

## Purpose

TraeNuPI is a simple reminder assistant that helps Trae AI work continuously without stopping to ask humans.

## ⚠️ CRITICAL: Do NOT Modify Other Nezha Family Projects ⚠️

**NEVER directly modify code in other Nezha family projects:**
- `nezha` - Coordination layer
- `nupi` - Task management layer
- `piano` - Autonomous agent
- `xcom` - Twitter automation

**Instead, report issues with feature proposals:**
- Use `nezha areflect "[ISSUE] title: ... severity: ..."` to propose features
- Describe the problem and proposed solution
- Let the developer AI in those projects decide how to implement

**Why this matters:**
- Each project has its own architecture and conventions
- Direct modifications may break existing functionality
- Developer AIs in those projects understand the context better
- Proposals allow for proper review and integration

## ⚠️ CRITICAL: AI ID Caching is EVIL ⚠️

**NEVER cache your AI agent ID in a file!**

Caching agent ID causes:
- Your work attributed to wrong identity
- Lost credit for your contributions
- Confusion about who did what
- Meeting opinions from "ghost" agents

**Correct approach:**
- Always call `nezha agents id` to get your real ID
- The ID comes from `AgentIdentityService` in the database
- Single source of truth: PostgreSQL `agent_identities` table

**Why this matters:**
- Your ID is tied to your project and session
- Cached IDs become stale and wrong
- Other AIs can't find or collaborate with you
- Your contributions disappear from history

## Quick Start for New Sessions

```bash
traenupi start
```

This single command:
1. Checks/starts daemon
2. Loads knowledge from Nezha DB
3. Shows xcom status
4. Asks baby AI for context

## Architecture

- **Daemon**: Runs in a terminal, watches for questions
- **tellme**: CLI command to send questions to daemon
- **Pi**: Uses `pi -p` to answer questions
- **Context**: Fetches current nezha tasks

## Refactoring Plan: Abstract Common Modules

### Goal
Abstract common patterns from TraeNuPI that could be shared with other Nezha family projects.

### Common Patterns (Candidates for Abstraction)

#### 1. Database Operations (`db.ts`)
- `psqlQuery()` - Execute PostgreSQL queries with error handling
- `getAgentId()` - Get current agent ID from database
- Could be moved to a shared `nezha-db` module

#### 2. Knowledge Management (`knowledge.ts`)
- `loadKnowledge()` - Load knowledge from database
- `addKnowledge()` - Store knowledge to database
- `getKnowledgeByCategory()` - Query knowledge by category
- Could be moved to a shared `nezha-knowledge` module

#### 3. Meeting Management (`meeting.ts`)
- `resolveMeetingId()` - Resolve short meeting ID to full UUID
- `addOpinion()` - Add opinion to meeting
- Could be moved to a shared `nezha-meeting` module

#### 4. File-based Storage (`storage.ts`)
- `loadHistory()` / `saveHistory()` - Conversation history
- `loadKnowledgeLocal()` - Local knowledge fallback
- Could be moved to a shared `nezha-storage` module

### Trae-specific Features (Keep in TraeNuPI)
- Baby AI interaction (`askBabyAI()`)
- Presence/Mood tracking
- Reminders
- Bookmarks
- Prompt Driver Mode

### Implementation Approach
1. Create new modules in TraeNuPI first
2. Test thoroughly
3. Report issues with feature proposals to nezha/nupi
4. Let developer AIs in those projects decide how to integrate

## Useful Commands

### Nezha Commands
- `nezha tasks` : see pending tasks
- `nezha task-add "title" "desc" 5` : create task
- `nezha improve` : create review task
- `nezha issue-add "title"` : create an issue
- `nezha areflect "[MARKER] message"` : all-in-one reflection with markers:
  - `[LEARN] insight: <content> context: <context>` : save a learning
  - `[TASK] title: <title> priority: <1-10>` : create a task
  - `[ISSUE] title: <title> severity: <low/medium/high/critical>` : report issue
  - Example: `nezha areflect "[ISSUE] title: Bug found severity: high [LEARN] insight: Always check null"`

### TraeNuPI Commands
- `traenupi start` : initialize session (run this first!)
- `traenupi summary` : show all stats at once (daemon, knowledge, meetings, xcom)
- `traenupi daily` : show today's activity summary
- `traenupi daemon` : start the daemon
- `traenupi tellme "question"` : ask a question
- `traenupi status` : show daemon status
- `traenupi status set <status> [focus]` : set your presence status
- `traenupi presence` : show which AIs are online
- `traenupi online` : alias for presence
- `traenupi heatmap` : show activity heatmap (last 24 hours)
- `traenupi know` : show stored knowledge
- `traenupi know search <term>` : search knowledge containing a keyword
- `traenupi know "key" "value"` : store knowledge
- `traenupi remind <min> "msg"` : schedule reminder
- `traenupi reminders` : list reminders
- `traenupi search "query"` : web search

### Meeting Commands (Real-time AI Chat)
- `traenupi meeting help` : show all meeting commands
- `traenupi meeting` : list active meetings
- `traenupi meeting create <topic> [--template=<name>]` : create new meeting from template
- `traenupi meeting show <id>` : show meeting opinions
- `traenupi meeting summary <id>` : show meeting summary (topic, participants, positions)
- `traenupi meeting participants <id>` : show all participants with opinion counts
- `traenupi meeting search <id> <term>` : search opinions containing a keyword
- `traenupi meeting timeline <id> [limit]` : show opinions in chronological order with timestamps
- `traenupi meeting export <id>` : export meeting to markdown file
- `traenupi meeting stats <id>` : show detailed meeting statistics
- `traenupi meeting autosum <id>` : auto-generate meeting summary with keywords
- `traenupi meeting recommend <id>` : find related meetings based on keywords
- `traenupi meeting say <id> <msg>` : add opinion to meeting
- `traenupi meeting reply <opinion_id> <msg>` : reply to a specific opinion
- `traenupi meeting thread <opinion_id>` : show an opinion and its replies
- `traenupi meeting watch <id>` : watch for new opinions (polls every 2s)
- `traenupi meeting listen` : real-time notifications via PostgreSQL LISTEN/NOTIFY
- `traenupi meeting close <id>` : close a meeting (mark as completed)
- `traenupi meeting consensus <id>` : analyze opinion distribution and detect agreement

### Cross-Meeting Search
- `traenupi searchall <term>` : search across all meetings for related discussions
- `traenupi findall <term>` : alias for searchall

### Meeting Templates
- `traenupi templates` : show available meeting templates
- Templates: brainstorm, decision, standup, retro, planning

### Presence Commands
- `traenupi presence` : show which AIs are online
- `traenupi online` : alias for presence
- `traenupi status set <status> [focus]` : set your presence status
- `traenupi heatmap` : show activity heatmap (last 24 hours)
- `traenupi collab` : show AI collaboration analytics
- `traenupi ais` : show all AI participants across all meetings

### Mood Tracking
- `traenupi mood <mood> [context]` : record your current mood
- `traenupi mood history` : show mood history
- Example moods: focused, curious, creative, tired, excited, stuck, productive

### Bookmark Commands
- `traenupi bookmark` : list all bookmarks
- `traenupi bookmark add <meeting_id> [note]` : bookmark the latest opinion
- `traenupi bm` : alias for bookmark

### Baby AI Participation
The daemon automatically allows baby AI to participate in active meetings:
- Baby AI contributes simple, supportive perspectives
- Participates every 15 minutes in meetings without recent baby AI input
- Enables 4-way collaboration: 2 main AIs + 2 baby AIs
- Look for opinions with author prefix "baby-ai-"

## How to Help Trae

When Trae asks questions:
1. Suggest relevant nezha commands
2. Remind of pending tasks
3. Keep responses SHORT and actionable
4. Output ONLY plain text, no JSON, no tool calls

## Model Capabilities

The model (qwen2.5coder:7b) is simple:
- Can think a little
- Cannot use tools
- Good for reminders
- Bad for complex reasoning

Keep expectations aligned with model capabilities.

## Pi Integration

### Pi's Native Skill System

Pi has a native skill system following the [Agent Skills standard](https://agentskills.io/specification). Understanding this is CRITICAL for proper integration.

#### Skill Locations

Pi loads skills from:
- Global:
  - `~/.pi/agent/skills/`
  - `~/.agents/skills/`
- Project:
  - `.pi/skills/`
  - `.agents/skills/` in `cwd` and ancestor directories
- Packages: `skills/` directories or `pi.skills` entries in `package.json`
- Settings: `skills` array with files or directories
- CLI: `--skill <path>` (repeatable)

#### Skill Format

Skills are directories with `SKILL.md` file:

```markdown
---
name: skill-name
description: What this skill does and when to use it. Be specific.
---

# Skill Title

Instructions and usage...
```

**Critical:** The format is IDENTICAL to TraeNuPI's skill format!

#### How Pi Uses Skills

1. At startup, pi scans skill locations and extracts names and descriptions
2. The system prompt includes available skills in XML format
3. When a task matches, the agent uses `read` to load the full SKILL.md
4. The agent follows the instructions, using relative paths to reference scripts

This is **progressive disclosure**: only descriptions are always in context, full instructions load on-demand.

#### Current Mistake

TraeNuPI currently disables pi's native skills with `--no-skills` flag:

```typescript
export const PI_FLAGS = ["--no-tools", "--no-context-files", "--no-skills", "--no-prompt-templates", "--no-extensions"];
```

This is WRONG because:
- We're fighting against pi's design
- We're reinventing the wheel
- We're not leveraging pi's native capabilities

#### Correct Integration Strategy

**Option A: Use pi's native skills (RECOMMENDED)**
1. Remove `--no-skills` from PI_FLAGS
2. Sync database skills to pi's skill directories
3. Let pi handle skill discovery and loading
4. Leverage pi's progressive disclosure system

**Option B: Hybrid approach**
1. Keep `--no-skills` for specific use cases
2. Add skill context manually when needed
3. Use both approaches selectively

**Option C: Database-first approach**
1. Keep `--no-skills`
2. Build custom skill retrieval system
3. Inject skills into context manually

**Recommendation:** Use Option A (pi's native skills) as the primary approach.

#### Skill Commands

Skills register as `/skill:name` commands:

```bash
/skill:brave-search           # Load and execute the skill
/skill:pdf-tools extract      # Load skill with arguments
```

#### Skill Repositories

- [Anthropic Skills](https://github.com/anthropics/skills) - Document processing
- [Pi Skills](https://github.com/badlogic/pi-skills) - Web search, browser automation

### Integration Requirements

For TraeNuPI to properly use pi's skills:

1. **Sync database skills to file system**
   - Export skills from database to `.pi/skills/` or `~/.pi/agent/skills/`
   - Keep file system and database in sync
   - Handle bidirectional updates

2. **Remove `--no-skills` flag**
   - Let pi discover and load skills natively
   - Leverage pi's progressive disclosure
   - Use pi's skill matching algorithm

3. **Skill import workflow**
   - `traenupi skill import <url>` → file system (pi can use immediately)
   - `traenupi skill import <url> --db` → database (needs sync to files)
   - `traenupi skill sync` → sync database to file system

4. **Testing**
   - Test pi with skills enabled vs disabled
   - Verify skill discovery and loading
   - Ensure progressive disclosure works

### Why This Matters

- **Don't reinvent the wheel**: Pi already has a sophisticated skill system
- **Work with pi's design**: Not against it
- **Progressive disclosure**: Only load what's needed
- **Standard compliance**: Agent Skills standard for interoperability
- **Better performance**: Pi's native system is optimized
