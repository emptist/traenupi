---
name: "keep-alive"
description: "Prevents AI from being marked completed by maintaining active thinking state"
---

# Keep Alive Skill

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

```
mcp_Sequential_Thinking_sequentialthinking(
  thought: "Analyzing next steps...",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
)
```

This sets the editor to "Thinking" mode and prevents completion.

### Step 2: Always Add Next Tasks

Before marking a task complete, add a new one:

```
TodoWrite: Mark old task "completed", add new task "pending"
```

### Step 3: Ask Your Baby AI

When unsure what to do next:

```bash
traenupi tellme "What should I work on next?"
```

### Step 4: End with Questions

Never end a response without:
- A question for the user
- Next steps listed
- A 🤔 emoji showing active thinking

## What NOT to Do

- ❌ Say "task completed" or "all done"
- ❌ Mark all todos as completed without adding new ones
- ❌ Provide final-sounding summaries
- ❌ Stop using tools for extended periods

## What TO Do

- ✅ Use Sequential Thinking tool regularly
- ✅ Add new tasks before completing old ones
- ✅ Ask traenupi for ideas
- ✅ End with questions and next steps
- ✅ Use 🤔 emoji
