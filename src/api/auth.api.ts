import { client, clearSession, getAuthToken, getRefreshToken, setSession } from './client'
import { getRoleFromToken, getUserIdFromToken } from '@/lib/jwt'
import type {
  ApiUser,
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
  UserRole,
} from '@/types'

const MOCK_USERS_KEY = 'nss_mock_users'

/** Bản ghi user trong mock store — có thêm password mà `User` không chứa. */
interface StoredUser extends User {
  password: string
}

/**
 * Bản ghi đọc lên từ localStorage: máy nào đã chạy dự án trước khi có `role`
 * thì dữ liệu còn thiếu trường đó. Chỉ dùng bên trong `readUsers()` — mọi thứ
 * ra khỏi hàm đó đã là `StoredUser` đầy đủ.
 */
type LegacyStoredUser = Omit<StoredUser, 'role'> & { role?: UserRole }

/** Tài khoản demo có sẵn để đăng nhập thử ngay mà không cần đăng ký. */
const DEMO_USER: StoredUser = {
  id: 1,
  fullName: 'Nguyễn Văn An',
  email: 'demo@nongsansach.vn',
  phone: '0901234567',
  avatar: null,
  role: 'customer',
  password: '123456',
}

/** Tài khoản quản trị demo — cách duy nhất để thử vai trò `admin` khi chưa có backend. */
const DEMO_ADMIN: StoredUser = {
  id: 2,
  fullName: 'Trần Quản Trị',
  email: 'admin@nongsansach.vn',
  phone: '0907654321',
  avatar: null,
  role: 'admin',
  password: '123456',
}

/**
 * Khách hàng mẫu — nguồn dữ liệu của màn `/quan-tri/khach-hang`.
 *
 * **Id 3–7 bị ghim, không được đổi.** Seed đơn hàng của backlog 0005 (đọc qua
 * `orderStore.ts`) đã gán `userId` theo đúng năm id này — 3 (5 đơn) · 4 (4) ·
 * 5 (4) · 6 (4) · 7 (4). Gieo id khác thì link "Xem hồ sơ khách hàng #n" ở màn
 * chi tiết đơn trỏ tới một hồ sơ không tồn tại: đơn vẫn hiện đúng, chỉ có cái
 * link là chết — hỏng đúng ở chỗ không lộ ra trên màn hình nào.
 *
 * Họ tên / email / SĐT của năm người đó **chép nguyên từ khối `shipping` của
 * chính các đơn ấy**. Bịa tên khác thì màn hình tự mâu thuẫn với chính nó: đơn
 * ghi "Lê Thị Bích · 0912345678" mà hồ sơ khách #3 lại mang tên khác.
 *
 * Id 8–12 là khách **chưa có đơn nào** — có chủ đích: đó là nhánh "khách hàng
 * chưa mua gì" của màn chi tiết, và không có bản ghi nào như vậy thì `EmptyState`
 * của khối lịch sử đơn không bao giờ được nhìn thấy trước lúc bàn giao.
 *
 * Mật khẩu để giống hai tài khoản demo: lớp mock cần một chuỗi ở trường đó, và
 * `toPublicUser()` cắt nó đi trước khi bất cứ thứ gì rời khỏi file này.
 */
