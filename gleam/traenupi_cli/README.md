# TraeNuPI CLI - Pure Gleam Implementation

A pure Gleam command-line interface for TraeNuPI, with zero npm dependencies for core functionality.

## Quick Start

```bash
# Build the CLI
gleam build

# Run commands
node cli.mjs help
node cli.mjs version
node cli.mjs status
```

## Available Commands

- `help` - Show help message
- `version` - Show version information
- `status` - Show daemon status
- `tellme <question>` - Ask baby AI a question
- `know <key> <value>` - Store knowledge
- `search <query>` - Search knowledge base
- `remind <min> <msg>` - Set a reminder
- `review <id>` - Review a session
- `tasks` - List current tasks

## Architecture

This CLI is built entirely in Gleam, demonstrating that:

- ✅ **No npm dependencies** required for core functionality
- ✅ **Pure Gleam** implementation
- ✅ **Minimal FFI** (only for process.argv)
- ✅ **Type-safe** throughout
- ✅ **Cross-platform** (works on any Node.js runtime)

## Building

```bash
# Build the Gleam code
gleam build

# The CLI is now ready to use
node cli.mjs help
```

## Development

The CLI is part of the larger TraeNuPI Gleam migration effort:

- `traenupi_core` - Core library with 34 modules
- `traenupi_app` - HTTP server application
- `traenupi_cli` - This CLI application

## Future Work

- Migrate remaining TypeScript modules to Gleam
- Implement all CLI commands in pure Gleam
- Remove all npm dependencies
- Achieve 100% Gleam source code

## Why Pure Gleam?

1. **Type Safety**: No runtime exceptions from type errors
2. **Maintainability**: Clear, functional code
3. **Performance**: Efficient BEAM runtime
4. **Portability**: Works on Erlang and JavaScript targets
5. **AI-Friendly**: Easy for AI assistants to understand and modify
