# Nhật ký làm việc

Ghi lại **diễn biến và lý do đằng sau từng quyết định** của dự án. Khác với [`PLAN.md`](PLAN.md) (kế hoạch + tiến độ) và [`../CLAUDE.md`](../CLAUDE.md) (quy tắc code), file này trả lời câu hỏi *"vì sao lại làm như vậy"* và *"hôm qua đang dở ở đâu"*.

Đọc theo thứ tự: **Trạng thái hiện tại** → **Tiếp theo làm gì** → phần còn lại khi cần tra cứu.

---

## Trạng thái hiện tại

| | |
|---|---|
| **Cập nhật lần cuối** | 16/08/2026 |
| **Đã xong** | Giai đoạn 0 → 3 (tài liệu, nền móng, lớp dữ liệu, thư viện UI) |
| **Đang dở** | Không có việc nào dở giữa chừng |
| **Việc kế tiếp** | Giai đoạn 4 — dựng 12 section trang chủ |
| **Build** | ✅ `npm run build` chạy sạch (416 KB JS / 130 KB gzip) |
| **Type-check** | ✅ Không lỗi |

### Chạy lại dự án

```bash
cd c:\fe_base\code_space_1
npm run dev          # → http://localhost:5173
```

Tài khoản demo để test đăng nhập (Giai đoạn 7): `demo@nongsansach.vn` / `123456`

### Lưu ý khi mở lại

Trang chủ hiện tại là **bản tạm** — chỉ hiển thị một lưới sản phẩm để kiểm tra `ProductCard`. Nội dung này nằm trong [`src/pages/HomePage.tsx`](../src/pages/HomePage.tsx) và **sẽ bị thay hoàn toàn** ở Giai đoạn 4. Đừng nhầm đây là trang chủ thật.

Tương tự, 15 trang khác đang dùng `PagePlaceholder` — component này sẽ bị xoá khi cả 10 giai đoạn hoàn tất.

---

## Tiếp theo làm gì (Giai đoạn 4)

Dựng 12 section trang chủ, mỗi section là một component riêng trong `src/components/home/`. Thứ tự bám theo site mẫu:

1. `HeroSlider` — Swiper, 2 slide (dữ liệu đã có sẵn ở `getHeroSlides()`)
2. `FeatureStrip` — 4 ưu điểm
3. `CategoryGrid` — 6–7 danh mục kèm số lượng SP (`useRootCategories()` đã trả sẵn `productCount`)
4. `SaleSection` — carousel SP giảm giá (`useProducts({ onSaleOnly: true })`)
5. `PromoBanners` — 3 banner
6. `ProductTabs` — tab theo danh mục
7. `BestSellers` — dùng `<ProductGrid showSoldProgress />`, đã có sẵn thanh tiến trình
8. `CountdownPromo` — đồng hồ đếm ngược
9. `Testimonials` — `useTestimonials()`
10. `BrandLogos` — `useBrands()`
11. `BlogPreview` — `useLatestPosts(4)`
12. `Newsletter`

**Toàn bộ hook và dữ liệu cần thiết đã dựng xong ở Giai đoạn 2–3** — Giai đoạn 4 chỉ còn việc ghép giao diện, không phải đụng lại lớp API.

Nhớ tick `- [x]` trong [`PLAN.md`](PLAN.md) sau mỗi section.

---

## Hai quyết định còn treo

Nên chốt **trước** khi dựng trang chủ, vì sửa sau sẽ tốn hơn nhiều:

1. **Màu thương hiệu** — đang dùng xanh `#7FAD39` + cam `#F5871F` lấy theo site mẫu. Đổi bây giờ chỉ sửa vài dòng token trong [`src/index.css`](../src/index.css); đổi sau khi đã dựng 12 section thì phải rà lại toàn bộ.
2. **Ảnh sản phẩm** — đang dùng `picsum.photos` nên ảnh là **ảnh ngẫu nhiên, không phải nông sản**. Nếu có bộ ảnh thật thì thay sớm, tránh phải sửa 42 bản ghi trong `products.json` về sau.

---

## Dòng thời gian

### Phiên 1 — 16/08/2026

#### Khởi đầu
Bắt đầu từ một file `index.html` tĩnh với nội dung "hello claude code". Sau đó bạn nêu yêu cầu thật: xây frontend website bán nông sản sạch bằng React, lấy https://organic-food.monamedia.net/ làm mẫu, backend sẽ làm sau bằng Spring Boot.

#### Khảo sát site mẫu
Phân tích trang chủ và trang cửa hàng của site mẫu để rút ra: 12 section trang chủ, 7 nhóm sản phẩm, và các tính năng thương mại điện tử cần có (giỏ hàng, wishlist, tìm kiếm, đăng nhập, lọc, phân trang).

#### 4 quyết định nền tảng
Bạn đã chốt:

