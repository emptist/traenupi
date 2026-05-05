# TraeNuPI Migration - Database Schema Status

## ✅ Status: READY FOR MIGRATION

**Good news!** All required columns have been added to the psypi database. No schema changes are needed.

## Verification Results (2026-05-05)

### 1. tasks Table - ✅ READY
- Required column: `source`
- Status: **Already exists**
- No action needed

### 2. issues Table - ✅ READY
- Required columns: `discovered_by`, `environment`, `git_branch`, `git_hash`, `reported_by`, `source`
- Status: **All 6 columns already exist**
- No action needed

### 3. meetings Table - ✅ READY
- Status: Psypi already has more columns than Nezha
- No action needed

## Original Schema Change Requirements (For Reference)

The following sections document what changes were originally needed. They are kept for reference only.
```sql
ALTER TABLE tasks ADD COLUMN source TEXT;
COMMENT ON COLUMN tasks.source IS 'Task source/origin information';
```

**Gleam Code Changes:**

File: `psypi/gleam/psypi_core/src/psypi_cli/task.gleam`

```gleam
// Update Task type definition
pub type Task {
  Task(
    id: String,
    title: String,
    description: Option(String),
    status: TaskStatus,
    priority: Int,
    result: Option(String),
    error: Option(String),
    retry_count: Int,
    created_at: String,
    updated_at: String,
    completed_at: Option(String),
    created_by: String,
    source: Option(String),  // ADD THIS
  )
}

// Update task_decoder()
pub fn task_decoder() -> decode.Decoder(Task) {
  use id <- decode.field("id", decode.string)
  use title <- decode.field("title", decode.string)
  use description <- decode.field("description", decode.optional(decode.string))
  use status_str <- decode.field("status", decode.string)
  use priority <- decode.field("priority", decode.int)
  use result <- decode.field("result", decode.optional(decode.string))
  use error <- decode.field("error", decode.optional(decode.string))
  use retry_count <- decode.field("retry_count", decode.int)
  use created_at <- decode.field("created_at", decode.string)
  use updated_at <- decode.field("updated_at", decode.string)
  use completed_at <- decode.field("completed_at", decode.optional(decode.string))
  use created_by <- decode.field("created_by", decode.string)
  use source <- decode.field("source", decode.optional(decode.string))  // ADD THIS

  decode.success(Task(
    id: id,
    title: title,
    description: description,
    status: string_to_status(status_str),
    priority: priority,
    result: result,
    error: error,
    retry_count: retry_count,
    created_at: created_at,
    updated_at: updated_at,
    completed_at: completed_at,
    created_by: created_by,
    source: source,  // ADD THIS
  ))
}
```

**Impact:** Low - Optional field, nullable

---

### 2. issues Table

**Current Status:**
- Psypi has 24 columns
- Nezha has 30 columns
- Missing 6 columns from Nezha

**Required Additions:**
```sql
ALTER TABLE issues 
  ADD COLUMN discovered_by TEXT DEFAULT 'nezha'::text,
  ADD COLUMN environment TEXT DEFAULT 'development'::text,
  ADD COLUMN git_branch TEXT,
  ADD COLUMN git_hash TEXT,
  ADD COLUMN reported_by TEXT DEFAULT 'nezha'::text,
  ADD COLUMN source TEXT DEFAULT 'system'::text;

COMMENT ON COLUMN issues.discovered_by IS 'Who discovered the issue';
COMMENT ON COLUMN issues.environment IS 'Runtime environment (development, production, etc.)';
COMMENT ON COLUMN issues.git_branch IS 'Git branch where issue was found';
COMMENT ON COLUMN issues.git_hash IS 'Git commit hash';
COMMENT ON COLUMN issues.reported_by IS 'Who reported the issue';
COMMENT ON COLUMN issues.source IS 'Issue source/origin';
```

**Gleam Code Changes:**

File: `psypi/gleam/psypi_core/src/psypi_cli/issue.gleam`

```gleam
// Update Issue type definition
pub type Issue {
  Issue(
    id: String,
    title: String,
    description: Option(String),
    severity: IssueSeverity,
    status: IssueStatus,
    issue_type: IssueType,
    created_at: String,
    resolved_at: Option(String),
    created_by: String,
    discovered_by: Option(String),  // ADD THIS
    environment: Option(String),     // ADD THIS
    git_branch: Option(String),      // ADD THIS
    git_hash: Option(String),        // ADD THIS
    reported_by: Option(String),     // ADD THIS
    source: Option(String),          // ADD THIS
  )
}

// Update issue_decoder()
fn issue_decoder() -> decode.Decoder(Issue) {
  use id <- decode.field("id", decode.string)
  use title <- decode.field("title", decode.string)
  use description <- decode.field("description", decode.optional(decode.string))
  use severity_str <- decode.field("severity", decode.string)
  use status_str <- decode.field("status", decode.string)
  use issue_type_str <- decode.field("issue_type", decode.string)
  use created_at <- decode.field("created_at", decode.string)
  use resolved_at <- decode.field("resolved_at", decode.optional(decode.string))
  use created_by <- decode.field("created_by", decode.string)
  
  // ADD THESE
  use discovered_by <- decode.field("discovered_by", decode.optional(decode.string))
  use environment <- decode.field("environment", decode.optional(decode.string))
  use git_branch <- decode.field("git_branch", decode.optional(decode.string))
  use git_hash <- decode.field("git_hash", decode.optional(decode.string))
  use reported_by <- decode.field("reported_by", decode.optional(decode.string))
  use source <- decode.field("source", decode.optional(decode.string))

  decode.success(Issue(
    id: id,
    title: title,
    description: description,
    severity: string_to_severity(severity_str),
    status: string_to_status(status_str),
    issue_type: string_to_type(issue_type_str),
    created_at: created_at,
    resolved_at: resolved_at,
    created_by: created_by,
    discovered_by: discovered_by,      // ADD THIS
    environment: environment,          // ADD THIS
    git_branch: git_branch,            // ADD THIS
    git_hash: git_hash,                // ADD THIS
    reported_by: reported_by,          // ADD THIS
    source: source,                    // ADD THIS
  ))
}
```

**Impact:** Medium - 6 new fields, but all nullable with defaults

---

### 3. meetings Table

**Current Status:**
- Psypi already has 11 columns (Nezha has 8)
- Psypi has 3 additional columns: `project_id`, `summary`, `updated_at`
- No changes needed - psypi already has more columns

**Impact:** None - Already compatible

---

## Migration Execution Plan

### Option 1: Add Columns Before Migration

```bash
# 1. Add columns to psypi database
psql -d psypi -f add_missing_columns.sql

# 2. Update Gleam code
# (Apply changes shown above)

# 3. Test psypi functionality
gleam test

# 4. Migrate TraeNuPI data
./migrate_traenupi_data.sh
```

### Option 2: Migrate Without Adding Columns

```bash
# 1. Accept data loss for missing columns
# 2. Migrate only common columns
# 3. TraeNuPI starts fresh in psypi
```

---

## Testing Checklist

After adding columns, test:

- [ ] psypi CLI commands work
- [ ] Gleam decoders parse correctly
- [ ] Existing psypi data unaffected
- [ ] New columns accept NULL values
- [ ] Default values applied correctly
- [ ] All psypi tests pass

---

## Contact

For questions or coordination:
- TraeNuPI team: Review this document
- Psypi team: Decide on approach
- Coordinate timing for schema changes

---

**Document Version**: 1.0
**Date**: 2026-05-05
**Status**: Ready for psypi team review
