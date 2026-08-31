/**
 * Tải một ảnh sản phẩm lên middleware dev-only (`vite-plugins/upload-product-image.ts`)
 * — backlog 0034. **KHÔNG map sang endpoint backend nào** và **không phải hợp đồng**
 * (`API_CONTRACT.md`): cố ý không đặt tên `*.api.ts` để không lọt vào phép đếm ở
 * `API_CONTRACT.md` §F, đúng lệ `productStore.ts`/`orderStore.ts` trước đây (§E.4).
 *
 * Endpoint `/__dev/upload-image` chỉ tồn tại khi chạy `npm run dev` — gọi hàm này khi
 * chạy `vite preview`/bản build tĩnh sẽ luôn thất bại (không có middleware nào bắt
 * đường dẫn này), đúng ý đồ "chỉ chạy ở dev cục bộ" của ticket.
 *
 * Gửi **raw binary** qua `fetch`, không `multipart/form-data` — ràng buộc #1 của
 * ticket: không thêm dependency (`multer`/`busboy`/`formidable`) để đổi lấy việc parse
 * multipart ở cả hai đầu.
 */
export async function uploadProductImage(file: File, categorySlug: string): Promise<string> {
  const params = new URLSearchParams({ category: categorySlug, filename: file.name })

  const response = await fetch(`/__dev/upload-image?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null)
    const detail =
      errorBody && typeof errorBody === 'object' && 'detail' in errorBody
        ? String((errorBody as { detail: unknown }).detail)
        : `Tải ảnh lên thất bại (${response.status}).`
    throw new Error(detail)
  }

  const data = (await response.json()) as { path: string }
  return data.path
}
