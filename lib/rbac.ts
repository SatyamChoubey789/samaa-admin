export type Role = "admin" | "editor" | "support"

export function canAccess(pathname: string, role?: Role) {
  if (!role) return false
  const adminOnly = ["/admin/settings", "/admin/users"]
  if (adminOnly.some((p) => pathname.startsWith(p))) return role === "admin"
  return ["admin", "editor", "support"].includes(role)
}
