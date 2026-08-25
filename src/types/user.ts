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

/**
 * Người dùng đúng như backend trả về (`UserResponse` của Swagger).
 *
 * **Không có `role`** — đúng 5 trường. Vai trò chỉ nằm trong claim của JWT và
 * được giải ở client bằng `getRoleFromToken()` (`src/lib/jwt.ts`). `User.role`
 * của ADR 0002 vẫn **bắt buộc**; ticket này chỉ đổi *nguồn* của nó, không nới
 * lỏng kiểu.
 */
export type ApiUser = Omit<User, 'role'>

/**
 * Phản hồi đăng nhập / đăng ký / gia hạn phiên.
 *
 * Trường access token tên là **`token`**, không phải `accessToken`.
 *
 * `refreshToken` **bắt buộc**: refresh của backend là xoay vòng, mỗi response cấp
 * một cặp mới và thu hồi chuỗi cũ ngay trong cùng giao dịch — `client.ts` phải ghi
 * đè **cả hai**, ghi thiếu một cái là lần gia hạn sau ăn `401` (ADR 0004).
 */
export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}
