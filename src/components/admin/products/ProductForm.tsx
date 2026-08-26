import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { applyServerFieldErrors, hasServerFieldError } from '@/lib/fieldErrors'
import type { Brand, Category, ProductPayload } from '@/types'

/*
 * `setValueAs` chạy cả trên **giá trị mặc định** lúc `register`, không chỉ trên
 * chuỗi người dùng gõ vào. Với ô có thể bỏ trống, mặc định là `null`, mà
 * `Number(null)` là `0` — nên một hàm chỉ xét `value === ''` sẽ biến "không có
 * giá khuyến mãi" thành "giá khuyến mãi bằng 0" và form từ chối lưu bằng một
 * thông báo vô nghĩa. Phải nhận đủ cả ba dạng rỗng.
 */
function toNumberOrNull(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

/** Ô bắt buộc: rỗng thành `NaN` để zod báo đúng "vui lòng chọn", không phải `0`. */
function toNumberOrNaN(value: unknown): number {
  if (value === '' || value === null || value === undefined) return Number.NaN
  return Number(value)
}

/**
 * Mỗi dòng một đường dẫn ảnh. Tách ra hàm riêng vì cả zod (để validate) lẫn
 * `handleValid` (để dựng payload) đều phải cắt đúng một kiểu.
 */
function parseImages(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/*
 * Schema khai ngay trong file form — đúng lệ `AddressForm.tsx`. Chỉ quy tắc
 * dùng chung nhiều form (`PHONE_PATTERN`…) mới lên `lib/validation.ts`.
 *
 * `rating`, `reviewCount`, `sold` KHÔNG có ô nhập nào ở đây: backend là nguồn
 * chân lý (`API_CONTRACT.md` §C.3). Cho admin sửa số sao thì con số hiển thị sẽ
 * mâu thuẫn với chính danh sách đánh giá ngay bên dưới nó.
 */
const productSchema = z
  .object({
    name: z.string().trim().min(2, 'Vui lòng nhập tên sản phẩm.').max(120, 'Tên quá dài.'),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]*$/, 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.')
      .max(120, 'Slug quá dài.'),
    price: z
      .number({ invalid_type_error: 'Vui lòng nhập giá.' })
      .int('Giá phải là số nguyên VNĐ.')
      .positive('Giá phải lớn hơn 0.'),
    salePrice: z
      .number({ invalid_type_error: 'Giá khuyến mãi phải là số.' })
      .int('Giá khuyến mãi phải là số nguyên VNĐ.')
      .positive('Giá khuyến mãi phải lớn hơn 0.')
      .nullable(),
    stock: z
      .number({ invalid_type_error: 'Vui lòng nhập tồn kho.' })
      .int('Tồn kho phải là số nguyên.')
      .min(0, 'Tồn kho không được âm.'),
    categoryId: z
      .number({ invalid_type_error: 'Vui lòng chọn danh mục.' })
      .positive('Vui lòng chọn danh mục.'),
    brandId: z
      .number({ invalid_type_error: 'Thương hiệu không hợp lệ.' })
      .positive('Thương hiệu không hợp lệ.')
      .nullable(),
    images: z
      .string()
      .trim()
      .refine((value) => parseImages(value).length > 0, 'Cần ít nhất một đường dẫn ảnh.')
      .refine(
        (value) => parseImages(value).every((path) => path.startsWith('/images/')),
        'Ảnh phải là đường dẫn tương đối, bắt đầu bằng /images/ (không dán URL đầy đủ).',
      ),
    unit: z.string().trim().min(1, 'Vui lòng nhập đơn vị tính.').max(30, 'Đơn vị quá dài.'),
    origin: z.string().trim().min(2, 'Vui lòng nhập xuất xứ.').max(80, 'Xuất xứ quá dài.'),
    shortDescription: z
      .string()
      .trim()
      .min(10, 'Mô tả ngắn cần ít nhất 10 ký tự.')
      .max(200, 'Mô tả ngắn tối đa 200 ký tự.'),
    description: z.string().trim().min(20, 'Mô tả chi tiết cần ít nhất 20 ký tự.'),
    isFeatured: z.boolean(),
    isBestSeller: z.boolean(),
  })
  .refine(
    (values) => values.salePrice === null || values.salePrice < values.price,
    // Gắn lỗi vào chính ô sai, không để nó rơi xuống cuối form.
    { path: ['salePrice'], message: 'Giá khuyến mãi phải thấp hơn giá gốc.' },
  )

type ProductFormValues = z.infer<typeof productSchema>

/**
 * Trường có ô nhập trên màn hình, đối chiếu với khoá `errors` của
 * `POST/PUT /admin/products`. Payload sản phẩm **phẳng**, nên khoá của server về
 * thẳng tên trường ở đây, không có tiền tố nào để bóc.
 *
 * `rating`, `reviewCount`, `sold` không có ô nhập (§C.3) — một `422` mang tên
 * chúng phải rơi xuống banner chung chứ không được im lặng biến mất.
 */
const PRODUCT_FIELDS = [
  'name',
  'slug',
  'price',
  'salePrice',
  'stock',
  'categoryId',
  'brandId',
  'images',
  'unit',
  'origin',
  'shortDescription',
  'description',
] as const

interface ProductFormProps {
  /** Có giá trị là đang sửa, bỏ trống là thêm mới. `images` là đường dẫn tương đối. */
  defaultValues?: ProductPayload
  categories: Category[]
  brands: Brand[]
  submitLabel: string
  onSubmit: (payload: ProductPayload) => void
  onCancel: () => void
  isPending?: boolean
  error?: Error | null
}

/**
 * Form thêm/sửa sản phẩm — component **câm**.
 *
 * Nhận `defaultValues` / `onSubmit` / `isPending` / `error`, không tự fetch và
 * không giữ mutation; hai trang cha (`AdminProductNewPage`,
 * `AdminProductEditPage`) mới là nơi gọi hook. Đúng lệ `AddressForm.tsx`.
 *
 * Danh mục và thương hiệu cũng vào bằng props: chúng là dữ liệu server, mà
 * component trong `components/` không được fetch (CLAUDE.md §3).
 */
export default function ProductForm({
  defaultValues,
  categories,
  brands,
  submitLabel,
  onSubmit,
  onCancel,
  isPending = false,
  error = null,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      price: defaultValues?.price ?? undefined,
      salePrice: defaultValues?.salePrice ?? null,
      stock: defaultValues?.stock ?? undefined,
      categoryId: defaultValues?.categoryId ?? undefined,
      brandId: defaultValues?.brandId ?? null,
      images: defaultValues?.images.join('\n') ?? '',
      unit: defaultValues?.unit ?? '',
      origin: defaultValues?.origin ?? '',
      shortDescription: defaultValues?.shortDescription ?? '',
      description: defaultValues?.description ?? '',
      isFeatured: defaultValues?.isFeatured ?? false,
      isBestSeller: defaultValues?.isBestSeller ?? false,
    },
  })

  /*
   * Nối `422` vào ô nhập bằng hiệu ứng, không bằng `onError` của mutation: form
   * này là component **câm** (§3) — mutation nằm ở hai trang cha
   * (`AdminProductNewPage`, `AdminProductEditPage`), tới đây `error` chỉ còn là
   * một prop. Thêm một prop callback nữa để lấy `onError` sẽ bắt cả hai trang cha
   * phải biết về chuyện gắn lỗi vào ô, thứ vốn là việc riêng của form.
   *
   * Phụ thuộc `error`: mỗi lần hỏng, TanStack Query cấp một đối tượng lỗi mới, và
   * nó về `null` trong lúc `isPending` — nên hiệu ứng chạy đúng một lần cho mỗi
   * lần submit hỏng, không lặp lại khi form render lại vì gõ phím.
   */
  useEffect(() => {
    applyServerFieldErrors(error, setError, PRODUCT_FIELDS)
  }, [error, setError])

  /** Lỗi 422 theo từng ô đã hiện cạnh ô đó rồi thì không lặp lại ở banner chung. */
  const hasMappedFieldError = hasServerFieldError(error, PRODUCT_FIELDS)

  const categoryOptions = [
    { value: '', label: '— Chọn danh mục —' },
    ...categories.map((category) => ({
      value: String(category.id),
      // Danh mục con thụt vào để thấy được cây hai cấp trong một ô select phẳng.
      label: category.parentId === null ? category.name : `— ${category.name}`,
    })),
  ]

  const brandOptions = [
    { value: '', label: 'Không có thương hiệu' },
    ...brands.map((brand) => ({ value: String(brand.id), label: brand.name })),
  ]

  function handleValid(values: ProductFormValues) {
    onSubmit({
      name: values.name,
      // Bỏ trống thì để lớp API tự sinh slug từ tên bằng `slugify()`.
      slug: values.slug || undefined,
      price: values.price,
      salePrice: values.salePrice,
      images: parseImages(values.images),
      categoryId: values.categoryId,
      brandId: values.brandId,
      stock: values.stock,
      unit: values.unit,
      origin: values.origin,
      shortDescription: values.shortDescription,
      description: values.description,
      isFeatured: values.isFeatured,
      isBestSeller: values.isBestSeller,
    })
  }

  return (
    /* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */
    <form noValidate onSubmit={handleSubmit(handleValid)} className="space-y-5">
      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="text-base">Thông tin chung</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tên sản phẩm"
            required
            placeholder="Cà rốt hữu cơ Đà Lạt"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Slug"
            placeholder="bỏ trống để tự sinh từ tên"
            hint="Đường dẫn công khai: /san-pham/<slug>"
            error={errors.slug?.message}
            {...register('slug')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Danh mục"
            required
            options={categoryOptions}
            error={errors.categoryId?.message}
            {...register('categoryId', { setValueAs: toNumberOrNaN })}
          />
          <Select
            label="Thương hiệu"
            options={brandOptions}
            error={errors.brandId?.message}
            {...register('brandId', { setValueAs: toNumberOrNull })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Đơn vị tính"
            required
            placeholder="kg, bó 300g, hộp 12 quả…"
            error={errors.unit?.message}
            {...register('unit')}
          />
          <Input
            label="Xuất xứ"
            required
            placeholder="Đà Lạt, Lâm Đồng"
            error={errors.origin?.message}
            {...register('origin')}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="text-base">Giá và tồn kho</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Giá gốc (VNĐ)"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            placeholder="45000"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <Input
            label="Giá khuyến mãi (VNĐ)"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            placeholder="bỏ trống nếu không giảm giá"
            error={errors.salePrice?.message}
            {...register('salePrice', { setValueAs: toNumberOrNull })}
          />
          <Input
            label="Tồn kho"
            required
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="120"
            error={errors.stock?.message}
            {...register('stock', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              className="size-4 rounded border-line accent-primary"
              {...register('isFeatured')}
            />
            Sản phẩm nổi bật
          </label>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              className="size-4 rounded border-line accent-primary"
              {...register('isBestSeller')}
            />
            Bán chạy
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="text-base">Ảnh và mô tả</h2>

        <Textarea
          label="Đường dẫn ảnh"
          required
          rows={3}
          placeholder={'/images/products/rau-cu/ca-rot-1.jpg\n/images/products/rau-cu/ca-rot-2.jpg'}
          error={errors.images?.message}
          {...register('images')}
        />
        <p className="-mt-2 text-xs text-ink-muted">
          Mỗi dòng một đường dẫn, ảnh đầu tiên là ảnh đại diện. Ảnh phải nằm sẵn trong thư mục
          <code className="mx-1">public/images/</code>— màn hình này không tải ảnh lên.
        </p>

        <Textarea
          label="Mô tả ngắn"
          required
          rows={2}
          placeholder="Một câu mô tả hiện trên thẻ sản phẩm."
          error={errors.shortDescription?.message}
          {...register('shortDescription')}
        />

        <Textarea
          label="Mô tả chi tiết"
          required
          rows={6}
          error={errors.description?.message}
          {...register('description')}
        />
      </section>

      {error && !hasMappedFieldError && (
        <p role="alert" className="text-sm text-danger">
          {error.message}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Huỷ
        </Button>
        <Button type="submit" isLoading={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