| Vấn đề | Chốt | Lý do |
|---|---|---|
| Tooling | Vite + React + **TypeScript** | Type khớp DTO Spring Boot sau này, giảm lỗi khi ghép API |
| Styling | **Tailwind CSS** | Dựng UI nhanh, tự do clone layout, không bị gò bởi design system có sẵn |
| Phạm vi | **Full e-commerce** | Làm trọn thay vì chia nhỏ |
| Mock data | **JSON local + lớp service** | Đổi sang API thật chỉ sửa bên trong `src/api/`, không đụng component |

Sau đó bạn yêu cầu thêm: tạo `CLAUDE.md` để giữ code nhất quán, và lưu kế hoạch vào chính project kèm checkbox tiến độ.

#### Nguyên tắc kiến trúc quan trọng nhất

> **Component không bao giờ import trực tiếp file JSON.**
> Luồng bắt buộc: `component` → `hooks/useXxx` (TanStack Query) → `api/xxx.api.ts` → `mocks/*.json`

Mỗi hàm trong `src/api/` được viết với **chữ ký y hệt API thật sẽ có**, và trong comment ghi sẵn dòng code sẽ thay thế. Ví dụ trong [`products.api.ts`](../src/api/products.api.ts):

```ts
export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  // Khi có backend: const { data } = await client.get('/products', { params: query }); return data
  ...
}
```

Đây là lý do toàn bộ logic lọc / sắp xếp / phân trang được viết **bên trong lớp API** chứ không nằm ở component — đúng chỗ mà backend sẽ đảm nhận sau này.

#### Phân tách state
Quy ước cứng, ghi trong `CLAUDE.md`:
- Dữ liệu từ server (sản phẩm, danh mục, bài viết) → **TanStack Query**
- Trạng thái phía client (giỏ hàng, wishlist, auth, đóng/mở drawer) → **Zustand**

Không dùng Zustand để cache dữ liệu server, không dùng Query cho state UI.

#### Đã dựng xong những gì

**Giai đoạn 0 — Tài liệu.** `CLAUDE.md` (9 nhóm quy tắc), `docs/PLAN.md`, `README.md`.

**Giai đoạn 1 — Nền móng.** Vite 8 + React 19 + TS 6 + Tailwind v4. Design tokens organic trong `src/index.css`. Layout đầy đủ: TopBar, Header (có ô tìm kiếm, icon giỏ/wishlist/tài khoản), MobileMenu dạng drawer, Footer 4 cột. 16 route đã khai báo.

**Giai đoạn 2 — Lớp dữ liệu.** 11 file type, 6 file mock JSON (42 sản phẩm / 7 danh mục gốc + 4 danh mục con / 8 bài blog / 4 testimonial / 9 brand / 3 mã giảm giá), 7 file service, 6 file hook + `queryKeys.ts` tập trung.

Dữ liệu mock được cố ý tạo có **3 sản phẩm hết hàng** và **24 sản phẩm giảm giá** để test được empty state và badge sale ngay từ đầu, không phải sửa dữ liệu về sau.

**Giai đoạn 3 — Thư viện UI.** 15 component `ui/`, `ProductCard`, `ProductGrid`.

---

## Sự cố đã gặp và cách xử lý

Ghi lại để không mất thời gian debug lại nếu tái diễn.

### 1. Trang trắng hoàn toàn sau khi dựng layout

**Triệu chứng:** trình duyệt trả HTTP 200, title hiển thị đúng, nhưng `document.body` rỗng và **không có lỗi nào trong console**.

**Nguyên nhân:** lỗi thật nằm ở **log của Vite dev server**, không phải console trình duyệt:

```
SyntaxError: The requested module '/node_modules/.vite/deps/lucide-react.js'
does not provide an export named 'Facebook'
```

`lucide-react` từ **v1.0 đã gỡ toàn bộ icon thương hiệu** (Facebook, Instagram, YouTube, Twitter…) vì lý do bản quyền. Dự án đang dùng v1.31.

**Cách xử lý:** tự khai báo SVG inline trong [`src/components/ui/SocialIcons.tsx`](../src/components/ui/SocialIcons.tsx) thay vì thêm dependency mới.

**Bài học:** khi trang trắng mà console sạch, hãy đọc log dev server trước tiên.

### 2. `npx tsc --noEmit` không bắt được lỗi mà `npm run build` bắt được

**Triệu chứng:** `npx tsc --noEmit` báo sạch, nhưng `npm run build` fail:

```
tsconfig.app.json(14,5): error TS5101: Option 'baseUrl' is deprecated
and will stop functioning in TypeScript 7.0
```

**Nguyên nhân:** dự án dùng cấu trúc tsconfig phân mảnh (`tsconfig.json` → references → `tsconfig.app.json` + `tsconfig.node.json`). Lệnh `tsc --noEmit` trần không đi vào các config được reference; `tsc -b` trong script build thì có.

