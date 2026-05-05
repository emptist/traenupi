# Database Migration Execution Plan

## 🎯 Objective
Migrate TraeNuPI from 'nezha' database to 'psypi' database using clean start strategy.

## ⚠️ Critical Principles
1. **NO DATA MIGRATION** - Clean start in psypi
2. **BACKUP FIRST** - Backup both databases before any changes
3. **TEST THOROUGHLY** - Test each feature after migration
4. **ROLLBACK READY** - Keep rollback plan ready
5. **USER APPROVAL** - Get approval before each major step

## 📋 Pre-Flight Checks

### Check 1: Database Access
```bash
# Verify access to both databases
psql -d nezha -c "SELECT count(*) FROM memory;"
psql -d psypi -c "SELECT count(*) FROM memory;"
```

### Check 2: Current State
```bash
# Check current traenupi data in nezha
psql -d nezha -c "SELECT source, count(*) FROM memory WHERE source LIKE '%traenupi%' GROUP BY source;"
psql -d nezha -c "SELECT count(*) FROM meetings;"
psql -d nezha -c "SELECT count(*) FROM tasks;"
```

### Check 3: psypi Readiness
```bash
# Verify psypi has all required tables
psql -d psypi -c "\dt"
psql -d psypi -c "\d memory"
psql -d psypi -c "\d meetings"
psql -d psypi -c "\d tasks"
```

### Check 4: Backup Databases
```bash
# Create backups
pg_dump nezha > ~/backup_nezha_$(date +%Y%m%d_%H%M%S).sql
pg_dump psypi > ~/backup_psypi_$(date +%Y%m%d_%H%M%S).sql
```

## 🔧 Execution Steps

### Step 1: Identify All Database References
**Action**: Search codebase for database references
**Files to check**:
- `src/common/db.ts` (line 15)
- `src/common/db-safe.ts` (line 16)
- Any other files with hardcoded 'nezha'

**Command**:
```bash
grep -r "nezha" src/ --include="*.ts" --include="*.js"
grep -r "database.*=.*'nezha'" src/ --include="*.ts" --include="*.js"
```

**Validation**: List all files that need changes

### Step 2: Create Migration Branch
**Action**: Create git branch for migration work
**Command**:
```bash
git checkout -b database-migration-psypi
git push -u origin database-migration-psypi
```

**Validation**: Branch created and pushed

### Step 3: Update Database Configuration
**Action**: Change database name from 'nezha' to 'psypi'

**File 1: src/common/db.ts**
```typescript
// BEFORE (line 15)
const DB_NAME = "nezha";

// AFTER
const DB_NAME = "psypi";
```

**File 2: src/common/db-safe.ts**
```typescript
// BEFORE (line 16)
const DB_NAME = "nezha";

// AFTER
const DB_NAME = "psypi";
```

**Validation**: 
- Build passes: `npm run build`
- No TypeScript errors

### Step 4: Update Documentation
**Action**: Update all documentation references

**Files to update**:
- README.md
- docs/DATABASE_MIGRATION_PLAN.md
- Any other docs mentioning 'nezha' database

**Validation**: All docs updated and committed

### Step 5: Test Each Feature
**Action**: Test all traenupi features with psypi database

**Test 1: Knowledge Storage**
```bash
traenupi know test_key test_value
traenupi know
traenupi know search test
```

**Test 2: Meetings**
```bash
traenupi meeting
# Create a test meeting
# Add opinions
# View meeting
```

**Test 3: Tasks**
```bash
traenupi tasks
# Test task operations
```

**Test 4: Agent Presence**
```bash
traenupi presence
traenupi status set coding "Testing migration"
```

**Test 5: Skills**
```bash
traenupi skill scan
traenupi skill score
```

**Test 6: Reflections**
```bash
traenupi reflect list
# Test reflection creation
```

**Test 7: Inter-reviews**
```bash
traenupi reviews
# Test review operations
```

**Validation**: All features work correctly

### Step 6: Verify Data Isolation
**Action**: Ensure TraeNuPI doesn't interfere with psypi data

