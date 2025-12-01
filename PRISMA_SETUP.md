# Prisma MySQL Setup Guide

## Overview

This project uses Prisma with MySQL for database operations. Supabase has been removed and replaced with Prisma ORM.

## Database Connection

The MySQL database connection is configured in the `.env` file:

```
DATABASE_URL="mysql://root:LhxtqbFXxONStbSWyYeJHSjyrTkApjTR@trolley.proxy.rlwy.net:40004/railway"
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@prisma/client` - Prisma client for database operations
- `prisma` (dev) - Prisma CLI for migrations and schema management

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with:

```env
DATABASE_URL="mysql://root:LhxtqbFXxONStbSWyYeJHSjyrTkApjTR@trolley.proxy.rlwy.net:40004/railway"
```

### 3. Generate Prisma Client

After setting up the schema, generate the Prisma client:

```bash
npm run prisma:generate
```

Or directly:

```bash
npx prisma generate
```

### 4. Push Schema to Database

To sync your schema with the database without creating migrations:

```bash
npm run prisma:push
```

Or create a migration:

```bash
npm run prisma:migrate
```

### 5. Open Prisma Studio (Optional)

To view and edit data in a GUI:

```bash
npm run prisma:studio
```

This will open Prisma Studio at `http://localhost:5555`

## Schema Overview

The Prisma schema (`prisma/schema.prisma`) includes the following models:

### QuizSubmission
Stores quiz submission data with fields:
- Personal info (name, email, phone)
- Brand details (brand name, logo status)
- Goals and preferences (brand goals, audience, style)
- Timeline and preferred kit type

### Client
Stores client information and project status:
- User association
- Kit type (LAUNCH or GROWTH)
- Onboarding progress
- Next actions (from us/from you)

### ClientPhaseState
Tracks phase progress for each client:
- Phase status (NOT_STARTED, IN_PROGRESS, WAITING_ON_CLIENT, DONE)
- Checklist completion (stored as JSON)
- Timestamps for start/completion

### OnboardingAnswer
Stores onboarding form responses as JSON

## Using Prisma Client

Import the Prisma client in your code:

```typescript
import { prisma } from '@/lib/prisma'

// Example: Fetch all quiz submissions
const submissions = await prisma.quizSubmission.findMany()

// Example: Create a quiz submission
const submission = await prisma.quizSubmission.create({
  data: {
    fullName: "John Doe",
    email: "john@example.com",
    // ... other fields
  }
})

// Example: Update a client
await prisma.client.update({
  where: { id: clientId },
  data: { currentDayOf14: 5 }
})
```

## Available Scripts

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:push` - Push schema changes to database (development)
- `npm run prisma:studio` - Open Prisma Studio GUI

## Migration from Supabase

All Supabase-related files have been removed:
- ✅ `utils/supabase/client.ts` - Removed
- ✅ `utils/supabase/server.ts` - Removed
- ✅ `@supabase/ssr` - Removed from dependencies
- ✅ `@supabase/supabase-js` - Removed from dependencies

Replace any Supabase queries with Prisma queries in your API routes and components.

## Troubleshooting

### Connection Issues

If you encounter connection errors:
1. Verify the `DATABASE_URL` in your `.env` file
2. Ensure the MySQL server is accessible
3. Check network/firewall settings

### Schema Sync Issues

If schema changes aren't reflecting:
1. Run `npm run prisma:generate` to regenerate the client
2. Restart your development server
3. Check for migration conflicts

### Type Errors

After schema changes:
1. Regenerate Prisma Client: `npm run prisma:generate`
2. Restart TypeScript server in your IDE
3. Clear Next.js cache if needed: `rm -rf .next`

