import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { ErrorState } from '@/components/ui/StateBlock'
import AddressFields from '@/components/form/AddressFields'
import CartSummaryBox from '@/components/cart/CartSummaryBox'
import OrderProcessingPanel from '@/components/cart/OrderProcessingPanel'
import PaymentMethodPicker from '@/components/cart/PaymentMethodPicker'
import SavedAddressPicker from '@/components/cart/SavedAddressPicker'
import { createOrderAsync } from '@/api/orders.api'
import { useCartValidation, useCoupon } from '@/hooks/useCart'
import { useCurrentUser } from '@/hooks/useAuth'
import { useMyAddresses } from '@/hooks/useAddresses'
import { useLocationNames } from '@/hooks/useLocations'
import { usePurchaseRequestStatus } from '@/hooks/useOrders'
import { PURCHASE_REQUEST_SLOW_WARNING_MS, ROUTES } from '@/lib/constants'
import { formatVND } from '@/lib/format'
import { applyServerFieldErrors, hasServerFieldError } from '@/lib/fieldErrors'
import { PHONE_MESSAGE, PHONE_PATTERN } from '@/lib/validation'
import { useCartStore } from '@/store/cart.store'
import SeoMeta from '@/components/ui/SeoMeta'
import type { CreateOrderPayload, PaymentMethod } from '@/types'

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(60, 'Họ tên quá dài.'),
  phone: z.string().trim().regex(PHONE_PATTERN, PHONE_MESSAGE),
  email: z.string().trim().email('Email không hợp lệ.'),
  provinceCode: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố.'),
  districtCode: z.string().min(1, 'Vui lòng chọn quận/huyện.'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã.'),
  street: z.string().trim().min(5, 'Vui lòng nhập số nhà và tên đường.'),
  note: z.string().trim().max(300, 'Ghi chú tối đa 300 ký tự.').optional(),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'momo', 'vnpay']),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

/**
 * Trường có ô nhập trên màn hình, đối chiếu với khoá `errors` của `POST /orders`.
 *
 * **`provinceCode` và `districtCode` cố ý VẮNG MẶT, đây là quyết định chứ không
 * phải sót.** Server báo lỗi theo tên trường của **payload**, mà payload gửi lên
 * `province` / `district` là **tên** đơn vị hành chính (dẫn xuất qua
 * `useLocationNames`), còn form giữ **mã**. Nên `shipping.province` bóc tiền tố ra
 * là `province`, không round-trip về được `provinceCode`.
 *
 * Cho chúng rơi xuống banner chung là đúng: hai ô này là `<select>` mã, người dùng
 * chỉ sửa được bằng cách chọn lại tỉnh/huyện, nên một câu tiếng Anh của Bean
 * Validation dán cạnh ô cũng không nói thêm được gì. Đường còn lại — một bảng ánh
 * xạ `province → provinceCode` — chính là thứ ticket cấm: bảng tra khoá từng cái
 * một, phải sửa tay mỗi lần payload đổi hình.
 *
 * **`paymentMethod` cũng vắng mặt, cùng một luật:** `PaymentMethodPicker` không
 * vẽ thông điệp lỗi nào, nên gắn vào đó là làm câu báo lỗi biến mất **và** tắt
 * luôn banner đang định hiện nó — đúng thứ luật gốc cấm. Nó cùng loại với `token`
 * ở `ResetPasswordPage`: khoá không có ô nào để bám thì phải rơi xuống banner.
 */
