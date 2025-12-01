import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Verify DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is missing! Make sure it is set in .env and Vercel.')
}

function createPrismaClient() {
  try {
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      errorFormat: 'pretty',
    })
    
    // Test connection on initialization in development
    if (process.env.NODE_ENV === 'development') {
      client.$connect().catch((err) => {
        console.error('❌ Failed to connect to database:', err.message)
      })
    }
    
    return client
  } catch (error: any) {
    console.error('❌ Failed to create Prisma client:', error.message)
    throw error
  }
}

// For serverless environments (Vercel), we need to ensure a fresh client per invocation
// but reuse it within the same execution context
const prisma = global.prisma ?? createPrismaClient()

// In production/serverless, don't store in global to avoid connection issues
// In development, reuse the same client
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

// Ensure connection is established before use (important for serverless)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  prisma.$connect().catch(() => {
    // Silently fail - connection will be established on first query
  })
}

export { prisma }