import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_PHASE_TEMPLATES } from '@/lib/dummy-data'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const kitType = searchParams.get('kit_type') as 'LAUNCH' | 'GROWTH'

    if (!kitType || (kitType !== 'LAUNCH' && kitType !== 'GROWTH')) {
      return NextResponse.json(
        { error: 'kit_type is required and must be LAUNCH or GROWTH' },
        { status: 400 }
      )
    }

    const templates = DUMMY_PHASE_TEMPLATES[kitType] || []

    return NextResponse.json(
      {
        phase_templates: templates,
        kit_type: kitType,
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
    console.error('❌ Error in GET /api/phase-templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
