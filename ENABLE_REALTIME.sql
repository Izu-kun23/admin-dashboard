-- Enable realtime replication for items table
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- Enable realtime replication for admins table
ALTER PUBLICATION supabase_realtime ADD TABLE admins;
