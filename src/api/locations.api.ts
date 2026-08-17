import locationsJson from '@/mocks/locations.json'
import { delay } from '@/lib/utils'
import type { District, Province } from '@/types'

/**
 * DỮ LIỆU RÚT GỌN cho mục đích demo: 10 tỉnh/thành lớn, mỗi tỉnh vài quận,
 * mỗi quận vài phường. Khi ghép backend, Spring Boot sẽ cấp bộ đầy đủ 63 tỉnh
 * và toàn bộ đơn vị hành chính — chữ ký ba hàm dưới đây giữ nguyên.
 */
interface RawDistrict {
  code: string
  name: string
  wards: string[]
}

interface RawProvince {
  code: string
  name: string
  districts: RawDistrict[]
}

const provinces = locationsJson as RawProvince[]

/**
 * Danh sách tỉnh/thành phố.
 * Khi có backend: `const { data } = await client.get('/locations/provinces'); return data`
 */
export async function getProvinces(): Promise<Province[]> {
  await delay(200)
  return provinces.map(({ code, name }) => ({ code, name }))
}

/**
 * Quận/huyện thuộc một tỉnh.
 * Khi có backend: `const { data } = await client.get(`/locations/provinces/${provinceCode}/districts`); return data`
 */
export async function getDistricts(provinceCode: string): Promise<District[]> {
  await delay(250)
  const province = provinces.find((item) => item.code === provinceCode)
  return province?.districts.map(({ code, name }) => ({ code, name })) ?? []
}

/**
 * Phường/xã thuộc một quận/huyện.
 * Khi có backend: `const { data } = await client.get(`/locations/districts/${districtCode}/wards`); return data`
 */
export async function getWards(districtCode: string): Promise<string[]> {
  await delay(250)
  for (const province of provinces) {
    const district = province.districts.find((item) => item.code === districtCode)
    if (district) return district.wards
  }
  return []
}
