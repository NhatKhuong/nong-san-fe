import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatVND } from '@/lib/format'
import { CHART_AXIS_TICK, CHART_COLORS } from './chartTheme'

interface RevenueChartProps {
  /**
   * Đúng `days` điểm, tăng dần theo ngày, `date` dạng `YYYY-MM-DD` — **đã
   * zero-fill bởi lớp API**, ngày không có đơn là `revenue: 0`.
   *
   * Component **không tự vá lỗ hổng**: nhận thiếu điểm thì đường sẽ nối thẳng
   * qua khoảng trống và đọc thành "doanh thu đều". Zero-fill là trách nhiệm của
   * backend (`documents/API_CONTRACT.md` §B.12.4), và vá ở đây nghĩa là mọi
   * client khác — Android, iOS — phải tự vá lại y hệt.
   */
  data: { date: string; revenue: number }[]
}

/** "2026-08-24" → "24/08". Trục ngày không cần năm, 30 nhãn có năm là không đọc nổi. */
function toAxisLabel(date: string): string {
  const [, month, day] = date.split('-')
  return `${day}/${month}`
}

/** "2026-08-24" → "24/08/2026" cho tooltip, nơi có chỗ cho đủ ngày tháng. */
function toTooltipLabel(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

/** 1.250.000 → "1,3tr" — trục dọc chỉ cần độ lớn, con số đủ nằm trong tooltip. */
function toCompactVND(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`
  return String(amount)
}

/**
 * Doanh thu theo từng ngày trong khoảng đang chọn.
 *
 * **Một trong hai file duy nhất được `import` recharts** (cùng
 * `OrdersByStatusChart.tsx`), và chỉ `pages/admin/AdminOverviewPage.tsx` được
 * `import` file này — không barrel file nào re-export, không file nào dưới
 * `components/ui/` chạm tới. Ba luật đó là điều kiện để recharts nằm trong chunk
 * riêng thay vì chunk chính; mất một luật là **mọi khách hàng phải tải ~100 KB
 * cho một màn họ không bao giờ mở** (ADR 0003).
 *
 * Màu lấy từ `chartTheme.ts` dưới dạng chuỗi `var(--color-*)`. Recharts render
 * SVG trong DOM nên trình duyệt tự giải các biến đó ra token của `@theme` —
 * không có mã màu nào viết cứng ở đây, và không token mới nào phải thêm vào
 * `src/index.css`.
 *
 * `dot` được bật **có chủ đích**: mỗi ngày là một chấm nhìn thấy được, nên "đủ
 * 30 điểm kể cả ngày không có đơn" là thứ đếm được trên DOM
 * (`.recharts-dot`) chứ không phải một nhận xét bằng mắt. Đường liền mạch trông
 * y hệt nhau dù có 30 điểm hay 12 (`coding-conventions.md` §8.2).
 */
export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.inkLight} strokeOpacity={0.15} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={toAxisLabel}
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={toCompactVND}
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value) => [formatVND(Number(value)), 'Doanh thu']}
            labelFormatter={(label) => toTooltipLabel(String(label))}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--color-line)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-ink-muted)' }}
            itemStyle={{ color: 'var(--color-primary-dark)' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill={CHART_COLORS.primary}
            fillOpacity={0.12}
            dot={{ r: 2.5, fill: CHART_COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
