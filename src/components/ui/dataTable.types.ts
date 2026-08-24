/**
 * Kiểu của `DataTable`. Tách khỏi `DataTable.tsx` để file đó chỉ export
 * component — cùng lý do đã tách `buttonStyles.ts` và `lazyPages.ts`: một file
 * trộn component với thứ khác sẽ làm React Fast Refresh mất tác dụng và oxlint
 * (`react/only-export-components`) cảnh báo.
 */

/**
 * Mô tả một cột.
 *
 * `render` nhận cả dòng chứ không phải một ô: phần lớn cột của khu quản trị ghép
 * nhiều trường lại (ảnh + tên, giá gốc + giá sale) hoặc cần chính `row` để dựng
 * link, nên kiểu `accessor: keyof T` sẽ hết dùng ngay ở cột thứ hai.
 */
export interface DataTableColumn<T> {
  /** Định danh cột, dùng làm React key — không nhất thiết trùng tên trường. */
  key: string
  header: string
  /** `right` cho cột số (giá, tồn kho) để các chữ số thẳng hàng. */
  align?: 'left' | 'right'
  /** Class thêm cho cả ô `<th>` và `<td>` của cột, ví dụ để đặt bề rộng. */
  className?: string
  render: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  /** Khoá ổn định của dòng — dùng `id` hoặc `code`, KHÔNG dùng chỉ số mảng. */
  rowKey: (row: T) => string | number
  /**
   * `<caption>` ẩn về mặt thị giác, **bắt buộc**.
   *
   * Trình đọc màn hình đọc caption trước khi vào bảng; thiếu nó thì người dùng
   * nghe một loạt tiêu đề cột mà không biết đang ở bảng nào — và khu quản trị có
   * bốn bảng nhìn na ná nhau. Đây là lý do nó không phải prop tuỳ chọn.
   */
  caption: string
  /** Bấm vào dòng — dùng để mở màn chi tiết. Bỏ trống thì dòng không tương tác. */
  onRowClick?: (row: T) => void
}
