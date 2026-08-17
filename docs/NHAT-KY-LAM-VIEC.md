# Nhật ký làm việc

Ghi lại **diễn biến và lý do đằng sau từng quyết định** của dự án. Khác với [`PLAN.md`](PLAN.md) (kế hoạch + tiến độ) và [`../CLAUDE.md`](../CLAUDE.md) (quy tắc code), file này trả lời câu hỏi *"vì sao lại làm như vậy"* và *"hôm qua đang dở ở đâu"*.

Đọc theo thứ tự: **Trạng thái hiện tại** → **Tiếp theo làm gì** → phần còn lại khi cần tra cứu.

---

## Trạng thái hiện tại

| | |
|---|---|
| **Cập nhật lần cuối** | 17/08/2026 (phiên 8) |
| **Đã xong** | Giai đoạn 0 → 9 — giao diện đầy đủ và **đã qua rà soát chất lượng** |
| **Đang dở** | Không có việc nào dở giữa chừng |
| **Việc kế tiếp** | Giai đoạn 10 — chuẩn bị ghép Spring Boot (giai đoạn cuối) |
| **Build** | ✅ `npm run build` exit 0 |
| **Lint** | ✅ `npx oxlint` sạch, không còn cảnh báo |
| **Kiểm thử trình duyệt** | ✅ 6 bộ: trang chủ + GĐ 5 (11) + GĐ 6 (12) + GĐ 7 (15) + GĐ 8 (13) + GĐ 9 (10) đều đạt, 0 lỗi console, 0 request hỏng |
| **Bundle** | ✅ chunk chính **423 KB** (gzip 132 KB), 49 chunk — hết cảnh báo 500 KB |
| **Ảnh & font** | ✅ 134 ảnh + 18 file font tự host. **Phụ thuộc ngoài duy nhất còn lại: bản đồ Google** (có chủ đích) |

### Chạy lại dự án

```bash
cd c:\fe_base\code_space_1
npm run dev          # → http://localhost:5173
```

Tài khoản demo: `demo@nongsansach.vn` / `123456`

### Lưu ý khi mở lại

Đã xong toàn bộ giao diện: trang chủ (12 section), cửa hàng, chi tiết sản phẩm, tìm kiếm, xem nhanh, **luồng mua hàng** (mini-cart → giỏ hàng → thanh toán → mã đơn), **khu vực tài khoản** (đăng nhập/đăng ký/quên mật khẩu, hồ sơ, lịch sử đơn, sổ địa chỉ, đổi mật khẩu, wishlist), và **nội dung** (tin tức, chi tiết bài viết, giới thiệu, liên hệ). `PagePlaceholder` đã được xoá — không còn trang tạm nào.

**Bản đồ ở trang Liên hệ là iframe Google Maps** — phụ thuộc bên thứ ba duy nhất lúc chạy, là ngoại lệ có chủ đích (xem mục điều chỉnh bên dưới). Phép thử "chặn toàn bộ mạng ngoài" vì vậy sẽ thấy một iframe trống; mọi thứ còn lại vẫn hoạt động. Từ Giai đoạn 9, font cũng đã tự host nên đây là host **duy nhất** bị chặn.

Từ Giai đoạn 9, các trang được tách thành chunk riêng (`React.lazy`). Khi thêm trang mới, nhớ khai báo ở [`src/routes/lazyPages.ts`](../src/routes/lazyPages.ts) chứ không import thẳng vào `routes/index.tsx`.

Tài khoản demo được **gieo vào localStorage** ở lần đọc đầu tiên (`nss_mock_users`), nên mọi thay đổi lên nó đều sống qua F5. Muốn trả về trạng thái gốc thì xoá khoá đó đi.

Từ Giai đoạn 6, bấm "Thêm vào giỏ" sẽ **mở mini-cart kèm lớp phủ**. Khi viết kiểm thử tự động nhớ đóng nó (phím Esc) trước khi thao tác tiếp, nếu không lớp phủ sẽ chặn click.

Bundle vượt ngưỡng cảnh báo 500 KB của Vite (chủ yếu do Swiper). **Không cần xử lý ngay** — tách code theo route bằng `React.lazy` đã nằm trong Giai đoạn 9.

Khi kiểm thử bằng trình duyệt headless sẽ thấy vài request `fonts.gstatic.com` trả 404. Đây là do patchright sửa User-Agent nên URL font subset không khớp, **không phải lỗi dự án** — font vẫn hiển thị bình thường.

---

## Tiếp theo làm gì (Giai đoạn 10 — giai đoạn cuối)

Chuẩn bị ghép Spring Boot. Không thêm giao diện, chỉ dọn đường cho backend.

| Việc | Ghi chú |
|---|---|
| `docs/API_CONTRACT.md` | **Việc quan trọng nhất.** Liệt kê endpoint mong đợi + shape request/response, làm đầu bài cho phía Spring Boot |
| Interceptor axios | [`client.ts`](../src/api/client.ts) đã gắn `Authorization: Bearer` và xử lý 401. Còn thiếu **refresh token** |
| Proxy Vite | Khối `proxy` đã viết sẵn trong [`vite.config.ts`](../src/../vite.config.ts), đang comment — chỉ cần bỏ comment khi backend chạy |
| `.env` | `.env.example` đã đủ 4 biến: `VITE_API_BASE_URL`, `VITE_IMAGE_BASE_URL`, `VITE_SITE_URL` |

**Bốn thay đổi hợp đồng dữ liệu đã ghi chú tại chỗ, phải gom vào `API_CONTRACT.md`:**

