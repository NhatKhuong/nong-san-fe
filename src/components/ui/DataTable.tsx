import { cn } from '@/lib/utils'
import type { DataTableProps } from './dataTable.types'

/**
 * Bảng dữ liệu dùng chung cho khu quản trị.
 *
 * **Một component generic, không phải bộ `<Table.Row>` / `<Table.Cell>`.** Bốn
 * bảng của khu quản trị đều là "mảng bản ghi × danh sách cột"; API kiểu compound
 * bắt mỗi trang tự viết lại vòng `map`, tự nhớ căn phải cột số và tự nhớ đặt
 * `<caption>` — tức là ba chỗ để quên, nhân với bốn bảng.
 *
 * **Bảng này chỉ vẽ dòng.** Loading / lỗi / rỗng nằm **ngoài** nó, ở trang, dùng
 * `Skeleton`, `ErrorState`, `EmptyState` sẵn có (CLAUDE.md §5). Nhét ba nhánh đó
 * vào đây thì khung chờ luôn có hình dạng của bảng, kể cả ở màn hình mà khung
 * chờ đúng phải là dạng khác — và trang mất quyền quyết định thông điệp rỗng.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  onRowClick,
}: DataTableProps<T>) {
  const isInteractive = onRowClick !== undefined

  return (
    /*
     * Bảng quản trị luôn rộng hơn màn hình điện thoại. Cuộn ngang nằm ở lớp bọc
     * này để chỉ mình bảng cuộn — cho cả trang cuộn ngang thì sidebar và tiêu đề
     * cũng trôi theo.
     */
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-max border-collapse text-sm">
        {/* `sr-only` chứ không phải `hidden`: `hidden` thì trình đọc màn hình cũng bỏ qua. */}
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr className="border-b border-line bg-surface text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-3 font-semibold whitespace-nowrap text-ink',
                  column.align === 'right' && 'text-right',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              /*
               * Dòng bấm được phải vào được bằng bàn phím. `<tr>` không tự nhận
               * focus nên phải thêm `tabIndex` và tự xử lý Enter — nếu chỉ gắn
               * `onClick`, cả bảng vô hình với người dùng bàn phím.
               */
              tabIndex={isInteractive ? 0 : undefined}
              onClick={isInteractive ? () => onRowClick(row) : undefined}
              onKeyDown={
                isInteractive
                  ? (event) => {
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      onRowClick(row)
                    }
                  : undefined
              }
              className={cn(
                'border-b border-line last:border-b-0',
                isInteractive && 'cursor-pointer transition hover:bg-surface',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 align-middle text-ink',
                    column.align === 'right' && 'text-right',
                    column.className,
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
