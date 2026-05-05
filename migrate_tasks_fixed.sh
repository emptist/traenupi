#!/bin/bash
# TraeNuPI Tasks Migration Script (Fixed)
# Fix column order mismatch issue
# Date: 2026-05-05

set -e

echo "=== TraeNuPI Tasks Migration (Fixed) ==="
echo ""

# Get column names from psypi (to match the order)
echo "Step 1: Getting column order from psypi..."
COLUMNS=$(psql -d psypi -t -A -c "
SELECT string_agg(column_name, ',' ORDER BY ordinal_position)
FROM information_schema.columns
WHERE table_name = 'tasks' AND table_schema = 'public';
")
echo "  Psypi columns: $COLUMNS"

# Export tasks with explicit column order matching psypi
echo "Step 2: Exporting TraeNuPI tasks with correct column order..."
psql -d nezha -c "COPY (SELECT $COLUMNS FROM tasks WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%') TO STDOUT WITH CSV HEADER" > /tmp/traenupi_tasks_fixed.csv
echo "  Exported $(wc -l < /tmp/traenupi_tasks_fixed.csv) lines"

# Import tasks to psypi
echo "Step 3: Importing tasks to psypi..."
psql -d psypi << 'EOF'
CREATE TEMP TABLE temp_tasks AS 
SELECT * FROM tasks WHERE false;

\copy temp_tasks FROM '/tmp/traenupi_tasks_fixed.csv' WITH CSV HEADER;

INSERT INTO tasks
SELECT * FROM temp_tasks
ON CONFLICT (id) DO NOTHING;
EOF
echo "  Imported successfully"

# Verify migration
echo "Step 4: Verifying migration..."
TASKS_COUNT=$(psql -d psypi -t -c "SELECT COUNT(*) FROM tasks WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%';")

echo ""
echo "=== Migration Summary ==="
echo "Tasks migrated: $TASKS_COUNT"
echo ""

# Cleanup
rm -f /tmp/traenupi_tasks_fixed.csv
echo "Temporary files cleaned up"
echo ""
echo "✓ Tasks migration completed successfully!"
