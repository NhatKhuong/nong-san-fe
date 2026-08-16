import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  /** Điểm trung bình, thang 0–5. Hỗ trợ số lẻ (4.5 → nửa sao). */
  value: number
  reviewCount?: number
  size?: number
  className?: string
}

/**
 * Hiển thị 5 sao với phần lấp đầy theo tỉ lệ, dùng kỹ thuật chồng hai lớp
 * và cắt lớp trên bằng width — cho phép thể hiện chính xác cả 4.3 sao.
 */
export default function Rating({ value, reviewCount, size = 15, className }: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value))
  const percent = (clamped / 5) * 100

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="img"
      aria-label={`Đánh giá ${clamped.toFixed(1)} trên 5 sao${
        reviewCount ? `, ${reviewCount} lượt đánh giá` : ''
      }`}
    >
      <span className="relative inline-flex">
        <span className="flex text-line">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} size={size} fill="currentColor" strokeWidth={0} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-accent"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
          ))}
        </span>
      </span>

      {reviewCount !== undefined && (
        <span className="text-xs text-ink-muted">({reviewCount})</span>
      )}
    </div>
  )
}
