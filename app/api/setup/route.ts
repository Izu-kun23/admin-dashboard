import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    console.log('🔨 Creating admin:', { email, name })

    if (!email || !password || !name) {
      console.error('❌ Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use service role to create user (this bypasses RLS)
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()
    const user = existingUser.users.find(u => u.email === email)

    let userId: string

    if (user) {
      // User already exists
      console.log('User already exists:', user.id)
      userId = user.id
    } else {
      // Create new user in auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) {
        console.error('Error creating user:', authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      userId = authData.user.id
      console.log('New user created:', userId)
    }

    // Add user to admins table
    console.log('📝 Upserting admin to database with user_id:', userId)
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .upsert({
        user_id: userId,
        email,
        name,
        password,
        role: 'admin',
      }, {
        onConflict: 'email'
      })
      .select()
      .single()

    if (adminError) {
      console.error('❌ Error adding to admins table:', adminError)
      // Only try to delete the user if we just created it
      if (!user) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return NextResponse.json({ error: adminError.message }, { status: 400 })
    }

    console.log('✅ Admin added to database successfully:', adminData)
    return NextResponse.json({ 
      success: true, 
      message: 'Admin created successfully',
      data: adminData 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