**Cách xử lý:** bỏ `baseUrl`, giữ nguyên `paths` — từ TS 5 trở đi `paths` đã được giải theo vị trí file tsconfig nên không cần `baseUrl`.

**Bài học:** **`npm run build` mới là cổng kiểm tra thật.** `npx tsc --noEmit` chỉ dùng để kiểm tra nhanh trong lúc code.

### 3. Ảnh sản phẩm trống khi chụp màn hình

**Triệu chứng:** ảnh sản phẩm trắng trơn trong screenshot đầu tiên.

**Nguyên nhân:** không phải lỗi — chỉ là ảnh từ `picsum.photos` chưa kịp tải xong tại thời điểm chụp.

**Xác minh:** đếm lại sau khi chờ đủ lâu → 20/20 ảnh tải thành công.

**Bài học:** với ảnh từ CDN ngoài, phải chờ tải xong rồi mới kết luận, đừng vội báo lỗi.

---

## Những điều chỉnh so với kế hoạch gốc

Ghi lại để hiểu vì sao code hiện tại khác đôi chỗ so với `PLAN.md` bản đầu.

### Store Zustand kéo từ Giai đoạn 6–7 lên Giai đoạn 3

`cart.store.ts`, `wishlist.store.ts`, `ui.store.ts` được làm sớm.

**Lý do:** `ProductCard` cần gọi trực tiếp `addItem()` và `toggleWishlist()`. Nếu để đúng lịch (Giai đoạn 6–7) thì ở Giai đoạn 3 phải viết `ProductCard` với prop callback tạm, rồi Giai đoạn 6 lại sửa chính component đó cùng mọi nơi dùng nó. Làm sớm rẻ hơn.

Giai đoạn 6–7 giờ chỉ còn phần **giao diện** (trang giỏ hàng, mini-cart drawer, checkout, trang tài khoản).

### Bỏ `react-helmet-async`

Kế hoạch gốc dự định dùng thư viện này cho SEO ở Giai đoạn 9.

**Lý do bỏ:** React 19 đã hỗ trợ **document metadata natively** — chỉ cần render thẻ `<title>` và `<meta>` ngay trong component, React tự đưa lên `<head>`. Không cần thêm dependency, và `react-helmet-async` cũng chưa hỗ trợ chính thức React 19.

### Bổ sung ngoài kế hoạch

Những thứ phát sinh trong lúc làm, thấy cần nên thêm:

- `components/ui/SectionHeading.tsx` — tiêu đề chuẩn cho section, giữ nhịp thị giác đồng nhất trên 12 section trang chủ
- `components/ui/StateBlock.tsx` — `EmptyState` + `ErrorState` dùng chung
- `components/product/ProductGrid.tsx` — bọc sẵn cả 3 nhánh loading / error / empty, để không phải lặp lại logic này ở mọi trang
- `hooks/queryKeys.ts` — gom query key một chỗ, tránh lệch chuỗi khi invalidate cache
- `mocks/coupons.json` + `api/coupons.api.ts` — chuẩn bị sẵn cho tính năng mã giảm giá ở Giai đoạn 6

---

## Bản đồ thư mục

Nơi cần tìm khi quay lại:

| Cần làm gì | Vào đâu |
|---|---|
| Đổi màu / font | [`src/index.css`](../src/index.css) — khối `@theme` |
| Thêm/sửa sản phẩm mock | [`src/mocks/products.json`](../src/mocks/products.json) |
| Sửa logic lọc, sắp xếp | [`src/api/products.api.ts`](../src/api/products.api.ts) |
| Thêm route mới | [`src/lib/constants.ts`](../src/lib/constants.ts) (hằng số) + [`src/routes/index.tsx`](../src/routes/index.tsx) |
| Sửa thông tin cửa hàng, hotline | [`src/lib/constants.ts`](../src/lib/constants.ts) — `STORE_INFO` |
| Sửa thẻ sản phẩm | [`src/components/product/ProductCard.tsx`](../src/components/product/ProductCard.tsx) |
| Sửa logic giỏ hàng | [`src/store/cart.store.ts`](../src/store/cart.store.ts) |
| Xem quy tắc code | [`../CLAUDE.md`](../CLAUDE.md) |
| Xem tiến độ | [`PLAN.md`](PLAN.md) |

---

## Quy ước ghi nhật ký

Mỗi phiên làm việc, cập nhật file này:

1. Sửa bảng **Trạng thái hiện tại** ở đầu file
2. Viết lại mục **Tiếp theo làm gì** cho phiên sau
3. Thêm một mục `### Phiên N — dd/mm/yyyy` vào **Dòng thời gian**
4. Ghi vào **Sự cố đã gặp** nếu có lỗi mất thời gian debug
5. Ghi vào **Những điều chỉnh so với kế hoạch gốc** nếu làm khác `PLAN.md`

Nguyên tắc: ghi **lý do**, không chỉ ghi việc đã làm. Danh sách việc đã làm thì `PLAN.md` có rồi.
