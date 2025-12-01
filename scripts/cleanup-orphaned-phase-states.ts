import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupOrphanedPhaseStates() {
  try {
    console.log('🔍 Checking for orphaned phase state records...')

    // First, let's see what we're working with
    const allPhaseStates = await prisma.$queryRaw<Array<{ client_id: string; id: string }>>`
      SELECT id, client_id FROM client_phase_state
    `

    const allClientIds = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM clients
    `

    const validClientIds = new Set(allClientIds.map(c => c.id))
    console.log(`✅ Found ${validClientIds.size} valid clients`)

    const orphanedRecords = allPhaseStates.filter(ps => !validClientIds.has(ps.client_id))
    console.log(`⚠️  Found ${orphanedRecords.length} orphaned phase state records`)

    if (orphanedRecords.length > 0) {
      console.log('🗑️  Deleting orphaned records...')
      
      for (const record of orphanedRecords) {
        await prisma.$executeRaw`
          DELETE FROM client_phase_state WHERE id = ${record.id}
        `
        console.log(`   Deleted phase state: ${record.id} (client_id: ${record.client_id})`)
      }

      console.log(`✅ Cleaned up ${orphanedRecords.length} orphaned records`)
    } else {
      console.log('✅ No orphaned records found')
    }
  } catch (error: any) {
    console.error('❌ Error cleaning up orphaned records:', error.message)
    
    // If the Task model doesn't exist yet, we might get an error
    // Let's try a more direct approach using raw SQL
    if (error.message?.includes('task') || error.message?.includes('Task')) {
      console.log('⚠️  Task model not found, using raw SQL instead...')
      
      try {
        // Get all phase states with their client_ids
        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count
          FROM client_phase_state cps
          LEFT JOIN clients c ON cps.client_id = c.id
          WHERE c.id IS NULL
        `
        
        const orphanCount = Number(result[0]?.count || 0)
        console.log(`   Found ${orphanCount} orphaned records`)

        if (orphanCount > 0) {
          await prisma.$executeRaw`
            DELETE cps FROM client_phase_state cps
            LEFT JOIN clients c ON cps.client_id = c.id
            WHERE c.id IS NULL
          `
          console.log(`✅ Deleted ${orphanCount} orphaned records`)
        }
      } catch (sqlError: any) {
        console.error('❌ Error with raw SQL cleanup:', sqlError.message)
        throw sqlError
      }
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

cleanupOrphanedPhaseStates()
  .then(() => {
    console.log('✅ Cleanup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })

