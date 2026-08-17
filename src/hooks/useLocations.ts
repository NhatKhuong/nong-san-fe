import { useQuery } from '@tanstack/react-query'
import { getDistricts, getProvinces, getWards } from '@/api/locations.api'
import { queryKeys } from './queryKeys'

export function useProvinces() {
  return useQuery({
    queryKey: queryKeys.locations.provinces,
    queryFn: getProvinces,
    staleTime: Infinity, // đơn vị hành chính gần như không đổi
  })
}

/** Chỉ chạy khi đã chọn tỉnh — đây là mấu chốt của select phụ thuộc. */
export function useDistricts(provinceCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.locations.districts(provinceCode ?? ''),
    queryFn: () => getDistricts(provinceCode!),
    enabled: Boolean(provinceCode),
    staleTime: Infinity,
  })
}

/**
 * Đổi mã tỉnh/quận sang tên để lưu vào đơn hàng và sổ địa chỉ.
 * Dùng lại đúng hai query ở trên nên không phát sinh request mới.
 */
export function useLocationNames(provinceCode: string, districtCode: string) {
  const { data: provinces } = useProvinces()
  const { data: districts } = useDistricts(provinceCode || undefined)

  return {
    provinceName: provinces?.find((province) => province.code === provinceCode)?.name ?? '',
    districtName: districts?.find((district) => district.code === districtCode)?.name ?? '',
  }
}

export function useWards(districtCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.locations.wards(districtCode ?? ''),
    queryFn: () => getWards(districtCode!),
    enabled: Boolean(districtCode),
    staleTime: Infinity,
  })
}
