# Wisp vs Glen: Framework Comparison

## Executive Summary

Both Wisp and Glen are excellent web frameworks for Gleam, but they serve different purposes and target different runtimes. This document provides a comprehensive comparison to help you choose the right framework for your project.

## Quick Comparison Table

| Aspect | Wisp | Glen |
|--------|------|------|
| **Target Runtime** | Erlang/OTP | JavaScript (Node.js, Deno, Bun) |
| **FFI Required** | None | Minimal (1 adapter function) |
| **HTTP Server** | Mist (built-in) | Node.js built-in `http` module |
| **Production Ready** | ✅ Yes | ✅ Yes |
| **Hot Code Reloading** | ✅ Yes (OTP) | ❌ No |
| **Fault Tolerance** | ✅ Excellent (OTP supervision) | ⚠️ Manual error handling |
| **Concurrency Model** | Actor model (processes) | Event loop (async/await) |
| **Deployment** | BEAM VM | Node.js runtime |
| **Database Support** | Full ecosystem | node_pg (PostgreSQL) |
| **Middleware** | ✅ Built-in | ✅ Built-in |
| **WebSocket** | ✅ Yes | ✅ Yes |
| **Static Files** | ✅ Yes | ✅ Yes |
| **Session Management** | ✅ Yes | ✅ Yes |
| **Learning Curve** | Medium | Low |

## Detailed Analysis

### Wisp: The Erlang Powerhouse

#### Strengths

1. **Zero FFI Required**
   - Pure Gleam implementation
   - No JavaScript interop needed
   - Simpler dependency management

2. **Erlang/OTP Benefits**
   - **Fault Tolerance**: Built-in supervision trees
   - **Hot Code Reloading**: Update code without downtime
   - **Concurrency**: Actor model with lightweight processes
   - **Distribution**: Native support for distributed systems
   - **Fault Isolation**: Crashes don't bring down the entire system

3. **Production Ready**
   - Battle-tested on BEAM VM
   - Used in production by many companies
   - Excellent performance characteristics
   - Proven track record (20+ years of Erlang)

4. **Rich Ecosystem**
   - Access to Erlang/OTP libraries
   - Hex package manager
   - Mature tooling (rebar3, etc.)

5. **Built-in Middleware**
   ```gleam
   fn handle_request(req: wisp.Request) -> wisp.Response {
     use <- wisp.log_request(req)  // Automatic logging
     use <- wisp.rescue_crashes    // Automatic crash recovery
     // Your handler code
   }
   ```

6. **Crash Recovery**
   - Automatic rescue from crashes
   - Graceful error responses
   - No uncaught exceptions

#### Weaknesses

1. **Erlang Runtime Required**
   - Need to install Erlang/OTP
   - Larger deployment footprint
   - Less familiar to JavaScript developers

2. **Learning Curve**
   - Need to understand OTP concepts
   - Different mental model from Node.js
   - Actor-based concurrency

3. **JavaScript Interop**
   - Cannot directly use npm packages
   - Need to use Erlang equivalents
   - Port drivers for JavaScript code

### Glen: The JavaScript Specialist

#### Strengths

1. **JavaScript Ecosystem**
   - Direct access to npm packages
   - Familiar Node.js runtime
   - Easy deployment (serverless, containers, etc.)

2. **Minimal FFI**
   - Only 1 adapter function needed
   - Clean separation of concerns
   - Easy to understand and maintain

3. **Modern JavaScript Features**
   - Native async/await
   - Standard Request/Response objects
   - Web standard APIs

4. **Flexible Deployment**
   - Node.js, Deno, Bun
   - Serverless platforms (AWS Lambda, Vercel, etc.)
   - Docker containers
   - Traditional servers

5. **Developer Familiarity**
   - Easier for JavaScript developers
   - Familiar tooling (npm, yarn, pnpm)
   - Standard debugging tools

6. **Lightweight**
   - Smaller runtime footprint
   - Faster startup time
   - Less memory usage (for simple apps)

#### Weaknesses

1. **FFI Required**
   - Need to write adapter code
   - Potential for bugs in FFI layer
   - Maintenance overhead

2. **No Hot Code Reloading**
   - Need to restart server for updates
   - Downtime during deployments
   - Manual process management

3. **Fault Tolerance**
   - Manual error handling required
   - No built-in supervision
   - Crashes can bring down entire process

4. **Concurrency Model**
   - Event loop limitations
   - Blocking operations can affect performance
   - Need to be careful with CPU-intensive tasks

## Use Case Recommendations

### Choose Wisp When:

1. **Building Highly Concurrent Systems**
   - Real-time applications (chat, gaming)
   - IoT platforms
   - Message brokers
   - High-frequency trading

2. **Need Fault Tolerance**
   - Mission-critical applications
   - Systems requiring 99.999% uptime
   - Applications that cannot afford downtime

3. **Long-Running Services**
   - Background job processors
   - Event-driven systems
   - WebSocket servers
   - Long-polling endpoints

