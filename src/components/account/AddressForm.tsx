import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AddressFields from '@/components/form/AddressFields'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PHONE_MESSAGE, PHONE_PATTERN } from '@/lib/validation'
import { useLocationNames } from '@/hooks/useLocations'
import type { Address, AddressPayload } from '@/types'

const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(60, 'Họ tên quá dài.'),
  phone: z.string().trim().regex(PHONE_PATTERN, PHONE_MESSAGE),
  provinceCode: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố.'),
  districtCode: z.string().min(1, 'Vui lòng chọn quận/huyện.'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã.'),
  street: z.string().trim().min(5, 'Vui lòng nhập số nhà và tên đường.'),
  isDefault: z.boolean(),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  /** Có giá trị là đang sửa, bỏ trống là thêm mới. */
  address?: Address
  onSubmit: (payload: AddressPayload) => void
  onCancel: () => void
  isPending?: boolean
  error?: Error | null
}

export default function AddressForm({
  address,
  onSubmit,
  onCancel,
  isPending = false,
  error = null,
}: AddressFormProps) {
  const methods = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: address?.fullName ?? '',
      phone: address?.phone ?? '',
      provinceCode: address?.provinceCode ?? '',
      districtCode: address?.districtCode ?? '',
      ward: address?.ward ?? '',
      street: address?.street ?? '',
      isDefault: address?.isDefault ?? false,
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods

  // Sổ địa chỉ lưu cả mã (cho ô chọn) lẫn tên (để chép sang đơn hàng).
  const { provinceName, districtName } = useLocationNames(
    watch('provinceCode'),
    watch('districtCode'),
  )

  function handleValid(values: AddressFormValues) {
    onSubmit({ ...values, province: provinceName, district: districtName })
  }

  return (
    <FormProvider {...methods}>
      {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
      <form noValidate onSubmit={handleSubmit(handleValid)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Họ và tên người nhận"
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

        <div className="grid gap-4 sm:grid-cols-3">
          <AddressFields />
        </div>

        <Input
          label="Số nhà, tên đường"
          required
          placeholder="123 Nguyễn Văn Cừ"
          error={errors.street?.message}
          {...register('street')}
        />

        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            className="size-4 rounded border-line accent-primary"
            disabled={address?.isDefault}
            {...register('isDefault')}
          />
          Đặt làm địa chỉ mặc định
          {address?.isDefault && (
            <span className="text-xs text-ink-muted">(đang là địa chỉ mặc định)</span>
          )}
        </label>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error.message}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Huỷ
          </Button>
          <Button type="submit" isLoading={isPending}>
            {address ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
