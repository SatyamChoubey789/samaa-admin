"use client"

import useSWR from "swr"
import { useParams, useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data } = useSWR(`/api/users/${id}`, fetcher)
  const user = data

  if (!user) return <div className="glass rounded-lg p-4">Loading…</div>

  return (
    <div className="grid gap-4">
      <h2>Edit user</h2>
      <div className="glass rounded-lg p-4">
        <div className="text-sm">Name: {user.name}</div>
        <div className="text-sm">Email: {user.email}</div>
        <div className="mt-3">
          <label className="text-sm">Role</label>
          <select
            defaultValue={user.role}
            onChange={async (e) => {
              await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: e.target.value }),
              })
              router.refresh()
            }}
            className="mt-1 rounded-md border bg-background px-3 py-2"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="support">Support</option>
          </select>
        </div>
      </div>
    </div>
  )
}
