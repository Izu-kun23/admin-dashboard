import { NextResponse } from 'next/server'
import { DUMMY_ITEMS } from '@/lib/dummy-data'

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: DUMMY_ITEMS }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, status } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Return dummy created item
    const newItem = {
      id: Date.now().toString(),
      name,
      description: description || '',
      status: status || 'active',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: newItem }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
