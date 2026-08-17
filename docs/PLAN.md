# Kế hoạch xây dựng Frontend Website Bán Nông Sản Sạch

## Context

Bạn cần xây dựng frontend cho một website thương mại điện tử bán nông sản/thực phẩm hữu cơ, lấy https://organic-food.monamedia.net/ làm mẫu giao diện và tính năng. Backend sẽ được phát triển sau bằng Spring Boot.

Thư mục `c:\fe_base\code_space_1` hiện chỉ chứa một file `index.html` tĩnh — đây là dự án khởi tạo từ đầu.

**Ràng buộc quan trọng:** vì backend chưa tồn tại, toàn bộ dữ liệu ban đầu đến từ mock JSON. Kiến trúc phải đảm bảo khi Spring Boot sẵn sàng, việc chuyển đổi chỉ động vào **lớp `src/api/`**, không phải sửa lại component. Đây là nguyên tắc xuyên suốt kế hoạch.

**Quyết định đã chốt:** Vite + React + TypeScript · Tailwind CSS · phạm vi full e-commerce · mock data bằng JSON local qua lớp service.

**Yêu cầu bổ sung:** dự án cần có `CLAUDE.md` ghi bộ quy tắc làm việc chung để đảm bảo code nhất quán xuyên suốt, và bản kế hoạch này được lưu ngay trong project (`docs/PLAN.md`) với checkbox tiến độ — mỗi hạng mục hoàn thành sẽ được tick lại ngay tại thời điểm làm xong.

---

## Tech Stack

| Nhóm | Lựa chọn | Lý do |
|---|---|---|
| Build | Vite + React 19 + TypeScript | Dev server nhanh, type khớp DTO Spring Boot |
| Styling | Tailwind CSS v4 | Dựng UI nhanh, responsive dễ, tự do clone layout mẫu |
| Routing | React Router v7 | Chuẩn de-facto cho React SPA |
| Server state | TanStack Query | Cache/loading/error sẵn có; đổi mock→API chỉ sửa hàm fetch |
| Client state | Zustand | Giỏ hàng, wishlist, auth — nhẹ hơn Redux, ít boilerplate |
| HTTP | Axios | Interceptor cho JWT khi ghép Spring Boot |
| Form | React Hook Form + Zod | Validate checkout/đăng ký, type-safe |
| Slider | Swiper | Hero slider, carousel sản phẩm/testimonial |
| Icon | lucide-react | Bộ icon nhẹ, đồng nhất |

Không dùng UI library (Ant/MUI) để tránh xung đột phong cách với thiết kế organic.

---

## Cấu trúc thư mục

```
src/
├── api/                    # ★ ĐIỂM CHUYỂN ĐỔI DUY NHẤT khi có Spring Boot
│   ├── client.ts           # axios instance + interceptor JWT
│   ├── products.api.ts     # getProducts(filters), getProductBySlug(slug)...
│   ├── categories.api.ts
│   ├── posts.api.ts
│   ├── orders.api.ts
│   └── auth.api.ts
├── mocks/                  # dữ liệu giả — xoá sau khi ghép backend
│   ├── products.json       # ~40 sản phẩm, đủ 7 danh mục
│   ├── categories.json
│   ├── posts.json
│   ├── testimonials.json
│   └── brands.json
├── types/                  # Product, Category, CartItem, Order, User, Post
├── components/
│   ├── ui/                 # Button, Input, Badge, Rating, Modal, Drawer,
│   │                       # Pagination, Skeleton, Breadcrumb, QuantityPicker
│   ├── layout/             # TopBar, Header, MobileMenu, Footer, MainLayout
│   ├── product/            # ProductCard, ProductGrid, ProductTabs, ProductGallery
│   ├── filter/             # CategoryFilter, PriceRangeFilter, RatingFilter, SortSelect
│   └── home/               # từng section của trang chủ (xem Giai đoạn 4)
├── pages/
├── store/                  # cart.store.ts, wishlist.store.ts, auth.store.ts, ui.store.ts
├── hooks/                  # useProducts, useDebounce, useMediaQuery
├── lib/                    # format.ts (formatVND), constants.ts, utils.ts
└── routes/index.tsx
```

---

## Nguyên tắc lớp API (quan trọng nhất)

Mỗi hàm trong `src/api/` có **chữ ký y hệt API thật sẽ có**, chỉ khác phần thân:

```ts
// src/api/products.api.ts — giai đoạn mock
export async function getProducts(params: ProductQuery): Promise<Paginated<Product>> {
  const all = productsJson as Product[];
  const filtered = applyFilters(all, params);   // lọc/sắp xếp/phân trang tại client
  await delay(300);                              // giả lập độ trễ mạng
  return paginate(filtered, params.page, params.limit);
}

// Khi Spring Boot xong — chỉ thay thân hàm, component không đổi một dòng:
// const { data } = await client.get('/api/products', { params });
// return data;
```

