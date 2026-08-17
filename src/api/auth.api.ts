import { delay } from '@/lib/utils'
import { clearAuthToken, getAuthToken, setAuthToken } from './client'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types'

const MOCK_USERS_KEY = 'nss_mock_users'

/** Bản ghi user trong mock store — có thêm password mà `User` không chứa. */
interface StoredUser extends User {
  password: string
}

/** Tài khoản demo có sẵn để đăng nhập thử ngay mà không cần đăng ký. */
const DEMO_USER: StoredUser = {
  id: 1,
  fullName: 'Nguyễn Văn An',
  email: 'demo@nongsansach.vn',
  phone: '0901234567',
  avatar: null,
  password: '123456',
}

/**
 * Đọc danh sách user, gieo sẵn tài khoản demo vào localStorage ở lần đọc đầu tiên.
 *
 * Trước đây hàm này trả về `[DEMO_USER, ...stored]` — demo không nằm trong
 * localStorage nên mọi thay đổi lên nó (sửa hồ sơ, đổi mật khẩu) đều biến mất
 * sau khi tải lại trang. Gieo một lần rồi chỉ đọc từ localStorage thì tài khoản
 * demo hành xử y hệt tài khoản do người dùng đăng ký.
 */
function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY)
    if (raw) return JSON.parse(raw) as StoredUser[]
  } catch {
    // Dữ liệu hỏng thì gieo lại từ đầu bên dưới.
  }
  writeUsers([DEMO_USER])
  return [DEMO_USER]
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
 * Đăng ký tài khoản mới.
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

  // `id` và `password` không được phép ghi đè từ payload.
  const updated: StoredUser = { ...users[index], ...payload, id: users[index].id }
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
