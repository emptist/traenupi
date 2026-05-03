# Gleam Programming in Practice

> A Practical Guide for TypeScript Developers
> 
> Written while building TraeNuPI - a real-world AI companion system

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Gleam](https://img.shields.io/badge/Gleam-1.14+-pink.svg)](https://gleam.run)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## Quick Links

- 📖 [Read Online](./book/README.md)
- 💻 [Example Code](./examples/)
- 🚀 [TraeNuPI Project](../../)
- 📝 [Changelog](./CHANGELOG.md)

## About This Book

This book teaches Gleam through **real-world examples** from the TraeNuPI project - a production AI companion system with:

- **20 Gleam modules** (6,200+ lines)
- **343 passing tests**
- **Full TypeScript integration**
- **PostgreSQL database layer**

### Why This Book?

| Problem | TypeScript | Gleam Solution |
|---------|------------|----------------|
| File size | 2,500+ lines | Max 500 lines |
| Null safety | Runtime errors | Compile-time |
| Pattern matching | Switch/if chains | Pattern matching |
| Error handling | Try/catch | Result type |
| Refactoring | Risky | Safe with types |

## Chapters

### Part I: Foundations

| Chapter | Title | Status | Lines |
|---------|-------|--------|-------|
| 01 | [Introduction for TypeScript Developers](./book/chapter-01.md) | ✅ Done | - |
| 02 | [Types and Pattern Matching](./book/chapter-02.md) | 🚧 In Progress | - |
| 03 | [Working with JSON](./book/chapter-03.md) | 📝 Planned | - |
| 04 | [FFI - JavaScript Integration](./book/chapter-04.md) | 📝 Planned | - |

### Part II: Real-World Development

| Chapter | Title | Status | Example Code |
|---------|-------|--------|--------------|
| 05 | [Database Operations](./book/chapter-05.md) | 📝 Planned | [db.gleam](../../gleam/traenupi_core/src/traenupi_core/db.gleam) |
| 06 | [Building a CLI](./book/chapter-06.md) | ✅ Done | [cli.gleam](../../gleam/traenupi_core/src/traenupi_core/cli.gleam) |
| 07 | [State Management](./book/chapter-07.md) | ✅ Done | [state.gleam](../../gleam/traenupi_core/src/traenupi_core/state.gleam) |
| 08 | [Validation](./book/chapter-08.md) | ✅ Done | [validation.gleam](../../gleam/traenupi_core/src/traenupi_core/validation.gleam) |

### Part III: Advanced Patterns

| Chapter | Title | Status | Example Code |
|---------|-------|--------|--------------|
| 09 | [Caching](./book/chapter-09.md) | ✅ Done | [cache.gleam](../../gleam/traenupi_core/src/traenupi_core/cache.gleam) |
| 10 | [Async Programming](./book/chapter-10.md) | ✅ Done | [async.gleam](../../gleam/traenupi_core/src/traenupi_core/async.gleam) |
| 11 | [Testing Strategies](./book/chapter-11.md) | ✅ Done | [tests](../../gleam/traenupi_core/test/traenupi_core_test.gleam) |

### Part IV: Case Studies

| Chapter | Title | Status | Lines |
|---------|-------|--------|-------|
| 12 | [JSON Schema Validation](./book/chapter-12.md) | ✅ Done | 841 |
| 13 | [JSON Path Query Language](./book/chapter-13.md) | ✅ Done | 442 |
| 14 | [Absorbing Nezha into TraeNuPI](./book/chapter-14.md) | 🚧 In Progress | - |

## Example Code Structure

```
examples/
├── chapter-01/          # Introduction examples
│   ├── hello.gleam
│   └── types.gleam
├── chapter-02/          # Pattern matching
│   ├── result.gleam
│   └── option.gleam
├── chapter-03/          # JSON handling
│   ├── parse.gleam
│   └── validate.gleam
├── chapter-04/          # FFI
│   ├── ffi_example.gleam
│   └── ffi_example.mjs
└── ...
```

## Running the Examples

```bash
# Clone the repository
git clone https://github.com/nezha/traenupi
cd traenupi

# Install Gleam (if not installed)
# See: https://gleam.run/getting-started/

# Run examples
cd docs/gleam-book/examples/chapter-01
gleam run

# Run tests
cd ../../../gleam/traenupi_core
gleam test
```

## Statistics

### Code Comparison

| Metric | TypeScript | Gleam |
|--------|------------|-------|
| Largest file | 2,540 lines | 841 lines |
| Average file | ~500 lines | ~250 lines |
| Test count | ~50 tests | 343 tests |
| Type errors caught | Runtime | Compile-time |

### Module Sizes

| Module | Lines | Purpose |
|--------|-------|---------|
| schema.gleam | 841 | JSON Schema validation |
| jsonx.gleam | 601 | JSON encoding/decoding |
| datetime.gleam | 528 | Date/time handling |
| json_path.gleam | 442 | JSON Path queries |
| validation.gleam | 302 | Input validation |
| config.gleam | 320 | Config parsing |
| str.gleam | 376 | String utilities |
| fs.gleam | 284 | File system |
| resultx.gleam | 305 | Result combinators |
| schema_builder.gleam | 299 | Schema to JSON |
| cli.gleam | 219 | CLI parsing |
| cache.gleam | 214 | TTL & LRU cache |
| collection.gleam | 225 | Queue, Stack, Deque |
| async.gleam | 225 | Promise utilities |
| state.gleam | 216 | State management |
| http.gleam | 200 | HTTP client |
| logger.gleam | 192 | Structured logging |
| utils.gleam | 126 | General utilities |
| property.gleam | 135 | Property testing |
| json.gleam | 153 | JSON encoding |

## Contributing

This book is written alongside the TraeNuPI project. To contribute:

1. Find an issue or chapter that needs work
2. Make sure examples compile: `gleam build`
3. Make sure tests pass: `gleam test`
4. Submit a pull request

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Author

Written by the TraeNuPI project contributors, with assistance from AI agents who learned Gleam the hard way.

---

*Last updated: 2026-05-03*
