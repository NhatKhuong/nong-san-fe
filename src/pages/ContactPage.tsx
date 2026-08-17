import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { STORE_INFO } from '@/lib/constants'
import { PHONE_MESSAGE, PHONE_PATTERN } from '@/lib/validation'
import SeoMeta from '@/components/ui/SeoMeta'
import { useSendContactMessage } from '@/hooks/useContact'

const SUBJECTS = [
  'Hỏi về sản phẩm',
  'Theo dõi đơn hàng',
  'Khiếu nại chất lượng',
  'Hợp tác cung cấp nông sản',
  'Nội dung khác',
]

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(60, 'Họ tên quá dài.'),
  email: z.string().trim().email('Email không hợp lệ.'),
  phone: z.string().trim().regex(PHONE_PATTERN, PHONE_MESSAGE),
  subject: z.string().min(1, 'Vui lòng chọn chủ đề.'),
  message: z
    .string()
    .trim()
    .min(20, 'Nội dung cần ít nhất 20 ký tự để chúng tôi hiểu rõ vấn đề.')
    .max(1000, 'Nội dung tối đa 1000 ký tự.'),
})

type ContactFormValues = z.infer<typeof contactSchema>

/** Toạ độ dùng chung cho iframe bản đồ và link mở Google Maps. */
const MAP_QUERY = encodeURIComponent(STORE_INFO.address)

export default function ContactPage() {
  const { mutate, isPending, isSuccess, error } = useSendContactMessage()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: '', email: '', phone: '', subject: '', message: '' },
  })

  return (
    <>
      <SeoMeta
        title="Liên hệ"
        description="Liên hệ Nông Sản Sạch: hotline, email, địa chỉ cửa hàng và biểu mẫu gửi câu hỏi."
      />

      <Breadcrumb items={[{ label: 'Liên hệ' }]} />

      <div className="container-app py-8">
        <h1 className="text-2xl sm:text-3xl">Liên hệ với chúng tôi</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Có câu hỏi về sản phẩm, đơn hàng hay muốn hợp tác cung cấp nông sản? Gọi hotline để
          được trả lời ngay, hoặc để lại lời nhắn bên dưới.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="min-w-0">
            <h2 className="text-lg">Gửi lời nhắn</h2>

            {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
            <form
              noValidate
              onSubmit={handleSubmit((values) => mutate(values, { onSuccess: () => reset() }))}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Họ và tên"
                  required
                  placeholder="Nguyễn Văn A"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  label="Số điện thoại"
                  required
                  inputMode="tel"
                  placeholder="0901234567"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <Input
                label="Email"
                required
                type="email"
                placeholder="ban@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <Select
                  label="Chủ đề"
                  options={[
                    { value: '', label: '— Chọn chủ đề —' },
                    ...SUBJECTS.map((subject) => ({ value: subject, label: subject })),
                  ]}
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="mt-1.5 text-sm text-danger">{errors.subject.message}</p>
                )}
              </div>

              <Textarea
                label="Nội dung"
                required
                rows={5}
                placeholder="Mô tả càng cụ thể thì chúng tôi càng trả lời nhanh và đúng trọng tâm."
                error={errors.message?.message}
                {...register('message')}
              />

              {error && (
                <p role="alert" className="text-sm text-danger">
                  {error.message}
                </p>
              )}
              {isSuccess && (
                <p role="status" className="text-sm font-medium text-primary-dark">
                  Đã nhận được lời nhắn của bạn. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.
                </p>
              )}

              <Button type="submit" size="lg" isLoading={isPending}>
                Gửi lời nhắn
              </Button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line p-5">
              <h2 className="text-lg">Thông tin cửa hàng</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <InfoRow icon={MapPin} label="Địa chỉ">
                  {STORE_INFO.address}
                </InfoRow>
                <InfoRow icon={Phone} label="Hotline">
                  <a href={`tel:${STORE_INFO.hotline.replace(/\s/g, '')}`} className="hover:text-primary">
                    {STORE_INFO.hotline}
                  </a>
                </InfoRow>
                <InfoRow icon={Mail} label="Email">
                  <a href={`mailto:${STORE_INFO.email}`} className="hover:text-primary">
                    {STORE_INFO.email}
                  </a>
                </InfoRow>
                <InfoRow icon={Clock} label="Giờ mở cửa">
                  {STORE_INFO.openingHours}
                </InfoRow>
              </ul>
            </div>

            <div className="overflow-hidden rounded-xl border border-line">
              {/*
                Bản đồ nhúng là phụ thuộc bên thứ ba duy nhất còn lại lúc chạy —
                mọi thứ khác đã được nội bộ hoá ở Giai đoạn 5.5. Vì vậy địa chỉ
                dạng văn bản và link mở Google Maps luôn hiện bên dưới, để trang
                vẫn dùng được khi iframe bị chặn hoặc tải lỗi.
              */}
              <iframe
                title={`Bản đồ vị trí ${STORE_INFO.name}`}
                src={`https://maps.google.com/maps?q=${MAP_QUERY}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 border-t border-line p-3 text-sm font-semibold text-primary transition hover:bg-surface"
              >
                Mở trong Google Maps
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
  label: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 text-primary">
        <Icon size={18} aria-hidden={true} />
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-ink">{label}</span>
        <span className="block text-ink-muted">{children}</span>
      </span>
    </li>
  )
}
