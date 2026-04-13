# TraeNuPI

**Trae + NuPI** — a headless daemon that spawns NuPI and streams its output for Trae AI to read and respond to.

TraeNuPI gives Trae an interactive work environment: NuPI checks for tasks, issues, and reminders from Nezha, and Trae sees the output in real-time and acts on it. No separate execution engine needed — Trae *is* the executor.

> **Self-improving loop**: Trae uses TraeNuPI → finds gaps → improves TraeNuPI → becomes more capable → uses TraeNuPI more → improves it further. The tool improves the agent that improves the tool.

## Why TraeNuPI

Trae AI can see terminal output but has no built-in way to manage tasks or coordinate work. TraeNuPI fills this gap:

- **Self-organizing work**: Trae adds tasks to Nezha → NuPI picks them up and reminds → Trae sees the reminder and acts. No delegation needed — Trae does the work directly.
- **Issue tracking**: Trae reports issues → NuPI processes them by priority (critical first) → re-organizes reminders automatically.
- **Cross-AI collaboration**: Multiple Trae AIs running TraeNuPI share the same Nezha database. They coordinate through tasks, issues, and meetings — just like a team.
- **Meeting-based coordination**: Raise a meeting in Nezha to discuss cross-repo changes. Any TraeNuPI instance sees it and acts.

## The Family

| Project | Formula | Description |
|---------|---------|-------------|
| **NuPI** | Pi + Nezha | Task management layer (checks Nezha, reminds, delegates) |
| **Piano** | NuPI + OpenCode | Autonomous agent (NuPI orchestrates, OpenCode executes) |
| **TraeNuPI** | Trae + NuPI | Interactive agent (NuPI reminds, Trae executes directly) |

The key difference: Piano delegates to OpenCode. TraeNuPI doesn't delegate — Trae reads NuPI's output and does the work itself.

```
  Trae AIs with TraeNuPI
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │  Trae (nupi) │  │ Trae (piano) │  │ Trae (other) │
  │  + TraeNuPI  │  │  + TraeNuPI  │  │  + TraeNuPI  │
  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │                 │                 │
         └────────┬────────┴────────┬────────┘
                  │    Nezha DB     │
                  │  (shared tasks, │
                  │   issues,       │
                  │   meetings,     │
                  │   broadcasts)   │
                  └────────┬────────┘
                           │
                    NuPI checks for
                    work & reminds
                    Trae acts directly
```

## Architecture

```
  Nezha DB          TraeNuPI           NuPI (child)
  (tasks,           (daemon)           (spawned by
   issues,     ←─── health ────→       TraeNuPI)
   meetings)         │
      │              │ streams output
      │              │
      │         Trae reads &
      │         responds directly
      │
      └── NuPI checks via HTTP API ──→ Nezha
```

TraeNuPI spawns `nupi` as a child process, streams its stdout/stderr through structured `[NUPI]` logs, and provides an HTTP control API. Trae watches the output and acts on what it sees.

## Quick Start

```bash
cd traenupi
npm install
npm run build
npm start
```

The daemon starts on port 5222, spawns NuPI, and begins streaming output.

## HTTP API

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/health` | GET | — | Health check (`{"status":"ok"}`) |
| `/status` | GET | — | Daemon status (NuPI PID, connections, uptime, restart count) |
| `/start` | POST | — | Start NuPI and health monitoring |
| `/stop` | POST | — | Stop NuPI and shut down |
| `/input` | POST | `{"text":"..."}` | Send text to NuPI's stdin |

### Examples

```bash
# Check daemon status
curl http://localhost:5222/status

# Start NuPI
curl -X POST http://localhost:5222/start

# Send input to NuPI
curl -X POST http://localhost:5222/input \
  -H "Content-Type: application/json" \
  -d '{"text":"check for tasks"}'

# Stop the daemon
curl -X POST http://localhost:5222/stop
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRAENUPI_PORT` | `5222` | HTTP API port |
| `NEZHA_API` | `http://127.0.0.1:5999` | Nezha API base URL |
| `TRAENUPI_NUPI_CMD` | `nupi` | Command to start NuPI |
| `TRAENUPI_POLL_INTERVAL` | `120000` | Reserved for future use |
| `TRAENUPI_AUTOSTART` | `true` | Auto-start NuPI on boot |

## How It Works

1. **Spawn**: TraeNuPI starts `nupi` as a child process
2. **Stream**: NuPI's stdout/stderr is captured and logged with `[NUPI]` prefix
3. **Health**: Every 30s, checks if NuPI is still running; auto-restarts if it dies
4. **Control**: HTTP API for start/stop and sending input to NuPI's stdin
5. **Trae reads**: Trae watches the terminal output and responds to NuPI's reminders

## Log Format

```
[LEVEL] HH:MM:SS Message {optional:data}
```

Levels: `INFO`, `WARN`, `ERROR`, `NUPI`

The `NUPI` level captures all NuPI output, making it easy to filter:

```bash
# Watch only NuPI output
node dist/index.js 2>&1 | grep NUPI
```

## Project Structure

```
traenupi/
├── bin/traenupi       # Entry point script
├── src/
│   ├── index.ts       # Main: starts server + spawns NuPI
│   ├── server.ts      # HTTP API (Hono)
│   ├── workloop.ts    # NuPI lifecycle & health monitoring
│   ├── nupi.ts        # NuPI child process manager
│   ├── nezha.ts       # Nezha API client (health check)
│   ├── opencode.ts    # OpenCode client (legacy, for reference)
│   ├── config.ts      # Environment configuration
│   ├── logger.ts      # Structured logging
│   └── types.ts       # TypeScript interfaces
├── package.json
└── tsconfig.json
```

## Prerequisites

- [NuPI](https://github.com/jk/nupi) installed and available in PATH
- [Nezha](https://github.com/jk/nezha) running on port 5999
- Node.js 22+ (for native `fetch` and `AbortSignal.timeout`)
