/**
 * Số điện thoại di động Việt Nam theo các đầu số hiện hành: 03, 05, 07, 08, 09.
 * Khai báo một chỗ vì đang dùng ở form thanh toán, đăng ký và sổ địa chỉ —
 * để mỗi form tự viết lại thì sửa quy tắc sẽ sót.
 */
export const PHONE_PATTERN = /^0[35789]\d{8}$/

export const PHONE_MESSAGE = 'Số điện thoại không hợp lệ (ví dụ: 0901234567).'
