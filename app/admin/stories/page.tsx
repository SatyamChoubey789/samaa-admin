"use client"

import { useStories, useDeleteStory } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Story {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: "draft" | "published" | "archived"
  author: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

const statusColors = {
  draft: "secondary",
  published: "default",
  archived: "secondary",
} as const

export default function StoriesPage() {
  const { data: stories = [], isLoading, error } = useStories()
  const deleteStory = useDeleteStory()

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      try {
        await deleteStory.mutateAsync(id)
        toast({
          title: "Success",
          description: "Story deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete story",
          variant: "destructive",
        })
      }
    }
  }

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (story: Story) => (
        <div>
          <div className="font-medium">{story.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">{story.excerpt}</div>
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
    },
    {
      key: "status",
      header: "Status",
      render: (story: Story) => (
        <Badge variant={statusColors[story.status]}>
          {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (story: Story) =>
        story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : "Not published",
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      render: (story: Story) => new Date(story.updatedAt).toLocaleDateString(),
    },
  ]

  const actions = (story: Story) => (
    <>
      <DropdownMenuItem asChild>
        <Link href={`/admin/stories/${story.id}/edit`} className="flex items-center">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`/blog/${story.slug}`} target="_blank" className="flex items-center">
          <Eye className="mr-2 h-4 w-4" />
          View
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDelete(story.id)} className="text-destructive focus:text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </>
  )

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load stories. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stories</h1>
          <p className="text-muted-foreground">Manage your blog posts and articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/stories/new">
            <Plus className="mr-2 h-4 w-4" />
            New Story
          </Link>
        </Button>
      </div>

      <DataTable data={stories} columns={columns} searchKey="title" actions={actions} isLoading={isLoading} />
    </div>
  )
}