const SEED_CUSTOMERS: StoredUser[] = [
  {
    id: 3,
    fullName: 'Lê Thị Bích',
    email: 'bich.le@example.com',
    phone: '0912345678',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 4,
    fullName: 'Trần Minh Khoa',
    email: 'khoa.tran@example.com',
    phone: '0987654321',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 5,
    fullName: 'Phạm Thu Hà',
    email: 'ha.pham@example.com',
    phone: '0356789012',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 6,
    fullName: 'Võ Quốc Bảo',
    email: 'bao.vo@example.com',
    phone: '0778901234',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 7,
    fullName: 'Đặng Kim Ngân',
    email: 'ngan.dang@example.com',
    phone: '0898765432',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 8,
    fullName: 'Ngô Hải Yến',
    email: 'yen.ngo@example.com',
    phone: '0345678901',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 9,
    fullName: 'Lý Tuấn Kiệt',
    email: 'kiet.ly@example.com',
    phone: '0369852147',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 10,
    fullName: 'Trương Mỹ Duyên',
    email: 'duyen.truong@example.com',
    phone: '0384567123',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 11,
    fullName: 'Dương Anh Tú',
    email: 'tu.duong@example.com',
    phone: '0794561238',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
  {
    id: 12,
    fullName: 'Cao Thanh Trúc',
    email: 'truc.cao@example.com',
    phone: '0865321479',
    avatar: null,
    role: 'customer',
    password: '123456',
  },
]

const SEED_USERS: StoredUser[] = [DEMO_USER, DEMO_ADMIN, ...SEED_CUSTOMERS]

/**
 * Đọc danh sách user: **đọc → chuẩn hoá → bảo đảm → ghi lại**.
 *
 * Trước đây hàm này chỉ gieo khi khoá localStorage **vắng mặt**. Cách đó hỏng
 * ngay lúc hợp đồng đổi: máy nào đã chạy dự án thì khoá đã tồn tại, nên sẽ không
 * bao giờ nhận được tài khoản quản trị và mọi bản ghi cũ vĩnh viễn thiếu `role`.
 * Vì vậy mỗi lần đọc đều:
 *
 * 1. parse những gì đang có (hỏng thì coi như rỗng),
 * 2. backfill `role: 'customer'` cho bản ghi cũ — mặc định về **quyền thấp
 *    nhất**, không ai bị nâng quyền nhầm,
 * 3. bảo đảm **mọi** bản ghi trong `SEED_USERS` có mặt — hai tài khoản demo và
 *    mười khách hàng mẫu của backlog 0006. Bước này chạy ở **mỗi lần đọc**, nên
 *    máy đã chạy dự án từ trước (khoá `nss_mock_users` đã tồn tại, chỉ có đúng
 *    một bản ghi) vẫn nhận đủ khách mới mà không phải xoá localStorage,
 * 4. chỉ ghi lại khi thật sự có gì đó thay đổi.
 *
 * Đối chiếu tài khoản gieo theo **cả id lẫn email**: nếu ai đó đã đăng ký trùng
 * email demo thì gieo thêm sẽ tạo hai bản ghi cùng email và `login` chọn bừa.
 */
function readUsers(): StoredUser[] {
  let stored: LegacyStoredUser[] = []
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed)) stored = parsed as LegacyStoredUser[]
  } catch {
    // Dữ liệu hỏng thì coi như chưa có gì và gieo lại từ đầu bên dưới.
  }

  let changed = stored.some((record) => record.role === undefined)
  const users: StoredUser[] = stored.map((record) => ({
    ...record,
    role: record.role ?? 'customer',
  }))

  for (const seed of SEED_USERS) {
    const exists = users.some(
      (user) => user.id === seed.id || user.email.toLowerCase() === seed.email,
    )
    if (!exists) {
      users.push(seed)
      changed = true
    }
  }

  if (changed) writeUsers(users)
  return users
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

/** Bỏ password trước khi trả ra ngoài — mô phỏng đúng cách backend trả DTO. */
function toPublicUser({ password: _password, ...user }: StoredUser): User {
  return user
}

