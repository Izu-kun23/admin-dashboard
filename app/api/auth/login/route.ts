import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Hardcoded credentials for temporary use
const HARDCODED_EMAIL = 'izuchukwuonuoha6@gmail.com'
const HARDCODED_PASSWORD = '12345678'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check hardcoded credentials
    if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    // Return success with admin data
    return NextResponse.json({
      success: true,
      admin: {
        email: HARDCODED_EMAIL,
        name: 'Admin User',
        role: 'admin',
      },
    })
  } catch (error: any) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