Component **không bao giờ** import trực tiếp file JSON. Mọi truy cập dữ liệu đi qua `api/` → gói trong TanStack Query hook.

---

## Design tokens (khớp site mẫu)

Khai báo trong `src/index.css` theo cú pháp `@theme` của Tailwind v4:

- `primary`: xanh lá organic `#7FAD39` (nút, link, active state)
- `primary-dark`: `#6A9130` (hover)
- `accent`: cam `#F5871F` (badge sale, giá khuyến mãi)
- `surface`: kem nhạt `#FAF8F2` (nền section xen kẽ)
- `ink`: `#2B2B2B` (text chính), `ink-muted`: `#7A7A7A`
- Font: **Quicksand** (heading, bo tròn hợp phong cách organic) + **Inter** (body)
- Bo góc: `rounded-xl` mặc định cho card, `rounded-full` cho nút CTA

---

## Lộ trình triển khai

> **Cách theo dõi tiến độ:** bản kế hoạch này được copy vào `docs/PLAN.md` trong project. Mỗi khi hoàn thành một hạng mục, đổi `- [ ]` thành `- [x]` ngay tại dòng đó và cập nhật cột trạng thái của giai đoạn. Việc tick được làm **ngay khi xong**, không dồn đến cuối.

### ✅ Giai đoạn 0 — Tài liệu & quy ước dự án
- [x] Tạo `CLAUDE.md` ở gốc project — bộ quy tắc làm việc chung
- [x] Tạo `docs/PLAN.md` — copy bản kế hoạch này kèm checkbox tiến độ
- [x] Tạo `.gitignore` (Vite sinh sẵn), `README.md` (mô tả dự án, cách chạy)
- **Kết quả:** mọi quy ước được ghi rõ trước khi viết dòng code đầu tiên

### ✅ Giai đoạn 1 — Nền móng
- [x] `npm create vite@latest . -- --template react-ts` (đã xoá `index.html` cũ; Vite 8 + React 19 + TS 6)
- [x] Cài Tailwind v4 (`tailwindcss`, `@tailwindcss/vite`), khai báo design tokens trong `src/index.css`
- [x] Cài router/query/zustand/axios/swiper/lucide, cấu hình alias `@/` → `src/`
- [x] Dựng `MainLayout` + `TopBar` + `Header` + `MobileMenu` + `Footer`, cấu hình 16 route (trang tạm `PagePlaceholder`)

> **Ghi chú kỹ thuật:** `lucide-react@1.x` đã gỡ toàn bộ icon thương hiệu (Facebook/Instagram/YouTube). Đã tự khai báo SVG inline tại `src/components/ui/SocialIcons.tsx` thay vì thêm dependency mới.
- **Kết quả:** `npm run dev` chạy được, điều hướng giữa các trang hoạt động

### ✅ Giai đoạn 2 — Lớp dữ liệu
- [x] Định nghĩa types trong `src/types/`: `Product`, `ProductQuery`, `Category`, `Post`, `CartItem`, `Coupon`, `Order`, `User`, `Testimonial`, `Brand`, `HeroSlide`, `Paginated<T>`
- [x] Viết `mocks/*.json`: **42 sản phẩm** phủ đủ 7 danh mục gốc + 4 danh mục con, 8 bài blog, 4 testimonial, 9 brand, 3 mã giảm giá
- [x] Viết `api/*.api.ts` (products, categories, posts, marketing, coupons, auth, orders) — đủ logic lọc/sort/phân trang + `delay()` giả lập
- [x] Bọc bằng TanStack Query hooks trong `hooks/` + `queryKeys.ts` tập trung
- **Kết quả:** dữ liệu mock đã kiểm tra toàn vẹn — không có `categoryId`/`brandId` mồ côi, không trùng id/slug, không có `salePrice >= price`. Phân bố: rau củ 10, trái cây & hạt 9, thịt 6, thực phẩm sạch 5, bơ & trứng 4, sữa & kem 4, nước ép 4. Có sẵn 24 SP giảm giá, 3 SP hết hàng (để test empty/disabled state), 18 nổi bật, 22 bán chạy.

### ✅ Giai đoạn 3 — Thư viện UI dùng chung
Xây trước để các giai đoạn sau tái sử dụng, tránh viết trùng:
- [x] `ui/`: Button, Input, Textarea, Select, Badge, Rating, Modal, Drawer, Pagination, Skeleton, Breadcrumb, QuantityPicker, SectionHeading, EmptyState/ErrorState, SocialIcons
- [x] `product/ProductCard`: hover đổi ảnh phụ, badge `-18%`, rating sao (hỗ trợ nửa sao), giá gốc gạch ngang + giá sale, nút "Thêm vào giỏ", wishlist, thanh "đã bán / còn lại"
- [x] `product/ProductGrid`: bọc sẵn cả 3 nhánh loading (skeleton) / error (nút thử lại) / empty
- [x] `lib/format.ts`: `formatVND`, `calcDiscountPercent`, `effectivePrice`, `formatDate`
- **Kết quả:** đã kiểm chứng trên trình duyệt — ProductCard render đúng cả 3 biến thể (giảm giá / hết hàng / thường), 20/20 ảnh tải được, không có lỗi console.

