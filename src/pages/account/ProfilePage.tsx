import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PHONE_MESSAGE, PHONE_PATTERN } from '@/lib/validation'
import SeoMeta from '@/components/ui/SeoMeta'
import { useCurrentUser, useUpdateProfile } from '@/hooks/useAuth'

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(60, 'Họ tên quá dài.'),
  email: z.string().trim().email('Email không hợp lệ.'),
  phone: z.string().trim().regex(PHONE_PATTERN, PHONE_MESSAGE),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user } = useCurrentUser()
  const { mutate, isPending, isSuccess, error } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  function onSubmit(values: ProfileFormValues) {
    if (!user) return
    mutate({ id: user.id, ...values })
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

          {error && (
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
