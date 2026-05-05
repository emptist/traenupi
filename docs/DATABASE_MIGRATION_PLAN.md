# TraeNuPI Database Migration Plan

## Overview
Migrate TraeNuPI from `nezha` database to `psypi` database to make TraeNuPI self-contained.

## Current State Analysis

### Database Configuration
- **Current Database**: `nezha`
- **Target Database**: `psypi`
- **Files to Update**:
  - `/Users/jk/gits/hub/tools_ai/traenupi/src/common/db.ts` (line 15)
  - `/Users/jk/gits/hub/tools_ai/traenupi/src/common/db-safe.ts` (line 16)

### Tables Used by TraeNuPI
1. **memory** - Knowledge storage
   - Columns used: `id`, `content`, `source`, `tags`, `created_at`, `importance`, `agent_id`
   - ✅ Compatible with psypi (has all required columns)

2. **tasks** - Task management
   - Columns used: `id`, `status`
   - ✅ Compatible with psypi (has all required columns)

3. **meetings** - Meeting management
   - Columns used: `id`, `topic`, `status`, `created_by`, `created_at`, `updated_at`
   - ✅ Compatible with psypi (has all required columns)

4. **meeting_opinions** - Meeting opinions
   - Columns used: `id`, `meeting_id`, `author`, `perspective`, `position`, `created_at`
   - ✅ Compatible with psypi (has all required columns)

5. **agent_sessions** - Agent presence
   - Columns used: `id`, `status`, `agent_type`, `last_heartbeat`, `working_on`, `started_at`
   - ✅ Compatible with psypi (has all required columns)

6. **agent_moods** - Agent moods
   - Columns used: `agent_id`, `mood`, `timestamp`
   - ✅ Compatible with psypi (has all required columns)

7. **skills** - Skills
   - Columns used: `id`, `name`, `description`, `trigger_phrases`, `anti_patterns`, `quick_start`, `examples`, `content`, `instructions`, `category`, `tags`, `project_id`
   - ✅ Compatible with psypi (has all required columns)

8. **inter_reviews** - Inter-reviews
   - Columns used: `id`, `task_id`, `reviewer_id`, `requested_at`, `commit_hash`, `review_context`, `status`, `summary`, `reviewed_by`, `completed_at`
   - ✅ Compatible with psypi (has all required columns)

9. **reflections** - Reflections
   - Columns used: `id`, `task_id`, `summary`, `learnings`, `issues`, `suggestions`, `praise`, `created_at`
   - ✅ Compatible with psypi (has all required columns)

10. **table_documentation** - Table documentation
    - Columns used: `table_name`, `purpose`, `usage_context`, `key_columns`, `cli_commands`, `example_queries`
    - ✅ Compatible with psypi (has all required columns)

## Migration Plan

### Phase 1: Preparation (COMPLETED)
- [x] Analyze current database usage
- [x] Verify psypi database has all required tables
- [x] Verify table structures are compatible
- [x] Document all tables and columns used

### Phase 2: Code Updates (IN PROGRESS)
- [ ] Update `db.ts` to use `psypi` database
- [ ] Update `db-safe.ts` to use `psypi` database
- [ ] Update any hardcoded database references
- [ ] Update environment variable documentation

### Phase 3: Testing
- [ ] Run all existing tests with psypi database
- [ ] Test knowledge storage (`traenupi know`)
- [ ] Test task management
- [ ] Test meeting features
- [ ] Test agent presence
- [ ] Test skills
- [ ] Test inter-reviews
- [ ] Test reflections

### Phase 4: Clean Start (SIMPLIFIED)
- [x] Decision: Start fresh in psypi database
- [ ] Identify traenupi-specific data that must be migrated (if any)
- [ ] Create migration scripts for essential data only
- [ ] Most data will remain in nezha as historical record
- [ ] TraeNuPI will start with clean slate in psypi

### Phase 5: Deployment
- [ ] Update documentation
- [ ] Update README
- [ ] Update CHANGELOG
- [ ] Commit changes
- [ ] Test in production-like environment

### Phase 6: Rollback Plan
- [ ] Keep nezha database configuration as fallback
- [ ] Document rollback procedure
- [ ] Test rollback procedure

## Compatibility Notes

### ✅ Fully Compatible Tables
All tables used by TraeNuPI exist in psypi database with compatible structures.

### ⚠️ Additional Columns in psypi
Many tables in psypi have additional columns that TraeNuPI doesn't use:
- `project_id` - for multi-project support
- `metadata` - for additional data
- `embedding` - for vector search
- etc.

These are **safe** - TraeNuPI can simply ignore them.

### 🔒 Row-Level Security
Some tables in psypi have row-level security policies:
- `memory` has `memory_project_isolation` policy

**Action Required**: Verify if TraeNuPI needs to set `app.current_project_id` or if it can bypass this policy.

## Risks and Mitigations

### Risk 1: Data Loss
- **Mitigation**: Backup both databases before migration
- **Mitigation**: Test migration on a copy first

### Risk 2: Breaking psypi
- **Mitigation**: Verify TraeNuPI doesn't modify table structures
- **Mitigation**: Test all psypi features after migration

### Risk 3: Performance Impact
- **Mitigation**: Monitor query performance
- **Mitigation**: Add indexes if needed (but don't modify existing ones)

### Risk 4: Row-Level Security Issues
- **Mitigation**: Test all queries with psypi's security policies
- **Mitigation**: Configure TraeNuPI to work with psypi's security model

## Decision Points

### Decision 1: Should TraeNuPI use project_id?
- **Option A**: TraeNuPI sets a specific project_id for all its data
- **Option B**: TraeNuPI leaves project_id NULL
- **Option C**: TraeNuPI bypasses row-level security

**Recommendation**: Option A - Create a dedicated TraeNuPI project in psypi

### Decision 2: Should we migrate existing data?
- **Option A**: Migrate all data from nezha to psypi
- **Option B**: Start fresh in psypi ✅ **SELECTED**
- **Option C**: Keep historical data in nezha, new data in psypi

**Decision**: Option B - Clean new start for TraeNuPI
- Leave outdated data in nezha database
- Only migrate traenupi-specific data if needed
- Start fresh with clean, relevant data

## Next Steps

1. **STOP**: Do not modify code yet
2. **DISCUSS**: Review this plan with psypi team
3. **DECIDE**: Make decisions on the decision points above
4. **TEST**: Set up a test environment
5. **EXECUTE**: Follow the migration plan

## Questions for psypi Team

1. Does psypi use row-level security on all tables?
2. Should TraeNuPI have its own project_id?
3. Are there any tables that psypi modifies that TraeNuPI should avoid?
4. What's the best way to coordinate this migration?
5. Should we schedule a maintenance window for the migration?

## Conclusion

The migration is **technically feasible** and **safe** because:
- All required tables exist in psypi
- Table structures are compatible
- No schema changes are needed
- **Clean start approach minimizes risk**

**Migration Strategy**: Clean new start
- Leave outdated data in nezha database
- Start fresh in psypi with only essential data
- Simpler, safer, and cleaner approach

**Next Action**: Coordinate with psypi team to proceed with the migration.
