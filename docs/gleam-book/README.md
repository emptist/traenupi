# Gleam Programming in Practice

**A Practical Guide for TypeScript Developers**

*Written while building TraeNuPI - a real-world AI companion system*

---

## About This Book

This book is written **during actual development** of TraeNuPI, a production AI companion system. Every example comes from real code solving real problems. This is not theoretical - it's battle-tested.

### Why This Book?

- **TypeScript developers** transitioning to Gleam
- **Practical examples** from a real project (TraeNuPI)
- **Battle-tested patterns** that work in production
- **Step-by-step** from basics to advanced
- **FFI integration** with JavaScript/TypeScript

### What You'll Learn

1. How Gleam's type system prevents bugs TypeScript can't catch
2. Pattern matching that eliminates nested conditionals
3. Building real applications with Gleam + TypeScript
4. FFI (Foreign Function Interface) for JavaScript interop
5. Testing strategies with property-based testing
6. Refactoring techniques that are safe and easy

---

## Table of Contents

### Part I: Foundations

- **Chapter 1**: [Introduction for TypeScript Developers](./chapters/01-introduction.md)
  - Why Gleam? The TypeScript pain points
  - Setting up your environment
  - Your first Gleam module
  - The mental model shift

- **Chapter 2**: [Types and Pattern Matching](./chapters/02-types-and-patterns.md)
  - Custom types vs TypeScript interfaces
  - Pattern matching: the superpower
  - Result type: errors done right
  - Option type: no more null checks

- **Chapter 3**: [Working with JSON](./chapters/03-json.md)
  - Building a JSON parser from scratch
  - Type-safe JSON handling
  - JSON Schema validation
  - Real example: jsonx.gleam (601 lines)

### Part II: Real-World Development

- **Chapter 4**: [FFI - JavaScript Integration](./chapters/04-ffi.md)
  - Calling JavaScript from Gleam
  - Calling Gleam from TypeScript
  - Building a bridge module
  - Real example: gleam-bridge.ts

- **Chapter 5**: [Database Operations](./chapters/05-database.md)
  - Type-safe SQL queries
  - Connection pooling
  - Transaction handling
  - Real example: db.gleam

- **Chapter 6**: [Building a CLI](./chapters/06-cli.md)
  - Argument parsing
  - Command dispatch
  - Help generation
  - Real example: cli.gleam

### Part III: Advanced Patterns

- **Chapter 7**: [State Management](./chapters/07-state.md)
  - Immutable state patterns
  - State machines in Gleam
  - Real example: state.gleam

- **Chapter 8**: [Validation](./chapters/08-validation.md)
  - Building a validation library
  - Composable validators
  - Error accumulation
  - Real example: validation.gleam

- **Chapter 9**: [Caching](./chapters/09-caching.md)
  - TTL cache implementation
  - LRU cache implementation
  - Thread safety considerations
  - Real example: cache.gleam

- **Chapter 10**: [Async Programming](./chapters/10-async.md)
  - Promise handling in Gleam
  - Async combinators
  - Error handling patterns
  - Real example: async.gleam

### Part IV: Testing

- **Chapter 11**: [Testing Strategies](./chapters/11-testing.md)
  - Unit testing with gleeunit
  - Property-based testing
  - Integration testing
  - Real example: traenupi_core_test.gleam (343 tests)

### Part V: Case Studies

- **Chapter 12**: [Case Study: JSON Schema Validation](./chapters/12-schema-case-study.md)
  - 841 lines of production code
  - How we built it
  - Lessons learned

- **Chapter 13**: [Case Study: JSON Path Query Language](./chapters/13-json-path-case-study.md)
  - Parser combinators in Gleam
  - Query execution engine
  - 442 lines of focused code

- **Chapter 14**: [Case Study: Absorbing Nezha into TraeNuPI](./chapters/14-nezha-absorption.md)
  - From 2500-line TypeScript to 300-line Gleam modules
  - Migration strategy
  - Benefits realized

### Appendices

- **Appendix A**: [Gleam vs TypeScript Cheat Sheet](./appendices/cheat-sheet.md)
- **Appendix B**: [Common Patterns Reference](./appendices/patterns.md)
- **Appendix C**: [Error Messages Explained](./appendices/errors.md)
- **Appendix D**: [Project Structure Guide](./appendices/structure.md)

---

## The TraeNuPI Project

This book is written alongside the TraeNuPI project:

```
traenupi/
├── gleam/traenupi_core/
│   ├── src/traenupi_core/
│   │   ├── jsonx.gleam      # Chapter 3
│   │   ├── schema.gleam     # Chapter 12
│   │   ├── json_path.gleam  # Chapter 13
│   │   ├── validation.gleam # Chapter 8
│   │   ├── cache.gleam      # Chapter 9
│   │   ├── async.gleam      # Chapter 10
│   │   ├── state.gleam      # Chapter 7
│   │   ├── cli.gleam        # Chapter 6
│   │   └── db.gleam         # Chapter 5
│   └── test/
│       └── traenupi_core_test.gleam  # Chapter 11
│
├── src/
│   └── common/
│       └── gleam-bridge.ts  # Chapter 4
│
└── docs/
    └── gleam-book/          # This book
```

### Statistics

| Metric | TypeScript | Gleam |
|--------|------------|-------|
| Largest file | 2,540 lines | 841 lines |
| Average file | ~500 lines | ~250 lines |
| Test count | ~50 tests | 343 tests |
| Type safety | Runtime errors | Compile-time errors |

---

## How to Read This Book

### For TypeScript Developers

Start with Chapter 1 - it explains the mental model shift needed. Then work through Part I before jumping to specific topics.

### For Experienced Gleam Users

Jump to Part III for advanced patterns, or Part V for case studies of real production code.

### For AI Agents

This book is written to be AI-friendly:
- Clear examples
- Explicit types
- Self-contained chapters
- Real code references

---

## Author's Note

This book is being written **as I build TraeNuPI**. Every chapter contains real code from a real project. This means:

- Examples are battle-tested
- Patterns are production-ready
- Mistakes and fixes are documented
- The book evolves with the project

**This is not a theoretical book. This is a practical guide from the trenches.**

---

## License

MIT License - Use the code, learn from it, build amazing things.

---

*Last updated: 2026-05-03*
*TraeNuPI version: 1.0.0*
*Gleam version: 1.14+*
