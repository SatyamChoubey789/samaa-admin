"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { EditorContent, useEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import * as LucideIcons from "lucide-react"
import { getEditorExtensions } from "@/lib/editor-extensions"
import { EditorToolbar } from "@/components/EditorToolbar"
import { ExportMenu } from "@/components/ExportMenu"

export function StoryEditor({
  storyId,
  initial,
}: {
  storyId: string
  initial?: any
}) {
  const { toast } = useToast()
  const { api } = useAuth()
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(initial?.title || "")
  const [slug, setSlug] = useState(initial?.slug || "")
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "")
  const [imageUrl, setImageUrl] = useState(initial?.image_url || "")
  const [author, setAuthor] = useState(initial?.author || "")
  const [published, setPublished] = useState(initial?.published || false)
  const [ctaText, setCtaText] = useState(initial?.cta_text || "It's your turn to twist it →")
  const [ctaLink, setCtaLink] = useState(initial?.cta_link || "https://substack.com/@samaacircle")
  const [metaDescription, setMetaDescription] = useState(initial?.excerpt || initial?.meta_description || "")
  
  const metaDescriptionMaxLength = 160

  const getInitialContent = () => {
    if (!initial?.content) return "<p>Start writing your story...</p>"
    
    if (typeof initial.content === "string") {
      try {
        return JSON.parse(initial.content)
      } catch (e) {
        console.error("Failed to parse content:", e)
        return "<p>Start writing your story...</p>"
      }
    }
    
    return initial.content
  }

  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: getInitialContent(),
    immediatelyRender: false,
    autofocus: true,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none prose-gray dark:prose-invert focus:outline-none min-h-[500px] px-4 py-2",
      },
    },
  })

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!initial?.slug) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your story",
        variant: "destructive",
      })
      return
    }

    if (!slug.trim()) {
      toast({
        title: "Slug required",
        description: "Please enter a URL slug",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        subtitle: subtitle.trim() || null,
        content: editor?.getJSON() || {},
        author: author.trim() || null,
        image_url: imageUrl.trim() || null,
        cta_text: ctaText.trim() || null,
        cta_link: ctaLink.trim() || null,
        excerpt: metaDescription.trim() || null,
        published,
      }

      const isNewStory = storyId.startsWith("s_")
      const url = isNewStory
        ? `/api/v1/stories`
        : `/api/v1/stories/${storyId}`

      if (isNewStory) {
        await api.post(url, payload)
      } else {
        await api.put(url, payload)
      }

      toast({
        title: "Success!",
        description: `Story ${isNewStory ? "created" : "updated"} successfully`,
      })

      if (isNewStory) {
        router.push(`/admin/stories`)
      }
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!editor) return null

  // Word count
  const wordCount = editor.storage.characterCount?.words?.() || 0
  const charCount = editor.storage.characterCount?.characters?.() || 0

  return (
    <div className="grid gap-4">
      {/* Metadata Section */}
      <div className="glass rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Story Details</h3>
          <ExportMenu editor={editor} title={title} />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter story title"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">URL Slug *</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-slug"
          />
          <p className="text-xs text-gray-500">
            Will appear as: /stories/{slug || "your-slug"}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Optional subtitle"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image">Cover Image URL</Label>
          <Input
            id="image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      {/* SEO Section */}
      <div className="glass rounded-lg p-4 space-y-4 bg-blue-50/50">
        <div className="flex items-center gap-2">
          <LucideIcons.Search className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-700">SEO & Social Sharing</h3>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="meta_description">
            Meta Description *
            <span className="text-xs text-gray-500 ml-2">
              ({metaDescription.length}/{metaDescriptionMaxLength} characters)
            </span>
          </Label>
          <Textarea
            id="meta_description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value.slice(0, metaDescriptionMaxLength))}
            placeholder="A brief, compelling summary of your story (150-160 characters recommended)"
            rows={3}
            maxLength={metaDescriptionMaxLength}
          />
          <p className="text-xs text-gray-500">
            This appears in search results and when shared on social media.
          </p>
        </div>

        {metaDescription && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-gray-500 mb-2">Search Result Preview:</p>
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-blue-600 text-sm font-medium mb-1">
                {title || "Your Story Title"}
              </div>
              <div className="text-xs text-green-700 mb-1">
                samaabysiblings.com › stories › {slug || "your-slug"}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {metaDescription}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="glass rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Call to Action (CTA)</h3>
        
        <div className="grid gap-2">
          <Label htmlFor="cta_text">CTA Text</Label>
          <Input
            id="cta_text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="It's your turn to twist it →"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cta_link">CTA Link</Label>
          <Input
            id="cta_link"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            placeholder="https://substack.com/@samaacircle"
          />
        </div>

        {ctaText && ctaLink && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2">Preview:</p>
            <div className="text-right">
              <a
                href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 underline italic text-sm"
              >
                {ctaText}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {wordCount} words · {charCount} characters
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Story"}
        </Button>
      </div>

      {/* Editor Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Content */}
      <div className="glass rounded-lg min-h-[500px]">
        <EditorContent editor={editor} />
      </div>

      {/* Bubble Menu for quick formatting */}
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex gap-1 rounded-md border bg-background/95 backdrop-blur p-1 shadow-lg"
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-200" : ""}
          >
            <LucideIcons.Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-gray-200" : ""}
          >
            <LucideIcons.Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "bg-gray-200" : ""}
          >
            <LucideIcons.Underline className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const url = window.prompt("Enter URL")
              if (url) editor.chain().focus().setLink({ href: url }).run()
            }}
            className={editor.isActive("link") ? "bg-gray-200" : ""}
          >
            <LucideIcons.Link2 className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
    </div>
  )
}