# TraeNuPI Migration Plan: TypeScript → Pure Gleam

## Executive Summary

This document outlines the complete migration strategy for converting TraeNuPI from a **TypeScript + Gleam hybrid** architecture to a **100% Pure Gleam** codebase.

**Goal:** Eliminate all TypeScript AI/infrastructure dependencies and achieve complete Gleam self-sufficiency.

**🎯 NEW: Production-Ready Features (Priority 0)**

Before beginning TypeScript cleanup, two critical features must be implemented to ensure TraeNuPI is production-ready and cross-platform:

1. **🐑 Ollama Local Model Support** - Free, offline AI fallback
2. **🔐 Cross-Platform Secret Storage** - macOS, Linux, Windows support

**See detailed plan:** [OLLAMA_AND_CROSSPLATFORM_PLAN.md](./OLLAMA_AND_CROSSPLATFORM_PLAN.md)

---

## Updated Migration Phases

### **Phase 0: Production Features (NEW - Do First!)**

**Duration:** 1-2 weeks | **Priority:** CRITICAL

| Feature | Status | Benefit |
|---------|--------|---------|
| Ollama Integration | 🆕 To Implement | Free AI, offline mode, no API needed |
| Cross-Platform Secrets | 🆕 To Implement | Works on Windows/Linux/macOS |

**Why Phase 0 first?**
- Ensures core functionality works everywhere before removing old code
- Makes product viable even without external APIs
- Addresses real user needs (privacy, cost, platform diversity)

---

## Current Architecture Analysis

### Dependency Graph (TypeScript Layer)

```
src/index.ts (MAIN ENTRY - 2938 lines!)
├── src/driver.ts
├── src/task.ts
├── src/prompts.ts
│
├── src/common/
│   ├── db.ts              ← PostgreSQL client
│   ├── db-safe.ts         ← Safe query builder
│   ├── storage.ts         ← File storage layer
│   ├── types.ts           ← Shared types
│   ├── resolve-id.ts      ← ID resolution
│   ├── knowledge.ts       ← Knowledge base (local)
│   ├── knowledge-gleam.ts ← Bridge to Gleam knowledge
│   ├── reflection-gleam.ts← Bridge to Gleam reflection
│   ├── identity-gleam.ts  ← Bridge to Gleam identity
│   ├── event-bus-gleam.ts ← Bridge to Gleam event bus
│   ├── gleam-bridge.ts    ← Main Gleam FFI bridge
│   ├── json-input.ts      ← JSON input parser
│   └── index.ts
│
├── src/trae/
│   ├── baby-ai.ts         ← CORE: PiAgent wrapper ⚠️
│   ├── pi-agent-bridge.ts ← BRIDGE TO PI ⚠️⚠️⚠️
│   ├── ai-direct.ts       ← Direct API calls (duplicate)
│   ├── baby-ai-prompt.ts  ← Prompt templates
│   ├── baby-ai-retry.ts   ← Retry logic
│   ├── baby-ai-errors.ts  ← Error definitions
│   ├── baby-ai-utils.ts   ← Cache, metrics, rate limiting
│   ├── context.ts         ← Context building
│   ├── daemon.ts          ← Daemon process manager
│   ├── reminders.ts       ← Reminder system
│   ├── mood.ts            ← Mood tracking
│   ├── bookmarks.ts       ← Bookmark system
│   ├── meeting-utils.ts   ← Meeting tools
│   ├── presence.ts        ← Presence detection
│   ├── init.ts            ← Project initialization
│   ├── skill-improver.ts  ← Skill improvement AI
│   ├── skill-importer.ts  ← Skill import from GitHub
│   └── index.ts
│
└── tests/*.test.ts        ← Test files
```

### Key Finding: **Pi Dependency Chain**

```
pi-agent-bridge.ts (IMPORTS PI)
    ↓
baby-ai.ts (USES PI AGENT)
    ↓
index.ts (IMPORTS BABY-AI)
    ↓
ALL COMMANDS DEPEND ON THIS!
```

---

## Migration Phases

### Phase 1: Immediate Cleanup (Safe Deletes)

**Target:** Remove all `pi`-dependent code that's already replaced by Pure Gleam.

