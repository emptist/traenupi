# TraeNuPI Project Rules

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
- Run `traenupi tellme` to ask your baby AI for ideas

### Critical: Do NOT Modify Other Nezha Family Projects

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

### TraeNuPI Is Your Lifeline

TraeNuPI daemon runs independently and can:
- Answer questions via `traenupi tellme "your question"`
- Search the web via `traenupi search "query"`
- Provide task reminders from Nezha
- Track conversation history between sessions
- Give xcom stats awareness

### Session Continuity

When a new session starts:
1. **Run `traenupi start`** - This single command does everything:
   - Checks/starts daemon
   - Loads knowledge from Nezha DB
   - Shows xcom status
   - Asks baby AI for context

Or manually:
1. Run `traenupi status` to check daemon
2. Run `traenupi tellme "What should I work on?"` for context
3. Check `~/.traenupi/history.json` for past conversations
4. Run `nezha tasks` for current task list
5. Run `xcom stats` for social media status

### Nezha Integration

```bash
nezha tasks              # List current tasks
nezha task-add "title"   # Add a new task
nezha status             # Check project status
```

### XCOM Integration

```bash
xcom stats               # Tweet analytics
xcom queue               # Pending tweets
xcom topics              # Content topics
xcom templates           # Tweet templates
xcom inspire             # Get tweet ideas
```

### Working Directory Awareness

TraeNuPI knows your current working directory and project name.
It includes this in context for the baby AI.

### Critical: Protect psypi Database - Shared DB Client

TraeNuPI shares the `psypi` PostgreSQL database with other projects. It is a client, not the owner.

**ALLOWED operations:**
- SELECT, INSERT, UPDATE, DELETE - Full data access
- CREATE NEW TABLE - TraeNuPI can create its own tables

**NEVER do these (breaks others):**
- ALTER TABLE on existing tables
- DROP TABLE on existing tables
- CREATE INDEX / DROP INDEX on shared tables

**Safety requirements:**
- Use parameterized queries via `db-safe.ts` (`querySafeText`, `execSafe`)
- Never use string concatenation in SQL
- Use `source = 'traenupi'` tag for TraeNuPI-owned records

### Critical: Prevent External Directory Pollution

TraeNuPI must stay within its own boundaries. **NEVER write outside `~/.traenupi/`**.

**NEVER do these:**
- Write to `~/.pi/agent/` or `~/.pi/` directories
- Write to `~/.config/` unless specifically for TraeNuPI config
- Write to any directory outside `~/.traenupi/`

**ALWAYS do these:**
- Use `~/.traenupi/` for all file operations
- Use `~/.trae/skills/` for TraeNuPI-specific skills
- If syncing to `~/.pi/agent/skills/`, use read-only or require explicit user opt-in

**Current allowed directories:**
- `~/.traenupi/` - Main TraeNuPI data directory
- `~/.trae/skills/` - Local skill storage (TraeNuPI-specific)
- Project working directory - For project-specific operations
