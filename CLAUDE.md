# CLAUDE.md

Bộ quy tắc làm việc chung cho dự án. File này được nạp tự động vào ngữ cảnh mỗi phiên — mọi thay đổi code phải tuân theo.

> **Dự án này là một surface trong workspace do `management/` điều phối, không làm việc trực tiếp.**
> Việc đến từ ticket trên board ở `management/backlog/` · `management/bugs/`; đường dẫn file ticket
> chính là spec. Quy trình chung của workspace nằm ở `../../management/pm-playbook.md`; phần riêng
> của surface này ở §8 dưới đây. Xem [`documents/00-index.md`](documents/00-index.md) để biết đọc gì
> trước khi làm gì.
> **`documents/` là luật của surface này** — mâu thuẫn giữa ticket và tài liệu thì dừng lại báo PM.

---

## 1. Tổng quan dự án

Website thương mại điện tử bán **nông sản sạch / thực phẩm hữu cơ**, tham khảo bố cục từ https://organic-food.monamedia.net/.

- **Phạm vi hiện tại:** frontend đầy đủ phần khách hàng (trang chủ, cửa hàng, chi tiết SP, giỏ hàng, checkout, tài khoản, wishlist, blog), **cộng khu quản trị `/quan-tri` đã xong giai đoạn 1** (backlog 0002–0008): Tổng quan (4 ô chỉ số + 2 biểu đồ) · Sản phẩm (CRUD đầy đủ) · Đơn hàng (xem + đổi trạng thái) · Khách hàng (chỉ đọc).
- **Khu quản trị `/quan-tri`** là **mục router top-level thứ hai**, sibling với `MainLayout` chứ không lồng dưới nó, dùng `AdminLayout` riêng — xem `src/routes/adminRoutes.tsx` và ADR 0001. Thêm màn quản trị mới thì sửa `adminRoutes.tsx` + `adminLazyPages.ts`, đừng đụng cây route storefront. `AdminRoute` chỉ ẩn giao diện, **không phải bảo mật**: hàng rào thật là filter trên `/admin/**` ở backend (ADR 0002).
- **Backend:** đang xây bằng **Spring Boot**. Frontend vẫn chạy bằng mock JSON; hợp đồng bàn giao nằm ở [`documents/API_CONTRACT.md`](documents/API_CONTRACT.md), API thật xem tại `http://localhost:8080/swagger-ui/index.html` khi backend chạy.

### Tech stack (đã chốt — không tự ý thay đổi)

| Nhóm | Công nghệ |
|---|---|
| Build | Vite 8 + React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 (cấu hình bằng `@theme` trong `src/index.css`) |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| HTTP | Axios |
| Form | React Hook Form + Zod |
| Slider | Swiper |
| Biểu đồ | Recharts v3 — **chỉ** dùng trong `src/components/admin/dashboard/` (ADR 0003) |
| Icon | lucide-react |

---

## 2. Lệnh thường dùng

```bash
npm run dev          # dev server tại http://localhost:5173
npm run build        # type-check (tsc -b) + build production
npm run preview      # xem thử bản build
npm run lint         # oxlint
npx tsc --noEmit     # chỉ kiểm tra type, chạy trước khi kết thúc mỗi giai đoạn
```

---

## 3. Quy tắc kiến trúc (BẮT BUỘC)

Đây là nhóm quy tắc quan trọng nhất — vi phạm sẽ khiến việc ghép backend Spring Boot sau này phải sửa lại toàn bộ component.

- **Component TUYỆT ĐỐI KHÔNG import trực tiếp file trong `src/mocks/`.** Mọi dữ liệu đi theo đúng chuỗi:
  `component` → `hooks/useXxx.ts` (TanStack Query) → `api/xxx.api.ts` → `mocks/*.json`
