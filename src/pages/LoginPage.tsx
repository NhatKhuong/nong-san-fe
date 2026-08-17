import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthCard from '@/components/auth/AuthCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import { ROUTES } from '@/lib/constants'
import SeoMeta from '@/components/ui/SeoMeta'
import { useCurrentUser, useLogin } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useCurrentUser()
  const { mutate, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  /** Đường dẫn người dùng định vào trước khi bị `ProtectedRoute` chặn lại. */
  const routerState = location.state as { from?: string } | null
  const from = routerState?.from ?? ROUTES.ACCOUNT

  if (isAuthenticated) return <Navigate to={from} replace />

  function onSubmit(values: LoginFormValues) {
    mutate(values, { onSuccess: () => navigate(from, { replace: true }) })
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

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth isLoading={isPending}>
            Đăng nhập
          </Button>
        </form>

        <p className="mt-5 rounded-lg bg-surface p-3 text-center text-xs text-ink-muted">
          Tài khoản dùng thử: <strong className="text-ink">demo@nongsansach.vn</strong> / mật
          khẩu <strong className="text-ink">123456</strong>
        </p>
      </AuthCard>
    </>
  )
}
