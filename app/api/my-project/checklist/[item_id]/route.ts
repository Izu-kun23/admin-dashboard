import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ item_id: string }> }
) {
  try {
    const { item_id } = await params
    const body = await request.json()

    // Return dummy updated checklist item
    return NextResponse.json({
      checklist_item: {
        id: item_id,
        label: 'Dummy checklist item',
        is_done: body.is_done || false,
      },
      message: 'Checklist item updated successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/my-project/checklist/[item_id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
