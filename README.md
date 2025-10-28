# Admin Dashboard

A modern admin dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Authentication with Supabase
- 📊 Full CRUD operations
- 🎨 Modern, responsive UI
- ⚡ Fast and performant
- 🔒 Secure session management

## Prerequisites

- Node.js 18+ installed
- A Supabase account

## Setup Instructions

### 1. Database Setup

First, you need to create a table in your Supabase database. Go to your Supabase project SQL Editor and run:

```sql
-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Users can read items" ON items
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert
CREATE POLICY "Users can insert items" ON items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update
CREATE POLICY "Users can update items" ON items
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Users can delete items" ON items
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

### 2. Create an Admin User

Run the setup script to create the initial admin user with encrypted password:

```bash
npm run create-admin
```

This will create an admin user with:
- Email: `izuchukwuonuoha6@gmail.com`
- Password: `12345678` (encrypted automatically)

Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Alternatively, you can create the user manually through the Supabase Dashboard → Authentication → Users.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Login with your admin credentials
2. Navigate to the dashboard
3. Create, read, update, and delete items
4. Logout when done

## Project Structure

```
admin-dashboard/
├── app/
│   ├── dashboard/       # Dashboard page with CRUD operations
│   ├── login/           # Login page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page (redirects)
│   └── globals.css      # Global styles
├── utils/
│   └── supabase/
│       ├── client.ts    # Client-side Supabase client
│       └── server.ts    # Server-side Supabase client
├── middleware.ts        # Auth middleware
└── .env.local           # Environment variables
```

## Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication & Database
- **Lucide React** - Icons

## License

MIT
