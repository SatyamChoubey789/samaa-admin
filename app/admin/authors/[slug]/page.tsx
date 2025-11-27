import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as LucideIcons from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://api.samaabysiblings.com/backend"

interface Author {
  id: number
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
  expertise?: string[]
  stories: Story[]
  story_count: number
}

interface Story {
  id: number
  slug: string
  title: string
  subtitle?: string
  image_url?: string
  excerpt?: string
  read_time_minutes?: number
  created_at: string
}

async function getAuthor(slug: string): Promise<Author | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/authors/${slug}`, {
      next: { revalidate: 10 }, // Revalidate every 10 seconds for real-time updates
      cache: 'no-store' // Don't cache for immediate updates
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    return data.data
  } catch (error) {
    console.error('Error fetching author:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)
  
  if (!author) {
    return {
      title: 'Author Not Found | Samaa by Siblings',
    }
  }

  const description = author.bio?.slice(0, 160) || 
    `${author.name} - ${author.title || 'Author'} at Samaa by Siblings`

  return {
    title: `${author.name} | Samaa by Siblings Authors`,
    description,
    openGraph: {
      title: author.name,
      description,
      type: 'profile',
      url: `https://www.samaabysiblings.com/authors/${slug}`,
      ...(author.profile_image_url && {
        images: [{
          url: author.profile_image_url,
          width: 800,
          height: 800,
          alt: author.name,
        }],
      }),
    },
    twitter: {
      card: 'summary',
      title: author.name,
      description,
      ...(author.profile_image_url && {
        images: [author.profile_image_url],
      }),
    },
    alternates: {
      canonical: `https://www.samaabysiblings.com/authors/${slug}`,
    },
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const author = await getAuthor(slug)

  if (!author) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--brand-light)] px-4 md:px-8 lg:px-16 py-24 font-[D-DIN]">
      <div className="max-w-6xl mx-auto">
        {/* Author Header Card */}
        <div className="bg-[var(--brand-light)] rounded-none shadow-md p-8 md:p-12 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image */}
            {author.profile_image_url ? (
              <div className="relative w-40 h-40 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-gray-100">
                <Image
                  src={author.profile_image_url}
                  alt={author.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ring-4 ring-gray-100">
                <span className="text-6xl font-bold text-gray-400">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Author Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#262626] mb-2 tracking-tight">
                  {author.name}
                </h1>
                
                {author.title && (
                  <p className="text-xl text-gray-600 font-light">{author.title}</p>
                )}
                
                {author.company && (
                  <p className="text-lg text-gray-500 mt-1">{author.company}</p>
                )}
              </div>

              {/* Social Links */}
              {(author.linkedin_url || author.twitter_url || author.website_url || author.email) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {author.email && (
                    <a
                      href={`mailto:${author.email}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition rounded-sm"
                    >
                      <LucideIcons.Mail className="h-4 w-4" />
                      Email
                    </a>
                  )}
                  {author.linkedin_url && (
                    <a
                      href={author.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm transition rounded-sm"
                    >
                      <LucideIcons.Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {author.twitter_url && (
                    <a
                      href={author.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm transition rounded-sm"
                    >
                      <LucideIcons.Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  )}
                  {author.website_url && (
                    <a
                      href={author.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition rounded-sm"
                    >
                      <LucideIcons.Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              )}

              {/* Expertise Tags */}
              {author.expertise && author.expertise.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {author.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#262626] text-white text-xs uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {author.bio && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                About
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {author.bio}
              </p>
            </div>
          )}
        </div>

        {/* Stories Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#262626] tracking-tight">
              Stories by {author.name}
            </h2>
            <span className="text-sm text-gray-500 bg-[var(--brand-light)] px-3 py-1">
              {author.story_count} {author.story_count === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {author.stories.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <LucideIcons.FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No published stories yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Check back soon for new content from {author.name}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {author.stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="bg-[var(--brand-light)] shadow-sm hover:shadow-md transition group block"
                >
                  {/* Story Image */}
                  {story.image_url && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                      <Image
                        src={story.image_url}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Story Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#262626] transition line-clamp-2">
                      {story.title}
                    </h3>
                    
                    {story.subtitle && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {story.subtitle}
                      </p>
                    )}
                    
                    {story.excerpt && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {story.excerpt}
                      </p>
                    )}
                    
                    {/* Story Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 uppercase tracking-wider">
                      {story.read_time_minutes && (
                        <>
                          <span>{story.read_time_minutes} min read</span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        {new Date(story.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#262626] transition uppercase tracking-wider"
          >
            <LucideIcons.ArrowLeft className="h-4 w-4" />
            <span>Back to all stories</span>
          </Link>
        </div>
      </div>
    </div>
  )
}