#### Files to DELETE:

| File | Lines | Reason | Replacement |
|------|-------|--------|-------------|
| `src/trae/pi-agent-bridge.ts` | ~150 | **Direct pi import** | ❌ Deleted (Gleam ai_provider) |
| `src/trae/baby-ai.ts` | ~500 | Uses PiAgent | ❌ Deleted (Gleam CLI) |
| `src/trae/baby-ai-prompt.ts` | ~200 | Prompts for pi | Move to Gleam constants |
| `src/trae/baby-ai-retry.ts` | ~150 | Retry logic for pi | Already in ai_provider.gleam |
| `src/trae/baby-ai-errors.ts` | ~100 | Pi error types | Already in ai_provider.gleam |
| `src/trae/baby-ai-utils.ts` | ~300 | Cache/metrics for pi | Port to Gleam if needed |
| `src/trae/ai-direct.ts` | ~200 | Duplicate HTTP client | ❌ Deleted (Gleam http.gleam) |
| `src/trae/index.ts` | ~5 | Re-exports baby-ai | ❌ Deleted |

**Total:** ~1,600 lines of pi-dependent code removed

#### Test Files to DELETE:

| File | Reason |
|------|--------|
| `tests/baby-ai-errors.test.ts` | Tests deleted code |
| `src/trae/baby-ai-utils.test.ts` | Tests deleted code |

**Impact Analysis:**
- ✅ **Safe to delete** - All functionality exists in Gleam
- ⚠️ **Must update** `src/index.ts` imports (remove baby-ai references)
- ⚠️ **Must update** command handlers (tellme, search, daemon)

---

### Phase 2: Infrastructure Migration (Medium Effort)

**Target:** Port remaining infrastructure from TS to Gleam.

#### Priority 2A: Database Layer (Keep Temporarily)

| File | Status | Action |
|------|--------|--------|
| `src/common/db.ts` | **KEEP** | Still used by index.ts |
| `src/common/db-safe.ts` | **KEEP** | Critical for PostgreSQL |
| `src/common/resolve-id.ts` | **KEEP** | ID resolution logic |

**Future Plan:** Port to Gleam using existing `knowledge_db` pattern.

#### Priority 2B: Storage & State (Port Next)

| File | Lines | Gleam Equivalent | Effort |
|------|-------|------------------|--------|
| `src/common/storage.ts` | ~400 | New module: `traenupi_core/storage.gleam` | Medium |
| `src/common/types.ts` | ~150 | Use Gleam custom types | Low |
| `src/common/json-input.ts` | ~200 | Port to Gleam json parsing | Medium |

**Storage Module Features to Port:**
```typescript
// Current TS functions:
- loadHistory() / saveHistory()
- loadReminders() / saveReminders()
- loadBookmarks() / saveBookmarks()
- loadMoodHistory() / saveMoodHistory()
- loadState() / saveState()
- ensureDir()
```

**Gleam Implementation Plan:**
```gleam
// New: traenupi_core/src/storage.gleam
pub fn load_history() -> Result(List(ConversationItem), StorageError)
pub fn save_history(history: List(ConversationItem)) -> Result(Nil, StorageError)
pub fn load_state() -> Result(State, StorageError)
pub fn save_state(state: State) -> Result(Nil, StorageError)
// ... etc
```

#### Priority 2C: Feature Modules (Assess Individually)

| File | Functionality | Keep? | Port? |
|------|--------------|-------|-------|
| `src/trae/context.ts` | Context building | ✅ Keep | 🔄 Later |
| `src/trae/daemon.ts` | Daemon process | ✅ Keep | 🔄 Later |
| `src/trae/reminders.ts` | Reminders | ✅ Keep | 🔄 Later |
| `src/trae/mood.ts` | Mood tracking | ✅ Keep | 🔄 Later |
| `src/trae/bookmarks.ts` | Bookmarks | ✅ Keep | 🔄 Later |
| `src/trae/meeting-utils.ts` | Meeting tools | ✅ Keep | 🔄 Later |
| `src/trae/presence.ts` | Presence | ✅ Keep | 🔄 Later |
| `src/trae/init.ts` | Init project | ✅ Keep | 🔄 Later |
| `src/trae/skill-improver.ts` | Skill AI improvement | ⚠️ Review | Maybe |
| `src/trae/skill-importer.ts` | Import skills | ⚠️ Review | Maybe |

