import type React from "react"
import { Preloader } from "@/components/preloader"
import { AdminShell } from "@/components/shell/admin-shell"
import AdminGuard from "@/components/guards/admin-guard"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <AdminGuard pathname="/admin">
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </>
  )
}
