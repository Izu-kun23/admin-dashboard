import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Verify prisma is initialized and task model exists
    if (!prisma) {
      console.error('❌ Prisma client is not initialized')
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection not available',
          data: [],
          count: 0,
        },
        { status: 500 }
      )
    }

    // Check if task model exists (it should after prisma generate)
    if (!('task' in prisma)) {
      console.error('❌ Task model not found in Prisma client. Please restart your dev server after running: npx prisma generate')
      return NextResponse.json(
        {
          success: false,
          error: 'Task model not available. Please restart your dev server.',
          data: [],
          count: 0,
        },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('client_id')
    const status = searchParams.get('status') as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null
    const type = searchParams.get('type') as 'UPLOAD_FILE' | 'SEND_INFO' | 'PROVIDE_DETAILS' | 'REVIEW' | 'OTHER' | null

    const tasks = await prisma.task.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(status && { status }),
        ...(type && { type }),
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedTasks = tasks.map(task => ({
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
    }))

    return NextResponse.json(
      {
        success: true,
        data: formattedTasks,
        count: formattedTasks.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error: any) {
    console.error('❌ Error in GET /api/tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        data: [],
        count: 0,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify prisma is initialized and task model exists
    if (!prisma || !('task' in prisma)) {
      console.error('❌ Task model not found in Prisma client. Please restart your dev server after running: npx prisma generate')
      return NextResponse.json(
        {
          success: false,
          error: 'Task model not available. Please restart your dev server.',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      client_id,
      title,
      description,
      type = 'OTHER',
      status = 'PENDING',
      due_date,
      attachments = [],
      metadata = {},
      created_by,
    } = body

    if (!client_id || !title) {
      return NextResponse.json(
        { success: false, error: 'client_id and title are required' },
        { status: 400 }
      )
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: client_id },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    const task = await prisma.task.create({
      data: {
        clientId: client_id,
        title,
        description,
        type: type || 'OTHER',
        status: status || 'PENDING',
        dueDate: due_date ? new Date(due_date) : null,
        attachments: attachments || [],
        metadata: metadata || {},
        createdBy: created_by || null,
      },
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

    console.log('✅ Task created successfully:', task.id)

    return NextResponse.json(
      {
        success: true,
        data: formattedTask,
        message: 'Task created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error in POST /api/tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