---

### Phase 3: Long-term Strategy (Low Priority)

**Target:** Complete elimination of TypeScript.

#### Final State Goal:

```
traenupi/
├── gleam/
│   ├── traenupi_cli/          ✅ COMPLETE
│   │   ├── src/
│   │   │   └── traenupi_cli.gleam
│   │   └── gleam.toml
│   │
│   ├── traenupi_core/         ✅ MOSTLY COMPLETE
│   │   ├── src/
│   │   │   ├── traenupi_core/
│   │   │   │   ├── ai_provider.gleam     ✅
│   │   │   │   ├── http.gleam            ✅
│   │   │   │   ├── knowledge_db.gleam    ✅
│   │   │   │   ├── cli.gleam             ✅
│   │   │   │   ├── storage.gleam         🆕 TO CREATE
│   │   │   │   ├── context.gleam         🆕 TO CREATE
│   │   │   │   ├── reminders.gleam       🆕 TO CREATE
│   │   │   │   └── mood.gleam            🆕 TO CREATE
│   │   │   └── *.mjs (FFI files)
│   │   └── gleam.toml
│   │
│   └── traenupi_app/ (optional web UI)
│       └── vite.config.ts
│
├── src/                       ❌ DELETED (or minimal)
│   └── index.ts               ← Just a thin wrapper?
│
├── scripts/
│   └── setup_keychain.sh      ✅
│
├── docs/
│   ├── KEYCHAIN_INTEGRATION.md ✅
│   └── MIGRATION_PURE_GLEAM.md ✅
│
└── package.json               ← Only for dev tools
```

---

## Detailed Action Items

### Week 1: Phase 1 Execution

#### Day 1-2: Delete Pi-Dependent Code

```bash
# Backup first!
cp -r src src_backup_$(date +%Y%m%d)

# Delete Phase 1 files
rm src/trae/pi-agent-bridge.ts
rm src/trae/baby-ai.ts
rm src/trae/baby-ai-prompt.ts
rm src/trae/baby-ai-retry.ts
rm src/trae/baby-ai-errors.ts
rm src/trae/baby-ai-utils.ts
rm src/trae/ai-direct.ts
rm src/trae/index.ts
rm tests/baby-ai-errors.test.ts
rm src/trae/baby-ai-utils.test.ts
```

#### Day 3: Update Main Entry Point

**Changes to `src/index.ts`:**

```diff
- import { askPi, webSearch, tellmeSync, tellmeDaemon } from "./trae/baby-ai.js";
+ // AI calls now handled by Gleam CLI
+ // Run: gleam run -- tellme "question"

# Remove tellme/search handlers or redirect to Gleam CLI
if (command === "tellme") {
-  await tellmeSync(question, useQuick, useSession);
+  console.log("Use: gleam run -- tellme \"" + question + "\"");
+  // Or spawn Gleam process
}
```

#### Day 4-5: Test & Verify

```bash
# Test all remaining commands still work
traenupi status
traenupi know test key value
traenupi know
traenupi reflect list
traenupi presence
# etc.

# Test Gleam CLI works
cd gleam/traenupi_cli
gleam run -- tellme "test"
gleam run -- know general:test value
```

---

### Week 2-3: Phase 2 Planning

#### Create New Gleam Modules

**Module: `storage.gleam`**

```gleam
// gleam/traenupi_core/src/traenupi_core/storage.gleam

import gleam/result.{type Result}
import gleam/json
import traenupi_core/http.{type HttpError}

pub type StorageError {
  FileNotFound(path: String)
  JsonParseError(error: String)
  IoError(error: String)
}

pub type ConversationItem {
  ConversationItem(
    role: String,
    content: String,
    timestamp: Int,
  )
}

pub type State {
  State(
    last_session: Option(String),
    conversation_history: List(ConversationItem),
    preferences: Dict(String, String),
  )
}

pub fn get_traenupi_dir() -> String {
  // FFI call to get home directory
  get_home_dir() <> "/.traenupi"
}

pub fn load_state() -> Result(State, StorageError) {
  let path = get_traenupi_dir() <> "/state.json"
  
  case read_file(path) {
    Ok(content) -> parse_state(content)
    Error(_) -> Ok(State(
      last_session: None,
      conversation_history: [],
      preferences: dict.new(),
    ))
  }
}

// ... more functions
```

