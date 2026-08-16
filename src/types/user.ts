export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  avatar: string | null
}

export interface Address {
  id: number
  fullName: string
  phone: string
  province: string
  district: string
  ward: string
  street: string
  isDefault: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  phone: string
  password: string
}

/** Phản hồi đăng nhập/đăng ký — `token` sẽ là JWT thật khi ghép Spring Boot. */
export interface AuthResponse {
  user: User
  token: string
}
