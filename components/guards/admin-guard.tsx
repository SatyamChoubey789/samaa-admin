import type React from "react"
import { canAccess } from "@/lib/rbac"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminGuard({
  children,
  pathname,
}: {
  children: React.ReactNode
  pathname: string
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if (!canAccess(pathname, session.user?.role as any)) redirect("/admin")
  return <>{children}</>
}
