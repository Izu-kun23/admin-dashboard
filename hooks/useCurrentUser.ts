'use client'

import { useState, useEffect, useCallback } from 'react'
import { DUMMY_ADMINS } from '@/lib/dummy-data'

interface User {
  name: string
  email: string
  id?: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Only run on client side
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }
        
        // Check for admin session cookie
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) return parts.pop()?.split(';').shift()
          return null
        }

        const sessionCookie = getCookie('admin_session')
        console.log('🔍 [useCurrentUser] Checking session cookie...', sessionCookie)

        if (sessionCookie && sessionCookie === 'authenticated') {
          // Session exists, return dummy admin user
          const dummyAdmin = DUMMY_ADMINS[0]
          console.log('✅ [useCurrentUser] Session found, returning dummy admin:', {
            name: dummyAdmin.name,
            email: dummyAdmin.email,
            id: dummyAdmin.userId
          })
          setUser({
            name: dummyAdmin.name,
            email: dummyAdmin.email,
            id: dummyAdmin.userId
          })
        } else {
          console.log('❌ [useCurrentUser] No session found')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ [useCurrentUser] Error checking session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  // Function to get current user ID (memoized to prevent recreation)
  const getCurrentUserId = useCallback(() => {
    return user?.id || null
  }, [user?.id])

  // Function to check if user is authenticated (memoized to prevent recreation)
  const isAuthenticated = useCallback(() => {
    return !!user?.id
  }, [user?.id])

  return {
    user,
    loading,
    getCurrentUserId,
    isAuthenticated
  }
}
