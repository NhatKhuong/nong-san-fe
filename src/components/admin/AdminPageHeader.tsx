interface AdminPageHeaderProps {
  /** Tiêu đề trang — render thành `<h1>`, mỗi trang đúng một cái. */
  title: string
  description?: string
  /** Nút hành động chính bên phải, ví dụ "Thêm sản phẩm". */
  action?: React.ReactNode
}

/**
 * Tiêu đề chuẩn của một trang quản trị.
 *
 * Tồn tại để `<h1>` nằm ở đúng một chỗ: khu quản trị có tám trang, mỗi trang tự
 * viết tiêu đề thì sẽ có trang dùng `<h2>` và thứ tự tiêu đề nhảy cấp (CLAUDE.md
 * §7). Nó cũng giữ nút hành động chính luôn ở cùng vị trí trên mọi màn.
 */
export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
