import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatTileProps {
  /** Nhãn tiếng Việt của chỉ số, ví dụ "Doanh thu". */
  label: string
  /** Giá trị **đã định dạng sẵn** — tiền qua `formatVND()`, số qua `toLocaleString('vi-VN')`. */
  value: string
  icon: LucideIcon
  /** Dòng phụ giải thích phạm vi con số, ví dụ "30 ngày gần nhất". */
  hint?: string
  /**
   * `alert` chuyển ô sang sắc cam của `accent` — dành cho chỉ số **cần hành
   * động**, hiện chỉ có "Sắp hết hàng". Không dùng để trang trí: mọi ô đều nổi
   * bật thì không ô nào nổi bật.
   */
  tone?: 'default' | 'alert'
}

/**
 * Một ô chỉ số của màn Tổng quan.
 *
 * Component **"câm"** theo đúng `documents/coding-conventions.md` §3: nhận props,
 * không tự fetch, và **không tự định dạng số**. Định dạng nằm ở trang gọi nó vì
 * tiền phải đi qua `formatVND()` (§5) còn số đếm thì không — nhét cả hai vào đây
 * là ô này phải biết chỉ số nào là tiền.
 *
 * File này **không import recharts** dù nằm trong `components/admin/dashboard/`:
 * bốn ô chỉ số là phần mang ~80% giá trị của màn tổng quan và không cần thư viện
 * biểu đồ nào (ADR 0003, mục "Alternatives considered").
 */
export default function StatTile({ label, value, icon: Icon, hint, tone = 'default' }: StatTileProps) {
  const alert = tone === 'alert'

  return (
    <div className="rounded-card border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-ink-muted">{label}</p>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            alert ? 'bg-accent-soft text-accent' : 'bg-primary-soft text-primary',
          )}
        >
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>

      <p
        className={cn(
          'mt-3 font-heading text-2xl font-bold break-words',
          alert ? 'text-accent' : 'text-primary-dark',
        )}
      >
        {value}
      </p>

      {hint && <p className="mt-1 text-xs text-ink-light">{hint}</p>}
    </div>
  )
}
