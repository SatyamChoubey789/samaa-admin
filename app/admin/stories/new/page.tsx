import { StoryEditor } from "@/components/editor/story-editor"

export default function NewStoryPage() {
  const id = `s_${Date.now()}`
  return (
    <div className="grid gap-4">
      <h2>New Story</h2>
      <StoryEditor storyId={id} />
    </div>
  )
}