- **Chữ ký hàm trong `src/api/` là hợp đồng với backend.** Khi ghép Spring Boot chỉ được sửa **thân hàm**, không đổi tên hàm, tham số hay kiểu trả về.
- **Không gọi `axios` trực tiếp trong component.** Chỉ `src/api/` được phép.
- **Phân tách state rõ ràng:**
  - Dữ liệu từ server (sản phẩm, danh mục, bài viết, đơn hàng) → **TanStack Query**
  - Trạng thái phía client (giỏ hàng, wishlist, auth, mở/đóng drawer) → **Zustand**
  - Không dùng Zustand để cache dữ liệu server, không dùng Query cho state UI.
- **Mỗi hàm API mock phải có `delay()`** giả lập độ trễ mạng, để lộ sớm các lỗi loading state.

---

## 4. Quy ước đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook | `useCamelCase.ts` | `useProducts.ts` |
| Store | `name.store.ts` | `cart.store.ts` |
| API service | `name.api.ts` | `products.api.ts` |
| Type | `name.ts`, export `interface`/`type` PascalCase | `product.ts` → `Product` |
| Hàm tiện ích | `camelCase` | `formatVND` |

- **Code (biến, hàm, comment kỹ thuật): tiếng Anh.**
- **Nội dung hiển thị cho người dùng: tiếng Việt có dấu.**
- **Đường dẫn route: tiếng Việt không dấu** — `/cua-hang`, `/san-pham/:slug`, `/gio-hang`, `/thanh-toan`, `/tai-khoan`, `/yeu-thich`, `/tin-tuc`, `/gioi-thieu`, `/lien-he`.

---

## 5. Quy tắc viết component

- Một file **một** component export default. Vượt ~200 dòng thì tách nhỏ.
- Chỉ dùng **function component + hooks**. Không dùng class component.
- Props luôn khai báo `interface` tường minh. **Cấm dùng `any`** — nếu chưa rõ kiểu thì dùng `unknown` rồi thu hẹp.
- **Luôn tái sử dụng `src/components/ui/`.** Không tự viết lại Button / Input / Modal / Badge ở nơi khác.
- Component trong `components/` phải "câm" (nhận props, không tự fetch). Việc fetch thuộc về `pages/` hoặc hook.

---

## 6. Quy tắc styling

- **Chỉ dùng Tailwind utility class.** Tránh tạo file `.css` riêng trừ khi thật sự bất khả kháng.
- **Chỉ dùng design token đã khai báo trong `src/index.css`:** `primary`, `primary-dark`, `accent`, `surface`, `ink`, `ink-muted`, `line`…
  - ✅ `className="bg-primary text-white"`
  - ❌ `className="bg-[#7FAD39]"` — cấm hardcode mã màu
- **Mobile-first:** viết style cho mobile trước, rồi thêm `sm:` `md:` `lg:`.
- Dùng `.container-app` cho mọi section thay vì tự set `max-width` lẻ tẻ.
- Chuỗi class dài / có điều kiện: gom bằng helper `cn()` trong `src/lib/utils.ts` (clsx + tailwind-merge).

---

## 7. Quy tắc dữ liệu

- **Tiền tệ luôn hiển thị qua `formatVND()`** trong `src/lib/format.ts`. Không tự nối chuỗi `₫`.
- Giá lưu dạng **số nguyên VNĐ** (`449000`), không dấu phẩy, không thập phân.
- Mọi trạng thái bất đồng bộ phải xử lý đủ **3 nhánh**:
  1. `isLoading` → hiển thị `Skeleton` (không dùng spinner toàn trang)
  2. `isError` → thông báo lỗi + nút thử lại
  3. dữ liệu rỗng → empty state có hình minh hoạ + gợi ý hành động
- Ảnh luôn có `alt` mô tả bằng tiếng Việt và `loading="lazy"` (trừ ảnh above-the-fold).

### Quy tắc về ảnh (BẮT BUỘC)

