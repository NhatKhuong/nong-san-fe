# Hợp đồng API — đầu bài cho backend Spring Boot

Tài liệu này mô tả **chính xác những gì frontend đang mong đợi**. Nó không phải bản đề xuất — frontend đã được xây và kiểm thử xong theo đúng các shape dưới đây, nên backend khớp được bao nhiêu thì phần frontend phải sửa ít bấy nhiêu.

> **Nguồn chân lý thực sự vẫn là code:** 57 hàm `export` trong 15 file `src/api/*.api.ts` và 12 file kiểu dữ liệu trong `src/types/` (chưa kể `index.ts` chỉ re-export). Mỗi hàm đều có sẵn dòng comment `Khi có backend: ...` ghi đúng lời gọi sẽ thay thế. Tài liệu này gom chúng lại một chỗ để bàn giao.

**Trạng thái:** frontend chạy hoàn toàn bằng mock JSON trong `src/mocks/`. Chưa có một request HTTP thật nào được phát ra.

---

## A. Quy ước chung

### A.1 Base URL và proxy

| Môi trường | `VITE_API_BASE_URL` | Đường đi |
|---|---|---|
| Dev (khuyến nghị) | để **trống** | axios dùng `/api` → proxy của Vite chuyển tiếp sang `http://localhost:8080` → **không dính CORS** |
| Dev (backend ở máy khác) | URL tuyệt đối | trình duyệt gọi thẳng → **backend phải cấu hình CORS** |
| Production | URL tuyệt đối | — |

Proxy khai báo trong `vite.config.ts`. Backend **giữ tiền tố `/api`** cho mọi endpoint dưới đây (`/products` trong bảng nghĩa là `/api/products`).

### A.2 Xác thực

`Authorization: Bearer <accessToken>` — `client.ts` tự gắn vào mọi request khi đã đăng nhập, không hàm nào phải tự làm.

- **Access token** nên có hạn ngắn (15–60 phút).
- **Refresh token** hạn dài hơn, trả trong body khi đăng nhập/đăng ký.
- Gặp **401**, `client.ts` tự gọi `POST /auth/refresh` một lần rồi phát lại request. Thất bại thì xoá phiên và đưa về `/dang-nhap`.

Cột **Auth** trong bảng endpoint: ✅ = bắt buộc có token, ⬜ = công khai.

### A.3 Dạng lỗi — `ProblemDetail` (RFC 7807)

Dạng mặc định của Spring Boot 3, bật bằng `spring.mvc.problemdetails.enabled=true`.

```json
{
  "type": "about:blank",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Đơn hàng cần tối thiểu 300.000 ₫ để dùng mã này.",
  "instance": "/api/coupons/validate",
  "errors": { "code": "Mã không hợp lệ" }
}
```

> **`detail` PHẢI viết bằng tiếng Việt, dành cho người dùng cuối đọc.**
>
> Đây là điều kiện quan trọng nhất của cả tài liệu. Frontend hiển thị thẳng chuỗi này ở **24 chỗ** (form đăng nhập, đăng ký, mã giảm giá, đánh giá, liên hệ, sổ địa chỉ, và mọi `ErrorState`). Nếu `detail` là tiếng Anh hoặc là stack trace, người dùng sẽ đọc được nguyên văn.
>
> Frontend có bảng thông điệp dự phòng theo mã HTTP (`src/lib/apiError.ts`) nhưng đó chỉ là lưới an toàn — nó chỉ nói được "Dữ liệu gửi lên không hợp lệ", không nói được *sai ở đâu*.

`errors` là **phần mở rộng ngoài chuẩn**, không bắt buộc: map `tên trường → thông điệp`, dùng cho lỗi validate theo từng ô nhập. Frontend đọc vào `ApiError.fieldErrors`.

### A.4 Dạng phân trang

Backend **map `Page<T>` của Spring Data sang dạng dưới đây** thay vì trả mặc định:

```json
{ "items": [ ... ], "total": 42, "page": 1, "limit": 12, "totalPages": 4 }
```

| Trường ở đây | Trường Spring mặc định | Khác biệt |
|---|---|---|
| `items` | `content` | chỉ khác tên |
| `total` | `totalElements` | chỉ khác tên |
| `page` | `number` | **đánh số từ 1**, Spring đánh từ 0 |
| `limit` | `size` | chỉ khác tên |
| `totalPages` | `totalPages` | giống |

`page` đánh số từ 1 vì nó đi thẳng lên URL mà người dùng nhìn thấy (`/cua-hang?page=2`). **Backend chịu trách nhiệm trừ 1** khi dựng `Pageable`.

Mặc định: `limit = 12` cho sản phẩm, `6` cho bài viết.

**Khi kết quả rỗng: `total = 0` ⇒ `totalPages = 0`**, không phải `1`. Chốt 2026-08-25 — ô trống này đã làm hai bên tự chọn khác nhau (lớp mock dùng `Math.max(1, …)`, backend dùng `0`). Chọn theo backend vì **`0` và `1` vẽ ra y hệt nhau trên giao diện**: `components/ui/Pagination.tsx` mở đầu bằng `if (totalPages <= 1) return null`, và cả sáu chỗ gọi đều đi qua component đó. Đổi sang `1` thì phải sửa **mọi** endpoint phân trang để đổi lấy đúng một con số không ai nhìn thấy.

`page` vượt số trang ⇒ `items: []` và `total`/`totalPages` giữ nguyên giá trị thật — **không phải `404`**.

### A.5 Kiểu dữ liệu

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Tiền | **số nguyên VNĐ**, không thập phân, không dấu phân cách | `449000` |
| Ngày giờ | chuỗi ISO 8601 | `"2026-08-17T10:30:00Z"` |
| Đường dẫn ảnh | **tương đối**, bắt đầu bằng `/images/` | `/images/rau-cu/ca-rot-1.jpg` |
| Slug | không dấu, nối bằng gạch ngang | `ca-rot-huu-co` |
| Giá trị không có | `null`, **không dùng chuỗi rỗng** | `"salePrice": null` |

> **Ảnh phải là đường dẫn tương đối.** Frontend ghép tiền tố bằng `VITE_IMAGE_BASE_URL` ở lớp API (`src/lib/image.ts`), nên chuyển kho ảnh sang S3/CDN chỉ tốn một biến môi trường. Backend trả URL tuyệt đối sẽ phá cơ chế này.

---

## B. Bảng endpoint

56 endpoint. Tên hàm ở cột đầu là hàm frontend đang gọi — tìm trong `src/api/` để xem chi tiết.

### B.1 Sản phẩm — `products.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getProducts` | `GET /products` | query: `q`, `category`, `minPrice`, `maxPrice`, `minRating`, `inStockOnly`, `onSaleOnly`, `isFeatured`, `isBestSeller`, `sort`, `page`, `limit` | `Paginated<Product>` | — | ⬜ |
| `getProductBySlug` | `GET /products/{slug}` | — | `Product` | 404 | ⬜ |
| `getProductsByIds` | `GET /products?ids=1,2,3` | query `ids` | `Product[]` | — | ⬜ |
| `getRelatedProducts` | `GET /products/{slug}/related` | query `limit` (mặc định 4) | `Product[]` | 404 | ⬜ |
| `searchSuggestions` | `GET /products/suggest` | query `q`, `limit` (mặc định 5) | `Product[]` | — | ⬜ |
| `getPriceRange` | `GET /products/price-range` | — | `{ min, max }` | — | ⬜ |

`sort` nhận đúng 5 giá trị: `newest` · `price_asc` · `price_desc` · `best_selling` · `rating`.

`q` tìm trong `name` và `shortDescription`, **bỏ dấu** và không phân biệt hoa thường — "cam" khớp "Cam sành hữu cơ".

> **Cả lọc lẫn sắp xếp theo giá đều dùng `salePrice ?? price`**, không dùng `price`.
>
> `minPrice` / `maxPrice` lọc theo **giá thực tế phải trả**, và `price_asc` / `price_desc` cũng sắp theo giá đó. Backend dùng `price` sẽ cho kết quả khác với con số người dùng đang nhìn trên thẻ sản phẩm — một sản phẩm giá gốc 600k đang giảm còn 400k phải lọt vào khoảng lọc "dưới 500k". Đây là loại lệch **không gây lỗi**, chỉ khiến bộ lọc trả sai âm thầm.

