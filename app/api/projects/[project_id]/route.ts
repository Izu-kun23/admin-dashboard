import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const { project_id } = await params
    
    // Fetch client from database
    const client = await prisma.client.findUnique({
      where: { id: project_id },
      include: {
        phaseStates: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      project: {
        id: client.id,
        email: client.email,
        plan: client.plan,
        current_day_of_14: client.currentDayOf14,
        next_from_us: client.nextFromUs,
        next_from_you: client.nextFromYou,
        onboarding_percent: client.onboardingPercent,
      },
    })
  } catch (error: any) {
    console.error('❌ Error in GET /api/projects/[project_id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
    const { current_day_of_14, next_from_us, next_from_you } = body

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: project_id },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {}
    
    if (current_day_of_14 !== undefined) {
      if (current_day_of_14 < 1 || current_day_of_14 > 14) {
        return NextResponse.json(
          { error: 'current_day_of_14 must be between 1 and 14' },
          { status: 400 }
        )
      }
      updateData.currentDayOf14 = current_day_of_14
    }

    if (next_from_us !== undefined) {
      updateData.nextFromUs = next_from_us
    }

    if (next_from_you !== undefined) {
      updateData.nextFromYou = next_from_you
    }

    // Update client
    await prisma.client.update({
      where: { id: project_id },
      data: updateData,
    })

    console.log('✅ Project progress updated successfully:', { project_id, updateData })

    return NextResponse.json({
      success: true,
      message: 'Project progress updated successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/projects/[project_id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
