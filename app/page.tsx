import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // All authenticated users are admins
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    // If there's any error (missing env vars, Supabase unavailable, etc.)
    // Redirect to login page as a safe fallback
    console.error('Error in root page:', error)
    redirect('/login')
  }
}
