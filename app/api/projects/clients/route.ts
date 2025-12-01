import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        plan: true,
        currentDayOf14: true,
        onboardingPercent: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedClients = clients.map(client => ({
      id: client.id,
      user_id: client.userId,
      name: client.name,
      email: client.email,
      plan: client.plan,
      current_day_of_14: client.currentDayOf14,
      onboarding_percent: client.onboardingPercent,
      created_at: client.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: formattedClients,
      count: formattedClients.length,
    })
  } catch (error: any) {
    console.error('❌ Error in GET /api/projects/clients:', error)
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
