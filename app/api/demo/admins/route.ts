import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Disable Next.js caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Fetch all admins
export async function GET() {
  try {
    console.log('🔑 Using Supabase key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET')
    console.log('🔑 Is service role?', supabaseKey?.includes('service_role'))
    
    const supabase = createSupabaseClient(
      supabaseUrl!,
      supabaseKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('📊 Fetching all admins without any filters...')
    const { data, error, count } = await supabase
      .from('admins')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    console.log('📦 Fetching admins from database:')
    console.log('- Total admins fetched:', data?.length || 0)
    console.log('- Count from Supabase:', count)
    console.log('- Error:', error)
    console.log('- Data:', data)
    
    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log('✅ Returning admins:', data)
    console.log('📊 Actual admin IDs:', data?.map(a => a.id))
    
    // Disable caching to ensure fresh data
    return NextResponse.json({ success: true, data, count }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error: any) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
