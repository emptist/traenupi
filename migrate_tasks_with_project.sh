#!/bin/bash
# TraeNuPI Tasks Migration Script (With Project Mapping)
# Map nezha project_id to psypi project_id
# Date: 2026-05-05

set -e

echo "=== TraeNuPI Tasks Migration (With Project Mapping) ==="
echo ""

# Get psypi project ID
PSYPI_PROJECT_ID=$(psql -d psypi -t -A -c "SELECT id FROM projects WHERE name = 'psypi' LIMIT 1;")
echo "Psypi project ID: $PSYPI_PROJECT_ID"

# Get columns from both databases
echo "Step 1: Getting column lists..."
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

echo "  Common columns: $(wc -l < /tmp/common_task_cols.txt | tr -d ' ')"

# Build column list in psypi's order
echo "Step 2: Building column list in psypi order..."
psql -d psypi -t -A -c "
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'tasks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
" > /tmp/psypi_ordered_cols.txt

# Build the final column list
> /tmp/final_cols.txt
while IFS= read -r col; do
    if grep -q "^${col}$" /tmp/common_task_cols.txt; then
        echo "$col" >> /tmp/final_cols.txt
    fi
done < /tmp/psypi_ordered_cols.txt

# Build comma-separated list
COMMON_COLS=$(cat /tmp/final_cols.txt | tr '\n' ',' | sed 's/,$//')

echo "  Columns to migrate: $(wc -l < /tmp/final_cols.txt | tr -d ' ')"

# Export tasks with common columns only
echo "Step 3: Exporting TraeNuPI tasks..."
psql -d nezha -c "COPY (SELECT $COMMON_COLS FROM tasks WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%') TO STDOUT WITH CSV HEADER" > /tmp/traenupi_tasks_common.csv
echo "  Exported $(wc -l < /tmp/traenupi_tasks_common.csv | tr -d ' ') lines"

# Import tasks to psypi with project_id mapping
echo "Step 4: Importing tasks to psypi..."
psql -d psypi << EOF
CREATE TEMP TABLE temp_tasks AS 
SELECT $COMMON_COLS FROM tasks WHERE false;

\copy temp_tasks FROM '/tmp/traenupi_tasks_common.csv' WITH CSV HEADER;

-- Update project_id to psypi's project ID
UPDATE temp_tasks SET project_id = '$PSYPI_PROJECT_ID' WHERE project_id IS NOT NULL;

-- Insert with conflict handling
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