const CHECKOUT_FIELDS = ['fullName', 'phone', 'email', 'ward', 'street', 'note'] as const

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clear)
  const { couponCode, coupon } = useCoupon()
  const { blockingIssues } = useCartValidation()

  const { user, isAuthenticated } = useCurrentUser()
  const { data: addresses } = useMyAddresses()

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      provinceCode: '',
      districtCode: '',
      ward: '',
      street: '',
      note: '',
      paymentMethod: 'cod',
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = methods

  const paymentMethod = watch('paymentMethod')
  const { provinceName, districtName } = useLocationNames(
    watch('provinceCode'),
    watch('districtCode'),
  )

  /** Id địa chỉ đã lưu đang chọn; chuỗi rỗng là tự nhập. */
  const [selectedAddressId, setSelectedAddressId] = useState('')

  // Đã đăng nhập thì điền sẵn thông tin người nhận từ hồ sơ.
  const hasPrefilledProfile = useRef(false)
  useEffect(() => {
    if (!user || hasPrefilledProfile.current) return
    hasPrefilledProfile.current = true
    setValue('fullName', user.fullName)
    setValue('phone', user.phone)
    setValue('email', user.email)
  }, [user, setValue])

  /*
   * Điền sẵn địa chỉ mặc định, chỉ một lần khi sổ địa chỉ vừa tải xong. Cần cờ
   * `useRef` vì nếu không, mỗi lần query trả dữ liệu mới sẽ ghi đè lên thứ người
   * dùng vừa sửa tay.
   */
  const hasPrefilledAddress = useRef(false)
  useEffect(() => {
    if (hasPrefilledAddress.current || !addresses) return
    const defaultAddress = addresses.find((address) => address.isDefault)
    if (!defaultAddress) return

    hasPrefilledAddress.current = true
    setSelectedAddressId(String(defaultAddress.id))
    reset((current) => ({
      ...current,
      fullName: defaultAddress.fullName,
      phone: defaultAddress.phone,
      provinceCode: defaultAddress.provinceCode,
      districtCode: defaultAddress.districtCode,
      ward: defaultAddress.ward,
      street: defaultAddress.street,
    }))
  }, [addresses, reset])

  /** Chọn một địa chỉ khác trong sổ; chuỗi rỗng nghĩa là quay lại tự nhập. */
  function applyAddress(addressId: string) {
    setSelectedAddressId(addressId)
    const address = addresses?.find((item) => String(item.id) === addressId)
    if (!address) return

    reset((current) => ({
      ...current,
      fullName: address.fullName,
      phone: address.phone,
      provinceCode: address.provinceCode,
      districtCode: address.districtCode,
      ward: address.ward,
      street: address.street,
    }))
  }

  /**
   * Đánh dấu đã đặt hàng xong. Nếu không có cờ này, `clearCart()` làm giỏ rỗng
   * khiến guard bên dưới bắn `<Navigate>` về trang giỏ hàng NGAY TRƯỚC KHI
   * `navigate()` kịp chuyển sang trang thành công — khách đặt hàng xong lại bị
   * ném về giỏ hàng trống.
   */
  const orderPlacedRef = useRef(false)

  /**
   * Khoá idempotency của lượt đặt hàng đang xử lý — sinh MỘT LẦN mỗi lượt bấm
   * "Đặt hàng" thật sự, giữ nguyên qua mọi lần phát lại của CÙNG lượt đó (mất
   * mạng, timeout khiến người dùng bấm lại trong lúc chưa rõ kết quả). Chỉ đặt
   * về `null` khi người dùng chủ động bắt đầu một lượt đặt hàng MỚI sau khi
   * thấy `FAILED` (`handleRetryAfterFailure`) — đó phải là một `requestId`
   * khác, không phải bản phát lại của yêu cầu đã hỏng.
   */
  const idempotencyKeyRef = useRef<string | null>(null)

  /** `requestId` của lượt đặt hàng đang polling; `null` = còn ở màn hình form. */
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null)

  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload: CreateOrderPayload) => {
      idempotencyKeyRef.current ??= crypto.randomUUID()
      return createOrderAsync(payload, idempotencyKeyRef.current)
    },
    onSuccess: (request) => setActiveRequestId(request.requestId),
  })

  const { data: purchaseRequest, error: pollError } = usePurchaseRequestStatus(activeRequestId)

  const isFailed = purchaseRequest?.status === 'FAILED' || Boolean(pollError)
  /** Đã gửi đi và chưa biết kết quả cuối (hoặc vừa `SUCCESS`, đang chờ điều hướng). */
  const isProcessing = activeRequestId !== null && !isFailed

  // Đơn thành công: dọn giỏ và điều hướng sang trang chi tiết đơn hàng bằng
  // `orderCode`. Tách khỏi `onSuccess` của mutation vì kết quả cuối chỉ biết
  // được qua polling, không phải qua response 202 của `createOrderAsync`.
  useEffect(() => {
    if (purchaseRequest?.status !== 'SUCCESS' || !purchaseRequest.orderCode) return
    orderPlacedRef.current = true
    clearCart()
    // `replace` để bấm Back không quay lại trang thanh toán với giỏ đã rỗng.
    navigate(`${ROUTES.ORDER_SUCCESS}?code=${purchaseRequest.orderCode}`, { replace: true })
  }, [purchaseRequest, clearCart, navigate])

  /** Sau ngần này thời gian vẫn `PENDING` thì báo "đang xử lý lâu hơn dự kiến". */
  const [isSlow, setIsSlow] = useState(false)
  useEffect(() => {
    setIsSlow(false)
    if (!activeRequestId) return
    const timer = setTimeout(() => setIsSlow(true), PURCHASE_REQUEST_SLOW_WARNING_MS)
    return () => clearTimeout(timer)
  }, [activeRequestId])

  /**
   * "Thử lại" sau `FAILED`: quay lại màn hình form (dữ liệu đã nhập vẫn còn,
   * vì `methods` không unmount) và bắt buộc sinh khoá idempotency MỚI — đây là
   * một lượt đặt hàng khác, không phải phát lại lượt vừa hỏng.
   */
  function handleRetryAfterFailure() {
    idempotencyKeyRef.current = null
    setActiveRequestId(null)
  }

  // Vào thẳng trang thanh toán khi giỏ trống thì không có gì để đặt. Giỏ chỉ bị
  // xoá sau khi có `SUCCESS` thật sự (xem effect ở trên), nên guard này không
  // bao giờ ăn nhầm lúc đang polling hay lúc `FAILED`.
  if (items.length === 0 && !orderPlacedRef.current) return <Navigate to={ROUTES.CART} replace />

  /** Lỗi 422 theo từng ô đã hiện cạnh ô đó rồi thì không lặp lại ở banner chung. */
  const hasMappedFieldError = hasServerFieldError(error, CHECKOUT_FIELDS)

  function onSubmit(values: CheckoutFormValues) {
    mutate(
      {
        items,
        shipping: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
          province: provinceName,
          district: districtName,
          ward: values.ward,
          street: values.street,
          note: values.note || undefined,
        },
        paymentMethod: values.paymentMethod,
        // Chỉ gửi mã khi nó thực sự hợp lệ với đơn hiện tại.
        couponCode: coupon ? couponCode : null,
      },
      { onError: (err) => applyServerFieldErrors(err, setError, CHECKOUT_FIELDS) },
    )
  }

  return (
    <>
      <SeoMeta
        title="Thanh toán"
        description="Điền thông tin nhận hàng và chọn phương thức thanh toán."
      />

      <Breadcrumb items={[{ label: 'Giỏ hàng', path: ROUTES.CART }, { label: 'Thanh toán' }]} />

      <div className="container-app py-8">
        <h1 className="mb-6 text-2xl sm:text-3xl">Thanh toán</h1>

        {isProcessing ? (
          <OrderProcessingPanel isSlow={isSlow} />
        ) : isFailed ? (
          <ErrorState
            message={purchaseRequest?.failureMessage ?? pollError?.message}
            onRetry={handleRetryAfterFailure}
          />
        ) : (
          <>
            {!isAuthenticated && (
              <p className="mb-6 rounded-xl bg-surface px-4 py-3 text-sm text-ink-muted">
                Bạn đang đặt hàng với tư cách khách.{' '}
                <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline">
                  Đăng nhập
                </Link>{' '}
                để lưu địa chỉ và theo dõi đơn hàng sau này.
              </p>
            )}

            {/*
              `noValidate` là bắt buộc: các input có thuộc tính `required` (giữ lại cho
              trình đọc màn hình), nếu không tắt validate mặc định thì trình duyệt sẽ
              chặn sự kiện submit và React Hook Form không bao giờ chạy — người dùng
              nhận thông báo mặc định của trình duyệt thay vì thông điệp tiếng Việt.
            */}
            <FormProvider {...methods}>
              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-8 lg:grid-cols-[1fr_360px]"
              >
                <div className="min-w-0 space-y-8">
                  <section>
                    <h2 className="mb-4 text-base">Thông tin người nhận</h2>

                    <SavedAddressPicker
                      addresses={addresses ?? []}
                      value={selectedAddressId}
                      onChange={applyAddress}
                    />

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
                      <div className="sm:col-span-2">
                        <Input
                          label="Email"
                          required
                          type="email"
                          placeholder="ban@email.com"
                          hint="Dùng để gửi xác nhận đơn hàng."
                          error={errors.email?.message}
                          {...register('email')}
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-4 text-base">Địa chỉ giao hàng</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <AddressFields />

                      <div className="sm:col-span-3">
                        <Input
                          label="Số nhà, tên đường"
                          required
                          placeholder="123 Nguyễn Văn Cừ"
                          error={errors.street?.message}
                          {...register('street')}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Textarea
                          label="Ghi chú (tuỳ chọn)"
                          rows={3}
                          placeholder="Giao giờ hành chính, gọi trước khi đến…"
                          error={errors.note?.message}
                          {...register('note')}
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <PaymentMethodPicker
                      value={paymentMethod}
                      onChange={(method: PaymentMethod) =>
                        setValue('paymentMethod', method, { shouldValidate: true })
                      }
                    />
                  </section>
                </div>

                <aside className="space-y-5">
                  <div className="rounded-xl border border-line p-4">
                    {/* "mặt hàng" = số dòng, khác với "sản phẩm" = tổng số lượng ở bảng tổng kết */}
                    <h2 className="mb-3 text-base">Đơn hàng ({items.length} mặt hàng)</h2>
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={item.productId} className="flex gap-3 text-sm">
                          <img
                            src={item.image}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            className="size-12 shrink-0 rounded-lg object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-1 font-medium">{item.name}</span>
                            <span className="text-xs text-ink-muted">
                              {item.quantity} × {formatVND(item.price)}
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold">
                            {formatVND(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <CartSummaryBox title="Thanh toán">
                    {error && !hasMappedFieldError && (
                      <p role="alert" className="mb-3 text-sm text-danger">
                        {error.message}
                      </p>
                    )}
                    {blockingIssues.length > 0 && (
                      <p role="alert" className="mb-3 text-sm text-danger">
                        Một số sản phẩm không còn đủ hàng. Vui lòng quay lại giỏ hàng để cập nhật.
                      </p>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      isLoading={isPending}
                      disabled={blockingIssues.length > 0}
                    >
                      Đặt hàng
                    </Button>
                    <p className="mt-3 text-center text-xs text-ink-muted">
                      Bằng việc đặt hàng, bạn đồng ý với điều khoản của cửa hàng.
                    </p>
                  </CartSummaryBox>
                </aside>
              </form>
            </FormProvider>
          </>
        )}
      </div>
    </>
  )
}
