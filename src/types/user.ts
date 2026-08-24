/**
 * Vai trò của tài khoản — phản chiếu claim `role` trong JWT.
 *
 * **Bắt buộc, không phải `role?:`.** Optional nghĩa là mọi chỗ gọi phải so với
 * `undefined`, và TypeScript không bao giờ ép mock hay backend phải cung cấp
 * trường này. Dữ liệu cũ được xử lý ở đúng hai ranh giới hydrate
 * (`auth.api.ts` khi đọc `nss_mock_users`, `auth.store.ts` khi rehydrate
 * `nss_auth`) chứ không bằng cách nới lỏng kiểu.
 *
 * Vai trò **chỉ được gán ở phía server** — xem ADR 0002.
 */
export type UserRole = 'customer' | 'admin'

export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  avatar: string | null
  role: UserRole
}

/**
 * Một địa chỉ trong sổ địa chỉ của người dùng.
 *
 * LƯU Ý: `provinceCode` và `districtCode` được thêm ở Giai đoạn 7 — phải ghi vào
 * `docs/API_CONTRACT.md`. Lý do giữ **cả mã lẫn tên**: ô `<Select>` chọn địa giới
 * hành chính chạy theo mã, còn `ShippingInfo` của đơn hàng lưu tên. Nếu chỉ lưu
 * tên thì mỗi lần mở lại form phải tra ngược tên → mã, rất dễ vỡ khi tên đổi.
 */
export interface Address {
  id: number
  fullName: string
  phone: string
  provinceCode: string
  province: string
  districtCode: string
  district: string
  ward: string
  street: string
  isDefault: boolean
}

/** Dữ liệu tạo/sửa địa chỉ — `id` do backend cấp nên không nằm ở đây. */
export type AddressPayload = Omit<Address, 'id'>

export interface LoginPayload {
  email: string
  password: string
}

/**
 * Dữ liệu đăng ký.
 *
 * **Cố ý không có `role`.** `POST /auth/register` luôn tạo tài khoản `customer`
 * và bỏ qua mọi trường `role` gửi lên trong body — nếu client tự chọn được vai
 * trò thì ai cũng tự cấp quyền quản trị cho mình được (ADR 0002).
 */
export interface RegisterPayload {
  fullName: string
  email: string
  phone: string
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

/** Phản hồi đăng nhập/đăng ký — `token` sẽ là JWT thật khi ghép Spring Boot. */
export interface AuthResponse {
  user: User
  token: string
}
