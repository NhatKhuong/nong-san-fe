import { Leaf, RefreshCw, Sprout, Truck } from 'lucide-react'

const FEATURES = [
  {
    icon: Leaf,
    title: '100% hữu cơ',
    description: 'Đạt chuẩn canh tác hữu cơ, không thuốc trừ sâu hoá học',
  },
  {
    icon: Sprout,
    title: 'Tiêu dùng xanh',
    description: 'Bao bì phân huỷ sinh học, hạn chế tối đa nhựa dùng một lần',
  },
  {
    icon: Truck,
    title: 'Miễn phí vận chuyển',
    description: 'Áp dụng cho mọi đơn hàng từ 500.000 ₫ trở lên',
  },
  {
    icon: RefreshCw,
    title: 'Đổi trả dễ dàng',
    description: 'Không hài lòng về độ tươi? Hoàn tiền trong 24 giờ',
  },
]

export default function FeatureStrip() {
  return (
    <section className="border-b border-line bg-white py-10">
      <div className="container-app grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon size={24} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base">{title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
