"use client"

import { useUsers, useDeleteUser } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Shield } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

const roleColors = {
  admin: "default",
  user: "secondary",
} as const

const statusColors = {
  active: "default",
  inactive: "secondary",
} as const

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useUsers()
  const deleteUser = useDeleteUser()

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser.mutateAsync(id)
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      }
    }
  }

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (user: any) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: any) => (
        <Badge variant={roleColors[user.role as keyof typeof roleColors]} className="flex items-center gap-1 w-fit">
          {user.role === "admin" && <Shield className="h-3 w-3" />}
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: any) => (
        <Badge variant={statusColors[user.status as keyof typeof statusColors]}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user: any) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (user: any) => (user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"),
    },
  ]

  const actions = (user: any) => (
    <>
      <DropdownMenuItem asChild>
        <Link href={`/admin/users/${user.id}/edit`} className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive focus:text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </>
  )

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load users. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
      </div>

      <DataTable data={users} columns={columns} searchKey="name" actions={actions} isLoading={isLoading} />
    </div>
  )
}
