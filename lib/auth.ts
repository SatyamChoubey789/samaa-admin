import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = db.users.find((u) => u.email === credentials.email && u.passwordHash === credentials.password)
        if (!user) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.uid = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token as any).uid,
        role: (token as any).role,
      } as any
      return session
    },
  },
  pages: { signIn: "/login" },
}
