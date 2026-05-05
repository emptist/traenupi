---
name: "gleam-ffi"
description: "Guides AI to implement FFI (Foreign Function Interface) in Gleam when pure Gleam libraries are unavailable. Invoke when you need to interface with JavaScript or Erlang native code, or when no pure Gleam library exists for your use case."
---

# Gleam FFI - When Pure Gleam Isn't Enough

## Purpose

This skill helps AI developers implement FFI (Foreign Function Interface) in Gleam when pure Gleam libraries are not available for specific use cases. While pure Gleam is preferred, FFI is sometimes necessary for platform-specific features or performance-critical operations.

## When to Use FFI

Use FFI only when:
1. **No pure Gleam library exists** for your use case
2. **Platform-specific features** are needed (e.g., Node.js EventEmitter)
3. **Performance-critical operations** require native code
4. **Interoperability** with existing JavaScript/Erlang ecosystems

## FFI Architecture

### Directory Structure

```
src/
  my_module.gleam        # Gleam interface (public API)
  my_module_ffi.mjs      # JavaScript implementation
  my_module_ffi.erl      # Erlang implementation (optional)
```

### Basic Pattern

#### 1. Gleam Interface (src/my_module.gleam)

```gleam
@external(erlang, "my_module_ffi", "my_function")
@external(javascript, "./my_module_ffi.mjs", "myFunction")
pub fn my_function(arg: String) -> Result(Int, String)
```

#### 2. JavaScript Implementation (src/my_module_ffi.mjs)

```javascript
export function myFunction(arg) {
  try {
    // Native JavaScript code
    const result = doSomething(arg);
    return { type: "Ok", 0: result };
  } catch (error) {
    return { type: "Error", 0: error.message };
  }
}
```

#### 3. Erlang Implementation (src/my_module_ffi.erl) - Optional

```erlang
-module(my_module_ffi).
-export([my_function/1]).

my_function(Arg) ->
  case do_something(Arg) of
    {ok, Result} -> {ok, Result};
    {error, Reason} -> {error, Reason}
  end.
```

## Advanced Patterns

### Event Emitter Pattern

For event-driven systems like Node.js EventEmitter:

#### Gleam Interface

```gleam
pub type EventEmitter

@external(javascript, "./event_emitter_ffi.mjs", "createEmitter")
pub fn create_emitter() -> EventEmitter

@external(javascript, "./event_emitter_ffi.mjs", "on")
pub fn on(emitter: EventEmitter, event: String, callback: fn(String) -> Nil) -> Nil

@external(javascript, "./event_emitter_ffi.mjs", "emit")
pub fn emit(emitter: EventEmitter, event: String, data: String) -> Nil
```

#### JavaScript Implementation

```javascript
import { EventEmitter } from 'events';

export function createEmitter() {
  return new EventEmitter();
}

export function on(emitter, event, callback) {
  emitter.on(event, callback);
}

export function emit(emitter, event, data) {
  emitter.emit(event, data);
}
```

### Async Operations

For asynchronous JavaScript APIs:

#### Gleam Interface

```gleam
pub type Promise(a)

@external(javascript, "./async_ffi.mjs", "fetchData")
pub fn fetch_data(url: String) -> Promise(String)

@external(javascript, "./async_ffi.mjs", "await")
pub fn await(promise: Promise(a)) -> a
```

#### JavaScript Implementation

```javascript
export async function fetchData(url) {
  const response = await fetch(url);
  return response.text();
}

export function await(promise) {
  return promise;
}
```

### Type Conversion

#### Gleam Types to JavaScript

| Gleam Type | JavaScript Representation |
|------------|--------------------------|
| `Int` | `number` |
| `Float` | `number` |
| `String` | `string` |
| `Bool` | `boolean` |
| `List(a)` | `array` |
| `Result(a, e)` | `{ type: "Ok", 0: a }` or `{ type: "Error", 0: e }` |
| `Option(a)` | `{ type: "Some", 0: a }` or `{ type: "None" }` |
| Custom Type | Object with fields |

#### JavaScript to Gleam Types

```javascript
// Result type
return { type: "Ok", 0: value };      // Ok(value)
return { type: "Error", 0: error };   // Error(error)

// Option type
return { type: "Some", 0: value };    // Some(value)
return { type: "None" };              // None

// Custom type
return { field1: value1, field2: value2 };
```

## Error Handling

### Always Return Results

```gleam
@external(javascript, "./file_ffi.mjs", "readFile")
pub fn read_file(path: String) -> Result(String, String)
```

```javascript
import { readFileSync } from 'fs';

export function readFile(path) {
  try {
    const content = readFileSync(path, 'utf-8');
    return { type: "Ok", 0: content };
  } catch (error) {
    return { type: "Error", 0: error.message };
  }
}
```

### Type-Safe Error Messages

```gleam
pub type FileError {
  FileNotFound
  PermissionDenied
  UnknownError(String)
}

@external(javascript, "./file_ffi.mjs", "readFileSafe")
pub fn read_file_safe(path: String) -> Result(String, FileError)
```

```javascript
import { readFileSync } from 'fs';

export function readFileSafe(path) {
  try {
    const content = readFileSync(path, 'utf-8');
    return { type: "Ok", 0: content };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { type: "Error", 0: { type: "FileNotFound" } };
    } else if (error.code === 'EACCES') {
      return { type: "Error", 0: { type: "PermissionDenied" } };
    } else {
      return { type: "Error", 0: { type: "UnknownError", 0: error.message } };
    }
  }
}
```

## Testing FFI Code

### Mock FFI for Tests

Create a test implementation:

```gleam
// src/my_module.gleam
@external(erlang, "my_module_ffi", "myFunction")
@external(javascript, "./my_module_ffi.mjs", "myFunction")
pub fn my_function(arg: String) -> Result(Int, String)

// For testing
pub fn my_function_mock(arg: String) -> Result(Int, String) {
  Ok(42)
}
```

```gleam
// test/my_module_test.gleam
import my_module

pub fn test_my_function() {
  let result = my_module.my_function_mock("test")
  should.equal(result, Ok(42))
}
```

## Best Practices

1. **Prefer pure Gleam**: Always check if a pure Gleam library exists first
2. **Document FFI usage**: Clearly document what FFI is used and why
3. **Handle all errors**: Never let FFI errors propagate as crashes
4. **Type safety**: Use proper Gleam types for all FFI boundaries
5. **Cross-platform**: Implement both Erlang and JavaScript FFI when possible
6. **Testing**: Provide mock implementations for testing
7. **Minimal FFI**: Keep FFI code as small as possible
8. **Performance**: Only use FFI for performance-critical paths

## Common FFI Use Cases

### Node.js APIs
- File system operations (use `simplifile` instead)
- HTTP client (use `gossamer` or `gleam_httpc` instead)
- Process management
- Native modules

### Erlang/OTP
- OTP behaviors (GenServer, Supervisor)
- Erlang NIFs for performance
- Erlang libraries without Gleam wrappers

### Browser APIs
- DOM manipulation
- Canvas/WebGL
- Web APIs (use `gossamer` for fetch)

## Quick Reference

| Pattern | Use Case |
|---------|----------|
| Basic FFI | Simple function calls |
| Event Emitter | Event-driven systems |
| Async Operations | Promises and async/await |
| Type Conversion | Custom types across boundaries |
| Error Handling | Safe FFI with Result types |

## When to Use This Skill

- When you need to interface with JavaScript or Erlang native code
- When no pure Gleam library exists for your use case
- When you need platform-specific features
- When you need performance-critical native code
- When you need to integrate with existing ecosystems