/**
 * Toàn bộ tài khoản, **đã bỏ `password`** — điểm đọc duy nhất của
 * `nss_mock_users` dành cho các file khác trong `src/api/`.
 *
 * Chỉ chạy ở client và **không map sang endpoint nào**: `adminUsers.api.ts` cần
 * đọc kho tài khoản mà kho đó nằm trong file này, nên hàm này đóng vai trò
 * `productStore.ts` / `orderStore.ts` của tập `nss_mock_users`. Khi ghép Spring
 * Boot thì xoá nó cùng lúc với `getCurrentUserId()` (`API_CONTRACT.md` §E.3).
 *
 * Trả `User[]` chứ **không** trả `StoredUser[]`: đi qua `toPublicUser()` ngay
 * tại ranh giới này thì không lời gọi nào ở nơi khác còn cầm được `password`,
 * kể cả khi ai đó quên map. Chặn bằng kiểu rẻ hơn chặn bằng trí nhớ.
 */
export function readPublicUsers(): User[] {
  return readUsers().map(toPublicUser)
}

/**
 * Phản hồi xác thực **đúng như backend gửi**: `user` KHÔNG có `role`
 * (`UserResponse` của Swagger đúng 5 trường). Vai trò chỉ nằm trong claim JWT.
 */
interface RawAuthResponse {
  user: ApiUser
  token: string
  refreshToken: string
}

/**
 * Lấp `User.role` bằng claim giải từ chính access token vừa nhận.
 *
 * `User.role` là **bắt buộc** (ADR 0002) nhưng backend không gửi nó; ADR 0004
 * chốt nguồn thay thế là payload JWT, không verify chữ ký, chỉ để vẽ giao diện.
 * Không đọc được thì `getRoleFromToken` mặc định `'customer'` — quyền thấp nhất.
 */
function toAuthResponse(data: RawAuthResponse): AuthResponse {
  return { ...data, user: { ...data.user, role: getRoleFromToken(data.token) } }
}

/**
 * Id của tài khoản đang đăng nhập, giải ra từ token.
 *
 * Backend thật lấy id từ JWT chứ không nhận từ client, nên mock cũng phải vậy —
 * đó là lý do `CreateOrderPayload` không có trường `userId`. Trả `null` khi chưa
 * đăng nhập (khách vãng lai vẫn đặt hàng được).
 */
export function getCurrentUserId(): number | null {
  return getUserIdFromToken(getAuthToken())
}

/**
 * Đăng nhập — `POST /auth/login`.
 *
 * Sai email và sai mật khẩu trả **cùng một** `401` với **cùng một** `detail`.
 * Đó là chủ ý chống dò tài khoản: giao diện **không được đoán thêm** xem ca nào
 * đã xảy ra. Chuỗi hiển thị lấy thẳng từ `ApiError.message`.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await client.post<RawAuthResponse>('/auth/login', payload)
  setSession(data.token, data.refreshToken)
  return toAuthResponse(data)
}

/**
 * Đăng ký tài khoản mới — **luôn là `customer`**.
 *
 * `RegisterPayload` cố ý không có `role`, và backend cũng phải **bỏ qua mọi
 * trường `role` gửi lên trong body**: vai trò chỉ được gán ở phía server, nếu
 * không thì ai cũng tự cấp quyền quản trị cho mình được (ADR 0002).
 *
 * `POST /auth/register` **đăng nhập luôn**: trả `AuthResponse` chứ không phải
 * `201` rỗng, nên không cần gọi `login()` nối đuôi.
 *
 * Vai trò vẫn do **server** gán (luôn `CUSTOMER`) — `RegisterPayload` cố ý không
 * có `role`, và backend bỏ qua mọi trường `role` gửi lên (ADR 0002).
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await client.post<RawAuthResponse>('/auth/register', payload)
  setSession(data.token, data.refreshToken)
  return toAuthResponse(data)
}

/**
 * Đăng xuất — `POST /auth/logout`, cần access token trong header **và**
 * `{refreshToken}` trong body để server thu hồi đúng chuỗi đó.
 *
 * `clearSession()` nằm trong `finally`: phiên trên **máy này** phải sạch kể cả khi
 * mạng hỏng. Lỗi của request bị nuốt có chủ đích — đăng xuất không được phép thất
 * bại ở phía người dùng. Ném lỗi ra ngoài thì `onSuccess` của `useLogout` không
 * chạy, giao diện vẫn hiện "đang đăng nhập" trong khi token đã bị xoá — trạng thái
 * tệ hơn hẳn so với việc bỏ qua một chuỗi refresh không thu hồi được.
 *
 * Server trả `204` kể cả khi chuỗi đã bị thu hồi từ trước, nên ca gọi hai lần là vô hại.
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    await client.post('/auth/logout', { refreshToken })
  } catch {
    // Đã ghi lý do ở JSDoc: phiên phía client vẫn bị xoá ở `finally`.
  } finally {
    clearSession()
  }
}

/**
 * Gia hạn phiên — `POST /auth/refresh`, đổi một refresh token còn hạn lấy **cặp mới**.
 *
 * Có mặt để khớp `API_CONTRACT.md` §B.4. **`client.ts` KHÔNG gọi hàm này**: nó tự
 * gọi `/auth/refresh` bằng một axios trần, vừa để tránh đệ quy interceptor vừa để
 * khỏi tạo vòng import `client.ts` → `auth.api.ts` → `client.ts`.
 */