### B.2 Danh mục — `categories.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getCategories` | `GET /categories` | — | `Category[]` | — | ⬜ |
| `getRootCategories` | `GET /categories?root=true` | query `root` | `Category[]` | — | ⬜ |
| `getCategoryBySlug` | `GET /categories/{slug}` | — | `Category` | 404 | ⬜ |

`Category.productCount` do backend tính. Với danh mục gốc, con số này **gồm cả sản phẩm của danh mục con** — sidebar bộ lọc hiển thị đúng như vậy.

### B.3 Bài viết — `posts.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getPosts` | `GET /posts` | query: `q`, `category`, `page`, `limit` | `Paginated<Post>` | — | ⬜ |
| `getPostBySlug` | `GET /posts/{slug}` | — | `Post` | 404 | ⬜ |
| `getLatestPosts` | `GET /posts/latest` | query `limit` (mặc định 4) | `Post[]` | — | ⬜ |
| `getRelatedPosts` | `GET /posts/{slug}/related` | query `limit` (mặc định 3) | `Post[]` | 404 | ⬜ |
| `getPostCategories` | `GET /posts/categories` | — | `PostCategory[]` | — | ⬜ |

- `q` tìm trong **cả tiêu đề lẫn tóm tắt** (`title` + `excerpt`), không phân biệt hoa thường.
  > **Code hiện tại KHÔNG bỏ dấu ở đây**, khác với tìm kiếm sản phẩm — `posts.api.ts` chỉ gọi `toLowerCase()`, nên gõ "rau huu co" sẽ không ra bài "rau hữu cơ". **Khuyến nghị backend bỏ dấu cho cả hai**; phía frontend không phải sửa gì. Xem `docs/schema.md` mục 5.
- `category` lọc theo **slug** (`kien-thuc`), không phải tên hiển thị.
- `Post.content` dùng **tập Markdown rút gọn**: `##`, `###`, `-`, `1.`, `>`, `**đậm**`. Bộ render ở `src/components/blog/PostContent.tsx` chỉ hỗ trợ đúng sáu cú pháp đó và **cố ý không dùng `dangerouslySetInnerHTML`**. Backend trả HTML thô sẽ hiện ra dưới dạng văn bản thuần, không phải HTML.
- `getRelatedPosts` trả bài **cùng chuyên mục** và **không chứa chính bài đang đọc**.

### B.4 Xác thực — `auth.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `login` | `POST /auth/login` | `LoginPayload` | `AuthResponse` | 401 sai thông tin | ⬜ |
| `register` | `POST /auth/register` | `RegisterPayload` | `AuthResponse` | 409 email trùng | ⬜ |
| `refreshSession` | `POST /auth/refresh` | `{ refreshToken }` | `AuthResponse` | 401 hết hạn | ⬜ |
| `logout` | `POST /auth/logout` | `{ refreshToken }` | `204` | — | ✅ |
| `forgotPassword` | `POST /auth/forgot-password` | `{ email }` | `204` | **422**, **429** quá nhiều lần | ⬜ |
| `updateProfile` | `PUT /auth/me` | `{ fullName?, email?, phone? }` | `User` | 401, 404, 409 email trùng, **422** | ✅ |
| `changePassword` | `PUT /auth/password` | `ChangePasswordPayload` | `204` | 401, 404, **422** sai mật khẩu cũ | ✅ |
| `resetPassword` | `POST /auth/reset-password` | `{ token, newPassword }` | `204` | **422** | ⬜ |

**Tám điều bắt buộc:**

1. `User` trả về **không bao giờ chứa password** — kể cả dạng đã hash.
2. `updateProfile` **không được cho phép ghi đè `id` hay `role`**, kể cả khi client gửi lên. Hai trường này bị chốt lại từ bản ghi cũ; sửa hồ sơ không được phép tự nâng quyền.
3. `register` **luôn tạo tài khoản `role: "customer"` và bỏ qua mọi trường `role` gửi lên trong body.** `RegisterPayload` cố ý không khai `role`, nhưng backend vẫn phải tự bỏ qua nó — client gửi thừa một trường là chuyện không ngăn được. **Vai trò chỉ được gán ở phía server** (§C.4.2 và [ADR 0002](../../../management/decisions/0002-phan-quyen-role-va-namespace-admin.md)); nếu client tự chọn được vai trò thì ai cũng tự cấp quyền quản trị cho mình được.
4. `logout` phải **thu hồi refresh token**, nếu không nó vẫn dùng được đến khi hết hạn dù người dùng đã thoát.
5. `forgotPassword` **luôn trả 204**, kể cả khi email không tồn tại. Trả 404 sẽ biến endpoint này thành công cụ dò xem địa chỉ nào đã đăng ký.
6. **Cùng một mã trạng thái là CHƯA ĐỦ — hai nhánh còn phải không phân biệt được qua **mọi kênh quan sát được**, kể cả **thời gian phản hồi**. Không phải lý thuyết: bản dựng đầu tiên của `forgot-password` trên backend thật tách được "email có thật" khỏi "email không có" ở median **25,2ms vs 9,3ms** (40 mẫu xen kẽ) — một oracle dò tài khoản hoàn chỉnh, nằm sau một mã `204` đúng suốt. Đã vá bằng cách đưa cả use case ra khỏi request thread. Luật này áp cho **cả `login`** (điều 1 của §B.4 cũ) và **`resetPassword`**.
7. `resetPassword` gộp **ba ca hỏng** — token sai, hết hạn, đã dùng — thành **một `422` giống hệt nhau**. Tách ra là dựng lại đúng cái oracle ở điều 6. Token đi trong **query string** của link email (`/dat-lai-mat-khau?token=…`), không phải trong đường dẫn.
8. `updateProfile` nhận **đúng ba trường** `fullName` / `email` / `phone` — **không có `avatar`**, dù `User` có trường đó. Hiện không màn hình nào cho sửa ảnh đại diện; muốn làm thì phải mở rộng endpoint trước. **`User` trả về từ `PUT /auth/me` KHÔNG chứa `role`** (đúng 5 trường `id, fullName, email, phone, avatar`) — client phải bồi `role` lại từ claim JWT, không thì người dùng sửa hồ sơ xong là **mất quyền admin trên giao diện**.

`getCurrentUserId()` trong cùng file **không phải endpoint** — nó giải id từ token phía client. Khi ghép backend thật, id lấy từ JWT ở phía server.

### B.5 Sổ địa chỉ — `addresses.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getMyAddresses` | `GET /addresses` | — | `Address[]` | 401 | ✅ |
| `createAddress` | `POST /addresses` | `AddressPayload` | `Address` | 401 | ✅ |
| `updateAddress` | `PUT /addresses/{id}` | `AddressPayload` | `Address` | 401, 404 | ✅ |
| `deleteAddress` | `DELETE /addresses/{id}` | — | `204` | 401, 404 | ✅ |
| `setDefaultAddress` | `PUT /addresses/{id}/default` | — | `204` | 401, 404 | ✅ |

- Địa chỉ **thuộc về người dùng trong JWT**. Sửa/xoá địa chỉ của người khác phải trả **403 hoặc 404**, không được 200.
- `setDefaultAddress` phải **bỏ cờ mặc định của địa chỉ cũ** trong cùng một giao dịch. Hai địa chỉ cùng `isDefault: true` sẽ khiến trang thanh toán điền sẵn tuỳ tiện.
- Địa chỉ đầu tiên của một tài khoản nên tự động thành mặc định.

### B.6 Đơn hàng — `orders.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `validateCart` | `POST /cart/validate` | `{ items: CartItem[] }` | `CartIssue[]` | — | ⬜ |
| `createOrder` | `POST /orders` | `CreateOrderPayload` | `Order` | 400 giỏ trống, 409 hết hàng, 422 mã giảm giá sai | ⬜ |
| `getMyOrders` | `GET /orders/me` | — | `Order[]` | 401 | ✅ |
| `getOrderByCode` | `GET /orders/{code}` | — | `Order` | 404 | ⬜ |

- `createOrder` là **⬜ công khai**: khách vãng lai đặt hàng được. Có token thì backend gán `userId`, không có thì `userId: null`.
- `getOrderByCode` cũng công khai — đây là **lối duy nhất** để khách vãng lai xem lại đơn của mình, vì `getMyOrders` lọc nghiêm ngặt theo `userId`. Mã đơn (`NSS-20260817-0001`) vì vậy nên **khó đoán** ở môi trường thật; dạng tuần tự hiện tại chỉ hợp với mock.
- `validateCart` trả về mảng vấn đề, rỗng nghĩa là giỏ hợp lệ. `out_of_stock` và `insufficient_stock` **chặn** thanh toán; `price_changed` chỉ cảnh báo.

