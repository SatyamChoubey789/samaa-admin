"use client"
import useSWR, { mutate } from "swr"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-provider"
import { Loader2, ArrowLeft } from "lucide-react"
import type { User } from "@/types/user"

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { api } = useAuth()

  const fetcher = async (url: string): Promise<User> => {
    return await api.get<User>(url)
  }

  const { data: user, error, isLoading } = useSWR<User>(`/api/v1/users/${id}`, fetcher)

  const handleRoleChange = async (newRole: string) => {
    try {
      await api.put(`/api/v1/users/${id}`, { role: newRole })

      toast({ 
        title: "Success", 
        description: "User role updated successfully" 
      })
      
      // Revalidate data
      mutate(`/api/v1/users/${id}`)
      mutate(`/api/v1/users`)
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update user role",
        variant: "destructive"
      })
    }
  }

  if (error) {
    return (
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold">Edit user</h2>
        <div className="glass rounded-lg p-8 text-center">
          <p className="text-red-500 font-medium mb-2">Failed to load user data</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "Please try again"}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold">Edit user</h2>
        <div className="glass rounded-lg p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit user</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="glass rounded-lg p-6 grid gap-6">
        {/* User Profile */}
        <div className="flex items-center gap-4 pb-4 border-b">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.email_verified && (
              <Badge variant="outline" className="mt-2 text-xs">
                ✓ Email Verified
              </Badge>
            )}
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              User ID
            </label>
            <div className="mt-1 text-sm font-mono">{user.id}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Authentication Provider
            </label>
            <div className="mt-1">
              <Badge variant="secondary">
                {user.google_id ? '🔗 Google OAuth' : '✉️ Email/Password'}
              </Badge>
            </div>
          </div>

          {user.created_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Member since
              </label>
              <div className="mt-1 text-sm">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}

          {user.last_login && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last login
              </label>
              <div className="mt-1 text-sm">
                {new Date(user.last_login).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>

        {/* Role Management */}
        <div className="pt-4 border-t">
          <label className="text-sm font-medium block mb-3">
            User Role
          </label>
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="support">Support</option>
          </select>
          
          <div className="mt-3 p-3 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground">
              {user.role === 'admin' && (
                <>
                  <strong>Admin:</strong> Full system access including user management, 
                  settings, and all content operations.
                </>
              )}
              {user.role === 'editor' && (
                <>
                  <strong>Editor:</strong> Can create, edit, and manage content. 
                  Limited access to system settings.
                </>
              )}
              {user.role === 'support' && (
                <>
                  <strong>Support:</strong> Limited access for customer support tasks. 
                  Can view but not modify most content.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}