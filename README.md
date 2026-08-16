# Nông Sản Sạch — Frontend

Website thương mại điện tử bán nông sản sạch / thực phẩm hữu cơ, xây bằng **React + TypeScript + Vite + Tailwind CSS**.

Backend sẽ được phát triển sau bằng **Spring Boot**. Ở giai đoạn hiện tại toàn bộ dữ liệu đến từ mock JSON, truy cập qua lớp service `src/api/` — khi backend sẵn sàng chỉ cần đổi phần thân các hàm trong lớp này.

## Yêu cầu

- Node.js >= 20 (đang dùng v24)
- npm >= 10

## Chạy dự án

```bash
npm install     # cài dependencies
npm run dev     # dev server → http://localhost:5173
```

## Các lệnh khác

```bash
npm run build      # type-check + build production vào dist/
npm run preview    # xem thử bản build
npm run lint       # oxlint
npx tsc --noEmit   # chỉ kiểm tra type
```

## Cấu trúc thư mục

```
src/
├── api/          # Lớp service — ĐIỂM CHUYỂN ĐỔI khi ghép Spring Boot
├── mocks/        # Dữ liệu giả (xoá sau khi có backend)
├── types/        # Định nghĩa kiểu dữ liệu, khớp DTO backend
├── components/
│   ├── ui/       # Component dùng chung: Button, Input, Modal…
│   ├── layout/   # Header, Footer, MainLayout
│   ├── product/  # ProductCard, ProductGrid…
│   ├── filter/   # Bộ lọc trang cửa hàng
│   └── home/     # Các section của trang chủ
├── pages/        # Component cấp trang, map 1-1 với route
├── store/        # Zustand store: cart, wishlist, auth, ui
├── hooks/        # Custom hooks + TanStack Query hooks
├── lib/          # Tiện ích: format tiền tệ, hằng số, cn()
└── routes/       # Khai báo router
```

## Tài liệu

- [`docs/NHAT-KY-LAM-VIEC.md`](docs/NHAT-KY-LAM-VIEC.md) — **đọc file này đầu tiên khi quay lại dự án**: đang dở ở đâu, tiếp theo làm gì, vì sao code lại như hiện tại
- [`CLAUDE.md`](CLAUDE.md) — bộ quy tắc làm việc, quy ước code (đọc trước khi đóng góp)
- [`docs/PLAN.md`](docs/PLAN.md) — kế hoạch triển khai và tiến độ theo giai đoạn

## Ghi chú

Bố cục tham khảo từ https://organic-food.monamedia.net/. Dự án **không** sao chép ảnh, logo hay nội dung văn bản từ site này — chỉ tham khảo cấu trúc và bố cục.
