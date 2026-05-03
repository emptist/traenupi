# TraeNuPI Development Guide

## Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  CLI (src/index.ts) | Skills (.trae/skills/) | Daemon       │
├─────────────────────────────────────────────────────────────┤
│                    Integration Layer                         │
│  gleam-bridge.ts | db-safe.ts | storage.ts | meeting.ts     │
├─────────────────────────────────────────────────────────────┤
│                    Core Layer (Gleam)                        │
│  jsonx | schema | validation | state | async | cache | ...  │
├─────────────────────────────────────────────────────────────┤
│                    Runtime Layer                             │
│  Node.js | PostgreSQL (Nezha DB) | File System              │
└─────────────────────────────────────────────────────────────┘
```

### Module Organization

```
traenupi/
├── gleam/traenupi_core/          # Core library (Gleam)
│   ├── src/
│   │   ├── traenupi_core.gleam   # Type definitions
│   │   └── traenupi_core/        # Module implementations
│   └── test/                     # Gleam tests
│
├── src/
│   ├── common/                   # Shared TypeScript modules
│   │   ├── gleam-bridge.ts       # Gleam ↔ TypeScript bridge
│   │   ├── db-safe.ts            # Secure database operations
│   │   ├── storage.ts            # Local file storage
│   │   ├── knowledge.ts          # Knowledge management
│   │   └── types.ts              # TypeScript interfaces
│   │
│   └── trae/                     # Trae-specific modules
│       ├── baby-ai.ts            # Baby AI integration
│       ├── context.ts            # Context building
│       ├── presence.ts           # AI presence tracking
│       └── ...
│
└── .trae/skills/                 # AI skills
```

## Adding New Gleam Modules

### Step 1: Create the Module

```bash
cd gleam/traenupi_core/src/traenupi_core
touch my_module.gleam
```

### Step 2: Implement the Module

```gleam
// my_module.gleam
import gleam/result.{type Result, Ok, Error}

pub type MyError {
  InvalidInput(String)
  ProcessingError(String)
}

pub fn do_something(input: String) -> Result(String, MyError) {
  case input {
    "" -> Error(InvalidInput("Input cannot be empty"))
    _ -> Ok("Processed: " <> input)
  }
}
```

### Step 3: Add Tests

```gleam
// test/traenupi_core_test.gleam
import traenupi_core/my_module.{do_something, InvalidInput}

pub fn do_something_valid_test() {
  let result = do_something("test")
  should.be_ok(result)
}

pub fn do_something_empty_test() {
  let result = do_something("")
  should.be_error(result)
}
```

### Step 4: Build and Test

```bash
cd gleam/traenupi_core
gleam build
gleam test
```

### Step 5: Add TypeScript Bridge

```typescript
// src/common/gleam-bridge.ts
import {
  do_something,
  type MyError$,
} from "../../gleam/traenupi_core/build/dev/javascript/traenupi_core/traenupi_core/my_module.mjs";

export { do_something, type MyError$ };
```

## Testing Guidelines

### Gleam Tests

Located in `gleam/traenupi_core/test/traenupi_core_test.gleam`:

```gleam
import gleeunit
import gleeunit/should

pub fn main() -> Nil {
  gleeunit.main()
}

// Unit tests
pub fn my_function_test() {
  let result = my_function("input")
  should.equal(result, "expected")
}

// Property-based tests (using property.gleam)
pub fn reverse_twice_test() {
  property.check(fn(s) {
    let reversed = string.reverse(s)
    let double_reversed = string.reverse(reversed)
    double_reversed == s
  })
}
```

### TypeScript Tests

Located in `src/test/`:

```typescript
import { describe, it, expect } from "vitest";
import { do_something } from "../common/gleam-bridge.js";

describe("my_module", () => {
  it("should process valid input", async () => {
    const result = await do_something("test");
    expect(result.isOk()).toBe(true);
  });
});
```

### Running Tests

```bash
# Gleam tests
cd gleam/traenupi_core && gleam test

# TypeScript tests
npm test

# All tests
npm run test:all
```

## Code Style

### Gleam Style

```gleam
// Use snake_case for functions and variables
pub fn calculate_total(items: List(Item)) -> Int {
  let total = list.fold(items, 0, fn(acc, item) { acc + item.price })
  total
}

// Use PascalCase for types
pub type ShoppingCart {
  ShoppingCart(
    items: List(Item),
    total: Int,
  )
}

// Prefer Result over exceptions
pub fn divide(a: Int, b: Int) -> Result(Int, String) {
  case b {
    0 -> Error("Division by zero")
    _ -> Ok(a / b)
  }
}

