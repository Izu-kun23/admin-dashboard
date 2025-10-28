-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can update admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete admins" ON admins;
DROP POLICY IF EXISTS "Allow authenticated users to read admins" ON admins;
DROP POLICY IF EXISTS "Allow authenticated users to insert admins" ON admins;
DROP POLICY IF EXISTS "Allow authenticated users to update admins" ON admins;
DROP POLICY IF EXISTS "Allow authenticated users to delete admins" ON admins;

-- Enable RLS for admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and insert admins
CREATE POLICY "Allow authenticated users to read admins" ON admins
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert admins" ON admins
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete admins
CREATE POLICY "Allow authenticated users to delete admins" ON admins
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Update items policies to allow all authenticated users
DROP POLICY IF EXISTS "Admins can read items" ON items;
DROP POLICY IF EXISTS "Admins can insert items" ON items;
DROP POLICY IF EXISTS "Admins can update items" ON items;
DROP POLICY IF EXISTS "Admins can delete items" ON items;

CREATE POLICY "Allow authenticated users to read items" ON items
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert items" ON items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update items" ON items
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete items" ON items
  FOR DELETE
  USING (auth.role() = 'authenticated');
