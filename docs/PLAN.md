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

### ⬜ Giai đoạn 4 — Trang chủ
Dựng 12 section theo đúng thứ tự site mẫu, mỗi section là 1 component trong `components/home/`:
- [ ] `HeroSlider` — Swiper, 2 slide, CTA
- [ ] `FeatureStrip` — 4 ưu điểm (100% hữu cơ, tiêu dùng xanh, freeship, đổi trả)
- [ ] `CategoryGrid` — 6 danh mục kèm số lượng sản phẩm
- [ ] `SaleSection` — carousel sản phẩm giảm giá
- [ ] `PromoBanners` — 3 banner khuyến mãi
- [ ] `ProductTabs` — tab theo danh mục, đổi tab đổi lưới sản phẩm
- [ ] `BestSellers` — kèm progress bar "đã bán / còn lại"
- [ ] `CountdownPromo` — Black Friday + đồng hồ đếm ngược
- [ ] `Testimonials` — carousel 4 đánh giá
- [ ] `BrandLogos`
- [ ] `BlogPreview` — 4 bài mới nhất
- [ ] `Newsletter`
- **Kết quả:** trang chủ hoàn chỉnh, responsive mobile/tablet/desktop

### ⬜ Giai đoạn 5 — Shop & Chi tiết sản phẩm
- [ ] **Shop:** sidebar lọc (danh mục cây phân cấp, khoảng giá dạng slider, rating, còn hàng) + sort (mới nhất / giá tăng / giá giảm / bán chạy) + toggle grid/list + phân trang
- [ ] **Đồng bộ filter với URL query params** (`?category=rau-cu&minPrice=50000&sort=price_asc`) để share link và F5 giữ nguyên trạng thái
- [ ] **Chi tiết sản phẩm:** gallery ảnh + zoom, thông tin, chọn số lượng, thêm giỏ/mua ngay, tab (Mô tả / Thông tin bổ sung / Đánh giá), sản phẩm liên quan
- [ ] **Search:** ô tìm kiếm ở header, có debounce + dropdown gợi ý
- **Kết quả:** lọc/sort/phân trang/tìm kiếm chạy đúng, URL phản ánh trạng thái

### ⬜ Giai đoạn 6 — Giỏ hàng & Thanh toán
- [x] `cart.store.ts` (Zustand + middleware `persist` → localStorage): add, remove, updateQty, clear, selector tính tổng tiền — _đã làm sớm ở Giai đoạn 3_
- [ ] Mini-cart drawer trượt từ phải khi bấm icon giỏ hàng
- [ ] Trang giỏ hàng: bảng sản phẩm, cập nhật số lượng, mã giảm giá, tóm tắt đơn
- [ ] Checkout: form React Hook Form + Zod (họ tên, SĐT, email, địa chỉ, ghi chú), chọn phương thức thanh toán (COD / chuyển khoản), tóm tắt đơn hàng
- [ ] Trang đặt hàng thành công
- **Kết quả:** thêm sản phẩm → F5 giỏ hàng vẫn còn → đặt hàng ra trang thành công

### ⬜ Giai đoạn 7 — Tài khoản & Wishlist
- [ ] Đăng nhập / Đăng ký / Quên mật khẩu (validate đầy đủ, mock auth trả về token giả)
- [ ] `auth.store.ts` giữ user + token, `ProtectedRoute` chặn trang cần đăng nhập
- [ ] Trang tài khoản: thông tin cá nhân, lịch sử đơn hàng, sổ địa chỉ, đổi mật khẩu
- [x] `wishlist.store.ts` (persist localStorage) — _đã làm sớm ở Giai đoạn 3_
- [ ] Trang Wishlist hiển thị danh sách sản phẩm đã lưu
- **Kết quả:** đăng nhập → vào được `/tai-khoan`, chưa đăng nhập bị redirect

### ⬜ Giai đoạn 8 — Nội dung
- [ ] Blog: danh sách (phân trang, lọc theo danh mục) + chi tiết bài viết + bài liên quan
- [ ] Giới thiệu, Liên hệ (form + bản đồ nhúng), 404
- **Kết quả:** đủ toàn bộ menu điều hướng của site mẫu

### ⬜ Giai đoạn 9 — Hoàn thiện
- [ ] Rà soát responsive toàn bộ (mobile 375px, tablet 768px, desktop 1280px+); mobile menu dạng drawer
- [ ] Skeleton loading thay vì spinner; empty state (giỏ trống, không tìm thấy sản phẩm); error boundary
- [ ] SEO: `react-helmet-async` cho title/meta/OG mỗi trang
- [ ] A11y: alt ảnh, aria-label cho icon button, focus ring, điều hướng bàn phím
- [ ] Tối ưu: lazy load ảnh, `React.lazy` cho route nặng, `vite build` kiểm tra bundle size

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
| 4 | Trang chủ | ⬜ Chưa bắt đầu |
| 5 | Shop & chi tiết SP | ⬜ Chưa bắt đầu |
| 6 | Giỏ hàng & checkout | ⬜ Chưa bắt đầu |
| 7 | Tài khoản & wishlist | ⬜ Chưa bắt đầu |
| 8 | Nội dung (blog, giới thiệu, liên hệ) | ⬜ Chưa bắt đầu |
| 9 | Hoàn thiện | ⬜ Chưa bắt đầu |
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
