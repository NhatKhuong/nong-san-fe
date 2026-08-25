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
- Thêm trang mới: khai `lazy()` rồi gắn vào cây route, **không `import` thẳng**. Có **hai** cây,
  chọn đúng cây:
  - **Trang storefront** → `src/routes/lazyPages.ts` + `src/routes/index.tsx`
  - **Trang quản trị** → `src/routes/adminLazyPages.ts` + `src/routes/adminRoutes.tsx`

  Đừng thêm route quản trị vào cây storefront: nó sẽ kéo theo header/footer/mini-cart của cửa hàng
  (xem `architecture/01-overview.md` §5.2).

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

### 5.1 Gieo dữ liệu mock vào localStorage (bắt buộc)

Mọi hàm đọc một khoá mock trong localStorage (`nss_mock_users`, `nss_mock_orders`,
`nss_mock_addresses`, `nss_mock_contact_messages`…) phải theo đúng bốn bước:

> **đọc → chuẩn hoá → bảo đảm → ghi lại**
>
> 1. parse những gì đang có (hỏng thì coi như rỗng)
> 2. **backfill** trường mới cho bản ghi cũ, mặc định về giá trị **ít quyền / ít rủi ro nhất**
> 3. bảo đảm các bản ghi gieo sẵn có mặt — đối chiếu theo **cả `id` lẫn khoá tự nhiên** (email…)
> 4. chỉ ghi lại khi thật sự có gì đó thay đổi

**Cấm kiểu "gieo khi khoá vắng mặt".** Nó luôn đúng trên máy sạch và luôn sai trên máy của
người đã chạy dự án — tức là sai đúng ở chỗ không ai test. Khoá đã tồn tại thì bản ghi cũ
vĩnh viễn thiếu trường mới, và dữ liệu gieo mới không bao giờ tới được máy đó.

Với state đi qua `persist` của Zustand thì dùng `version` + `migrate` (xem `store/auth.store.ts`),
**không** ép đăng xuất: `migrate` mặc định về quyền thấp nhất và không đá người đang làm việc dở
ra ngoài. Hàm `migrate` phải **idempotent**.

> **Reload toàn trang chạy lại `onRehydrateStorage`; điều hướng trong router thì không.**
>
> Đổi một `window.location.href` thành `navigate()` **không bao giờ là thay đổi trung tính**: nó
> bỏ luôn mọi logic khởi động mà lần reload vẫn âm thầm chạy hộ. Bài học từ backlog 0010 —
> `clearSession()` xoá token nhưng bản cache `user` của Zustand chỉ được dọn bởi
> `onRehydrateStorage`, thứ chỉ chạy khi tải lại trang. Bỏ reload đi thì `selectIsAuthenticated`
> vẫn báo "đang đăng nhập", `LoginPage` đá người dùng ngược lại trang cũ, và **không có lỗi nào
> nổ ra**. Ai đổi kiểu điều hướng thì phải tự hỏi *"lần reload này đang dọn hộ những gì?"* rồi
> nói ra tường minh — **ở nơi sở hữu dữ liệu**, không phải trong một layout: mỗi cây router
> top-level là một chỗ dễ bỏ sót (`/quan-tri` không đi qua `MainLayout`, xem ADR 0001).

**Ticket nào đổi shape của một type dùng chung thì phần Verify bắt buộc có một điểm kiểm
"dữ liệu localStorage cũ"**: ghi tay một bản ghi theo shape cũ, tải lại trang, và chứng minh
người đang đăng nhập không bị văng ra. Xem `management/backlog/0002-*` làm mẫu.

### 5.2 Ghi đè lên mock tĩnh — overlay, và MỘT điểm đọc duy nhất (bắt buộc)

Khi một màn quản trị cần **sửa** dữ liệu vốn nằm trong `src/mocks/*.json` tĩnh:

**1. Dùng overlay, không chụp cả danh sách.**

```ts
interface Overlay<T> {
  created: T[]                       // id = Date.now()
  updated: Record<string, Partial<T>>
  deletedIds: number[]               // xoá MỀM
}
```

File `*.json` là **seed và sẽ còn lớn tiếp**. Ai chụp cả danh sách xuống localStorage sẽ đóng
băng nó — máy đó không bao giờ thấy bản ghi seed mới nữa. Overlay cho seed chảy qua và chỉ ghim
đúng thứ người dùng đã sửa.

