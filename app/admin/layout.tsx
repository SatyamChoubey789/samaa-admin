// app/admin/layout.tsx
import { Preloader } from "@/components/preloader"
import { AdminShell } from "@/components/shell/admin-shell"
import AdminGuard from "@/components/guards/admin-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </>
  )
}