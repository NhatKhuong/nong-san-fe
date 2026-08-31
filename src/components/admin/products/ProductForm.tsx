import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { applyServerFieldErrors, hasServerFieldError } from '@/lib/fieldErrors'
import { imageUrl } from '@/lib/image'
import { cn } from '@/lib/utils'
import { useDevImageUpload } from '@/hooks/useDevImageUpload'
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
 * Suy `slug` danh mục **gốc** từ danh mục đang chọn của sản phẩm — backlog 0034
 * ràng buộc #6. `categories` là danh sách phẳng cả cha lẫn con (`Category.parentId`
 * `null` = gốc), đúng shape `useCategories()` đã trả sẵn cho `ProductForm` từ trước;
 * không cần gọi thêm API nào. Cây danh mục ở dự án này chỉ hai cấp (xác nhận qua
 * cách `categoryOptions` bên dưới render — con thụt một cấp duy nhất), nhưng vòng
 * lặp vẫn leo tới khi `parentId === null` để không phụ thuộc giả định độ sâu.
 */
function findRootCategorySlug(categoryId: number, categories: Category[]): string | null {
  const byId = new Map(categories.map((category) => [category.id, category]))
  let current = byId.get(categoryId)
  let guard = 0
  while (current && current.parentId !== null && guard < 10) {
    current = byId.get(current.parentId)
    guard += 1
  }
  return current?.slug ?? null
}

/**
 * Một ảnh trong ô chọn ảnh — bao gồm cả ảnh cũ đã upload (`status: 'done'` ngay từ
 * đầu) lẫn ảnh vừa chọn đang/đã tải lên qua middleware dev-only. `path` chỉ có giá
 * trị khi `status === 'done'`; đây là nguồn duy nhất đổ vào `images` của form.
 */
interface ImageItem {
  id: string
  previewUrl: string
  path: string | null
  status: 'uploading' | 'done' | 'error'
  errorMessage?: string
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
    // Mảng đường dẫn tương đối đã upload — không còn là chuỗi nhiều dòng gõ tay
    // (backlog 0034). `ProductForm` tự đổ mảng này bằng `setValue`, không có ô
    // native nào `register('images')` trực tiếp.
    images: z
      .array(z.string().trim().min(1))
      .min(1, 'Cần ít nhất một ảnh.')
      .refine(
        (paths) => paths.every((path) => path.startsWith('/images/')),
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
 * không giữ mutation ghi sản phẩm; hai trang cha (`AdminProductNewPage`,
 * `AdminProductEditPage`) mới là nơi gọi hook đó. Đúng lệ `AddressForm.tsx`.
 *
 * Danh mục và thương hiệu cũng vào bằng props: chúng là dữ liệu server, mà
 * component trong `components/` không được fetch (CLAUDE.md §3).
 *
 * **Ngoại lệ có chủ đích:** ô chọn ảnh tự gọi `useDevImageUpload()` (backlog
 * 0034) — không phải dữ liệu hiển thị của trang mà là một hành động gắn chặt
 * với chính widget multi-file trong form này; tách nó lên hai trang cha sẽ chỉ
 * chép đôi cùng một logic. Ảnh cũ hiện thumbnail qua `imageUrl()` gọi thẳng ở
 * đây — cũng là ngoại lệ có chủ đích của CLAUDE.md §6 ("imageUrl() gọi ở lớp
 * src/api/, không gọi trong component"): quy tắc đó nhằm đảm bảo *dữ liệu đọc*
 * luôn đã ghép base sẵn, còn `ProductPayload.images` thì ngược lại — cố ý giữ
 * đường dẫn tương đối để round-trip nguyên vẹn qua `POST`/`PUT` (JSDoc của
 * chính `ProductPayload`). `imageUrl()` ở đây chỉ đụng tới `src` của `<img>`
 * preview, không bao giờ ghi ngược vào state gửi lên server.
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
    setValue,
    control,
    formState: { errors, isSubmitted },
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
      images: defaultValues?.images ?? [],
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
   * này là component **câm** (§3) — mutation ghi sản phẩm nằm ở hai trang cha
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

  // ---- Ô chọn ảnh: multi-file picker + upload qua middleware dev-only ----

  const [images, setImages] = useState<ImageItem[]>(() =>
    (defaultValues?.images ?? []).map((path) => ({
      id: crypto.randomUUID(),
      previewUrl: imageUrl(path),
      path,
      status: 'done' as const,
    })),
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: uploadImage } = useDevImageUpload()

  const categoryId = useWatch({ control, name: 'categoryId' })
  const rootCategorySlug =
    categoryId && !Number.isNaN(categoryId) ? findRootCategorySlug(categoryId, categories) : null

  // Đổ danh sách ảnh **đã tải xong** vào field `images` của form — nguồn chân lý
  // khi submit vẫn là `values.images` do zod validate, không phải `images` state
  // ở trên (state này còn giữ cả ảnh đang tải/lỗi để vẽ UI).
  useEffect(() => {
    const donePaths = images
      .filter((image): image is ImageItem & { path: string } => image.status === 'done' && image.path !== null)
      .map((image) => image.path)
    setValue('images', donePaths, { shouldValidate: isSubmitted })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, isSubmitted])

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)

    if (!rootCategorySlug) {
      setImages((prev) => [
        ...prev,
        ...files.map((file) => ({
          id: crypto.randomUUID(),
          previewUrl: URL.createObjectURL(file),
          path: null,
          status: 'error' as const,
          errorMessage: 'Chọn danh mục trước khi thêm ảnh.',
        })),
      ])
      return
    }

    for (const file of files) {
      const id = crypto.randomUUID()
      const previewUrl = URL.createObjectURL(file)
      setImages((prev) => [...prev, { id, previewUrl, path: null, status: 'uploading' }])

      uploadImage({ file, categorySlug: rootCategorySlug })
        .then((path) => {
          setImages((prev) =>
            prev.map((image) => (image.id === id ? { ...image, path, status: 'done' } : image)),
          )
        })
        .catch((err: unknown) => {
          setImages((prev) =>
            prev.map((image) =>
              image.id === id
                ? {
                    ...image,
                    status: 'error',
                    errorMessage: err instanceof Error ? err.message : 'Tải ảnh lên thất bại.',
                  }
                : image,
            ),
          )
        })
    }
  }