**2. Mỗi tập mock có đúng MỘT điểm đọc, và mọi `*.api.ts` phải đi qua nó.**

Mẫu đã dựng: `src/api/productStore.ts` → `readAllProducts()`. Sau ticket 0004, `products.json`
chỉ còn được `import` ở **một** file duy nhất; `products.api.ts`, `categories.api.ts` và
`orders.api.ts` đều gọi `readAllProducts()`.

> **Vì sao đây là luật chứ không phải gợi ý:** trước 0004, `validateCart()` trong `orders.api.ts`
> và `productCount` trong `categories.api.ts` đọc thẳng `products.json`. Nếu chỉ vá file API
> chính, sản phẩm admin tạo ra sẽ **có trong catalog nhưng không thêm được vào giỏ** — build
> xanh, lint sạch, màn hình đúng, console im. Chỉ vỡ khi có người thật bấm mua.
>
> Trước khi đóng một ticket có ghi dữ liệu mock, chạy `grep -rn "mocks/<tên>.json" src/` và
> chứng minh **chỉ còn một kết quả**.

**3. Store không phải là hợp đồng.** Đặt tên `xxxStore.ts`, **không** phải `xxx.api.ts` — nó bị
xoá khi ghép backend. Ghi điều đó ở đầu file và ở §E.4 của `API_CONTRACT.md`.

**4. `imageUrl()` chạy đúng một lần mỗi object.** Lưu **đường dẫn tương đối** xuống store; ghép
base lúc đọc. Trộn patch thì chỉ map `patch.images` khi patch thật sự có `images`. Map hai lần
**vô hình lúc dev** (base rỗng) và chỉ nổ khi bật CDN.

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

**Ticket nào có "KHÔNG được xuất hiện X" trong phần Verify thì bằng chứng phải là một khẳng định
phủ định kiểm được, không phải "màn hình nhìn đúng".** Các lỗi nguy hiểm nhất đều **trông giống
thành công**: có trang, có tiêu đề, không lỗi console. Phải kiểm thẳng thứ đáng lẽ vắng mặt:

| Yêu cầu | Bằng chứng đạt | Bằng chứng KHÔNG đạt |
|---|---|---|
| Không có chrome cửa hàng | `document.querySelector('footer') === null` | "nhìn không thấy footer" |
| Customer bị đá về trang chủ | `location.pathname === '/'` | "bị chuyển hướng" (về `/dang-nhap` cũng là chuyển hướng) |
| 404 nằm trong layout quản trị | 404 hiện **và** sidebar quản trị vẫn còn | "hiện trang 404" |

Bài học từ backlog 0003: ticket đã viết sẵn cả ba yêu cầu phủ định, nhưng thanh bằng chứng lúc đó
không đòi phải chứng minh chúng — nên "gần đúng" và "đúng" nhìn giống hệt nhau.

**Ticket nào có form ghi dữ liệu thì bắt buộc kiểm thêm: submit với MỌI ô tuỳ chọn để TRỐNG.**

Đó là đường đi mặc định của người dùng thật, và là đường **duy nhất** `setValueAs` / `valueAsNumber`
gặp giá trị `null`. Bài học từ backlog 0004: `setValueAs` chạy cả trên **giá trị mặc định** lúc
`register`, nên `Number(null)` biến "không có giá khuyến mãi" thành `0` và form từ chối lưu với
thông báo vô nghĩa. **Build xanh, lint sạch, màn hình đẹp, console im — mà bấm Lưu thì không lưu
được.** Không có phép thử nào trong ba mức trên bắt được nó.

**Lưu ý về nhánh `isError` ở lớp mock:** mock **không phát request nào**, nên "chặn mạng để xem
ErrorState" là bất khả thi. Chứng minh nhánh lỗi bằng cách gọi với dữ liệu không tồn tại
(ví dụ `/quan-tri/san-pham/999999/chinh-sua`), không phải bằng DevTools offline.

**Khẳng định phải nhắm vào đúng node chứa kết quả, KHÔNG dùng `body.innerText`.**

```js
// ❌ đúng ngay lập tức, trước cả khi bấm nút — vì "Đã xác nhận" nằm sẵn trong <option>
await waitFor(() => document.body.innerText.includes('Đã xác nhận'))

// ✅ nhắm vào chính node hiển thị kết quả
await waitFor(() => document.querySelector('span.rounded-full')?.textContent === 'Đã xác nhận')
```

