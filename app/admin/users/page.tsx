"use client"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-provider"
import type { User, UserListResponse } from "@/types/user"

export default function UsersPage() {
  const { api } = useAuth()
  
  const fetcher = async (url: string): Promise<UserListResponse> => {
    return await api.get<UserListResponse>(url)
  }

  const { data, error, isLoading } = useSWR<UserListResponse>('/api/v1/users', fetcher)
  const users: User[] = data?.items ?? []

  if (error) {
    return (
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold">Users</h2>
        <div className="glass rounded-lg p-8 text-center">
          <p className="text-red-500 font-medium mb-2">Failed to load users</p>
          <p className="text-sm text-muted-foreground">
            {error.message || "Please make sure you have admin access"}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold">Users</h2>
        <div className="glass rounded-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
        <Badge variant="secondary">{users.length} total</Badge>
      </div>

      <div className="glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{u.name}</div>
                        {u.last_login && (
                          <div className="text-xs text-muted-foreground">
                            Last login: {new Date(u.last_login).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {u.google_id ? '🔗 Google' : '✉️ Email'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.email_verified ? (
                      <Badge variant="outline" className="text-xs text-green-600">
                        ✓ Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-yellow-600">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/users/${u.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}