`calcShippingFee()` trong cùng file **không phải endpoint** — chỉ là ước tính hiển thị ở client (miễn phí từ 500.000 ₫, dưới ngưỡng là 30.000 ₫). Luật này **đã được đối chiếu với luật của server bằng đơn thật** ngày 2026-08-26 và hai bên khớp; số đo và ràng buộc chéo nằm ở **§C.5** — đọc trước khi đổi bất kỳ con số nào trong hai bên.

### B.7 Mã giảm giá — `coupons.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `validateCoupon` | `POST /coupons/validate` | `{ code, subtotal }` | `Coupon` | 404 không tồn tại, 422 chưa đủ giá trị tối thiểu | ⬜ |
| `getActiveCoupons` | `GET /coupons/active` | — | `Coupon[]` | — | ⬜ |

Frontend **chỉ lưu chuỗi mã** trong giỏ hàng, không lưu cả object `Coupon`, và xác thực lại mỗi khi giá trị đơn thay đổi. Lý do: giỏ hàng nằm trong localStorage nhiều ngày — áp mã lúc đơn 300k rồi xoá bớt hàng còn 100k thì mã phải hết hiệu lực ngay.

Ba điều đo được từ `/v3/api-docs` + request thật (backlog 0022, 2026-08-26) mà bảng trên không ghi:

- `ValidateCouponRequest`: `code` và `subtotal` đều **`required`**; `code` có **`maxLength: 32`**, `subtotal` là `int64`.
- **Backend tự chuẩn hoá `code` về chữ HOA** — gửi `chaoban10` trả về `{"code":"CHAOBAN10", …}`. Client **không** nắn chữ trước khi gửi; `cart.store.applyCoupon` viết hoa là để hiển thị và để khoá cache ổn định, không phải để thay backend làm việc đó.
- Cả `404` lẫn `422` trả `application/problem+json`, có `detail` tiếng Việt và **không** kèm map `errors` — đây là lỗi quy tắc nghiệp vụ, không phải lỗi validate theo ô.

### B.8 Đánh giá — `reviews.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getProductReviews` | `GET /products/{id}/reviews` | — | `Review[]` | — | ⬜ |
| `getReviewSummary` | `GET /products/{id}/reviews/summary` | — | `ReviewSummary` | — | ⬜ |
| `createReview` | `POST /products/{id}/reviews` | `CreateReviewPayload` | `Review` | 422 nội dung < 10 ký tự hoặc sao ngoài 1–5 | ⬜ |

`ReviewSummary.distribution` là object khoá `'1'`…`'5'`, giá trị là số lượt — dùng vẽ biểu đồ phân bố sao.

### B.9 Địa giới hành chính — `locations.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getProvinces` | `GET /locations/provinces` | — | `Province[]` | — | ⬜ |
| `getDistricts` | `GET /locations/provinces/{code}/districts` | — | `District[]` | — | ⬜ |
| `getWards` | `GET /locations/districts/{code}/wards` | — | **`string[]`** | — | ⬜ |

> **`getWards` trả mảng chuỗi tên, KHÔNG phải object.** Đây là chủ ý, không phải sót: `Address.ward` và `ShippingInfo.ward` đều lưu tên phường chứ không lưu mã, nên `{ code, name }` sẽ không ai dùng tới. Tỉnh và quận thì ngược lại — cần cả mã vì ô `<Select>` chạy theo mã.

Mock hiện chỉ có **10 tỉnh rút gọn**. Backend cấp bộ đầy đủ 63 tỉnh; chữ ký ba hàm giữ nguyên.

### B.10 Nội dung marketing — `marketing.api.ts`

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getHeroSlides` | `GET /hero-slides` | — | `HeroSlide[]` | — | ⬜ |
| `getPromoBanners` | `GET /promo-banners` | — | `PromoBanner[]` | — | ⬜ |
| `getTestimonials` | `GET /testimonials` | — | `Testimonial[]` | — | ⬜ |
| `getBrands` | `GET /brands` | — | `Brand[]` | — | ⬜ |
| `subscribeNewsletter` | `POST /newsletter/subscribe` | `{ email }` | `204` | **422** email sai | ⬜ |

### B.11 Giới thiệu & Liên hệ

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getAboutContent` | `GET /about` | — | `AboutContent` | — | ⬜ |
| `sendContactMessage` | `POST /contact` | `ContactPayload` | `ContactMessage` | **422** | ⬜ |

Toàn bộ nội dung trang Giới thiệu (câu chuyện, mốc thời gian, con số, cam kết) là **dữ liệu**, không viết cứng trong component — người vận hành sửa được mà không cần deploy.

### B.12 Khu quản trị — `/admin/**` (khung, chưa chốt)

> **Khung điền dần.** Bốn mục dưới đây được điền bởi các ticket dựng khu quản trị; đặt sẵn khung ở đây để mọi endpoint quản trị rơi vào đúng một chỗ thay vì mọc rải rác trong bảng B. **§B.12.1 đã chốt** (backlog 0004, 5 endpoint), **§B.12.2 đã chốt** (backlog 0005, 3 endpoint) và **§B.12.3 đã chốt** (backlog 0006, 2 endpoint; định nghĩa "khách hàng" chốt ở backlog 0008) và **§B.12.4 đã chốt** (backlog 0007, 1 endpoint) — cả bốn đã cộng vào §F. Khung này giờ đã đầy; thêm endpoint quản trị mới thì mở mục §B.12.5 và cập nhật §F trong cùng lần sửa.

Luật chung cho **mọi** endpoint trong mục này, không có ngoại lệ:

- Nằm dưới tiền tố `/admin/**`, bắt buộc JWT có `role == "admin"` — gác bằng **một filter trên cả tiền tố**, không rải `@PreAuthorize` từng handler (§C.4.2, §C.4.3).
- **Được phép** nhận `userId` như một **bộ lọc** — đây là khác biệt duy nhất so với phạm vi khách hàng, và là lý do namespace này tồn tại.
- Sai vai trò → **403**; không token → **401**.
- Cần dữ liệu của khách hàng khác thì mở **endpoint song sinh** ở đây, **không** thêm `?userId=` vào endpoint ngoài `/admin` (§C.4.3b).