4. **Distributed Systems**
   - Microservices architecture
   - Clustered deployments
   - Geographic distribution

5. **Hot Code Updates Required**
   - Zero-downtime deployments
   - Continuous updates
   - Live system patches

### Choose Glen When:

1. **JavaScript Ecosystem Integration**
   - Heavy use of npm packages
   - Existing JavaScript codebase
   - Frontend-backend code sharing

2. **Serverless Deployment**
   - AWS Lambda
   - Vercel Functions
   - Cloudflare Workers
   - Netlify Functions

3. **Team Familiarity**
   - JavaScript-experienced team
   - No Erlang expertise
   - Faster onboarding

4. **Simple HTTP APIs**
   - REST APIs
   - GraphQL servers
   - Webhook handlers
   - Simple CRUD operations

5. **Rapid Prototyping**
   - Quick development cycles
   - MVP development
   - Proof of concepts

## Performance Characteristics

### Wisp (Erlang/OTP)

- **Concurrency**: Excellent (millions of processes)
- **Latency**: Low and predictable
- **Throughput**: High for concurrent connections
- **Memory**: Higher per-process overhead
- **Startup**: Slower (BEAM VM initialization)

### Glen (JavaScript)

- **Concurrency**: Good (event loop)
- **Latency**: Low for I/O operations
- **Throughput**: Good for moderate concurrency
- **Memory**: Lower per-request overhead
- **Startup**: Fast (Node.js initialization)

## Code Comparison

### Wisp Example

```gleam
import gleam/erlang/process
import gleam/io
import gleam/json
import wisp
import wisp/wisp_mist
import mist

pub fn main() {
  let secret_key_base = wisp.random_string(64)
  
  let assert Ok(_) =
    wisp_mist.handler(handle_request, secret_key_base)
    |> mist.new
    |> mist.port(8080)
    |> mist.start

  process.sleep_forever()
}

fn handle_request(req: wisp.Request) -> wisp.Response {
  use <- wisp.log_request(req)
  use <- wisp.rescue_crashes

  case wisp.path_segments(req) {
    ["health"] -> health_check()
    _ -> wisp.not_found()
  }
}

fn health_check() -> wisp.Response {
  json.object([#("status", json.string("ok"))])
  |> json.to_string
  |> wisp.json_response(200)
}
```

### Glen Example

```gleam
import gleam/io
import gleam/json
import glen
import glen/status

pub fn main() {
  glen.serve(handler, on_port: 8080)
}

fn handler(req: glen.Request) -> glen.Response {
  case glen.path_segments(req) {
    ["health"] -> health_check()
    _ -> glen.new_response(status.not_found)
  }
}

fn health_check() -> glen.Response {
  json.object([#("status", json.string("ok"))])
  |> json.to_string
  |> glen.new_response(status.ok)
  |> glen.set_header("content-type", "application/json")
}
```

## Deployment Comparison

### Wisp Deployment

```bash
# Build release
gleam build

# Run with Erlang
erl -noshell -s wisp_experimental start

# Or create a release
rebar3 release
```

### Glen Deployment

```bash
# Build for Node.js
gleam build

# Run with Node.js
node build/javascript/wisp_experimental/wisp_experimental.mjs

# Or deploy to serverless
# (platform-specific deployment commands)
```

## Migration Path

If you start with one framework and need to switch:

### Wisp → Glen
- Rewrite FFI code to use Node.js APIs
- Replace Erlang-specific libraries with npm packages
- Adjust concurrency model (actors → async/await)
- Update deployment scripts

### Glen → Wisp
- Remove FFI adapters
- Replace npm packages with Erlang equivalents
- Implement OTP supervision trees
- Set up Erlang deployment infrastructure

## Conclusion

Both frameworks are excellent choices, and the best option depends on your specific requirements:

- **Choose Wisp** for systems that benefit from Erlang's strengths: fault tolerance, hot code reloading, and massive concurrency.
- **Choose Glen** for projects that need JavaScript ecosystem integration, serverless deployment, or team familiarity with Node.js.

For TraeNuPI specifically, since it's a daemon that runs continuously and benefits from fault tolerance, **Wisp would be an excellent choice** for the core service. However, **Glen remains valuable** for lightweight HTTP endpoints or serverless deployments.

## Next Steps

1. **Experiment with Wisp**: The experimental project is ready at `gleam/wisp_experimental`
2. **Evaluate your use case**: Consider your deployment target and team expertise
3. **Prototype both**: Try implementing the same feature in both frameworks
4. **Make an informed decision**: Based on your specific requirements

## Resources

- [Wisp Documentation](https://gleam-wisp.github.io/wisp/)
- [Glen Documentation](https://github.com/maikklein/glen)
- [Gleam Documentation](https://gleam.run/)
- [Erlang/OTP Documentation](https://www.erlang.org/docs)
- [Node.js Documentation](https://nodejs.org/docs/)
