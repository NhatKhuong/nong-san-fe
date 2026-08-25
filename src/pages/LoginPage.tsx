import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthCard from '@/components/auth/AuthCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import { ROUTES } from '@/lib/constants'
import SeoMeta from '@/components/ui/SeoMeta'
import { useCurrentUser, useLogin } from '@/hooks/useAuth'
import { ApiError } from '@/lib/apiError'

/**
 * Khớp `LoginRequest` của backend — và **cố ý KHÁC schema đăng ký**.
 *
 * Spec đăng nhập là `password: minLength 0, maxLength 72` — **không có sàn 6**,
 * trong khi đăng ký là `6..72`. Bê sàn 6 sang đây là dựng một hàng rào backend
 * không có: nó không chặn được kẻ dò mật khẩu (họ có thừa cách gửi request), mà
 * chỉ chặn đúng người dùng hợp lệ có mật khẩu cũ ngắn hơn 6 ký tự.
 */
const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ.').max(160, 'Email quá dài.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.').max(72, 'Mật khẩu quá dài.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const LOGIN_FIELDS = ['email', 'password'] as const

function isLoginField(key: string): key is (typeof LOGIN_FIELDS)[number] {
  return (LOGIN_FIELDS as readonly string[]).includes(key)
}

/**
 * Đưa `ApiError.fieldErrors` (map `tên trường → thông điệp` của `422`) về đúng ô
 * nhập, thay vì dồn tất cả vào banner chung — người dùng phải thấy lỗi ngay cạnh
 * ô sai. Khoá nào không phải trường của form này thì bỏ qua ở đây và vẫn hiện ở
 * banner (xem `hasMappedFieldError`), để không có thông điệp nào biến mất im lặng.
 */
function applyFieldErrors(error: unknown, setError: UseFormSetError<LoginFormValues>): void {
  if (!(error instanceof ApiError) || !error.fieldErrors) return
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (isLoginField(field)) setError(field, { type: 'server', message })
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useCurrentUser()
  const { mutate, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  /** Đường dẫn người dùng định vào trước khi bị `ProtectedRoute` chặn lại. */
  const routerState = location.state as { from?: string } | null
  const from = routerState?.from ?? ROUTES.ACCOUNT

  if (isAuthenticated) return <Navigate to={from} replace />

  /** Lỗi 422 theo từng ô đã hiện cạnh ô đó rồi thì không lặp lại ở banner chung. */
  const hasMappedFieldError =
    error instanceof ApiError && Object.keys(error.fieldErrors ?? {}).some(isLoginField)

  function onSubmit(values: LoginFormValues) {
    mutate(values, {
      onSuccess: () => navigate(from, { replace: true }),
      onError: (err) => applyFieldErrors(err, setError),
    })
  }

  return (
    <>
      <SeoMeta
        title="Đăng nhập"
        description="Đăng nhập để theo dõi đơn hàng và lưu địa chỉ giao hàng."
      />

      <AuthCard
        title="Đăng nhập"
        description="Đăng nhập để theo dõi đơn hàng và lưu địa chỉ giao hàng."
        footerText="Chưa có tài khoản?"
        footerLinkLabel="Đăng ký ngay"
        footerLinkTo={ROUTES.REGISTER}
      >
        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            required
            type="email"
            autoComplete="email"
            placeholder="ban@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            label="Mật khẩu"
            required
            autoComplete="current-password"
            placeholder="••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="text-right">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {error && !hasMappedFieldError && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth isLoading={isPending}>
            Đăng nhập
          </Button>
        </form>

        {/*
          Hai tài khoản CÓ THẬT trong DB backend, đã xác minh đăng nhập được
          (backlog 0011). Mật khẩu của hai tài khoản KHÁC NHAU — chép nhầm một
          chuỗi ở đây sẽ ra `401` "Email hoặc mật khẩu không đúng.", đúng chuỗi mà
          backend cũng trả khi tài khoản không tồn tại, nên người đọc sẽ kết luận
          sai là tài khoản không có thật.
        */}
        <div className="mt-5 rounded-lg bg-surface p-3 text-center text-xs text-ink-muted">
          <p>
            Khách hàng: <strong className="text-ink">demo@nongsansach.vn</strong> / mật khẩu{' '}
            <strong className="text-ink">123456</strong>
          </p>
          <p className="mt-1">
            Quản trị: <strong className="text-ink">admin@nongsansach.vn</strong> / mật khẩu{' '}
            <strong className="text-ink">admin123</strong>
          </p>
        </div>
      </AuthCard>
    </>
  )
}