1. `PaymentMethod` có thêm `'momo' | 'vnpay'` (Giai đoạn 6) — `src/types/order.ts`
2. `Order.userId: number | null` (Giai đoạn 7) — backend lấy từ JWT, **client không gửi lên**, nên `CreateOrderPayload` không có trường này
3. `Address` có thêm `provinceCode` và `districtCode` (Giai đoạn 7) — giữ cả mã lẫn tên
4. `Post.categorySlug` và `getPostCategories()` trả `PostCategory[]` thay vì `string[]` (Giai đoạn 8)

**Ba điểm cần chú ý:**

1. **Toàn bộ dữ liệu giả đang nằm trong localStorage** (`nss_mock_users`, `nss_mock_orders`, `nss_mock_addresses`, `nss_mock_contact_messages`). Khi ghép backend thật, cần xoá sạch hoặc đổi khoá để không lẫn dữ liệu cũ.
2. `imageUrl()` ở lớp API đang dựng đường dẫn ảnh. Backend nên trả **đường dẫn tương đối** (`/images/...`) đúng như mock, để `VITE_IMAGE_BASE_URL` vẫn dùng được khi chuyển sang S3/CDN.
3. Mọi hàm trong `src/api/` đều có sẵn dòng comment `Khi có backend: ...` ghi đúng lời gọi sẽ thay thế — dùng nó làm danh sách kiểm khi ghép.

Nhớ tick `- [x]` trong [`PLAN.md`](PLAN.md) ngay khi xong từng mục.

---

## Dòng thời gian

### Phiên 8 — 17/08/2026

#### Giai đoạn 9: hoàn thiện

Giai đoạn này không thêm tính năng nào. Nó trả những khoản nợ đã tích qua 8 giai đoạn, mỗi lần đều bị gác lại vì "chưa cấp thiết".

#### Vì sao tự host font trước tiên

Font Google là phụ thuộc treo từ phiên 4. Làm nó đầu tiên vì nó **dọn nhiễu cho mọi bước sau**: lỗi 404 của `fonts.gstatic.com` xuất hiện trong mọi bộ kiểm thử suốt bốn phiên, khiến mỗi lần đều phải dừng lại xác minh "cái này có phải lỗi thật không".

Cái bẫy lớn nhất là **bộ ký tự tiếng Việt**. URL Google không ghi `subset` nên nó tự phục vụ nhiều file theo `unicode-range`. Tải thiếu bộ `vietnamese` thì chữ có dấu lặng lẽ rơi về font hệ thống — trang vẫn "chạy" nên rất dễ bỏ sót. Script có bước dừng hẳn nếu không tìm thấy bộ đó, và phép thử chặn mạng ngoài kiểm luôn `document.fonts.check` với một chuỗi có dấu.

Bỏ bộ cyrillic và greek: 30 khối `@font-face` còn 18.

#### Tách code: quyết định bằng số đo, không bằng cảm tính

Chunk chính giảm **865 → 423 KB** (gzip 262 → 132 KB), hết cảnh báo 500 KB.

Có đo thử phương án cho `HomePage` lazy luôn: chunk chính còn 350 KB và trang cửa hàng không phải tải Swiper. Nhưng trang chủ khi đó mất thêm hai lượt request trước khi hiện được gì. Giữ `HomePage` nạp thẳng vì đó là nơi khách vào nhiều nhất — **đánh đổi này đã ghi vào comment trong `routes/index.tsx`** để sau này không ai tưởng là sót.

#### Ba lỗi thật mà chỉ kiểm tự động mới tìm ra

1. Ô đăng ký bản tin cao **19px trên mobile** — `flex-1` trong container `flex-col`.
2. `Drawer` và `Modal` **không hề giam focus** dù đã khai `aria-modal="true"`.
3. Thứ tự tiêu đề nhảy cấp ở gần như mọi trang.

Cả ba đều vô hình khi nhìn bằng mắt hoặc dùng chuột. Xem sự cố #15.

#### Vì sao vẫn tự viết `SeoMeta`

Kế hoạch gốc định dùng `react-helmet-async` cho SEO, đã bỏ từ phiên 2 vì React 19 hỗ trợ document metadata sẵn. Nay gom 19 khối `<title>` + `<meta>` rời rạc vào một component: thêm một loại thẻ mới chỉ phải sửa một chỗ thay vì 19 chỗ.

`og:image` cần URL tuyệt đối. Chưa có tên miền thì **bỏ hẳn thẻ ảnh** thay vì xuất đường dẫn tương đối — một thẻ sai còn khó lần ra hơn là không có thẻ.

---

### Phiên 7 — 17/08/2026

#### Giai đoạn 8: blog, giới thiệu, liên hệ

Lớp dữ liệu blog đã có sẵn từ Giai đoạn 2 nhưng **chưa một hàm nào có người dùng** — `usePostCategories()` viết xong rồi để đó suốt năm giai đoạn. Phần thiếu là dữ liệu đủ dày và toàn bộ giao diện.

#### Vì sao tự viết bộ render Markdown thay vì thêm thư viện

Nội dung mock chỉ dùng đúng sáu cú pháp: `##`, `###`, `-`, `1.`, `>`, `**đậm**`. Thêm `react-markdown` sẽ tốn ~40 KB vào một bundle vốn đã 865 KB, và nằm ngoài stack đã chốt trong `CLAUDE.md`.

