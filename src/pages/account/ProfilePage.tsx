import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PHONE_MESSAGE, PHONE_PATTERN } from '@/lib/validation'
import SeoMeta from '@/components/ui/SeoMeta'
import { useCurrentUser, useUpdateProfile } from '@/hooks/useAuth'
import { applyServerFieldErrors, hasServerFieldError } from '@/lib/fieldErrors'

/**
 * Khớp `UpdateProfileRequest` của backend: `fullName ≤128, email ≤160, phone ≤20`,
 * và cả ba **không được rỗng / toàn khoảng trắng** (`pattern: .*\S.*`).
 *
 * Trần cũ `fullName ≤60` là con số của thời mock — nó chặt hơn server, tức từ chối
 * đúng những cái tên mà server sẵn sàng nhận. `PHONE_PATTERN` thì giữ nguyên vì nó
 * chặt hơn ràng buộc `≤20` một cách có ích (đúng 10 chữ số), nên không bao giờ cho
 * lọt thứ server sẽ từ chối — cùng lý do đã ghi ở `RegisterPage.tsx`.
 */
const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(128, 'Họ tên quá dài.'),
  email: z.string().trim().email('Email không hợp lệ.').max(160, 'Email quá dài.'),
  phone: z.string().trim().regex(PHONE_PATTERN, PHONE_MESSAGE),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const PROFILE_FIELDS = ['fullName', 'email', 'phone'] as const

export default function ProfilePage() {
  const { user } = useCurrentUser()
  const { mutate, isPending, isSuccess, error } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  /** Lỗi 422 theo từng ô đã hiện cạnh ô đó rồi thì không lặp lại ở banner chung. */
  const hasMappedFieldError = hasServerFieldError(error, PROFILE_FIELDS)

  function onSubmit(values: ProfileFormValues) {
    if (!user) return
    /*
     * `id` vẫn nằm trong chữ ký của `updateProfile` (di sản thời mock) nhưng
     * **không đi vào thân request**: `PUT /auth/me` lấy chủ sở hữu từ claim `sub`
     * và không nhận `userId` qua bất kỳ kênh nào (§C.4.1). Xem JSDoc của hàm đó.
     */
    mutate(
      { id: user.id, ...values },
      { onError: (err) => applyServerFieldErrors(err, setError, PROFILE_FIELDS) },
    )
  }

  return (
    <>
      <SeoMeta
        title="Thông tin cá nhân"
        description="Cập nhật họ tên, email và số điện thoại của tài khoản."
      />

      <section className="rounded-xl border border-line p-5 sm:p-6">
        <h1 className="text-xl">Thông tin cá nhân</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Thông tin này được dùng để điền sẵn khi bạn đặt hàng.
        </p>

        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-lg space-y-4">
          <Input
            label="Họ và tên"
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Email"
            required
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Số điện thoại"
            required
            inputMode="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {error && !hasMappedFieldError && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}
          {isSuccess && (
            <p role="status" className="text-sm font-medium text-primary-dark">
              Đã lưu thông tin của bạn.
            </p>
          )}

          <Button type="submit" isLoading={isPending}>
            Lưu thay đổi
          </Button>
        </form>
      </section>
    </>
  )
}
