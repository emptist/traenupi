# Gleam Migration Plan

**Inspired by psypi (98% Gleam)** - TraeNuPI is migrating to Gleam for type-safe, production-ready code.

## Current Status

| Metric | Current | Target |
|--------|---------|--------|
| Gleam files | 242 | ~250 |
| Gleam LOC | 86,000+ | 100,000+ |
| TypeScript files | 45 | ~5 (FFI only) |
| Gleam % | ~85% | ~98% |
| Tests passing | 393 | 400+ |

## Recent Refactoring (May 9, 2026)

### Database Architecture Overhaul

Completed the first major refactoring following psypi's patterns:

**New Files:**
- `db_types.gleam` - Pure types (DbConfig, DbError, QueryResult)
- `db_connection.gleam` - Connection management with `with_connection` pattern
- `task_db.gleam` - Domain-specific DB operations for tasks
- `meeting_db.gleam` - Domain-specific DB operations for meetings

**Security Improvements:**
- ✅ Removed SQL injection vectors from string interpolation
- ✅ All queries now use parameterized values only
- ✅ Domain-specific error types per module

**Architecture Changes:**
- ✅ Split 299-line db.gleam into modular components
- ✅ Removed unsafe generic CRUD functions (select_all, insert, update, delete)
- ✅ Implemented `with_connection` pattern for automatic resource management
- ✅ Domain modules now own their SQL queries (no generic ORM layer)

**What's Left:**
- [ ] Write tests for task_db.gleam and meeting_db.gleam
- [ ] Migrate remaining domain modules to use task_db.gleam pattern
- [ ] Consider adopting `node_pg` package to replace custom db_ffi.mjs
- [ ] Update TypeScript code to use new Gleam DB modules

## Dependencies

### traeupi_core (gleam/traenupi_core/gleam.toml)
```toml
[dependencies]
gleam_stdlib = ">= 0.44.0 and < 2.0.0"
gleam_javascript = ">= 1.0.0 and < 2.0.0"
gleam_json = ">= 3.1.0 and < 4.0.0"

[dev-dependencies]
gleeunit = ">= 1.0.0 and < 2.0.0"
```

### pi_agent (gleam/pi_agent/pi_agent/gleam.toml)
```toml
[dependencies]
gleam_stdlib = ">= 1.0.0 and < 2.0.0"
gleam_javascript = ">= 1.0.0 and < 2.0.0"
gleam_json = ">= 3.0.0 and < 4.0.0"
gleam_http = ">= 4.0.0 and < 5.0.0"
```

### traenupi_app (gleam/traenupi_app/gleam.toml)
```toml
[dependencies]
gleam_stdlib = ">= 0.44.0 and < 2.0.0"
gleam_javascript = ">= 1.0.0 and < 2.0.0"
node_pg = ">= 1.0.0 and < 2.0.0"
gleam_http = ">= 4.3.0 and < 5.0.0"
gleam_json = ">= 3.1.0 and < 4.0.0"
glen = ">= 2.2.0 and < 3.0.0"
traenupi_core = { path = "../traenupi_core" }
```

## Database Rules

TraeNuPI shares the `psypi` PostgreSQL database with other projects. It is a client, not the owner.

**ALLOWED operations:**
- SELECT, INSERT, UPDATE, DELETE - Full data access
- CREATE NEW TABLE - TraeNuPI can create its own tables

**NEVER do these (breaks others):**
- ALTER TABLE on existing tables
- DROP TABLE on existing tables
- CREATE INDEX / DROP INDEX on shared tables

**Safety requirements:**
- Use parameterized queries via `db-safe.ts` (`querySafeText`, `execSafe`)
- Never use string concatenation in SQL
- Use `source = 'traenupi'` tag for TraeNuPI-owned records

See: `.trae/rules/project_rules.md`

## Migration Strategy

Following psypi's proven pattern:
1. Keep `index.ts` as thin wrapper calling Gleam
2. Move `trae/*.ts` commands to Gleam modules
3. Use FFI wrappers for Node.js features (fs, http, pg)
4. Maintain same function/class names for drop-in replacement