`PostContent.tsx` khoảng 120 dòng, xử lý đúng sáu cú pháp đó. Có ghi rõ trong comment: nếu sau này cần bảng hay HTML nhúng thì **hãy hỏi trước khi thêm thư viện**, đừng cơi nới hàm này thành bộ parse đầy đủ.

Dựng `<strong>` bằng cách tách chuỗi thành mảng React node, **không dùng `dangerouslySetInnerHTML`** — hiện chưa cần, và sẽ thành lỗ hổng ngay khi nội dung bài viết đến từ backend thay vì mock của chính dự án.

#### Mở rộng dữ liệu vì bộ lọc không kiểm thử được

8 bài với 6 bài mỗi trang chỉ ra 2 trang, còn 5 chuyên mục chia nhau 8 bài thì lọc ra 1–2 bài. Không đủ để biết phân trang và bộ lọc có thật sự hoạt động hay không.

Nâng lên 18 bài: 3 trang, mỗi chuyên mục 3–4 bài. Đây là lý do kiểm thử "đang ở trang 3, đổi chuyên mục thì phải về trang 1" mới có ý nghĩa.

#### Trang giới thiệu: nội dung là dữ liệu

Toàn bộ câu chuyện, mốc thời gian, con số và cam kết nằm trong `mocks/about.json`, đi qua `about.api.ts`. Không viết cứng trong component — đúng bài học từ `PromoBanners` ở Phiên 4: đây là nội dung người vận hành sửa, không phải mã giao diện.

#### Bản đồ nhúng: ngoại lệ có chủ đích

Bạn chọn iframe Google Maps thay vì ảnh tĩnh. Điều này phá vỡ nguyên tắc "không phụ thuộc bên thứ ba lúc chạy" mà Giai đoạn 5.5 đã dựng cho ảnh.

Để giảm thiệt hại: iframe có `title` mô tả và `loading="lazy"`, và **luôn kèm địa chỉ dạng văn bản cùng link "Mở trong Google Maps"** bên dưới. Phép thử chặn mạng ngoài xác nhận trang vẫn dùng được bình thường khi iframe bị chặn.

---

### Phiên 6 — 17/08/2026

#### Giai đoạn 7: tài khoản và wishlist

Giống phiên trước, việc đầu tiên không phải dựng giao diện mà là **vá ba lỗ hổng ở lớp dữ liệu** — không có chúng thì các trang mới sẽ trông như hỏng:

1. **Tài khoản demo không lưu được thay đổi.** `readUsers()` trả `[DEMO_USER, ...stored]` còn `updateProfile()` lại lọc bỏ DEMO_USER ra, nên sửa hồ sơ xong F5 là mất. Đổi sang cơ chế **gieo** (seed) vào localStorage ở lần đọc đầu tiên, sau đó demo hành xử y hệt tài khoản do người dùng đăng ký.
2. **Thiếu `changePassword`** — thêm mới.
3. **Đơn hàng chưa gắn với ai** — thêm `userId` vào `Order`.

#### Vì sao `userId` không nằm trong `CreateOrderPayload`

Backend thật lấy id người dùng **từ JWT**, client không gửi lên — nếu client gửi thì ai cũng đặt hàng hộ người khác được. Mock phải mô phỏng đúng cách đó, nên `createOrder` gọi `getCurrentUserId()` (giải mã token) thay vì nhận từ payload.

Lợi ích kèm theo: **chữ ký `createOrder` không đổi**, `CheckoutPage` không phải sửa một dòng nào vì lý do này.

#### Token là nguồn chân lý, `user` chỉ là bản cache

Token nằm ở `nss_auth_token` (do `client.ts` quản), `auth.store` persist thêm `user` ở `nss_auth`. Hai khoá riêng biệt nên **có thể lệch nhau**: interceptor 401 xoá token rồi `window.location.href` tải lại trang, nhưng `user` vẫn còn — giao diện sẽ tưởng đang đăng nhập.

Xử lý trong `onRehydrateStorage`: mất token thì bỏ luôn bản cache user. Đã kiểm thử trực tiếp tình huống này (xoá token bằng tay rồi F5 → tự đăng xuất).

#### Lọc đơn nghiêm ngặt theo `userId`

Bạn chọn phương án nghiêm ngặt: đơn đặt lúc chưa đăng nhập (`userId: null`) **không bao giờ** xuất hiện trong tài khoản. Sạch về mặt mô hình, nhưng để lại một lối cụt — đơn coi như mất.

Vì vậy empty state của trang lịch sử có **ô tra cứu theo mã đơn** dẫn sang `/dat-hang-thanh-cong?code=`. Đây là lý do vẫn giữ đường tra cứu công khai theo mã.

#### Sổ địa chỉ lưu cả mã lẫn tên

`Address` ban đầu chỉ có `province` / `district` / `ward` dạng **tên**. Nhưng ô `<Select>` chạy theo **mã**, mà tra ngược tên → mã thì vỡ ngay khi tên đơn vị hành chính đổi. Nên thêm `provinceCode` và `districtCode`, giữ nguyên các trường tên vì đó chính là thứ được chép sang `ShippingInfo` của đơn hàng.

#### Không xoá giỏ hàng và wishlist khi đăng xuất

`queryClient.clear()` khi đăng xuất để dữ liệu tài khoản cũ không lọt sang tài khoản kế tiếp. Nhưng **cố ý giữ** giỏ hàng và wishlist: ở giai đoạn mock chúng là dữ liệu của thiết bị, không gắn với tài khoản. Khi backend đồng bộ hai thứ này theo user thì mới cần đổi.

