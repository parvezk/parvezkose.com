'use client'

import Link from 'next/link'
import posthog from 'posthog-js'
import { formatDate } from 'app/blog/date-format'

type BlogPostLinkProps = {
  slug: string
  title: string
  publishedAt: string
}

export function BlogPostLink({ slug, title, publishedAt }: BlogPostLinkProps) {
  return (
    <Link
      className="flex flex-col space-y-1 mb-4"
      href={`/blog/${slug}`}
      onClick={() =>
        posthog.capture('blog_post_clicked', {
          slug,
          title,
          published_at: publishedAt,
        })
      }
    >
      <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
        <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
          {formatDate(publishedAt, false)}
        </p>
        <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
          {title}
        </p>
      </div>
    </Link>
  )
}