## Migration Priority

### Phase 1: Core Building Blocks
- [ ] `trae/context.ts` → Gleam `context.gleam`
- [ ] `src/common/resolve-id.ts` → Gleam

### Phase 2: AI Logic
- [ ] `trae/baby-ai.ts` → Gleam
- [ ] `trae/baby-ai-*.ts` → Gleam

### Phase 3: Data Operations
- [ ] `trae/meeting-utils.ts` → Gleam
- [ ] `trae/bookmarks.ts` → Gleam
- [ ] `trae/mood.ts` → Gleam
- [ ] `trae/reminders.ts` → Gleam

### Phase 4: Skills
- [ ] `trae/skill-importer.ts` → Gleam
- [ ] `trae/skill-improver.ts` → Gleam

### Phase 5: Other Modules
- [ ] `trae/daemon.ts` → Gleam
- [ ] `trae/init.ts` → Gleam
- [ ] `trae/presence.ts` → Gleam
- [ ] `trae/pi-agent-bridge.ts` → Gleam

## Progress

### Completed
- [x] Gleam core library (239 files, 85k LOC)
- [x] 386 Gleam tests passing
- [x] Database layer migrated to parameterized queries

### Phase 1: context.ts (In Progress)
- Analyzing TypeScript context.ts
- Identifying dependencies to migrate
- Creating Gleam equivalents

## Technical Notes

### FFI Patterns Used
```gleam
// Database queries via FFI
pub fn query_safe_text(sql: String, params: List(String)) -> String {
  ffi.query_safe_text(sql, params)
}

// File system operations
pub fn read_file(path: String) -> String {
  ffi.read_file(path)
}
```

### Testing Strategy
1. Run `gleam test` after each module migration
2. Keep TypeScript tests as integration layer
3. Migrate unit tests to Gleam with gleeunit

### FFI Guidelines

When creating FFI wrappers for JavaScript/Node.js:

1. **Type Safety**: Match Gleam types exactly in FFI
2. **Error Handling**: Return structured error objects, not throw
3. **No Deprecated Functions**: Never use `psqlQuery`/`psqlExec` in FFI
4. **Parameterized Queries**: Use pg Pool with parameterized queries

Example FFI file structure:
```javascript
// db_ffi.mjs
import pg from 'pg';

export function query(conn, sql, params) {
  return new Promise(async (resolve) => {
    try {
      const result = await conn.pool.query(sql, params);
      resolve({ type: 'Ok', value: result.rows });
    } catch (e) {
      resolve({ type: 'Error', value: { QueryError: e.message } });
    }
  });
}
```

### Migration Progress

| Module | Status |
|--------|--------|
| context.gleam | ✅ Working |
| db.gleam | ✅ Working |
| db_ffi.mjs | ✅ Working |
| pi_agent | ✅ Working |
| traenupi_app | ✅ Working |

## References
- psypi Gleam integration: `../psypi/gleam/docs/GLEAM_INTEGRATION.md`
- psypi migration strategy: `../psypi/docs/GLEAM-MIGRATION-STRATEGY.md`
- Database rules: `.trae/rules/project_rules.md`

## Test Status

```bash
cd gleam/traenupi_core && gleam test
# Result: 393 passed, no failures
```

### Running Tests
```bash
# Run all tests
gleam test

# Run specific test file
gleam test --name "db_test"
```

### Test Coverage
- Main test file: `test/traenupi_core_test.gleam` (3609 lines)
- DB tests: `test/db_test.gleam`
- Context tests: `test/context_test.gleam`
- String utils tests: `test/string_utils_test.gleam`

## Architecture Comparison: psypi vs traenupi

### Core Difference

**psypi writes Gleam. traenupi writes TypeScript in Gleam syntax.**

### 1. Domain Separation

psypi splits `agent_identity` into 4 focused files:

| File | Responsibility | Lines |
|------|---------------|-------|
| `agent_identity_types.gleam` | Pure types only | 21 |
| `agent_identity_logic.gleam` | Pure business logic (`generate_semantic_id`) | 39 |
| `agent_identity_db.gleam` | DB operations (insert, fetch) | ~80 |
| `agent_identity.gleam` | Orchestration | ~80 |

traenupi crams everything into one 299-line `db.gleam` — types, config, connection, queries, CRUD helpers, SQL builders, shell commands, and environment access.

### 2. Type Safety at the DB Boundary

psypi uses `dynamic/decode` — the Gleam-idiomatic way:
```gleam
fn meeting_decoder() -> decode.Decoder(Meeting) {
  use id <- decode.field("id", decode.string)
  use topic <- decode.field("topic", decode.string)
  ...
  decode.success(Meeting(id:, topic:, ...))
}
```
Every row is decoded into a proper typed record. If the schema changes, the decoder fails at compile time.

traenupi returns `Dict(String, String)`:
```gleam
pub type QueryResult {
  QueryResult(rows: List(Dict(String, String)), row_count: Int)
}
```
Everything is a string. No compile-time guarantees. A typo in a column name silently returns `None`.

### 3. Connection Management

psypi has `with_connection` — automatic connect/disconnect with error mapping:
```gleam
db.with_connection(fn(conn) {
  // just use conn, it auto-closes
}, db_error_to_identity_error)
```

traenupi requires manual connection management — callers must remember to close, and there's no error mapping.

### 4. SQL Safety

psypi — all SQL is inline in domain modules, with parameterized values via `dynamic.string()`:
```gleam
let params = [dynamic.string(id), dynamic.string(project)]
db.query(conn, "INSERT INTO ... VALUES ($1, $2)", params)
```

traenupi — **interpolates table/column names from strings**:
```gleam
pub fn select_all(conn, table) {
  query(conn, "SELECT * FROM " <> table, [])  // SQL injection vector
}
pub fn insert(conn, table, columns, values) {
  // column names interpolated directly
}
```
This is a real security risk. Table and column names can't be parameterized in PostgreSQL — they must be whitelisted or validated.

### 5. Error Architecture

psypi — each domain has its own error type with a mapper:
```gleam
pub type MeetingError { ConnectionError(String) | QueryError(String) | NotFound(String) | DecodeError(String) }
pub type TaskError { ConnectionError(String) | QueryError(String) | NotFound(String) | DecodeError(String) }
```
The `with_connection` pattern maps `DbError → DomainError` automatically.

traenupi — one generic `DbError` type used everywhere. No domain context in errors.

### 6. Pure vs FFI

psypi — 3 `@external` files. Uses `node_pg`, `simplifile`, `filepath` packages.
traenupi — 10 `@external` files. Rolls its own FFI for everything.

### Summary Table

| Aspect | psypi | traenupi |
|--------|-------|----------|
| Philosophy | Gleam-first | TypeScript-translated |
| DB layer | Thin infrastructure (71 lines) | Mini-ORM (299 lines) |
| Row parsing | `dynamic/decode` (type-safe) | `Dict(String, String)` (stringly-typed) |
| Domain logic | Pure, testable, separated | Mixed with infrastructure |
| SQL safety | Parameterized values only | Interpolates identifiers |
| Error model | Domain-specific per module | Generic DbError |
| Connection mgmt | `with_connection` (auto-cleanup) | Manual |
| FFI usage | 3 files | 10 files |
| Module count | 59 | 29 |
| Tests | 46 | 393 |

### Refactoring Roadmap

1. **Split db.gleam** into thin infrastructure + per-domain modules
2. **Adopt `dynamic/decode`** for row parsing instead of Dict(String, String)
3. **Add `with_connection`** pattern for automatic resource management
4. **Remove string-interpolated SQL** — whitelist table names or use domain-specific queries
5. **Create domain error types** per module (MeetingError, TaskError, etc.)
6. **Extract pure logic** into testable functions (like psypi's `agent_identity_logic.gleam`)
7. **Consider `node_pg`** package to replace custom db_ffi.mjs
