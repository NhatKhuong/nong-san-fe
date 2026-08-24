# Kiến trúc — Tổng quan

Web client `projects/app` — cửa hàng thương mại điện tử **Nông Sản Sạch** (nông sản
sạch / thực phẩm hữu cơ). Agent sở hữu surface này đọc file này **trước tiên**;
gặp mâu thuẫn giữa tài liệu và code thì **dừng lại và báo PM**, không tự ứng biến.

Tài liệu chi tiết nằm trong chính sub-project:

| File | Vai trò |
|---|---|
| [`../../CLAUDE.md`](../../CLAUDE.md) | Bộ quy tắc nạp tự động mỗi phiên — bản đầy đủ của [`../coding-conventions.md`](../coding-conventions.md) |
| [`API_CONTRACT.md`](../API_CONTRACT.md) | Hợp đồng API dùng để tích hợp với backend system |
| [Swagger UI](http://localhost:8080/swagger-ui/index.html) | Tài liệu API backend cung cấp theo hợp đồng ở [`API_CONTRACT.md`](../API_CONTRACT.md) — chỉ có khi backend đang chạy |
| [`coding-conventions.md`](../coding-conventions.md) | Luật viết code; **§8** là cách thức làm việc với board ở `management/` |

---

## 1. Trạng thái hiện tại

- Đã hoàn thành giao diện dành cho người dùng.
- **Khu quản trị `/quan-tri` — đã xong giai đoạn 1** (backlog 0002–0008). `AdminLayout` + sidebar
  4 mục + 8 route, cả bốn màn đều có nội dung thật: **Tổng quan** (4 ô chỉ số + 2 biểu đồ Recharts)
  · **Sản phẩm** (CRUD đầy đủ) · **Đơn hàng** (xem + đổi trạng thái) · **Khách hàng** (chỉ đọc).
  Hợp đồng nội bộ chốt tại backlog 0003: **không ticket nào được sửa** `hooks/queryKeys.ts`,
  `types/admin.ts`, `lib/constants.ts` nữa.
- **Giai đoạn kế tiếp — ghép Spring Boot:** hợp đồng [`API_CONTRACT.md`](../API_CONTRACT.md) đã viết
  xong, kể cả §B.12 cho `/admin/**`; còn lại là bổ sung refresh token, bật proxy dev, đổi thân hàm
  trong `src/api/` từ mock sang HTTP thật, và xoá ba store mock (`productStore` · `orderStore` ·
  `readPublicUsers`).
- **Backend chưa tồn tại.** Mọi dữ liệu đến từ `src/mocks/*.json`, đọc qua lớp `src/api/`.
- Quy mô: 28 page · 87 component · 19 file trong `src/api/` (16 service + 3 store mock) · 22 hook ·
  4 store · 13 nhóm type · 10 file mock.
  > Con số ở dòng trên lệch dần qua từng ticket vì không có gì buộc ai đếm lại. Đếm bằng lệnh chứ
  > đừng sửa theo trí nhớ: `find src/pages -name '*.tsx' | wc -l` · `find src/components -name '*.tsx' | wc -l`
  > · `ls src/api/*.ts | wc -l` · `ls src/hooks/*.ts | wc -l`.

---

## 2. Tech stack (đã chốt — không tự ý đổi, muốn thêm thư viện phải hỏi Owner)

| Nhóm | Công nghệ |
|---|---|
| Build | Vite 8 · React 19 · TypeScript 6 (`strict`, project references) |
| Styling | Tailwind CSS v4 — token khai báo bằng `@theme` trong `src/index.css` |
| Routing | React Router v7 (`createBrowserRouter`) |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 (+ middleware `persist`) |
| HTTP | Axios (instance dùng chung `src/api/client.ts`) |
| Form | React Hook Form + Zod (`@hookform/resolvers`) |
| Slider | Swiper |
| Biểu đồ | Recharts v3 — **chỉ** trong `src/components/admin/dashboard/`, chỉ `pages/admin/AdminOverviewPage.tsx` import ([ADR 0003](../../../management/decisions/0003-them-recharts-vao-stack.md)) |
| Icon | lucide-react |
| Lint | oxlint (`.oxlintrc.json`) |

Alias `@/*` → `src/*`, khai báo song song ở `vite.config.ts` và `tsconfig.app.json`.

---

## 3. Hình dạng hệ thống — luồng dữ liệu một chiều

```
component (câm, nhận props)
   ↓
pages/*.tsx  hoặc  hooks/useXxx.ts        ← nơi DUY NHẤT được fetch
   ↓  TanStack Query (queryKey lấy từ hooks/queryKeys.ts)
src/api/*.api.ts                          ← ĐIỂM CHUYỂN ĐỔI khi ghép Spring Boot
   ↓  hiện tại: đọc mock + delay()        ↓  sau này: client.get(...)
src/mocks/*.json                             backend Spring Boot
```

**Đây là quy tắc kiến trúc quan trọng nhất của dự án.** Vi phạm sẽ khiến việc ghép
backend phải sửa lại toàn bộ component:

- Component **tuyệt đối không** `import` file trong `src/mocks/`.
- Component **tuyệt đối không** gọi `axios` trực tiếp — chỉ `src/api/` được phép.
- **Chữ ký hàm trong `src/api/` là hợp đồng với backend.** Khi ghép Spring Boot chỉ
  được sửa **thân hàm**; không đổi tên hàm, tham số hay kiểu trả về.
- Mỗi hàm mock phải `await delay()` (`src/lib/utils.ts`) để lộ sớm lỗi loading state.

### Các lớp

| Lớp | Thư mục | Trách nhiệm |
|---|---|---|
| Route | `src/routes/` | `index.tsx` khai báo hai cây route; `lazyPages.ts` / `adminLazyPages.ts` khai báo chunk tách theo trang; `adminRoutes.tsx` là cây của khu quản trị (§5.2) |
| Page | `src/pages/` | Map 1-1 với route, là nơi gọi hook và ghép component |
| Component | `src/components/` | `ui/` (dùng chung) · `layout/` · `admin/` · `home/` · `product/` · `filter/` · `cart/` · `account/` · `auth/` · `blog/` · `form/` |
| Hook | `src/hooks/` | Wrapper TanStack Query theo domain + hook UI (`useDebounce`, `useFocusTrap`, `useMediaQuery`) + hook đọc/ghi filter trên URL |
| API | `src/api/` | Service theo domain + `client.ts` (axios instance, JWT, xử lý 401) |
| Store | `src/store/` | `cart` · `wishlist` · `auth` · `ui` — Zustand, ba store đầu `persist` vào localStorage |
| Type | `src/types/` | Nguồn chân lý về kiểu, phải khớp DTO backend; re-export gọn qua `index.ts` |
| Lib | `src/lib/` | `format` (tiền/ngày) · `image` · `seo` · `utils` (`cn`, `delay`, `slugify`) · `constants` (ROUTES…) · `validation` |
| Mock | `src/mocks/` | Dữ liệu giả — **xoá sau khi có backend** |

---

## 4. Phân tách state (bắt buộc)

| Loại dữ liệu | Công cụ | Ví dụ |
|---|---|---|
| Dữ liệu server | **TanStack Query** | sản phẩm, danh mục, bài viết, đơn hàng, đánh giá, địa chỉ hành chính |
| State phía client | **Zustand** | giỏ hàng, wishlist, phiên đăng nhập, mở/đóng drawer & modal |
| State của URL | **`useSearchParams`** | bộ lọc + phân trang trang cửa hàng (`useProductFilters`), trang tin tức (`usePostFilters`) |
| State cục bộ | `useState` | mọi thứ chỉ một component quan tâm |

**Không** dùng Zustand để cache dữ liệu server; **không** dùng Query cho state UI.

Cấu hình Query mặc định ở `src/main.tsx`: `staleTime` 5 phút, `refetchOnWindowFocus: false`,
`retry: 1`. Query key tập trung ở `src/hooks/queryKeys.ts` — **không viết mảng key tại chỗ**,
lệch một chuỗi là invalidate cache trượt.

Hai ranh giới đáng nhớ:

- `cart.store` chỉ lưu **mã** giảm giá chứ không lưu object `Coupon` — giỏ nằm trong
  localStorage nhiều ngày nên mã phải được `useCoupon` xác thực lại theo giá trị đơn hiện tại.
- `auth.store` chỉ **cache** thông tin người dùng để hiển thị ngay khi mở lại trang. Nguồn
  chân lý của phiên đăng nhập là token trong `client.ts`; mất token thì bản cache bị bỏ.

---

## 5. Routing

- Đường dẫn khai báo tập trung tại `ROUTES` trong `src/lib/constants.ts` — **không hardcode
  chuỗi route** rải rác. Path là **tiếng Việt không dấu**: `/cua-hang`, `/san-pham/:slug`,
  `/gio-hang`, `/thanh-toan`, `/tai-khoan`, `/yeu-thich`, `/tin-tuc`, `/gioi-thieu`, `/lien-he`,
  `/quan-tri`.

### 5.1 Storefront

- `MainLayout` là route cha (header + footer + `<Suspense>`), `ErrorPage` là `errorElement`.
  **Không** dùng `NotFoundPage` làm `errorElement` — mọi lỗi runtime sẽ hiện thành "404" sai lệch.
- `HomePage`, `ErrorPage`, `NotFoundPage` nạp thẳng; **mọi trang còn lại lazy** và phải được
  khai báo trong `src/routes/lazyPages.ts` (thêm trang mới nhớ khai ở đây).
- `/tai-khoan/*` bọc trong `ProtectedRoute` → `AccountLayout`. `/yeu-thich` **cố ý** không bảo vệ:
  thẻ sản phẩm cho bấm tim mà không cần đăng nhập, chặn trang xem lại sẽ mâu thuẫn.

### 5.2 Khu quản trị — mục top-level thứ hai

`createBrowserRouter` có **hai** mục top-level, không phải một. Khu quản trị là mục thứ hai,
**sibling** với `MainLayout`, khai ở `src/routes/adminRoutes.tsx` (`adminRoute`) với chunk riêng ở
`src/routes/adminLazyPages.ts`.

Lý do nó không lồng dưới `MainLayout`: layout đó render `Header`/`Footer`/`TopBar`/`MiniCart`
**vô điều kiện** và không có prop, context hay `handle` nào để tắt. Phương án thêm cờ
`bare`/`hideChrome` đã bị loại — xem [ADR 0001](../../../management/decisions/0001-khu-quan-tri-nam-trong-app.md)
cho cả ba phương án đã cân nhắc.

Bốn điều bắt buộc nhớ khi sửa cây route này:

- **Child `{ path: '*', element: <NotFoundPage /> }` cuối cây admin là BẮT BUỘC.** Thiếu nó thì
  `/quan-tri/duong-dan-sai` rơi xuống splat của storefront và render 404 kèm nguyên header/footer
  cửa hàng — sai mà nhìn thoáng qua tưởng đúng.
- **`<Suspense>` bọc ngoài cũng bắt buộc**, vì `AdminRoute` và `AdminLayout` đều lazy và ở mục
  top-level không còn layout nào đứng trên cung cấp khung chờ. Khung chờ thứ hai nằm trong
  `AdminLayout` quanh `<Outlet />` để sidebar không nháy khi chuyển trang.
- `AdminRoute` chặn theo `isAdmin`: chưa đăng nhập → `/dang-nhap` (kèm `state.from`), đã đăng nhập
  nhưng sai vai trò → `/` (đăng nhập lại không đổi được vai trò). **Đây không phải bảo mật** —
  hàng rào thật là filter Spring Security trên `/admin/**`, xem `API_CONTRACT.md` §C.4.3a.
- Hằng số menu nằm ở `components/admin/adminNav.ts`, **không** trong file component.

Hợp đồng nội bộ đã chốt ở backlog 0003: 8 route + 3 helper trong `lib/constants.ts`,
`types/admin.ts`, `ProductPayload`, khối `queryKeys.admin.*`, `lib/orderStatus.ts`,
`LOW_STOCK_THRESHOLD`. Ticket 0004–0007 dùng lại, **không sửa**.

---

## 6. Styling & design token

- Chỉ dùng Tailwind utility. Token là **nguồn chân lý duy nhất** về màu và font, khai báo
  bằng `@theme` trong `src/index.css`: `primary` `#4a7c2a`, `primary-dark`, `primary-light`,
  `primary-soft`, `accent` `#c2410c`, `accent-dark`, `accent-soft`, `surface`, `surface-alt`,
  `ink`, `ink-muted`, `ink-light`, `line`, `success`, `danger`; font `--font-heading` (Quicksand)
  và `--font-sans` (Inter); `--radius-card`.
- **Mọi màu chữ đã được kiểm WCAG AA (≥ 4.5:1).** Đổi màu thì tính lại tương phản trước khi commit.
- `.container-app` (`@layer components`) dùng cho mọi section — không tự set `max-width` lẻ.
- Ring focus dùng chung khai ở `:focus-visible` trong `@layer base`, áp cho **mọi** phần tử
  tương tác. Không tự viết ring riêng cho từng component.
- Font **tự host** trong `public/fonts` (`scripts/download-fonts.mjs` sinh `src/styles/fonts.css`
  — không sửa tay). Hai file dùng ở màn hình đầu được preload trong `index.html`.

---

## 7. Ảnh, SEO và biến môi trường

- Ảnh nằm trong `public/images/`, chia thư mục con theo loại. **Dữ liệu chỉ lưu đường dẫn
  tương đối** (`/images/rau-cu/ca-rot-huu-co-1.jpg`) — đây là hợp đồng với backend.
- `imageUrl()` (`src/lib/image.ts`) được gọi **ở lớp `src/api/`**, không gọi trong component:
  quên một chỗ sẽ không lộ ra lúc dev (base đang trống), chỉ vỡ khi deploy với CDN.
- SEO: React 19 tự nhấc `<title>`/`<meta>` lên `<head>` nên **không dùng thư viện SEO**. Mọi
  trang dùng chung `components/ui/SeoMeta.tsx`; `absoluteUrl()` trả `null` khi thiếu
  `VITE_SITE_URL` và thẻ `og:image` bị bỏ hẳn — thà không có thẻ còn hơn một thẻ sai.

| Biến (`.env.example`) | Ý nghĩa |
|---|---|
| `VITE_API_BASE_URL` | Gốc API Spring Boot; trống → axios dùng `/api` qua proxy dev |
| `VITE_IMAGE_BASE_URL` | Gốc CDN ảnh; trống → phục vụ từ `public/` |
| `VITE_SITE_URL` | Gốc site, dùng dựng URL tuyệt đối cho `og:image` |

---

## 8. Đường ghép Spring Boot

Mọi thứ đã được dựng để bước này chỉ chạm vào một lớp:

1. [`../API_CONTRACT.md`](../API_CONTRACT.md) là đầu bài bàn giao và là mốc đối chiếu khi ghép —
   đọc trước khi sửa dòng nào trong `src/api/`.
2. `src/api/client.ts` đã sẵn base URL, timeout 15s, interceptor gắn `Authorization: Bearer`
   và xử lý 401 → xoá token, đưa về `/dang-nhap`. **Còn thiếu: refresh token** và
   `src/lib/apiError.ts` mà hợp đồng có nhắc tới.
3. Khối `proxy` trong `vite.config.ts` đã viết sẵn, đang comment — bỏ comment khi backend chạy.
4. Đổi thân từng hàm trong `src/api/*.api.ts` sang `client.get/post(...)`, **giữ nguyên chữ ký**.
5. Xoá `src/mocks/` và các `delay()` khi không còn hàm mock nào.

Ranh giới hiện đang giả lập ở client và **sẽ phải chuyển về server**: phân trang / lọc /
sắp xếp sản phẩm, xác thực mã giảm giá, tính phí vận chuyển, kiểm tra tồn kho giỏ hàng,
và tài khoản demo được gieo vào localStorage (`nss_mock_users`).

---

## 9. Cổng kiểm tra

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc -b + vite build — CỔNG THẬT, phải xanh trước khi coi là xong
npm run lint     # oxlint
```

- **`npm run build` mới là cổng kiểm tra.** `npx tsc --noEmit` không đi vào các tsconfig được
  reference nên bỏ sót lỗi — đừng dùng nó thay thế.
- **Dự án chưa có test runner.** Bằng chứng hoàn thành = build xanh + lint sạch + kiểm thử
  trình duyệt thật (0 lỗi console, 0 request hỏng). Thêm test framework phải hỏi Owner trước.
- Ngân sách bundle: chunk chính **426,38 KB (gzip 133,13 KB), 75 chunk** — mốc sau backlog 0007.
  Diễn biến: 423,11 KB / 49 chunk (trước khu quản trị) → 426,76 KB / 62 chunk (0003) →
  427,11 KB / 66 chunk (0004) → 427,43 KB / 73 chunk (trước 0007) → 426,38 KB / 75 chunk (0007).
  Vượt ngưỡng cảnh báo 500 KB của Vite là tín hiệu phải xử lý, không phải bỏ qua. Khu quản trị nằm
  gần trọn trong chunk riêng — phần chạm vào chunk chính chỉ là `adminRoutes.tsx` (khai báo cây
  route, `import` tĩnh từ `routes/index.tsx`).
- **Recharts nằm ngoài chunk chính, và đó là điều kiện của [ADR 0003](../../../management/decisions/0003-them-recharts-vao-stack.md).**
  Thư viện đi trọn vào chunk của `AdminOverviewPage` (**383,16 KB / gzip 110,48 KB**) vì đó là
  module duy nhất import nó, mà trang đó đã `lazy()`. Phép kiểm khi đóng bất kỳ ticket nào chạm
  tới biểu đồ: `grep -l recharts dist/assets/*.js` phải trả về **đúng một** file, và file đó
  **không** được là entry chunk mà `dist/index.html` trỏ tới. Mất điều kiện ấy thì mọi khách hàng
  tải thêm ~110 KB gzip cho một màn họ không bao giờ mở.
- Phụ thuộc mạng ngoài **duy nhất và có chủ đích**: iframe Google Maps ở trang Liên hệ.

---

*Cập nhật lần cuối: 2026-08-24 — giữ mốc này đúng trong chính lần sửa nội dung.*
