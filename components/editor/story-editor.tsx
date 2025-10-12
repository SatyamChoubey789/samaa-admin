"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { EditorContent, useEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Heading from "@tiptap/extension-heading"
import TextAlign from "@tiptap/extension-text-align"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import Blockquote from "@tiptap/extension-blockquote"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Placeholder from "@tiptap/extension-placeholder"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import { createLowlight, common } from "lowlight"
import * as LucideIcons from "lucide-react"
import { motion } from "framer-motion"

const API_BASE = "https://api.samaabysiblings.com/backend/api/v1"

export function StoryEditor({
  storyId,
  initial,
}: {
  storyId: string
  initial?: any
}) {
  const { toast } = useToast()
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
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const lowlight = createLowlight(common)

  // Parse initial content if needed
  const getInitialContent = () => {
    if (!initial?.content) return "<p>Start writing your story...</p>"
    
    // If content is a string, parse it
    if (typeof initial.content === "string") {
      try {
        return JSON.parse(initial.content)
      } catch (e) {
        console.error("Failed to parse content:", e)
        return "<p>Start writing your story...</p>"
      }
    }
    
    // If it's already an object, return it
    return initial.content
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      Underline,
      Link.configure({ openOnClick: true }),
      Image.configure({ inline: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      BulletList,
      OrderedList,
      Blockquote,
      CodeBlockLowlight.configure({ lowlight }),
      Table,
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: "Start writing your story…" }),
    ],
    content: getInitialContent(),
    immediatelyRender: false,
    autofocus: true,
    editorProps: {
      attributes: {
        class: "prose max-w-none prose-gray dark:prose-invert focus:outline-none min-h-[400px]",
      },
    },
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Auto-generate slug from title
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
        published,
      }

      const isNewStory = storyId.startsWith("s_")
      const url = isNewStory
        ? `${API_BASE}/stories`
        : `${API_BASE}/stories/${storyId}`

      const res = await fetch(url, {
        method: isNewStory ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to save story")
      }

      toast({
        title: "Success!",
        description: `Story ${isNewStory ? "created" : "updated"} successfully`,
      })

      if (isNewStory) {
        router.push(`/admin/stories/${data.data.id}/edit`)
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

  const setLink = () => {
    const url = window.prompt("Enter URL")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="grid gap-4">
      {/* Metadata Section */}
      <div className="glass rounded-lg p-4 space-y-4">
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
          <p className="text-xs text-gray-500">
            The text shown at the end of the story
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cta_link">CTA Link</Label>
          <Input
            id="cta_link"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            placeholder="https://substack.com/@samaacircle"
          />
          <p className="text-xs text-gray-500">
            Where the CTA link should go (use full URL with https://)
          </p>
        </div>

        {/* Preview */}
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
          Click save to store your changes
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Story"}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 rounded-lg border bg-background/50 p-2 shadow-sm">
        <Button
          size="icon"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <LucideIcons.Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <LucideIcons.Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <LucideIcons.Underline className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <LucideIcons.Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <LucideIcons.Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <LucideIcons.Heading3 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <LucideIcons.List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <LucideIcons.ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <LucideIcons.Quote className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={setLink}>
          <LucideIcons.Link2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={addImage}>
          <LucideIcons.Image className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
        >
          <LucideIcons.Table className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <LucideIcons.Code className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <LucideIcons.Undo className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <LucideIcons.Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="glass rounded-lg p-4 min-h-[400px] prose prose-slate dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>

      {/* Bubble menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex gap-1 rounded-md border bg-background/80 backdrop-blur p-1 shadow-sm"
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <LucideIcons.Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <LucideIcons.Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <LucideIcons.Underline className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
    </div>
  )
}