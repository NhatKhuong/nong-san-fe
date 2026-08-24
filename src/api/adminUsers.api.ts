import { delay } from '@/lib/utils'
import { readPublicUsers } from './auth.api'
import type { AdminUserQuery, Paginated, User, UserRole } from '@/types'

/**
 * Khách hàng ở khu quản trị — `/admin/customers/**`.
 *
 * Tách khỏi `auth.api.ts` vì đây là **namespace khác** trên backend: mọi hàm
 * dưới đây nằm dưới tiền tố `/admin/**` được gác bằng một filter đòi
 * `role == "admin"` (`documents/API_CONTRACT.md` §B.12.3, §C.4.2). Cùng lý do đã
 * tách `adminProducts.api.ts` khỏi `products.api.ts` và `adminOrders.api.ts`
 * khỏi `orders.api.ts` — để chung file là mời một lời gọi lọt ra ngoài hàng rào.
 *
 * **Chỉ đọc, và cố ý không có đường ghi.** Giai đoạn này Owner chốt không sửa,
 * không xoá, không khoá tài khoản, không đổi vai trò (backlog 0006). Vai trò chỉ
 * được gán ở phía server (ADR 0002), nên một hàm `updateUserRole()` ở đây không
 * chỉ là thừa — nó là đúng cái cửa mà ADR đó đóng lại.
 *
 * Dữ liệu đọc qua `readPublicUsers()` của `auth.api.ts`, tức là **cùng kho**
 * `nss_mock_users` mà đăng nhập / đăng ký đang dùng: người vừa đăng ký ở
 * `/dang-ky` xuất hiện ngay trong bảng này.
 */

/**
 * Số khách mỗi trang của bảng quản trị.
 *
 * Cố ý **không** thêm vào `lib/constants.ts` — cùng lý do đã ghi ở
 * `adminOrders.api.ts`: file đó là hợp đồng dùng chung với backend, còn con số
 * này chỉ là `limit` mặc định khi client không gửi.
 */
const USERS_PER_PAGE = 10

/**
 * "Khách hàng" = `role === 'customer'` — vai trò mặc định của danh sách.
 *
 * Owner chốt 2026-08-24 (backlog 0008): tài khoản quản trị là nhân viên nội bộ,
 * không phải khách. Đây là **mặc định**, không phải hàng rào: gọi kèm `role`
 * vẫn xem được tập khác. Cùng định nghĩa này là tập mà `customerCount` của
 * §B.12.4 phải đếm — hai chỗ đếm hai tập khác nhau thì bảng ghi 12 dòng còn ô
 * chỉ số ghi 11, và không chỗ nào nói ra là vì sao.
 */
const DEFAULT_ROLE: UserRole = 'customer'

/** Dải dấu thanh tổ hợp Unicode, tách ra sau khi `normalize('NFD')`. */
const COMBINING_MARKS = /[̀-ͯ]/g

/** Bỏ dấu để tìm "le thi bich" khớp được với "Lê Thị Bích". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase()
}

/**
 * Lọc theo `q` và `role`.
 *
 * `q` khớp **họ tên / email / số điện thoại** — đúng ba thứ nhân viên có trong
 * tay khi khách gọi tới. Tên so khớp **bỏ dấu**; email so khớp trên chuỗi đã
 * `toLowerCase()`, còn số điện thoại so khớp nguyên văn vì nó không có dấu và
 * người ta hay gõ một đoạn giữa ("345678").
 */
function applyFilters(list: User[], query: AdminUserQuery): User[] {
  let result = list

  if (query.q) {
    const keyword = normalize(query.q.trim())
    result = result.filter(
      (user) =>
        normalize(user.fullName).includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword),
    )
  }

  if (query.role) {
    result = result.filter((user) => user.role === query.role)
  }

  return result
}

/**
 * Danh sách tài khoản, **`id` tăng dần**.
 *
 * Không có tham số `sort`: `AdminUserQuery` cố ý không khai nó (hợp đồng chốt ở
 * backlog 0003). Thứ tự cố định là `id` tăng dần chứ không phải "mới nhất
 * trước" — `User` **không có `createdAt`**, nên không tồn tại mốc thời gian nào
 * để xếp theo. Muốn "khách mới đăng ký lên đầu" thì phải thêm trường vào
 * `types/user.ts` **và** vào hợp đồng backend; đó là việc của một ticket khác,
 * không phải thứ tự sắp xếp được đoán ra ở đây.
 *
 * **Mặc định chỉ trả `role === 'customer'`** (Owner chốt 2026-08-24, backlog
 * 0008): tài khoản quản trị là nhân viên nội bộ, không phải khách. Đúng tập này
 * là tập `customerCount` của §B.12.4 đếm — đó là lý do định nghĩa nằm ở lớp API
 * chứ không ở component, để hai chỗ không kịp lệch nhau.
 *
 * Mặc định **không** phải hàng rào: truyền `role` vẫn xem được tập khác —
 * `getAdminUsers({ role: 'admin' })` trả về đúng các tài khoản quản trị. Cột
 * "Vai trò" ở bảng vì vậy vẫn cần, và sẽ nói đúng khi có vai trò thứ ba.
 *
 * **Không bao giờ kèm `password`** — `readPublicUsers()` đã cắt ở ranh giới kho
 * dữ liệu, đúng cách backend trả DTO thay vì trả nguyên entity.
 *
 * Khi có backend: `const { data } = await client.get('/admin/customers', { params: query }); return data`
 * — lúc đó `DEFAULT_ROLE` biến mất khỏi file này, nên **backend phải mặc định
 * `customer` khi `role` bỏ trống** (§B.12.3). Thay thân hàm mà quên điều đó thì
 * bảng lặng lẽ mọc lại tài khoản quản trị.
 */
export async function getAdminUsers(query: AdminUserQuery = {}): Promise<Paginated<User>> {
  await delay()

  const page = query.page ?? 1
  const limit = query.limit ?? USERS_PER_PAGE
  const filtered = applyFilters(readPublicUsers(), {
    ...query,
    role: query.role ?? DEFAULT_ROLE,
  }).sort((a, b) => a.id - b.id)
  const start = (page - 1) * limit

  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  }
}

/**
 * Một tài khoản theo **id** — khớp URL `/quan-tri/khach-hang/:id`.
 *
 * Khoá theo `id` chứ không theo email: email là thứ khách tự sửa được ở
 * `/tai-khoan`, và một link hồ sơ đã lưu không được hỏng sau lần Lưu đầu tiên
 * (cùng lý do `getAdminProduct` khoá theo `id` chứ không theo `slug`, §B.12.1).
 *
 * `throw` khi không tìm thấy để `useQuery` rơi vào nhánh `isError` và trang hiện
 * `ErrorState` — đây cũng là đường duy nhất kiểm được nhánh lỗi ở lớp mock, vì
 * mock không phát request nào để mà chặn.
 *
 * Khi có backend: `const { data } = await client.get(`/admin/customers/${id}`); return data`
 */
export async function getAdminUser(id: number): Promise<User> {
  await delay(250)
  const user = readPublicUsers().find((record) => record.id === id)
  if (!user) throw new Error(`Không tìm thấy khách hàng #${id}.`)
  return user
}
