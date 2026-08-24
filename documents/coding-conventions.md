# Quy ước viết code — web client `app`

Đây là **luật** của sub-project. Agent đọc file này trước khi sửa bất cứ dòng nào và
**dừng lại báo PM khi gặp mâu thuẫn**, không tự ứng biến. Bản đầy đủ (nạp tự động mỗi
phiên) nằm ở [`../CLAUDE.md`](../CLAUDE.md); file này là bản rút gọn dành cho agent —
hai file phải khớp nhau, sửa một thì sửa cả hai.

Bối cảnh kiến trúc: [`architecture/01-overview.md`](architecture/01-overview.md).

---

## 1. Bốn quy tắc không được vi phạm

Vi phạm nhóm này sẽ khiến việc ghép backend Spring Boot phải sửa lại toàn bộ component.

1. **Không component nào `import` file trong `src/mocks/`.** Dữ liệu đi đúng chuỗi:
   `component` → `hooks/useXxx.ts` (TanStack Query) → `api/xxx.api.ts` → `mocks/*.json`.
2. **Không gọi `axios` ngoài `src/api/`.**
3. **Chữ ký hàm trong `src/api/` là hợp đồng với backend** — chỉ được sửa **thân hàm**,
   không đổi tên hàm, tham số hay kiểu trả về vì tiện cho component.
4. **Phân tách state:** dữ liệu server → TanStack Query; state client (giỏ hàng, wishlist,
   auth, drawer/modal) → Zustand; state của bộ lọc và phân trang → URL (`useSearchParams`).
   Không cache dữ liệu server bằng Zustand, không dùng Query cho state UI.

---

## 2. Đặt tên & ngôn ngữ

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook | `useCamelCase.ts` | `useProducts.ts` |
| Store | `name.store.ts` | `cart.store.ts` |
| API service | `name.api.ts` | `products.api.ts` |
| Type | file `name.ts`, export `interface`/`type` PascalCase | `product.ts` → `Product` |
| Hàm tiện ích | `camelCase` | `formatVND` |

- **Code (biến, hàm, comment kỹ thuật): tiếng Anh.**
- **Nội dung hiển thị cho người dùng: tiếng Việt có dấu.** Dự án **chưa i18n** — chuỗi tiếng
  Việt viết thẳng trong JSX là đúng quy ước hiện tại, không tự dựng hệ thống key.
- **Đường dẫn route: tiếng Việt không dấu**, khai ở `ROUTES` (`src/lib/constants.ts`).
  Không hardcode chuỗi route trong component.
- Import nội bộ dùng alias `@/…`, không dùng `../../..`.

---

## 3. Component

- Một file **một** component `export default`. Vượt ~200 dòng thì tách.
- Chỉ dùng function component + hooks. **Không** class component.
- Props luôn khai `interface` tường minh. **Cấm `any`** — chưa rõ kiểu thì `unknown` rồi thu hẹp.
- **Luôn tái sử dụng `src/components/ui/`** (Button, Input, Modal, Drawer, Badge, Pagination,
  Rating, Skeleton, StateBlock, SeoMeta…). Không viết lại phiên bản riêng ở chỗ khác.
- Component trong `components/` phải **"câm"**: nhận props, không tự fetch. Việc fetch thuộc
  về `pages/` hoặc hook.
- File chứa component **chỉ export component**. Hằng số / style / option tách ra file riêng
  (`buttonStyles.ts`, `paymentOptions.ts`, `lazyPages.ts`) — trộn lẫn sẽ làm React Fast Refresh
  mất tác dụng và oxlint (`react/only-export-components`) sẽ cảnh báo.
- Thêm trang mới: khai `lazy()` trong `src/routes/lazyPages.ts` rồi gắn vào `routes/index.tsx`,
  không `import` thẳng.

---

## 4. Styling

- **Chỉ Tailwind utility.** Tránh tạo file `.css` riêng trừ khi bất khả kháng.
- **Chỉ dùng design token trong `src/index.css`** — `primary`, `primary-dark`, `accent`,
  `surface`, `ink`, `ink-muted`, `line`…
  - ✅ `className="bg-primary text-white"`
  - ❌ `className="bg-[#7FAD39]"` — cấm hardcode mã màu
- **Mobile-first:** viết cho mobile trước rồi thêm `sm:` `md:` `lg:`.
- Dùng `.container-app` cho mọi section thay vì tự set `max-width`.
- Chuỗi class dài / có điều kiện gom bằng `cn()` (`src/lib/utils.ts` — clsx + tailwind-merge).
- Đổi màu thì **tính lại tương phản WCAG AA (≥ 4.5:1)** trước khi commit.

---

## 5. Dữ liệu & trạng thái hiển thị

- **Tiền tệ luôn qua `formatVND()`** (`src/lib/format.ts`). Không tự nối chuỗi `₫`.
  Giá lưu dạng **số nguyên VNĐ** (`449000`), không dấu phẩy, không thập phân.
  Giá thực tế khách trả lấy từ `effectivePrice(price, salePrice)`, phần trăm giảm từ
  `calcDiscountPercent()` — không tự tính lại.
- Ngày tháng qua `formatDate()`.
- Query key **luôn lấy từ `src/hooks/queryKeys.ts`**, không viết mảng key tại chỗ.
- Mọi hàm mock trong `src/api/` phải `await delay()`.
- **Mọi trạng thái bất đồng bộ phải xử lý đủ 3 nhánh:**
  1. `isLoading` → `Skeleton` đúng hình dạng nội dung (không spinner toàn trang)
  2. `isError` → `ErrorState` kèm nút thử lại
  3. dữ liệu rỗng → `EmptyState` có gợi ý hành động
