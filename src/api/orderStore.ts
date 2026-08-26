import ordersJson from '@/mocks/orders.json'
import { imageUrl } from '@/lib/image'
import type { Order, OrderStatus } from '@/types'

/**
 * Kho đơn hàng của lớp mock — **KHÔNG phải hợp đồng với backend**.
 *
 * Cùng khuôn với `productStore.ts` và cùng số phận: file này **cố ý không đặt
 * tên `*.api.ts`** vì nó không map sang endpoint nào, không có chữ ký nào
 * backend phải khớp, và **bị xoá nguyên vẹn khi ghép Spring Boot**, cùng lúc
 * với `src/mocks/` (xem `documents/API_CONTRACT.md` §E.4). Chỉ các file trong
 * `src/api/` được import nó; hook và component thì không.
 *
 * ## Đây là ĐIỂM ĐỌC DUY NHẤT của seed `orders.json`
 *
 * **Và chỉ còn ĐÚNG MỘT người đọc: `adminStats.api.ts`** (`getAdminOverview`).
 * `orders.api.ts` (`getMyOrders`, `getOrderByCode`, `createOrder`) đã lên
 * backend thật ở backlog 0012, `adminOrders.api.ts` (danh sách, chi tiết, đổi
 * trạng thái) ở backlog 0023 — cả hai **không còn đi qua `readAllOrders()`**.
 *
 * Hệ quả đang mở: số liệu màn Tổng quan tính từ **mock**, trong khi bảng đơn
 * quản trị và lịch sử đơn của khách đọc **DB thật**. Đó là cửa sổ lệch đã biết
 * và backlog 0027 là chỗ đóng nó lại. Chừng nào 0027 chưa xong thì **không được
 * xoá file này hay `src/mocks/`** — xoá là làm vỡ trang tổng quan.
 *
 * Phép kiểm bắt buộc trước khi đóng ticket có chạm dữ liệu mock: tìm đường dẫn
 * seed đó trong `src/` phải chỉ ra **đúng một** dòng — chính dòng `import` ở
 * đầu file này. (Câu văn này cố ý không viết ra đường dẫn đầy đủ, để chính nó
 * không lọt vào kết quả tìm kiếm.)
 *
 * ## Vì sao là overlay, không phải bản chụp cả danh sách
 *
 * `nss_mock_orders` chỉ lưu **phần chênh lệch** so với `orders.json`: đơn khách
 * đặt trong phiên, và patch trạng thái của những đơn admin đã đổi. `orders.json`
 * là **seed và sẽ còn lớn tiếp**; máy nào chụp cả danh sách xuống localStorage
 * sẽ đóng băng nó và không bao giờ thấy đơn seed thêm về sau.
 *
 * ## Không có `deletedIds` — có chủ đích
 *
 * Khuôn overlay ở §5.2 có ba nhánh `created` / `updated` / `deletedIds`, nhưng
 * **đơn hàng không có đường xoá**: backlog 0005 ghi rõ "không xoá đơn", và một
 * đơn đã đặt là chứng từ, không phải bản ghi catalog. Thêm nhánh không ai ghi
 * vào chỉ tạo ra một đường xoá nửa vời chờ người sau gọi nhầm.
 *
 * ## `imageUrl()` chạy đúng MỘT lần cho mỗi object
 *
 * Ảnh trong `orders.json` là **đường dẫn tương đối** (CLAUDE.md §6), được giải
 * một lần lúc nạp module ở `seedOrders`. Đơn trong `created` thì **không** giải
 * lại: `CartItem.image` là bản chụp lấy từ giỏ hàng, mà giỏ hàng nhận sản phẩm
 * đã qua `readAllProducts()` nên ảnh đã ghép base từ trước. Patch trạng thái
 * không bao giờ đụng tới `items`, nên không có đường nào map ảnh hai lần.
 */

const OVERLAY_KEY = 'nss_mock_orders'

/** Phần chênh lệch giữa danh sách đơn đang thấy và `orders.json`. */
interface OrderOverlay {
  /**
   * Đơn đặt trên chính máy này; ảnh trong `items` đã ghép base sẵn.
   *
   * **Chỉ còn đường ĐỌC.** Hàm ghi vào nhánh này đã bị xoá ở backlog 0023 vì
   * `createOrder` đi thẳng lên backend từ backlog 0012 — nhánh này giờ chỉ phục
   * vụ đơn còn sót trong `nss_mock_orders` trên máy đã chạy dự án trước đó. Bỏ
   * nó đi là làm biến mất đơn cũ khỏi màn Tổng quan mà không báo. (Cố ý không
   * viết ra tên hàm đã xoá, để phép grep chứng minh nó biến mất không bị chính
   * câu này làm nhiễu.)
   */
  created: Order[]
  /**
   * Patch theo **mã đơn** (`Order.code`), không phải `id`.
   *
   * Khoá theo `code` vì đó là thứ cả URL `/quan-tri/don-hang/:code` lẫn
   * `getOrderByCode()` dùng để tra cứu; khoá theo `id` sẽ bắt mọi lời gọi phải
   * dịch qua lại giữa hai định danh cho cùng một bản ghi.
   */
  updated: Record<string, Partial<Order>>
}

