const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

/**
 * Định dạng tiền tệ Việt Nam: 449000 → "449.000 ₫".
 * Đây là cách DUY NHẤT được phép hiển thị giá trong toàn dự án.
 */
export function formatVND(amount: number): string {
  return vndFormatter.format(amount)
}

/**
 * Tính phần trăm giảm giá để hiển thị badge: (545000, 449000) → 18.
 * Trả về 0 nếu không có giảm giá hợp lệ.
 */
export function calcDiscountPercent(price: number, salePrice?: number | null): number {
  if (!salePrice || salePrice >= price || price <= 0) return 0
  return Math.round(((price - salePrice) / price) * 100)
}

/** Giá thực tế khách phải trả (ưu tiên giá khuyến mãi). */
export function effectivePrice(price: number, salePrice?: number | null): number {
  return salePrice && salePrice < price ? salePrice : price
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Định dạng ngày kiểu Việt Nam: "2026-08-16" → "16/08/2026". */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate))
}