// Use pipe operator for chaining
pub fn process(input: String) -> String {
  input
  |> string.trim()
  |> string.lowercase()
  |> string.replace(" ", "-")
}
```

### TypeScript Style

```typescript
// Use async/await for promises
async function processData(input: string): Promise<Result<string, Error>> {
  try {
    const result = await doSomething(input);
    return { ok: true, value: result };
  } catch (error) {
    return { ok: false, error };
  }
}

// Use type imports for types
import type { MyType } from "./types.js";

// Use const for imports that don't change
import { do_something } from "./gleam-bridge.js";
```

## FFI (Foreign Function Interface)

### Calling JavaScript from Gleam

```gleam
// fs_ffi.gleam
@external(javascript, "./fs_ffi.mjs", "read_file")
pub fn read_file(path: String) -> Result(String, String)
```

```javascript
// fs_ffi.mjs
import { readFileSync } from "fs";

export function read_file(path) {
  try {
    const content = readFileSync(path, "utf-8");
    return { type: "Ok", value: content };
  } catch (error) {
    return { type: "Error", value: error.message };
  }
}
```

### Calling Gleam from TypeScript

```typescript
import { my_function } from "../../gleam/.../my_module.mjs";

const result = await my_function("input");
if (result.isOk()) {
  console.log(result[0]); // The value
} else {
  console.error(result[0]); // The error
}
```

## Database Operations

### Always Use db-safe.ts

```typescript
import { querySafe, queryOne, execSafe, transaction } from "./common/db-safe.js";

// ✅ Safe - parameterized query
const users = await querySafe<{ id: number; name: string }>(
  "SELECT * FROM users WHERE status = $1",
  ["active"]
);

// ✅ Safe - insert with parameters
await execSafe(
  "INSERT INTO knowledge (key, value) VALUES ($1, $2)",
  ["my_key", "my_value"]
);

// ✅ Safe - transaction
await transaction(async (client) => {
  await client.query("INSERT INTO tasks (title) VALUES ($1)", ["Task 1"]);
  await client.query("UPDATE stats SET count = count + 1");
});

// ❌ NEVER do this - SQL injection vulnerable
const unsafeQuery = `SELECT * FROM users WHERE name = '${userInput}'`;
```

## Skills Development

### Creating a New Skill

```bash
mkdir -p .trae/skills/my-skill
touch .trae/skills/my-skill/SKILL.md
```

### SKILL.md Template

```markdown
# My Skill

## Purpose
Brief description of what this skill does.

## When to Use
- Condition 1
- Condition 2

## Instructions
1. Step 1
2. Step 2

## Examples
\`\`\`
Input: ...
Output: ...
\`\`\`
```

### Registering the Skill

Skills are auto-discovered by Trae IDE. Just create the folder and SKILL.md file.

## Debugging

### Gleam Debugging

```gleam
import gleam/io

pub fn debug_function(input: String) -> String {
  io.debug(input)  // Prints to stderr
  let result = process(input)
  io.debug(result)
  result
}
```

### TypeScript Debugging

```typescript
import { logger } from "./trae/logger.js";

logger.debug("Processing input", { input });
logger.info("Operation completed", { duration: 123 });
logger.error("Operation failed", { error: err });
```

### Verbose Mode

```bash
PSYPI_VERBOSE=true traenupi start
```

## Performance

### Caching

Use the Gleam cache module:

```gleam
import traenupi_core/cache.{TTLCache}

pub fn main() {
  let cache = cache.new_ttl_cache(60_000)  // 60 second TTL
  let cached = cache.get(cache, "key")
  case cached {
    Ok(value) -> value
    Error(_) -> {
      let value = expensive_operation()
      cache.set(cache, "key", value)
      value
    }
  }
}
```

### Async Operations

```gleam
import traenupi_core/async

pub fn parallel_fetch(urls: List(String)) -> Promise(List(String)) {
  urls
  |> list.map(fetch_url)
  |> async.all()
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run tests: `npm run test:all`
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `chore`: Maintenance

Examples:
```
feat(gleam): add diff module for text comparison
fix(db): prevent SQL injection in query functions
docs(readme): add vision section
test(schema): add property-based tests for validation
```

## Roadmap

### Immediate (Next Session)

- [ ] Add `diff.gleam` - Text diffing for code review
- [ ] Add `git.gleam` - Git operations via FFI
- [ ] Add `ai.gleam` - AI-specific utilities
- [ ] Improve baby AI with conversation history

### Short-term (Next Month)

- [ ] Knowledge graph integration
- [ ] Predictive assistance
- [ ] Quality metrics tracking

### Long-term (6-12 months)

- [ ] Multi-AI orchestration
- [ ] Learning from feedback
- [ ] Cross-project knowledge sharing

## Resources

- [Gleam Documentation](https://gleam.run/documentation/)
- [Gleam Standard Library](https://hexdocs.pm/gleam_stdlib/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Nezha Family Projects](https://github.com/nezha)