Bài học từ backlog 0005: lượt smoke đầu **passed trong khi không chứng minh gì**. Giao diện nào
cũng chứa sẵn nhãn của **mọi** trạng thái trong các control của nó (`<option>`, `<select>`, menu),
nên `body.innerText` gần như luôn khớp **trước khi hành động xảy ra**. Nó chỉ lộ ra vì agent đọc
thêm `localStorage` và thấy overlay còn rỗng.

Với thao tác ghi, cách chắc chắn nhất là kiểm **cả hai**: node hiển thị **và** dữ liệu đã ghi
xuống (`localStorage`, hoặc gọi lại hàm đọc).

**Biến thể nguy hiểm hơn — "X đã biến mất" khớp với trạng thái loading y hệt trạng thái kết quả.**

```js
// ❌ passed cả khi vẫn đang loading — nhánh Skeleton cũng không có <table>
await waitFor(() => document.querySelector('main table') === null)

// ✅ chờ chính node NÓI RA kết quả
await waitFor(() => document.querySelector('main h2')?.textContent === 'Không có khách hàng nào khớp')
```

Bài học từ backlog 0006. Đây là biến thể "trạng thái trung gian" của cùng cái bẫy, và nó tấn công
**cả những màn không có `<option>` nào** — tức là mọi màn. Vì mọi trạng thái bất đồng bộ đều phải
có đủ ba nhánh loading / error / empty (§5), **sự vắng mặt của một thứ không bao giờ phân biệt
được ba nhánh đó**. Luôn chờ node khẳng định kết quả, đừng chờ sự vắng mặt của thứ trước đó.

**Biến thể thứ ba — placeholder luôn có nội dung.**

```jsx
// component:  title={user ? user.fullName : 'Chi tiết khách hàng'}

// ❌ passed lúc còn loading — placeholder cũng là "có nội dung"
await waitFor(() => document.querySelector('main h1')?.textContent.length > 0)

// ✅ so với chính giá trị mong đợi
await waitFor(() => document.querySelector('main h1')?.textContent === 'Lê Thị Bích')
```

Bài học từ backlog 0008. Quy tắc chung: **component nào viết `x ? a : placeholder` thì khẳng định
phải so với `a`, không phải "có nội dung"** — placeholder sinh ra chính là để luôn có nội dung.

---

Ba biến thể trên cùng một gốc: **node tồn tại ≠ node nói ra kết quả.** Cái bẫy lần lượt nấp trong
`<option>` (0005), trong sự vắng mặt (0006), rồi trong giá trị mặc định của một prop (0008). Đừng
coi ba ví dụ này là danh sách đầy đủ — hãy hỏi *"khẳng định này có đúng trước khi hành động xảy ra
không?"*. Nếu có, nó không chứng minh gì.

**Biến thể thứ tư, và nó ở tầng khác: thư viện hiển thị có quyền không vẽ gì cho một giá trị hợp lệ.**

Ba biến thể trên nói về *khẳng định sai chỗ*. Cái này nói về **khoảng cách giữa dữ liệu và pixel** —
không khẳng định nào ở tầng dữ liệu bắt được nó. Bài học từ backlog 0007: dữ liệu đúng, hợp đồng
đúng, zero-fill đúng — và Recharts vẫn **không vẽ gì** cho `count: 0`, nên biểu đồ 5 trạng thái chỉ
hiện 1 cột.

Hai quy tắc rút ra:

1. **Đếm phần tử đã render, và đếm ở khoảng dữ liệu NGHÈO NHẤT.** Khoảng dữ liệu giàu làm mọi biểu
   đồ trông đúng. Ở 0007, khoảng 30 ngày (cả 5 trạng thái đều khác 0) pass sạch; chỉ khoảng 7 ngày
   mới lộ ra lỗi.
2. **Ảnh chụp ở bề rộng nhỏ nhất là bằng chứng không thay thế được.** Cũng ở 0007, 5 nhãn tiếng Việt
   dài chồng lên nhau thành dải chữ không đọc được ở 375px — **DOM hoàn toàn hợp lệ, mọi phép đếm
   đều pass**. Chỉ ảnh mới bắt được. Kiểm DOM và xem ảnh là hai loại bằng chứng khác nhau, không
   loại nào thay được loại nào.