---

### Phiên 5 — 17/08/2026

#### Giai đoạn 6: giỏ hàng và thanh toán

Việc đầu tiên không phải dựng trang mới mà là **sửa một lỗi đang tồn tại**: `openMiniCart()` được gọi ở 4 chỗ (`ProductCard`, `ProductListItem`, `ProductQuickView`, `ProductDetailPage`) nhưng chưa có UI nào lắng nghe. Khách bấm "Thêm vào giỏ" thì hàng vào giỏ thật nhưng **không thấy phản hồi gì** ngoài con số trên header đổi.

#### Vì sao chỉ lưu mã giảm giá, không lưu cả object coupon

Giỏ hàng nằm trong localStorage nhiều ngày. Nếu lưu cả object `Coupon` thì tình huống "áp mã lúc đơn 300k rồi xoá bớt hàng còn 100k" sẽ âm thầm giảm giá sai, vì dữ liệu cũ vẫn nói mã hợp lệ.

Nên store chỉ giữ `couponCode`, còn `useCoupon()` xác thực lại với `subtotal` **hiện tại** mỗi lần giỏ đổi. Query key gồm cả mã lẫn subtotal nên thay đổi giá trị đơn là tự kiểm tra lại.

#### Kiểm tra lại giỏ hàng

`CartItem` là bản chụp lúc thêm vào giỏ. Đã thêm `validateCart(items)` vào `orders.api.ts` — đặt ở lớp API vì đây đúng là thứ backend sẽ cung cấp, không phải thứ nên tính trong component. Trả về 3 loại vấn đề: hết hàng và vượt tồn (chặn đặt hàng), đổi giá (chỉ cảnh báo).

#### Mở rộng `PaymentMethod`

Thêm `'momo' | 'vnpay'` vào kiểu đã có. Đây là **thay đổi hợp đồng dữ liệu** — đã ghi chú ngay trong `src/types/order.ts` để khi viết `docs/API_CONTRACT.md` ở Giai đoạn 10 không quên khai báo cùng tập giá trị cho backend.

---

### Phiên 4 — 17/08/2026

#### Đưa toàn bộ ảnh về local (Giai đoạn 5.5, phát sinh)

Bạn nhận thấy web phụ thuộc hoàn toàn vào ảnh của bên thứ ba. Khảo sát cho thấy **121 tham chiếu ảnh** trỏ ra Unsplash và picsum, render ở 11 component. Rủi ro không phải giả định — phiên 3 đã gặp một photo ID Unsplash trả 404 phải thay tay.

#### Vì sao chọn `public/` chứ không phải `src/assets/`

Bạn nói "thư mục assets", nhưng chính yêu cầu *"path là property của sản phẩm, sau này backend trả về"* lại loại bỏ `src/assets/`:

- `src/assets/` đi qua bundler của Vite, mỗi ảnh cần một câu lệnh `import` **tĩnh**. Một chuỗi đọc từ JSON hay từ API **không resolve được**. Muốn dùng phải dựng bảng tra bằng `import.meta.glob` — và cơ chế đó sập ngay khi backend trả URL thật.
- `public/` phục vụ file nguyên trạng, nên chuỗi trong dữ liệu **chính là URL**, đúng bằng thứ backend sẽ trả về.

Đây là ví dụ điển hình của việc yêu cầu nghiệp vụ quyết định lựa chọn kỹ thuật, không phải ngược lại.

#### Vì sao gọi `imageUrl()` ở lớp API chứ không ở component

Đã cân nhắc cả hai. Nếu để component tự gọi `imageUrl(product.images[0])` thì mỗi component mới đều phải nhớ gọi, và **quên một chỗ sẽ không lộ ra lúc dev** — vì `VITE_IMAGE_BASE_URL` đang trống nên ảnh vẫn hiện bình thường. Lỗi chỉ bung ra khi deploy với CDN. Đó là loại lỗi tệ nhất.

Vì vậy resolve ngay trong `src/api/*.api.ts`, ở tầng module (một lần lúc nạp), nên **không hàm nào phải tự nhớ** và **11 component render ảnh không phải sửa một dòng nào**.

#### Việc phát sinh kèm theo

- **Logo thương hiệu**: đang là ảnh chụp ngẫu nhiên từ picsum, trông không giống logo. Đổi sang 9 SVG wordmark tự sinh (`scripts/generate-brand-logos.mjs`), mỗi file ~1 KB, dùng đúng design token.
- **`PromoBanners.tsx` đang tự chứa dữ liệu** với URL cứng — trái quy tắc "component phải câm" trong `CLAUDE.md`. Đã chuyển thành `getPromoBanners()` + `usePromoBanners()`.

#### Phép thử quyết định

Thay vì chỉ xem ảnh có hiện hay không, đã **chặn toàn bộ request ra ngoài localhost** trong trình duyệt headless rồi tải 4 trang. Kết quả: 0 ảnh hỏng, 0 ảnh còn trỏ ra ngoài. Đây mới là bằng chứng đúng cho mục tiêu của phiên.

Kiểm thêm chiều ngược lại: build với `VITE_IMAGE_BASE_URL=https://cdn.example.com` → mọi `src` tự có tiền tố CDN, chứng minh đường chuyển S3 sau này chỉ tốn một biến môi trường.

---

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

### 9. `required` chặn luôn React Hook Form

**Triệu chứng:** gửi form thanh toán để trống → **không hiện lỗi nào**, cũng không chuyển trang. Đếm `p.text-danger` và `[aria-invalid="true"]` đều ra 0.

