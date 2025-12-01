import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Hardcoded credentials for temporary use
const HARDCODED_EMAIL = 'izuchukwuonuoha6@gmail.com'
const HARDCODED_PASSWORD = '12345678'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Login attempt:', { 
      email, 
      passwordLength: password?.length,
      receivedEmail: email,
      expectedEmail: HARDCODED_EMAIL,
      emailMatch: email === HARDCODED_EMAIL,
      passwordMatch: password === HARDCODED_PASSWORD
    })

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Normalize email (trim and lowercase for comparison)
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedExpectedEmail = HARDCODED_EMAIL.trim().toLowerCase()

    // Check hardcoded credentials (case-insensitive email comparison)
    if (normalizedEmail !== normalizedExpectedEmail || password !== HARDCODED_PASSWORD) {
      console.log('❌ Invalid credentials:', {
        emailMatch: normalizedEmail === normalizedExpectedEmail,
        passwordMatch: password === HARDCODED_PASSWORD,
        providedEmail: normalizedEmail,
        expectedEmail: normalizedExpectedEmail
      })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ Credentials validated, setting session cookie...')

    // Set session cookie with proper settings for Vercel/production
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
    
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: isProduction, // Use secure in production (HTTPS required)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      // Don't set domain - let it use default (same domain)
    })

    console.log('✅ Session cookie set successfully')

    // Return success with admin data
    const response = NextResponse.json({
      success: true,
      admin: {
        email: HARDCODED_EMAIL,
        name: 'Admin User',
        role: 'admin',
      },
    }, { status: 200 })

    // Also set cookie in response headers for compatibility
    if (isProduction) {
      response.headers.set(
        'Set-Cookie',
        `admin_session=authenticated; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24}`
      )
    } else {
      response.headers.set(
        'Set-Cookie',
        `admin_session=authenticated; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24}`
      )
    }

    console.log('✅ Login successful, returning response')
    return response
  } catch (error: any) {
    console.error('❌ Login error:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'An error occurred during login', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
  }
}
