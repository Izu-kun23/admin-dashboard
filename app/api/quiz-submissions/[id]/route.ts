import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 0

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Check if submission exists
    const submission = await prisma.quizSubmission.findUnique({
      where: { id },
      select: { id: true, email: true, brandName: true },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Quiz submission not found' },
        { status: 404 }
      )
    }

    // Delete submission from database
    await prisma.quizSubmission.delete({
      where: { id },
    })

    console.log('✅ Quiz submission deleted successfully:', submission.brandName)

    return NextResponse.json({
      success: true,
      message: 'Quiz submission deleted successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in DELETE /api/quiz-submissions/[id]:', error)

    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Quiz submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

