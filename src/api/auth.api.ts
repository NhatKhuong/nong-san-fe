import { delay } from '@/lib/utils'
import { clearAuthToken, getAuthToken, setAuthToken } from './client'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
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

const SEED_USERS: StoredUser[] = [DEMO_USER, DEMO_ADMIN]

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
 * 3. bảo đảm hai tài khoản demo có mặt,
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

function issueToken(user: User): string {
  return `mock-jwt.${btoa(String(user.id))}.${Date.now()}`
}

/**
 * Id của tài khoản đang đăng nhập, giải ra từ token.
 *
 * Backend thật lấy id từ JWT chứ không nhận từ client, nên mock cũng phải vậy —
 * đó là lý do `CreateOrderPayload` không có trường `userId`. Trả `null` khi chưa
 * đăng nhập (khách vãng lai vẫn đặt hàng được).
 */
export function getCurrentUserId(): number | null {
  const token = getAuthToken()
  if (!token) return null
  try {
    const id = Number(atob(token.split('.')[1] ?? ''))
    return Number.isInteger(id) ? id : null
  } catch {
    return null
  }
}

/**
 * Đăng nhập.
 * Khi có backend: `const { data } = await client.post('/auth/login', payload); setAuthToken(data.token); return data`
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  await delay(600)
  const matched = readUsers().find(
    (user) =>
      user.email.toLowerCase() === payload.email.trim().toLowerCase() &&
      user.password === payload.password,
  )
  if (!matched) throw new Error('Email hoặc mật khẩu không đúng.')

  const user = toPublicUser(matched)
  const token = issueToken(user)
  setAuthToken(token)
  return { user, token }
}

/**
 * Đăng ký tài khoản mới — **luôn là `customer`**.
 *
 * `RegisterPayload` cố ý không có `role`, và backend cũng phải **bỏ qua mọi
 * trường `role` gửi lên trong body**: vai trò chỉ được gán ở phía server, nếu
 * không thì ai cũng tự cấp quyền quản trị cho mình được (ADR 0002).
 *
 * Khi có backend: `const { data } = await client.post('/auth/register', payload); setAuthToken(data.token); return data`
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  await delay(600)
  const users = readUsers()
  const isTaken = users.some(
    (user) => user.email.toLowerCase() === payload.email.trim().toLowerCase(),
  )
  if (isTaken) throw new Error('Email này đã được đăng ký.')

  const newUser: StoredUser = {
    id: Date.now(),
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    avatar: null,
    role: 'customer',
    password: payload.password,
  }
  writeUsers([...users, newUser])

  const user = toPublicUser(newUser)
  const token = issueToken(user)
  setAuthToken(token)
  return { user, token }
}

/**
 * Đăng xuất.
 * Khi có backend: `await client.post('/auth/logout')` rồi mới xoá token.
 */
export async function logout(): Promise<void> {
  await delay(150)
  clearAuthToken()
}

/**
 * Gửi email đặt lại mật khẩu.
 * Khi có backend: `await client.post('/auth/forgot-password', { email })`
 */
export async function forgotPassword(email: string): Promise<void> {
  await delay(600)
  if (!email.trim()) throw new Error('Vui lòng nhập email.')
}

/**
 * Cập nhật thông tin cá nhân.
 * Khi có backend: `const { data } = await client.put('/auth/me', payload); return data`
 */
export async function updateProfile(payload: Partial<User> & { id: number }): Promise<User> {
  await delay(500)
  const users = readUsers()
  const index = users.findIndex((user) => user.id === payload.id)
  if (index === -1) throw new Error('Không tìm thấy tài khoản.')

  const isEmailTaken = users.some(
    (user) =>
      user.id !== payload.id &&
      user.email.toLowerCase() === (payload.email ?? '').trim().toLowerCase(),
  )
  if (isEmailTaken) throw new Error('Email này đã được tài khoản khác sử dụng.')

  /*
   * `id`, `role` và `password` không được phép ghi đè từ payload. `role` bị chốt
   * lại y như `id`: sửa hồ sơ không được phép tự nâng quyền, và `PUT /auth/me`
   * ở backend cũng phải bỏ qua trường này (ADR 0002).
   */
  const updated: StoredUser = {
    ...users[index],
    ...payload,
    id: users[index].id,
    role: users[index].role,
  }
  users[index] = updated
  writeUsers(users)
  return toPublicUser(updated)
}

/**
 * Đổi mật khẩu của tài khoản đang đăng nhập.
 * Khi có backend: `await client.put('/auth/password', payload)`
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await delay(600)

  const userId = getCurrentUserId()
  if (userId === null) throw new Error('Vui lòng đăng nhập lại.')

  const users = readUsers()
  const index = users.findIndex((user) => user.id === userId)
  if (index === -1) throw new Error('Không tìm thấy tài khoản.')

  if (users[index].password !== payload.currentPassword) {
    throw new Error('Mật khẩu hiện tại không đúng.')
  }

  users[index] = { ...users[index], password: payload.newPassword }
  writeUsers(users)
}
