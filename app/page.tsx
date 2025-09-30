"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
  if (!loading) {
    if (!user) {
      router.push("/login")
    } else if (isAdmin) {
      router.push("/admin")
    } else {
      // Optional: Redirect to a "not authorized" page or logout user here
      router.push("/login")
    }
  }
}, [user, loading, isAdmin, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
