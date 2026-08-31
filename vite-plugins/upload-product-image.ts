import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Middleware dev-only cho backlog 0034 — nhận một ảnh nhị phân qua `fetch()` (không
 * `multipart/form-data`, xem ràng buộc #1 của ticket: không thêm dependency mới), ghi
 * xuống `public/images/products/<category>/<filename>` để `ProductForm.tsx` gọi khi
 * admin thêm/sửa sản phẩm.
 *
 * **CHỈ đăng ký qua `configureServer` — KHÔNG `configurePreviewServer`.** Đây là điều
 * kiện cứng của ticket: `vite preview` và mọi bản build tĩnh không được có endpoint
 * này. Không định nghĩa `configurePreviewServer` là đủ để Vite không bao giờ chạy nó
 * ngoài `npm run dev` — không cần một cờ NODE_ENV nào để tự tắt.
 */

const UPLOAD_PATH = '/__dev/upload-image'

/** Điều 5: chỉ nhận các loại ảnh này, 8MB/ảnh. */
const MAX_FILE_SIZE = 8 * 1024 * 1024
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

/** Điều 3: category chỉ nhận allow-list này, không suy diễn thêm. */
const CATEGORY_PATTERN = /^[a-z0-9-]+$/

/**
 * Điều 3: filename là input không tin cậy. Từ chối thẳng bất cứ gì có thể trèo ra
 * ngoài thư mục đích — không cố "làm sạch rồi vẫn nhận", vì đó không còn là chặn nữa.
 */
function isTraversalUnsafe(raw: string): boolean {
  return raw.length === 0 || raw.includes('..') || raw.includes('/') || raw.includes('\\')
}

/**
 * Slug hoá phần tên gốc (không đuôi) để làm tên file cuối. Bản rút gọn của
 * `src/lib/utils.ts#slugify` — cố ý chép lại thay vì import từ `src/`, vì file này
 * chạy trong tiến trình Node của Vite (`configureServer`), không phải trong bundle
 * client mà `src/` phục vụ.
 */
function slugifyBasename(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

/**
 * Đọc nguyên body nhị phân. Vượt `maxSize` thì **ngừng giữ chunk** (chặn phình bộ
 * nhớ) nhưng vẫn để stream chảy hết tới `end` rồi mới `reject` — cố tình không gọi
 * `req.destroy()` giữa chừng, vì request/response dùng chung một socket HTTP/1.1:
 * huỷ sớm kéo theo huỷ luôn socket, khiến client không bao giờ nhận được body lỗi
 * `400` tử tế mà chỉ thấy kết nối rớt (đã đo được chính hiện tượng này lúc viết).
 */
function readBody(req: IncomingMessage, maxSize: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let total = 0
    let tooLarge = false

    req.on('data', (chunk: Buffer) => {
      total += chunk.length
      if (total > maxSize) {
        tooLarge = true
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (tooLarge) reject(new Error('FILE_TOO_LARGE'))
      else resolve(Buffer.concat(chunks))
    })
    req.on('error', reject)
  })
}

/** Điều 4: không đè file — thêm hậu tố `-2`, `-3`… tới khi trống chỗ. */
function resolveFinalFilename(dir: string, base: string, ext: string): string {
  let candidate = `${base}.${ext}`
  let attempt = 2
  while (existsSync(path.join(dir, candidate))) {
    candidate = `${base}-${attempt}.${ext}`
    attempt += 1
  }
  return candidate
}

export function uploadProductImagePlugin(): Plugin {
  return {
    name: 'dev-upload-product-image',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        const url = new URL(req.url ?? '', 'http://localhost')
        if (url.pathname !== UPLOAD_PATH) {
          next()
          return
        }

        const category = url.searchParams.get('category') ?? ''
        const filenameRaw = url.searchParams.get('filename') ?? ''

        if (!CATEGORY_PATTERN.test(category)) {
          sendJson(res, 400, { detail: 'Danh mục không hợp lệ.' })
          return
        }
        if (isTraversalUnsafe(filenameRaw)) {
          sendJson(res, 400, { detail: 'Tên file không hợp lệ.' })
          return
        }

        const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim()
        const ext = MIME_TO_EXT[contentType]
        if (!ext) {
          sendJson(res, 400, { detail: 'Chỉ nhận ảnh JPEG, PNG, WEBP, GIF hoặc AVIF.' })
          return
        }

        let body: Buffer
        try {
          body = await readBody(req, MAX_FILE_SIZE)
        } catch {
          sendJson(res, 400, { detail: 'File vượt quá 8MB.' })
          return
        }
        if (body.length === 0) {
          sendJson(res, 400, { detail: 'File rỗng.' })
          return
        }

        const extIndex = filenameRaw.lastIndexOf('.')
        const rawBase = extIndex > 0 ? filenameRaw.slice(0, extIndex) : filenameRaw
        const base = slugifyBasename(rawBase) || 'anh'

        try {
          const root = server.config.root ?? process.cwd()
          const targetDir = path.join(root, 'public', 'images', 'products', category)
          mkdirSync(targetDir, { recursive: true })

          const finalFilename = resolveFinalFilename(targetDir, base, ext)
          writeFileSync(path.join(targetDir, finalFilename), body)

          sendJson(res, 200, { path: `/images/products/${category}/${finalFilename}` })
        } catch (err) {
          sendJson(res, 500, {
            detail: err instanceof Error ? err.message : 'Không ghi được file lên đĩa.',
          })
        }
      })
    },
  }
}
