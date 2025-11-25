"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Author {
  id: number
  slug: string
  name: string
  title?: string
  company?: string
  email?: string
  story_count: number
  created_at: string
}

export default function AuthorsPage() {
  const { api } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/v1/authors") as { data: { data: Author[] } }
      setAuthors(response.data.data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch authors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await api.delete(`/api/v1/authors/${deleteId}`)
      toast({
        title: "Success",
        description: "Author deleted successfully",
      })
      fetchAuthors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete author",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(search.toLowerCase()) ||
    author.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage story authors and their profiles
          </p>
        </div>
        <Button onClick={() => router.push("/admin/authors/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Author
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">{filteredAuthors.length} authors</Badge>
      </div>

      {/* Table */}
      <div className="glass rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Stories</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAuthors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No authors found
                </TableCell>
              </TableRow>
            ) : (
              filteredAuthors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {author.name}
                      <Link
                        href={`/authors/${author.slug}`}
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {author.title || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {author.email || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{author.story_count}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(author.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/authors/${author.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(author.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Author?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this author. Stories linked to this author will remain but show no author.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}