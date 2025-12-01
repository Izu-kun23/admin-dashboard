import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Fetch all quiz submissions from database
    const submissions = await prisma.quizSubmission.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform to match the expected format for the activity page
    const formattedSubmissions = submissions.map(submission => ({
      id: submission.id,
      full_name: submission.fullName,
      email: submission.email,
      phone_number: submission.phoneNumber,
      brand_name: submission.brandName,
      logo_status: submission.logoStatus,
      brand_goals: Array.isArray(submission.brandGoals) 
        ? submission.brandGoals as string[]
        : [],
      online_presence: submission.onlinePresence,
      audience: Array.isArray(submission.audience)
        ? submission.audience as string[]
        : [],
      brand_style: submission.brandStyle,
      timeline: submission.timeline,
      preferred_kit: submission.preferredKit || null,
      created_at: submission.createdAt.toISOString(),
      updated_at: submission.updatedAt.toISOString(),
    }))

    return NextResponse.json(
      { 
        success: true, 
        data: formattedSubmissions, 
        count: formattedSubmissions.length 
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
    console.error('❌ Error fetching quiz submissions:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch quiz submissions',
        data: [],
        count: 0
      }, 
      { status: 500 }
    )
  }
}

