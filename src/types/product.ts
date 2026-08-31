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

/**
 * Dữ liệu form thêm/sửa sản phẩm ở khu quản trị.
 *
 * **`rating`, `reviewCount`, `sold`, `createdAt` CỐ Ý vắng mặt.** Chúng là kết
 * quả tính từ dữ liệu khác — đánh giá, đơn hàng, thời điểm tạo — nên backend là
 * nguồn chân lý duy nhất (`API_CONTRACT.md` §C.3). Cho form gửi lên được thì
 * admin sẽ "sửa" được số sao và số đã bán, và con số hiển thị sẽ mâu thuẫn với
 * chính danh sách đánh giá ngay bên dưới nó.
 *
 * `id` cũng vắng: backend cấp khi tạo, còn khi sửa thì id đi trên đường dẫn.
 *
 * ⚠️ `images` là **đường dẫn TƯƠNG ĐỐI** (`/images/rau-cu/ca-rot-1.jpg`), giống
 * hệt `Product.images` đi vào `src/api/`. KHÔNG cho `imageUrl()` chạm vào giá
 * trị này: `imageUrl()` chỉ được gọi khi *đọc* ở lớp `src/api/`, đưa URL đã
 * ghép base vào payload gửi lên là ghi luôn cả gốc CDN xuống cơ sở dữ liệu.
 */
export interface ProductPayload {
  name: string
  /** Bỏ trống thì backend tự sinh từ `name`. */
  slug?: string
  price: number
  salePrice: number | null
  /** Đường dẫn tương đối `/images/...` — xem cảnh báo ở JSDoc của interface. */
  images: string[]
  categoryId: number
  brandId: number | null
  stock: number
  unit: string
  origin: string
  shortDescription: string
  description: string
  isFeatured: boolean
  isBestSeller: boolean
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

/**
 * `productId` KHÔNG nằm trong payload — path (`POST /products/{id}/reviews`)
 * là nguồn chân lý duy nhất. Backend bỏ qua im lặng trường `productId` nếu
 * client cố gửi trong body (0032 §B.8 điều 3, `BE-ADR-0008`): gửi kèm trường
 * này từng ghi nhầm đánh giá sang sản phẩm khác dù response vẫn `201`.
 */
export interface CreateReviewPayload {
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