**Commands**:
```bash
# Check that TraeNuPI only creates its own data
psql -d psypi -c "SELECT source, count(*) FROM memory GROUP BY source;"
psql -d psypi -c "SELECT created_by, count(*) FROM meetings GROUP BY created_by;"
```

**Validation**: No unexpected data in psypi

### Step 7: Performance Testing
**Action**: Verify performance is acceptable

**Tests**:
- Knowledge search speed
- Meeting creation speed
- Query response times

**Validation**: Performance is acceptable

### Step 8: Final Validation
**Action**: Comprehensive system check

**Checklist**:
- [ ] All tests pass
- [ ] All features work
- [ ] No data corruption
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] No interference with psypi

### Step 9: Commit and Push
**Action**: Commit all changes

**Command**:
```bash
git add -A
git commit -m "Migrate TraeNuPI from nezha to psypi database

- Updated db.ts to use psypi database
- Updated db-safe.ts to use psypi database
- Clean start strategy: no data migration
- All features tested and working
- Documentation updated"

git push origin database-migration-psypi
```

**Validation**: Changes committed and pushed

### Step 10: Merge to Main
**Action**: Merge migration branch to main

**Command**:
```bash
git checkout main
git merge database-migration-psypi
git push origin main
```

**Validation**: Merged successfully

## 🔄 Rollback Plan

### Rollback Scenario 1: Before Commit
**When**: During testing, before committing changes
**Action**: 
```bash
git checkout src/common/db.ts
git checkout src/common/db-safe.ts
```

### Rollback Scenario 2: After Commit, Before Merge
**When**: After committing to migration branch
**Action**:
```bash
git checkout main
git branch -D database-migration-psypi
```

### Rollback Scenario 3: After Merge
**When**: After merging to main
**Action**:
```bash
git revert <merge-commit-hash>
git push origin main
```

### Rollback Scenario 4: Database Issues
**When**: Data corruption or other database issues
**Action**:
```bash
# Restore from backup
psql -d psypi < ~/backup_psypi_YYYYMMDD_HHMMSS.sql
# Revert code changes
git revert <merge-commit-hash>
```

## 📊 Success Criteria

### Must Have
- [ ] All traenupi features work with psypi database
- [ ] No data loss in psypi
- [ ] No interference with psypi's existing data
- [ ] Performance is acceptable
- [ ] All tests pass

### Should Have
- [ ] Documentation is complete
- [ ] Rollback procedures are tested
- [ ] Migration is reversible

### Nice to Have
- [ ] Migration script is reusable
- [ ] Performance improvements
- [ ] Better error handling

## 🚨 Risk Mitigation

### Risk 1: Breaking psypi
**Mitigation**: 
- Test in isolated environment first
- Monitor psypi's functionality during testing
- Have rollback plan ready

### Risk 2: Data Loss
**Mitigation**:
- Backup both databases before migration
- Use clean start strategy (no data migration)
- Test restore procedures

### Risk 3: Performance Degradation
**Mitigation**:
- Monitor query performance
- Check for missing indexes
- Coordinate with psypi team if needed

### Risk 4: Feature Breakage
**Mitigation**:
- Test each feature thoroughly
- Have comprehensive test suite
- Document any issues

## 📞 Coordination Points

### Before Starting
- [ ] Get user approval for migration plan
- [ ] Verify psypi team is aware
- [ ] Schedule maintenance window if needed

### During Migration
- [ ] Report progress at each step
- [ ] Get approval before major changes
- [ ] Document any issues

### After Migration
- [ ] Verify all features work
- [ ] Get user sign-off
- [ ] Update documentation

## 🎯 Next Actions

1. **WAIT** for user approval of this execution plan
2. **EXECUTE** pre-flight checks
3. **PROCEED** with Step 1 only after approval
4. **REPORT** progress at each step
5. **GET APPROVAL** before merging to main

## 📝 Notes

- This is a **clean start** migration - no data will be moved from nezha to psypi
- Old data will remain in nezha database as historical record
- TraeNuPI will start fresh in psypi with clean data
- This approach minimizes risk and complexity
