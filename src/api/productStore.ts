import productsJson from '@/mocks/products.json'
import { imageUrl } from '@/lib/image'
import type { Product } from '@/types'

/**
 * Kho catalog của lớp mock — **KHÔNG phải hợp đồng với backend**.
 *
 * File này **cố ý không đặt tên `*.api.ts`**: nó không map sang endpoint nào,
 * không có chữ ký nào backend phải khớp, và **bị xoá nguyên vẹn khi ghép Spring
 * Boot**, cùng lúc với `src/mocks/` (xem `documents/API_CONTRACT.md` §E.4). Chỉ
 * các file trong `src/api/` được import nó; hook và component thì không —
 * chúng đi qua `products.api.ts` / `adminProducts.api.ts` như mọi dữ liệu khác.
 *
 * Nó tồn tại vì khu quản trị **ghi được** vào catalog, mà catalog gốc là một
 * file JSON tĩnh nạp lúc khởi động. Trước ticket 0004, `products.api.ts` dựng
 * `const products = ...` một lần lúc nạp module; giữ lại kiểu đó thì mọi thay
 * đổi của admin chết theo lần F5 kế tiếp.
 *
 * ## Vì sao là overlay, không phải bản chụp cả danh sách
 *
 * `nss_mock_products` chỉ lưu **phần chênh lệch** so với `products.json`:
 * sản phẩm admin tạo thêm, patch của những sản phẩm admin đã sửa, và id của
 * những sản phẩm bị xoá mềm. `products.json` là **seed và sẽ còn lớn tiếp** —
 * máy nào lưu một bản chụp toàn bộ danh sách sẽ không bao giờ nhìn thấy sản
 * phẩm seed thêm về sau, vì bản chụp cũ luôn thắng. Overlay cho seed chảy qua
 * và chỉ ghim đúng thứ admin đã đụng vào.
 *
 * ## `imageUrl()` chạy đúng MỘT lần cho mỗi object
 *
 * Ảnh của seed được giải một lần lúc nạp module (`displayProducts`); ảnh của
 * bản ghi trong overlay được giải trong `readAllProducts()`. Khi trộn patch,
 * chỉ map `patch.images` **nếu patch thật sự mang theo `images`** — không thì
 * giữ nguyên mảng đã giải của seed. Map hai lần **vô hình lúc dev** (base ảnh
 * đang trống) và chỉ nổ ra khi bật CDN.
 *
 * Trong localStorage **luôn là đường dẫn tương đối**, không bao giờ là URL đã
 * ghép base — ghi URL đã ghép xuống store nghĩa là ghim luôn gốc CDN vào dữ
 * liệu (`types/product.ts`, JSDoc của `ProductPayload`).
 */

const OVERLAY_KEY = 'nss_mock_products'

/** Phần chênh lệch giữa catalog admin đang thấy và `products.json`. */
interface ProductOverlay {
  /** Sản phẩm admin tạo mới; `id = Date.now()`, ảnh là đường dẫn tương đối. */
  created: Product[]
  /** Patch theo id (khoá là id dạng chuỗi vì JSON không có khoá số). */
  updated: Record<string, Partial<Product>>
  /** Xoá **mềm**: id vẫn nằm trong seed, chỉ bị lọc ra lúc đọc. */
  deletedIds: number[]
}

/** Seed **như đang lưu** — ảnh còn là đường dẫn tương đối. */
const seedProducts = productsJson as Product[]

/** Seed đã giải ảnh, dùng cho mọi đường đọc để hiển thị. Giải đúng một lần. */
const displayProducts: Product[] = seedProducts.map((product) => ({
  ...product,
  images: product.images.map(imageUrl),
}))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Đủ để loại bản ghi rác; không cố kiểm đủ 20 trường của `Product`. */
function isStoredProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.slug === 'string' &&
    Array.isArray(value.images)
  )
}

/**
 * Đọc overlay: **đọc → chuẩn hoá → bảo đảm → ghi lại** (CLAUDE.md §5.1).
 *
 * Không dùng kiểu "gieo khi khoá vắng mặt": khoá này có thể đã tồn tại từ một
 * phiên bản trước với shape khác, và máy đã chạy dự án là đúng chỗ không ai
 * test. Mỗi lần đọc đều:
 *
 * 1. parse những gì đang có (hỏng thì coi như rỗng),
 * 2. **backfill** đủ ba nhánh `created` / `updated` / `deletedIds` cho bản ghi
 *    cũ thiếu nhánh, mặc định về giá trị **ít can thiệp nhất** — mảng rỗng,
 *    tức là seed hiện nguyên vẹn,
 * 3. bảo đảm overlay chỉ còn trỏ tới id **thật sự tồn tại** (seed hiện tại hoặc
 *    sản phẩm đã tạo). Đây là bước tương đương "bảo đảm bản ghi gieo sẵn có
 *    mặt" của các store khác: seed đổi thì patch/xoá mồ côi phải rụng đi, nếu
 *    không chúng ghim vĩnh viễn một id không còn ý nghĩa,
 * 4. chỉ ghi lại khi chuẩn hoá thật sự làm nội dung khác đi.
 */
