import { getBlogPosts } from 'app/blog/utils'
import { BlogPostLink } from './blog-post-link'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div>
      {allBlogs
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
