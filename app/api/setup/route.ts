import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Return dummy setup response
    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in POST /api/setup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