**Quá trình tìm:** kiểm tra lần lượt — nút đúng `type="submit"` ✓, nằm trong form ✓, không bị disabled ✓, phiên bản zod/resolver/RHF tương thích ✓. Cuối cùng gắn hàm `onInvalid` vào `handleSubmit` thì thấy **nó không hề chạy** → sự kiện submit chưa từng phát ra.

**Nguyên nhân:** các `<Input>` có thuộc tính `required`. Trình duyệt chạy **validate mặc định trước**, thấy trường trống thì chặn luôn sự kiện `submit` — React Hook Form không bao giờ được gọi.

**Cách xử lý:** thêm `noValidate` vào thẻ `<form>`. Vẫn **giữ** thuộc tính `required` trên input vì trình đọc màn hình cần nó; chỉ tắt phần giao diện validate của trình duyệt.

**Ảnh hưởng rộng hơn:** `ReviewForm.tsx` (Giai đoạn 5) mắc đúng lỗi này nhưng không bị phát hiện, vì bộ kiểm thử khi đó chỉ điền **dữ liệu hợp lệ**. Đã sửa cả hai.

**Bài học:** kiểm thử form phải có ca **dữ liệu sai**, không chỉ ca hợp lệ. Và đừng trộn validate của trình duyệt với validate của thư viện — chọn một.

### 10. Đặt hàng xong bị ném về giỏ hàng trống

**Triệu chứng:** điền đủ form, bấm "Đặt hàng" → đơn được tạo, giỏ bị xoá, nhưng trang lại nhảy về `/gio-hang` thay vì trang thành công.

**Nguyên nhân:** trong `onSuccess` gọi `clearCart()` rồi mới `navigate()`. `clearCart()` làm `items.length === 0`, React render lại `CheckoutPage`, và guard `if (items.length === 0) return <Navigate to={CART} />` bắn **ngay trước khi** `navigate()` kịp có hiệu lực.

**Cách xử lý:** cờ `orderPlacedRef` để guard bỏ qua sau khi đã đặt hàng. Dùng `ref` chứ không phải `state` vì không cần render lại, và giá trị phải có hiệu lực ngay trong cùng lượt render.

**Bài học:** guard dựa trên state mà chính luồng thành công lại làm state đó rỗng thì phải có cờ phân biệt "rỗng vì chưa mua" với "rỗng vì vừa mua xong".

### 11. Quận và phường điền sẵn bị rơi mất, nhưng đơn vẫn đặt được

**Triệu chứng:** chọn một địa chỉ từ sổ ở trang thanh toán → ô tỉnh hiện đúng, nhưng **quận và phường trống trơn**. Bấm "Đặt hàng" thì đơn vẫn được tạo bình thường, kèm đúng quận đã lưu.

**Đây mới là phần nguy hiểm:** giao diện và dữ liệu nói hai điều khác nhau. Khách nhìn thấy ô trống nên tưởng chưa chọn, nhưng đơn lại được ghi với một quận họ không hề thấy mình chọn. Nếu chỉ kiểm tra "đặt hàng có thành công không" thì lỗi này lọt hoàn toàn.

**Nguyên nhân:** ba ô này dùng `register()` của React Hook Form, tức là **ô không điều khiển**. Danh sách quận chỉ tải về sau khi biết mã tỉnh, nên tại thời điểm `reset()` gán giá trị vào thẻ `<select>`, nó chưa có `<option>` nào khớp — trình duyệt **lặng lẽ bỏ qua** phép gán. Trạng thái bên trong form thì vẫn giữ giá trị, nên validate qua và đơn được tạo.

**Cách xử lý:** chuyển ba ô sang **điều khiển** (`value` + `onChange` + `setValue`). Mỗi lần danh sách quận về là React render lại và gán lại giá trị, không còn khoảng lệch.

**Bẫy thứ hai nằm ngay cạnh:** việc "đổi tỉnh thì xoá quận và phường" phải gắn vào `onChange`, **không được dùng `useEffect`** theo dõi giá trị — hiệu ứng sẽ chạy cả khi form được điền sẵn bằng `reset()` và xoá trắng đúng hai ô vừa điền.

**Bài học:** với `<select>` có danh sách nạp bất đồng bộ, luôn dùng ô điều khiển. Và khi kiểm thử form điền sẵn, phải **đọc lại giá trị hiển thị trên ô** (`inputValue()`) chứ không chỉ xem thao tác cuối có thành công hay không.

### 12. `<div>` lồng trong `<p>` ở trang cửa hàng

**Triệu chứng:** log của Vite dev server báo `In HTML, <div> cannot be a descendant of <p>` kèm cảnh báo hydration, mỗi lần trang cửa hàng ở trạng thái đang tải.

**Nguyên nhân:** `<Skeleton>` render ra một `<div>`, mà nó được đặt trong `<p className="text-sm text-ink-muted">` của dòng "Tìm thấy N sản phẩm". HTML không cho phép lồng như vậy.

Lỗi có sẵn từ Giai đoạn 5 nhưng lọt qua hai đợt kiểm thử trước, vì nó **chỉ xuất hiện trong log dev server** chứ không phải console trình duyệt — đúng loại lỗi đã gặp ở sự cố #1. Lần này bắt được nhờ bộ kiểm thử mới ghi lại cả console lẫn request hỏng.

**Cách xử lý:** đổi thẻ bọc thành `<div>`.

