import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const u = db.users.find((u) => u.id === params.id)
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { passwordHash, ...rest } = u
  return NextResponse.json(rest)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const idx = db.users.findIndex((u) => u.id === params.id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json()
  db.users[idx] = { ...db.users[idx], ...body }
  const { passwordHash, ...rest } = db.users[idx]
  return NextResponse.json(rest)
}
