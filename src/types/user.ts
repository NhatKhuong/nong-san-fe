export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  avatar: string | null
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
