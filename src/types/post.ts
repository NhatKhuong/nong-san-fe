export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  /**
   * Nội dung bài viết, dùng một tập cú pháp Markdown rút gọn:
   * `##` / `###` tiêu đề, `-` và `1.` danh sách, `>` trích dẫn, `**đậm**`.
   * Xem `src/components/blog/PostContent.tsx` để biết chính xác phần được hỗ trợ.
   */
  content: string
  thumbnail: string
  author: string
  /** Tên chuyên mục để hiển thị: "Kiến thức". */
  category: string
  /**
   * Slug chuyên mục, dùng trên URL: "kien-thuc".
   * LƯU Ý: thêm ở Giai đoạn 8 — phải ghi vào `docs/API_CONTRACT.md`. Cần trường
   * này vì lọc theo tên có dấu sẽ cho URL dạng `?category=Ki%E1%BA%BFn%20th%E1%BB%A9c`.
   */
  categorySlug: string
  publishedAt: string
}

/** Chuyên mục kèm số bài, dùng cho sidebar trang tin tức. */
export interface PostCategory {
  slug: string
  name: string
  count: number
}

export interface PostQuery {
  q?: string
  /** Lọc theo **slug** chuyên mục, không phải tên hiển thị. */
  category?: string
  page?: number
  limit?: number
}
