import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// DELETE - Delete an admin by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🗑️ Deleting admin with ID:', id)

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

    // First, get the admin to get the user_id
    const { data: adminData, error: fetchError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('id', id)

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
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Error deleting admin:', deleteError)
      throw deleteError
    }

    // If user_id exists, delete the auth user as well
    if (userId) {
      console.log('🗑️ Deleting auth user:', userId)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) {
        console.error('❌ Error deleting auth user:', authError)
        // Don't throw - admin is already deleted from table
      }
    }

    console.log('✅ Admin deleted successfully')
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error deleting admin:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
