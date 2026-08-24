# Tài liệu của surface `app` — bản đồ

Thư mục này là **luật** của web client `projects/app`. Agent sở hữu surface đọc ở đây
trước khi sửa bất cứ dòng code nào; gặp mâu thuẫn giữa tài liệu và ticket thì **dừng lại
và báo PM**, không tự ứng biến.

---

## Đọc theo thứ tự này khi mở một phiên làm việc

1. [`architecture/01-overview.md`](architecture/01-overview.md) — hệ thống được dựng ra sao.
2. [`coding-conventions.md`](coding-conventions.md) — luật viết code; **§8 là cách thức làm việc**:
   hàng rào phạm vi, sáu tình huống phải dừng lại hỏi, thanh bằng chứng.

Hai file trên đủ để bắt tay vào việc, ba file còn lại tra khi cần.

**Quy trình chung của workspace** — vai trò, vòng đời ticket, rubric tự quyết, harness delta —
nằm ở `management/pm-playbook.md`, **không chép lại ở đây**. Tài liệu trong thư mục này chỉ ghi
thứ riêng của surface `app`.

---

## Sắp làm gì thì đọc gì

| Bạn sắp… | Đọc trước |
|---|---|
| Thêm / sửa component, route, style | [`coding-conventions.md`](coding-conventions.md) |
| Quyết định về cấu trúc hoặc chỗ đặt state | [`architecture/01-overview.md`](architecture/01-overview.md) |
| Chạm vào `src/api/`, `src/types/`, hoặc ghép backend | [`API_CONTRACT.md`](API_CONTRACT.md) |
| Viết báo cáo "đã xong" gửi PM | [`response-format.md`](response-format.md) |
| Không chắc việc này có được tự quyết không | [`coding-conventions.md`](coding-conventions.md) §8.1 |

---

## Các file ở đây

| File | Vai trò |
|---|---|
| [`architecture/01-overview.md`](architecture/01-overview.md) | Kiến trúc: các lớp, luồng dữ liệu, phân tách state, routing, token, env |
| [`coding-conventions.md`](coding-conventions.md) | Quy ước viết code — bản rút gọn khớp [`../CLAUDE.md`](../CLAUDE.md). **§8: hàng rào phạm vi, sáu tình huống dừng lại hỏi, thanh bằng chứng** |
| [`API_CONTRACT.md`](API_CONTRACT.md) | Hợp đồng API với backend Spring Boot — đầu bài bàn giao và mốc đối chiếu khi ghép |
| [`response-format.md`](response-format.md) | Khuôn báo cáo trả về PM (dữ liệu, không phải văn xuôi) |

Tài liệu API do backend cung cấp theo hợp đồng trên: **Swagger UI** tại
`http://localhost:8080/swagger-ui/index.html` (chỉ có khi backend đang chạy).

---

## Cái gì KHÔNG nằm ở đây

- **Tiến độ, danh sách việc, lỗi đang mở** → board ở `management/backlog/` và `management/bugs/`,
  chỉ mục là `STATUS.md` của từng thư mục.
- **Lý do chọn phương án A thay vì B** → ADR trong `management/decisions/`.
- **Kế hoạch theo giai đoạn và nhật ký làm việc** → đã chuyển hẳn về `management/`. Đừng tạo lại
  bản sao trong project; hai nguồn tiến độ sẽ lệch nhau ngay tuần đầu.

Tài liệu ở thư mục này chỉ trả lời **"dự án này được xây thế nào và làm việc ra sao"** — thứ
đúng lâu dài, không đổi theo từng ticket.

---

*Cập nhật lần cuối: 2026-08-24 — giữ mốc này đúng trong chính lần sửa nội dung.*
