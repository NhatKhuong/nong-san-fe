import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import SeoMeta from '@/components/ui/SeoMeta'
import { buttonStyles } from '@/components/ui/buttonStyles'

/** Rút thông điệp đọc được cho người dùng từ thứ mà React Router ném ra. */
function describe(error: unknown): { heading: string; detail: string } {
  if (isRouteErrorResponse(error)) {
    return {
      heading: `Lỗi ${error.status}`,
      detail: error.statusText || 'Máy chủ không xử lý được yêu cầu này.',
    }
  }

  if (error instanceof Error) {
    return { heading: 'Đã có lỗi xảy ra', detail: error.message }
  }

  return {
    heading: 'Đã có lỗi xảy ra',
    detail: 'Không xác định được nguyên nhân. Vui lòng thử tải lại trang.',
  }
}

/**
 * Trang hiển thị khi có lỗi runtime hoặc lỗi loader.
 *
 * Tách hẳn khỏi `NotFoundPage`: trước Giai đoạn 9 hai thứ này dùng chung một
 * component, nên mọi lỗi thật đều hiện thành "404 Không tìm thấy trang" — người
 * dùng tưởng gõ sai địa chỉ, còn người sửa thì không biết là có lỗi.
 */
export default function ErrorPage() {
  const error = useRouteError()
  const { heading, detail } = describe(error)

  return (
    <>
      <SeoMeta
        title="Đã có lỗi xảy ra"
        description="Trang gặp sự cố ngoài dự kiến. Vui lòng thử tải lại."
      />

      <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-accent-soft text-accent">
          <AlertTriangle size={36} aria-hidden="true" />
        </span>

        <h1 className="mt-6 text-2xl">{heading}</h1>
        <p className="mt-2 max-w-md text-ink-muted">
          Trang gặp sự cố ngoài dự kiến. Bạn thử tải lại xem sao — nếu vẫn vậy, hãy quay về
          trang chủ.
        </p>

        {/* Thông điệp kỹ thuật để người dùng còn gửi lại được cho bộ phận hỗ trợ. */}
        <p className="mt-4 max-w-lg rounded-lg bg-surface px-4 py-3 text-sm break-words text-ink-light">
          {detail}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={buttonStyles()}
          >
            <RotateCw size={16} aria-hidden="true" />
            Tải lại trang
          </button>
          <Link to={ROUTES.HOME} className={buttonStyles('outline')}>
            Về trang chủ
          </Link>
        </div>
      </div>
    </>
  )
}
