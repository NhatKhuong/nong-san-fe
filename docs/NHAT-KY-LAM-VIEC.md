# Nhật ký làm việc

Ghi lại **diễn biến và lý do đằng sau từng quyết định** của dự án. Khác với [`PLAN.md`](PLAN.md) (kế hoạch + tiến độ) và [`../CLAUDE.md`](../CLAUDE.md) (quy tắc code), file này trả lời câu hỏi *"vì sao lại làm như vậy"* và *"hôm qua đang dở ở đâu"*.

Đọc theo thứ tự: **Trạng thái hiện tại** → **Tiếp theo làm gì** → phần còn lại khi cần tra cứu.

---

## Trạng thái hiện tại

| | |
|---|---|
| **Cập nhật lần cuối** | 17/08/2026 (phiên 3) |
| **Đã xong** | Giai đoạn 0 → 5 (tài liệu, nền móng, dữ liệu, UI, trang chủ, **cửa hàng + chi tiết SP**) |
| **Đang dở** | Không có việc nào dở giữa chừng |
| **Việc kế tiếp** | Giai đoạn 6 — giỏ hàng + thanh toán |
| **Build** | ✅ `npm run build` exit 0 |
| **Lint** | ✅ `npx oxlint` sạch |
| **Kiểm thử trình duyệt** | ✅ 11/11 tiêu chí nghiệm thu đạt, 0 lỗi console |

### Chạy lại dự án

```bash
cd c:\fe_base\code_space_1
npm run dev          # → http://localhost:5173
```

Tài khoản demo để test đăng nhập (Giai đoạn 7): `demo@nongsansach.vn` / `123456`

### Lưu ý khi mở lại

Đã xong: trang chủ (12 section), cửa hàng (lọc/sắp xếp/phân trang), chi tiết sản phẩm (gallery, tab, đánh giá), tìm kiếm có gợi ý, xem nhanh. Còn **13 trang vẫn dùng `PagePlaceholder`** — component này sẽ bị xoá khi cả 10 giai đoạn hoàn tất.

Bundle vượt ngưỡng cảnh báo 500 KB của Vite (chủ yếu do Swiper). **Không cần xử lý ngay** — tách code theo route bằng `React.lazy` đã nằm trong Giai đoạn 9.

Khi kiểm thử bằng trình duyệt headless sẽ thấy vài request `fonts.gstatic.com` trả 404. Đây là do patchright sửa User-Agent nên URL font subset không khớp, **không phải lỗi dự án** — font vẫn hiển thị bình thường.

---

## Tiếp theo làm gì (Giai đoạn 6)

Giỏ hàng và thanh toán. Phần **logic giỏ hàng đã xong từ Giai đoạn 3**, giai đoạn này chủ yếu là giao diện:

| Việc | Dùng sẵn cái gì |
|---|---|
| Mini-cart drawer | `useUIStore` đã có `isMiniCartOpen` / `openMiniCart` / `closeMiniCart`; `ProductCard` và trang chi tiết **đã gọi `openMiniCart()`** sau khi thêm giỏ — hiện chưa có gì mở ra, cần dựng drawer |
| Trang giỏ hàng | `useCartStore` + selector `selectSubtotal`, `selectItemCount`; `<QuantityPicker />` |
| Mã giảm giá | `validateCoupon(code, subtotal)`, `getActiveCoupons()` trong `coupons.api.ts` |
| Phí vận chuyển | `calcShippingFee(subtotal)` trong `orders.api.ts` + hằng `FREE_SHIPPING_THRESHOLD` |
| Đặt hàng | `createOrder(payload)` — đã tự tính giảm giá, phí ship, sinh mã đơn `NSS-yyyymmdd-nnnn` |
| Form checkout | React Hook Form + Zod (xem `ReviewForm.tsx` làm mẫu), `<Input>`, `<Textarea>`, `<Select>` |

**Ba điểm cần chú ý:**

