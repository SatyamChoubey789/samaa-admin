"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, GripVertical, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: number
  text: string
}

export default function RotationPage() {
  const { api } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Wrap your world in candlelight, the season of glow begins. Free Delivery above Rs. 500" }
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/v1/rotation/active") as any
      const data = response.data.data
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages)
      }
      
      if (data.updated_at) {
        setLastUpdated(new Date(data.updated_at).toLocaleString())
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load rotating messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMessage = () => {
    const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1
    setMessages([...messages, { id: newId, text: "" }])
  }

  const handleRemoveMessage = (id: number) => {
    if (messages.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one message is required",
        variant: "destructive",
      })
      return
    }
    setMessages(messages.filter(m => m.id !== id))
  }

  const handleMessageChange = (id: number, text: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, text } : m))
  }

  const handleSave = async () => {
    // Validate
    const emptyMessages = messages.filter(m => !m.text.trim())
    if (emptyMessages.length > 0) {
      toast({
        title: "Validation Error",
        description: "All messages must have text",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await api.put("/api/v1/rotation", { messages })
      
      toast({
        title: "Success!",
        description: "Rotating messages updated successfully",
      })
      
      fetchMessages() // Refresh to get updated timestamp
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save messages",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Rotating Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the rotating banner messages on your homepage
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Messages will continuously scroll across the banner on your homepage. 
            You can add multiple messages that will rotate in sequence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{messages.length}</Badge>
              <span className="text-muted-foreground">
                {messages.length === 1 ? "message" : "messages"}
              </span>
            </div>
            {lastUpdated && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Last updated: {lastUpdated}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Add, edit, or remove rotating messages
              </CardDescription>
            </div>
            <Button onClick={handleAddMessage} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Message
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="flex-1 space-y-2">
                <Label htmlFor={`message-${message.id}`}>
                  Message {index + 1}
                </Label>
                <Input
                  id={`message-${message.id}`}
                  value={message.text}
                  onChange={(e) => handleMessageChange(message.id, e.target.value)}
                  placeholder="Enter your rotating message here..."
                  className="font-[var(--font-cursive)]"
                />
                <p className="text-xs text-muted-foreground">
                  {message.text.length} characters
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMessage(message.id)}
                disabled={messages.length === 1}
                className="flex-shrink-0 mt-8"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Click "Add Message" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            How your messages will appear on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden bg-[#f5f5eb] rounded-lg p-4">
            <div className="inline-block whitespace-nowrap animate-scroll text-[#262626] text-2xl font-light">
              {messages.map(m => m.text).join(" • ")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={fetchMessages}
          variant="outline"
          disabled={saving}
        >
          Discard Changes
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  )
}