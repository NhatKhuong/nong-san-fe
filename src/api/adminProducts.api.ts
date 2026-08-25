import { PRODUCTS_PER_PAGE } from '@/lib/constants'
import { imageUrl } from '@/lib/image'
import { client } from './client'
import type { AdminProductQuery, Paginated, Product, ProductPayload } from '@/types'

/**
 * Sản phẩm ở khu quản trị — `/admin/products/**`.
 *
 * Tách khỏi `products.api.ts` vì đây là **namespace khác** trên backend: mọi
 * hàm dưới đây đi qua tiền tố `/admin/**` được gác bằng một filter đòi
 * `role == "admin"` (`documents/API_CONTRACT.md` §B.12.1, §C.4.2). Trộn chung
 * file với endpoint công khai là mời gọi một lời gọi ghi lọt ra ngoài hàng rào.
 *
 * **Đã ghép backend Spring Boot thật (backlog 0013).** Lọc, sắp xếp, phân trang,
 * sinh slug và kiểm trùng slug đều do backend làm — không còn bản sao nào của
 * những luật đó ở đây. `client.ts` đã có `baseURL = '/api'` nên đường dẫn viết
 * ở đây là `/admin/products`.
 *
 * `403` (sai vai trò) **không** kích hoạt đăng xuất: nó rơi thẳng xuống
 * `toApiError` trong `client.ts`, đúng như §B.12 đã chốt.
 *
 * Trang cửa hàng, đếm sản phẩm theo danh mục và trang tổng quan **vẫn đọc mock**
 * qua `productStore.ts` cho tới backlog 0019 — Owner đã chấp nhận cửa sổ lệch đó.
 */

/**
 * Danh sách sản phẩm cho bảng quản trị — `GET /admin/products`.
 *
 * `page`/`limit` gửi tường minh (mặc định backend cũng là `1`/`12`) để URL của
 * request nói ra đúng trang đang xem thay vì phụ thuộc vào mặc định phía server.
 * Các khoá còn lại là `undefined` khi không lọc và axios tự bỏ chúng khỏi query
 * string — gửi `q=` rỗng lên là một bộ lọc khác với "không lọc".
 *
 * Ảnh được giải qua `imageUrl()` **tại lớp API** (CLAUDE.md §6): backend trả
 * đường dẫn tương đối `/images/...`, còn cột thumbnail của bảng đọc thẳng
 * `product.images[0]`. Quên chỗ này thì lúc dev không lộ ra (base ảnh đang
 * trống) và chỉ vỡ khi bật `VITE_IMAGE_BASE_URL`.
 *
 * `totalPages` khi tập rỗng là **`0`** — `Pagination` mở đầu bằng
 * `if (totalPages <= 1) return null` nên không render gì, đúng như mong đợi.
 */
export async function getAdminProducts(
  query: AdminProductQuery = {},
): Promise<Paginated<Product>> {
  const { data } = await client.get<Paginated<Product>>('/admin/products', {
    params: {
      q: query.q,
      category: query.category,
      stockStatus: query.stockStatus,
      sort: query.sort,
      page: query.page ?? 1,
      limit: query.limit ?? PRODUCTS_PER_PAGE,
    },
  })

  return {
    ...data,
    items: data.items.map((item) => ({ ...item, images: item.images.map(imageUrl) })),
  }
}

/**
 * Một sản phẩm theo **`id`**, không phải slug — `GET /admin/products/{id}`.
 *
 * Khác hẳn `getProductBySlug()` của trang cửa hàng. Admin sửa được chính cái
 * slug, nên URL màn sửa không được treo vào một trường có thể đổi: lưu link
 * `/quan-tri/san-pham/12/chinh-sua` rồi đổi slug thì link vẫn đúng, còn khoá
 * theo slug thì hỏng ngay sau lần Lưu.
 *
 * `images` trả về là **đường dẫn tương đối**, cố ý **không** qua `imageUrl()`:
 * giá trị này đi thẳng vào form và quay lại backend trong `ProductPayload` ở lần
 * Lưu kế tiếp — ghép base vào đây là ghi luôn gốc CDN xuống cơ sở dữ liệu
 * (`types/product.ts`, JSDoc của `ProductPayload`).
 *
 * Không tìm thấy → `404`, và `ApiError.message` đã mang sẵn `detail` tiếng Việt.
 */
export async function getAdminProduct(id: number): Promise<Product> {
  const { data } = await client.get<Product>(`/admin/products/${id}`)
  return data
}

/**
 * Tạo sản phẩm mới — `POST /admin/products`, trả **201**.
 *
 * `ProductPayload` khớp một-một `CreateProductRequest`, gửi thẳng không mapper.
 * `slug` bỏ trống thì backend tự sinh từ `name`; slug client gửi lên cũng bị
 * slugify. **Trùng slug → `409`**, không tự thêm hậu tố `-1`, và slug của sản
 * phẩm đã xoá mềm vẫn bị giữ chỗ (§B.12.1). Sai dữ liệu → **`422`** kèm
 * `errors` theo từng trường, đã được `toApiError` gom vào `ApiError.fieldErrors`.
 */
export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await client.post<Product>('/admin/products', payload)
  return data
}

/**
 * Cập nhật một sản phẩm — `PUT /admin/products/{id}`.
 *
 * Khoá theo `id` chứ không theo slug, cùng lý do với `getAdminProduct`: slug đổi
 * được nên URL màn sửa **không** đổi theo nó sau khi Lưu.
 */
export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const { data } = await client.put<Product>(`/admin/products/${id}`, payload)
  return data
}

/**
 * Xoá một sản phẩm khỏi catalog — `DELETE /admin/products/{id}`, trả **204**.
 *
 * **Xoá MỀM** (Owner chốt 2026-08-25): dòng ở lại trong bảng để các đơn cũ còn
 * tham chiếu được, chỉ bị tắt cờ. Sản phẩm biến mất khỏi cả `GET /products` lẫn
 * `GET /admin/products` và **không có đường khôi phục từ UI**. Xoá lại cùng id
 * → `404`.
 */
export async function deleteProduct(id: number): Promise<void> {
  await client.delete(`/admin/products/${id}`)
}
