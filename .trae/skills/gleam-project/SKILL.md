---
name: "gleam-project"
description: "Guides AI to set up, configure, and manage Gleam projects including dependencies, targets, and build configuration. Invoke when creating a new Gleam project or managing project configuration."
---

# Gleam Project Management - Setup and Configuration

## Purpose

This skill helps AI developers set up, configure, and manage Gleam projects. It covers project creation, dependency management, build configuration, and best practices for project organization.

## Project Creation

### Create a New Project

```bash
gleam new my_project
cd my_project
```

This creates:
```
my_project/
  README.md
  gleam.toml
  src/
    my_project.gleam
  test/
    my_project_test.gleam
```

### Project Structure

```
my_project/
  gleam.toml           # Project configuration
  manifest.toml        # Locked dependencies (auto-generated)
  README.md            # Project documentation
  src/                 # Source code
    my_app.gleam       # Main module
    my_app/
      module1.gleam    # Nested modules
      module2.gleam
  test/                # Test files
    my_app_test.gleam
  priv/                # Static assets (optional)
    data/
    templates/
```

## Configuration (gleam.toml)

### Basic Configuration

```toml
name = "my_project"
version = "1.0.0"
target = "erlang"

[dependencies]
gleam_stdlib = "~> 0.34"
gleeunit = "~> 1.0"

[dev-dependencies]
# Development dependencies here
```

### Multi-Target Projects

```toml
name = "my_project"
version = "1.0.0"

# Target-specific configuration
[erlang]
# Erlang-specific settings

[javascript]
# JavaScript-specific settings
runtime = "node"  # or "deno", "bun"
```

### Application Configuration (Erlang)

```toml
name = "my_app"
version = "1.0.0"
target = "erlang"

[erlang]
application_start_module = "my_app"
```

## Dependency Management

### Adding Dependencies

```bash
# Add a dependency
gleam add gleam_json

# Add multiple dependencies
gleam add gleam_http gleam_httpc

# Add development dependency
gleam add --dev gleeunit
```

### Dependency Types

```toml
[dependencies]
# Production dependencies
gleam_stdlib = "~> 0.34"
gleam_json = "~> 1.0"

[dev-dependencies]
# Development dependencies (testing, etc.)
gleeunit = "~> 1.0"
```

### Version Specifications

```toml
# Compatible version (~> 1.2.3 means >= 1.2.3 and < 2.0.0)
gleam_stdlib = "~> 0.34"

# Exact version
my_lib = "1.2.3"

# Version range
my_lib = ">= 1.0.0 and < 2.0.0"

# Git dependency
my_lib = { git = "https://github.com/user/my_lib.git", ref = "v1.0.0" }

# Path dependency (for local development)
my_lib = { path = "../my_lib" }
```

### Updating Dependencies

```bash
# Update all dependencies
gleam update

# Update specific dependency
gleam update gleam_json
```

## Build and Run

### Build Project

```bash
# Build for default target
gleam build

# Build for specific target
gleam build --target erlang
gleam build --target javascript
```

### Run Project

```bash
# Run main function (Erlang)
gleam run

# Run with arguments
gleam run -- arg1 arg2

# Run on JavaScript target
gleam run --target javascript
```

### Test Project

```bash
# Run all tests
gleam test

# Run specific test file
gleam test test/my_module_test.gleam

# Run on specific target
gleam test --target javascript
```

## Target Configuration

### Erlang Target

```toml
name = "my_app"
target = "erlang"

[erlang]
# Application start module
application_start_module = "my_app"

# OTP application name
application_name = "my_app"
```

### JavaScript Target

```toml
name = "my_app"
target = "javascript"

[javascript]
# Runtime: "node", "deno", "bun"
runtime = "node"

# Output directory
output_directory = "dist"

# TypeScript declarations
typescript_declarations = true
```

### Multi-Target Project

```toml
name = "my_app"
version = "1.0.0"

# Support both targets
target = "erlang"  # Default target

# Dependencies for both targets
[dependencies]
gleam_stdlib = "~> 0.34"

# Erlang-specific dependencies
[erlang.dependencies]
gleam_httpc = "~> 2.0"

# JavaScript-specific dependencies
[javascript.dependencies]
gossamer = "~> 1.0"
```

## Module Organization

### Module Naming

```gleam
// src/my_app.gleam - Top-level module
pub fn main() {
  io.println("Hello!")
}

// src/my_app/user.gleam - Nested module
pub type User {
  User(id: Int, name: String)
}

// src/my_app/user/manager.gleam - Deeper nesting
pub fn create_user(name: String) -> User {
  User(id: 1, name:)
}
```

### Importing Modules

```gleam
// Import entire module
import my_app/user

pub fn main() {
  let u = user.User(id: 1, name: "Alice")
}

// Import with alias
import my_app/user/manager as um

pub fn main() {
  let u = um.create_user("Alice")
}

// Import specific functions
import my_app/user.{User, create_user}

pub fn main() {
  let u = User(id: 1, name: "Alice")
}
```

