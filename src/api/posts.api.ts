import postsJson from '@/mocks/posts.json'
import { POSTS_PER_PAGE } from '@/lib/constants'
import { delay } from '@/lib/utils'
import { imageUrl } from '@/lib/image'
import type { Paginated, Post, PostCategory, PostQuery } from '@/types'

const posts = (postsJson as Post[]).map((post) => ({
  ...post,
  thumbnail: imageUrl(post.thumbnail),
}))

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
    filtered = filtered.filter((post) => post.categorySlug === query.category)
  }
  if (query.q) {
    const keyword = query.q.trim().toLowerCase()
    // Tìm cả trong tóm tắt để từ khoá không có trong tiêu đề vẫn ra kết quả.
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(keyword) ||
        post.excerpt.toLowerCase().includes(keyword),
    )
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

/**
 * Danh sách chuyên mục kèm số bài, dùng cho sidebar trang tin tức.
 *
 * Trả về `PostCategory[]` chứ không phải `string[]`: sidebar cần số đếm, còn URL
 * cần slug không dấu. Đây là dạng backend sẽ trả về.
 *
 * Khi có backend: `const { data } = await client.get('/posts/categories'); return data`
 */
export async function getPostCategories(): Promise<PostCategory[]> {
  await delay(100)

  const counts = new Map<string, PostCategory>()
  for (const post of posts) {
    const existing = counts.get(post.categorySlug)
    if (existing) existing.count++
    else counts.set(post.categorySlug, { slug: post.categorySlug, name: post.category, count: 1 })
  }

  return [...counts.values()].sort((a, b) => b.count - a.count)
}