> **Điều chỉnh so với kế hoạch gốc:** `cart.store.ts`, `wishlist.store.ts`, `ui.store.ts` được kéo từ Giai đoạn 6–7 lên Giai đoạn 3. Lý do: `ProductCard` cần gọi trực tiếp `addItem` và `toggleWishlist`; nếu để sau thì phải sửa lại ProductCard và mọi nơi dùng nó. Giai đoạn 6–7 giờ chỉ còn phần UI (trang giỏ hàng, mini-cart, checkout, trang tài khoản).

### ✅ Giai đoạn 4 — Trang chủ
Dựng 12 section theo đúng thứ tự site mẫu, mỗi section là 1 component trong `components/home/`:
- [x] `HeroSlider` — Swiper autoplay, 2 slide, CTA, ảnh không lazy (above-the-fold)
- [x] `FeatureStrip` — 4 ưu điểm (100% hữu cơ, tiêu dùng xanh, freeship, đổi trả)
- [x] `CategoryGrid` — 7 danh mục kèm số lượng sản phẩm
- [x] `SaleSection` — carousel sản phẩm giảm giá
- [x] `PromoBanners` — 3 banner khuyến mãi
- [x] `ProductTabs` — 5 tab theo danh mục, đổi tab đổi lưới sản phẩm
- [x] `BestSellers` — kèm progress bar "đã bán / còn lại"
- [x] `CountdownPromo` — đồng hồ đếm ngược, **tự ẩn khi hết hạn**
- [x] `Testimonials` — carousel 4 đánh giá
- [x] `BrandLogos` — carousel logo, xám → màu khi hover
- [x] `BlogPreview` — 4 bài mới nhất
- [x] `Newsletter` — form đi qua `subscribeNewsletter()` trong lớp API

**Phát sinh thêm:** `components/ui/Carousel.tsx` (bọc Swiper một lần, dùng cho 3 section), `PROMO_END_DATE` trong `constants.ts`.

- **Kết quả:** đã kiểm chứng bằng trình duyệt thật ở **375 / 768 / 1280px**: 12 section đúng thứ tự, **0 lỗi console, 0 ảnh hỏng, 0 ảnh thiếu `alt`, không cuộn ngang** ở cả 3 kích thước. Đổi tab trả về đúng sản phẩm theo danh mục. Bấm "Thêm vào giỏ" → badge header 0 → 1.

> **Đã sửa trong giai đoạn này:** bảng màu cũ trượt WCAG AA ở cả 4 màu chữ (primary 2.65:1, accent 2.51:1, ink-muted 4.29:1, ink-light 2.38:1). Bảng màu mới đạt lần lượt 4.99 / 5.18 / 6.69 / 4.54:1. Đồng thời thay toàn bộ ảnh mock từ picsum (ảnh ngẫu nhiên) sang **106 ảnh Unsplash thật**, tất cả đã kiểm tra trả HTTP 200.

### ✅ Giai đoạn 5 — Shop & Chi tiết sản phẩm
- [x] **Shop:** sidebar lọc (cây danh mục cha–con kèm số lượng, thanh trượt giá 2 đầu, rating, còn hàng / đang giảm giá) + 5 kiểu sắp xếp + toggle grid/list + phân trang. Mobile dùng `<Drawer>`
- [x] **Đồng bộ filter với URL query params** qua hook `useProductFilters` — nguồn chân lý duy nhất là URL
- [x] **Chi tiết sản phẩm:** gallery + zoom khi hover, chọn số lượng chặn theo tồn kho, thêm giỏ / mua ngay, wishlist, 3 tab (Mô tả / Thông tin bổ sung / Đánh giá), sản phẩm liên quan, breadcrumb đủ cấp
- [x] **Search:** tách `SearchBox` khỏi Header, debounce 350ms + dropdown gợi ý, điều hướng bằng ↑↓ Enter Esc
- [x] **Đánh giá:** `mocks/reviews.json` (48 đánh giá) + `reviews.api.ts` + form viết đánh giá (RHF + Zod), biểu đồ phân bố sao
- [x] **Xem nhanh:** modal nối vào prop `onQuickView` đã có sẵn của `ProductCard`

