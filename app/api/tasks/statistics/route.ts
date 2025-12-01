import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper to parse metadata and extract responses/attachments
function parseTaskMetadata(metadata: any): {
  responses: Array<any>
  attachments: Array<any>
} {
  if (!metadata || typeof metadata !== 'object') {
    return { responses: [], attachments: [] }
  }

  const responses = Array.isArray(metadata.responses) ? metadata.responses : []
  const attachments = Array.isArray(metadata.attachments) ? metadata.attachments : []

  return { responses, attachments }
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
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Build where clause
    const where: any = {}

    if (clientId) {
      where.clientId = clientId
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Fetch all tasks
    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    // Calculate statistics
    const totalTasks = tasks.length

    // Tasks by status
    const tasksByStatus: Record<string, number> = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }

    // Tasks by type
    const tasksByType: Record<string, number> = {
      UPLOAD_FILE: 0,
      SEND_INFO: 0,
      PROVIDE_DETAILS: 0,
      REVIEW: 0,
      OTHER: 0,
    }

    // Responses and attachments
    let totalResponses = 0
    let totalAttachments = 0
    let tasksWithResponses = 0
    let tasksWithoutResponses = 0
    const responseTimes: number[] = [] // in hours

    tasks.forEach(task => {
      // Count by status
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1

      // Count by type
      tasksByType[task.type] = (tasksByType[task.type] || 0) + 1

      // Parse metadata
      const { responses, attachments } = parseTaskMetadata(task.metadata)

      // Count responses
      const responseCount = responses.length
      totalResponses += responseCount

      // Count attachments
      const attachmentCount = attachments.length
      totalAttachments += attachmentCount

      // Count tasks with/without responses
      if (responseCount > 0) {
        tasksWithResponses++
      } else {
        tasksWithoutResponses++
      }

      // Calculate response time if task is completed and has responses
      if (task.status === 'COMPLETED' && task.completedAt && responseCount > 0) {
        const firstResponse = responses[0]
        if (firstResponse?.created_at) {
          const responseDate = new Date(firstResponse.created_at)
          const taskCreatedAt = new Date(task.createdAt)
          const diffHours = (responseDate.getTime() - taskCreatedAt.getTime()) / (1000 * 60 * 60)
          if (diffHours > 0 && diffHours < 365 * 24) { // Sanity check: less than a year
            responseTimes.push(diffHours)
          }
        }
      }
    })

    // Calculate average response time
    const averageResponseTimeHours = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    return NextResponse.json(
      {
        total_tasks: totalTasks,
        tasks_by_status: tasksByStatus,
        tasks_by_type: tasksByType,
        total_responses: totalResponses,
        tasks_with_responses: tasksWithResponses,
        tasks_without_responses: tasksWithoutResponses,
        average_response_time_hours: Math.round(averageResponseTimeHours * 10) / 10, // Round to 1 decimal
        total_attachments: totalAttachments,
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
    console.error('❌ Error in GET /api/tasks/statistics:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : null,
      },
      { status: 500 }
    )
  }
}

