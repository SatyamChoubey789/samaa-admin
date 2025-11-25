"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

interface Author {
  id?: number
  slug: string
  name: string
  title?: string
  company?: string
  bio?: string
  profile_image_url?: string
  email?: string
  linkedin_url?: string
  twitter_url?: string
  website_url?: string
  expertise: string[]
}

export default function AuthorFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { api } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [author, setAuthor] = useState<Author>({
    slug: "",
    name: "",
    title: "",
    company: "",
    bio: "",
    profile_image_url: "",
    email: "",
    linkedin_url: "",
    twitter_url: "",
    website_url: "",
    expertise: [""],
  })

  const isNew = id === "new"

  useEffect(() => {
    if (!isNew) {
      fetchAuthor()
    }
  }, [id])

  const fetchAuthor = async () => {
    try {
      const response = await api.get<{ data: Author }>(`/api/v1/authors/${id}`)
      setAuthor(response.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch author",
        variant: "destructive",
      })
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleNameChange = (name: string) => {
    setAuthor({ ...author, name })
    if (isNew) {
      setAuthor((prev) => ({ ...prev, slug: generateSlug(name) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...author,
        expertise: author.expertise.filter((e) => e.trim() !== ""),
      }

      if (isNew) {
        await api.post("/api/v1/authors", payload)
        toast({ title: "Success", description: "Author created" })
      } else {
        await api.put(`/api/v1/authors/${id}`, payload)
        toast({ title: "Success", description: "Author updated" })
      }

      router.push("/admin/authors")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save author",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isNew ? "Add Author" : "Edit Author"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={author.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={author.slug}
              onChange={(e) => setAuthor({ ...author, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={author.title}
              onChange={(e) => setAuthor({ ...author, title: e.target.value })}
              placeholder="e.g., Principal Consultant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={author.company}
              onChange={(e) => setAuthor({ ...author, company: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={author.bio}
            onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
            rows={4}
          />
        </div>

        {/* Contact & Social */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={author.email}
              onChange={(e) => setAuthor({ ...author, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_image_url">Profile Image URL</Label>
            <Input
              id="profile_image_url"
              value={author.profile_image_url}
              onChange={(e) =>
                setAuthor({ ...author, profile_image_url: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              value={author.linkedin_url}
              onChange={(e) =>
                setAuthor({ ...author, linkedin_url: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_url">Twitter URL</Label>
            <Input
              id="twitter_url"
              value={author.twitter_url}
              onChange={(e) =>
                setAuthor({ ...author, twitter_url: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              value={author.website_url}
              onChange={(e) =>
                setAuthor({ ...author, website_url: e.target.value })
              }
            />
          </div>
        </div>

        {/* Expertise */}
        <div className="space-y-2">
          <Label>Expertise</Label>
          {author.expertise.map((exp, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={exp}
                onChange={(e) => {
                  const newExpertise = [...author.expertise]
                  newExpertise[index] = e.target.value
                  setAuthor({ ...author, expertise: newExpertise })
                }}
                placeholder="e.g., SEO, Content Marketing"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newExpertise = author.expertise.filter((_, i) => i !== index)
                  setAuthor({ ...author, expertise: newExpertise })
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setAuthor({ ...author, expertise: [...author.expertise, ""] })
            }
          >
            Add Expertise
          </Button>
        </div>

        {/* Submit */}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isNew ? "Create Author" : "Update Author"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}