- **Kết quả:** đã chạy bộ kiểm thử tự động 11 tiêu chí trên trình duyệt thật, tất cả đạt:
  - Lọc → URL đổi → F5 giữ nguyên kết quả
  - Đang ở trang 3, đổi bộ lọc → tự về trang 1
  - Kéo thanh giá 6 lần → Back **một lần** là thoát khỏi trang (nhờ `replace: true`)
  - URL rác `?page=abc&minRating=99&sort=hacked` → vẫn hiện đủ 42 sản phẩm
  - Empty state + nút xoá lọc hoạt động
  - Tìm kiếm: 5 gợi ý, ↓ Enter vào đúng trang chi tiết
  - Tồn kho chặn đúng, gửi đánh giá hiện ngay, slug sai không trắng trang
  - Mobile 375px: drawer bộ lọc chạy, không cuộn ngang, 0 lỗi console

### ✅ Giai đoạn 5.5 — Nội bộ hoá ảnh (phát sinh, không có trong kế hoạch gốc)
Trước khi sang Giai đoạn 6, toàn bộ ảnh đang tải từ bên thứ ba được đưa về local:
- [x] `scripts/download-images.mjs` — tải 112 ảnh về `public/images/`, chia thư mục theo danh mục gốc; ghi lại dữ liệu với đường dẫn tương đối
- [x] `scripts/generate-brand-logos.mjs` — sinh 9 logo SVG wordmark thay ảnh chụp ngẫu nhiên từ picsum
- [x] `src/lib/image.ts` — hàm `imageUrl()` + biến `VITE_IMAGE_BASE_URL`, gọi ở **lớp API** nên 11 component render ảnh không phải sửa gì
- [x] Dời dữ liệu promo banner khỏi `PromoBanners.tsx` vào `marketing.api.ts` (component đang giữ dữ liệu là trái quy tắc)
- [x] `docs/IMAGE-CREDITS.md` — bảng ánh xạ file local ↔ ảnh gốc
- **Kết quả:** 121 file trong `public/images/` (9.6 MB), khớp đúng 121 tham chiếu. **Chặn toàn bộ mạng ngoài trong trình duyệt → mọi ảnh vẫn hiển thị, 0 ảnh hỏng.** Build với `VITE_IMAGE_BASE_URL=https://cdn.example.com` → ảnh tự có tiền tố CDN, chứng minh đường chuyển S3 hoạt động. 11 tiêu chí Giai đoạn 5 vẫn đạt.

### ✅ Giai đoạn 6 — Giỏ hàng & Thanh toán
- [x] `cart.store.ts` (Zustand + middleware `persist` → localStorage): add, remove, updateQty, clear, selector tính tổng tiền — _đã làm sớm ở Giai đoạn 3_; bổ sung `couponCode`, `applyCoupon`, `removeCoupon`, `syncItem`
- [x] Mini-cart drawer — **sửa lỗi tồn đọng**: `openMiniCart()` đang được gọi ở 4 chỗ nhưng chưa có UI nào lắng nghe
- [x] Trang giỏ hàng: danh sách SP, đổi số lượng, xoá, mã giảm giá, thanh tiến trình miễn phí ship, tóm tắt đơn
- [x] **Kiểm tra lại giỏ** (`validateCart`): phát hiện hết hàng / vượt tồn / đổi giá, khoá thanh toán và có nút cập nhật giỏ
- [x] Địa chỉ 3 cấp phụ thuộc: `mocks/locations.json` (10 tỉnh) + `locations.api.ts` + `useLocations.ts`
- [x] Checkout: form RHF + Zod (validate SĐT theo đầu số VN), 4 phương thức thanh toán (COD / chuyển khoản / MoMo / VNPay), tóm tắt đơn
- [x] Trang đặt hàng thành công — nhận mã đơn qua `?code=` nên **F5 vẫn xem lại được**
- [x] Dọn `ui.store.ts`: xoá `isFilterDrawerOpen`/`openFilterDrawer`/`closeFilterDrawer` không nơi nào dùng

- **Kết quả:** bộ kiểm thử tự động 12 nhóm tiêu chí trên trình duyệt thật, tất cả đạt, 0 lỗi console:
  - Thêm giỏ → mini-cart mở, badge header 0 → 1
  - Giỏ hàng: đổi số lượng 78.000 → 117.000 ₫, xoá hết → empty state
  - Phí ship: dưới ngưỡng nhắc "mua thêm", vượt ngưỡng miễn phí
  - Mã `CHAOBAN10` áp được; mã sai và mã chưa đủ tối thiểu báo đúng lý do
  - Sản phẩm hết hàng → cảnh báo + khoá thanh toán; bấm cập nhật giỏ thì đặt được
  - Giỏ trống vào `/thanh-toan` → chuyển về giỏ hàng
  - Form trống → 7 lỗi; SĐT sai → báo lỗi; chọn tỉnh → 5 quận → 4 phường
  - Đặt hàng → mã `NSS-20260817-0001`, giỏ rỗng, F5 vẫn hiện đơn, ví điện tử hiện QR
  - Mã đơn sai → thông báo thân thiện, không trắng trang
  - Mobile 375px: không cuộn ngang