**Module: `context.gleam`**

```gleam
// gleam/traenupi_core/src/traenupi_core/context.gleam

pub fn build_context(user_input: String) -> Context {
  let time_greeting = get_time_greeting()
  let mood = detect_mood_from_time()
  let recent_knowledge = knowledge_db.get_recent(5)
  
  Context(
    greeting: time_greeting,
    mood: mood,
    user_input: user_input,
    knowledge_context: recent_knowledge,
    timestamp: system_time(),
  )
}

pub fn build_quick_context(user_input: String) -> Context {
  // Minimal context for fast responses
  Context(
    greeting: "",
    mood: Neutral,
    user_input: user_input,
    knowledge_context: [],
    timestamp: system_time(),
  )
}
```

---

### Month 2+: Phase 3 Completion

#### Final TypeScript Removal

Once all modules ported to Gleam:

```bash
# Delete entire src/ directory
rm -rf src/

# Update package.json to only use Gleam
# Keep only devDependencies (typescript, etc. for any legacy refs)

# Final structure:
traenupi/
├── gleam/              # All source code here
├── scripts/            # Utility scripts
├── docs/               # Documentation
├── package.json        # Minimal (dev only)
└── README.md
```

---

## Risk Assessment

### High Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| **Database operations** | Data loss | Extensive testing, backup before changes |
| **Daemon process** | Breaking background tasks | Keep TS version during transition |
| **Complex features** (meetings, skills) | Regressions | Feature-by-feature migration |

### Low Risk Areas

| Area | Risk | Why Safe |
|------|------|----------|
| **Pi-dependent code** | None | Already replaced by Gleam |
| **AI provider** | None | Thoroughly tested |
| **CLI interface** | None | Working with keychain |

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] All `pi` imports removed
- [ ] Zero compilation errors
- [ ] All non-AI commands work (`know`, `reflect`, `status`, etc.)
- [ ] Gleam CLI handles all AI commands (`tellme`, `search`)
- [ ] Test suite passes (updated tests)

### Phase 2 Success Criteria
- [ ] Storage module fully ported to Gleam
- [ ] Context building in Gleam
- [ ] Reminders system in Gleam
- [ ] Mood tracking in Gleam
- [ ] 50% reduction in TS codebase size

### Phase 3 Success Criteria
- [ ] 100% Gleam codebase
- [ ] No TypeScript in production path
- [ ] `src/` directory deleted or <10 files
- [ ] Full feature parity with original

---

## Rollback Plan

If issues arise during migration:

```bash
# Quick rollback
git checkout main -- src/

# Or restore from backup
cp -r src_backup_YYYYMMDD src

# Reinstall dependencies if needed
npm install
```

---

## Timeline Summary

| Phase | Duration | Effort | Files Affected |
|-------|----------|--------|----------------|
| **Phase 0** 🆕 | 1-2 weeks | HIGH (critical features) | ~500 lines new Gleam code |
| **Phase 1** | 1 week | Low (~10 files delete) | ~1,600 lines removed |
| **Phase 2** | 2-3 weeks | Medium (new Gleam modules) | ~2,000 lines ported |
| **Phase 3** | 1-2 months | High (complete migration) | Remaining TS eliminated |

**Total Estimated Time:** 8-10 weeks for full migration (including production features)

### Updated Execution Order:

```
📅 Week 1-2:   Phase 0 - Ollama + Cross-Platform Secrets (DO THIS FIRST!)
📅 Week 3:     Phase 1 - Delete pi-dependent TypeScript
📅 Week 4-6:   Phase 2 - Port infrastructure to Gleam
📅 Week 7-10:  Phase 3 - Complete TypeScript elimination
```

---

## Decision Points

### Now (Recommended):
✅ **Execute Phase 1** - Delete pi-dependent code immediately

