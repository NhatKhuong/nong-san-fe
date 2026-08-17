import { useFormContext } from 'react-hook-form'
import Select from '@/components/ui/Select'
import { useDistricts, useProvinces, useWards } from '@/hooks/useLocations'

/**
 * Các trường bắt buộc phải có trong form bọc ngoài. Dùng `useFormContext` nên
 * form cha phải bọc `<FormProvider>` và đặt đúng ba tên trường này.
 */
export interface AddressFieldValues {
  provinceCode: string
  districtCode: string
  ward: string
}

/**
 * Ba ô chọn tỉnh → quận → phường phụ thuộc nhau.
 *
 * Tách riêng vì trang thanh toán và form sổ địa chỉ dùng y hệt logic này; để mỗi
 * nơi tự viết thì hai cái bẫy dưới đây chắc chắn sẽ tái diễn ở nơi thứ hai.
 */
export default function AddressFields() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AddressFieldValues>()

  const provinceCode = watch('provinceCode')
  const districtCode = watch('districtCode')
  const ward = watch('ward')

  const { data: provinces } = useProvinces()
  const { data: districts } = useDistricts(provinceCode || undefined)
  const { data: wards } = useWards(districtCode || undefined)

  /*
   * BẪY 1 — vì sao ba ô này ĐIỀU KHIỂN (`value` + `onChange`) chứ không dùng
   * `register()`:
   *
   * Danh sách quận chỉ tải về sau khi đã biết mã tỉnh. Khi form được điền sẵn
   * bằng `reset()` — lúc mở form sửa địa chỉ, hoặc lúc chọn một địa chỉ từ sổ ở
   * trang thanh toán — React Hook Form gán thẳng giá trị vào thẻ `<select>` lúc
   * nó CHƯA có `<option>` nào khớp, nên trình duyệt lặng lẽ bỏ qua. Kết quả:
   * trạng thái bên trong form có mã quận, nhưng ô hiển thị vẫn trống. Đơn hàng
   * vẫn đặt được với một quận mà người dùng không hề thấy mình chọn.
   *
   * Ô điều khiển thì mỗi lần danh sách quận về là React render lại và gán lại
   * giá trị, nên không có khoảng lệch đó.
   *
   * BẪY 2 — việc xoá cấp dưới nằm trong `onChange`, KHÔNG dùng `useEffect` theo
   * dõi giá trị. Hiệu ứng sẽ chạy cả khi form được điền sẵn và xoá trắng đúng
   * hai ô vừa điền. Gắn vào `onChange` thì chỉ thao tác thật của người dùng mới
   * kích hoạt việc xoá.
   */
  return (
    <>
      <div>
        <Select
          label="Tỉnh/Thành phố"
          name="provinceCode"
          value={provinceCode}
          onChange={(event) => {
            setValue('provinceCode', event.target.value, { shouldValidate: true })
            setValue('districtCode', '')
            setValue('ward', '')
          }}
          options={[
            { value: '', label: '— Chọn tỉnh/thành —' },
            ...(provinces ?? []).map((province) => ({
              value: province.code,
              label: province.name,
            })),
          ]}
        />
        {errors.provinceCode && (
          <p className="mt-1.5 text-sm text-danger">{errors.provinceCode.message}</p>
        )}
      </div>

      <div>
        <Select
          label="Quận/Huyện"
          name="districtCode"
          disabled={!provinceCode}
          value={districtCode}
          onChange={(event) => {
            setValue('districtCode', event.target.value, { shouldValidate: true })
            setValue('ward', '')
          }}
          options={[
            {
              value: '',
              label: provinceCode ? '— Chọn quận/huyện —' : '— Chọn tỉnh trước —',
            },
            ...(districts ?? []).map((district) => ({
              value: district.code,
              label: district.name,
            })),
          ]}
        />
        {errors.districtCode && (
          <p className="mt-1.5 text-sm text-danger">{errors.districtCode.message}</p>
        )}
      </div>

      <div>
        <Select
          label="Phường/Xã"
          name="ward"
          disabled={!districtCode}
          value={ward}
          onChange={(event) => setValue('ward', event.target.value, { shouldValidate: true })}
          options={[
            { value: '', label: districtCode ? '— Chọn phường/xã —' : '— Chọn quận trước —' },
            ...(wards ?? []).map((wardName) => ({ value: wardName, label: wardName })),
          ]}
        />
        {errors.ward && <p className="mt-1.5 text-sm text-danger">{errors.ward.message}</p>}
      </div>
    </>
  )
}
