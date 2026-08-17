import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/ui/PasswordInput'
import SeoMeta from '@/components/ui/SeoMeta'
import { useChangePassword } from '@/hooks/useAuth'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: z.string().min(6, 'Mật khẩu mới cần ít nhất 6 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
    path: ['newPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ChangePasswordPage() {
  const { mutate, isPending, isSuccess, error } = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  function onSubmit({ currentPassword, newPassword }: PasswordFormValues) {
    mutate({ currentPassword, newPassword }, { onSuccess: () => reset() })
  }

  return (
    <>
      <SeoMeta
        title="Đổi mật khẩu"
        description="Cập nhật mật khẩu đăng nhập cho tài khoản của bạn."
      />

      <section className="rounded-xl border border-line p-5 sm:p-6">
        <h1 className="text-xl">Đổi mật khẩu</h1>

        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-lg space-y-4">
          <PasswordInput
            label="Mật khẩu hiện tại"
            required
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <PasswordInput
            label="Mật khẩu mới"
            required
            autoComplete="new-password"
            hint="Ít nhất 6 ký tự."
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordInput
            label="Xác nhận mật khẩu mới"
            required
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}
          {isSuccess && (
            <p role="status" className="text-sm font-medium text-primary-dark">
              Đổi mật khẩu thành công.
            </p>
          )}

          <Button type="submit" isLoading={isPending}>
            Đổi mật khẩu
          </Button>
        </form>
      </section>
    </>
  )
}
