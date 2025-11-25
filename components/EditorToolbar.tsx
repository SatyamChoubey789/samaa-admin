"use client"

import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import { Editor } from "@tiptap/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useRef } from "react"

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  // Text Formatting
  const textColors = [
    { label: "Black", value: "#000000" },
    { label: "Red", value: "#FF0000" },
    { label: "Blue", value: "#0000FF" },
    { label: "Green", value: "#00FF00" },
    { label: "Orange", value: "#FFA500" },
    { label: "Purple", value: "#800080" },
  ]

  const highlightColors = [
    { label: "Yellow", value: "#FFFF00" },
    { label: "Green", value: "#90EE90" },
    { label: "Pink", value: "#FFB6C1" },
    { label: "Orange", value: "#FFD580" },
    { label: "Blue", value: "#ADD8E6" },
  ]

  const setLink = () => {
    const url = window.prompt("Enter URL")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addYouTubeVideo = () => {
    const url = window.prompt("Enter YouTube URL")
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert to base64 for demo (in production, upload to your server/cloud)
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      editor.chain().focus().setImage({ src: base64 }).run()
    }
    reader.readAsDataURL(file)
  }

  const addImageFromUrl = () => {
    const url = window.prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border bg-background/50 p-2 shadow-sm sticky top-0 z-10">
      {/* Text Formatting */}
      <div className="flex gap-1">
        <Button
          size="icon"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <LucideIcons.Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <LucideIcons.Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <LucideIcons.Underline className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <LucideIcons.Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Text Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" title="Text Color">
            <LucideIcons.Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {textColors.map((color) => (
            <DropdownMenuItem
              key={color.value}
              onClick={() => editor.chain().focus().setColor(color.value).run()}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: color.value }}
                />
                {color.label}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Remove Color
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" title="Highlight">
            <LucideIcons.Highlighter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {highlightColors.map((color) => (
            <DropdownMenuItem
              key={color.value}
              onClick={() =>
                editor.chain().focus().toggleHighlight({ color: color.value }).run()
              }
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: color.value }}
                />
                {color.label}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            Remove Highlight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8" />

      {/* Headings */}
      <div className="flex gap-1">
        <Button
          size="icon"
          variant={editor.isActive("paragraph") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Paragraph"
        >
          <LucideIcons.Pilcrow className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <LucideIcons.Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <LucideIcons.Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <LucideIcons.Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Alignment */}
      <div className="flex gap-1">
        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align Left"
        >
          <LucideIcons.AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align Center"
        >
          <LucideIcons.AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align Right"
        >
          <LucideIcons.AlignRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          title="Justify"
        >
          <LucideIcons.AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Lists */}
      <div className="flex gap-1">
        <Button
          size="icon"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <LucideIcons.List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <LucideIcons.ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <LucideIcons.Quote className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Insert Media */}
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" onClick={setLink} title="Add Link">
          <LucideIcons.Link2 className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" title="Add Image">
              <LucideIcons.Image className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <LucideIcons.Upload className="h-4 w-4 mr-2" />
              Upload Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addImageFromUrl}>
              <LucideIcons.Link className="h-4 w-4 mr-2" />
              Image from URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={addYouTubeVideo}
          title="Embed YouTube"
        >
          <LucideIcons.Youtube className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Table */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" title="Table">
            <LucideIcons.Table className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
            }
          >
            <LucideIcons.Plus className="h-4 w-4 mr-2" />
            Insert Table (3x3)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
          >
            <LucideIcons.ArrowDown className="h-4 w-4 mr-2" />
            Add Row Below
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
          >
            <LucideIcons.ArrowRight className="h-4 w-4 mr-2" />
            Add Column Right
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
          >
            <LucideIcons.Trash2 className="h-4 w-4 mr-2" />
            Delete Row
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
          >
            <LucideIcons.Trash2 className="h-4 w-4 mr-2" />
            Delete Column
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
          >
            <LucideIcons.X className="h-4 w-4 mr-2" />
            Delete Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <LucideIcons.Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-8" />

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <LucideIcons.Undo className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <LucideIcons.Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}