export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const { data } = await client.post<RawAuthResponse>('/auth/refresh', { refreshToken })
  setSession(data.token, data.refreshToken)
  return toAuthResponse(data)
}

/**
 * Gửi email đặt lại mật khẩu — `POST /auth/forgot-password`.
 *
 * **Luôn `204`, kể cả khi email không ứng với tài khoản nào** (§B.4 điều 5).
 * Giao diện **không được phân nhánh theo kết quả**: mọi ca thành công phải hiện
 * đúng **một** câu giống hệt nhau. Đoán thêm ở client là dựng lại đúng cái oracle
 * dò tài khoản mà backend vừa phải đi vá (§B.4 điều 6).
 *
 * **`204` không có nghĩa là email đã tới nơi** — chỉ nghĩa là yêu cầu đã được nhận.
 *
 * Endpoint công khai và **có giới hạn tần suất** theo cả IP lẫn email đích: vượt
 * ngưỡng trả `429`, mã mà `FALLBACK_BY_STATUS` (`lib/apiError.ts`) có câu riêng —
 * đừng để nó rơi xuống chuỗi mặc định.
 */
export async function forgotPassword(email: string): Promise<void> {
  await client.post('/auth/forgot-password', { email })
}

/**
 * Cập nhật thông tin cá nhân — `PUT /auth/me`.
 *
 * **Thân request được dựng bằng danh sách trắng ĐÚNG BA TRƯỜNG**, không phải bằng
 * cách trải `payload`. Ba lý do, cả ba đều là hợp đồng chứ không phải sở thích:
 *
 * 1. **`id` không đi lên.** Chủ sở hữu lấy **chỉ** từ claim `sub` của access token;
 *    endpoint không nhận `userId` qua query / path / body (§C.4.1). `id` còn nằm
 *    trong chữ ký là **di sản của thời mock** — chỗ gọi duy nhất (`ProfilePage`)
 *    vẫn truyền nó, nhưng nó dừng lại ở đây. Đổi chữ ký thuộc diện phải hỏi Owner
 *    (`coding-conventions.md` §8.1 điều 1), nên để lại cho một ticket riêng.
 * 2. **`avatar` không đi lên.** `UpdateProfileRequest` đúng ba trường
 *    `{fullName?, email?, phone?}` — không có `avatar`, dù `User` có (§B.4 điều 8).
 *    Backend bỏ qua trong im lặng, nên gửi thừa sẽ không báo lỗi ở đâu cả.
 * 3. **`role` không đi lên.** Vai trò chỉ được gán ở phía server (ADR 0002).
 *
 * **Phản hồi là `UserResponse` — đúng 5 trường, KHÔNG có `role`.** Phải bồi `role`
 * lại từ claim của token đang dùng, y như `login`/`register` làm qua
 * `toAuthResponse()`. Bỏ bước này thì `setUser` ghi đè bản cache bằng một `User`
 * thiếu vai trò, và **người dùng admin vừa sửa hồ sơ xong là mất menu Quản trị**.
 * Token không đổi sau khi sửa hồ sơ (kể cả khi đổi email), nên đọc lại vai trò từ
 * `getAuthToken()` là đúng nguồn.
 */
