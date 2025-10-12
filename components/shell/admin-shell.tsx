"use client"

import type React from "react"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { Menu } from "lucide-react"

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/settings", label: "Settings" },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { data } = useSession()
  const [open, setOpen] = useState(false)

  const Sidebar = (
    <aside className="h-full w-64 p-4 glass">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="font-semibold tracking-tight">
          SAMAA
        </Link>
      </div>
      <Separator className="my-4" />
      <nav className="grid gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-secondary",
            )}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto" />
    </aside>
  )

  return (
    <div className="min-h-screen grid md:grid-cols-[16rem_1fr]">
      <div className="hidden md:block">{Sidebar}</div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="m-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0" title={undefined}>
          {Sidebar}
        </SheetContent>
      </Sheet>
      <div className="flex min-h-screen flex-col">
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Welcome</span>
              <span className="text-sm font-medium">{data?.user?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                Toggle {theme === "dark" ? "Light" : "Dark"}
              </Button>
              <Button size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </div>
          </div>
        </motion.header>
        <main className="flex-1 p-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