**Bài học:** vẫn là bài học của sự cố #1 — console trình duyệt sạch không có nghĩa là không có lỗi. Nên đọc log dev server định kỳ, không chỉ khi có sự cố.

### 13. Không thể thay ảnh, và bảng nguồn ảnh tự xoá dần

**Triệu chứng:** đổi URL ảnh trong `posts.json` rồi chạy `node scripts/download-images.mjs` → script báo "Bo qua", ảnh cũ vẫn nguyên. Không có cảnh báo nào.

**Nguyên nhân:** `fetchImage()` thấy đã có file local cùng tên thì dùng lại luôn, không quan tâm URL trong mock có đổi hay không. Nhánh này vốn để script chạy lại được nhiều lần mà không tải trùng, nhưng nó nuốt luôn ý định thay ảnh.

**Vấn đề thứ hai lộ ra khi sửa:** `docs/IMAGE-CREDITS.md` được dựng từ danh sách ảnh **còn URL từ xa trong mock**. Nhưng sau lần chạy đầu, mock đã được ghi lại thành đường dẫn local — nên mỗi lần chạy lại, bảng bị xoá bớt. Bảng đã tụt từ ~121 mục xuống còn 12. File chưa từng được commit nên phần cũ **không khôi phục được**.

**Cách xử lý:** thêm sổ `public/images/.sources.json` ghi nguồn của từng file. Nhờ nó phân biệt được hai tình huống trông giống hệt nhau:

| Tình huống | Xử lý |
|---|---|
| File tồn tại, mock giữ **cùng** URL | Lần chạy trước bị ngắt → dùng lại, không tải |
| File tồn tại, mock đổi sang URL **khác** | Cố ý thay ảnh → tải về **tên mới** (`ten-2.jpg`) |

Tên mới là bắt buộc chứ không phải tuỳ chọn: file trong `public/` không được Vite gắn hash, giữ nguyên tên thì người dùng cũ vẫn thấy ảnh cũ trong cache. Bảng nguồn nay dựng từ sổ này nên không mất nữa.

**Bài học:** một nhánh "bỏ qua cho nhanh" có thể im lặng vô hiệu hoá đúng thao tác mà công cụ sinh ra để phục vụ. Và tài liệu sinh tự động từ dữ liệu **đang biến đổi** thì phải sinh từ nguồn bền, không phải từ trạng thái nhất thời.

### 14. Ảnh sai chủ đề — lần ba, ở nhóm chưa từng được soát

**Triệu chứng:** dựng bảng đối chiếu 18 ảnh bài viết thì thấy **4 ảnh sai hoàn toàn**: bài "thực đơn eat clean" hiện chân dung một nông dân, bài "chọn thịt bò" hiện ruộng lúa, bài "đọc nhãn thực phẩm" hiện gian bếp, bài "túi vải" hiện quầy rau siêu thị.

**Điều đáng chú ý:** hai ảnh đầu **có từ Giai đoạn 2** và đã đi qua ba phiên kiểm thử. Sự cố #7 dựng bảng đối chiếu cho **42 ảnh sản phẩm** và sửa được 13 lỗi ở đó — nhưng ảnh bài viết thì chưa bao giờ được soát theo cách ấy.

**Cách xử lý:** dựng lại bảng đối chiếu, lần này cho ảnh bài viết. Sửa cả 4.

**Việc tìm ảnh thay thế tốn công ngoài dự kiến:** Unsplash nay chặn mọi cách tìm ID tự động — trang tìm kiếm render bằng JS, API trả 401, tìm qua công cụ khác trả 403. Phải chuyển sang **Openverse**, lọc riêng giấy phép **CC0 / public domain** để không phải ghi công (giống giấy phép Unsplash). Nguồn thực tế là rawpixel và Flickr.

**Còn một lỗi nữa của chính tôi trong lúc sửa:** khi chọn ảnh cho trang Giới thiệu, tôi chép nhầm URL — lấy một ảnh chưa từng xem trước (hoá ra là đàn bò) và một ảnh mình đã loại (quầy chợ Mỹ có biển hiệu tiếng Anh). Chỉ phát hiện khi chụp lại trang.

**Bài học:** phạm vi của một lần soát chỉ bằng đúng phạm vi dữ liệu đem ra soát. Soát xong ảnh sản phẩm không có nghĩa là ảnh bài viết cũng đúng. Và sau khi chọn ảnh từ một bảng ứng viên, **phải xem lại kết quả trên trang thật** — bước chép URL cũng sai được.

### 15. Ba lỗi vô hình với mắt và với chuột

Ba lỗi này tồn tại qua tám giai đoạn, đi qua sáu bộ kiểm thử, và không lần nào lộ ra — vì cả ba đều **không nhìn thấy được khi dùng chuột trên màn hình rộng**.

**a) Ô đăng ký bản tin chỉ cao 19px trên mobile.**

Ô có class `h-12` (48px) nhưng đo được 19px. Nguyên nhân: nó cũng có `flex-1`, mà form là `flex flex-col` trên mobile. Trong `flex-col`, trục chính là **chiều dọc**, nên `flex-1` đặt `flex-basis: 0%` và đè lên `h-12`. Từ `sm:` trở lên form thành `flex-row`, `flex-1` chuyển sang điều khiển chiều rộng và `h-12` lại có hiệu lực — nên chỉ hỏng ở đúng một khoảng kích thước.

Sửa: đổi `flex-1` thành `sm:flex-1`.

**b) `Drawer` và `Modal` khai `aria-modal="true"` nhưng không giam focus.**

