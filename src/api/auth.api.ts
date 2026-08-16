import { delay } from '@/lib/utils'
import { clearAuthToken, setAuthToken } from './client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types'

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

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY)
    const stored = raw ? (JSON.parse(raw) as StoredUser[]) : []
    return [DEMO_USER, ...stored]
  } catch {
    return [DEMO_USER]
  }
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
  // Bỏ DEMO_USER ra khi ghi lại, vì nó không thuộc dữ liệu người dùng tạo.
  writeUsers([...users.filter((user) => user.id !== DEMO_USER.id), newUser])

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
  const users = readUsers().filter((user) => user.id !== DEMO_USER.id)
  const index = users.findIndex((user) => user.id === payload.id)

  if (index === -1) {
    // Tài khoản demo không lưu trong localStorage, chỉ trả về bản đã ghép.
    return { ...toPublicUser(DEMO_USER), ...payload }
  }

  const updated: StoredUser = { ...users[index], ...payload }
  users[index] = updated
  writeUsers(users)
  return toPublicUser(updated)
}
