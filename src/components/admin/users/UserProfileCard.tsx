import { Mail, Phone, ShieldCheck, User as UserIcon } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import type { User } from '@/types'

interface UserProfileCardProps {
  user: User
  /** Số đơn đã đặt, lấy từ `getAdminOrders({ userId })` ở trang. */
  orderCount?: number
}

/**
 * Hồ sơ một khách hàng — **chỉ đọc, không có nút hành động nào**.
 *
 * Không nút sửa, không nút xoá, không nút khoá tài khoản, không ô đổi vai trò:
 * giai đoạn này Owner chốt màn khách hàng chỉ đọc (backlog 0006). Yêu cầu "cho
 * tôi khoá tài khoản này" sẽ đến, và khi đó nó là một ticket mới — chứ không
 * phải một nút được thêm lặng lẽ vào đây.
 *
 * Component "câm" theo CLAUDE.md §3: nhận `user` qua props, không tự fetch.
 * `orderCount` cũng do trang truyền xuống vì nó đến từ một truy vấn khác
 * (`getAdminOrders`), và card này không được biết tới hai nguồn dữ liệu.
 *
 * Ảnh đại diện là `avatar: string | null`; `null` là **mặc định của mọi tài
 * khoản mock**, không phải dữ liệu thiếu — nên chỗ đó vẽ chữ cái đầu tên thay vì
 * để một ô trống trông như lỗi tải ảnh.
 */
export default function UserProfileCard({ user, orderCount }: UserProfileCardProps) {
  const initial = user.fullName.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`Ảnh đại diện của ${user.fullName}`}
            loading="lazy"
            className="size-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-2xl font-semibold text-primary-dark"
          >
            {initial}
          </span>
        )}

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-ink">{user.fullName}</h2>
          <p className="mt-1 text-sm text-ink-muted">Mã khách hàng #{user.id}</p>
        </div>
      </div>

      <dl className="mt-5 space-y-4 text-sm">
        <Field icon={<Mail size={16} aria-hidden="true" />} label="Email">
          {/* `break-all`: email dài không được đẩy cả cột rộng ra ngoài card. */}
          <p className="break-all text-ink">{user.email}</p>
        </Field>

        <Field icon={<Phone size={16} aria-hidden="true" />} label="Số điện thoại">
          <p className="text-ink">{user.phone}</p>
        </Field>

        <Field icon={<ShieldCheck size={16} aria-hidden="true" />} label="Vai trò">
          <Badge tone={user.role === 'admin' ? 'new' : 'neutral'}>
            {user.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
          </Badge>
        </Field>

        {orderCount !== undefined && (
          <Field icon={<UserIcon size={16} aria-hidden="true" />} label="Số đơn đã đặt">
            <p className="text-ink">{orderCount} đơn</p>
          </Field>
        )}
      </dl>
    </div>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
        {icon}
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
