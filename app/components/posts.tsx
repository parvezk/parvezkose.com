import { formatDate, getBlogPosts } from 'app/blog/utils'
import { BlogPostLink } from './blog-post-link'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <BlogPostLink
            key={post.slug}
            slug={post.slug}
            title={post.metadata.title}
            publishedAt={post.metadata.publishedAt}
          />
        ))}
    </div>
  )
}
