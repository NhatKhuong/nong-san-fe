import { useMutation } from '@tanstack/react-query'
import { uploadProductImage } from '@/api/devImageUpload'

/**
 * Bọc `uploadProductImage` bằng `useMutation` chỉ để giữ đúng luồng
 * component → hook → `api/` (`coding-conventions.md` §1) — không có gì để
 * cache ở đây (mỗi ảnh một lần gọi độc lập, không có `queryKey` nào áp dụng,
 * và hợp đồng nội bộ backlog 0003 cấm sửa `hooks/queryKeys.ts`).
 *
 * `ProductForm.tsx` gọi `mutateAsync` cho từng file người dùng chọn (có thể
 * nhiều file cùng lúc, chạy song song) và tự giữ trạng thái tải lên
 * (`uploading`/`done`/`error`) của từng ảnh trong `useState` cục bộ — đây
 * không phải một mutation đơn theo nghĩa TanStack Query thường dùng.
 */
export function useDevImageUpload() {
  return useMutation({
    mutationFn: ({ file, categorySlug }: { file: File; categorySlug: string }) =>
      uploadProductImage(file, categorySlug),
  })
}