**Biến thể thứ năm, ở tầng dưới cùng: công cụ QA có thể chạy trong ISOLATED WORLD.**

Bốn biến thể trên nói về *khẳng định sai chỗ*. Cái này nói về **việc bạn đang nói chuyện với một
bản sao** — khẳng định đúng đến mấy cũng không cứu được.

Công cụ tự động hoá trình duyệt (patchright, và Playwright khi dùng `addInitScript` / world riêng)
chạy `page.evaluate` trong một world tách biệt với trang. Trong world đó:

| Dùng chung với trang | KHÔNG dùng chung |
|---|---|
| `document`, DOM, `localStorage`, `location`, `history` | `window.<thuộc tính tự đặt>` |
| | **`await import('/src/...')` — tạo BẢN SAO module, state cấp module là của riêng nó** |

Hậu quả rất khó đoán ra: một listener đăng ký ở cấp module trong ứng dụng sẽ **không bao giờ**
nhận được sự kiện do probe của bạn phát ra, vì hai bên đang giữ hai instance khác nhau của cùng
một file. Bài học từ backlog 0010: mất bốn lượt chạy để phát hiện "listener của `MainLayout`
không chạy" là ảo giác của công cụ, còn bug thật thì nằm chỗ khác hẳn.

Hai quy tắc:

1. **Muốn chạm đúng instance mà ứng dụng đang dùng thì phải chạy trong main world** —
   `page.addScriptTag({ type: 'module', content: … })` chèn `<script>` vào chính trang.
2. **Truyền kết quả ra ngoài bằng DOM**, thứ duy nhất hai world cùng thấy — ghi vào
   `textContent` của một node rồi đọc lại. Đừng dùng `window.__ketQua`; nó sẽ luôn `undefined`
   và trông y hệt "code không chạy".

Dấu hiệu nhận biết: probe báo sự kiện đã phát, `document`/`localStorage` đổi đúng như mong đợi,
nhưng **phần ứng dụng đáng lẽ phản ứng lại thì im lặng** — và im lặng không kèm một lỗi nào.

### Hai cái bẫy ở tầng selector — cùng một bệnh: phép thử xanh mà không chứng minh gì

Năm biến thể trên nói về *khẳng định sai chỗ* và *bản sao module*. Hai cái dưới đây ở tầng thấp
hơn nữa: **selector trúng một node có thật, chỉ là không phải node bạn nghĩ.** Cả hai đều đã làm
mất nhiều lượt chạy thật (backlog 0011), nên chúng là luật chứ không phải mẹo.

**1. Neo mọi selector vào `main` (hoặc một node gốc xác định). Đừng bao giờ để `document` trần.**

Chrome dùng chung của trang chứa phần tử **cùng dạng** với thứ bạn đang nhắm. Cụ thể ở dự án này:
`SearchBox` trong header **cũng là một `<form>`**, và nó đứng **trước** trong DOM.

```js
// ❌ trúng nút tìm kiếm ở header — nút chỉ có icon, không chữ
document.querySelector('form button[type="submit"]')

// ✅ neo vào vùng nội dung
document.querySelector('main form button[type="submit"]')
```

**Dấu hiệu nhận biết là phần đắt nhất, nhớ kỹ nó:** bạn bấm nút và **không có request nào được
phát, không lỗi console, không thông điệp validate nào hiện ra**. Nó trông y hệt "form từ chối
submit" hoặc "zod chặn ở đâu đó", nên bạn sẽ đi soi validation — sai hướng hoàn toàn. Cách làm nó
lộ ra trong một lượt: **in `textContent` của chính node vừa bấm**. Nút thật ghi "Đăng ký"; nút bạn
vừa bấm trả về chuỗi rỗng.

**2. Không đọc lỗi của một ô nhập qua `aria-describedby`. Đọc thẳng `#${id}-error`.**

`components/ui/Input.tsx` cho `aria-describedby` trỏ sang node **hint** (`${id}-hint`) khi ô
**không** có lỗi, và chỉ trỏ sang `${id}-error` khi có. Nghĩa là "ô này có nội dung mô tả" đúng
**ngay từ lúc trang vừa mở**.

```js
// ❌ khi chưa có lỗi, cái này trả về chuỗi hint — luôn "có nội dung"
document.getElementById(input.getAttribute('aria-describedby'))?.textContent

// ✅ chỉ tồn tại khi ô thật sự có lỗi
document.getElementById(input.id + '-error')?.textContent
```