/** Seed **như đang lưu** — ảnh còn là đường dẫn tương đối. */
const rawSeedOrders = ordersJson as unknown as Order[]

/** Seed đã giải ảnh, dùng cho mọi đường đọc. Giải đúng một lần. */
const seedOrders: Order[] = rawSeedOrders.map((order) => ({
  ...order,
  items: order.items.map((item) => ({ ...item, image: imageUrl(item.image) })),
}))

const seedCodes = new Set(seedOrders.map((order) => order.code))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Đủ để loại bản ghi rác; không cố kiểm đủ mọi trường của `Order`. */
function isStoredOrder(value: unknown): value is Order {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.status === 'string' &&
    Array.isArray(value.items)
  )
}

/**
 * Đọc overlay: **đọc → chuẩn hoá → bảo đảm → ghi lại** (CLAUDE.md §5.1).
 *
 * Khoá `nss_mock_orders` **đã tồn tại từ trước ticket 0005**, khi nó còn chứa
 * một mảng `Order[]` phẳng. Vì vậy không được dùng kiểu "gieo khi khoá vắng
 * mặt": máy của người đã chạy dự án là đúng chỗ không ai test. Mỗi lần đọc đều:
 *
 * 1. parse những gì đang có (hỏng thì coi như rỗng),
 * 2. **backfill shape cũ**: mảng phẳng chính là danh sách `created`, không có
 *    patch nào — mặc định **ít can thiệp nhất**, seed hiện nguyên vẹn và đơn cũ
 *    của người dùng không mất,
 * 3. bảo đảm `updated` chỉ còn trỏ tới mã đơn **thật sự tồn tại** (seed hiện tại
 *    hoặc đơn đã tạo); seed đổi thì patch mồ côi phải rụng đi,
 * 4. chỉ ghi lại khi chuẩn hoá thật sự làm nội dung khác đi.
 */
function readOverlay(): OrderOverlay {
  const raw = localStorage.getItem(OVERLAY_KEY)

  let parsed: unknown = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    // Dữ liệu hỏng thì coi như chưa có overlay — seed vẫn hiện đầy đủ.
  }

  // Shape cũ (trước 0005): mảng `Order[]` phẳng của đơn đặt trên máy này.
  const source = Array.isArray(parsed) ? { created: parsed } : isRecord(parsed) ? parsed : {}

  const created = Array.isArray(source.created) ? source.created.filter(isStoredOrder) : []

  const knownCodes = new Set<string>([...seedCodes, ...created.map((order) => order.code)])

  const updated: Record<string, Partial<Order>> = {}
  if (isRecord(source.updated)) {
    for (const [code, patch] of Object.entries(source.updated)) {
      if (isRecord(patch) && knownCodes.has(code)) updated[code] = patch as Partial<Order>
    }
  }

  const overlay: OrderOverlay = { created, updated }

  const serialized = JSON.stringify(overlay)
  if (raw !== null && raw !== serialized) localStorage.setItem(OVERLAY_KEY, serialized)

  return overlay
}

function writeOverlay(overlay: OrderOverlay): void {
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay))
}

function applyPatch(base: Order, patch: Partial<Order> | undefined): Order {
  return patch ? { ...base, ...patch } : { ...base }
}

/**
 * Toàn bộ đơn hàng đang tồn tại, **mới nhất trước** và **đã giải đường dẫn ảnh**.
 *
 * Đây là điểm đọc duy nhất của lớp mock: `orders.api.ts` (phần khách hàng) và
 * `adminOrders.api.ts` (khu quản trị) cùng gọi hàm này, nên trạng thái admin vừa
 * đổi hiện ngay ở lịch sử đơn của khách và ngược lại.
 *
 * Đọc lại từ đầu ở **mỗi lần gọi** chứ không cache ở cấp module: vài chục phần
 * tử, lại nằm sau `delay()` của hàm gọi nó, nên chi phí bằng không — đổi lại,
 * không có bản sao nào kịp cũ đi sau một lần admin bấm đổi trạng thái.
 */
export function readAllOrders(): Order[] {
  const overlay = readOverlay()

  return [...overlay.created, ...seedOrders]
    .map((order) => applyPatch(order, overlay.updated[order.code]))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/** Một đơn theo **mã đơn** — cùng khoá với URL quản trị và `getOrderByCode()`. */
export function readOrderByCode(code: string): Order | undefined {
  return readAllOrders().find((order) => order.code === code)
}

/**
 * Ghim trạng thái mới của một đơn.
 *
 * Patch áp được cho **cả** đơn seed lẫn đơn đặt trên máy này — một đường ghi duy
 * nhất, thay vì hai nhánh phải nhớ chọn đúng ở mỗi lời gọi. Đơn seed vì vậy vẫn
 * là read-only: bản ghi gốc trong `orders.json` không đổi, chỉ có một patch
 * `{ status }` nằm chồng lên.
 *
 * **Luật chuyển trạng thái không nằm ở đây** mà ở `adminOrders.api.ts` — chỗ
 * tương ứng với endpoint backend sẽ phải cưỡng chế.
 */
export function writeOrderStatus(code: string, status: OrderStatus): void {
  const overlay = readOverlay()
  overlay.updated[code] = { ...overlay.updated[code], status }
  writeOverlay(overlay)
}
