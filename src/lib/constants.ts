/** Đường dẫn tập trung một chỗ — không hardcode chuỗi route rải rác trong code. */
export const ROUTES = {
  HOME: '/',
  SHOP: '/cua-hang',
  PRODUCT: '/san-pham/:slug',
  CART: '/gio-hang',
  CHECKOUT: '/thanh-toan',
  ORDER_SUCCESS: '/dat-hang-thanh-cong',
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  FORGOT_PASSWORD: '/quen-mat-khau',
  ACCOUNT: '/tai-khoan',
  ACCOUNT_ORDERS: '/tai-khoan/don-hang',
  ACCOUNT_ADDRESSES: '/tai-khoan/dia-chi',
  ACCOUNT_PASSWORD: '/tai-khoan/doi-mat-khau',
  WISHLIST: '/yeu-thich',
  BLOG: '/tin-tuc',
  BLOG_DETAIL: '/tin-tuc/:slug',
  ABOUT: '/gioi-thieu',
  CONTACT: '/lien-he',

  /*
   * Khu quản trị — cây route top-level THỨ HAI, sibling với `MainLayout`
   * (xem `routes/adminRoutes.tsx` và ADR 0001). Đường dẫn con vẫn khai tuyệt đối
   * như khối `/tai-khoan` ở trên: React Router chấp nhận vì chúng bắt đầu bằng
   * đúng path của route cha.
   */
  ADMIN: '/quan-tri',
  ADMIN_PRODUCTS: '/quan-tri/san-pham',
  ADMIN_PRODUCT_NEW: '/quan-tri/san-pham/them-moi',
  ADMIN_PRODUCT_EDIT: '/quan-tri/san-pham/:id/chinh-sua',
  ADMIN_ORDERS: '/quan-tri/don-hang',
  ADMIN_ORDER_DETAIL: '/quan-tri/don-hang/:code',
  ADMIN_CUSTOMERS: '/quan-tri/khach-hang',
  ADMIN_CUSTOMER_DETAIL: '/quan-tri/khach-hang/:id',
} as const

/** Sinh đường dẫn chi tiết sản phẩm từ slug. */
export const productPath = (slug: string): string => `/san-pham/${slug}`

/** Sinh đường dẫn chi tiết bài viết từ slug. */
export const blogPath = (slug: string): string => `/tin-tuc/${slug}`

/** Sinh đường dẫn màn sửa sản phẩm trong khu quản trị. */
export const adminProductEditPath = (id: number | string): string =>
  `/quan-tri/san-pham/${id}/chinh-sua`

/** Sinh đường dẫn chi tiết đơn hàng trong khu quản trị — khoá là **mã đơn**, không phải id. */
export const adminOrderDetailPath = (code: string): string => `/quan-tri/don-hang/${code}`

/** Sinh đường dẫn chi tiết khách hàng trong khu quản trị. */
export const adminCustomerDetailPath = (id: number | string): string =>
  `/quan-tri/khach-hang/${id}`

/** Sinh đường dẫn cửa hàng đã lọc sẵn theo danh mục. */
export const shopByCategoryPath = (categorySlug: string): string =>
  `${ROUTES.SHOP}?category=${categorySlug}`

export interface NavItem {
  label: string
  path: string
}

/** Menu điều hướng chính trên header. */
export const MAIN_NAV: NavItem[] = [
  { label: 'Trang chủ', path: ROUTES.HOME },
  { label: 'Giới thiệu', path: ROUTES.ABOUT },
  { label: 'Sản phẩm', path: ROUTES.SHOP },
  { label: 'Tin tức', path: ROUTES.BLOG },
  { label: 'Liên hệ', path: ROUTES.CONTACT },
]

/** Thông tin liên hệ của cửa hàng, dùng ở header và footer. */
export const STORE_INFO = {
  name: 'Nông Sản Sạch',
  tagline: 'Thực phẩm hữu cơ tươi mỗi ngày',
  hotline: '1900 6868',
  email: 'hotro@nongsansach.vn',
  address: '123 Đường Nguyễn Văn Cừ, Quận 1, TP. Hồ Chí Minh',
  openingHours: 'Thứ 2 – Chủ nhật: 7:00 – 21:00',
} as const

/** Số sản phẩm mỗi trang ở trang cửa hàng. */
export const PRODUCTS_PER_PAGE = 12

/** Số bài viết mỗi trang ở trang tin tức. */
export const POSTS_PER_PAGE = 6

/**
 * Ngưỡng cảnh báo sắp hết hàng: `0 < stock <= 10` là `low_stock`.
 *
 * **Backend phải dùng đúng con số này** cho `stockStatus=low_stock` của
 * `AdminProductQuery`. Hai đầu lệch nhau thì bộ lọc "sắp hết" trả một tập,
 * còn nhãn hiển thị trên từng dòng lại nói khác — sai lệch âm thầm, không có
 * lỗi nào nổ ra.
 */
export const LOW_STOCK_THRESHOLD = 10

/** Ngưỡng miễn phí vận chuyển (VNĐ). */
export const FREE_SHIPPING_THRESHOLD = 500_000

/** Phí vận chuyển mặc định khi chưa đạt ngưỡng miễn phí (VNĐ). */
export const SHIPPING_FEE = 30_000

/**
 * Thời điểm kết thúc chương trình khuyến mãi trên trang chủ.
 * Khi có backend, giá trị này sẽ đến từ API thay vì hằng số.
 * `CountdownPromo` tự ẩn khi mốc này đã trôi qua.
 */
export const PROMO_END_DATE = '2026-12-31T23:59:59+07:00'
