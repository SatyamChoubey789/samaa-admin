// lib/auth-provider.tsx
"use client"
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createApiClient } from './api-client'
import type { User, AuthResponse, UserResponse } from '@/types/user'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.samaabysiblings.com/backend'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
  getAccessToken: () => Promise<string | null>
  isAuthenticated: boolean
  api: ReturnType<typeof createApiClient>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't need authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))

  // Refresh token function
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        // Don't log errors on public routes
        if (!isPublicRoute) {
          const errorData = await res.json().catch(() => ({}))
          console.error('Token refresh failed:', res.status, errorData)
        }
        throw new Error('Failed to refresh token')
      }

      const data: AuthResponse = await res.json()
      setAccessToken(data.accessToken)
      return data.accessToken
    } catch (err) {
      // Only log errors if not on public routes
      if (!isPublicRoute) {
        console.error('Token refresh error:', err)
      }
      setAccessToken(null)
      setUser(null)
      return null
    }
  }

  // Get current access token (refresh if needed)
  const getAccessToken = async (): Promise<string | null> => {
    if (accessToken) {
      return accessToken
    }
    // Only try to refresh if not on public route
    if (isPublicRoute) {
      return null
    }
    return await refreshAccessToken()
  }

  // Fetch current user
  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch user')
      }

      const data: UserResponse = await res.json()
      setUser(data.user)
    } catch (err) {
      if (!isPublicRoute) {
        console.error('Fetch user failed:', err)
      }
      setUser(null)
      setAccessToken(null)
    }
  }

  // Create API client with token refresh
  const api = useMemo(() => createApiClient(getAccessToken), [accessToken])

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      // Skip token refresh on public routes
      if (isPublicRoute) {
        setLoading(false)
        return
      }

      const token = await refreshAccessToken()
      if (token) {
        await fetchCurrentUser(token)
      }
      setLoading(false)
    }
    init()
  }, [pathname]) // Re-run when route changes

  // Auto-refresh token before expiry (every 10 minutes)
  useEffect(() => {
    if (!accessToken || isPublicRoute) return

    const interval = setInterval(async () => {
      const token = await refreshAccessToken()
      if (token) {
        await fetchCurrentUser(token)
      }
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [accessToken, pathname])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })

    const data: AuthResponse = await res.json()

    if (!res.ok) {
      throw new Error(data.ok ? 'Login failed' : (data as any).error || 'Login failed')
    }

    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    })

    const data: AuthResponse = await res.json()

    if (!res.ok) {
      throw new Error(data.ok ? 'Signup failed' : (data as any).error || 'Signup failed')
    }

    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setAccessToken(null)
      setUser(null)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshAccessToken,
        getAccessToken,
        isAuthenticated: !!user,
        api
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}