#### B.12.1 Sản phẩm — thêm, sửa, xoá

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getAdminProducts` | `GET /admin/products` | query: `q`, `category`, `stockStatus`, `sort`, `page`, `limit` | `Paginated<Product>` | 401, 403 | 🔒 admin |
| `getAdminProduct` | `GET /admin/products/{id}` | — | `Product` | 401, 403, 404 | 🔒 admin |
| `createProduct` | `POST /admin/products` | `ProductPayload` | `Product` (201) | 401, 403, 409, **422** | 🔒 admin |
| `updateProduct` | `PUT /admin/products/{id}` | `ProductPayload` | `Product` | 401, 403, 404, 409, **422** | 🔒 admin |
| `deleteProduct` | `DELETE /admin/products/{id}` | — | `204 No Content` | 401, 403, 404 | 🔒 admin |

Hàm nằm ở `src/api/adminProducts.api.ts`, **không** ở `products.api.ts`: hai namespace được gác bằng hai lớp bảo mật khác nhau, để chung file là mời một lời gọi ghi lọt ra ngoài hàng rào.

- **Khoá theo `id`, không phải `slug`.** Khác hẳn `GET /products/{slug}` của trang cửa hàng. Admin sửa được chính cái slug, nên đường dẫn màn sửa (`/quan-tri/san-pham/:id/chinh-sua`) không được treo vào một trường có thể đổi — link đã lưu sẽ hỏng ngay sau lần Lưu đầu tiên.
- **`stockStatus`** nhận `in_stock` · `low_stock` · `out_of_stock`, với `low_stock` là `0 < stock <= 10` (`LOW_STOCK_THRESHOLD` trong `lib/constants.ts`). Backend phải dùng **đúng con số đó**: lệch ngưỡng thì bộ lọc trả một tập còn nhãn trên từng dòng nói khác, và không có lỗi nào nổ ra.
- **`q`** khớp `name` **hoặc** `slug` — rộng hơn `q` của `GET /products` (chỉ `name` + `shortDescription`), vì slug là thứ admin trực tiếp sửa.
- **`ProductPayload.slug` bỏ trống thì backend tự sinh từ `name`** (bỏ dấu, nối bằng gạch ngang). Slug đã có người dùng → **409**, kèm `ProblemDetail` tiếng Việt; **không** tự thêm hậu tố `-1`. Slug đi thẳng lên URL công khai, một cái slug lặng lẽ khác thứ admin vừa gõ sẽ phá đúng cái link họ chuẩn bị chia sẻ.
- **`rating`, `reviewCount`, `sold`, `createdAt` không nằm trong `ProductPayload`** — backend **bỏ qua** nếu client cố gửi (§C.3). Cho sửa nghĩa là số sao hiển thị sẽ mâu thuẫn với chính danh sách đánh giá ngay bên dưới nó.
- **`images` là đường dẫn tương đối `/images/...`** ở **cả** request lẫn response (§A.5). Client không bao giờ gửi URL đã ghép `VITE_IMAGE_BASE_URL` lên — làm vậy là ghi gốc CDN xuống cơ sở dữ liệu.
- **Đã chốt 2026-08-25 — `DELETE` là xoá MỀM.** Sản phẩm bị xoá vẫn được các đơn hàng cũ tham chiếu nên dòng ở lại trong bảng, chỉ tắt cờ. **Hệ quả Owner đã chấp nhận:** sản phẩm đã xoá biến mất khỏi **cả** `GET /products` **lẫn** `GET /admin/products`, và **không có đường khôi phục từ UI** — khôi phục ở tầng DB. **Không** thêm tham số xem hàng đã xoá.
- **Slug của sản phẩm đã xoá mềm vẫn bị giữ chỗ** (ràng buộc duy nhất phủ toàn bảng), nên tạo lại cùng slug trả **409**. Là chủ ý: slug đi thẳng lên URL công khai và có thể còn link cũ trỏ tới.
- **`slug` client gửi lên cũng bị `slugify`, không bị từ chối.** `"  Cà Rốt  Hữu Cơ ĐẶC BIỆT!!  "` ra `ca-rot-huu-co-dac-biet` và **201**, khớp hành vi `resolveSlug` của lớp mock.
- **`sort` nhận đúng 5 giá trị** `newest` · `price_asc` · `price_desc` · `best_selling` · `rating`, mặc định `newest`. Giá sắp theo **giá sau giảm**, không phải `price`.
- **`category` lọc theo slug và KÉO THEO danh mục con một cấp**; slug không tồn tại → **tập rỗng**, không phải toàn bộ danh sách.

> **RÀNG BUỘC CHÉO — đọc trước khi nới bất kỳ luật validate nào về giá.**
>
> Công thức "giá sau giảm" của hai bên **không giống nhau**, và chúng chỉ trùng kết quả **nhờ một luật validate**:
>
> ```
> Backend:  effective_price = COALESCE(sale_price, price)
> Frontend: lib/format.ts → salePrice && salePrice < price ? salePrice : price
> ```
>
> Hai công thức **lệch nhau khi `salePrice >= price`** — ca đó không xảy ra chỉ vì backend chặn bằng **422**. **Nới luật đó ở bất kỳ đâu — kể cả "cho phép giá khuyến mãi bằng giá gốc" nghe rất vô hại — sẽ làm `price_asc`/`price_desc` và `minPrice`/`maxPrice` lệch âm thầm**, đúng loại lỗi mà §B.1 đã cảnh báo. Sửa thì phải sửa **cả hai bên cùng lúc**.

#### B.12.2 Đơn hàng — liệt kê chéo người dùng, đổi trạng thái

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getAdminOrders` | `GET /admin/orders` | query: `q`, `status`, `userId`, `page`, `limit` | `Paginated<Order>` | 401, 403 | 🔒 admin |
| `getAdminOrderByCode` | `GET /admin/orders/{code}` | — | `Order` | 401, 403, 404 | 🔒 admin |
| `updateOrderStatus` | `PATCH /admin/orders/{code}/status` | `{ status: OrderStatus }` | `Order` | 401, 403, 404, **422** | 🔒 admin |

> Song sinh với `GET /orders/me`. Hai endpoint tồn tại song song **chính là** cách giữ §C.4.1 không bị nới lỏng.

**✅ Đã ghép backend Spring Boot thật — backlog 0023, đo `/v3/api-docs` 2026-08-26 (28 operation).** Cả ba dòng trên khớp từng ô: tham số, mã lỗi, `security: bearerAuth`. `PaginatedResponseOrderResponse` = `{ items, total, page, limit, totalPages }` đúng `Paginated<T>`, và `UpdateOrderStatusRequest.status` là enum **đúng 5 giá trị** khớp `OrderStatus`.

⚠️ **Phương thức là `PATCH`, không phải `PUT`** — bản mock trước 0023 không phát request nào nên ô này chưa bao giờ phải đúng. Lượt smoke của 0023 quan sát đúng một dòng `PATCH /api/admin/orders/{code}/status` khi admin đổi trạng thái.

Hàm nằm ở `src/api/adminOrders.api.ts`, **không** ở `orders.api.ts` — cùng lý do với §B.12.1: hai namespace được gác bằng hai lớp bảo mật khác nhau.

- **Khoá theo `code`, không phải `id`.** Khớp URL `/quan-tri/don-hang/:code` và khớp `GET /orders/{code}` sẵn có. Mã đơn (`NSS-20260817-0001`) là thứ duy nhất nhân viên và khách cùng đọc được qua điện thoại; `id` không bao giờ rời khỏi cơ sở dữ liệu.
- **`q`** khớp **mã đơn** hoặc **tên người nhận** hoặc **số điện thoại người nhận** — lấy từ `order.shipping`, **không** phải từ hồ sơ tài khoản: đơn của khách vãng lai không có tài khoản nào để tra, và người đặt hộ vẫn phải tìm ra đơn theo tên người nhận thật. So khớp tên **bỏ dấu** (`nguyen van an` khớp `Nguyễn Văn An`).
- **`userId`** là bộ lọc hợp lệ **ở đây và chỉ ở đây** (§C.4.3b). `/orders/me` lấy chủ đơn từ claim `sub` của JWT và không bao giờ nhận tham số này.
- **Không có `sort`.** Thứ tự cố định: `createdAt` giảm dần. Đơn mới là đơn cần xử lý; thêm ô sắp xếp chỉ tạo ra một cách để bỏ sót đơn mới.
- **`status` không nằm trong enum → `200` kèm trang RỖNG**, đo 2026-08-26 (backlog 0023): `GET /admin/orders?status=KHONGCOTHAT` trả `{"items":[],"total":0,"page":1,"limit":3,"totalPages":0}`. **Không phải `422`**, và cũng **không giống `/admin/products`** — chỗ đó bỏ qua tham số sai rồi trả *cả danh sách*. Hai endpoint cùng im lặng nhưng hỏng theo hai kiểu ngược nhau; đây là chỗ ghi lại sự thật đó thay vì để người sau đoán.
  - **Ở tầng ứng dụng, giá trị bịa không bao giờ tới được server.** `AdminOrdersPage` đọc `status` từ URL qua `parseStatus()`, thứ chỉ nhận đúng 5 giá trị của `OrderStatus` và trả `undefined` cho mọi thứ khác — nên `/quan-tri/don-hang?status=KHONGCOTHAT` phát đi `?page=1&limit=12` **không kèm `status`**, bảng hiện **cả danh sách**, còn ô lọc tự về "Mọi trạng thái". URL vẫn ghi bộ lọc bịa trong khi bảng không lọc gì: **im lặng nằm ở client, không ở server.**
  - Khi một tập rỗng *thật sự* về tới màn hình (ví dụ `q` không khớp gì), giao diện vẽ **`EmptyState`** — `<h2>` "Không có đơn hàng nào khớp" kèm gợi ý hành động, **không có `<table>`, không có phân trang**. Không phải một bảng trắng trông như đang lỗi.
- **Không có endpoint xoá đơn, và cũng không được mở.** Đơn đã đặt là chứng từ. Sửa items/tiền của đơn cũng vậy — số tiền trên đơn là bản chụp tại thời điểm đặt (§C.1), sửa về sau là làm lệch chính thứ khách đã trả.

**Luồng trạng thái hợp lệ — backend phải cưỡng chế, không phải client.**

| Từ | Được chuyển sang |
|---|---|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `shipping`, `cancelled` |
| `shipping` | `delivered`, `cancelled` |
| `delivered` | — (trạng thái cuối) |
| `cancelled` | — (trạng thái cuối) |

