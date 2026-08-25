import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/ui/PasswordInput'
import SeoMeta from '@/components/ui/SeoMeta'
import { ROUTES } from '@/lib/constants'
import { useResetPassword } from '@/hooks/useAuth'
import { ApiError } from '@/lib/apiError'

/**
 * Khớp `ResetPasswordRequest` của backend: `newPassword 6..72`.
 *
 * **Dùng lại đúng sàn/trần của `RegisterPage.tsx`** — cùng một mật khẩu đang được
 * tạo thì cùng một ràng buộc, không phát minh sàn thứ hai. `token` KHÔNG nằm trong
 * schema này: nó đến từ query string chứ không phải từ ô nhập nào, nên không có
 * đường để người dùng gõ sai nó ở form.
 */
const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Mật khẩu cần ít nhất 6 ký tự.')
      .max(72, 'Mật khẩu tối đa 72 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

/**
 * Trường duy nhất của `ResetPasswordRequest` có ô nhập trên màn hình.
 *
 * `token` cố ý **không** nằm ở đây: `422` kèm `errors.token` không có ô nào để
 * gắn vào, nên nó phải rơi xuống banner chung — đúng chỗ mà ca "token không dùng
 * được" (loại `422` **không** có `errors`) cũng hiện ra.
 */
const RESET_FIELDS = ['newPassword'] as const

function isResetField(key: string): key is (typeof RESET_FIELDS)[number] {
  return (RESET_FIELDS as readonly string[]).includes(key)
}

/** Xem JSDoc cùng tên trong `LoginPage.tsx` — cùng một khuôn, khác tập trường. */
function applyFieldErrors(error: unknown, setError: UseFormSetError<ResetFormValues>): void {
  if (!(error instanceof ApiError) || !error.fieldErrors) return
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (isResetField(field)) setError(field, { type: 'server', message })
  }
}

/**
 * Đích của link trong email đặt lại mật khẩu — `/dat-lai-mat-khau?token=…`.
 *
 * **Token đọc bằng `useSearchParams`, không phải `useParams`**: backend nhúng nó
 * vào query string của link, nên route không khai đoạn `:token` nào.
 *
 * **Không token thì KHÔNG gọi API.** Vào thẳng đường dẫn này (gõ tay, hoặc mail
 * client cắt mất phần sau dấu `?`) là chuyện có thật; gửi một chuỗi rỗng lên để
 * nhận `422` chỉ đổi một màn hình trắng lấy một câu báo lỗi sai nguyên nhân.
 * Nhánh đó hiện thông báo và một đường quay lại `/quen-mat-khau` để lấy link mới.
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mutate, isPending, error } = useResetPassword()

  const token = searchParams.get('token')?.trim() ?? ''

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  /**
   * Lỗi `422` theo từng ô đã hiện cạnh ô đó rồi thì không lặp lại ở banner chung.
   *
   * **Ca "token không dùng được" KHÔNG đi vào nhánh này** — backend phân biệt hai
   * loại `422` bằng chính sự có mặt của khoá `errors`: lỗi validate **có**, token
   * hỏng **không có**. Ba ca token sai / hết hạn / đã dùng vì vậy đều rơi xuống
   * banner với **cùng một** `detail`, và giao diện **không được đoán thêm** ca nào
   * đã xảy ra (`API_CONTRACT.md` §B.4 điều 6 và 7).
   */
  const hasMappedFieldError =
    error instanceof ApiError && Object.keys(error.fieldErrors ?? {}).some(isResetField)

  function onSubmit({ newPassword }: ResetFormValues) {
    mutate(
      { token, newPassword },
      {
        /*
         * KHÔNG tự đăng nhập: `204` không trả token, và biến một token dùng-một-lần
         * thành phiên là mở rộng quyền của nó. `replace` để đường dẫn mang token đã
         * dùng không nằm lại trong lịch sử — bấm Back sẽ chỉ dẫn về một `422`.
         */
        onSuccess: () => navigate(ROUTES.LOGIN, { replace: true }),
        onError: (err) => applyFieldErrors(err, setError),
      },
    )
  }

  if (!token) {
    return (
      <>
        <SeoMeta
          title="Đặt lại mật khẩu"
          description="Đặt mật khẩu mới bằng đường dẫn trong email đặt lại mật khẩu."
        />

        <AuthCard title="Đặt lại mật khẩu">
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface text-ink-muted">
              <KeyRound size={26} aria-hidden="true" />
            </span>
            <p role="alert" className="mt-4 text-sm text-ink">
              Đường dẫn này thiếu mã đặt lại mật khẩu. Hãy mở đúng đường dẫn trong email chúng
              tôi đã gửi, hoặc yêu cầu gửi lại một email mới.
            </p>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Gửi lại email đặt lại mật khẩu
            </Link>
          </div>
        </AuthCard>
      </>
    )
  }

  return (
    <>
      <SeoMeta
        title="Đặt lại mật khẩu"
        description="Đặt mật khẩu mới bằng đường dẫn trong email đặt lại mật khẩu."
      />

      <AuthCard
        title="Đặt lại mật khẩu"
        description="Nhập mật khẩu mới cho tài khoản của bạn."
        footerText="Nhớ ra mật khẩu rồi?"
        footerLinkLabel="Đăng nhập"
        footerLinkTo={ROUTES.LOGIN}
      >
        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" size="lg" fullWidth isLoading={isPending}>
            Đặt mật khẩu mới
          </Button>
        </form>
      </AuthCard>
    </>
  )
}