### Public vs Private

```gleam
// src/my_app.gleam

// Public function - can be imported
pub fn public_function() -> Int {
  42
}

// Private function - internal only
fn private_helper() -> Int {
  21
}

// Public type
pub type User {
  User(id: Int, name: String)
}

// Private type
type InternalState {
  InternalState(data: String)
}
```

## Common Project Patterns

### Library Project

```
my_lib/
  gleam.toml
  src/
    my_lib.gleam        # Public API
    my_lib/
      internal.gleam    # Internal helpers
  test/
    my_lib_test.gleam
```

```toml
name = "my_lib"
version = "1.0.0"

[dependencies]
gleam_stdlib = "~> 0.34"

[dev-dependencies]
gleeunit = "~> 1.0"
```

### Application Project

```
my_app/
  gleam.toml
  src/
    my_app.gleam        # Main entry point
    my_app/
      config.gleam      # Configuration
      server.gleam      # HTTP server
      db.gleam          # Database
  test/
    my_app_test.gleam
  priv/
    static/             # Static files
```

```toml
name = "my_app"
version = "1.0.0"
target = "erlang"

[erlang]
application_start_module = "my_app"

[dependencies]
gleam_stdlib = "~> 0.34"
mist = "~> 0.14"
gleam_json = "~> 1.0"

[dev-dependencies]
gleeunit = "~> 1.0"
```

### CLI Application

```
my_cli/
  gleam.toml
  src/
    my_cli.gleam        # CLI entry point
    my_cli/
      args.gleam        # Argument parsing
      commands.gleam    # Command handlers
  test/
    my_cli_test.gleam
```

```gleam
// src/my_cli.gleam
import argv
import gleam/io

pub fn main() {
  let args = argv.load().arguments
  case args {
    ["help"] -> show_help()
    ["version"] -> show_version()
    _ -> io.println("Unknown command")
  }
}

fn show_help() {
  io.println("My CLI Tool")
  io.println("Commands:")
  io.println("  help     Show this help")
  io.println("  version  Show version")
}

fn show_version() {
  io.println("v1.0.0")
}
```

## Build Outputs

### Erlang Build

```bash
gleam build
# Creates:
#   build/erlang/my_app/
#   build/erlang/my_app.app
```

### JavaScript Build

```bash
gleam build --target javascript
# Creates:
#   build/javascript/my_app.mjs
#   build/javascript/my_app.d.ts  # If typescript_declarations = true
```

## Development Workflow

### Development Cycle

```bash
# 1. Create project
gleam new my_project
cd my_project

# 2. Add dependencies
gleam add gleam_json

# 3. Write code
# Edit src/my_project.gleam

# 4. Write tests
# Edit test/my_project_test.gleam

# 5. Run tests
gleam test

# 6. Build
gleam build

# 7. Run
gleam run
```

### Watch Mode

```bash
# Watch for changes and rebuild
gleam build --watch

# Watch for changes and rerun tests
gleam test --watch
```

## Publishing

### Publish to Hex

```bash
# Register on hex.pm first
# Then publish
gleam publish
```

### Pre-Publish Checklist

1. Update version in `gleam.toml`
2. Update `README.md` with latest changes
3. Add `CHANGELOG.md` entry
4. Run all tests: `gleam test`
5. Build successfully: `gleam build`
6. Check documentation: `gleam docs build`

## Best Practices

1. **Use meaningful names**: Project and module names should be descriptive
2. **Keep modules focused**: Each module should have a single responsibility
3. **Use version control**: Always use git for your projects
4. **Document public API**: Add documentation for public functions and types
5. **Test thoroughly**: Aim for high test coverage
6. **Use dependencies wisely**: Only add dependencies you need
7. **Lock dependencies**: Commit `manifest.toml` for reproducible builds
8. **Follow conventions**: Use standard project structure
9. **Keep it simple**: Avoid over-engineering
10. **Update regularly**: Keep dependencies up to date

## Common Issues

### Dependency Conflicts

```bash
# Clear dependency cache and reinstall
rm -rf build/
gleam update
```

### Build Errors

```bash
# Clean build
gleam clean
gleam build
```

### Target-Specific Issues

```bash
# Build for specific target
gleam build --target erlang
gleam build --target javascript
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `gleam new <name>` | Create new project |
| `gleam add <package>` | Add dependency |
| `gleam update` | Update dependencies |
| `gleam build` | Build project |
| `gleam run` | Run project |
| `gleam test` | Run tests |
| `gleam clean` | Clean build artifacts |
| `gleam publish` | Publish to Hex |
| `gleam docs build` | Build documentation |

## When to Use This Skill

- When creating a new Gleam project
- When managing project dependencies
- When configuring build targets
- When organizing project structure
- When publishing a Gleam package
- When setting up development environment
- When troubleshooting build issues
