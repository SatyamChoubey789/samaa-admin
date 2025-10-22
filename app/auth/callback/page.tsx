// app/auth/callback/page.tsx
"use client"
import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.samaabysiblings.com/backend'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast({
        title: "Authentication failed",
        description: "Google authentication was unsuccessful",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    if (token) {
      // Store the access token temporarily
      // The auth provider will handle refreshing it
      sessionStorage.setItem('tempAccessToken', token)
      
      toast({
        title: "Success",
        description: "Logged in with Google"
      })
      
      // Redirect to admin, where the auth guard will pick up the session
      router.push('/admin')
    } else {
      router.push('/login')
    }
  }, [searchParams, router, toast])

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}