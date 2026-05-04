# Gleam Integration Patterns for TraeNuPI

## Import Pattern: Node.js Subpath Imports

Based on `@chouquette/vite` package pattern, we use Node.js subpath imports for cleaner Gleam FFI imports.

### Configuration in package.json

```json
{
  "imports": {
    "#gleam/prelude": "./build/dev/javascript/gleam_stdlib/gleam.mjs",
    "#gleam/option": "./build/dev/javascript/gleam_stdlib/gleam/option.mjs",
    "#gleam/result": "./build/dev/javascript/gleam_stdlib/gleam/result.mjs",
    "#gleam/promise": "./build/dev/javascript/gleam_javascript/gleam/javascript/promise.mjs",
    "#traenupi/http": "./build/dev/javascript/traenupi_app/traenupi/http.mjs"
  }
}
```

### Usage in FFI Files

Instead of:
```javascript
import { Ok, Error } from "../../build/dev/javascript/gleam_stdlib/gleam.mjs";
```

Use:
```javascript
import * as gleam from "#gleam/prelude";

export function divide(x, y) {
  if (y === 0) return gleam.Error();
  return gleam.Ok(x / y);
}
```

### Reference

- Package: `@chouquette/vite` (https://www.npmjs.com/package/@chouquette/vite)
- Pattern: Uses `package.json` `imports` field for subpath resolution
- Node.js Documentation: https://nodejs.org/api/packages.html#subpath-imports

### Benefits

1. **Cleaner imports** - No more long relative paths
2. **Single source of truth** - Path defined once in package.json
3. **No extra dependency** - Just use Node.js built-in subpath imports
4. **Works without Vite** - This is a Node.js feature, not Vite-specific
5. **Easy refactoring** - Change paths in one place

## Current Architecture

### Minimal FFI Approach

TraeNuPI uses a minimal FFI approach:

```
├─ Database: node_pg (Gleam native) - NO FFI ✅
├─ HTTP: Minimal FFI (3 functions) - Node.js http module ✅
└─ Imports: Node.js subpath imports - NO FFI ✅
```

### HTTP Server FFI

The HTTP server uses only 3 FFI functions:

```javascript
// http_ffi.mjs
export function createServer(handler) { /* ... */ }
export function listen(server, port, callback) { /* ... */ }
export function writeResponse(res, statusCode, headers, body) { /* ... */ }
```

All other logic is implemented in Gleam:
- Request routing
- Response generation
- JSON encoding
- Database queries (via node_pg)

## Future Improvements

When more FFI files are added, we can:

1. Add more subpath imports for common modules
2. Create helper functions for common FFI patterns
3. Document best practices for type-safe FFI
