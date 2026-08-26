import { useState } from 'react'
import { Check, Tag, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/StateBlock'
import { formatVND } from '@/lib/format'
import { useActiveCoupons, useCoupon } from '@/hooks/useCart'
import { useCartStore } from '@/store/cart.store'

export default function CouponForm() {
  const [input, setInput] = useState('')
  const applyCoupon = useCartStore((state) => state.applyCoupon)
  const removeCoupon = useCartStore((state) => state.removeCoupon)

  const { couponCode, coupon, discount, isChecking, error } = useCoupon()
  const {
    data: activeCoupons,
    isError: activeCouponsFailed,
    error: activeCouponsError,
    refetch: retryActiveCoupons,
  } = useActiveCoupons()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    applyCoupon(trimmed)
    setInput('')
  }

  // Đã áp mã và mã hợp lệ → hiện thẻ xác nhận thay cho ô nhập.
  if (couponCode && coupon) {
    return (
      <div className="rounded-xl border border-primary bg-primary-soft p-4">
        <div className="flex items-center gap-2.5">
          <Check size={18} className="shrink-0 text-primary-dark" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary-dark">
              Đã áp dụng mã {coupon.code}
            </p>
            <p className="text-xs text-ink-muted">
              Giảm {formatVND(discount)} — {coupon.description}
            </p>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            aria-label="Bỏ mã giảm giá"
            className="shrink-0 rounded-lg p-1.5 text-ink-muted transition hover:bg-white hover:text-danger"
          >
            <X size={17} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-line p-4">
      <form onSubmit={handleSubmit}>
        <label htmlFor="coupon-input" className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Tag size={16} className="text-primary" aria-hidden="true" />
          Mã giảm giá
        </label>
        <div className="flex gap-2">
          <input
            id="coupon-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nhập mã"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            className="h-11 min-w-0 flex-1 rounded-lg border border-line px-4 text-sm uppercase outline-none transition placeholder:text-ink-light placeholder:normal-case focus:border-primary"
          />
          <Button type="submit" variant="outline" isLoading={isChecking}>
            Áp dụng
          </Button>
        </div>
      </form>

      {/* Mã đã nhập nhưng không hợp lệ — nêu rõ lý do từ lớp API */}
      {couponCode && error && (
        <p role="alert" className="mt-2.5 text-sm text-danger">
          {error}{' '}
          <button
            type="button"
            onClick={removeCoupon}
            className="font-semibold underline underline-offset-2"
          >
            Bỏ mã
          </button>
        </p>
      )}

      {/*
        Nhánh lỗi CHỈ của dải chip gợi ý — cố ý không thay cả hộp mã giảm giá:
        ô nhập phía trên phải dùng được tiếp để khách gõ tay mã vẫn áp được
        (Owner chốt ở backlog 0022).
      */}
      {activeCouponsFailed && (
        <div className="mt-3 border-t border-line pt-3">
          <ErrorState
            message={activeCouponsError?.message}
            onRetry={() => {
              void retryActiveCoupons()
            }}
          />
        </div>
      )}

      {activeCoupons && activeCoupons.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-2 text-xs text-ink-muted">Mã đang có:</p>
          <ul className="flex flex-wrap gap-2">
            {activeCoupons.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => applyCoupon(item.code)}
                  title={item.description}
                  className="rounded-full border border-dashed border-primary px-3 py-1 text-xs font-semibold text-primary-dark transition hover:bg-primary-soft"
                >
                  {item.code}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
