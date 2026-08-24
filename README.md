# Nông Sản Sạch — Frontend

Website thương mại điện tử bán nông sản sạch / thực phẩm hữu cơ, xây bằng **React + TypeScript + Vite + Tailwind CSS**.

Backend được xây riêng bằng **Spring Boot**. Ở giai đoạn hiện tại frontend vẫn chạy hoàn toàn bằng mock JSON, truy cập qua lớp service `src/api/` — khi ghép backend chỉ cần đổi **thân** các hàm trong lớp này, chữ ký giữ nguyên.

> **Đây là một surface trong workspace Gangline, được điều phối từ `../../management`.**
> Đừng làm việc thẳng vào repo này — xem [Làm việc với dự án này](#làm-việc-với-dự-án-này).

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

## Ảnh

Toàn bộ ảnh nằm trong [`public/images/`](public/images/) — **không tải từ bên thứ ba**. Dữ liệu chỉ lưu đường dẫn tương đối (`/images/rau-cu/ca-rot-huu-co-1.jpg`), đúng dạng backend sẽ trả về sau này.

```bash
node scripts/download-images.mjs      # tải ảnh mới về (bỏ qua file đã có)
node scripts/generate-brand-logos.mjs # sinh lại logo thương hiệu dạng SVG
```

Khi đưa ảnh lên S3/CDN: đặt `VITE_IMAGE_BASE_URL` trong `.env` (xem [`.env.example`](.env.example)) — không phải sửa dữ liệu hay code.

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

## Làm việc với dự án này

Repo này không được sửa trực tiếp. Nó là **surface `app`** trong một workspace file-native:

```
harness-starter-git-based/
├── management/          ← hub điều phối, khởi động agent từ đây
│   ├── backlog/         ← board: mỗi việc là một file NNNN-slug.md, chỉ mục ở STATUS.md
│   ├── bugs/            ← mỗi lỗi là một file
│   └── decisions/       ← ADR: vì sao chọn phương án này
└── projects/app/        ← chính là repo này
    └── documents/       ← LUẬT của surface: kiến trúc, quy ước, quy trình, hợp đồng API
```

- **Việc đến từ ticket trên board**, và *đường dẫn file ticket chính là spec*. Không có ticket
  thì chưa có việc — nhờ PM ở `management/` mở trước.
- **PM không viết code**; agent `app` thực thi, chỉ chạm `projects/app`, không chạy `git` trừ khi
  được yêu cầu, và báo cáo lại theo khuôn [`documents/response-format.md`](documents/response-format.md).
- **Đóng một việc cần đủ ba bằng chứng:** `npm run build` xanh · `npm run lint` sạch · mở dev server
  xem đúng màn hình đã sửa (0 lỗi console). Dự án **chưa có test runner**.
- Tiến độ và lý do quyết định sống ở `management/`, **không** giữ bản sao trong repo này.

Chi tiết: [`documents/coding-conventions.md`](documents/coding-conventions.md) §8 (phần riêng của
surface này) và `../../management/pm-playbook.md` (quy trình chung của workspace).

## Tài liệu

Bản đồ tài liệu: [`documents/00-index.md`](documents/00-index.md) — đọc gì trước khi làm gì.

| Tài liệu | Nội dung |
|---|---|
| [`documents/architecture/01-overview.md`](documents/architecture/01-overview.md) | Kiến trúc: các lớp, luồng dữ liệu, phân tách state, routing, design token |
| [`documents/coding-conventions.md`](documents/coding-conventions.md) | Quy ước viết code (bản rút gọn của `CLAUDE.md`); **§8: cách thức làm việc** — hàng rào phạm vi, sáu tình huống dừng lại hỏi, thanh bằng chứng |
| [`documents/API_CONTRACT.md`](documents/API_CONTRACT.md) | Hợp đồng API — đầu bài bàn giao cho backend Spring Boot |
| [`documents/response-format.md`](documents/response-format.md) | Khuôn báo cáo agent trả về PM |
| [`CLAUDE.md`](CLAUDE.md) | Bộ quy tắc nạp tự động mỗi phiên — đọc trước khi đóng góp |

API thật do backend cung cấp theo hợp đồng trên: **Swagger UI** tại
<http://localhost:8080/swagger-ui/index.html> (chỉ có khi backend đang chạy).

## Ghi chú

Bố cục tham khảo từ https://organic-food.monamedia.net/. Dự án **không** sao chép ảnh, logo hay nội dung văn bản từ site này — chỉ tham khảo cấu trúc và bố cục.
