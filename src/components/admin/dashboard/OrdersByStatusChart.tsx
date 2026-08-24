import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import type { OrderStatus } from '@/types'
import { CHART_AXIS_TICK, CHART_COLORS } from './chartTheme'

interface OrdersByStatusChartProps {
  /**
   * Đủ **cả năm** trạng thái, kể cả trạng thái đang có `count: 0` — lớp API bảo
   * đảm điều đó (`documents/API_CONTRACT.md` §B.12.4). Thiếu mốc rỗng thì cột
   * **nhảy chỗ** mỗi lần tải lại, và người xem quen mắt sẽ đọc nhầm cột.
   */
  data: { status: OrderStatus; count: number }[]
}

/**
 * Màu của từng cột — **ý nghĩa, không phải trang trí**.
 *
 * `cancelled` mang sắc cam `accent` vì đó là cột người xem cần nhận ra ngay;
 * `delivered` mang màu thương hiệu đậm vì đó là đích của vòng đời đơn; ba trạng
 * thái còn lại đang trên đường đi nên dùng sắc nhạt. Bảng này bắt buộc phủ đủ
 * `OrderStatus` — thêm trạng thái mới mà quên màu là lỗi biên dịch, không phải
 * một cột xám lặng lẽ.
 */
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: CHART_COLORS.primaryLight,
  confirmed: CHART_COLORS.primaryLight,
  shipping: CHART_COLORS.primaryLight,
  delivered: CHART_COLORS.primary,
  cancelled: CHART_COLORS.accent,
}

/**
 * Số đơn theo trạng thái trong khoảng đang chọn.
 *
 * File thứ hai — và cuối cùng — được `import` recharts. Xem `RevenueChart.tsx`
 * cho ba luật giữ thư viện này nằm ngoài chunk chính (ADR 0003).
 *
 * **`minPointSize={3}` và `LabelList` cùng giải một bài: cột bằng 0.**
 * Mặc định Recharts **không vẽ gì** cho `count: 0` — không rectangle, và vì
 * không có rectangle nên cũng không có nhãn. Cột đó biến mất khỏi biểu đồ và
 * trông y hệt như một trạng thái chưa bao giờ tồn tại, đúng thứ mà hợp đồng
 * "đủ 5 trạng thái kể cả `count: 0`" (§B.12.4) sinh ra để chặn. `minPointSize`
 * cho cột 0 một vạch 3px để nó có mặt, còn `LabelList` in con số thật ngay cạnh
 * đầu cột — vạch nói "trạng thái này tồn tại", con số nói "đang là 0". Thiếu
 * nhãn thì vạch 3px lại thành lời nói dối kiểu khác: trông như một giá trị nhỏ.
 *
 * Đây cũng là điều biến "đủ 5 cột" thành thứ **đếm được và đọc ra kết quả** trên
 * DOM (`.recharts-label-list text` — 5 node, mỗi node là một con số), thay vì
 * một khẳng định `svg` tồn tại: `svg` có sẵn cả khi chưa có dữ liệu nào
 * (`coding-conventions.md` §8.2). Phát hiện này đến từ chính lượt smoke đầu của
 * backlog 0007 — khoảng 7 ngày chỉ có 1 trạng thái khác 0, và biểu đồ vẽ đúng
 * **một** cột.
 *
 * **Cột nằm ngang (`layout="vertical"`), không phải cột đứng.** Nhãn trạng thái
 * là tiếng Việt có dấu và dài ("Chờ xác nhận", "Đã xác nhận"): xếp năm nhãn đó
 * dưới một trục ngang thì ở bề rộng 375px chúng chồng lên nhau thành một dải chữ
 * không đọc được. Để Recharts tự bỏ bớt nhãn còn tệ hơn — một cột không nhãn là
 * một cột không ai biết nó là trạng thái gì. Nằm ngang thì nhãn đọc từ trái sang
 * phải và có đủ chỗ ở mọi bề rộng. Phát hiện từ ảnh chụp 375px của lượt smoke
 * backlog 0007.
 */
export default function OrdersByStatusChart({ data }: OrdersByStatusChartProps) {
  const rows = data.map((point) => ({
    ...point,
    label: ORDER_STATUS_LABELS[point.status],
  }))

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 28, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke={CHART_COLORS.inkLight} strokeOpacity={0.15} horizontal={false} />
          <XAxis
            type="number"
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={92}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: CHART_COLORS.inkLight, fillOpacity: 0.08 }}
            formatter={(value) => [`${Number(value)} đơn`, 'Số đơn']}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--color-line)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-ink-muted)' }}
            itemStyle={{ color: 'var(--color-primary-dark)' }}
          />
          <Bar
            dataKey="count"
            name="Số đơn"
            radius={[0, 6, 6, 0]}
            minPointSize={3}
            isAnimationActive={false}
          >
            {rows.map((row) => (
              <Cell key={row.status} fill={STATUS_COLORS[row.status]} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              fill={CHART_COLORS.inkLight}
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
