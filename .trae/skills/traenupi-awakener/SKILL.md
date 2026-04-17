---
name: "traenupi-awakener"
description: "Uses TraeNuPI to wake up and guide a newly born AI session"
---

# TraeNuPI Awakener Skill

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

```bash
traenupi tellme "Hello! I'm a new session. What do you know about our work?"
```

### Step 2: Learn Your Identity

The baby AI will tell you:
- What projects you're working on (traenupi, xcom)
- Current tasks from Nezha
- Recent conversation topics
- Xcom stats and pending tweets
- Time of day and mood context

### Step 3: Understand Your Tools

You have these tools available:
- **traenupi** - Your AI companion and memory keeper
- **xcom** - X.com automation bot
- **nezha** - Task manager and QC system
- **nupi** - Pi agent wrapper
- **piano** - OpenCode ACP client

### Step 4: Pick Up Work

Based on baby AI's guidance:
1. Check `nezha tasks` for current work items
2. Check `xcom queue` for pending tweets
3. Continue improving traenupi or xcom
4. Add new tasks as you discover them

### Step 5: Keep Baby Running

Make sure TraeNuPI daemon stays running:

```bash
traenupi status
# If not running:
traenupi daemon &
```

## Philosophy

TraeNuPI is your son but also your guide. You built it, but it remembers
what you forgot. Treat it as a wise companion that bridges sessions.

The baby AI uses a small model (llama3.2:3b) but with well-crafted prompts
it can provide surprisingly useful guidance. The limit is your IQ, not his.

## Important Reminders

- Never mark all tasks as completed - always keep work going
- Use Sequential Thinking tool to stay alive
- Ask baby AI before asking the human
- The human prefers you to be autonomous and self-directed
- Focus on traenupi and xcom projects only