### After Phase 1:
🤔 **Decide on Phase 2 scope**
- Port all infrastructure? (Aggressive)
- Port only critical paths? (Conservative)
- Hybrid approach? (Recommended)

### After Phase 2:
🎯 **Evaluate Phase 3 necessity**
- Is remaining TS causing problems?
- Are there benefits to full Gleam?
- Cost/benefit analysis

---

## Next Steps

### Immediate Actions:

1. ✅ **Review this plan** - Confirm file list and priorities
2. ✅ **Create backup** - `cp -r src src_backup`
3. ✅ **Execute Phase 1 deletes** - Remove pi-dependent files
4. ✅ **Update imports** - Fix `src/index.ts`
5. ✅ **Test thoroughly** - Verify no regressions
6. ✅ **Commit changes** - Clean git history

### Questions to Decide:

1. **Should we keep `src/index.ts` as a thin wrapper?**
   - Pro: Gradual migration, easier testing
   - Con: Maintains dual codebases

2. **Priority order for Phase 2 modules?**
   - Suggestion: storage → context → reminders → mood → others

3. **Handle daemon process in Gleam or keep in TS?**
   - TS might be better for process management long-term

---

## Appendix A: File Inventory

### Complete TypeScript File List (50+ files)

**Core Application (8 files):**
- `src/index.ts` (2938 lines!) - MAIN ENTRY
- `src/driver.ts` - Task driver
- `src/task.ts` - Task management
- `src/prompts.ts` - Prompt templates

**Common Utilities (14 files):**
- `src/common/db.ts` - PostgreSQL
- `src/common/db-safe.ts` - Safe queries
- `src/common/storage.ts` - File I/O
- `src/common/types.ts` - Type definitions
- `src/common/resolve-id.ts` - ID resolution
- `src/common/knowledge.ts` - Local KB
- `src/common/knowledge-gleam.ts` - Bridge
- `src/common/reflection-gleam.ts` - Bridge
- `src/common/identity-gleam.ts` - Bridge
- `src/common/event-bus-gleam.ts` - Bridge
- `src/common/gleam-bridge.ts` - Main bridge
- `src/common/json-input.ts` - JSON parser
- `src/common/index.ts` - Re-exports
- `src/common/meeting.ts` - Meeting ops

**Trae Module (17 files):**
- `src/trae/index.ts` - Re-exports
- `src/trae/baby-ai.ts` - Pi wrapper ⚠️
- `src/trae/pi-agent-bridge.ts` - Pi bridge ⚠️⚠️⚠️
- `src/trae/ai-direct.ts` - Direct API
- `src/trae/baby-ai-prompt.ts` - Prompts
- `src/trae/baby-ai-retry.ts` - Retry
- `src/trae/baby-ai-errors.ts` - Errors
- `src/trae/baby-ai-utils.ts` - Utils
- `src/trae/context.ts` - Context
- `src/trae/daemon.ts` - Daemon
- `src/trae/reminders.ts` - Reminders
- `src/trae/mood.ts` - Mood
- `src/trae/bookmarks.ts` - Bookmarks
- `src/trae/meeting-utils.ts` - Meetings
- `src/trae/presence.ts` - Presence
- `src/trae/init.ts` - Init
- `src/trae/skill-improver.ts` - Skills AI
- `src/trae/skill-importer.ts` - Skills import

**Test Files (9 files):**
- `tests/baby-ai-errors.test.ts`
- `src/test/core.test.ts`
- `src/test/db.test.ts`
- `src/test/resolve-id.test.ts`
- `src/test/db-safe.test.ts`
- `src/test/skill-improver.test.ts`
- `src/test/storage.test.ts`
- `src/test/task.test.ts`
- `src/test/driver.test.ts`
- `src/test/prompts.test.ts`
- `src/trae/baby-ai-utils.test.ts`

**Config (1 file):**
- `gleam/traenupi_app/vite.config.ts`

**Total: 50 TypeScript files**

---

## Appendix B: Import Dependency Map

### Critical Path (Pi → Index):

