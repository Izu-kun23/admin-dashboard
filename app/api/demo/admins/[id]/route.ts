import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// DELETE - Delete an admin by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Coerce and validate id as number (admins.id is BIGSERIAL)
    const idNum = Number(id)
    if (!Number.isFinite(idNum)) {
      console.error('❌ Invalid admin id param:', id)
      return NextResponse.json({ error: 'Invalid admin id' }, { status: 400 })
    }
    console.log('🗑️ Deleting admin with ID:', idNum)

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

    // First, get the admin to get the user_id
    const { data: adminData, error: fetchError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('id', idNum)

    if (fetchError) {
      console.error('❌ Error fetching admin:', fetchError)
      throw fetchError
    }

    if (!adminData || adminData.length === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const admin = adminData[0]
    const userId = admin.user_id

    // Delete from admins table
    const { error: deleteError } = await supabase
      .from('admins')
      .delete()
      .eq('id', idNum)

    if (deleteError) {
      console.error('❌ Error deleting admin:', deleteError)
      throw deleteError
    }

    // If user_id exists, delete the auth user as well
    if (userId) {
      console.log('🗑️ Deleting auth user:', userId)
      console.log('🔑 Using service role key:', supabaseKey ? 'YES' : 'NO')
      console.log('🔑 Service role key starts with:', supabaseKey?.substring(0, 20) + '...')
      
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) {
        console.error('❌ Error deleting auth user:', authError)
        console.error('❌ Auth error details:', JSON.stringify(authError, null, 2))
        // Don't throw - admin is already deleted from table
      } else {
        console.log('✅ Auth user deleted successfully')
      }
    } else {
      console.log('⚠️ No user_id found for admin, skipping auth deletion')
    }

    console.log('✅ Admin deleted successfully')
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error deleting admin:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