`aria-modal` chỉ là **lời tuyên bố với trình đọc màn hình** — nó không chặn phím Tab. Mở mini-cart bằng bàn phím rồi Tab vài lần là con trỏ chạy ra các nút của trang nền đang bị lớp phủ che. Đóng xong focus rơi về đầu trang, người dùng bàn phím mất dấu hoàn toàn.

Sửa bằng hook dùng chung `useFocusTrap`: nhớ phần tử đang focus, đưa focus vào panel, vòng Tab quanh phần tử đầu ↔ cuối, trả focus lại khi đóng.

**c) Thứ tự tiêu đề nhảy cấp ở gần như mọi trang.**

Footer dùng `<h3>`, `EmptyState` dùng `<h3>`, thẻ sản phẩm và thẻ bài viết dùng `<h3>` — nhưng nhiều trang không có `<h2>` nào ở giữa, nên trình đọc màn hình thấy `<h1>` nhảy thẳng xuống `<h3>` và báo thiếu một cấp. Trang chủ còn có **hai `<h1>`** vì mỗi slide hero là một `<h1>` (và `loop` của Swiper còn nhân bản slide).

Sửa: footer và `EmptyState`/`ErrorState` lên `<h2>`; thêm tiêu đề ẩn (`sr-only`) cho `FeatureStrip`, `FilterSidebar` và các lưới thẻ; hero slider bỏ thẻ tiêu đề, trang chủ có một `<h1>` ẩn.

**Bài học chung:** ba lỗi này chỉ hiện ra khi **kiểm bằng bàn phím và bằng script đọc DOM**, không phải bằng mắt. Bộ kiểm thử từ giai đoạn trước đều thao tác bằng chuột ở 1280px, nên chúng lọt hết. Đo `getBoundingClientRect`, duyệt Tab, và đọc thứ tự thẻ tiêu đề là ba phép kiểm rẻ mà bắt được thứ mắt không thấy.

---

## Những điều chỉnh so với kế hoạch gốc

Ghi lại để hiểu vì sao code hiện tại khác đôi chỗ so với `PLAN.md` bản đầu.

### Store Zustand kéo từ Giai đoạn 6–7 lên Giai đoạn 3

`cart.store.ts`, `wishlist.store.ts`, `ui.store.ts` được làm sớm.

**Lý do:** `ProductCard` cần gọi trực tiếp `addItem()` và `toggleWishlist()`. Nếu để đúng lịch (Giai đoạn 6–7) thì ở Giai đoạn 3 phải viết `ProductCard` với prop callback tạm, rồi Giai đoạn 6 lại sửa chính component đó cùng mọi nơi dùng nó. Làm sớm rẻ hơn.

Giai đoạn 6–7 giờ chỉ còn phần **giao diện** (trang giỏ hàng, mini-cart drawer, checkout, trang tài khoản).

### Tự viết `SeoMeta` thay cho `react-helmet-async` (Phiên 8)

Kế hoạch gốc dự định dùng thư viện này ở Giai đoạn 9. Đã bỏ từ phiên 2 vì React 19 hỗ trợ document metadata sẵn. Nay hoàn tất bằng `components/ui/SeoMeta.tsx` — gom 19 khối `<title>` + `<meta>` rời rạc, thêm được Open Graph và Twitter Card mà không thêm dependency nào.

### Tự host font, khép câu hỏi treo từ phiên 4 (Phiên 8)

Kế hoạch gốc không nhắc tới font. Nhưng nguyên tắc "không phụ thuộc bên thứ ba lúc chạy" dựng ở Giai đoạn 5.5 cho ảnh thì phải áp dụng nhất quán. Sau phiên này chỉ còn iframe bản đồ là ngoại lệ, và đó là ngoại lệ đã được ghi lại.

### Đổi chữ ký `getPostCategories()` (Phiên 7)

`CLAUDE.md` cấm sửa chữ ký hàm trong `src/api/` **vì tiện cho component**. Ở đây lý do là thiết kế: sidebar cần số bài mỗi chuyên mục, URL cần slug không dấu, và backend sẽ trả về đúng dạng đó. Đổi từ `string[]` sang `PostCategory[]`.

Quan trọng: hàm này **chưa có người dùng nào** tại thời điểm đổi, nên đây là lúc rẻ nhất để làm. Kèm theo là thêm `categorySlug` vào `Post` — lọc theo tên có dấu sẽ cho URL dạng `?category=Ki%E1%BA%BFn%20th%E1%BB%A9c`.

### Bản đồ Google là ngoại lệ có chủ đích (Phiên 7)

Giai đoạn 5.5 đặt nguyên tắc không phụ thuộc bên thứ ba lúc chạy, và đã nội bộ hoá toàn bộ ảnh. Bản đồ nhúng ở trang Liên hệ đi ngược nguyên tắc đó — đây là lựa chọn của bạn, ghi lại để sau này không ai tưởng là sót.

Giảm thiệt hại bằng ba việc: `title` mô tả cho iframe, `loading="lazy"`, và luôn kèm địa chỉ dạng văn bản + link mở Google Maps. Bộ kiểm thử có riêng một nhóm tiêu chí chặn toàn bộ mạng ngoài để xác nhận trang vẫn dùng được.

### Lịch sử đơn hàng lọc nghiêm ngặt theo tài khoản (Phiên 6)

