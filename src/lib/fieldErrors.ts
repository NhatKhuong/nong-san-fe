import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/lib/apiError'

/**
 * Nối map `errors` của `422` (`API_CONTRACT.md` §A.3) vào đúng ô nhập của form.
 *
 * Trước đây mỗi form tự chép lại đúng khuôn này — năm bản giống hệt nhau, và hai
 * form mới nhất thì thiếu hẳn. Gom về một chỗ vì cùng một hợp đồng `errors` mà
 * mỗi nơi tự giải khoá một kiểu là cách chắc chắn nhất để hai form nói khác nhau
 * về cùng một lỗi của server.
 *
 * **Luật giữ nguyên từ các bản gốc:** khoá nào KHÔNG phải trường của form gọi thì
 * bỏ qua ở đây và vẫn hiện ở banner chung (xem `hasServerFieldError`) — không có
 * thông điệp nào được biến mất im lặng.
 *
 * **Không dịch thông điệp.** `errors` hiện còn là tiếng Anh thô của Bean Validation;
 * dựng bảng tra tiếng Anh → tiếng Việt ở client là bám vào thông điệp nội bộ của
 * một thư viện và sẽ vỡ im lặng mỗi lần backend nâng phiên bản (luật chốt ở
 * backlog 0021). Việt hoá là việc của backend.
 */

/**
 * Ba dạng khoá mà server thật sự trả về — đo bằng request thật, không suy từ tài liệu:
 *
 * ```
 * paymentMethod       cả object vắng mặt  → khoá PHẲNG ngay cấp gốc
 * shipping.fullName   trường lồng nhau    → dot-path
 * items[0].quantity   phần tử mảng        → bracket index
 * ```
 *
 * Giải bằng **luật hình dạng**, không bằng bảng tra từng khoá: bỏ mọi chỉ số mảng
 * rồi lấy đoạn cuối sau dấu chấm. Ai thấy mình đang viết một `Record<string, string>`
 * ánh xạ từng khoá thì đã đi sai hướng.
 *
 * Thử khoá **nguyên vẹn trước**: dạng phẳng cấp gốc (`paymentMethod`) phải khớp
 * chính nó, và một form có trường tên đúng bằng cả dot-path cũng vẫn khớp được.
 */
function candidateNames(key: string): string[] {
  const withoutIndexes = key.replace(/\[\d+\]/g, '')
  const leaf = withoutIndexes.slice(withoutIndexes.lastIndexOf('.') + 1)
  return leaf === key ? [key] : [key, leaf]
}

/** Khoá của server → tên trường của form gọi, hoặc `undefined` nếu không thuộc form này. */
function matchField<TName extends string>(
  key: string,
  fields: readonly TName[],
): TName | undefined {
  for (const candidate of candidateNames(key)) {
    const match = fields.find((field) => field === candidate)
    if (match) return match
  }
  return undefined
}

/**
 * Gắn từng thông điệp của `ApiError.fieldErrors` vào ô nhập tương ứng.
 *
 * `fields` là danh sách trường **có ô nhập trên màn hình** của form gọi — cố ý do
 * phía gọi khai chứ không suy từ schema: có trường nằm trong request mà không có
 * ô nào để gắn vào (`token` của trang đặt lại mật khẩu), và có trường của form
 * không bao giờ đi lên server (`confirmPassword`).
 *
 * Không phải `ApiError`, hoặc `422` không kèm `errors` (lỗi quy tắc nghiệp vụ),
 * thì hàm này không làm gì — thông điệp đi bằng `detail` xuống banner chung.
 */
export function applyServerFieldErrors<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>(error: unknown, setError: UseFormSetError<TFieldValues>, fields: readonly TName[]): void {
  if (!(error instanceof ApiError) || !error.fieldErrors) return
  for (const [key, message] of Object.entries(error.fieldErrors)) {
    const field = matchField(key, fields)
    if (field) setError(field, { type: 'server', message })
  }
}

/**
 * Có ít nhất một thông điệp đã hiện cạnh ô nhập rồi hay không.
 *
 * Banner chung dùng nó để không lặp lại cùng một câu ngay dưới ô vừa báo lỗi.
 * Phải dùng **chung một luật giải khoá** với hàm trên — nếu không sẽ có ca banner
 * bị tắt trong khi không ô nào sáng lên, và thông điệp mất tăm.
 */
export function hasServerFieldError(error: unknown, fields: readonly string[]): boolean {
  if (!(error instanceof ApiError) || !error.fieldErrors) return false
  return Object.keys(error.fieldErrors).some((key) => matchField(key, fields) !== undefined)
}
