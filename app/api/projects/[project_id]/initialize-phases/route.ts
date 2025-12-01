import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_PHASES } from '@/lib/dummy-data'

export const revalidate = 0

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const { project_id } = await params
    
    // Return dummy phases
    return NextResponse.json({
      phases: DUMMY_PHASES.map(p => ({
        ...p,
        project_id: project_id,
      })),
      message: 'Phases initialized successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in POST /api/projects/[project_id]/initialize-phases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