- Validate form bằng React Hook Form + Zod. Quy tắc dùng chung (ví dụ `PHONE_PATTERN`)
  khai ở `src/lib/validation.ts`, **không** để mỗi form tự viết lại.

---

## 6. Ảnh (bắt buộc)

- Ảnh nằm trong `public/images/`, chia thư mục con theo loại (`products/<danh-mục-gốc>/`,
  `categories/`, `posts/`, `banners/`, `brands/`, `avatars/`).
- **Dữ liệu chỉ lưu đường dẫn tương đối** — `/images/rau-cu/ca-rot-huu-co-1.jpg`. Đây là
  hợp đồng với backend.
- ❌ **Cấm hardcode URL ảnh bên thứ ba** (`images.unsplash.com`, `picsum.photos`…) trong code
  hay trong mock. Cần ảnh mới thì tải về bằng `node scripts/download-images.mjs`.
- Chuyển đường dẫn thành URL bằng `imageUrl()` (`src/lib/image.ts`), **gọi ở lớp `src/api/`,
  không gọi trong component**. Quên một chỗ sẽ không lộ ra lúc dev, chỉ vỡ khi deploy với CDN.
- Thay ảnh thì **đổi luôn tên file** — file trong `public/` không được Vite gắn hash.
- Ảnh luôn có `alt` mô tả bằng tiếng Việt và `loading="lazy"` (trừ ảnh above-the-fold).

---

## 7. Khả năng tiếp cận (a11y)

- Thứ tự tiêu đề không nhảy cấp: mỗi trang một `<h1>`, section dùng `<h2>` trở xuống.
- Icon trang trí đặt `aria-hidden="true"`; nút chỉ có icon phải có `aria-label` tiếng Việt.
- Modal / Drawer phải **giam focus** (`useFocusTrap`) và đóng được bằng `Esc`.
- Không tự viết ring focus riêng — đã có `:focus-visible` dùng chung trong `src/index.css`.
- Chuyển động tôn trọng `prefers-reduced-motion`.

---

## 8. Quy trình & bằng chứng hoàn thành

> **Quy trình chung của workspace — vai trò, vòng đời ticket, rubric tự quyết, harness delta —
> nằm ở `management/pm-playbook.md`. Không chép lại ở đây.** Mục này chỉ ghi phần riêng của
> surface `app`.

**Hàng rào tối thiểu:**

- **Đường dẫn file ticket chính là spec** — xây đúng chừng đó, không hơn.
- **Chỉ chạm `projects/app`**; không sửa surface khác, hub, hay board. **Không chạy `git`** trừ khi
  được yêu cầu rõ ràng.
- Quan sát ngoài phạm vi ghi vào `Notes` để PM mở việc mới — **không âm thầm sửa kèm**.
- Shape / route / quyền của backend là hợp đồng thuộc agent `api`: báo PM, **không** nắn dữ liệu
  ở phía client cho xong việc.
- Báo cáo theo đúng [`response-format.md`](response-format.md), kèm dòng `Harness delta`.

### 8.1 Sáu tình huống phải dừng lại hỏi

Gặp một trong các trường hợp sau thì **dừng, báo PM, chờ Owner** — kể cả khi ticket có vẻ cho phép:

1. **Đổi chữ ký hàm trong `src/api/`** — đó là hợp đồng với backend, xem [`API_CONTRACT.md`](API_CONTRACT.md).
2. **Thêm thư viện ngoài stack đã chốt** (xem [`architecture/01-overview.md`](architecture/01-overview.md) §2).
3. **Đổi design token, bảng màu, hoặc font** — đã kiểm tương phản WCAG AA, đổi là phải kiểm lại.
4. **Ticket mâu thuẫn với tài liệu trong thư mục này** — tài liệu là luật, ticket có thể sai.
5. **Phát sinh câu hỏi "A hay B?"** mà hai lựa chọn cho ra hành vi khác nhau với người dùng
   (thứ tự sắp xếp mặc định, báo lỗi hay tự sửa dữ liệu sai…). Đây là quyết định sản phẩm.
6. **Xoá / đổi tên route, hoặc xoá `src/mocks/`** — có thể làm hỏng link đã chia sẻ và luồng đang chạy.

Dừng đúng lúc rẻ hơn nhiều so với làm xong rồi phải gỡ.

### 8.2 Thanh bằng chứng — đủ cả ba mới được báo xong

**Dự án chưa có test runner** — đừng báo cáo số lượng test.

1. `npm run build` xanh. **Đây mới là cổng kiểm tra thật**; `npx tsc --noEmit` không đi vào các
   tsconfig được reference nên bỏ sót lỗi, **không** dùng thay thế.
2. `npm run lint` sạch, 0 cảnh báo.
3. Hành vi quan sát được: chạy `npm run dev`, mở đúng màn hình đã sửa — ghi rõ đã bấm gì, thấy gì,
   **0 lỗi console, 0 request hỏng**. Build xanh mà màn hình trắng vẫn là hỏng.

Muốn thêm framework test (Vitest / React Testing Library) phải hỏi Owner — đó là thay đổi stack.

---

## 9. Điều cấm

- ❌ Thêm thư viện ngoài stack đã chốt — hỏi Owner trước.
- ❌ `any`, `@ts-ignore`, `// eslint-disable` để né lỗi type.
- ❌ Sửa chữ ký hàm trong `src/api/` chỉ vì tiện cho component.
- ❌ Sao chép ảnh, logo hoặc nội dung văn bản từ site mẫu (bản quyền) — chỉ tham khảo bố cục.
- ❌ Commit file `.env`.
- ❌ Để sót `console.log` trong code hoàn thiện.

---

*Cập nhật lần cuối: 2026-08-24 — giữ mốc này đúng trong chính lần sửa nội dung.*
