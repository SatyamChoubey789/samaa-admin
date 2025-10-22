// components/guards/admin-guard.tsx
"use client"
import { useAuth } from "@/lib/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Not authenticated at all
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      // Authenticated but requires admin role
      if (requireAdmin && user?.role !== 'admin') {
        router.push("/admin") // Redirect to main admin page
        return
      }
    }
  }, [loading, isAuthenticated, user, requireAdmin, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Authenticated but not admin (when admin required)
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Access denied. Redirecting...</p>
        </div>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}