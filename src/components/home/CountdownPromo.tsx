import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { PROMO_END_DATE, ROUTES } from '@/lib/constants'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Trả về null khi mốc thời gian đã trôi qua — dùng để ẩn cả section. */
function getTimeLeft(target: number): TimeLeft | null {
  const diff = target - Date.now()
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownPromo() {
  const target = new Date(PROMO_END_DATE).getTime()
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(timer)
  }, [target])

  // Hết hạn thì không hiển thị gì, tránh đếm ngược ra số âm.
  if (!timeLeft) return null

  const units = [
    { value: timeLeft.days, label: 'Ngày' },
    { value: timeLeft.hours, label: 'Giờ' },
    { value: timeLeft.minutes, label: 'Phút' },
    { value: timeLeft.seconds, label: 'Giây' },
  ]

  return (
    <section className="relative overflow-hidden bg-primary-dark py-14">
      <div className="container-app flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-lg">
          <p className="text-sm font-semibold tracking-wider text-primary-light uppercase">
            Ưu đãi có hạn
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-white">
            Giảm ngay 20% cho 10 khách hàng đầu tiên mỗi ngày
          </h2>
          <p className="mt-3 text-white/80">
            Áp dụng cho toàn bộ rau củ và trái cây hữu cơ. Mã giảm giá tự động áp dụng ở bước
            thanh toán.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-3" role="timer" aria-label="Thời gian còn lại của chương trình">
            {units.map((unit) => (
              <div
                key={unit.label}
                className="flex size-19 flex-col items-center justify-center rounded-xl bg-white/95"
              >
                <span className="font-heading text-2xl font-bold text-primary-dark">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-xs text-ink-muted">{unit.label}</span>
              </div>
            ))}
          </div>

          <Link to={ROUTES.SHOP} className={buttonStyles('accent', 'lg')}>
            Mua sắm ngay
          </Link>
        </div>
      </div>
    </section>
  )
}
