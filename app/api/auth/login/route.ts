import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Check DATABASE_URL first (critical for deployment)
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set')
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          hint: process.env.VERCEL 
            ? 'Please set DATABASE_URL in Vercel → Settings → Environment Variables'
            : 'Please set DATABASE_URL in your .env file'
        },
        { status: 500 }
      )
    }

    // Verify Prisma is initialized
    if (!prisma) {
      console.error('❌ Prisma client is not initialized')
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    // Check if admin model exists
    if (!('admin' in prisma)) {
      console.error('❌ Admin model not found in Prisma client')
      return NextResponse.json(
        { error: 'Database model not available. Please restart the server.' },
        { status: 500 }
      )
    }

    const { email, password } = await request.json()

    console.log('🔐 Login attempt:', { 
      email, 
      passwordLength: password?.length
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

    // Ensure database connection is established (important for serverless)
    try {
      await prisma.$connect()
    } catch (connectError: any) {
      console.error('❌ Database connection error:', connectError.message)
      // Continue anyway - connection might already be established
    }

    // Fetch admin from database
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    })

    if (!admin) {
      console.log('❌ Admin not found:', normalizedEmail)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password if stored
    if (admin.password) {
      const passwordMatch = await bcrypt.compare(password, admin.password)
      if (!passwordMatch) {
        console.log('❌ Invalid password for admin:', normalizedEmail)
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
    } else {
      // If no password is stored, we might want to allow login without password
      // or require password setup. For security, we'll reject login without password.
      console.log('❌ Admin has no password set:', normalizedEmail)
      return NextResponse.json(
        { error: 'Password not configured. Please contact administrator.' },
        { status: 401 }
      )
    }

    console.log('✅ Credentials validated, setting session cookie...')

    // Set session cookie with proper settings for Vercel/production
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
    const isVercel = process.env.VERCEL === '1'
    
    // For Vercel, always use secure cookies (HTTPS is always used)
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction || isVercel, // Always secure on Vercel
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    }
    
    try {
      cookieStore.set('admin_session', 'authenticated', cookieOptions)
    } catch (cookieError: any) {
      console.error('❌ Failed to set cookie:', cookieError.message)
      // Continue - we'll set it in response headers
    }

    console.log('✅ Session cookie set successfully')

    // Return success with admin data (excluding password)
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
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
    console.error('❌ Error name:', error?.name)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error code:', error?.code)
    console.error('❌ Error stack:', error?.stack)
    
    // Provide more detailed error information in development
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? {
          message: error?.message,
          name: error?.name,
          code: error?.code,
          stack: error?.stack,
        }
      : undefined

    return NextResponse.json(
      { 
        error: 'An error occurred during login',
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
