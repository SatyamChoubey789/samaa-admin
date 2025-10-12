"use client"

import type React from "react"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("admin@samaa.co")
  const [password, setPassword] = useState("admin@1975")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (!res || res.error) {
      toast({ title: "Login failed", description: "Check your credentials." })
      return
    }
    router.replace("/admin")
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="glass rounded-xl p-6 w-full max-w-sm grid gap-4">
        <h1 className="text-center">Welcome back</h1>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="focus-ring" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring"
          />
        </div>
        <Button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
    </main>
  )
}
