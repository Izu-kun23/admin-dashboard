import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_PROJECT } from '@/lib/dummy-data'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Return dummy project with phases
    return NextResponse.json({ project: DUMMY_PROJECT })
  } catch (error: any) {
    console.error('❌ Error in GET /api/my-project/phases-state:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Return success with dummy data
    return NextResponse.json({
      project: DUMMY_PROJECT,
      message: 'Checklist item updated successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/my-project/phases-state:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
