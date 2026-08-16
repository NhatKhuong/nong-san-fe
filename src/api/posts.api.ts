import postsJson from '@/mocks/posts.json'
import { POSTS_PER_PAGE } from '@/lib/constants'
import { delay } from '@/lib/utils'
import type { Paginated, Post, PostQuery } from '@/types'

const posts = postsJson as Post[]

function sortByNewest(list: Post[]): Post[] {
  return [...list].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

/**
 * Danh sách bài viết có lọc và phân trang.
 * Khi có backend: `const { data } = await client.get('/posts', { params: query }); return data`
 */
export async function getPosts(query: PostQuery = {}): Promise<Paginated<Post>> {
  await delay()
  const page = query.page ?? 1
  const limit = query.limit ?? POSTS_PER_PAGE

  let filtered = posts
  if (query.category) {
    filtered = filtered.filter((post) => post.category === query.category)
  }
  if (query.q) {
    const keyword = query.q.trim().toLowerCase()
    filtered = filtered.filter((post) => post.title.toLowerCase().includes(keyword))
  }

  const sorted = sortByNewest(filtered)
  const start = (page - 1) * limit
  return {
    items: sorted.slice(start, start + limit),
    total: sorted.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(sorted.length / limit)),
  }
}

/**
 * Chi tiết bài viết theo slug.
 * Khi có backend: `const { data } = await client.get(`/posts/${slug}`); return data`
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  await delay()
  const post = posts.find((item) => item.slug === slug)
  if (!post) throw new Error(`Không tìm thấy bài viết "${slug}"`)
  return post
}

/**
 * Bài viết mới nhất cho khối blog ở trang chủ.
 * Khi có backend: `const { data } = await client.get('/posts/latest', { params: { limit } }); return data`
 */
export async function getLatestPosts(limit = 4): Promise<Post[]> {
  await delay(200)
  return sortByNewest(posts).slice(0, limit)
}

/**
 * Bài viết liên quan — cùng chuyên mục, loại trừ chính nó.
 * Khi có backend: `const { data } = await client.get(`/posts/${slug}/related`); return data`
 */
export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  await delay(200)
  const current = posts.find((item) => item.slug === slug)
  if (!current) return []
  return sortByNewest(
    posts.filter((post) => post.category === current.category && post.id !== current.id),
  ).slice(0, limit)
}

/** Danh sách chuyên mục bài viết, dùng cho bộ lọc trang tin tức. */
export async function getPostCategories(): Promise<string[]> {
  await delay(100)
  return [...new Set(posts.map((post) => post.category))]
}
