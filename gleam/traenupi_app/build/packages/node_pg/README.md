<div align="center">

![Last commit](https://img.shields.io/github/last-commit/Comamoca/node-pg?style=flat-square)
![Repository Stars](https://img.shields.io/github/stars/comamoca/node-pg?style=flat-square)
![Issues](https://img.shields.io/github/issues/Comamoca/node-pg?style=flat-square)
![Open Issues](https://img.shields.io/github/issues-raw/Comamoca/node-pg?style=flat-square)
![Bug Issues](https://img.shields.io/github/issues/Comamoca/node-pg/bug?style=flat-square)

<img src="https://emoji2svg.deno.dev/api/🐘" alt="eyecatch" height="100">

# node-pg

A type-safe PostgreSQL client library for Gleam, wrapping the battle-tested [node-postgres](https://node-postgres.com/) library.

</div>

<div align="center">

</div>

## 🚀 Quick Start

```gleam
import node_pg
import gleam/javascript/promise
import gleam/option.{Some}

pub fn main() {
  // Create a configuration
  let config = node_pg.create_config(
    user: Some("postgres"),
    password: Some("secret"),
    host: Some("localhost"),
    port: Some(5432),
    database: Some("mydb")
  )

  // Create a client
  let client = node_pg.new_client(config)

  // Connect and query
  promise.await(node_pg.connect(client), fn(result) {
    case result {
      Ok(_) -> {
        promise.await(node_pg.query(client, "SELECT * FROM users", []), fn(query_result) {
          case query_result {
            Ok(result) -> {
              // Process result.rows
              promise.await(node_pg.end(client), fn(_) {
                promise.resolve(Nil)
              })
            }
            Error(error) -> {
              // Handle error
              promise.reject(error.message)
            }
          }
        })
      }
      Error(error) -> {
        promise.reject(error.message)
      }
    }
  })
}
```

## ⬇️ Install

Since node-pg depends on [node-postgres](https://node-postgres.com/), please install it in advance.

### Node.js

```sh
npm install pg
```

### Bun

```sh
bun add pg
```
### Deno

```sh
deno add npm:pg
```

Add `node_pg` to your Gleam project:

```sh
gleam add node_pg
```

## ⛏️ Development

### Setup

This project uses Nix with devenv for development environment management:

```sh
# Enter the development shell
nix develop

# Or with direnv (recommended)
direnv allow
```

The Nix flake provides:
- Gleam (latest version)
- Erlang runtime
- Bun runtime
- Pre-commit hooks (treefmt, gitleaks, gitlint)

### Building

```sh
gleam build        # Build the project
gleam run          # Run the project
gleam test         # Run all tests (mock-based, no database required)
```

### Testing

All tests are mock-based and run without requiring a PostgreSQL database:

```sh
gleam test
```

## 📝 Todo

- [ ] Add transaction support (`BEGIN`, `COMMIT`, `ROLLBACK`)
- [ ] Implement connection pooling wrapper
- [ ] Add prepared statement support
- [ ] Create higher-level query builder API
- [ ] Add TypeScript type definitions for FFI
- [ ] Improve error type granularity

## 📜 License

MIT License

## 🧩 Dependencies

### Runtime Dependencies
- [gleam_stdlib](https://github.com/gleam-lang/stdlib) - Gleam standard library
- [gleam_javascript](https://github.com/gleam-lang/javascript) - JavaScript runtime support
- [pg](https://github.com/brianc/node-postgres) (npm) - Node.js PostgreSQL client (^8.16.3)

### Development Dependencies
- [gleeunit](https://github.com/gleam-lang/gleeunit) - Testing framework

## 👏 Inspired By

- [pgo](https://github.com/lpil/pgo) - PostgreSQL client for Gleam targeting Erlang

## 💕 Special Thanks

- [node-postgres](https://github.com/brianc/node-postgres) - The battle-tested PostgreSQL client for Node.js
- [gleam-lang](https://gleam.run/) - The Gleam programming language
