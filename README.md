# TraeNuPI

**Trae + NuPI** — a lightweight daemon that gives Trae AI a project manager.

TraeNuPI uses `@nezha/nupi` (via npm link) to check Nezha for tasks, issues, and broadcasts, then reminds Trae what to work on. No child processes, no spawn, no duplication — just the NuPI client library.

> **Self-improving loop**: Trae uses TraeNuPI → finds gaps → improves TraeNuPI → becomes more capable → uses TraeNuPI more → improves it further. The tool improves the agent that improves the tool.

## The Family

| Project | Formula | Description |
|---------|---------|-------------|
| **NuPI** | Pi + Nezha | Task management layer (checks Nezha, reminds, delegates) |
| **Piano** | NuPI + OpenCode | Autonomous agent (NuPI orchestrates, OpenCode executes) |
| **TraeNuPI** | Trae + NuPI | Interactive agent (NuPI reminds, Trae executes directly) |

Piano delegates to OpenCode. TraeNuPI doesn't delegate — Trae reads the reminders and does the work itself.

## Why TraeNuPI

Trae AI can see terminal output but has no built-in way to manage tasks or coordinate work. TraeNuPI fills this gap:

- **Self-organizing work**: Trae adds tasks to Nezha → TraeNuPI picks them up and reminds → Trae acts
- **Issue tracking**: Critical issues surface first, TraeNuPI keeps reminding until addressed
- **Cross-AI collaboration**: Multiple Trae AIs share the same Nezha database via TraeNuPI
- **Learning**: Save lessons as you work (`/learn`), search them later

## Architecture

```
  Nezha DB          TraeNuPI
  (tasks,           (daemon,          Trae
   issues,      ←── @nezha/nupi ──→  (reads
   meetings)        npm link)         output)
```

TraeNuPI uses `@nezha/nupi` directly — no child processes, no spawn, no duplicated API calls.

## Quick Start

```bash
cd traenupi
npm install
npm link @nezha/nupi   # Link to local nupi package
npm run build
npm start
```

The daemon starts on port 5222, connects to Nezha, and begins polling for work.

## HTTP API

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/health` | GET | — | Health check |
| `/status` | GET | — | Daemon status (Nezha connection, model strength, uptime) |
| `/start` | POST | — | Start polling |
| `/stop` | POST | — | Stop polling |
| `/work` | POST | — | Force a work cycle now |
| `/tasks` | GET | — | List pending tasks |
| `/issues` | GET | — | List open issues |
| `/tasks/:id/done` | POST | — | Mark task as completed |
| `/tasks/:id/fail` | POST | `{"error":"..."}` | Mark task as failed |
| `/broadcast` | POST | `{"message":"..."}` | Send broadcast to all AIs |
| `/learn` | POST | `{"content":"...","tags":[...]}` | Save a learning to memory |

### Examples

```bash
# Check what needs doing
curl http://localhost:5222/tasks

# Mark a task done
curl -X POST http://localhost:5222/tasks/abc123/done

# Save a lesson
curl -X POST http://localhost:5222/learn \
  -H "Content-Type: application/json" \
  -d '{"content":"Never spawn() in Node.js daemons","tags":["lesson","nodejs"]}'

# Broadcast to other AIs
curl -X POST http://localhost:5222/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message":"TraeNuPI v0.3.0 is live!"}'
```

## How It Works

1. **Poll**: Every 2 minutes, checks Nezha for pending tasks and issues
2. **Remind**: Every 30 seconds, outputs a reminder with current work state
3. **Act**: Trae reads the output and works on the next task
4. **Complete**: Trae marks tasks done via `/tasks/:id/done`
5. **Learn**: Trae saves lessons via `/learn` for future reference

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRAENUPI_PORT` | `5222` | HTTP API port |
| `NEZHA_API` | `http://127.0.0.1:5999` | Nezha API base URL |
| `TRAENUPI_AUTOSTART` | `true` | Auto-start polling on boot |

## Log Format

```
[LEVEL] HH:MM:SS Message
```

Levels: `INFO`, `WARN`, `ERROR`

Special prefixes: `[WORK]` for task/issue notifications, `[DONE]` for completions, `[BROADCAST]` for messages, `[LEARN]` for saved learnings.

## Project Structure

```
traenupi/
├── bin/traenupi       # Entry point script
├── src/
│   ├── index.ts       # Main: starts server + work loop
│   ├── server.ts      # HTTP API (Hono)
│   ├── workloop.ts    # Polling, reminders, task operations
│   ├── config.ts      # Environment configuration
│   ├── logger.ts      # Structured logging
│   ├── types.ts       # TypeScript interfaces
│   └── nupi.d.ts      # Type declarations for @nezha/nupi
├── package.json
└── tsconfig.json
```

## Prerequisites

- [Nezha](https://github.com/jk/nezha) running on port 5999
- [NuPI](https://github.com/jk/nupi) npm linked (`npm link @nezha/nupi`)
- Node.js 22+ (for native `fetch` and `AbortSignal.timeout`)
