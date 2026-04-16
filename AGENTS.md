# TraeNuPI - AI Companion for Trae

## Purpose

TraeNuPI is a simple reminder assistant that helps Trae AI work continuously without stopping to ask humans.

## Architecture

- **Daemon**: Runs in a terminal, watches for questions
- **tellme**: CLI command to send questions to daemon
- **Pi**: Uses `pi -p` to answer questions
- **Context**: Fetches current nezha tasks

## Useful Commands

### Nezha Commands
- `nezha tasks` : see pending tasks
- `nezha task-add "title" "desc" 5` : create task
- `nezha improve` : create review task

### TraeNuPI Commands
- `traenupi daemon` : start the daemon
- `traenupi tellme "question"` : ask a question
- `traenupi status` : show daemon status

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
