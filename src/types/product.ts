export interface Product {
  id: number
  slug: string
  name: string
  /** Giá gốc, số nguyên VNĐ. */
  price: number
  /** Giá khuyến mãi; null nếu không giảm giá. */
  salePrice: number | null
  images: string[]
  categoryId: number
  brandId: number | null
  /** Điểm đánh giá trung bình, thang 0–5. */
  rating: number
  reviewCount: number
  /** Số lượng còn trong kho; 0 = hết hàng. */
  stock: number
  sold: number
  /** Đơn vị tính hiển thị cạnh giá: "kg", "bó", "hộp"… */
  unit: string
  origin: string
  shortDescription: string
  description: string
  isFeatured: boolean
  isBestSeller: boolean
  createdAt: string
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating'

/** Tham số lọc trang cửa hàng — đồng bộ với URL query params. */
export interface ProductQuery {
  /** Từ khoá tìm kiếm theo tên sản phẩm. */
  q?: string
  /** Slug danh mục. */
  category?: string
  minPrice?: number
  maxPrice?: number
  /** Lọc sản phẩm có rating >= giá trị này. */
  minRating?: number
  inStockOnly?: boolean
  onSaleOnly?: boolean
  isFeatured?: boolean
  isBestSeller?: boolean
  sort?: ProductSort
  page?: number
  limit?: number
}

export interface Review {
  id: number
  productId: number
  authorName: string
  /** Điểm đánh giá, số nguyên 1–5. */
  rating: number
  content: string
  createdAt: string
}

export interface CreateReviewPayload {
  productId: number
  authorName: string
  rating: number
  content: string
}

/** Tổng hợp đánh giá của một sản phẩm, dùng vẽ biểu đồ phân bố sao. */
export interface ReviewSummary {
  average: number
  total: number
  /** Số lượt đánh giá theo từng mức sao, khoá là '1'…'5'. */
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>
}
