import type {
  AdminOrderQuery,
  AdminProductQuery,
  AdminUserQuery,
  PostQuery,
  ProductQuery,
} from '@/types'

/** Query key tập trung một chỗ để invalidate cache không bị lệch chuỗi. */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (query: ProductQuery) => ['products', 'list', query] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    related: (slug: string) => ['products', 'related', slug] as const,
    suggestions: (keyword: string) => ['products', 'suggestions', keyword] as const,
    priceRange: ['products', 'price-range'] as const,
  },
  categories: {
    all: ['categories'] as const,
    root: ['categories', 'root'] as const,
    detail: (slug: string) => ['categories', 'detail', slug] as const,
  },
  posts: {
    all: ['posts'] as const,
    list: (query: PostQuery) => ['posts', 'list', query] as const,
    detail: (slug: string) => ['posts', 'detail', slug] as const,
    related: (slug: string) => ['posts', 'related', slug] as const,
    latest: (limit: number) => ['posts', 'latest', limit] as const,
    categories: ['posts', 'categories'] as const,
  },
  marketing: {
    heroSlides: ['marketing', 'hero-slides'] as const,
    promoBanners: ['marketing', 'promo-banners'] as const,
    testimonials: ['marketing', 'testimonials'] as const,
    brands: ['marketing', 'brands'] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    byProduct: (productId: number) => ['reviews', 'product', productId] as const,
    summary: (productId: number) => ['reviews', 'summary', productId] as const,
  },
  orders: {
    all: ['orders'] as const,
    mine: ['orders', 'mine'] as const,
    detail: (code: string) => ['orders', 'detail', code] as const,
  },
  addresses: {
    all: ['addresses'] as const,
  },
  wishlist: {
    /** Khoá gắn với danh sách id nên bỏ tim một sản phẩm là tự tải lại. */
    products: (ids: number[]) => ['wishlist', 'products', ids.join(',')] as const,
  },
  about: {
    content: ['about', 'content'] as const,
  },
  coupons: {
    active: ['coupons', 'active'] as const,
    validate: (code: string, subtotal: number) =>
      ['coupons', 'validate', code, subtotal] as const,
  },
  cart: {
    validate: (fingerprint: string) => ['cart', 'validate', fingerprint] as const,
  },
  locations: {
    provinces: ['locations', 'provinces'] as const,
    districts: (provinceCode: string) => ['locations', 'districts', provinceCode] as const,
    wards: (districtCode: string) => ['locations', 'wards', districtCode] as const,
  },

  /*
   * Khu quản trị — CHỐT TRỌN KHỐI ở backlog 0003, ticket 0004–0007 không sửa
   * thêm. Bốn ticket đó chạy song song; mỗi ticket tự thêm vài dòng vào đây là
   * conflict chắc chắn, và tệ hơn, hai ticket có thể chọn hai chuỗi khác nhau
   * cho cùng một tập dữ liệu.
   *
   * Tiền tố `'admin'` tách hẳn khỏi `products` / `orders` của phần khách hàng
   * dù đôi khi trỏ tới cùng bản ghi: hai bên gọi hai endpoint khác nhau
   * (`/orders/me` với `/admin/orders`, §C.4.3b) và trả về những tập khác nhau,
   * nên trộn khoá là một tài khoản admin đăng xuất sẽ để lại dữ liệu chéo
   * người dùng trong cache của phần khách hàng.
   *
   * `all` là gốc để `invalidateQueries({ queryKey: queryKeys.admin.all })` quét
   * sạch cả khu sau một lần ghi.
   */
  admin: {
    all: ['admin'] as const,
    products: {
      list: (query: AdminProductQuery) => ['admin', 'products', 'list', query] as const,
      detail: (id: number) => ['admin', 'products', 'detail', id] as const,
    },
    orders: {
      list: (query: AdminOrderQuery) => ['admin', 'orders', 'list', query] as const,
      /** Khoá là **mã đơn** (`Order.code`), khớp tham số `:code` trên đường dẫn. */
      detail: (code: string) => ['admin', 'orders', 'detail', code] as const,
    },
    users: {
      list: (query: AdminUserQuery) => ['admin', 'users', 'list', query] as const,
      detail: (id: number) => ['admin', 'users', 'detail', id] as const,
    },
    /** `days` nằm trong khoá vì đổi khoảng thời gian là một tập số liệu khác. */
    overview: (days: number) => ['admin', 'overview', days] as const,
  },
} as const
