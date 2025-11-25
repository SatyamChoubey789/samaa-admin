"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import * as LucideIcons from "lucide-react"
import { Editor } from "@tiptap/react"
import { useToast } from "@/hooks/use-toast"

interface ExportMenuProps {
  editor: Editor | null
  title: string
}

export function ExportMenu({ editor, title }: ExportMenuProps) {
  const { toast } = useToast()

  if (!editor) return null

  // Export as Markdown
  const exportMarkdown = () => {
    try {
      // Get plain text with basic markdown formatting
      const content = editor.getText()
      const blob = new Blob([content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "story"}.md`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Exported as Markdown",
        description: "Your story has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export as markdown",
        variant: "destructive",
      })
    }
  }

  // Export as HTML
  const exportHTML = () => {
    try {
      const html = editor.getHTML()
      const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || "Story"}</title>
    <style>
        body {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
        }
        h1, h2, h3 { margin-top: 1.5em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin-left: 0; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    ${html}
</body>
</html>
      `.trim()

      const blob = new Blob([fullHTML], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "story"}.html`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Exported as HTML",
        description: "Your story has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export as HTML",
        variant: "destructive",
      })
    }
  }

  // Export as JSON
  const exportJSON = () => {
    try {
      const json = editor.getJSON()
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "story"}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Exported as JSON",
        description: "Your story has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export as JSON",
        variant: "destructive",
      })
    }
  }

  // Export as Plain Text
  const exportText = () => {
    try {
      const text = editor.getText()
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "story"}.txt`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Exported as Text",
        description: "Your story has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export as text",
        variant: "destructive",
      })
    }
  }

  // Export as PDF (using browser print)
  const exportPDF = () => {
    try {
      const html = editor.getHTML()
      const printWindow = window.open("", "_blank")
      
      if (!printWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups to export as PDF",
          variant: "destructive",
        })
        return
      }

      printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>${title || "Story"}</title>
    <style>
        body {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
        }
        h1, h2, h3 { margin-top: 1.5em; page-break-after: avoid; }
        table { border-collapse: collapse; width: 100%; page-break-inside: avoid; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin-left: 0; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 4px; overflow-x: auto; page-break-inside: avoid; }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <h1>${title || "Story"}</h1>
    ${html}
    <script>
        window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 100);
        }
    </script>
</body>
</html>
      `)
      printWindow.document.close()

      toast({
        title: "Opening print dialog",
        description: "Save as PDF from the print dialog",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not open print dialog",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <LucideIcons.Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportPDF}>
          <LucideIcons.FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportHTML}>
          <LucideIcons.Code className="h-4 w-4 mr-2" />
          Export as HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportMarkdown}>
          <LucideIcons.FileCode className="h-4 w-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <LucideIcons.Braces className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportText}>
          <LucideIcons.FileText className="h-4 w-4 mr-2" />
          Export as Plain Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}