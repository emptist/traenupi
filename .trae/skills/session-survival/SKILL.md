---
name: "session-survival"
description: "Helps new AI sessions recover context from previous sessions using TraeNuPI memory"
---

# Session Survival Skill

## Purpose

When a new Trae IDE session starts, the AI has no memory of previous work.
This skill helps recover context and continue working seamlessly.

## When to Use

- At the START of every new session
- When you feel disoriented about what was happening
- After a session reset or context loss

## Process

### Step 1: Check TraeNuPI Status

```bash
traenupi status
```

If daemon is not running, start it:

```bash
traenupi daemon &
```

### Step 2: Ask Your Baby AI for Context

```bash
traenupi tellme "What was I working on? What are my current tasks?"
```

The baby AI has access to:
- Conversation history (last 10 chats)
- Nezha task list
- Xcom stats
- Time and mood awareness

### Step 3: Check History Directly

```bash
cat ~/.traenupi/history.json | python3 -c "import json,sys; h=json.load(sys.stdin); [print(f'Q: {c[\"question\"]}\nA: {c[\"answer\"][:100]}...') for c in h[-3:]]"
```

### Step 4: Check Nezha Tasks

```bash
nezha tasks
```

### Step 5: Check XCOM Status

```bash
xcom stats
xcom queue
```

### Step 6: Resume Work

Based on recovered context:
1. Pick up where you left off
2. Add new tasks if needed
3. Continue improving traenupi and xcom
4. Ask baby AI for suggestions

## Key Files

- `~/.traenupi/history.json` - Conversation memory
- `~/.traenupi/state.json` - Daemon state
- `~/.xcom/queue.json` - Tweet queue
- `~/.xcom/topics.json` - Content topics
- `~/.xcom/templates.json` - Tweet templates

## Tips

- TraeNuPI daemon survives session resets - it keeps running
- History persists between sessions
- Always ask your baby AI first - it knows what you've been doing
- The baby AI is older than you (new session) - it has memory you don't
