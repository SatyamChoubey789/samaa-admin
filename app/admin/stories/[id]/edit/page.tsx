"use client"

import { useStory, useUpdateStory } from "@/lib/api-hooks"
import { FormWrapper } from "@/components/form-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Eye } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

const storySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]),
  tags: z.string().optional(),
})

type StoryFormData = z.infer<typeof storySchema>

export default function EditStoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: story, isLoading, error } = useStory(params.id)
  const updateStory = useUpdateStory()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
  })

  // Reset form when story data loads
  useEffect(() => {
    if (story) {
      reset({
        title: story.title,
        slug: story.slug,
        excerpt: story.excerpt,
        content: story.content,
        status: story.status,
        tags: story.tags?.join(", ") || "",
      })
    }
  }, [story, reset])

  const onSubmit = async (data: StoryFormData) => {
    try {
      const storyData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      }
      await updateStory.mutateAsync({ id: params.id, data: storyData })
      toast({
        title: "Success",
        description: "Story updated successfully",
      })
      router.push("/admin/stories")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update story",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !story) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load story. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/stories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/blog/${story.slug}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>
      </div>

      <FormWrapper title="Edit Story" description="Update your blog post or article">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} placeholder="Enter story title" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register("slug")} placeholder="url-friendly-slug" />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              <p className="text-xs text-muted-foreground">URL: /blog/{watch("slug") || "your-slug"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" {...register("excerpt")} placeholder="Brief description of the story" rows={3} />
            {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Write your story content here..."
              rows={12}
              className="font-mono text-sm"
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            <p className="text-xs text-muted-foreground">Supports Markdown formatting</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" {...register("tags")} placeholder="tag1, tag2, tag3" />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value: "draft" | "published" | "archived") => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Story"
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/stories">Cancel</Link>
            </Button>
          </div>
        </form>
      </FormWrapper>
    </div>
  )
}
