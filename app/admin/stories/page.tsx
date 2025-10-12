"use client"

import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function StoriesPage() {
  const { data, error } = useSWR("https://api.samaabysiblings.com/backend/api/v1/stories", fetcher)
  
  // Backend returns data.data, not data.items
  const stories = data?.data ?? []
  const loading = !data && !error

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2>Stories</h2>
        <Button asChild>
          <Link href="/admin/stories/new">New Story</Link>
        </Button>
      </div>
      <div className="glass rounded-lg p-2 overflow-auto">
        {loading ? (
          <p className="p-4 text-center text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="p-4 text-center text-red-500">Error loading stories</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Published</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.title || "Untitled"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.slug}</TableCell>
                  <TableCell>{new Date(s.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${s.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {s.published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/stories/${s.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {stories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No stories yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}