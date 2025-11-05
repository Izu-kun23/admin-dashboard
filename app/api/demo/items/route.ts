import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// GET - Fetch all items
export async function GET() {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseKey) {
      const missingVars = []
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!supabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required environment variables: ${missingVars.join(', ')}` 
        },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, status } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Validate environment variables
    if (!supabaseUrl || !supabaseKey) {
      const missingVars = []
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!supabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required environment variables: ${missingVars.join(', ')}` 
        },
        { status: 500 }
      )
    }

    const supabase = createSupabaseClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await supabase
      .from('items')
      .insert([{ name, description, status: status || 'active' }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
