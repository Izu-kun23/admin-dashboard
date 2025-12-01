import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log database connection status in development
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL is not set. Database operations will fail.')
  } else {
    console.log('✅ DATABASE_URL is configured')
  }
}

// Create Prisma Client with connection pooling for production
const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

  // Handle connection errors gracefully
  prisma.$connect().catch((error) => {
    console.error('❌ Failed to connect to database:', error.message)
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set!')
      console.error('📖 Please set DATABASE_URL in your Vercel environment variables.')
      console.error('📖 See VERCEL_DATABASE_SETUP.md for instructions.')
    }
  })

  return prisma
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