Kế hoạch gốc chỉ ghi "lịch sử đơn hàng" mà không nói đơn của khách vãng lai thì sao. Đã chốt phương án **nghiêm ngặt**: `getMyOrders()` chỉ trả về đơn có `userId` trùng tài khoản đang đăng nhập, đơn đặt lúc chưa đăng nhập không bao giờ hiện ra.

Đổi lại phải có lối thoát — empty state của trang lịch sử kèm ô tra cứu theo mã đơn. Không có nó thì đơn của khách vãng lai coi như biến mất.

### Trang chi tiết đơn hàng: bỏ, dùng lại trang đặt hàng thành công (Phiên 6)

Định làm route riêng `/tai-khoan/don-hang/:code`, nhưng nội dung sẽ trùng gần hết với `OrderSuccessPage` — trang đó vốn đã tra được theo `?code=`. Thay vào đó, mỗi dòng đơn **mở rộng ngay tại chỗ** để xem sản phẩm, địa chỉ và tổng kết, kèm link sang trang chi tiết đã có.

### Ảnh chuyển hẳn về local (Phiên 4)

Mục "Hai nguồn ảnh khác nhau" bên dưới mô tả tình trạng ở Phiên 2, **nay đã lỗi thời**: từ Phiên 4 toàn bộ ảnh nằm trong `public/images/`, không còn tải từ Unsplash hay picsum lúc chạy. Giữ lại đoạn dưới để hiểu bối cảnh cũ.

### Hai nguồn ảnh khác nhau, có lý do (lỗi thời từ Phiên 4)

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
| Sửa mini-cart | [`src/components/cart/MiniCart.tsx`](../src/components/cart/MiniCart.tsx) |
| Sửa cách tính tổng đơn / phí ship / giảm giá | [`src/hooks/useCart.ts`](../src/hooks/useCart.ts) |
| Thêm tỉnh/quận/phường | [`src/mocks/locations.json`](../src/mocks/locations.json) |
| Thêm phương thức thanh toán | `PaymentMethod` trong `src/types/order.ts` + [`paymentOptions.ts`](../src/components/cart/paymentOptions.ts) |
| Sửa logic đăng nhập / đăng ký | [`src/api/auth.api.ts`](../src/api/auth.api.ts) + [`src/hooks/useAuth.ts`](../src/hooks/useAuth.ts) |
| Sửa trạng thái đăng nhập trên giao diện | [`src/store/auth.store.ts`](../src/store/auth.store.ts) |
| Chặn/mở route cần đăng nhập | [`src/components/auth/ProtectedRoute.tsx`](../src/components/auth/ProtectedRoute.tsx) |
| Thêm mục vào menu tài khoản | [`AccountLayout.tsx`](../src/components/account/AccountLayout.tsx) + [`AccountMenu.tsx`](../src/components/layout/AccountMenu.tsx) |
| Sửa sổ địa chỉ | [`src/api/addresses.api.ts`](../src/api/addresses.api.ts) + [`useAddresses.ts`](../src/hooks/useAddresses.ts) |
| Sửa ô chọn tỉnh/quận/phường | [`src/components/form/AddressFields.tsx`](../src/components/form/AddressFields.tsx) — dùng chung cho checkout và sổ địa chỉ |
| Sửa quy tắc validate SĐT | [`src/lib/validation.ts`](../src/lib/validation.ts) — khai báo một chỗ cho cả 3 form |
| Thêm trang mới (tách chunk) | Khai báo `lazy()` ở [`src/routes/lazyPages.ts`](../src/routes/lazyPages.ts) rồi gắn vào `routes/index.tsx` |
| Sửa thẻ SEO / Open Graph | [`src/components/ui/SeoMeta.tsx`](../src/components/ui/SeoMeta.tsx) + [`src/lib/seo.ts`](../src/lib/seo.ts) |
| Đổi ảnh chia sẻ mạng xã hội | `node scripts/generate-og-image.mjs` rồi kết xuất PNG |
| Đổi font | Sửa URL trong [`scripts/download-fonts.mjs`](../scripts/download-fonts.mjs) rồi chạy lại — **nhớ giữ bộ `vietnamese`** |
| Sửa hành vi giam focus của hộp thoại | [`src/hooks/useFocusTrap.ts`](../src/hooks/useFocusTrap.ts) — dùng chung cho Drawer, Modal, MobileMenu |
| Thêm/sửa bài viết mock | [`src/mocks/posts.json`](../src/mocks/posts.json) — nội dung dùng Markdown rút gọn |
| Sửa cú pháp Markdown được hỗ trợ | [`src/components/blog/PostContent.tsx`](../src/components/blog/PostContent.tsx) |
| Sửa bộ lọc trang tin tức | [`src/hooks/usePostFilters.ts`](../src/hooks/usePostFilters.ts) |
| Sửa nội dung trang giới thiệu | [`src/mocks/about.json`](../src/mocks/about.json) — không sửa trong `AboutPage.tsx` |
| Sửa nơi nhận form liên hệ | [`src/api/contact.api.ts`](../src/api/contact.api.ts) |
| Thêm ảnh mới | Bỏ URL vào mock rồi chạy `node scripts/download-images.mjs` |
| **Thay** một ảnh đã có | Đổi URL trong mock rồi chạy lại script — nó tự tải về tên mới (`ten-2.jpg`), xem sự cố #13 |
| Chuyển ảnh sang S3/CDN | Đặt `VITE_IMAGE_BASE_URL` trong `.env` — không sửa code |
| Sửa cách dựng URL ảnh | [`src/lib/image.ts`](../src/lib/image.ts) |
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
