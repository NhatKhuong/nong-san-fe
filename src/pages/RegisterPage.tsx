import { Navigate, useNavigate } from 'react-router-dom'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthCard from '@/components/auth/AuthCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import { ROUTES } from '@/lib/constants'
import { PHONE_MESSAGE, PHONE_PATTERN } from '@/lib/validation'
import SeoMeta from '@/components/ui/SeoMeta'
import { useCurrentUser, useRegister } from '@/hooks/useAuth'
import { ApiError } from '@/lib/apiError'

/**
 * Khớp `RegisterRequest` của backend: `fullName ≤128, email ≤160, phone ≤20,
 * password 6..72`.
 *
 * **KHÁC schema đăng nhập một cách có chủ đích** — đăng nhập không có sàn 6, xem
 * JSDoc trong `LoginPage.tsx`. `PHONE_PATTERN` giữ nguyên vì nó chặt hơn ràng buộc
 * `≤20` của server (đúng 10 chữ số), tức không bao giờ cho lọt thứ server sẽ từ chối.
 */
const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(128, 'Họ tên quá dài.'),
    email: z.string().trim().email('Email không hợp lệ.').max(160, 'Email quá dài.'),
    phone: z.string().trim().regex(PHONE_PATTERN, PHONE_MESSAGE),
    password: z
      .string()
      .min(6, 'Mật khẩu cần ít nhất 6 ký tự.')
      .max(72, 'Mật khẩu tối đa 72 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const REGISTER_FIELDS = ['fullName', 'email', 'phone', 'password'] as const

function isRegisterField(key: string): key is (typeof REGISTER_FIELDS)[number] {
  return (REGISTER_FIELDS as readonly string[]).includes(key)
}

/** Xem JSDoc cùng tên trong `LoginPage.tsx` — cùng một lý do, khác tập trường. */
function applyFieldErrors(error: unknown, setError: UseFormSetError<RegisterFormValues>): void {
  if (!(error instanceof ApiError) || !error.fieldErrors) return
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (isRegisterField(field)) setError(field, { type: 'server', message })
  }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useCurrentUser()
  const { mutate, isPending, error } = useRegister()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  if (isAuthenticated) return <Navigate to={ROUTES.ACCOUNT} replace />

  /** Lỗi 422 theo từng ô đã hiện cạnh ô đó rồi thì không lặp lại ở banner chung. */
  const hasMappedFieldError =
    error instanceof ApiError && Object.keys(error.fieldErrors ?? {}).some(isRegisterField)

  function onSubmit({ confirmPassword: _confirm, ...payload }: RegisterFormValues) {
    mutate(payload, {
      onSuccess: () => navigate(ROUTES.ACCOUNT, { replace: true }),
      onError: (err) => applyFieldErrors(err, setError),
    })
  }

  return (
    <>
      <SeoMeta
        title="Đăng ký"
        description="Tạo tài khoản Nông Sản Sạch chỉ trong một phút."
      />

      <AuthCard
        title="Tạo tài khoản"
        description="Chỉ mất một phút để bắt đầu mua sắm."
        footerText="Đã có tài khoản?"
        footerLinkLabel="Đăng nhập"
        footerLinkTo={ROUTES.LOGIN}
      >
        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Họ và tên"
            required
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Email"
            required
            type="email"
            autoComplete="email"
            placeholder="ban@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Số điện thoại"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="0901234567"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <PasswordInput
            label="Mật khẩu"
            required
            autoComplete="new-password"
            hint="Từ 6 đến 72 ký tự."
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            label="Xác nhận mật khẩu"
            required
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && !hasMappedFieldError && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth isLoading={isPending}>
            Đăng ký
          </Button>
        </form>
      </AuthCard>
    </>
  )
}
