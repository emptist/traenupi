# Database Structure Difference Report

## Executive Summary

**CRITICAL: The two databases have significant structural differences that were not properly analyzed before migration attempt.**

- **Nezha Database**: 99 tables
- **Psypi Database**: 111 tables
- **Common Tables**: Most tables exist in both, but with different column structures

## Detailed Table Structure Comparison

### 1. Meetings Table

#### Column Count
- **Nezha**: 8 columns
- **Psypi**: 9 columns

#### Column Differences
| Column Name | Nezha | Psypi | Notes |
|-------------|-------|-------|-------|
| id | uuid | uuid | ✓ Same |
| topic | text | text | ✓ Same |
| status | text | text | ✓ Same |
| created_by | text | text | ✓ Same |
| created_at | timestamptz | timestamptz | ✓ Same |
| consensus | text | text | ✓ Same |
| consensus_at | timestamptz | timestamptz | ✓ Same |
| metadata | jsonb | jsonb | ✓ Same |
| **project_id** | ❌ Missing | uuid | ⚠️ Psypi only |

**Migration Impact**: 
- Can migrate 8 common columns
- `project_id` will be NULL in psypi (has default or allows NULL)
- **Risk Level**: LOW

---

### 2. Meeting_Opinions Table

#### Column Count
- **Nezha**: 7 columns
- **Psypi**: 7 columns

#### Column Differences
| Column Name | Nezha | Psypi | Notes |
|-------------|-------|-------|-------|
| id | uuid | uuid | ✓ Same |
| meeting_id | uuid | uuid | ✓ Same |
| author | text | text | ✓ Same |
| perspective | text | text | ✓ Same |
| position | text | text | ✓ Same |
| reasoning | text | text | ✓ Same |
| created_at | timestamptz | timestamptz | ✓ Same |

**Migration Impact**: 
- All columns match
- **Risk Level**: NONE

---

### 3. Issues Table

#### Column Count
- **Nezha**: 30 columns
- **Psypi**: 24 columns

#### Column Differences

**Common Columns (24)**:
| Column Name | Nezha Type | Psypi Type | Match |
|-------------|------------|------------|-------|
| id | uuid | uuid | ✓ |
| title | text | text | ✓ |
| description | text | text | ✓ |
| issue_type | text | text | ✓ |
| severity | text | text | ✓ |
| status | text | text | ✓ |
| created_by | text | text | ✓ |
| discovered_at | timestamptz | timestamptz | ✓ |
| related_issue_id | uuid | uuid | ✓ |
| task_id | uuid | uuid | ✓ |
| resolution | text | text | ✓ |
| resolved_at | timestamptz | timestamptz | ✓ |
| resolved_by | text | text | ✓ |
| tags | text[] | text[] | ✓ |
| metadata | jsonb | jsonb | ✓ |
| created_at | timestamptz | timestamptz | ✓ |
| updated_at | timestamptz | timestamptz | ✓ |
| assignee | text | text | ✓ |
| assignee_type | text | text | ✓ |
| review_id | uuid | uuid | ✓ |
| dlq_id | uuid | uuid | ✓ |
| viewers | text[] | text[] | ✓ |
| milestone_id | uuid | uuid | ✓ |
| related_review_id | uuid | uuid | ✓ |

**Nezha Only Columns (6)**:
| Column Name | Type | Data Loss Risk |
|-------------|------|----------------|
| discovered_by | text | ⚠️ MEDIUM - Who discovered the issue |
| git_hash | text | ⚠️ MEDIUM - Git context |
| git_branch | text | ⚠️ MEDIUM - Git context |
| environment | text | ⚠️ MEDIUM - Runtime environment |
| reported_by | text | ⚠️ LOW - Reporter info |
| source | text | ⚠️ LOW - Issue source |

**Migration Impact**: 
- Can migrate 24 common columns
- Will lose 6 columns of data (discovered_by, git_hash, git_branch, environment, reported_by, source)
- **Risk Level**: MEDIUM - Data loss for git context and discovery information

---

### 4. Tasks Table

#### Column Count
- **Nezha**: 56 columns
- **Psypi**: 59 columns

#### Critical Type Mismatch

| Column Name | Nezha Type | Psypi Type | Issue |
|-------------|------------|------------|-------|
| **is_long_running** | **integer** | **boolean** | ⚠️ **INCOMPATIBLE** |

This is a **CRITICAL** issue that caused the migration failure.

#### Common Columns Analysis

**Matching Columns** (need to verify all 56+ columns):
- Most columns match in name and type
- Column order is different between databases
- Some columns exist in psypi but not in nezha

**Psypi Only Columns**:
| Column Name | Type | Notes |
|-------------|------|-------|
| template_id | uuid | Task template reference |
| result_tag | text | Result encryption tag |
| result_salt | text | Result encryption salt |
| encrypted_at | timestamptz | Encryption timestamp |
| pause_reason | text | Why task is paused |
| paused_until | timestamptz | When to resume |
| progress_percent | integer | Task progress (0-100) |
| last_progress_at | timestamptz | Last progress update |

**Migration Impact**: 
- Type mismatch on `is_long_running` must be resolved
- Column order must be explicitly specified
- **Risk Level**: HIGH - Type incompatibility

---

## Root Cause Analysis

### Why This Was Missed

1. **Insufficient Initial Research**: Only checked meetings table structure, assumed others were identical
2. **No Systematic Comparison**: Did not compare all tables column-by-column
3. **No Type Checking**: Did not verify data types match, only checked column names
4. **Assumption-Based Planning**: Assumed databases were "compatible enough" without verification

### What Should Have Been Done

1. **Full Schema Export**: Export complete schema for all relevant tables from both databases
2. **Column-by-Column Comparison**: Compare each column's name, type, constraints, and defaults
3. **Data Type Compatibility Matrix**: Create matrix showing which types can be safely converted
4. **Migration Impact Assessment**: Document exactly what data would be lost or transformed
5. **Test Migration**: Run migration on test data first to catch issues

---

## Recommendations

### Option 1: Minimal Migration (Recommended)
- Migrate only meetings and meeting_opinions (low risk)
- Skip issues and tasks migration
- Start fresh with issues and tasks in psypi
- Keep old data in nezha for reference

### Option 2: Partial Migration with Data Loss
- Migrate issues with 6 columns of data loss
- Fix tasks table type mismatch (convert integer to boolean)
- Accept that some context will be lost
- Document what was lost

### Option 3: Schema Unification (Not Recommended)
- Coordinate with psypi team to add missing columns
- Requires changes to psypi application code
- Risk of breaking psypi functionality
- Time-consuming and complex

### Option 4: Keep Separate Databases
- TraeNuPI continues using nezha database
- No migration needed
- Simplest and safest option
- But defeats the purpose of consolidation

---

## Lessons Learned

1. **Never Assume Compatibility**: Always verify, never assume
2. **Check All Tables**: Don't sample, check every table
3. **Verify Data Types**: Column names matching is not enough
4. **Test Before Migrating**: Always test with sample data first
5. **Document Everything**: Keep detailed records of all differences

---

## Next Steps

1. **Stop Current Migration**: Do not proceed until decision is made
2. **Present Options to User**: Let user decide which option to pursue
3. **If Proceeding**: Fix migration script based on chosen option
4. **If Not Proceeding**: Revert database config changes
5. **Update Documentation**: Document the decision and rationale

---

**Report Generated**: 2026-05-05
**Author**: AI Assistant (acknowledging mistake)
**Status**: Migration Paused - Awaiting User Decision
