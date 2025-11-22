// components/shell/admin-shell.tsx
"use client";
import type React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { useState } from "react";
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BookOpen,
  Mail,
  Settings,
  Briefcase,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/admin/stories", label: "Stories", icon: BookOpen },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) {
      return user?.role === "admin";
    }
    return true;
  });

  const Sidebar = (
    <aside className="h-full w-full p-4 glass flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin" className="font-semibold tracking-tight text-lg">
          SAMAA
        </Link>
        {user && (
          <Badge variant="secondary" className="text-xs">
            {user.role}
          </Badge>
        )}
      </div>

      <Separator className="my-4" />

      <nav className="grid gap-1 flex-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-secondary"
              )}
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      {user && (
        <>
          <Separator className="my-4" />
          <div className="mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen flex md:grid md:grid-cols-[16rem_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:h-screen md:sticky md:top-0">
        {Sidebar}
      </div>

      {/* Mobile Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64" title="Navigation">
          {Sidebar}
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col w-full">
        {/* Header */}
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b"
        >
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            {/* Welcome Message */}
            <div className="flex items-center gap-3 ml-12 md:ml-0">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome back,
              </span>
              <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                {user?.name}
              </span>
              {(Boolean((user as any)?.email_verified) ||
                Boolean((user as any)?.emailVerified)) && (
                <Badge
                  variant="outline"
                  className="text-xs hidden sm:inline-flex"
                >
                  ✓ Verified
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="gap-2"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {theme === "dark" ? "Light" : "Dark"}
                </span>
              </Button>

              {/* Logout Button */}
              <Button size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 w-full max-w-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t py-4 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© 2025 SAMAA. All rights reserved.</p>
            <p>
              Logged in as <span className="font-medium">{user?.role}</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
