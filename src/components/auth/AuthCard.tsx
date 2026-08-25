import { Link } from 'react-router-dom'

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  /** Dòng điều hướng cuối thẻ, ví dụ "Chưa có tài khoản? Đăng ký". */
  footerText?: string
  footerLinkLabel?: string
  footerLinkTo?: string
}

/** Khung chung cho bốn trang đăng nhập / đăng ký / quên mật khẩu / đặt lại mật khẩu. */
export default function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}: AuthCardProps) {
  return (
    <div className="bg-surface py-10 sm:py-16">
      <div className="container-app">
        <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-center text-2xl">{title}</h1>
          {description && (
            <p className="mt-2 text-center text-sm text-ink-muted">{description}</p>
          )}

          <div className="mt-6">{children}</div>

          {footerText && footerLinkTo && (
            <p className="mt-6 text-center text-sm text-ink-muted">
              {footerText}{' '}
              <Link to={footerLinkTo} className="font-semibold text-primary hover:underline">
                {footerLinkLabel}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
