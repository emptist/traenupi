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

### Glen Web Framework

TraeNuPI uses Glen framework for HTTP handling:

```
├─ Database: node_pg (Gleam native) - NO FFI ✅
├─ HTTP: Glen framework - Minimal FFI ✅
│  ├─ Request/Response helpers - Built-in ✅
│  ├─ Middleware support - Ready ✅
│  ├─ WebSocket support - Available ✅
│  └─ Node.js adapter - 1 FFI function ✅
└─ Imports: Node.js subpath imports - NO FFI ✅
```

### HTTP Server Implementation

The HTTP server uses Glen framework with a minimal Node.js adapter:

**Gleam Code (http.gleam)**:
```gleam
import glen
import glen/status

fn handle_request(req: glen.Request, state: AppState) -> Promise(glen.Response) {
  case glen.path_segments(req) {
    ["health"] -> health_check()
    ["status"] -> server_status(state)
    _ -> not_found()
  }
}

fn health_check() -> Promise(glen.Response) {
  json.object([
    #("status", json.string("ok")),
    #("framework", json.string("Glen")),
  ])
  |> json.to_string
  |> glen.json(status.ok)
  |> promise.resolve
}
```

**FFI Code (http_ffi.mjs)**:
```javascript
// Minimal Node.js adapter for Glen
export function createServer(port, handler) {
  const server = http.createServer(async (nodeReq, nodeRes) => {
    // Create standard JavaScript Request object
    const jsRequest = new Request(url, {
      method: nodeReq.method,
      headers: nodeReq.headers,
    });
    
    // Call Glen handler
    const jsResponse = await handler(jsRequest);
    
    // Send response
    nodeRes.writeHead(jsResponse.status, Object.fromEntries(jsResponse.headers));
    nodeRes.end(await jsResponse.text());
  });
  
  server.listen(port, () => console.log(`Server started on port ${port}`));
}
```

### Why Glen?

1. **Based on Wisp** - Official Gleam web framework design patterns
2. **JavaScript Target** - Specifically designed for JS runtime
3. **Minimal FFI** - Only 1 function needed for Node.js adapter
4. **Rich Features** - Middleware, WebSocket, file streaming
5. **Type Safe** - Full Gleam type safety for HTTP handling

### Comparison with Alternatives

| Framework | Target | FFI Needed | Features |
|-----------|--------|------------|----------|
| **Glen** | JavaScript | Minimal (1 function) | Full-featured |
| Wisp | Erlang | None | Full-featured |
| Glimr | Erlang | None | Batteries-included |
| Minimal FFI | JavaScript | More (3+ functions) | Basic only |

## Future Improvements

When more FFI files are added, we can:

1. Add more subpath imports for common modules
2. Create helper functions for common FFI patterns
3. Document best practices for type-safe FFI
