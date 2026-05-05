#!/bin/bash
# TraeNuPI Data Migration Script
# Migrate TraeNuPI-specific data from nezha to psypi
# Date: 2026-05-05

set -e

echo "=== TraeNuPI Data Migration ==="
echo ""

# Step 1: Export TraeNuPI meetings from nezha (only common columns)
echo "Step 1: Exporting TraeNuPI meetings..."
psql -d nezha -c "COPY (SELECT id, topic, status, created_by, created_at, consensus, consensus_at, metadata FROM meetings WHERE created_by LIKE '%traenupi%' OR created_by LIKE '%trae-traenupi%') TO STDOUT WITH CSV HEADER" > /tmp/traenupi_meetings.csv
echo "  Exported $(wc -l < /tmp/traenupi_meetings.csv) lines"

# Step 2: Export TraeNuPI meeting opinions from nezha
echo "Step 2: Exporting TraeNuPI meeting opinions..."
psql -d nezha -c "COPY (SELECT * FROM meeting_opinions WHERE author LIKE '%traenupi%' OR author LIKE '%trae-traenupi%') TO STDOUT WITH CSV HEADER" > /tmp/traenupi_opinions.csv
echo "  Exported $(wc -l < /tmp/traenupi_opinions.csv) lines"

# Step 3: Export TraeNuPI issues from nezha (only common columns)
echo "Step 3: Exporting TraeNuPI issues..."
psql -d nezha -c "COPY (SELECT id, title, description, issue_type, severity, status, created_by, discovered_at, related_issue_id, task_id, resolution, resolved_at, resolved_by, tags, metadata, created_at, updated_at, assignee, assignee_type, review_id, dlq_id, viewers, milestone_id, related_review_id FROM issues WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%') TO STDOUT WITH CSV HEADER" > /tmp/traenupi_issues.csv
echo "  Exported $(wc -l < /tmp/traenupi_issues.csv) lines"

# Step 4: Export TraeNuPI tasks from nezha
echo "Step 4: Exporting TraeNuPI tasks..."
psql -d nezha -c "COPY (SELECT * FROM tasks WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%') TO STDOUT WITH CSV HEADER" > /tmp/traenupi_tasks.csv
echo "  Exported $(wc -l < /tmp/traenupi_tasks.csv) lines"

# Step 5: Import meetings to psypi (using temp table to handle duplicates)
echo "Step 5: Importing meetings to psypi..."
psql -d psypi << 'EOF'
CREATE TEMP TABLE temp_meetings AS 
SELECT id, topic, status, created_by, created_at, consensus, consensus_at, metadata 
FROM meetings 
WHERE false;

\copy temp_meetings FROM '/tmp/traenupi_meetings.csv' WITH CSV HEADER;

INSERT INTO meetings (id, topic, status, created_by, created_at, consensus, consensus_at, metadata)
SELECT id, topic, status, created_by, created_at, consensus, consensus_at, metadata 
FROM temp_meetings
ON CONFLICT (id) DO NOTHING;
EOF
echo "  Imported successfully"

# Step 6: Import meeting opinions to psypi (using temp table to handle duplicates)
echo "Step 6: Importing meeting opinions to psypi..."
psql -d psypi << 'EOF'
CREATE TEMP TABLE temp_opinions AS 
SELECT * FROM meeting_opinions WHERE false;

\copy temp_opinions FROM '/tmp/traenupi_opinions.csv' WITH CSV HEADER;

INSERT INTO meeting_opinions
SELECT * FROM temp_opinions
ON CONFLICT (id) DO NOTHING;
EOF
echo "  Imported successfully"

# Step 7: Import issues to psypi (using temp table to handle duplicates)
echo "Step 7: Importing issues to psypi..."
psql -d psypi << 'EOF'
CREATE TEMP TABLE temp_issues AS 
SELECT id, title, description, issue_type, severity, status, created_by, discovered_at, related_issue_id, task_id, resolution, resolved_at, resolved_by, tags, metadata, created_at, updated_at, assignee, assignee_type, review_id, dlq_id, viewers, milestone_id, related_review_id
FROM issues 
WHERE false;

\copy temp_issues FROM '/tmp/traenupi_issues.csv' WITH CSV HEADER;

INSERT INTO issues (id, title, description, issue_type, severity, status, created_by, discovered_at, related_issue_id, task_id, resolution, resolved_at, resolved_by, tags, metadata, created_at, updated_at, assignee, assignee_type, review_id, dlq_id, viewers, milestone_id, related_review_id)
SELECT id, title, description, issue_type, severity, status, created_by, discovered_at, related_issue_id, task_id, resolution, resolved_at, resolved_by, tags, metadata, created_at, updated_at, assignee, assignee_type, review_id, dlq_id, viewers, milestone_id, related_review_id
FROM temp_issues
ON CONFLICT (id) DO NOTHING;
EOF
echo "  Imported successfully"

# Step 8: Import tasks to psypi (using temp table to handle duplicates)
echo "Step 8: Importing tasks to psypi..."
psql -d psypi << 'EOF'
CREATE TEMP TABLE temp_tasks AS 
SELECT * FROM tasks WHERE false;

\copy temp_tasks FROM '/tmp/traenupi_tasks.csv' WITH CSV HEADER;

INSERT INTO tasks
SELECT * FROM temp_tasks
ON CONFLICT (id) DO NOTHING;
EOF
echo "  Imported successfully"

# Step 9: Verify migration
echo "Step 9: Verifying migration..."
MEETINGS_COUNT=$(psql -d psypi -t -c "SELECT COUNT(*) FROM meetings WHERE created_by LIKE '%traenupi%' OR created_by LIKE '%trae-traenupi%';")
OPINIONS_COUNT=$(psql -d psypi -t -c "SELECT COUNT(*) FROM meeting_opinions WHERE author LIKE '%traenupi%' OR author LIKE '%trae-traenupi%';")
ISSUES_COUNT=$(psql -d psypi -t -c "SELECT COUNT(*) FROM issues WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%';")
TASKS_COUNT=$(psql -d psypi -t -c "SELECT COUNT(*) FROM tasks WHERE title ILIKE '%traenupi%' OR description ILIKE '%traenupi%';")

echo ""
echo "=== Migration Summary ==="
echo "Meetings migrated: $MEETINGS_COUNT"
echo "Opinions migrated: $OPINIONS_COUNT"
echo "Issues migrated: $ISSUES_COUNT"
echo "Tasks migrated: $TASKS_COUNT"
echo ""

# Cleanup
rm -f /tmp/traenupi_meetings.csv /tmp/traenupi_opinions.csv /tmp/traenupi_issues.csv /tmp/traenupi_tasks.csv
echo "Temporary files cleaned up"
echo ""
echo "✓ Migration completed successfully!"
