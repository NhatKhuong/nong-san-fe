import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ROUTES } from '@/lib/constants'
import SeoMeta from '@/components/ui/SeoMeta'
import { useForgotPassword } from '@/hooks/useAuth'

const forgotSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ.'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const { mutate, isPending, isSuccess, error, variables } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  return (
    <>
      <SeoMeta
        title="Quên mật khẩu"
        description="Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu."
      />

      <AuthCard
        title="Quên mật khẩu"
        description={
          isSuccess ? undefined : 'Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại.'
        }
        footerText={isSuccess ? undefined : 'Nhớ ra mật khẩu rồi?'}
        footerLinkLabel="Đăng nhập"
        footerLinkTo={ROUTES.LOGIN}
      >
        {isSuccess ? (
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
              <MailCheck size={26} aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm text-ink">
              Nếu <strong>{variables}</strong> đã được đăng ký, một email hướng dẫn đặt lại mật
              khẩu vừa được gửi đi. Vui lòng kiểm tra cả hộp thư rác.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          /* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */
          <form
            noValidate
            onSubmit={handleSubmit((values) => mutate(values.email))}
            className="space-y-4"
          >
            <Input
              label="Email"
              required
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error.message}
              </p>
            )}

            <Button type="submit" size="lg" fullWidth isLoading={isPending}>
              Gửi hướng dẫn
            </Button>
          </form>
        )}
      </AuthCard>
    </>
  )
}