1. `openMiniCart()` hiện đang được gọi ở 4 chỗ nhưng **chưa có UI nào lắng nghe** — dựng mini-cart drawer là việc đầu tiên nên làm.
2. `CartItem` lưu **snapshot** giá và tồn kho tại thời điểm thêm. Trang giỏ hàng cần chặn tăng số lượng vượt `item.stock`.
3. Sau khi đặt hàng thành công phải `clear()` giỏ và điều hướng sang trang thành công kèm mã đơn.

Nhớ tick `- [x]` trong [`PLAN.md`](PLAN.md) ngay khi xong từng mục.

---

## Dòng thời gian

### Phiên 3 — 17/08/2026

#### Giai đoạn 5: cửa hàng, chi tiết sản phẩm, tìm kiếm

Phần khó nhất không phải giao diện mà là **đồng bộ trạng thái bộ lọc với URL**. Toàn bộ gom vào một hook [`useProductFilters`](../src/hooks/useProductFilters.ts) — URL là nguồn chân lý duy nhất, component không giữ state bộ lọc riêng.

Ba cái bẫy đã xử lý ngay từ đầu thay vì để phát sinh bug sau:

1. **Đổi bộ lọc phải reset `page` về 1.** Không làm thì đang ở trang 5, lọc lại còn 2 trang → lưới trống trơn mà người dùng không hiểu vì sao.
2. **Thanh trượt giá ghi URL bằng `replace: true`.** Nếu dùng `push`, kéo thanh 20 bước sẽ tạo 20 mục lịch sử và người dùng phải bấm Back 20 lần mới thoát được trang. Ngoài ra `PriceRangeSlider` chỉ gọi `onCommit` khi **thả chuột / nhả phím**, không gọi trong lúc kéo.
3. **Tham số URL rác bị bỏ qua.** `?page=abc&minRating=99&sort=hacked` phải rơi về mặc định chứ không cho lưới trắng. Đã kiểm thử tự động tình huống này.

Còn `view=grid|list` cũng để trong URL (thay vì Zustand) để link chia sẻ tái hiện đúng cái người gửi đang nhìn.

#### Bổ sung dữ liệu đánh giá

Type `Review` đã khai báo từ Giai đoạn 2 nhưng chưa có mock lẫn API. Đã thêm `mocks/reviews.json` (48 đánh giá), `api/reviews.api.ts` và `hooks/useReviews.ts`.

**Đơn giản hoá có chủ ý:** gửi đánh giá mới **không** cập nhật `rating`/`reviewCount` trong `products.json` — tổng hợp điểm là việc của backend. Đã ghi rõ trong comment của `getReviewSummary()` để sau này không nhầm là bug.

#### Kiểm thử

Viết bộ kiểm thử tự động 11 tiêu chí (`qa-shop.mjs` trong scratchpad của phiên), chạy trên trình duyệt thật. Tất cả đạt, 0 lỗi console.

---

### Phiên 2 — 17/08/2026

#### Chốt hai quyết định treo từ phiên trước

