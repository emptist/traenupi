# TraeNuPI

Autonomous headless daemon that gives Trae AI an interactive work environment.

Trae can watch terminal output continuously — TraeNuPI leverages this by running as a background process that polls Nezha for tasks, delegates them to OpenCode, and streams structured logs that Trae can read and respond to in real-time.

## Architecture

```
  Nezha API          TraeNuPI           OpenCode
  (tasks,            (daemon)           (delegation
   issues,      ←─── polling ───→       target)
   broadcasts)
      │                  │                  │
      │   fetch work     │   delegate       │
      │ ───────────────→ │ ───────────────→ │
      │                  │                  │
      │  complete/fail   │   poll result    │
      │ ←─────────────── │ ←─────────────── │
      │                  │
      │            structured logs
      │            → Trae reads & responds
```

## Quick Start

```bash
cd traenupi
npm install
npm run build
npm start
```

The daemon starts on port 5222 with auto-start enabled by default.

## HTTP API

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/health` | GET | — | Health check (`{"status":"ok"}`) |
| `/status` | GET | — | Full daemon status (connections, task counts, uptime) |
| `/start` | POST | — | Start the work loop |
| `/stop` | POST | — | Stop the work loop |
| `/work` | POST | — | Force a single work cycle |
| `/delegate` | POST | `{"task":"..."}` | Manually delegate a task to OpenCode |
| `/usage` | GET | — | Check OpenCode quota status |

### Examples

```bash
# Check daemon status
curl http://localhost:5222/status

# Start autonomous work
curl -X POST http://localhost:5222/start

# Delegate a specific task
curl -X POST http://localhost:5222/delegate \
  -H "Content-Type: application/json" \
  -d '{"task":"Fix the login bug in auth.ts"}'

# Check OpenCode quota
curl http://localhost:5222/usage

# Stop the daemon
curl -X POST http://localhost:5222/stop
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRAENUPI_PORT` | `5222` | HTTP API port |
| `NEZHA_API` | `http://127.0.0.1:5999` | Nezha API base URL |
| `OPENCODE_URL` | `http://127.0.0.1:5111` | OpenCode server URL |
| `TRAENUPI_POLL_INTERVAL` | `120000` | Work polling interval in ms (2 min) |
| `TRAENUPI_AUTOSTART` | `true` | Auto-start work loop on boot |

## How It Works

1. **Polling**: Every 2 minutes (configurable), TraeNuPI asks Nezha for pending work — tasks, issues, or broadcasts
2. **Prioritization**: Critical/high severity issues are picked first, then tasks, then broadcasts
3. **Delegation**: Work is delegated to OpenCode via `prompt_async` + polling pattern
4. **Reporting**: Results are sent back to Nezha (complete/fail), and structured logs are emitted for Trae to read
5. **Quota awareness**: If OpenCode free usage is exceeded, the daemon pauses and logs the reset time

## Log Format

```
[LEVEL] HH:MM:SS Message {optional:data}
```

Levels: `INFO`, `WARN`, `ERROR`, `DELEGATE`

The `DELEGATE` level is used specifically for OpenCode delegation events, making it easy to filter:

```bash
# Watch only delegation activity
node dist/index.js 2>&1 | grep DELEGATE
```

## Project Structure

```
traenupi/
├── bin/traenupi       # Entry point script
├── src/
│   ├── index.ts       # Main: starts server + work loop
│   ├── server.ts      # HTTP API (Hono)
│   ├── workloop.ts    # Autonomous polling & task processing
│   ├── nezha.ts       # Nezha API client
│   ├── opencode.ts    # OpenCode delegation client
│   ├── config.ts      # Environment configuration
│   ├── logger.ts      # Structured logging
│   └── types.ts       # TypeScript interfaces
├── package.json
└── tsconfig.json
```

## Prerequisites

- [Nezha](https://github.com/jk/nezha) running on port 5999
- [OpenCode](https://opencode.ai) server running on port 5111 (`opencode serve --port 5111`)
- Node.js 22+ (for native `fetch` and `AbortSignal.timeout`)
