import Rating from '@/components/ui/Rating'
import { cn } from '@/lib/utils'

interface RatingFilterProps {
  value: number | undefined
  onChange: (rating: number | undefined) => void
}

const LEVELS = [5, 4, 3]

export default function RatingFilter({ value, onChange }: RatingFilterProps) {
  return (
    <div className="space-y-1">
      {LEVELS.map((level) => {
        const isActive = value === level
        return (
          <button
            key={level}
            type="button"
            aria-pressed={isActive}
            // Bấm lại mức đang chọn thì bỏ lọc — tránh phải tìm nút "xoá" riêng.
            onClick={() => onChange(isActive ? undefined : level)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
              isActive
                ? 'bg-primary-soft text-primary-dark'
                : 'text-ink hover:bg-surface hover:text-primary',
            )}
          >
            <Rating value={level} />
            <span>{level === 5 ? '5 sao' : `từ ${level} sao trở lên`}</span>
          </button>
        )
      })}
    </div>
  )
}
