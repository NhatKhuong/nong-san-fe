export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  /** Nội dung bài viết dạng Markdown đơn giản. */
  content: string
  thumbnail: string
  author: string
  category: string
  publishedAt: string
}

export interface PostQuery {
  q?: string
  category?: string
  page?: number
  limit?: number
}
