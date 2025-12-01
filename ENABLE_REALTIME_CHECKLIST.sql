-- Enable realtime replication for checklist_items table
-- This allows clients to see real-time updates when checklist items are updated
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;

-- Enable realtime replication for phases table (optional, for phase status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE phases;

-- Enable realtime replication for projects table (optional, for project updates)
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