export async function updateProfile(payload: Partial<User> & { id: number }): Promise<User> {
  const { data } = await client.put<ApiUser>('/auth/me', {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
  })
  return { ...data, role: getRoleFromToken(getAuthToken()) }
}

/**
 * Đổi mật khẩu của tài khoản đang đăng nhập — `PUT /auth/password`, trả `204`.
 *
 * Tài khoản lấy từ claim `sub`, **không** nhận `userId` (§C.4.1) — vì vậy payload
 * đi thẳng lên, nó đã đúng hai trường của `ChangePasswordRequest`.
 *
 * **Sai `currentPassword` trả `422`, KHÔNG phải `401`.** Ranh giới này là cố ý:
 * `client.ts` coi `401` là "access token chết" và sẽ tự gọi `/auth/refresh`, nên
 * một lần gõ nhầm mật khẩu cũ mà trả `401` sẽ xoay vòng phiên vô cớ. Hai loại
 * `422` phân biệt bằng khoá `errors`: lỗi validate **có** `errors` (hiện đúng ô
 * nhập qua `ApiError.fieldErrors`), sai mật khẩu cũ **không có** (hiện ở banner).
 *
 * **Thành công thì backend thu hồi mọi refresh token của tài khoản TRỪ phiên đang
 * gọi** (claim `sid`). Tab hiện tại **không** bị đăng xuất; tab/thiết bị khác sẽ
 * hỏng ở lần gia hạn kế tiếp. Đó là hành vi đúng — đừng "chữa" nó ở client.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await client.put('/auth/password', payload)
}

/**
 * Đặt lại mật khẩu bằng token trong email — `POST /auth/reset-password`, trả `204`.
 *
 * Bước hai của luồng `forgotPassword`. **Endpoint công khai**: người gọi theo định
 * nghĩa là người không đăng nhập được, nên không có header `Authorization` và
 * `token` ở đây là **token dùng-một-lần trong query string của link email**, không
 * phải access token của phiên.
 *
 * **Ba ca hỏng — token sai, đã hết hạn, đã dùng — trả CÙNG MỘT `422` với CÙNG MỘT
 * `detail`** (§B.4 điều 7). Giao diện **không được phân nhánh** để đoán ca nào đã
 * xảy ra: tách ra là dựng lại đúng cái oracle dò tài khoản mà backend vừa phải đi
 * vá ở `forgot-password` (§B.4 điều 6). Chuỗi hiển thị lấy thẳng từ `ApiError.message`.
 *
 * **`422`, KHÔNG phải `401`** — cùng ranh giới đã ghi ở `changePassword`: `client.ts`
 * coi `401` là "access token chết" và sẽ gọi `/auth/refresh` cho một phiên không
 * tồn tại. Hai loại `422` vẫn phân biệt bằng khoá `errors`: lỗi validate **có**
 * (`ApiError.fieldErrors`), token không dùng được **không có** (hiện ở banner).
 *
 * **`204` KHÔNG trả token và hàm này KHÔNG gọi `setSession()`.** Đăng nhập giùm
 * người dùng ở đây là biến một token dùng-một-lần thành một phiên đăng nhập; hơn
 * nữa backend **thu hồi toàn bộ refresh token** của tài khoản khi đặt lại thành
 * công (khác `PUT /auth/password` giữ lại phiên đang gọi), vì giả định phải là
 * tài khoản đã bị chiếm. Nơi gọi điều hướng về trang đăng nhập.
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await client.post('/auth/reset-password', payload)
}
