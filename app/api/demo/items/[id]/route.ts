import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Return success (dummy delete)
    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    })
  } catch (error: any) {
    console.error('❌ Error in DELETE /api/demo/items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    
    // Return dummy updated item
    return NextResponse.json({
      success: true,
      data: {
        id,
        ...body,
      },
    })
  } catch (error: any) {
    console.error('❌ Error in PATCH /api/demo/items/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
