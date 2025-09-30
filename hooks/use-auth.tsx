"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, authApi } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
  try {
    const response = await authApi.getProfile()
    const userData = response.user || response // Handle both structures
    setUser(userData)
  } catch (error: any) {
   console.log('Auth check failed:', error.response?.status)
    setUser(null)
    // Remove automatic redirect from here
  } finally {
    setLoading(false)
  }
}

  const login = async (email: string, password: string) => {
    try {
     console.log('Attempting login...')
    const response = await authApi.login({ email, password })
    console.log('Login response:', response)
      const userData = await authApi.getProfile()
      if (userData.role === "admin") {
        setUser(userData)
        router.push("/admin")
      } else {
        toast({
          title: "Access Denied",
          description: "Admin access required",
          variant: "destructive",
        })
        await authApi.logout()
        setUser(null)
        router.push("/login")
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      await authApi.register({ name, email, password, confirmPassword })
      toast({
        title: "Registration Successful",
        description: "Your admin account has been created. Please sign in.",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Failed to create account",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
      router.push("/login")
    } catch {
      setUser(null)
      router.push("/login")
    }
  }

  const isAdmin = user?.role === "admin"

  if (loading) {
    return <div>Loading user info...</div> // Optional loading screen during auth check
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
