-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Admins can read admins" ON admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow admins to insert
CREATE POLICY "Admins can insert admins" ON admins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow admins to update
CREATE POLICY "Admins can update admins" ON admins
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow admins to delete
CREATE POLICY "Admins can delete admins" ON admins
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create items table (for CRUD operations)
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated admins to read items
CREATE POLICY "Admins can read items" ON items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow authenticated admins to insert items
CREATE POLICY "Admins can insert items" ON items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow authenticated admins to update items
CREATE POLICY "Admins can update items" ON items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow authenticated admins to delete items
CREATE POLICY "Admins can delete items" ON items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Insert the first admin
-- IMPORTANT: You must first create the user in Supabase Auth before running this!
-- 
-- Steps to create admin user:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter email: izuchukwuonuoha6@gmail.com
-- 4. Enter password: 12345678
-- 5. Toggle "Auto Confirm User" ON
-- 6. Click "Create User"
-- 7. Copy the User UID that's shown
-- 8. Then run this SQL to insert them into admins table
--
-- Password: 12345678
-- This query will insert them into the admins table

INSERT INTO admins (user_id, email, name, password, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'izuchukwuonuoha6@gmail.com' LIMIT 1),
  'izuchukwuonuoha6@gmail.com',
  'Izuchukwu Tony',
  '12345678',
  'admin'
) ON CONFLICT (email) DO UPDATE 
SET user_id = EXCLUDED.user_id;

-- OR if you already have the user_id from Supabase Auth, use this:
-- INSERT INTO admins (user_id, email, name, password, role) 
-- VALUES (
--   'paste-user-id-here',
--   'izuchukwuonuoha6@gmail.com',
--   'Izuchukwu Tony',
--   '12345678',
--   'admin'
-- ) ON CONFLICT (email) DO UPDATE 
-- SET user_id = EXCLUDED.user_id;