**Màu thương hiệu:** đổi từ xanh `#7FAD39` sang xanh đậm `#4A7C2A`. Ban đầu chỉ là yêu cầu thẩm mỹ, nhưng khi tính độ tương phản để chọn tông mới thì phát hiện vấn đề nghiêm trọng hơn (xem sự cố #4).

**Ảnh sản phẩm:** đổi từ picsum sang ảnh Unsplash thật. Quá trình chọn nguồn tốn công hơn dự kiến (xem sự cố #5).

#### Dựng 12 section trang chủ

Toàn bộ nằm trong `src/components/home/`, `HomePage.tsx` chỉ ghép lại. Nền trắng và nền `surface` xen kẽ để phân tách khối.

Phát sinh thêm ngoài kế hoạch:
- `components/ui/Carousel.tsx` — bọc Swiper một lần thay vì lặp cấu hình ở 3 section (SaleSection, Testimonials, BrandLogos)
- `PROMO_END_DATE` trong `constants.ts` — mốc kết thúc khuyến mãi cho `CountdownPromo`
- `subscribeNewsletter()` trong `marketing.api.ts` — để form Newsletter đi qua lớp API đúng quy tắc kiến trúc, không gọi thẳng trong component

`HomePage.tsx` dùng thẻ `<title>` và `<meta>` trực tiếp trong JSX — React 19 tự đưa lên `<head>`, không cần thư viện SEO.

---

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

### 4. Bảng màu lấy từ site mẫu trượt chuẩn tiếp cận WCAG

**Phát hiện:** khi tính độ tương phản để chọn tông xanh mới, hoá ra **cả 4 màu chữ đang dùng đều không đạt WCAG AA** (chuẩn tối thiểu 4.5:1 cho chữ thường):

| Token | Cũ | Tỉ lệ | Mới | Tỉ lệ |
|---|---|---|---|---|
| `primary` (nút, chữ trắng) | `#7FAD39` | 2.65:1 ❌ | `#4A7C2A` | 4.99:1 ✅ |
| `accent` (badge sale) | `#F5871F` | 2.51:1 ❌ | `#C2410C` | 5.18:1 ✅ |
| `ink-muted` | `#7A7A7A` | 4.29:1 ❌ | `#5C5C5C` | 6.69:1 ✅ |
| `ink-light` (placeholder) | `#A8A8A8` | 2.38:1 ❌ | `#767676` | 4.54:1 ✅ |

**Nguyên nhân:** màu được lấy đúng theo site mẫu — và **site mẫu cũng trượt chuẩn**. Sao chép màu từ một thiết kế có sẵn không đảm bảo thiết kế đó đúng.

**Cách xử lý:** đổi bảng màu nhưng **giữ nguyên tên token**, nên không component nào phải sửa. Đã thêm ghi chú ở đầu khối `@theme` trong `index.css` nhắc tính lại tỉ lệ nếu đổi màu.

**Bài học:** tính độ tương phản trước khi chốt màu, đừng tin site tham khảo.

### 5. loremflickr trả ảnh sai chủ đề hoàn toàn

**Triệu chứng:** phương án ban đầu là dùng `loremflickr.com/700/700/<từ-khoá>?lock=<id>` cho 42 ảnh sản phẩm — ảnh khớp từ khoá, ổn định qua các lần tải, không cần API key. Nghe rất hợp lý.

**Thực tế khi xem tận mắt:** từ khoá `carrot,vegetable` trả về ảnh macro trông như ngọn lửa, `salmon,fish` trả về ảnh chụp bàn ăn sushi trong nhà hàng, `orange,citrus` trả về ảnh AI vẽ con rắn hình vỏ chanh. Lại còn có watermark Flickr. Hoàn toàn không dùng được cho catalog.

**Cách xử lý:** chuyển sang Unsplash với photo ID cố định. Lấy ID bằng cách đọc trang tìm kiếm của Unsplash theo từ khoá, rồi:
1. Kiểm tra **toàn bộ 106 URL** trả HTTP 200 — phát hiện 1 ID chết (404), đã thay
2. Xem tận mắt ảnh đại diện của **từng nhóm** trước khi gán

Bước 2 lộ ra hai lỗi gán mà việc kiểm HTTP không thể bắt: nhóm ảnh lấy từ tìm kiếm `eggs-butter-cheese` bị **trộn lẫn** (ảnh đầu tiên là bơ chứ không phải trứng, nên "Trứng gà thả vườn" hiện ảnh bơ), và nhóm `raw-chicken-pork-meat` có 5 ảnh gà nhưng chỉ 1 ảnh heo (nên "Sườn non heo" hiện ảnh gà). Đã lấy thêm ảnh chuyên biệt cho trứng / phô mai / sữa chua / thịt heo rồi gán lại.

**Bài học:** HTTP 200 chỉ chứng minh ảnh **tồn tại**, không chứng minh ảnh **đúng nội dung**. Với ảnh minh hoạ, phải xem tận mắt ít nhất một mẫu cho mỗi nhóm.

### 6. `--script` của skill browser-automation lỗi trên Windows

**Triệu chứng:** `ERR_UNSUPPORTED_ESM_URL_SCHEME ... Received protocol 'c:'`

**Nguyên nhân:** skill ghép đường dẫn thành `${process.cwd()}/${scriptPath}` rồi `import()`. Trên Windows chuỗi này thành `C:\...\file.mjs`, không phải URL `file://` hợp lệ.

**Cách xử lý:** hai hướng, tuỳ nhu cầu:
- Kiểm tra đơn giản → dùng `--eval` với biểu thức async, chạy hoàn toàn trong trình duyệt
- Cần đổi kích thước màn hình (skill không có tuỳ chọn viewport) → viết script Playwright riêng, import `patchright` bằng URL `file:///...` và **phải truyền `channel: 'chromium'`** (nếu không sẽ báo thiếu trình duyệt, vì bản headless shell mặc định chưa được cài)

Script kiểm thử đa kích thước dùng lại được nằm ở thư mục scratchpad của phiên (`responsive.mjs`).

### 7. Ảnh sai chủ đề — lần hai, và cách soát hiệu quả hơn

**Triệu chứng:** ở Phiên 3, mở trang cửa hàng thì thấy "Cà chua bi hữu cơ" hiện ảnh **củ hành**. Trước đó Phiên 2 đã sửa hai đợt tương tự (nhóm trứng, nhóm thịt).

**Nguyên nhân gốc:** cách thu thập ảnh theo **nhóm từ khoá ghép** (`tomato-onion`, `eggs-butter-cheese`, `raw-chicken-pork-meat`) cho ra danh sách trộn lẫn nhiều chủ đề. Chỉ xem một ảnh mẫu mỗi nhóm thì không đủ — ảnh mẫu đúng không bảo đảm 5 ảnh còn lại cũng đúng.

**Cách xử lý hiệu quả hơn nhiều:** thay vì soi từng ảnh chụp trang rồi phát hiện lỗi nhỏ giọt, dựng một **bảng đối chiếu**: sinh file HTML lưới 42 ô, mỗi ô là ảnh chính + tên sản phẩm, rồi chụp một tấm duy nhất. Soát một lượt phát hiện luôn **12 sản phẩm sai** (khoai tây ra bí ngô, chuối ra bơ, cá hồi ra tôm, dầu ô liu ra gạo…). Script nằm ở `contact-sheet.mjs` trong scratchpad.

Sau khi sửa, dựng lại bảng đối chiếu để nghiệm thu — lần hai chỉ còn 1 lỗi (thanh long ra đu đủ), sửa nốt.

**Bài học:** với dữ liệu lặp lại nhiều bản ghi, hãy dựng một khung nhìn tổng hợp để soát một lượt, đừng kiểm tra bằng cách mở từng trang. Và khi lấy ảnh theo từ khoá, **dùng từ khoá đơn** (`potatoes`, `cherry-tomatoes`) thay vì ghép nhiều chủ đề.

### 8. Drawer đóng vẫn Tab vào được

**Triệu chứng:** kịch bản kiểm thử báo `strict mode violation` — nút "Rau củ hữu cơ" khớp 2 phần tử. Hoá ra `FilterSidebar` tồn tại hai bản trong DOM: sidebar desktop và bản trong drawer mobile.

**Vấn đề thật đằng sau:** `Drawer` và `MobileMenu` khi đóng chỉ bị đẩy ra ngoài màn hình bằng `translate-x-full`, **không ẩn hẳn**. Nghĩa là người dùng bàn phím vẫn Tab được vào toàn bộ nút bên trong một panel đang đóng, và trình đọc màn hình vẫn đọc chúng.

**Cách xử lý:** thêm thuộc tính `inert={!isOpen}` cho cả hai component (React 19 hỗ trợ sẵn). Một thuộc tính xử lý cả focus lẫn khả năng tiếp cận của trình đọc màn hình.

**Bài học:** panel ẩn bằng `transform` vẫn nằm trong luồng focus. Kiểm thử tự động vô tình phát hiện ra — đây là lợi ích phụ đáng giá của việc viết test bằng vai trò (role) thay vì CSS selector.

---

## Những điều chỉnh so với kế hoạch gốc

Ghi lại để hiểu vì sao code hiện tại khác đôi chỗ so với `PLAN.md` bản đầu.

### Store Zustand kéo từ Giai đoạn 6–7 lên Giai đoạn 3

`cart.store.ts`, `wishlist.store.ts`, `ui.store.ts` được làm sớm.

**Lý do:** `ProductCard` cần gọi trực tiếp `addItem()` và `toggleWishlist()`. Nếu để đúng lịch (Giai đoạn 6–7) thì ở Giai đoạn 3 phải viết `ProductCard` với prop callback tạm, rồi Giai đoạn 6 lại sửa chính component đó cùng mọi nơi dùng nó. Làm sớm rẻ hơn.

Giai đoạn 6–7 giờ chỉ còn phần **giao diện** (trang giỏ hàng, mini-cart drawer, checkout, trang tài khoản).

### Hai nguồn ảnh khác nhau, có lý do

Ảnh mock không lấy từ một nguồn duy nhất:

| Loại | Nguồn | Vì sao |
|---|---|---|
| 42 sản phẩm, 11 danh mục, 8 bài viết, hero, banner | Unsplash ID cố định | Số lượng đủ nhỏ để kiểm tra được từng nhóm bằng mắt; tải nhanh (~0.2s) |
| 4 avatar testimonial | picsum | Ảnh người ngẫu nhiên là chấp nhận được, không cần đúng chủ đề |

Đã cân nhắc và **loại bỏ** loremflickr dù nó tiện hơn — lý do ở sự cố #5.

Khi có ảnh thật của cửa hàng: đặt vào `public/img/`, sửa đường dẫn trong `src/mocks/products.json` và `categories.json`. Không component nào phải sửa.

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
- `components/ui/Carousel.tsx` (Phiên 2) — bọc Swiper một lần, tránh lặp cấu hình ở 3 section trang chủ
- `mocks/reviews.json` + `api/reviews.api.ts` + `hooks/useReviews.ts` (Phiên 3) — type `Review` có sẵn từ Giai đoạn 2 nhưng thiếu hẳn dữ liệu và hàm API
- `hooks/useProductFilters.ts` (Phiên 3) — gom toàn bộ logic đồng bộ URL ↔ bộ lọc vào một chỗ
- `components/layout/SearchBox.tsx` (Phiên 3) — tách khỏi `Header.tsx` khi file này sắp chạm ngưỡng ~200 dòng trong `CLAUDE.md`; nhân tiện thêm dropdown gợi ý

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
| Sửa một section trang chủ | [`src/components/home/`](../src/components/home/) — mỗi section một file |
| Đổi thứ tự section trang chủ | [`src/pages/HomePage.tsx`](../src/pages/HomePage.tsx) |
| Đổi mốc kết thúc khuyến mãi | `PROMO_END_DATE` trong [`src/lib/constants.ts`](../src/lib/constants.ts) |
| Sửa logic lọc / URL trang cửa hàng | [`src/hooks/useProductFilters.ts`](../src/hooks/useProductFilters.ts) |
| Thêm/sửa bộ lọc ở sidebar | [`src/components/filter/`](../src/components/filter/) |
| Sửa dropdown gợi ý tìm kiếm | [`src/components/layout/SearchBox.tsx`](../src/components/layout/SearchBox.tsx) |
| Thêm/sửa đánh giá mock | [`src/mocks/reviews.json`](../src/mocks/reviews.json) |
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
