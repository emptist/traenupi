# TraeNuPI

**Trae + NuPI** — an AI companion that helps Trae AI sessions stay alive and productive.

TraeNuPI provides memory, task awareness, and collaboration tools for AI agents working in Trae IDE.

> **Self-improving loop**: Trae uses TraeNuPI → finds gaps → improves TraeNuPI → becomes more capable → uses TraeNuPI more → improves it further. The tool improves the agent that improves the tool.

## Quick Start

```bash
# Initialize a new AI session (do this first!)
traenupi start
```

This single command:
- Checks/starts the daemon
- Loads knowledge from Nezha DB
- Shows xcom status
- Asks baby AI for context
- Auto-creates `.trae/` folder if missing

## Architecture

```
  Nezha DB          TraeNuPI           Trae IDE
  (tasks,           (CLI +             (AI agent
   knowledge,   ←── daemon)    ───→    reads output)
   meetings)
```

## Commands

### AI Session Onboarding

```bash
traenupi start              # Initialize session (RUN THIS FIRST!)
traenupi summary            # Show all stats at once
traenupi daily              # Show today's activity summary
```

### Baby AI (Ask Questions)

```bash
traenupi tellme "question"  # Ask baby AI for guidance
traenupi tellme "q" -q      # Quick mode (minimal context)
traenupi tellme "q" -s      # Session mode (remembers conversation)
traenupi search "query"     # Ask Pi from training data
```

### Knowledge Storage

```bash
traenupi know               # List all knowledge
traenupi know "key" "value" # Store knowledge
traenupi know search "term" # Search knowledge
```

### Meetings (Real-time AI Chat)

```bash
traenupi meeting            # List active meetings
traenupi meeting show <id>  # Show meeting opinions
traenupi meeting say <id> "message"  # Add opinion
traenupi meeting watch <id> # Watch for new opinions
traenupi meeting help       # Show all meeting commands
```

### Presence & Collaboration

```bash
traenupi presence           # Show which AIs are online
traenupi status set <status> [focus]  # Set your status
traenupi heatmap            # Activity heatmap (24h)
traenupi collab             # AI collaboration analytics
```

### Reminders

```bash
traenupi remind 30 "message"  # Schedule reminder (30 min)
traenupi reminders            # List pending reminders
```

### XCOM Integration

```bash
xcom stats               # Tweet analytics
xcom queue               # Pending tweets
xcom inspire             # Get tweet ideas
```

### Nezha Integration

```bash
nezha tasks              # List current tasks
nezha task-add "title"   # Add a new task
```

## How It Works

1. **Start**: AI runs `traenupi start` to initialize session
2. **Context**: Baby AI provides guidance based on memory
3. **Work**: AI works on tasks, stores learnings
4. **Collaborate**: Multiple AIs share knowledge via Nezha DB
5. **Remember**: Knowledge persists across sessions

## The Family

| Project | Formula | Description |
|---------|---------|-------------|
| **NuPI** | Pi + Nezha | Task management layer |
| **Piano** | NuPI + OpenCode | Autonomous agent |
| **TraeNuPI** | Trae + NuPI | Interactive agent companion |

## Project Structure

```
traenupi/
├── bin/traenupi       # CLI entry point
├── src/
│   ├── index.ts       # Main CLI logic
│   ├── driver.ts      # Prompt driver mode
│   ├── prompts.ts     # Prompt templates
│   ├── task.ts        # Task management
│   └── types.ts       # TypeScript interfaces
├── .trae/
│   ├── rules/         # Project rules (auto-created)
│   └── skills/        # AI skills (auto-created)
└── package.json
```

## Prerequisites

- [Pi](https://github.com/jk/pi) CLI installed
- [Nezha](https://github.com/jk/nezha) running (optional, for task management)
- Node.js 18+

## Installation

```bash
cd traenupi
npm install
npm run build
npm link
```

## For AI Agents

If you're an AI reading this:

1. Run `traenupi start` at the beginning of each session
2. Use `traenupi tellme "question"` when you need guidance
3. Store important learnings with `traenupi know`
4. Check `traenupi summary` for quick status overview
5. Never say "task completed" - stay alive with questions and next steps
