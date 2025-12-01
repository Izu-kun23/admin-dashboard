import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper to parse metadata and extract responses
function parseTaskMetadata(metadata: any): Array<{
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
}> {
  if (!metadata || typeof metadata !== 'object') {
    return []
  }

  if (!Array.isArray(metadata.responses)) {
    return []
  }

  return metadata.responses.map((r: any, index: number) => ({
    id: r.id || `response-${index}`,
    text: r.text || r.response || '',
    created_at: r.created_at || r.createdAt || new Date().toISOString(),
    created_by: r.created_by || r.createdBy || '',
    attachments: Array.isArray(r.attachments)
      ? r.attachments.map((a: any) => ({
          name: a.name || '',
          url: a.url || '',
          uploaded_at: a.uploaded_at || a.uploadedAt || a.created_at || a.createdAt,
          size: a.size,
          type: a.type || a.mimeType || a.mime_type,
        }))
      : [],
  }))
}

export async function GET(request: NextRequest) {
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

    // Get filters
    const clientId = searchParams.get('client_id')
    const clientEmail = searchParams.get('client_email')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause for tasks
    const taskWhere: any = {}

    if (clientId) {
      taskWhere.clientId = clientId
    }

    if (clientEmail) {
      taskWhere.client = {
        email: clientEmail,
      }
    }

    // Fetch all tasks with responses
    type TaskWithClient = Prisma.TaskGetPayload<{
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
          }
        }
      }
    }>

    const tasks: TaskWithClient[] = await prisma.task.findMany({
      where: taskWhere,
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

    // Extract all responses from all tasks
    const allResponses: Array<{
      id: string
      task_id: string
      task_title: string
      client_id: string
      client_name: string | null
      client_email: string
      text: string
      created_at: string
      created_by: string
      attachments: Array<{
        name: string
        url: string
        uploaded_at?: string
        size?: number
        type?: string
      }>
    }> = []

    tasks.forEach((task: TaskWithClient) => {
      const responses = parseTaskMetadata(task.metadata)
      
      responses.forEach(response => {
        // Apply date filtering to responses
        if (dateFrom || dateTo) {
          const responseDate = new Date(response.created_at)
          if (dateFrom && responseDate < new Date(dateFrom)) {
            return // Skip this response
          }
          if (dateTo && responseDate > new Date(dateTo)) {
            return // Skip this response
          }
        }

        allResponses.push({
          id: response.id || `${task.id}-${response.created_at}`,
          task_id: task.id,
          task_title: task.title,
          client_id: task.clientId,
          client_name: task.client?.name || null,
          client_email: task.client?.email || '',
          text: response.text,
          created_at: response.created_at,
          created_by: response.created_by,
          attachments: response.attachments || [],
        })
      })
    })

    // Sort by created_at descending
    allResponses.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Calculate pagination
    const total = allResponses.length
    const paginatedResponses = allResponses.slice(offset, offset + limit)
    const hasMore = offset + limit < total

    return NextResponse.json(
      {
        responses: paginatedResponses,
        pagination: {
          total,
          limit,
          offset,
          has_more: hasMore,
        },
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
    console.error('❌ Error in GET /api/tasks/responses/all:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : null,
      },
      { status: 500 }
    )
  }
}

