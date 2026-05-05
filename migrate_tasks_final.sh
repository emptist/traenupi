#!/bin/bash
# TraeNuPI Tasks Migration Script (Final Fix)
# Only migrate common columns between nezha and psypi
# Date: 2026-05-05

set -e

echo "=== TraeNuPI Tasks Migration (Final Fix) ==="
echo ""

# Get common columns (intersection of both databases)
echo "Step 1: Finding common columns..."
psql -d nezha -t -A -c "
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY column_name;
" | sort > /tmp/nezha_task_cols.txt

psql -d psypi -t -A -c "
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY column_name;
" | sort > /tmp/psypi_task_cols.txt

# Find common columns
comm -12 /tmp/nezha_task_cols.txt /tmp/psypi_task_cols.txt > /tmp/common_task_cols.txt

echo "  Common columns count: $(wc -l < /tmp/common_task_cols.txt | tr -d ' ')"

# Build column list for psypi order
echo "Step 2: Building column list in psypi order..."
psql -d psypi -t -A -c "
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
" > /tmp/psypi_ordered_cols.txt

# Filter to only common columns
grep -F -f /tmp/common_task_cols.txt /tmp/psypi_ordered_cols.txt > /tmp/final_cols.txt

# Build comma-separated list
COMMON_COLS=$(cat /tmp/final_cols.txt | tr '\n' ',' | sed 's/,$//')

echo "  Columns to migrate: $COMMON_COLS"

# Export tasks with common columns only
echo "Step 3: Exporting TraeNuPI tasks with common columns..."
psql -d nezha -c "COPY (SELECT $COMMON_COLS FROM tasks WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%') TO STDOUT WITH CSV HEADER" > /tmp/traenupi_tasks_common.csv
echo "  Exported $(wc -l < /tmp/traenupi_tasks_common.csv | tr -d ' ') lines"

# Import tasks to psypi
echo "Step 4: Importing tasks to psypi..."
psql -d psypi << EOF
CREATE TEMP TABLE temp_tasks AS 
SELECT $COMMON_COLS FROM tasks WHERE false;

\copy temp_tasks FROM '/tmp/traenupi_tasks_common.csv' WITH CSV HEADER;

INSERT INTO tasks ($COMMON_COLS)
SELECT $COMMON_COLS FROM temp_tasks
ON CONFLICT (id) DO NOTHING;
EOF
echo "  Imported successfully"

# Verify migration
echo "Step 5: Verifying migration..."
TASKS_COUNT=$(psql -d psypi -t -c "SELECT COUNT(*) FROM tasks WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%';")

echo ""
echo "=== Migration Summary ==="
echo "Tasks migrated: $TASKS_COUNT"
echo ""

# Cleanup
rm -f /tmp/nezha_task_cols.txt /tmp/psypi_task_cols.txt /tmp/common_task_cols.txt /tmp/psypi_ordered_cols.txt /tmp/final_cols.txt /tmp/traenupi_tasks_common.csv
echo "Temporary files cleaned up"
echo ""
echo "✓ Tasks migration completed successfully!"
