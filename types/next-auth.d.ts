import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: "admin" | "editor" | "support"
    }
  }
  interface User {
    id: string
    role: "admin" | "editor" | "support"
  }
}
