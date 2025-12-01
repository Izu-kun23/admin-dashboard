import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper to parse metadata and extract responses/attachments
function parseTaskMetadata(metadata: any): {
  responses: Array<{
    id?: string
    text: string
    created_at: string
    created_by: string
    attachments?: Array<{
      name: string
      url: string
      uploaded_at?: string
      size?: number
      type?: string
    }>
  }>
  attachments: Array<{
    name: string
    url: string
    uploaded_at?: string
    size?: number
    type?: string
  }>
} {
  if (!metadata || typeof metadata !== 'object') {
    return { responses: [], attachments: [] }
  }

  const responses = Array.isArray(metadata.responses) 
    ? metadata.responses.map((r: any, index: number) => ({
        id: r.id || `response-${index}`,
        text: r.text || r.response || '',
        created_at: r.created_at || r.createdAt || new Date().toISOString(),
        created_by: r.created_by || r.createdBy || '',
        attachments: Array.isArray(r.attachments) ? r.attachments : [],
      }))
    : []

  const attachments = Array.isArray(metadata.attachments)
    ? metadata.attachments.map((a: any) => ({
        name: a.name || '',
        url: a.url || '',
        uploaded_at: a.uploaded_at || a.uploadedAt || a.created_at || a.createdAt,
        size: a.size,
        type: a.type || a.mimeType || a.mime_type,
      }))
    : []

  return { responses, attachments }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify prisma is initialized
    if (!prisma || !('task' in prisma)) {
      return NextResponse.json(
        {
          error: 'Task model not available. Please restart your dev server.',
        },
        { status: 500 }
      )
    }

    const { id: task_id } = await params

    // Get authentication
    const searchParams = request.nextUrl.searchParams
    const adminEmail = searchParams.get('email') || request.headers.get('x-user-email')

    if (!adminEmail) {
      return NextResponse.json(
        {
          error: 'Unauthorized - email required',
          details: 'Provide email via query parameter (?email=...) or header (X-User-Email: ...)',
        },
        { status: 401 }
      )
    }

    // Fetch task
    const task = await prisma.task.findUnique({
      where: { id: task_id },
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
        {
          error: 'Task not found',
        },
        { status: 404 }
      )
    }

    // Parse responses from metadata
    const { responses } = parseTaskMetadata(task.metadata)

    // Format response
    const formattedTask = {
      id: task.id,
      client_id: task.clientId,
      client_name: task.client?.name || null,
      client_email: task.client?.email || null,
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      due_date: task.dueDate?.toISOString() || null,
      completed_at: task.completedAt?.toISOString() || null,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
    }

    return NextResponse.json(
      {
        task: formattedTask,
        responses,
        total_responses: responses.length,
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
    console.error('❌ Error in GET /api/tasks/[id]/responses:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : null,
      },
      { status: 500 }
    )
  }
}

