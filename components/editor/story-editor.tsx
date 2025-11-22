"use client"

import { useEffect, useRef, useState } from "react"
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
  
  // New: Meta Description (SEO)
  const [metaDescription, setMetaDescription] = useState(initial?.excerpt || initial?.meta_description || "")
  const metaDescriptionMaxLength = 160

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lowlight = createLowlight(common)

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
        excerpt: metaDescription.trim() || null, // Using excerpt column for meta description
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
        <h3 className="text-sm font-semibold text-gray-700">Story Details</h3>
        
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

      {/* SEO Section - NEW */}
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
            This appears in search results and when shared on social media. Keep it engaging and under 160 characters.
          </p>
        </div>

        {/* Preview */}
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