> **Hai lỗi thật phát hiện khi kiểm thử:** (1) thuộc tính `required` khiến trình duyệt tự validate và **chặn luôn sự kiện submit** nên React Hook Form không bao giờ chạy — sửa bằng `noValidate` ở cấp form; (2) `clearCart()` làm giỏ rỗng khiến guard "giỏ trống" bắn trước khi `navigate()` kịp chạy, đặt hàng xong lại bị ném về giỏ hàng — sửa bằng cờ `orderPlacedRef`.

### ✅ Giai đoạn 7 — Tài khoản & Wishlist
- [x] Đăng nhập / Đăng ký / Quên mật khẩu (RHF + Zod, khung chung `AuthCard`, `PasswordInput` có nút hiện/ẩn)
- [x] `auth.store.ts` giữ user (token vẫn do `client.ts` quản), `ProtectedRoute` chặn `/tai-khoan/*` và nhớ đường dẫn định vào
- [x] Trang tài khoản 4 mục: thông tin cá nhân, lịch sử đơn hàng, sổ địa chỉ, đổi mật khẩu — dùng route lồng dưới `AccountLayout`
- [x] **Sổ địa chỉ CRUD đầy đủ** (`addresses.api.ts` + `useAddresses.ts`) + đặt mặc định, nối vào trang thanh toán
- [x] **Gắn đơn hàng với người dùng**: thêm `userId` vào `Order`, `getMyOrders()` lọc theo tài khoản đang đăng nhập
- [x] `wishlist.store.ts` (persist localStorage) — _đã làm sớm ở Giai đoạn 3_
- [x] Trang Wishlist hiển thị danh sách sản phẩm đã lưu, kèm "Thêm tất cả vào giỏ"
- [x] Header / TopBar / MobileMenu đổi theo trạng thái đăng nhập (`AccountMenu` dạng thả xuống)

