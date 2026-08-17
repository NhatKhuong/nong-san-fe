# CLAUDE.md

Bộ quy tắc làm việc chung cho dự án. File này được nạp tự động vào ngữ cảnh mỗi phiên — mọi thay đổi code phải tuân theo.

---

## 1. Tổng quan dự án

Website thương mại điện tử bán **nông sản sạch / thực phẩm hữu cơ**, tham khảo bố cục từ https://organic-food.monamedia.net/.

- **Phạm vi hiện tại:** frontend đầy đủ (trang chủ, cửa hàng, chi tiết SP, giỏ hàng, checkout, tài khoản, wishlist, blog).
- **Backend:** _chưa tồn tại_. Sẽ được xây bằng **Spring Boot** sau. Toàn bộ dữ liệu hiện lấy từ mock JSON.
- **Kế hoạch & tiến độ:** xem [`docs/PLAN.md`](docs/PLAN.md).
- **Bối cảnh & lịch sử:** xem [`docs/NHAT-KY-LAM-VIEC.md`](docs/NHAT-KY-LAM-VIEC.md) — đọc trước khi bắt đầu một phiên làm việc mới để biết đang dở ở đâu và vì sao các quyết định trước được đưa ra.

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

- Bám sát [`docs/PLAN.md`](docs/PLAN.md), làm **tuần tự theo giai đoạn**.
- **Hoàn thành hạng mục nào thì tick `- [x]` ngay hạng mục đó** trong `docs/PLAN.md` — không dồn đến cuối.
- Xong cả giai đoạn: đổi `⬜` thành `✅` ở tiêu đề giai đoạn **và** cập nhật dòng tương ứng trong bảng tiến độ.
- **Chạy `npm run build` trước khi coi một giai đoạn là hoàn thành** — đây mới là cổng kiểm tra thật. `npx tsc --noEmit` không đi vào các tsconfig được reference nên bỏ sót một số lỗi (xem sự cố #2 trong nhật ký).
- Cuối mỗi phiên, cập nhật [`docs/NHAT-KY-LAM-VIEC.md`](docs/NHAT-KY-LAM-VIEC.md) theo hướng dẫn ở cuối file đó.
- **Không tự ý thêm thư viện ngoài stack đã chốt** — hỏi trước.

---

## 9. Điều cấm

- ❌ Sao chép ảnh, logo, hoặc nội dung văn bản trực tiếp từ site mẫu (vấn đề bản quyền). Chỉ tham khảo **cấu trúc và bố cục**.
- ❌ Commit file `.env`.
- ❌ Để sót `console.log` trong code hoàn thiện.
- ❌ Dùng `any`, `@ts-ignore`, hoặc `// eslint-disable` để né lỗi type.
- ❌ Sửa chữ ký hàm trong `src/api/` chỉ vì tiện cho component.
