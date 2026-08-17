import { Banknote, Landmark, QrCode, Wallet } from 'lucide-react'
import type { PaymentMethod } from '@/types'

export interface PaymentOption {
  value: PaymentMethod
  label: string
  description: string
  icon: React.ComponentType<{ size?: number }>
}

/**
 * Tách khỏi `PaymentMethodPicker.tsx` để file đó chỉ export component
 * (điều kiện để React Fast Refresh hoạt động). Trang đặt hàng thành công
 * cũng dùng danh sách này để hiển thị tên phương thức đã chọn.
 */
export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: 'cod',
    label: 'Thanh toán khi nhận hàng',
    description: 'Trả tiền mặt cho nhân viên giao hàng',
    icon: Banknote,
  },
  {
    value: 'bank_transfer',
    label: 'Chuyển khoản ngân hàng',
    description: 'Thông tin tài khoản hiện sau khi đặt hàng',
    icon: Landmark,
  },
  {
    value: 'momo',
    label: 'Ví MoMo',
    description: 'Quét mã QR bằng ứng dụng MoMo',
    icon: Wallet,
  },
  {
    value: 'vnpay',
    label: 'VNPay',
    description: 'Quét mã QR qua ứng dụng ngân hàng',
    icon: QrCode,
  },
]
