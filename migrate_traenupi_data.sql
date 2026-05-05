-- TraeNuPI Data Migration Script
-- Migrate TraeNuPI-specific data from nezha to psypi
-- Date: 2026-05-05

BEGIN;

-- Step 1: Migrate TraeNuPI meetings
INSERT INTO psypi.meetings (
  id, topic, status, created_by, created_at, consensus, consensus_at, metadata, project_id, summary, updated_at
)
SELECT 
  id, topic, status, created_by, created_at, consensus, consensus_at, metadata, project_id, summary, updated_at
FROM nezha.meetings
WHERE created_by LIKE '%traenupi%' OR created_by LIKE '%trae-traenupi%'
ON CONFLICT (id) DO NOTHING;

-- Step 2: Migrate TraeNuPI meeting opinions
INSERT INTO psypi.meeting_opinions (
  id, meeting_id, author, perspective, position, created_at
)
SELECT 
  id, meeting_id, author, perspective, position, created_at
FROM nezha.meeting_opinions
WHERE author LIKE '%traenupi%' OR author LIKE '%trae-traenupi%'
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify migration
DO $$
DECLARE
  meetings_count INTEGER;
  opinions_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO meetings_count 
  FROM psypi.meetings 
  WHERE created_by LIKE '%traenupi%' OR created_by LIKE '%trae-traenupi%';
  
  SELECT COUNT(*) INTO opinions_count 
  FROM psypi.meeting_opinions 
  WHERE author LIKE '%traenupi%' OR author LIKE '%trae-traenupi%';
  
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '  Meetings migrated: %', meetings_count;
  RAISE NOTICE '  Opinions migrated: %', opinions_count;
  
  IF meetings_count = 0 OR opinions_count = 0 THEN
    RAISE EXCEPTION 'Migration failed: No data was migrated';
  END IF;
END $$;

COMMIT;
