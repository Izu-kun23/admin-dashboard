import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    const formattedTask = {
      id: task.id,
      client_id: task.clientId,
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      due_date: task.dueDate?.toISOString() || null,
      completed_at: task.completedAt?.toISOString() || null,
      attachments: task.attachments || [],
      metadata: task.metadata || {},
      created_by: task.createdBy,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      client: task.client ? {
        id: task.client.id,
        name: task.client.name,
        email: task.client.email,
        plan: task.client.plan,
      } : null,
    }

    return NextResponse.json({
      success: true,
      data: formattedTask,
    })
  } catch (error: any) {
    console.error('❌ Error in GET /api/tasks/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      type,
      status,
      due_date,
      attachments,
      metadata,
    } = body

    const existingTask = await prisma.task.findUnique({
      where: { id },
    })

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (attachments !== undefined) updateData.attachments = attachments
    if (metadata !== undefined) updateData.metadata = metadata
    if (due_date !== undefined) updateData.dueDate = due_date ? new Date(due_date) : null

    if (status !== undefined) {
      updateData.status = status
      
      // Auto-set completedAt when status is COMPLETED
      if (status === 'COMPLETED' && !existingTask.completedAt) {
        updateData.completedAt = new Date()
      } else if (status !== 'COMPLETED' && existingTask.completedAt) {
        updateData.completedAt = null
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
          },
        },
      },
    })

    const formattedTask = {
      id: updatedTask.id,
      client_id: updatedTask.clientId,
      title: updatedTask.title,
      description: updatedTask.description,
      type: updatedTask.type,
      status: updatedTask.status,
      due_date: updatedTask.dueDate?.toISOString() || null,
      completed_at: updatedTask.completedAt?.toISOString() || null,
      attachments: updatedTask.attachments || [],
      metadata: updatedTask.metadata || {},
      created_by: updatedTask.createdBy,
      created_at: updatedTask.createdAt.toISOString(),
      updated_at: updatedTask.updatedAt.toISOString(),
      client: updatedTask.client ? {
        id: updatedTask.client.id,
        name: updatedTask.client.name,
        email: updatedTask.client.email,
        plan: updatedTask.client.plan,
      } : null,
    }

    console.log('✅ Task updated successfully:', updatedTask.id)

    return NextResponse.json({
      success: true,
      data: formattedTask,
      message: 'Task updated successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/tasks/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingTask = await prisma.task.findUnique({
      where: { id },
    })

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    await prisma.task.delete({
      where: { id },
    })

    console.log('✅ Task deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in DELETE /api/tasks/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