function readOverlay(): ProductOverlay {
  const raw = localStorage.getItem(OVERLAY_KEY)

  let parsed: unknown = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    // Dữ liệu hỏng thì coi như chưa có overlay — seed vẫn hiện đầy đủ.
  }

  const source = isRecord(parsed) ? parsed : {}

  const created = Array.isArray(source.created) ? source.created.filter(isStoredProduct) : []

  const knownIds = new Set<number>([
    ...seedProducts.map((product) => product.id),
    ...created.map((product) => product.id),
  ])

  const updated: Record<string, Partial<Product>> = {}
  if (isRecord(source.updated)) {
    for (const [key, patch] of Object.entries(source.updated)) {
      if (isRecord(patch) && knownIds.has(Number(key))) updated[key] = patch as Partial<Product>
    }
  }

  const deletedIds = Array.isArray(source.deletedIds)
    ? [
        ...new Set(
          source.deletedIds.filter(
            (id): id is number => typeof id === 'number' && knownIds.has(id),
          ),
        ),
      ]
    : []

  const overlay: ProductOverlay = { created, updated, deletedIds }

  const serialized = JSON.stringify(overlay)
  if (raw !== null && raw !== serialized) localStorage.setItem(OVERLAY_KEY, serialized)

  return overlay
}

function writeOverlay(overlay: ProductOverlay): void {
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay))
}

/** Trộn patch lên bản ghi gốc, giữ nguyên đường dẫn ảnh như đang lưu. */
function applyPatch(base: Product, patch: Partial<Product> | undefined): Product {
  return patch ? { ...base, ...patch } : { ...base }
}

/**
 * Trộn patch lên một bản ghi **đã giải ảnh**.
 *
 * `patch.images` là đường dẫn tương đối nên phải giải; còn khi patch không đụng
 * tới ảnh thì giữ nguyên mảng của seed — nó đã được giải lúc nạp module, map
 * thêm lần nữa là ghép base hai lần.
 */
function applyPatchForDisplay(base: Product, patch: Partial<Product> | undefined): Product {
  if (!patch) return { ...base }
  return {
    ...base,
    ...patch,
    images: patch.images ? patch.images.map(imageUrl) : base.images,
  }
}

/**
 * Toàn bộ catalog admin đang thấy, **đã giải đường dẫn ảnh** — đây là điểm đọc
 * duy nhất của lớp mock, dùng chung cho `products.api.ts` (danh sách, chi tiết,
 * gợi ý), `categories.api.ts` (`productCount`) và `orders.api.ts`
 * (`validateCart`).
 *
 * Đọc lại từ đầu ở **mỗi lần gọi** chứ không cache ở cấp module: ~40 phần tử,
 * lại nằm sau `delay()` của hàm gọi nó, nên chi phí bằng không — đổi lại, không
 * có bản sao nào kịp cũ đi sau một lần admin bấm Lưu.
 */
export function readAllProducts(): Product[] {
  const overlay = readOverlay()
  const deleted = new Set(overlay.deletedIds)
  const result: Product[] = []

  for (const seed of displayProducts) {
    if (deleted.has(seed.id)) continue
    result.push(applyPatchForDisplay(seed, overlay.updated[String(seed.id)]))
  }

  for (const created of overlay.created) {
    if (deleted.has(created.id)) continue
    const merged = applyPatch(created, overlay.updated[String(created.id)])
    result.push({ ...merged, images: merged.images.map(imageUrl) })
  }

  return result
}

/**
 * Một sản phẩm theo **id**, trả về **đúng như đang lưu**: `images` còn là đường
 * dẫn tương đối, chưa qua `imageUrl()`.
 *
 * ⚠️ Khác `readAllProducts()` một cách có chủ đích. Hàm này phục vụ **form sửa
 * sản phẩm**, nơi giá trị đọc lên sẽ được gửi ngược xuống store trong
 * `ProductPayload`. Đưa URL đã ghép base vào ô nhập là lần Lưu kế tiếp ghi
 * thẳng gốc CDN xuống dữ liệu. Cần ảnh để **hiển thị** thì dùng
 * `readAllProducts()`.
 */
export function readProductById(id: number): Product | undefined {
  const overlay = readOverlay()
  if (overlay.deletedIds.includes(id)) return undefined

  const base =
    overlay.created.find((product) => product.id === id) ??
    seedProducts.find((product) => product.id === id)
  if (!base) return undefined

  return applyPatch(base, overlay.updated[String(id)])
}

/** Ghi một sản phẩm mới vào overlay. `product.images` phải là đường dẫn tương đối. */
export function writeCreated(product: Product): void {
  const overlay = readOverlay()
  overlay.created = [product, ...overlay.created]
  writeOverlay(overlay)
}

/**
 * Ghim thay đổi của một sản phẩm.
 *
 * Patch áp được cho **cả** sản phẩm seed lẫn sản phẩm do admin tạo — một đường
 * ghi duy nhất, thay vì hai nhánh phải nhớ chọn đúng ở mỗi lời gọi.
 */
export function writeUpdated(id: number, patch: Partial<Product>): void {
  const overlay = readOverlay()
  overlay.updated[String(id)] = { ...overlay.updated[String(id)], ...patch }
  writeOverlay(overlay)
}

/**
 * Xoá một sản phẩm.
 *
 * Sản phẩm seed bị **xoá mềm** (ghi id vào `deletedIds`) vì bản ghi gốc nằm
 * trong `products.json`, không xoá được. Sản phẩm chỉ tồn tại trong overlay thì
 * gỡ hẳn khỏi `created`: giữ lại một bản ghi vô hình kèm id trong `deletedIds`
 * chỉ làm overlay phình ra mà không thêm thông tin nào.
 */
export function writeDeleted(id: number): void {
  const overlay = readOverlay()
  delete overlay.updated[String(id)]

  const createdIndex = overlay.created.findIndex((product) => product.id === id)
  if (createdIndex >= 0) overlay.created.splice(createdIndex, 1)
  else if (!overlay.deletedIds.includes(id)) overlay.deletedIds.push(id)

  writeOverlay(overlay)
}