- **Ảnh phải nằm trong `public/images/`**, chia thư mục con theo loại (`products/<danh-mục-gốc>/`, `categories/`, `posts/`, `banners/`, `brands/`, `avatars/`).
- **Dữ liệu chỉ lưu đường dẫn tương đối** — `/images/rau-cu/ca-rot-huu-co-1.jpg`. Đây là hợp đồng với backend: sau này Spring Boot trả về đúng dạng này.
- ❌ **Cấm hardcode URL ảnh của bên thứ ba** (`images.unsplash.com`, `picsum.photos`…) trong code hay trong mock. Cần ảnh mới thì tải về bằng `node scripts/download-images.mjs`.
- **Chuyển đường dẫn thành URL bằng `imageUrl()`** (`src/lib/image.ts`), và **gọi ở lớp `src/api/`, không gọi trong component**. Component nhận URL đã sẵn sàng. Lý do: quên gọi ở một component sẽ không lộ ra lúc dev (vì base đang trống), chỉ vỡ khi deploy với CDN.
- Thay ảnh thì **đổi luôn tên file** — file trong `public/` không được Vite gắn hash nên giữ nguyên tên sẽ khiến người dùng cũ thấy ảnh cũ trong cache.

---

## 8. Quy trình làm việc

Quy trình chung của workspace (vai trò, vòng đời ticket, rubric tự quyết, harness delta) nằm ở
`../../management/pm-playbook.md` — **không chép lại ở đây**. Phần riêng của surface này, bản đầy
đủ: [`documents/coding-conventions.md`](documents/coding-conventions.md) §8.

- **Việc đến từ board ở `management/`**, không đến thẳng project. Đường dẫn file ticket
  (`management/backlog/NNNN-slug.md` hoặc `management/bugs/NNNN-slug.md`) **chính là spec** —
  xây đúng chừng đó, không hơn. Tiến độ và lý do quyết định sống ở board, project không giữ bản sao.
- **Đọc `documents/` trước khi sửa code.** Thứ tự: `architecture/01-overview.md` →
  `coding-conventions.md`. Ticket mâu thuẫn tài liệu thì **dừng và báo PM**, không tự ứng biến.
- **Hàng rào phạm vi:** chỉ chạm `projects/app`. Không sửa surface khác, không sửa hub, không sửa
  board, **không chạy lệnh `git`** trừ khi được yêu cầu rõ ràng.
- **Không nới phạm vi giữa chừng.** Phát hiện thêm vấn đề thì ghi vào `Notes` của báo cáo để PM
  mở ticket mới — không âm thầm sửa kèm.
- **Dừng lại hỏi khi:** đổi chữ ký hàm trong `src/api/`; thêm thư viện ngoài stack; đổi design token
  hoặc màu; ticket mâu thuẫn tài liệu; phát sinh câu hỏi "A hay B?" ảnh hưởng người dùng; xoá/đổi tên
  route hoặc xoá `src/mocks/`.
- **Thanh bằng chứng — đủ cả ba mới được báo xong** (dự án **chưa có test runner**, đừng báo số test):
  1. `npm run build` xanh — **đây mới là cổng kiểm tra thật**; `npx tsc --noEmit` không đi vào các
     tsconfig được reference nên bỏ sót lỗi, không dùng thay thế.
  2. `npm run lint` sạch, 0 cảnh báo.
  3. Hành vi quan sát được: chạy `npm run dev`, mở đúng màn hình đã sửa, **0 lỗi console, 0 request hỏng**.
- **Báo cáo về PM đúng khuôn** [`documents/response-format.md`](documents/response-format.md) — là dữ
  liệu, không phải văn xuôi. Đóng việc luôn kèm dòng `Harness delta` ("None" hợp lệ, bỏ trống thì không).

---

## 9. Điều cấm

- ❌ Sao chép ảnh, logo, hoặc nội dung văn bản trực tiếp từ site mẫu (vấn đề bản quyền). Chỉ tham khảo **cấu trúc và bố cục**.
- ❌ Commit file `.env`.
- ❌ Để sót `console.log` trong code hoàn thiện.
- ❌ Dùng `any`, `@ts-ignore`, hoặc `// eslint-disable` để né lỗi type.
- ❌ Sửa chữ ký hàm trong `src/api/` chỉ vì tiện cho component.