- Chuyển ngoài bảng trên → **422** kèm `ProblemDetail` tiếng Việt. Kể cả `status` trùng trạng thái hiện tại cũng là 422: nó không nằm trong danh sách được phép.
- **✅ Đã đo trên backend thật 2026-08-26** (backlog 0023): `confirmed → pending` trả `422` `"Không thể chuyển đơn hàng từ trạng thái \"Đã xác nhận\" sang \"Chờ xác nhận\"."`, và `confirmed → confirmed` cũng `422` với câu cùng khuôn — đúng cả hai vế của điều trên. Đơn **không đổi trạng thái** sau lượt bị từ chối.
- `delivered` và `cancelled` **không quay lui được**: đã giao rồi thì không "chưa xác nhận" lại được, đã huỷ rồi thì phải tạo đơn mới.
- Bảng này là bản sao của `ORDER_STATUS_TRANSITIONS` trong `src/lib/orderStatus.ts`. **Ô chọn ở giao diện chỉ liệt kê lựa chọn hợp lệ cho tiện tay — đó là tiện lợi, không phải hàng rào.**
- **Từ backlog 0023, client KHÔNG kiểm lại luật này nữa.** Lớp mock trước đây `throw` ngay trong `updateOrderStatus()`; bản gọi backend thật thì không, và đó là chủ ý: thêm một vòng kiểm ở client nghĩa là **nuốt mất chính câu `detail` của server**, thay nó bằng một câu client tự bịa ra từ một bản đơn có thể đã cũ. Ô chọn vẫn dựng từ `ORDER_STATUS_TRANSITIONS`, nhưng nó vẽ theo dữ liệu **đang cache**: khi đơn đã bị người khác đổi trong lúc màn hình đang mở, ô chọn mời một bước không còn hợp lệ, `PATCH` ăn `422`, và câu của server hiện nguyên văn ở chỗ vừa thao tác (`AdminOrderDetailPage`, khối `updateStatus.isError`). Lượt smoke của 0023 dựng đúng ca đó và quan sát được `p[role="alert"]` mang **đúng chuỗi `detail`** của server, không phải câu dự phòng `422` của `lib/apiError.ts`.