- **Kết quả:** bộ kiểm thử tự động 15 nhóm tiêu chí trên trình duyệt thật, tất cả đạt, 0 lỗi console, 0 request hỏng:
  - Chưa đăng nhập vào `/tai-khoan` → chuyển sang `/dang-nhap`, đăng nhập xong **quay lại đúng trang định vào**
  - Sai mật khẩu báo đúng lý do; form trống hiện đủ lỗi
  - Đăng ký: email trùng và mật khẩu xác nhận lệch đều báo lỗi; đăng ký mới thì tự đăng nhập
  - F5 vẫn giữ phiên; **xoá `nss_auth_token` bằng tay rồi F5 → tự đăng xuất** (token là nguồn chân lý)
  - Sửa hồ sơ và đổi mật khẩu đều sống qua F5, đăng nhập lại bằng mật khẩu mới được
  - Sổ địa chỉ: thêm 2, đổi mặc định thì cái cũ bỏ cờ, sửa, xoá
  - **Mở form sửa địa chỉ vẫn giữ đúng quận và phường** (xem sự cố #11)
  - Đặt hàng khi đã đăng nhập → đơn hiện trong lịch sử; đơn khách vãng lai **không** hiện nhưng tra bằng mã đơn vẫn thấy
  - Thanh toán khi đã đăng nhập → tự điền hồ sơ + địa chỉ mặc định, chọn địa chỉ khác thì form đổi theo
  - Wishlist: thêm 3 → bỏ 1 còn 2 → "Thêm tất cả vào giỏ" đúng số lượng → xoá hết ra empty state
  - Đăng xuất: bị chặn khỏi `/tai-khoan`, **giỏ hàng và wishlist vẫn còn nguyên**
  - Mobile 375px: 5 trang mới không cuộn ngang

> **Hai lỗi thật phát hiện khi kiểm thử:** (1) `<select>` không điều khiển khiến quận/phường điền sẵn bị rơi mất — form vẫn giữ giá trị bên trong nên đơn đặt được với một quận người dùng không hề thấy mình chọn (sự cố #11); (2) `<Skeleton>` (render ra `<div>`) đặt trong `<p>` ở trang cửa hàng là HTML không hợp lệ, React báo lỗi ra console — lỗi có sẵn từ Giai đoạn 5, đã sửa.

### ✅ Giai đoạn 8 — Nội dung
- [x] **Mở rộng dữ liệu blog**: 8 → **18 bài**, thêm `categorySlug`, viết lại nội dung theo Markdown rút gọn; tải 12 ảnh mới về `public/images/posts/`
- [x] `PostContent.tsx` — bộ render Markdown rút gọn tự viết (`##`, `-`, `1.`, `>`, `**đậm**`), **không thêm thư viện**
- [x] Blog: danh sách 2 cột + sidebar (tìm kiếm, chuyên mục kèm số bài, bài mới nhất) + phân trang, đồng bộ URL qua `usePostFilters`
- [x] Chi tiết bài viết: ảnh bìa, meta, nội dung, bài liên quan; slug sai không trắng trang
- [x] `PostCard.tsx` — tách từ `BlogPreview.tsx`, dùng chung cho trang chủ / tin tức / bài liên quan
- [x] Giới thiệu: nội dung đi qua `about.api.ts` (không viết cứng trong component), có dòng thời gian, con số, cam kết, dùng lại `FeatureStrip` và `Testimonials`
- [x] Liên hệ: form RHF + Zod qua `contact.api.ts`, thông tin cửa hàng đọc từ `STORE_INFO`, bản đồ nhúng Google Maps
- [x] Xoá `PagePlaceholder.tsx` — không còn trang nào dùng
- [x] Trang 404 — _đã làm sớm từ Giai đoạn 1_

- **Kết quả:** bộ kiểm thử tự động 13 nhóm tiêu chí, tất cả đạt, 0 lỗi console, 0 request hỏng:
  - 18 bài chia 3 trang; sang trang 2 → URL đổi, F5 giữ nguyên
  - Đang ở trang 3, đổi chuyên mục → tự về trang 1; URL rác không làm trắng trang
  - Tìm kiếm khớp cả tiêu đề lẫn tóm tắt; không khớp → empty state có nút xoá lọc
  - Chi tiết: 4 `<h2>`, 2 danh sách, 1 trích dẫn render đúng thẻ, **không lộ ký tự `##` hay `**`**
  - Bài liên quan cùng chuyên mục và **không chứa chính bài đang đọc**
  - Trang giới thiệu 0 ảnh hỏng; trang liên hệ validate đủ 3 ca sai rồi gửi thành công và reset form
  - **Chặn toàn bộ mạng ngoài** → cả 4 trang vẫn dùng được, 0 ảnh hỏng; chỉ iframe bản đồ trống
  - Mobile 375px: 4 trang mới không cuộn ngang
  - Hồi quy: trang chủ, cửa hàng, giỏ hàng/thanh toán, tài khoản đều còn đạt

> **Hai lỗi thật phát hiện trong giai đoạn này:** (1) `scripts/download-images.mjs` **không thể thay ảnh** — đổi URL trong mock thì script lặng lẽ giữ file cũ, và mỗi lần chạy lại còn xoá dần bảng `IMAGE-CREDITS.md`; (2) soát bảng đối chiếu phát hiện **4 ảnh bài viết sai chủ đề hoàn toàn**, trong đó 2 ảnh có từ Giai đoạn 2 (xem sự cố #13 và #14).

### ✅ Giai đoạn 9 — Hoàn thiện
- [x] **Tự host font** Quicksand + Inter (`scripts/download-fonts.mjs`, 18 file woff2) — khép lại phụ thuộc bên thứ ba treo từ phiên 4
- [x] **Tách code theo route** (`React.lazy` + `<Suspense>` trong `MainLayout`): chunk chính **865 → 423 KB** (gzip 262 → 132 KB), sinh 49 chunk, hết cảnh báo 500 KB của Vite
- [x] **Trang lỗi riêng** `ErrorPage` dùng `useRouteError()` — trước đây `NotFoundPage` kiêm `errorElement` nên mọi lỗi runtime đều hiện "404 Không tìm thấy trang"
- [x] **Giam focus** trong `Drawer` / `Modal` / `MobileMenu` (`useFocusTrap`), trả focus về nút đã mở
- [x] **Ring focus dùng chung** ở `:focus-visible`; sửa `PriceRangeSlider` và ô tìm kiếm vốn không có chỉ báo focus
- [x] **Tôn trọng `prefers-reduced-motion`**: tắt cuộn mượt và tắt tự chạy của cả hai carousel
- [x] **Sửa thứ tự tiêu đề** trên toàn site: footer h3→h2, `EmptyState`/`ErrorState` h3→h2, thêm tiêu đề ẩn cho `FeatureStrip` / `FilterSidebar` / lưới sản phẩm và bài viết; hero slider bỏ `<h1>` lặp
- [x] **SEO**: `SeoMeta` dùng chung cho 19 trang, sinh cả thẻ Open Graph và Twitter Card; ảnh chia sẻ mặc định 1200×630 tự sinh (`scripts/generate-og-image.mjs`); thêm `VITE_SITE_URL`
- [x] Skeleton thay spinner, empty state — _đã có từ các giai đoạn trước_
- [x] Rà soát responsive toàn bộ 13 trang × 3 kích thước bằng bảng đối chiếu ảnh chụp

- **Kết quả:** bộ kiểm thử tự động 10 nhóm tiêu chí, tất cả đạt, 0 lỗi console, 0 request hỏng:
  - Chuyển route: header/footer không nháy, **không trắng trang**
  - Tab qua 22 phần tử: **0 phần tử không thấy ring focus**
  - Mini-cart và modal: **0/15 và 0/12 lần Tab thoát ra ngoài**, đóng xong focus về đúng nút đã mở
  - Thứ tự tiêu đề, nhãn nút, `alt` ảnh, số `<h1>`: **0 trang còn vấn đề** trên 13 trang
  - `prefers-reduced-motion`: cuộn về `auto`, slide không tự chạy sau 7 giây
  - Thẻ OG đúng `type` cho từng loại trang (`website` / `product` / `article`)
  - **Chặn toàn bộ mạng ngoài**: host duy nhất bị chặn là `maps.google.com`; 0 ảnh hỏng, **font tiếng Việt vẫn đúng**
  - Vùng bấm theo ngưỡng WCAG AA 24×24 và cuộn ngang: **sạch ở cả 375 / 768 / 1280px**
  - Hồi quy: cả 5 bộ kiểm thử của các giai đoạn trước vẫn đạt

> **Ba lỗi thật phát hiện trong giai đoạn này:** (1) ô đăng ký bản tin chỉ cao **19px trên mobile** vì `flex-1` trong container `flex-col` điều khiển chiều cao và đè lên `h-12`; (2) `Drawer` và `Modal` khai `aria-modal="true"` nhưng không hề giam focus — Tab vài lần là chạy ra các nút của trang nền đang bị lớp phủ che; (3) thứ tự tiêu đề nhảy cấp ở gần như mọi trang (xem sự cố #15).

### ⬜ Giai đoạn 10 — Chuẩn bị ghép Spring Boot
- [ ] `.env` với `VITE_API_BASE_URL`
- [ ] Interceptor axios: gắn `Authorization: Bearer`, xử lý 401 → refresh/logout
- [ ] Cấu hình proxy trong `vite.config.ts` để tránh CORS lúc dev
- [ ] Viết `docs/API_CONTRACT.md`: liệt kê endpoint mong đợi + shape request/response, làm đầu bài cho phía Spring Boot
- **Kết quả:** đổi mock sang API thật chỉ cần sửa thân hàm trong `src/api/`

---

## Nội dung `CLAUDE.md`

> ✅ **Đã tạo tại [`../CLAUDE.md`](../CLAUDE.md)** — file đó là bản chính thức, mục này chỉ giữ lại làm tóm tắt.

File này đặt ở gốc project, được tự động nạp vào ngữ cảnh mỗi phiên làm việc — nó là "hiến pháp" giữ code nhất quán qua 10 giai đoạn. Nội dung gồm:

**1. Tổng quan dự án** — mục tiêu, tech stack, trạng thái backend (chưa có, dùng mock).

**2. Lệnh thường dùng** — `npm run dev`, `npm run build`, `npx tsc --noEmit`, `npm run lint`.

**3. Quy tắc kiến trúc (bắt buộc)**
- Component **cấm** import trực tiếp file trong `mocks/`; mọi dữ liệu đi qua `src/api/` → TanStack Query hook
- Giữ nguyên chữ ký hàm trong `src/api/` — đây là hợp đồng với Spring Boot
- Server state → TanStack Query. Client state (giỏ hàng, wishlist, auth, UI) → Zustand. Không lẫn lộn
- Không gọi `axios` trực tiếp trong component

**4. Quy ước đặt tên**
- Component: `PascalCase.tsx` · hook: `useCamelCase.ts` · store: `name.store.ts` · api: `name.api.ts` · type: `name.ts`
- Biến/hàm tiếng Anh; nội dung hiển thị cho người dùng bằng tiếng Việt
- Đường dẫn route tiếng Việt không dấu: `/cua-hang`, `/gio-hang`, `/thanh-toan`, `/tai-khoan`

**5. Quy tắc viết component**
- Một file một component; quá ~200 dòng thì tách nhỏ
- Function component + hooks, không dùng class
- Props luôn có `interface` rõ ràng, **cấm dùng `any`**
- Tái sử dụng `components/ui/` — không tự viết lại Button/Input/Modal ở nơi khác

**6. Quy tắc styling**
- Chỉ dùng Tailwind utility; tránh CSS file riêng trừ khi bất khả kháng
- **Chỉ dùng design token** (`primary`, `accent`, `surface`, `ink`) — cấm hardcode mã màu như `#7FAD39` trong className
- Mobile-first: viết style mobile trước rồi thêm `md:`, `lg:`
- Class dài thì gom bằng `clsx`/`cn()`

**7. Quy tắc dữ liệu**
- Tiền tệ **luôn** hiển thị qua `formatVND()`, không tự nối chuỗi `₫`
- Giá lưu dạng số nguyên VNĐ (không dấu phẩy, không thập phân)
- Mọi state bất đồng bộ phải xử lý đủ 3 nhánh: loading (skeleton) / error / empty

**8. Quy trình làm việc**
- Bám sát `docs/PLAN.md`, làm tuần tự theo giai đoạn
- **Xong hạng mục nào tick `- [x]` ngay hạng mục đó trong `docs/PLAN.md`**; xong cả giai đoạn thì đổi `⬜` thành `✅` ở tiêu đề giai đoạn
- Chạy `npx tsc --noEmit` trước khi coi một giai đoạn là hoàn thành
- Không tự ý thêm thư viện ngoài stack đã chốt mà chưa hỏi

**9. Điều cấm**
- Không sao chép ảnh/logo/nội dung văn bản từ site mẫu (bản quyền)
- Không commit `.env`
- Không để `console.log` sót lại trong code hoàn thiện

---

## Bảng tiến độ

Cập nhật sau mỗi giai đoạn (cũng được đồng bộ trong `docs/PLAN.md`):

| GĐ | Nội dung | Trạng thái |
|---|---|---|
| 0 | Tài liệu & quy ước | ✅ Hoàn thành |
| 1 | Nền móng | ✅ Hoàn thành |
| 2 | Lớp dữ liệu | ✅ Hoàn thành |
| 3 | UI dùng chung | ✅ Hoàn thành |
| 4 | Trang chủ | ✅ Hoàn thành |
| 5 | Shop & chi tiết SP | ✅ Hoàn thành |
| 5.5 | Nội bộ hoá ảnh (phát sinh) | ✅ Hoàn thành |
| 6 | Giỏ hàng & thanh toán | ✅ Hoàn thành |
| 7 | Tài khoản & wishlist | ✅ Hoàn thành |
| 8 | Nội dung (blog, giới thiệu, liên hệ) | ✅ Hoàn thành |
| 9 | Hoàn thiện | ✅ Hoàn thành |
| 10 | Chuẩn bị ghép Spring Boot | ⬜ Chưa bắt đầu |

---

## File quan trọng

| File | Vai trò |
|---|---|
| `CLAUDE.md` | Bộ quy tắc làm việc chung, nạp tự động mỗi phiên |
| `docs/PLAN.md` | Bản kế hoạch + checkbox tiến độ, cập nhật liên tục khi làm |
| `src/api/*.api.ts` | Điểm chuyển đổi mock → Spring Boot. Giữ chữ ký hàm ổn định |
| `src/types/*.ts` | Nguồn chân lý về kiểu dữ liệu, phải khớp DTO backend |
| `src/index.css` | Design tokens Tailwind v4 (`@theme`) |
| `src/store/cart.store.ts` | Logic giỏ hàng + persist localStorage |
| `src/components/product/ProductCard.tsx` | Component tái sử dụng nhiều nhất — làm kỹ ngay từ Giai đoạn 3 |
| `src/routes/index.tsx` | Bản đồ toàn bộ route |
| `docs/API_CONTRACT.md` | Hợp đồng API bàn giao cho backend |

---

## Verification

Sau mỗi giai đoạn:
```bash
npm run dev          # kiểm tra trực quan trên trình duyệt
npx tsc --noEmit     # không còn lỗi type
npm run build        # build production thành công
```

Kịch bản kiểm thử end-to-end thủ công (chạy sau Giai đoạn 7):
1. Trang chủ hiển thị đủ 12 section, slider chạy, tab đổi sản phẩm đúng
2. Vào Shop → lọc danh mục "Rau củ" + khoảng giá → URL đổi → F5 giữ nguyên bộ lọc
3. Tìm "cam" ở header → dropdown gợi ý hiện → vào chi tiết sản phẩm
4. Thêm 2 sản phẩm vào giỏ → mini-cart hiện đúng số lượng và tổng tiền
5. F5 trang → giỏ hàng vẫn còn (localStorage hoạt động)
6. Checkout: bỏ trống SĐT → hiện lỗi validate; điền đủ → ra trang thành công
7. Đăng xuất rồi vào `/tai-khoan` → bị redirect sang trang đăng nhập
8. Thu nhỏ trình duyệt còn 375px → không vỡ layout, không cuộn ngang

---

## Ước lượng

| Giai đoạn | Khối lượng |
|---|---|
| 0–3 (tài liệu + nền móng + dữ liệu + UI chung) | ~25% |
| 4 (trang chủ) | ~20% |
| 5 (shop + chi tiết) | ~20% |
| 6–7 (giỏ hàng, checkout, auth) | ~20% |
| 8–10 (nội dung, hoàn thiện, chuẩn bị API) | ~15% |

**Đề xuất:** làm tuần tự Giai đoạn 0 → 3 trước rồi cùng rà soát, vì `ProductCard` và design tokens quyết định phong cách toàn bộ phần còn lại. Sửa ở giai đoạn này rẻ hơn nhiều so với sau khi đã dựng xong 12 section trang chủ.

---

## Ghi chú

- File `index.html` hiện tại sẽ bị thay thế bởi bản Vite sinh ra — không có nội dung nào cần giữ lại.
- Ảnh sản phẩm: dùng placeholder (Unsplash/picsum) trong giai đoạn mock, thay bằng ảnh thật sau.
- **Không sao chép** ảnh, logo, hay nội dung văn bản trực tiếp từ site mẫu — chỉ tham khảo cấu trúc và bố cục để tránh vấn đề bản quyền.
