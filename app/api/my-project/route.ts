import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_PROJECT } from '@/lib/dummy-data'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Return dummy project data
    return NextResponse.json(
      { project: DUMMY_PROJECT },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error: any) {
    console.error('❌ Error in GET /api/my-project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
