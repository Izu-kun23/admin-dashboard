import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string; phase_id: string }> }
) {
  try {
    const { project_id } = await params
    
    // Fetch client and phase state
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
      },
    })
  } catch (error: any) {
    console.error('❌ Error in GET /api/projects/[project_id]/phases/[phase_id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string; phase_id: string }> }
) {
  try {
    const { project_id } = await params
    const body = await request.json()
    const { status, phase_id: phaseIdString } = body // phase_id is PHASE_1, PHASE_2, etc.

    if (!phaseIdString) {
      return NextResponse.json(
        { error: 'phase_id is required' },
        { status: 400 }
      )
    }

    if (!status || !['NOT_STARTED', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'DONE'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      )
    }

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

    // Find or create phase state
    const existingPhaseState = await prisma.clientPhaseState.findUnique({
      where: {
        clientId_phaseId: {
          clientId: project_id,
          phaseId: phaseIdString,
        },
      },
    })

    const now = new Date()
    const updateData: any = {
      status,
      updatedAt: now,
    }

    // Set started_at when status changes to IN_PROGRESS or later
    if (status !== 'NOT_STARTED' && !existingPhaseState?.startedAt) {
      updateData.startedAt = now
    }

    // Set completed_at when status changes to DONE
    if (status === 'DONE') {
      updateData.completedAt = now
    } else if (existingPhaseState?.completedAt) {
      updateData.completedAt = null
    }

    if (existingPhaseState) {
      // Update existing phase state
      await prisma.clientPhaseState.update({
        where: {
          clientId_phaseId: {
            clientId: project_id,
            phaseId: phaseIdString,
          },
        },
        data: updateData,
      })
    } else {
      // Create new phase state
      await prisma.clientPhaseState.create({
        data: {
          clientId: project_id,
          phaseId: phaseIdString,
          status,
          checklist: {},
          startedAt: status !== 'NOT_STARTED' ? now : null,
          completedAt: status === 'DONE' ? now : null,
        },
      })
    }

    console.log('✅ Phase status updated successfully:', { project_id, phaseIdString, status })

    return NextResponse.json({
      success: true,
      message: 'Phase status updated successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/projects/[project_id]/phases/[phase_id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
