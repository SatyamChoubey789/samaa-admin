import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, password, role } = body || {}
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const exists = db.users.find((u) => u.email === email)
  if (exists) {
    return NextResponse.json({ error: "User exists" }, { status: 409 })
  }
  const user = {
    id: `u_${Date.now()}`,
    name: name || email.split("@")[0],
    email,
    passwordHash: password,
    role: role || "editor",
  }
  db.users.push(user)
  return NextResponse.json({ ok: true })
}