  function handleRemoveImage(id: string) {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id)
      if (target?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((image) => image.id !== id)
    })
  }

  function handleValid(values: ProductFormValues) {
    onSubmit({
      name: values.name,
      // Bỏ trống thì để lớp API tự sinh slug từ tên bằng `slugify()`.
      slug: values.slug || undefined,
      price: values.price,
      salePrice: values.salePrice,
      images: values.images,
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

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Ảnh sản phẩm<span className="ml-0.5 text-danger">*</span>
          </span>

          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  'relative size-24 shrink-0 overflow-hidden rounded-lg border bg-surface',
                  image.status === 'error' ? 'border-danger' : 'border-line',
                )}
              >
                <img
                  src={image.previewUrl}
                  alt={`Ảnh sản phẩm ${index + 1}`}
                  loading="lazy"
                  className="size-full object-cover"
                />

                {image.status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Loader2 size={20} className="animate-spin text-primary" aria-hidden="true" />
                  </div>
                )}

                {image.status === 'error' && (
                  <div
                    role="alert"
                    className="absolute inset-0 flex items-center justify-center bg-danger/10 p-1 text-center text-[10px] leading-tight text-danger"
                  >
                    {image.errorMessage ?? 'Lỗi'}
                  </div>
                )}

                {index === 0 && image.status === 'done' && (
                  <span className="absolute right-0 bottom-0 left-0 bg-primary/90 px-1 py-0.5 text-center text-[10px] text-white">
                    Đại diện
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  aria-label={`Xoá ảnh sản phẩm ${index + 1}`}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-danger"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-ink-muted transition hover:border-primary hover:text-primary"
            >
              <ImagePlus size={20} aria-hidden="true" />
              <span className="text-xs">Thêm ảnh</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                handleFilesSelected(event.target.files)
                event.target.value = ''
              }}
            />
          </div>

          {errors.images?.message && (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {errors.images.message}
            </p>
          )}

          <p className="mt-2 text-xs text-ink-muted">
            Ảnh đầu tiên là ảnh đại diện, xoá được từng ảnh. Ảnh mới chọn tự lưu vào thư mục
            của danh mục gốc. Tính năng tải ảnh lên <strong>chỉ hoạt động khi chạy
            <code className="mx-1">npm run dev</code>ở máy cục bộ</strong>, không có tác dụng
            trên bản đã triển khai.
          </p>
        </div>

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
