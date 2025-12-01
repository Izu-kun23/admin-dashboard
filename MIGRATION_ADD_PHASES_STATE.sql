-- Migration: Add phases_state JSONB column to projects table
-- This enables storing phase status and checklist completion as JSON instead of separate tables

-- Add phases_state column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS phases_state JSONB DEFAULT NULL;

-- Add index for JSONB queries (optional, but improves performance)
CREATE INDEX IF NOT EXISTS idx_projects_phases_state ON projects USING GIN (phases_state);

-- Example phases_state structure:
-- {
--   "PHASE_1": {
--     "status": "IN_PROGRESS",
--     "started_at": "2024-01-01T00:00:00Z",
--     "completed_at": null,
--     "checklist": {
--       "Onboarding steps completed": true,
--       "Brand / strategy call completed": true,
--       "Simple 14 day plan agreed": false
--     }
--   },
--   "PHASE_2": {
--     "status": "NOT_STARTED",
--     "checklist": {
--       "Draft homepage copy ready": false,
--       "Draft offer / services page ready": false,
--       "Draft contact / about copy ready": false,
--       "You reviewed and approved copy": false
--     }
--   }
-- }

-- Enable realtime for projects table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