Ca thật ở backlog 0011: lượt chạy đầu "pass" phép thử *"mật khẩu 5 ký tự phải báo lỗi ở đúng ô
password"* bằng chuỗi **hint** `"Từ 6 đến 72 ký tự."` — một chuỗi có sẵn trên màn hình từ trước khi
bấm nút, và cũng có sẵn khi form hoàn toàn hợp lệ.

### Phép thử nhiều ca nối nhau — hai cái bẫy khi bằng chứng là SỐ ĐẾM

Các mục trên nói về *một* khẳng định sai chỗ. Mục này nói về kịch bản dài nhiều ca, nơi bằng chứng
không còn là "thấy gì" mà là **"đếm được bao nhiêu"** — bao nhiêu lần gọi refresh, bao nhiêu lần
phát lại request. Ở đó xuất hiện một dạng hỏng riêng: **con số sai mà vẫn trông hợp lý.** Cả hai
bẫy dưới đây lấy từ backlog 0012.

**1. Lọc request bằng `new URL(u).pathname.startsWith('/api/')` — KHÔNG dùng `includes('/api/')`.**

Vite dev phục vụ **chính mã nguồn** của dự án dưới đường dẫn `/src/api/...`. Nên bộ lọc bằng
`includes` trúng luôn `/src/api/client.ts`, `/src/api/orders.api.ts`… và đếm chúng như request
backend.

```js
// ❌ trúng cả module do vite dev phục vụ
page.on('request', (r) => { if (r.url().includes('/api/')) đếm(r) })

// ✅ chỉ request thật sự đi tới backend
const laGoiBackend = (u) => { try { return new URL(u).pathname.startsWith('/api/') } catch { return false } }
```

**Đây là phần đắt nhất, đừng bỏ qua: bẫy này KHÔNG BAO GIỜ làm phép thử đỏ.** Nó chỉ làm mọi con
số to lên một cách vô hại — và với một ticket mà toàn bộ bằng chứng là số đếm, đó là dạng hỏng tệ
nhất có thể có: bạn báo cáo "1 lần refresh, 12 lần gọi lại" bằng những con số chưa bao giờ đúng.

**Dấu hiệu nhận biết:** in danh sách request ra và nhìn — có phần mở rộng `.ts` / `.tsx` trong đó,
và tổng số lớn hơn nhiều so với số request bạn tin là mình vừa gây ra.

**2. Helper đăng nhập phải `localStorage.clear()` TRƯỚC khi điều hướng.**

`LoginPage` có `if (isAuthenticated) return <Navigate to={from} replace />`. Dùng lại một helper
`dangNhap()` ở ca thứ hai — khi ca thứ nhất còn để lại phiên — thì trang đăng nhập **đá đi trước
khi form kịp render**, và helper treo ở chỗ chờ `[name="password"]`.

```js
// ✅ sạch phiên trước, rồi mới vào trang đăng nhập
await page.goto(BASE + '/'); await page.evaluate(() => localStorage.clear())
await page.goto(BASE + '/dang-nhap')
```

Lỗi hiện ra là *"timeout chờ ô mật khẩu"* — đọc y hệt "trang đăng nhập hỏng", nên bạn sẽ đi soi
`LoginPage`, sai hướng hoàn toàn.

**Luật chung: phép thử nhiều ca nối nhau không được giả định trạng thái sạch từ ca trước.**
Mỗi ca tự dựng lấy tiền đề của nó — localStorage, giỏ hàng, phiên đăng nhập — chứ đừng thừa hưởng
thứ ca trước tình cờ để lại.

---

## 9. Điều cấm

- ❌ Thêm thư viện ngoài stack đã chốt — hỏi Owner trước.
- ❌ `any`, `@ts-ignore`, `// eslint-disable` để né lỗi type.
- ❌ Sửa chữ ký hàm trong `src/api/` chỉ vì tiện cho component.
- ❌ Sao chép ảnh, logo hoặc nội dung văn bản từ site mẫu (bản quyền) — chỉ tham khảo bố cục.
- ❌ Commit file `.env`.
- ❌ Để sót `console.log` trong code hoàn thiện.

---

*Cập nhật lần cuối: 2026-08-25 — giữ mốc này đúng trong chính lần sửa nội dung.*
