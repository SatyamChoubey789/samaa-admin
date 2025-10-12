import { StoryEditor } from "@/components/editor/story-editor"

const API_BASE = "https://api.samaabysiblings.com/backend/api/v1"

async function getStory(id: string) {
  try {
    const res = await fetch(`${API_BASE}/stories/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) return null

    const json = await res.json()
    const story = json.data
    
    // Parse content if it's a string (from database JSONB)
    if (story && typeof story.content === "string") {
      try {
        story.content = JSON.parse(story.content)
      } catch (e) {
        console.error("Failed to parse story content:", e)
        story.content = null
      }
    }
    
    return story
  } catch (error) {
    console.error("Failed to fetch story:", error)
    return null
  }
}

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await params in Next.js 15+
  const { id } = await params
  const story = await getStory(id)

  if (!story) {
    return (
      <div className="grid gap-4">
        <h2>Story Not Found</h2>
        <p className="text-muted-foreground">
          The story you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <h2>Edit Story</h2>
      <StoryEditor storyId={id} initial={story} />
    </div>
  )
}