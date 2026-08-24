/**
 * Bảng màu của biểu đồ quản trị — **chuỗi `var(--color-*)`, không phải mã màu**.
 *
 * Recharts render **SVG trong DOM** (khác Chart.js / ApexCharts vẽ trên canvas),
 * nên `fill="var(--color-primary)"` được chính trình duyệt giải ra token khai ở
 * `@theme` trong `src/index.css`. Nhờ vậy biểu đồ dùng đúng bảng màu đã kiểm
 * tương phản WCAG AA mà **không phải thêm token `--color-chart-*` nào** — đây là
 * một trong các lý do ADR 0003 chọn Recharts.
 *
 * File này **cố ý không phải component**: `RevenueChart.tsx` và
 * `OrdersByStatusChart.tsx` chỉ được export component, trộn hằng số vào đó sẽ
 * làm React Fast Refresh mất tác dụng và oxlint (`react/only-export-components`)
 * cảnh báo — cùng lệ với `buttonStyles.ts`, `adminNav.ts`, `orderStatus.ts`.
 *
 * ⚠️ **Không hardcode mã màu ở đây.** Một chuỗi `#4a7c2a` lọt vào là bảng màu có
 * hai nguồn chân lý, và lần đổi token kế tiếp sẽ chỉ đổi được một nửa giao diện.
 * Cần một sắc độ chưa có thì thêm token vào `src/index.css` (đổi design token là
 * tình huống phải hỏi Owner — `documents/coding-conventions.md` §8.1), không tự
 * pha màu tại đây.
 */
export const CHART_COLORS = {
  /** Màu thương hiệu — chuỗi doanh thu, cột trạng thái "tích cực". */
  primary: 'var(--color-primary)',
  /** Cam đất — dành riêng cho trạng thái `cancelled`, thứ cần đọc ra ngay. */
  accent: 'var(--color-accent)',
  /** Sắc nhạt của màu thương hiệu — các trạng thái đang trên đường xử lý. */
  primaryLight: 'var(--color-primary-light)',
  /** Xám chữ nhạt — trục, nhãn, lưới. Không dùng cho chuỗi dữ liệu. */
  inkLight: 'var(--color-ink-light)',
} as const

/**
 * Kiểu chữ dùng chung cho trục của mọi biểu đồ.
 *
 * Recharts đặt `<text>` thẳng trong SVG nên class Tailwind của phần tử cha
 * không xuống tới đây; kích thước và màu phải truyền qua prop `tick`.
 */
export const CHART_AXIS_TICK = {
  fill: CHART_COLORS.inkLight,
  fontSize: 11,
} as const