#### B.12.3 Khách hàng — chỉ đọc

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getAdminUsers` | `GET /admin/customers` | query: `q`, `role` (**bỏ trống ⇒ `customer`**), `page`, `limit` | `Paginated<User>` | 401, 403 | 🔒 admin |
| `getAdminUser` | `GET /admin/customers/{id}` | — | `User` | 401, 403, 404 | 🔒 admin |

Hàm nằm ở `src/api/adminUsers.api.ts`, **không** ở `auth.api.ts` — cùng lý do với §B.12.1 và §B.12.2: `/auth/**` là namespace của chính người đang đăng nhập, `/admin/**` là namespace đọc chéo mọi người dùng, và hai bên được gác bằng hai lớp bảo mật khác nhau.

- **Chỉ đọc, và giai đoạn này cố ý KHÔNG mở đường ghi.** Không sửa hồ sơ, không xoá, không khoá tài khoản, không đổi vai trò (backlog 0006). Riêng vai trò thì không phải "chưa làm" mà là **không được làm ở đây**: `role` chỉ được gán ở phía server và `PUT /auth/me` cũng phải bỏ qua nó (ADR 0002, §C.4). Một endpoint `PATCH /admin/customers/{id}/role` mở ra là mở đúng cái cửa ADR đó đóng lại — cần thì phải là một quyết định của Owner, không phải một dòng thêm vào bảng này.
- **`User` không bao giờ kèm `password`** — kể cả hash. Backend trả **DTO**, không trả entity; lớp mock làm đúng vậy bằng `toPublicUser()` ngay tại ranh giới đọc kho dữ liệu, nên không lời gọi nào ở tầng trên còn cầm được trường đó. Đây là khẳng định kiểm được: `getAdminUsers()` trả về object không có khoá `password`.
- **Khoá theo `id`, không phải email.** Email là thứ khách tự sửa được ở `/tai-khoan`, mà link hồ sơ đã lưu không được hỏng sau lần Lưu đầu tiên — cùng lý do `getAdminProduct` khoá theo `id` chứ không theo `slug` (§B.12.1).
- **`q`** khớp **họ tên** hoặc **email** hoặc **số điện thoại**. So khớp tên **bỏ dấu** (`le thi bich` khớp `Lê Thị Bích`), email so khớp trên chuỗi đã hạ chữ thường, số điện thoại khớp cả đoạn giữa.
- **"Khách hàng" = `role == "customer"`, và `role` bỏ trống thì backend mặc định đúng tập đó** (Owner chốt 2026-08-24, backlog 0008). Tài khoản quản trị là nhân viên nội bộ, không phải khách — `GET /admin/customers` không kèm tham số nào thì **không** được trả về bản ghi `admin` nào.
- **Đây phải là đúng tập mà `customerCount` của §B.12.4 đếm.** Hai mục này là hai chỗ duy nhất trong tài liệu đếm người dùng, và chúng phải đếm **cùng một tập**: lệch nhau thì người dùng thấy bảng 11 dòng còn ô chỉ số ghi 12, không có lỗi nào nổ ra và không chỗ nào nói ra là vì sao. Ai điền §B.12.4 thì đọc dòng này trước; ai đổi định nghĩa ở đây thì sửa cả §B.12.4 trong cùng lần sửa.
- **`role` vẫn là bộ lọc, không phải cột phân quyền** — mặc định `customer` là **mặc định**, không phải hàng rào. Truyền `role=admin` vẫn trả về tài khoản quản trị; đó là chỗ để xem tập khác khi cần, và là lý do bảng vẫn giữ cột "Vai trò" (sẽ nói đúng ngay khi có vai trò thứ ba). Quyền vào được namespace này đã do filter `/admin/**` gác, không phải do tham số này.
- **Không có `sort`.** `AdminUserQuery` cố ý không khai nó (hợp đồng chốt ở backlog 0003). Thứ tự cố định là **`id` tăng dần**, chứ không phải "mới nhất trước": `User` **không có `createdAt`**, nên không tồn tại mốc thời gian nào để xếp theo. Muốn thứ tự đó thì phải thêm trường vào `types/user.ts` **và** vào hợp đồng này trước — không phải đoán ở lớp truy vấn.
- **Lịch sử đơn của một khách KHÔNG có endpoint riêng.** Màn hồ sơ gọi lại `GET /admin/orders?userId={id}` (§B.12.2). Đây chính là chỗ §C.4.2 được dùng đến: `userId` là bộ lọc hợp lệ **trong** namespace `/admin`, và vì có nó nên `/orders/me` không bao giờ cần mọc thêm `?userId=` (§C.4.3b). Thêm `GET /admin/customers/{id}/orders` là tạo cái thứ hai làm đúng việc cái thứ nhất đã làm, với một hàng rào quyền phải nhớ gác lại lần nữa.

#### B.12.4 Tổng quan — số liệu tổng hợp

| Hàm frontend | Endpoint | Request | Response | Lỗi | Auth |
|---|---|---|---|---|---|
| `getAdminOverview` | `GET /admin/stats/overview` | query: `days` (**bỏ trống ⇒ 30**) | `AdminOverview` | 401, 403, **422** | 🔒 admin |

> Số liệu tổng hợp **do backend tính**, cùng lý do với §C.3: gộp ở client nghĩa là tải toàn bộ đơn hàng của mọi khách về trình duyệt.

Hàm nằm ở `src/api/adminStats.api.ts`, shape trả về là `AdminOverview` trong `src/types/admin.ts`. Đây là **endpoint chỉ đọc và sẽ luôn chỉ đọc**: số liệu ở đây được *suy ra* từ đơn hàng, sản phẩm và tài khoản, không phải một bản ghi ai đó sửa được. Một endpoint ghi vào `/admin/stats/**` là dấu hiệu số liệu đang được nhập tay ở đâu đó thay vì tính ra.

**Ba định nghĩa dưới đây là phần dễ tranh cãi nhất của mục này — chúng được viết ra chính vì thế.**

- **`revenue` = tổng `total` của mọi đơn KHÔNG ở trạng thái `cancelled`**, trong `days` ngày gần nhất. Đơn đã huỷ **vẫn** được tính vào `orderCount` và vào cột `cancelled` của `ordersByStatus` — nó đã xảy ra — nhưng không phải tiền cửa hàng thu được. Đây là con số sẽ có người tranh cãi, nên nó nằm ở đây thay vì để mỗi client tự đoán.
- **`customerCount` chỉ đếm tài khoản `role == "customer"`** (Owner chốt 2026-08-24, backlog 0008). **Đây phải là đúng tập mà `GET /admin/customers` của §B.12.3 trả về khi không kèm tham số `role`** — hai chỗ này là hai chỗ duy nhất trong tài liệu đếm người dùng, và chúng phải đếm **cùng một tập**. Định nghĩa "khách hàng" được ghim ở §B.12.3; đọc mục đó trước khi đổi bất cứ thứ gì ở đây, và ai đổi định nghĩa ở §B.12.3 thì sửa cả mục này trong cùng lần sửa. Lệch nhau thì bảng `/quan-tri/khach-hang` ghi 11 dòng còn ô chỉ số ghi 12, không có lỗi nào nổ ra và không chỗ nào nói ra là vì sao.
- **`lowStockCount` = số sản phẩm có `0 < stock <= 10`** — `LOW_STOCK_THRESHOLD` trong `lib/constants.ts`, **đúng con số** mà bộ lọc `stockStatus=low_stock` (§B.12.1) và nhãn tồn kho trên từng dòng đang dùng. Lệch ngưỡng thì ô chỉ số nói một đằng, danh sách lọc ra một nẻo.

**Chuỗi thời gian phải DÀY, zero-filled bởi backend.**

- `revenueByDay` có **đúng `days` phần tử**, sắp tăng dần theo ngày, `date` dạng `YYYY-MM-DD`; ngày không có đơn trả `revenue: 0` chứ **không** bị bỏ qua.
- `ordersByStatus` có **đủ cả 5 trạng thái**, kể cả trạng thái đang có `count: 0`.
- Không zero-fill thì **mọi** client — web, Android, iOS — phải tự dựng lại khung ngày y hệt nhau: đường biểu đồ nối thẳng qua khoảng trống và đọc thành "doanh thu đều", còn cột trạng thái nhảy chỗ mỗi lần tải lại. Recharts (và mọi thư viện chart khác) **không vẽ gì cho một cột `count: 0`** — client phải tự thêm `minPointSize` để cột đó có mặt; đó là việc của client, nhưng nó chỉ làm được khi mốc rỗng thật sự có trong dữ liệu.

**Cái gì theo khoảng, cái gì không.**

| Trường | Phụ thuộc `days`? |
|---|---|
| `revenue`, `orderCount`, `revenueByDay`, `ordersByStatus` | ✅ — cả bốn nằm trong **cùng một** khoảng |
| `customerCount`, `lowStockCount` | ❌ — ảnh chụp hiện tại |

`customerCount` không có chiều thời gian vì `User` **không có `createdAt`** (§B.12.3, cùng lý do khiến danh sách khách hàng không có `sort`); tồn kho thì chỉ có giá trị "ngay lúc này". Ngược lại, `orderCount` **bắt buộc** dùng cùng khoảng với `revenue`: hai ô đứng cạnh nhau trên cùng một màn mà một ô đếm mọi thời kỳ còn ô kia chỉ 30 ngày là hai con số mâu thuẫn nhau ngay trước mắt người đọc.

**Hai bất biến kiểm được từ chính response** — vi phạm là backend tính sai, không phải client hiển thị sai:

- `revenue == sum(revenueByDay[].revenue)`
- `orderCount == sum(ordersByStatus[].count)`

**Ngày tính theo múi giờ của cửa hàng, không phải UTC.** Đơn đặt lúc 20:00 giờ Việt Nam phải rơi vào đúng ngày đó, không bị đẩy sang hôm trước — nếu không thì cột "Ngày đặt" ở `/quan-tri/don-hang` và biểu đồ ở màn Tổng quan lệch nhau một ngày.

**`days` là preset, không phải khoảng ngày tuỳ ý.** Giao diện hiện chỉ có hai nút 7 và 30 (backlog 0007 chốt lọc theo khoảng tuỳ ý là non-goal). Backend nhận `days` ngoài dải hợp lý → **422** kèm map `errors` (§A.3 — `days` là một trường, nên nó theo luật của trường); **đừng âm thầm kẹp giá trị**, một khoảng khác thứ người dùng yêu cầu là một câu trả lời sai im lặng.

---

## C. Backend là nguồn chân lý ở những chỗ này

Phần dễ bị bỏ sót nhất. **Sai ở đây thành lỗ hổng bảo mật, không phải lỗi hiển thị.**

### C.1 Không tin bất kỳ con số tiền nào client gửi lên

`CreateOrderPayload.items` là `CartItem[]`, mà `CartItem` **mang theo `price`, `originalPrice` và `stock`** — đó là bản chụp lúc khách thêm vào giỏ, để giỏ hàng hiển thị đúng khi sản phẩm đổi giá.

Backend khi nhận `POST /orders` **phải bỏ qua các trường đó** và tính lại từ database:

| Con số | Backend phải làm gì |
|---|---|
| `price` mỗi dòng | Tra lại từ database theo `productId` |
| `subtotal` | Tự tính từ giá vừa tra |
| `discount` | Tự xác thực lại mã giảm giá theo `subtotal` vừa tính |
| `shippingFee` | Tự tính — `calcShippingFee()` ở client chỉ là ước tính hiển thị |
| `total` | Tự tính |
| `stock` | Kiểm lại tồn kho thật, **không tin `stock` trong `CartItem`** |

Frontend hiện tính tất cả những con số này ở client vì chưa có backend. Khi ghép thật, các con số client tính chỉ dùng để **hiển thị trước khi bấm đặt hàng**; con số trong `Order` trả về mới là con số thật, và frontend hiển thị lại theo đó.

### C.2 `userId` lấy từ JWT, client không gửi

`CreateOrderPayload` **không có trường `userId`** — đây là chủ ý. Nếu client gửi lên thì ai cũng đặt hàng hộ người khác được. Mock đã mô phỏng đúng cách này: `createOrder` gọi `getCurrentUserId()` giải từ token thay vì nhận từ payload.

### C.3 Tổng hợp điểm đánh giá là việc của backend

`createReview` ở mock **không cập nhật** `rating` và `reviewCount` của sản phẩm — đã ghi rõ trong comment của `getReviewSummary()` để không bị nhầm là bug. Backend phải tính lại hai trường này khi có đánh giá mới.

### C.4 Kiểm quyền sở hữu — hai phạm vi tách bạch

Khu quản trị cần liệt kê **mọi** đơn hàng và **mọi** khách hàng, tức đúng thứ mục này cấm. Quy tắc **không bị nới lỏng** để chiều admin — nới nó ra là hỏng đúng thứ nó bảo vệ. Thay vào đó nó được tách thành ba vế không lẫn vào nhau được. Xem [ADR 0002](../../../management/decisions/0002-phan-quyen-role-va-namespace-admin.md).

#### C.4.1 Phạm vi khách hàng — siết chặt hơn trước

Mọi endpoint **ngoài** `/admin` có chạm dữ liệu riêng của người dùng — `/addresses/**`, `/orders/me`, `/auth/me`, `/auth/password` — lấy chủ sở hữu **chỉ từ claim `sub` của JWT**. Không nhận `userId` qua query, path hay body.

Vi phạm ở đây là **rò rỉ dữ liệu**, không phải lỗi hiển thị.

#### C.4.2 Phạm vi quản trị — mới

Endpoint dưới `/admin/**` **cố ý truy vấn chéo người dùng** và bắt buộc JWT có `role == "admin"`.

- Nhóm này **được phép** nhận `userId` như một **bộ lọc** — đó là mục đích tồn tại của nó.
- Token hợp lệ nhưng sai vai trò → **403**. Không token → **401**.
- Chọn 403 chứ không phải 404: token hợp lệ, chỉ thiếu quyền. Đổi thành 404 để giấu sự tồn tại sẽ che mất lỗi cấu hình vai trò lúc vận hành.
- Vai trò **chỉ được gán ở phía server** — `POST /auth/register` luôn tạo `customer` (§B.4 điều 3), `PUT /auth/me` không được ghi đè `role` (§B.4 điều 2).

#### C.4.3 Luật giữ hai phạm vi tách bạch

**(a)** Kiểm vai trò là **một filter trên cả tiền tố `/admin/**`**, không rải rác từng handler. Một lần quên `@PreAuthorize` là rò dữ liệu toàn bộ khách hàng.

**(b) Không endpoint nào ngoài `/admin` được mọc thêm `?userId=`** chỉ vì admin cần dữ liệu đó. Cần thì mở **endpoint song sinh** dưới `/admin` — `/orders/me` và `/admin/orders` tồn tại song song chính là để tránh điều này. Cái giá là mỗi năng lực quản trị cần **hai** endpoint thay vì một endpoint có cờ; đó là cái giá cố ý.

> ⚠️ **`AdminRoute` ở frontend không phải bảo mật.** `src/components/auth/AdminRoute.tsx` chỉ ẩn màn hình cho gọn: `role` nó đọc nằm trong localStorage của chính máy người dùng, sửa `nss_auth` thành `role: "admin"` mất 5 giây. **Hàng rào thật duy nhất là filter ở §C.4.3a.** Rủi ro thật ở đây là nhầm lẫn — sẽ có người tưởng vòng chặn phía client có nghĩa gì đó.

### C.5 Luật phí vận chuyển — hai đầu phải cùng một luật, và nay đã đo

`calcShippingFee()` (`src/api/orders.api.ts`) là **ước tính hiển thị** trước khi đặt (§C.1); con số thật là `Order.shippingFee`. Tới 2026-08-26 **chưa ai đối chiếu hai luật** — chúng chỉ được *giả định* là giống nhau, và tín hiệu gián tiếp duy nhất là mã `FREESHIP` được mô hình hoá đúng bằng `SHIPPING_FEE`. Backlog 0024 đã đo: **năm đơn thật** đặt qua giao diện, mỗi đơn so **số trên `/thanh-toan` trước khi bấm Đặt hàng** với **`Order.*` trong response `POST /orders`**.

| Đơn | `subtotal` | Mã | `discount` | Ship — màn hình | Ship — server | `total` màn hình / server |
|---|---|---|---|---|---|---|
| `NSS-20260826-0018` | 90.000 | — | 0 | 30.000 | **30.000** | 120.000 / 120.000 |
| `NSS-20260826-0019` | 576.000 | — | 0 | 0 | **0** | 576.000 / 576.000 |
| `NSS-20260826-0020` | 504.000 | `HUUCO50` | 50.000 | 30.000 | **30.000** | 484.000 / 484.000 |
| `NSS-20260826-0021` | 500.000 | — | 0 | 0 | **0** | 500.000 / 500.000 |
| `NSS-20260826-0022` | 499.000 | — | 0 | 30.000 | **30.000** | 529.000 / 529.000 |

**Không lệch một đồng nào ở cả năm đơn.** Đó là một kết quả, không phải sự vắng mặt của kết quả: giả thuyết đối lập cho ra con số **khác** ở ba đơn cuối bảng, nên phép đo có răng.

> **RÀNG BUỘC CHÉO — hai đầu đang cùng một luật; nới một bên là phải nới bên kia.**
>
> ```
> Backend:  shippingFee = (subtotal − discount) >= 500.000 ? 0 : 30.000
> Frontend: lib/constants.ts  FREE_SHIPPING_THRESHOLD = 500_000, SHIPPING_FEE = 30_000
>           → orders.api.ts   calcShippingFee(subtotal − safeDiscount)   (hooks/useCart.ts)
> ```
>
> Ba điểm dưới đây **đã đo, đừng suy diễn lại**:
>
> **(a) Ngưỡng đúng 500.000 ₫, so bằng `>=`.** Đơn 499.000 vẫn mất 30.000; đơn **đúng** 500.000 được miễn. Hai đơn đó tồn tại chỉ để chốt con số — nếu chỉ có đơn 90.000 và 576.000 thì ngưỡng mới bị kẹp trong một khoảng, chưa phải một con số.
>
> **(b) Phí dưới ngưỡng là 30.000 ₫.**
>
> **(c) Cơ sở tính là `subtotal − discount`, KHÔNG phải `subtotal`.** Đơn 504.000 ₫ áp `HUUCO50` (−50.000) vẫn **bị tính 30.000 ₫**, vì 454.000 chưa tới ngưỡng. Đây là ca **duy nhất** phân biệt được hai luật, và là ca không ai nghĩ tới: một đơn *trên* ngưỡng vẫn phải trả phí ship.
>
> Vì sao ghim: lệch ở đây **không làm nổ lỗi nào**. Không exception, không log đỏ, không request hỏng — khách chỉ thấy một con số ở `/thanh-toan` rồi bị trừ một con số khác. Backend đổi luật ship mà không đổi hai hằng số phía FE thì triệu chứng duy nhất là tiền. Đổi thì đổi **cả hai bên cùng lúc**, và đo lại bằng đúng ba ca (a)(b)(c) — đo bằng đơn thật, vì `Order.shippingFee` không đọc được ở chế độ chỉ-đọc.

---

## D. Bảy thay đổi hợp đồng đã tích luỹ

Ghi lại vì chúng phát sinh rải rác qua các giai đoạn, và đều đã có ghi chú tại chỗ trong code.

| # | Thay đổi | Từ GĐ | Khai báo ở |
|---|---|---|---|
| 1 | `PaymentMethod` thêm `'momo'` và `'vnpay'` — tập đầy đủ: `cod` · `bank_transfer` · `momo` · `vnpay` | 6 | `types/order.ts` |
| 2 | `Order.userId: number \| null` — `null` là đơn khách vãng lai. **Không** có trong `CreateOrderPayload` | 7 | `types/order.ts` |
| 3 | `Address` thêm `provinceCode` và `districtCode` — **giữ cả mã lẫn tên** | 7 | `types/user.ts` |
| 4 | `Post.categorySlug`; `getPostCategories()` trả `PostCategory[]` thay vì `string[]` | 8 | `types/post.ts` |
| 5 | `AuthResponse.refreshToken` | 10 | `types/user.ts` |
| 6 | `User.role: 'customer' \| 'admin'` — **bắt buộc**, không phải `role?:`. Phản chiếu claim `role` trong JWT. `RegisterPayload` **không** có trường này | Khu QT | `types/user.ts` |
| 7 | Namespace `/admin/**` được phép truy vấn chéo người dùng; §C.4 tách thành C.4.1 / C.4.2 / C.4.3 | Khu QT | §B.12, §C.4 |

**#6 và #7 đến từ đâu:** [ADR 0002](../../../management/decisions/0002-phan-quyen-role-va-namespace-admin.md) và backlog 0002. "Khu QT" là giai đoạn 1 của khu vực quản trị `/quan-tri`, không nằm trong dãy giai đoạn 1–10 của phần khách hàng.

**Vì sao `role` bắt buộc chứ không `role?:` (#6):** optional nghĩa là mọi chỗ gọi phải so với `undefined`, và TypeScript không bao giờ ép mock hay backend phải cung cấp nó. Dữ liệu cũ được xử lý ở đúng **hai ranh giới hydrate** — `readUsers()` trong `auth.api.ts` backfill `'customer'` khi đọc `nss_mock_users`, và `persist` `version: 1` + `migrate` của `auth.store.ts` khi rehydrate `nss_auth`. Cả hai mặc định về **quyền thấp nhất**, nên không ai bị nâng quyền nhầm và không ai bị ép đăng xuất.

**Vì sao `Address` giữ cả mã lẫn tên (#3):** ô `<Select>` chọn địa giới hành chính chạy theo **mã**, còn `ShippingInfo` của đơn hàng lưu **tên**. Chỉ lưu tên thì mỗi lần mở lại form phải tra ngược tên → mã, và cơ chế đó vỡ ngay khi tên đơn vị hành chính thay đổi.

---

## E. Danh sách kiểm khi ghép backend

Làm theo thứ tự. Mỗi mục xong thì chạy lại bộ kiểm thử tương ứng.

### E.1 Trước khi sửa dòng code nào

- [ ] Điền `VITE_API_BASE_URL` trong `.env`, hoặc để trống và dựa vào proxy Vite
- [ ] **Xoá bốn khoá localStorage của mock** — `nss_mock_users`, `nss_mock_orders`, `nss_mock_addresses`, `nss_mock_contact_messages`. Không xoá thì dữ liệu giả lẫn với dữ liệu thật, và triệu chứng trông y hệt lỗi backend
- [ ] Xoá luôn `nss_auth_token` và `nss_refresh_token` — token mock không phải JWT thật

### E.2 Sửa từng file trong `src/api/`

Với mỗi hàm: thay **thân hàm** bằng đúng dòng đã ghi sẵn trong comment `Khi có backend: ...`, rồi:

- [ ] Bỏ `import ... from '@/mocks/...'`
- [ ] Bỏ `await delay(...)` — đã có độ trễ mạng thật
- [ ] Bỏ `imageUrl()` **chỉ khi** backend đã trả đường dẫn đúng dạng `/images/...` (xem A.5)
- [ ] **Giữ nguyên tên hàm, tham số và kiểu trả về** — đây là điều `CLAUDE.md` cấm sửa

Thứ tự đề xuất: `categories` → `products` → `posts` (công khai, dễ kiểm) → `auth` → `addresses` → `orders` (cần token, phụ thuộc nhau).

### E.3 Sau khi ghép xong

- [ ] Xoá thư mục `src/mocks/`
- [ ] Xoá `getCurrentUserId()` trong `auth.api.ts` nếu không còn ai gọi
- [ ] Xoá `readPublicUsers()` trong `auth.api.ts` — hàm **chỉ chạy ở client** (§F), đọc thẳng kho `nss_mock_users`. `adminUsers.api.ts` là nơi duy nhất gọi nó; khi hai hàm ở đó thành lời gọi HTTP thì nó không còn ai gọi và phải biến mất cùng `src/mocks/`. Để lại là để lại một đường đọc dữ liệu giả song song với backend thật
- [ ] **`calcShippingFee()` trong `orders.api.ts` thì KHÔNG xoá — và đây là mục cố ý ngược với hai mục trên.** Nó cũng là hàm **chỉ chạy ở client** (§F), nên §E.3 thiếu hẳn một dòng về nó là một lệch có thật, đã nằm trong `decisions/CANDIDATES.md`; backlog 0024 vá bằng cách ghi ra **hướng giữ**, không phải hướng xoá. Lý do: hai hàm kia đọc **dữ liệu giả** (`nss_mock_users`, seed mock) nên chúng chết cùng `src/mocks/`; `calcShippingFee()` không đọc dữ liệu nào — nó chỉ áp một **luật hiển thị** lên con số client đã có, để giỏ hàng và `/thanh-toan` nói được phí ship **trước khi** đơn tồn tại. Backend không có endpoint nào trả con số đó trước lúc đặt, nên xoá nó là mất dòng phí ship khỏi hai màn hình chứ không phải dọn được nợ mock. Điều kiện để mục này lật thành "xoá": backend mở một endpoint báo giá phí ship cho giỏ chưa đặt. Chừng nào chưa có, giữ — và giữ kèm **§C.5**, chỗ ghim luật của server để lần sau BE đổi luật thì vỡ ra thành xung đột tài liệu thay vì vỡ âm thầm thành tiền
- [ ] Kiểm tra `ApiError` hoạt động: gọi một endpoint sai chủ đích, xác nhận giao diện hiện **tiếng Việt** chứ không phải `"Request failed with status code 404"`
- [ ] Chạy lại cả 7 bộ kiểm thử

### E.4 Những gì KHÔNG phải sửa

Nếu thấy mình đang sửa những thứ này thì có gì đó sai:

- Component trong `src/components/` và `src/pages/` — chúng không biết dữ liệu đến từ đâu
- Hook trong `src/hooks/` — chỉ bọc hàm API bằng TanStack Query
- Store Zustand — giỏ hàng và wishlist là dữ liệu của thiết bị, không đi qua API
- `src/types/` — trừ khi backend thật sự trả shape khác, và khi đó phải cập nhật tài liệu này trước
- `src/api/productStore.ts` — kho catalog của **lớp mock** (overlay `nss_mock_products` chồng lên `src/mocks/products.json`), cố ý không đặt tên `*.api.ts` vì không map sang endpoint nào. Khi ghép backend thì **xoá cả file** cùng `src/mocks/`, không sửa nó thành lời gọi HTTP
- `src/api/orderStore.ts` — kho đơn hàng của **lớp mock**, cùng khuôn và cùng số phận: overlay `nss_mock_orders` (đơn đặt trên máy này + patch trạng thái) chồng lên seed `src/mocks/orders.json`, là **điểm đọc duy nhất** của seed đó cho cả `orders.api.ts` lẫn `adminOrders.api.ts`. Cũng cố ý không đặt tên `*.api.ts`; khi ghép backend thì **xoá cả file**

---

## F. Đối chiếu nhanh

> **Mọi con số dưới đây đi kèm lệnh đếm ra nó.** Một con số trong tài liệu mà không ai đếm lại được sẽ trôi, và hai con số lệch trong chính bảng này đã sống sót qua **bảy ticket** trước khi có người vấp phải. Đếm lại, đừng đọc lướt. *(Đo lại toàn bộ 2026-08-26 ở backlog 0024 — cả 8 dòng, không sửa lẻ; **cả 8 con số không đổi**, phép đối chiếu `60 − 3 = 57` vẫn cân. Lần đo trước: 2026-08-26, backlog 0023; trước nữa: 2026-08-25, backlog 0017.)*

> **Cả 8 con số KHÔNG đổi sau backlog 0023, và dòng thứ ba là chỗ đáng nói.** Ticket đó **xoá một hàm `export`** (hàm ghi đơn mới vào overlay mock), nên con số 60 lẽ ra phải nhích. Nó không nhích — vì hàm bị xoá nằm trong `src/api/orderStore.ts`, mà **lệnh đếm chỉ quét `src/api/*.api.ts`**. Nói cho hết: `orderStore.ts` và `productStore.ts` **chưa bao giờ** được dòng này đếm, và đó là chủ ý (chúng không map sang endpoint nào, §E.4). Ghi lại ở đây để lần sau không có ai đi tìm một con số đáng lẽ phải đổi rồi kết luận nhầm là phép đếm hỏng.

| Con số | Giá trị | Lệnh đếm (chạy từ `projects/app/`) |
|---|---|---|
| Dòng endpoint trong bảng B | **57** | `grep -cE '^\\| \`[a-zA-Z]+\` \\| \`(GET\|POST\|PUT\|PATCH\|DELETE) ' documents/API_CONTRACT.md` |
| Đường dẫn phân biệt (bỏ query) | **55** | hai dòng dùng lại đường cũ kèm query: `getProductsByIds` (`/products?ids=`) và `getRootCategories` (`/categories?root=true`) |
| Hàm `export` trong `src/api/*.api.ts` | **60** | `grep -c '^export .*function' src/api/*.api.ts` → cộng lại |
| File `.api.ts` | **16** | `ls src/api/*.api.ts \| wc -l` |
| File trong `src/api/` | **19** | 16 `.api.ts` + `client.ts` + `productStore.ts` + `orderStore.ts` của lớp mock |
| Hàm chỉ chạy ở client | **3** | `getCurrentUserId()` · `calcShippingFee()` · `readPublicUsers()` — có trong mã, **cố ý không có** trong bảng B |
| Kiểu dữ liệu | **13** | `ls src/types/*.ts \| wc -l` |
| Chỗ hiển thị `error.message` cho người dùng | **36** | `grep -rn "error.message\|err.message" src/ --include=*.tsx --include=*.ts \| wc -l` |

**Ba con số trên khớp nhau chính xác, và đây là phép đối chiếu có răng:**

```
60 hàm export  −  3 hàm chỉ chạy ở client  =  57
57 dòng bảng B −  0 dòng chưa dựng ở FE     =  57  ✅
```

**Hai vế đã bằng nhau — không còn dòng nào dư.** `resetPassword` từng là ngoại lệ duy nhất: có trong hợp đồng, **đã chạy trên backend**, nhưng chưa có hàm phía FE. Backlog 0018 đã dựng nó (`src/api/auth.api.ts` → `resetPassword`), nên con số hàm `export` lên **60** và phép trừ mất đi số hạng `− 1`. Ba hàm chỉ-chạy-ở-client thì **không bao giờ** xuất hiện ở bảng B.

> **Vì sao giữ lại đoạn này thay vì xoá:** ô trống trong §B.4 chính là thứ đã buộc backend phải **tự suy diễn** endpoint `POST /auth/reset-password` rồi ship (xem `backlog/0018`). Phép trừ ở trên là cái đáng lẽ đã bắt được nó — nó chỉ có răng khi số hạng lệch được **giải thích bằng tên một ticket đang mở**, không phải bằng một hằng số ai đó chỉnh cho khớp.

Thêm endpoint mới thì cập nhật cả bảng B **và** bảng này, rồi **chạy lại phép đối chiếu trên**. Lệch nghĩa là có hàm chưa được ghi, hoặc có dòng ghi mà không ai dựng.
