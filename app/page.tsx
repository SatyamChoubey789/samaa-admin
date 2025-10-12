import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="grid place-items-center min-h-screen p-6">
      <div className="max-w-2xl text-center grid gap-6">
        <div className="grid gap-2">
          <h1 className="text-balance">SAMAA — Minimal, elegant admin</h1>
          <p className="text-muted-foreground text-pretty">
            Manage products, orders, users, stories, and subscribers with a glassy, animated dashboard.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
