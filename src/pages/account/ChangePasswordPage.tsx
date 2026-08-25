import { useForm, type UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/ui/PasswordInput'
import SeoMeta from '@/components/ui/SeoMeta'
import { useChangePassword } from '@/hooks/useAuth'
import { ApiError } from '@/lib/apiError'

/**
 * Khớp `ChangePasswordRequest` của backend: `currentPassword 0..72`,
 * `newPassword 6..72`.
 *
 * **Hai trường KHÔNG cùng sàn, và đó là chủ ý** — cùng lý do đã ghi ở
 * `LoginPage.tsx`. `newPassword` là mật khẩu đang được tạo nên sàn 6 là ràng buộc
 * thật của server; `currentPassword` là mật khẩu **đã tồn tại**, đặt sàn 6 lên nó
 * là dựng một hàng rào server không có: nó không chặn được ai, chỉ chặn đúng người
 * dùng hợp lệ có mật khẩu cũ ngắn hơn. Ở đây `min(1)` chỉ nghĩa là "bắt buộc nhập".
 */
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu hiện tại.')
      .max(72, 'Mật khẩu tối đa 72 ký tự.'),
    newPassword: z
      .string()
      .min(6, 'Mật khẩu mới cần ít nhất 6 ký tự.')
      .max(72, 'Mật khẩu tối đa 72 ký tự.'),
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

const PASSWORD_FIELDS = ['currentPassword', 'newPassword'] as const

function isPasswordField(key: string): key is (typeof PASSWORD_FIELDS)[number] {
  return (PASSWORD_FIELDS as readonly string[]).includes(key)
}

/** Xem JSDoc cùng tên trong `LoginPage.tsx` — cùng một khuôn, khác tập trường. */
function applyFieldErrors(error: unknown, setError: UseFormSetError<PasswordFormValues>): void {
  if (!(error instanceof ApiError) || !error.fieldErrors) return
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (isPasswordField(field)) setError(field, { type: 'server', message })
  }
}

export default function ChangePasswordPage() {
  const { mutate, isPending, isSuccess, error } = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  /**
   * Lỗi 422 theo từng ô đã hiện cạnh ô đó rồi thì không lặp lại ở banner chung.
   *
   * **Sai `currentPassword` KHÔNG đi vào nhánh này**: backend phân biệt hai loại
   * `422` bằng chính sự có mặt của khoá `errors` — lỗi validate có, sai mật khẩu
   * cũ không có. Ca đó vì vậy hiện ở banner qua `detail`, đúng như mong muốn.
   */
  const hasMappedFieldError =
    error instanceof ApiError && Object.keys(error.fieldErrors ?? {}).some(isPasswordField)

  function onSubmit({ currentPassword, newPassword }: PasswordFormValues) {
    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => reset(),
        onError: (err) => applyFieldErrors(err, setError),
      },
    )
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
            hint="Từ 6 đến 72 ký tự."
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

          {error && !hasMappedFieldError && (
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
