import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPhaseStructureForKitType, mergePhaseStructureWithState } from '@/lib/phase-structure'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const kitType = searchParams.get('kit_type') as 'LAUNCH' | 'GROWTH' | null
    const status = searchParams.get('status') as 'NOT_STARTED' | 'IN_PROGRESS' | 'WAITING_ON_CLIENT' | 'DONE' | null

    // Fetch all clients with their phase states
    const clients = await prisma.client.findMany({
      where: {
        ...(kitType && { plan: kitType }),
      },
      include: {
        phaseStates: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform clients to projects with merged phases
    const projects = clients.map(client => {
      // Get phase structure for this kit type
      const structure = getPhaseStructureForKitType(client.plan)
      
      // Build phases state from ClientPhaseState records
      const phasesState: Record<string, {
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'WAITING_ON_CLIENT' | 'DONE'
        started_at?: string | null
        completed_at?: string | null
        checklist: { [label: string]: boolean }
      }> = {}

      client.phaseStates.forEach(phaseState => {
        let checklist: { [label: string]: boolean } = {}
        
        // Handle checklist from database JSON field
        try {
          if (phaseState.checklist) {
            // Parse JSON if it's a string (MySQL JSON can come as string)
            let checklistData = phaseState.checklist
            if (typeof checklistData === 'string') {
              try {
                checklistData = JSON.parse(checklistData)
              } catch (e) {
                console.error(`❌ Failed to parse checklist JSON for ${phaseState.phaseId}:`, e)
                checklistData = {}
              }
            }
            
            // Convert to object if it's valid
            if (typeof checklistData === 'object' && checklistData !== null && !Array.isArray(checklistData)) {
              const checklistObj = checklistData as any
              // Convert all values to ensure they're booleans and preserve all keys
              Object.keys(checklistObj).forEach(key => {
                // Ensure value is a proper boolean
                const value = checklistObj[key]
                checklist[key] = value === true || value === 'true' || value === 1
              })
            } else if (Array.isArray(checklistData)) {
              // Handle case where checklist might be incorrectly stored as array
              console.warn(`⚠️ Checklist for ${phaseState.phaseId} is an array, converting to object`)
              checklist = {}
            }
          }
        } catch (error) {
          console.error(`❌ Error processing checklist for ${phaseState.phaseId}:`, error)
          checklist = {}
        }

        console.log(`📖 Loading phase state for ${phaseState.phaseId}:`, {
          status: phaseState.status,
          checklistKeys: Object.keys(checklist),
          checklistCount: Object.keys(checklist).length,
          checklistEntries: Object.entries(checklist).map(([label, isDone]) => ({ label, isDone })),
          rawChecklist: phaseState.checklist,
          processedChecklist: checklist,
        })

        phasesState[phaseState.phaseId] = {
          status: phaseState.status,
          started_at: phaseState.startedAt?.toISOString() || null,
          completed_at: phaseState.completedAt?.toISOString() || null,
          checklist,
        }
      })

      // Merge structure with state
      const mergedPhases = mergePhaseStructureWithState(structure, phasesState)

      // Transform to the format expected by the frontend
      const phases = mergedPhases.map(phase => {
        const checklistItems = phase.checklist.map((item, index) => ({
          id: `${client.id}-${phase.phase_id}-${index}`,
          phase_id: phase.phase_id,
          label: item.label,
          is_done: item.is_done,
          sort_order: index + 1,
          created_at: client.createdAt.toISOString(),
          updated_at: client.updatedAt.toISOString(),
        }))

        // Determine source: check if this phase has database state with checklist items
        const hasDatabaseChecklist = phasesState[phase.phase_id]?.checklist && 
          Object.keys(phasesState[phase.phase_id].checklist).length > 0
        const source = hasDatabaseChecklist ? 'database' : 'template'
        
        console.log(`📋 Phase ${phase.phase_id} (${phase.title}) checklist items:`, {
          phase_id: phase.phase_id,
          phase_title: phase.title,
          itemCount: checklistItems.length,
          items: checklistItems.map(item => ({ label: item.label, is_done: item.is_done })),
          source: source,
          templateLabels: phase.checklist_labels,
        })

        return {
          id: `${client.id}-${phase.phase_id}`, // Generate ID from client and phase
          project_id: client.id,
          phase_number: phase.phase_number,
          phase_id: phase.phase_id,
          title: phase.title,
          subtitle: phase.subtitle,
          day_range: phase.day_range,
          status: phase.status,
          started_at: phase.started_at,
          completed_at: phase.completed_at,
          created_at: client.createdAt.toISOString(),
          updated_at: client.updatedAt.toISOString(),
          checklist_items: checklistItems,
          phase_links: [], // Phase links not in schema yet
        }
      })

      return {
        id: client.id,
        user_id: client.userId,
        kit_type: client.plan,
        current_day_of_14: client.currentDayOf14,
        next_from_us: client.nextFromUs,
        next_from_you: client.nextFromYou,
        onboarding_finished: client.onboardingPercent === 100,
        onboarding_percent: client.onboardingPercent,
        created_at: client.createdAt.toISOString(),
        updated_at: client.updatedAt.toISOString(),
        email: client.email,
        phases,
      }
    })

    // Filter by status if provided
    let filteredProjects = projects
    if (status) {
      filteredProjects = projects.filter(project => {
        return project.phases.some(phase => phase.status === status)
      })
    }

    return NextResponse.json(
      {
        projects: filteredProjects,
        total: filteredProjects.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error: any) {
    console.error('❌ Error in GET /api/projects/phases:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        projects: [],
        total: 0
      },
      { status: 500 }
    )
  }
}
