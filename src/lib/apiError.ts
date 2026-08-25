import axios from 'axios'

/**
 * Lỗi API đã chuẩn hoá — thứ duy nhất mà `client.ts` `reject` ra ngoài.
 *
 * Mọi chỗ trong ứng dụng đang hiển thị `error.message` sẽ tự động nói tiếng Việt
 * mà **không phải sửa một dòng nào**: `message` ưu tiên lấy `detail` do backend
 * trả về (RFC 7807, đã viết sẵn tiếng Việt cho người dùng cuối), chỉ rơi xuống
 * bảng dự phòng theo mã HTTP khi backend không nói gì.
 *
 * Xem `documents/API_CONTRACT.md` §A.3.
 */
export class ApiError extends Error {
  /** Mã HTTP; `0` khi request không tới được máy chủ (mất mạng / quá hạn chờ). */
  readonly status: number
  /** Map `tên trường → thông điệp` của lỗi validate 422, nếu backend có gửi. */
  readonly fieldErrors?: Record<string, string>
  /** Body `ProblemDetail` nguyên vẹn — để soi khi cần, không dùng để hiển thị. */
  readonly problem?: unknown

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
    problem?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.problem = problem
  }
}

/**
 * Lưới an toàn theo mã HTTP.
 *
 * Chỉ dùng khi backend không gửi `detail`. Nó nói được "sai" nhưng không nói
 * được *sai ở đâu* — nên `detail` của backend luôn được ưu tiên.
 */
const FALLBACK_BY_STATUS: Record<number, string> = {
  400: 'Dữ liệu gửi lên không hợp lệ, vui lòng kiểm tra lại.',
  401: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu bạn cần.',
  409: 'Dữ liệu vừa được thay đổi ở nơi khác, vui lòng tải lại rồi thử lại.',
  422: 'Dữ liệu gửi lên không hợp lệ, vui lòng kiểm tra lại các trường được đánh dấu.',
}

const SERVER_MESSAGE = 'Hệ thống đang bận, vui lòng thử lại sau ít phút.'
const TIMEOUT_MESSAGE = 'Yêu cầu quá thời gian chờ, vui lòng thử lại.'
const NETWORK_MESSAGE = 'Không kết nối được máy chủ, vui lòng kiểm tra đường truyền.'
const UNKNOWN_MESSAGE = 'Đã có lỗi xảy ra, vui lòng thử lại.'

function fallbackMessage(status: number): string {
  return FALLBACK_BY_STATUS[status] ?? (status >= 500 ? SERVER_MESSAGE : UNKNOWN_MESSAGE)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** `detail` của `ProblemDetail` — chuỗi tiếng Việt dành cho người dùng cuối. */
function readDetail(data: unknown): string | null {
  if (!isRecord(data)) return null
  const detail = data.detail
  return typeof detail === 'string' && detail.trim() !== '' ? detail : null
}

/**
 * Map lỗi theo từng trường.
 *
 * Spring làm phẳng phần mở rộng của `ProblemDetail` ra ngay cấp gốc (`data.errors`),
 * nhưng springdoc lại mô tả nó nằm dưới khoá `properties` — đọc cả hai để không
 * phụ thuộc vào việc phía nào đúng.
 */
function readFieldErrors(data: unknown): Record<string, string> | undefined {
  if (!isRecord(data)) return undefined
  const raw = isRecord(data.errors)
    ? data.errors
    : isRecord(data.properties) && isRecord(data.properties.errors)
      ? data.properties.errors
      : null
  if (!raw) return undefined

  const result: Record<string, string> = {}
  for (const [field, message] of Object.entries(raw)) {
    if (typeof message === 'string') result[field] = message
  }
  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Chuyển bất kỳ thứ gì axios ném ra thành `ApiError`.
 *
 * Gọi trong response interceptor của `client.ts` để **mọi** lời gọi `reject`
 * đều mang cùng một hình dạng.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const response = error.response
    if (!response) {
      const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      return new ApiError(timedOut ? TIMEOUT_MESSAGE : NETWORK_MESSAGE, 0)
    }
    const { status, data } = response
    return new ApiError(
      readDetail(data) ?? fallbackMessage(status),
      status,
      readFieldErrors(data),
      data,
    )
  }

  return new ApiError(UNKNOWN_MESSAGE, 0)
}