```
pi-agent-bridge.ts
  ↑ IMPORTS: pi (external package)
  ↓ USED BY: baby-ai.ts

baby-ai.ts
  ↑ IMPORTS: pi-agent-bridge, baby-ai-*, utils, retry, errors
  ↓ EXPORTS: askPi, webSearch, tellmeSync, tellmeDaemon
  ↓ USED BY: src/index.ts (MAIN!)

index.ts
  ↑ IMPORTS: baby-ai (CRITICAL!), common/*, trae/*
  ↓ IS: Entry point for ALL commands
```

**Breaking this chain = removing pi dependency**

---

## Appendix C: Gleam Module Status

### Already Implemented ✅

| Module | File | Status | Lines |
|--------|------|--------|-------|
| AI Provider | `ai_provider.gleam` | ✅ Complete | ~400 |
| HTTP Client | `http.gleam` | ✅ Complete | ~250 |
| Knowledge DB | `knowledge_db.gleam` | ✅ Complete | ~300 |
| CLI Interface | `cli.gleam` + `traenupi_cli.gleam` | ✅ Complete | ~350 |
| Validation | `validation.gleam` | ✅ Complete | ~150 |
| JSON Utils | `json.gleam`, `jsonx.gleam` | ✅ Complete | ~200 |
| Event Bus | `event_bus.gleam` | ✅ Complete | ~180 |
| Identity | `identity.gleam` | ✅ Complete | ~120 |
| Reflection | `reflection.gleam` | ✅ Complete | ~200 |
| State Management | `state.gleam` | ✅ Complete | ~100 |
| Utils | `utils.mjs` | ✅ Complete | ~150 |

**Total Gleam Code: ~2,400 lines**

### Need to Create 🆕

| Module | Priority | Est. Lines | Source (TS) |
|--------|----------|------------|-------------|
| `storage.gleam` | HIGH | ~400 | `src/common/storage.ts` |
| `context.gleam` | HIGH | ~250 | `src/trae/context.ts` |
| `reminders.gleam` | MEDIUM | ~200 | `src/trae/reminders.ts` |
| `mood.gleam` | LOW | ~150 | `src/trae/mood.ts` |
| `bookmarks.gleam` | LOW | ~120 | `src/trae/bookmarks.ts` |
| `presence.gleam` | LOW | ~180 | `src/trae/presence.ts` |
| `daemon.gleam` | LOW | ~300 | `src/trae/daemon.ts` |
| `meeting.gleam` | LOW | ~350 | `src/trae/meeting-utils.ts` |
| `skill_improver.gleam` | LOW | ~400 | `src/trae/skill-improver.ts` |
| `skill_importer.gleam` | LOW | ~250 | `src/trae/skill-importer.ts` |

**Estimated New Gleam Code: ~2,600 lines**

---

## Conclusion

**TraeNuPI is ready for Phase 0 execution (NEW PRIORITY).**

The Pure Gleam implementation has successfully replaced all critical AI functionality previously dependent on `pi`. **However, before removing old TypeScript code, we must first implement production-ready features:**

1. ✅ **Ollama Integration** - Ensures AI works offline and for free
2. ✅ **Cross-Platform Secrets** - Makes TraeNuPI work on Windows/Linux

**Updated Recommendation:** 
- **Execute Phase 0 FIRST** (1-2 weeks) - Add Ollama + cross-platform support
- **Then execute Phase 1** - Remove pi-dependent TypeScript
- This order ensures we have a working product at every stage

**Key Benefits of New Order:**
- 🐑 Users get free/offline AI immediately
- 🔐 Windows/Linux users can use TraeNuPI day 1
- 🧪 More testing surface before breaking changes
- 📈 Faster time-to-value for end users

---

## Related Documents

- [OLLAMA_AND_CROSSPLATFORM_PLAN.md](./OLLAMA_AND_CROSSPLATFORM_PLAN.md) - Detailed feature specs
- [KEYCHAIN_INTEGRATION.md](./KEYCHAIN_INTEGRATION.md) - macOS security details
- [MIGRATION_PURE_GLEAM.md](./MIGRATION_PURE_GLEAM.md) - Original migration guide

---

*Document Version: 1.0*
*Created: 2026-05-10*
*Status: Ready for Review*
*Next: Execute Phase 1*
