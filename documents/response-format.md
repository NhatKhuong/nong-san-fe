# Khuôn báo cáo — agent `app` trả về PM

Tin nhắn cuối của sub-agent là **dữ liệu cho PM, không phải văn xuôi cho người đọc**.
Trả về đúng khuôn dưới đây, không thêm lời dẫn, không kể lại quá trình.

```
Ticket: <management/backlog/NNNN-slug.md>
Status: done | blocked | needs-decision
Changed: <path:line>, <path:line>
Verified: build <kết quả> · lint <kết quả> · smoke <màn hình đã mở>
Evidence: <bằng chứng cụ thể — dòng kết quả build, số cảnh báo lint, đã bấm gì thấy gì, console sạch>
Notes: <cạm bẫy, việc phát sinh ngoài phạm vi, hoặc điều PM phải quyết>
Harness delta: <việc này dạy hệ thống điều gì, hoặc "None">
```

Bị chặn hoặc cần quyết định thì **nói ngay ở dòng đầu rồi dừng** — đừng làm nốt phần còn lại.

---

## Lấy `Verified` và `Evidence` ở đâu

Surface này **chưa có test runner** — đừng báo cáo số lượng test. Ba mức bằng chứng bắt buộc
(chi tiết ở [`coding-conventions.md`](coding-conventions.md) §8.2):

| Mức | Lệnh | Ghi vào báo cáo |
|---|---|---|
| Build | `npm run build` | Dòng `built in …` + exit code |
| Lint | `npm run lint` | Số lỗi / cảnh báo (phải là 0) |
| Hành vi | `npm run dev` rồi mở màn hình đã sửa | Đường dẫn đã mở, thao tác đã làm, **0 lỗi console, 0 request hỏng** |

`npx tsc --noEmit` **không** thay được `npm run build`: nó không đi vào các tsconfig được
reference nên bỏ sót lỗi.

---

## Ví dụ đạt yêu cầu

```
Ticket: management/backlog/0007-loc-san-pham-theo-thuong-hieu.md
Status: done
Changed: src/components/filter/BrandFilter.tsx:1, src/hooks/useProductFilters.ts:34, src/api/products.api.ts:71
Verified: build xanh (vite build, exit 0) · lint 0 cảnh báo (oxlint) · smoke /cua-hang
Evidence: `built in 4.21s`, 50 chunk, chunk chính 424 KB. Mở /cua-hang?brand=da-lat-organic —
  lưới còn 6 sản phẩm đúng thương hiệu, chip lọc hiện và xoá được, phân trang reset về trang 1.
  Console sạch, không request hỏng.
Notes: `PriceRangeSlider` giữ min/max của truy vấn cũ nên nháy một nhịp khi đổi thương hiệu —
  nằm ngoài phạm vi ticket này, đề nghị PM mở ticket riêng.
Harness delta: quy ước "đổi bất kỳ khoá lọc nào cũng phải reset về trang 1" chưa được ghi ở
  coding-conventions.md, mới chỉ nằm trong comment của useProductFilters.ts.
```

## Ví dụ KHÔNG đạt

```
Status: done
Evidence: Đã thêm bộ lọc thương hiệu, code biên dịch không lỗi.
```

Thiếu đường dẫn ticket, thiếu file đã đổi, không có kết quả lint, và **"biên dịch không lỗi"
không phải hành vi quan sát được** — build xanh mà màn hình trắng vẫn là hỏng.

---

*Cập nhật lần cuối: 2026-08-24 — giữ mốc này đúng trong chính lần sửa nội dung.*
