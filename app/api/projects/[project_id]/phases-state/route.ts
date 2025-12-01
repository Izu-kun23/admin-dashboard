import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_PROJECT } from '@/lib/dummy-data'

export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const { project_id } = await params
    
    // Return dummy project with phases
    return NextResponse.json({
      project: {
        ...DUMMY_PROJECT,
        id: project_id,
      },
    })
  } catch (error: any) {
    console.error('❌ Error in GET /api/projects/[project_id]/phases-state:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const { project_id } = await params
    const body = await request.json()
    
    // Return success with dummy data
    return NextResponse.json({
      project: {
        ...DUMMY_PROJECT,
        id: project_id,
      },
      message: 'Project updated successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/projects/[project_id]/phases-state:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
