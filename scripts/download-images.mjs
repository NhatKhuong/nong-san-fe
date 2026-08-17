/**
 * Tải toàn bộ ảnh đang trỏ ra bên thứ ba về `public/images/`, rồi ghi lại
 * dữ liệu mock với đường dẫn local.
 *
 * Chạy:  node scripts/download-images.mjs
 *
 * An toàn khi chạy lại nhiều lần: file đã tồn tại thì bỏ qua, và các đường dẫn
 * đã là local (bắt đầu bằng "/images/") cũng được bỏ qua.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MOCKS = join(ROOT, 'src/mocks')
const OUT = join(ROOT, 'public/images')

/** Nghỉ giữa các request để không bị nguồn ảnh giới hạn tần suất. */
const DELAY_MS = 150

const stats = { downloaded: 0, skipped: 0, failed: [] }
/** Ánh xạ file local -> URL gốc, dùng sinh docs/IMAGE-CREDITS.md */
const credits = []

const readJson = (name) => JSON.parse(readFileSync(join(MOCKS, name), 'utf8'))
const writeJson = (name, data) =>
  writeFileSync(join(MOCKS, name), JSON.stringify(data, null, 2) + '\n')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Đuôi file suy từ Content-Type, mặc định .jpg. */
function extFromType(contentType = '') {
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('svg')) return '.svg'
  return '.jpg'
}

const EXTS = ['.jpg', '.png', '.webp']

/**
 * Sổ ghi nguồn của từng file đã tải: `{ "/images/posts/abc.jpg": "https://…" }`.
 *
 * Cần nó để phân biệt hai tình huống trông giống hệt nhau — "file đã tồn tại và
 * mock vẫn giữ URL từ xa":
 *  - cùng URL  → lần chạy trước bị ngắt giữa chừng, dùng lại file, không tải nữa
 *  - khác URL  → người dùng cố ý thay ảnh, phải tải về TÊN MỚI
 */
const MANIFEST = join(OUT, '.sources.json')
const sources = (() => {
  try {
    return JSON.parse(readFileSync(MANIFEST, 'utf8'))
  } catch {
    return {}
  }
})()

/** File đã tồn tại cho tên này chưa? Trả về đuôi đầu tiên tìm thấy. */
function existingExt(targetDir, name) {
  return EXTS.find((ext) => existsSync(join(targetDir, name + ext)))
}

/**
 * Chọn tên chưa bị chiếm: `ca-rot`, rồi `ca-rot-2`, `ca-rot-3`…
 *
 * Đây là quy tắc "thay ảnh thì đổi luôn tên file" trong CLAUDE.md: file trong
 * `public/` không được Vite gắn hash, nên giữ nguyên tên sẽ khiến người dùng cũ
 * thấy ảnh cũ trong cache.
 */
function resolveTarget(targetDir, dir, name, url) {
  let candidate = name
  for (let version = 2; version < 50; version++) {
    const ext = existingExt(targetDir, candidate)
    if (!ext) return { name: candidate }
    // File này vốn tải từ đúng URL đang xét → lần chạy trước bị ngắt, dùng lại.
    if (sources[`/images/${dir}/${candidate}${ext}`] === url) {
      return { reuse: `/images/${dir}/${candidate}${ext}` }
    }
    candidate = `${name}-${version}`
  }
  throw new Error(`Khong tim duoc ten trong cho ${name}`)
}

/**
 * Tải một ảnh về `<OUT>/<dir>/<name><ext>` và trả về đường dẫn public.
 *
 * - `url` đã là đường dẫn local → giữ nguyên, không làm gì.
 * - `url` từ xa, chưa có file local → tải về đúng tên đó.
 * - `url` từ xa, đã có file local tải từ CHÍNH url này → dùng lại, không tải.
 * - `url` từ xa, đã có file local nhưng tải từ url KHÁC → thay ảnh, dùng tên mới.
 *
 * Trước đây nhánh cuối lặng lẽ giữ file cũ, nghĩa là đổi URL trong mock không có
 * tác dụng gì mà người chạy script cũng không hề biết.
 */
async function fetchImage(url, dir, name) {
  if (!url || url.startsWith('/images/')) {
    stats.skipped++
    return url
  }

  const targetDir = join(OUT, dir)
  mkdirSync(targetDir, { recursive: true })

  const target = resolveTarget(targetDir, dir, name, url)

  if (target.reuse) {
    stats.skipped++
    credits.push({ file: target.reuse, source: url })
    return target.reuse
  }

  const targetName = target.name
  if (targetName !== name) {
    process.stdout.write(`  ~ thay anh: ${name} -> ${targetName}\n`)
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const ext = extFromType(response.headers.get('content-type') ?? '')
    const buffer = Buffer.from(await response.arrayBuffer())
    writeFileSync(join(targetDir, targetName + ext), buffer)

    stats.downloaded++
    const publicPath = `/images/${dir}/${targetName}${ext}`
    credits.push({ file: publicPath, source: url })
    process.stdout.write(`  ✓ ${publicPath} (${Math.round(buffer.length / 1024)} KB)\n`)

    await sleep(DELAY_MS)
    return publicPath
  } catch (error) {
    stats.failed.push(`${url} -> ${error.message}`)
    process.stdout.write(`  ✗ THAT BAI: ${name} (${error.message})\n`)
    return url // giữ URL cũ để không làm hỏng dữ liệu
  }
}

// ---------------------------------------------------------------- sản phẩm
console.log('\n[1/6] Anh san pham')
const categories = readJson('categories.json')
const products = readJson('products.json')

/** Sản phẩm có thể thuộc danh mục con — lần lên danh mục gốc để xếp thư mục. */
function rootCategorySlug(categoryId) {
  const category = categories.find((item) => item.id === categoryId)
  if (!category) return 'khac'
  if (category.parentId === null) return category.slug
  const parent = categories.find((item) => item.id === category.parentId)
  return parent?.slug ?? category.slug
}

for (const product of products) {
  const dir = `products/${rootCategorySlug(product.categoryId)}`
  const images = []
  for (const [index, url] of product.images.entries()) {
    images.push(await fetchImage(url, dir, `${product.slug}-${index + 1}`))
  }
  product.images = images
}
writeJson('products.json', products)

// --------------------------------------------------------------- danh mục
console.log('\n[2/6] Anh danh muc')
for (const category of categories) {
  category.image = await fetchImage(category.image, 'categories', category.slug)
}
writeJson('categories.json', categories)

// --------------------------------------------------------------- bài viết
console.log('\n[3/6] Anh bai viet')
const posts = readJson('posts.json')
for (const post of posts) {
  post.thumbnail = await fetchImage(post.thumbnail, 'posts', post.slug)
}
writeJson('posts.json', posts)

// ------------------------------------------------------- trang giới thiệu
console.log('\n[3b/6] Anh trang gioi thieu')
const about = readJson('about.json')
about.heroImage = await fetchImage(about.heroImage, 'about', 'hero')
about.storyImage = await fetchImage(about.storyImage, 'about', 'cau-chuyen')
writeJson('about.json', about)

// ---------------------------------------------------------------- avatar
console.log('\n[4/6] Avatar danh gia')
const testimonials = readJson('testimonials.json')
for (const item of testimonials) {
  item.avatar = await fetchImage(item.avatar, 'avatars', `khach-hang-${item.id}`)
}
writeJson('testimonials.json', testimonials)

// ------------------------------------------------- hero + promo banner
// Hai nhóm này nằm trong file .ts/.tsx chứ không phải JSON, nên thay bằng
// cách tìm URL trong mã nguồn rồi thế chỗ.
console.log('\n[5/6] Hero slide & promo banner')
const SOURCE_FILES = [
  { path: 'src/api/marketing.api.ts', prefix: 'hero' },
  { path: 'src/components/home/PromoBanners.tsx', prefix: 'promo' },
]

for (const { path, prefix } of SOURCE_FILES) {
  const full = join(ROOT, path)
  let content = readFileSync(full, 'utf8')
  const urls = [...new Set(content.match(/https:\/\/(images\.unsplash\.com|picsum\.photos)[^'"\s]+/g) ?? [])]

  for (const [index, url] of urls.entries()) {
    const localPath = await fetchImage(url, 'banners', `${prefix}-${index + 1}`)
    content = content.split(url).join(localPath)
  }
  writeFileSync(full, content)
}

// ------------------------------------------------------------- báo cáo
console.log('\n[6/6] Ghi manifest + docs/IMAGE-CREDITS.md')

// Sổ nguồn: dùng ở lần chạy sau để biết ảnh nào đã tải từ URL nào.
const nextSources = { ...sources }
credits.filter((c) => c.source.startsWith('http')).forEach((c) => (nextSources[c.file] = c.source))
writeFileSync(MANIFEST, JSON.stringify(nextSources, null, 2) + '\n')

/*
 * Bảng nguồn dựng từ MANIFEST chứ không phải từ `credits` của riêng lần chạy này.
 *
 * `credits` chỉ chứa ảnh có URL từ xa trong mock. Sau lần chạy đầu, mock đã được
 * ghi lại thành đường dẫn local nên `credits` gần như rỗng — bảng bị xoá sạch ở
 * mỗi lần chạy lại, đúng thứ mà file này sinh ra để tránh.
 */
const creditRows = Object.entries(nextSources)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, source]) => `| \`${file}\` | ${source.split('?')[0]} |`)
  .join('\n')

writeFileSync(
  join(ROOT, 'docs/IMAGE-CREDITS.md'),
  `# Nguồn gốc ảnh

Toàn bộ ảnh trong \`public/images/\` được tải về bằng \`scripts/download-images.mjs\`.
Nguồn gồm [Unsplash](https://unsplash.com), [Lorem Picsum](https://picsum.photos), và một số
ảnh **CC0 / public domain** lấy qua [Openverse](https://openverse.org) (rawpixel, Flickr).

Cả ba nhóm đều cho phép dùng miễn phí kể cả cho mục đích thương mại và **không bắt buộc ghi
công**. Bảng dưới đây giữ lại để sau này còn biết ảnh nào lấy từ đâu mà thay thế.

Logo thương hiệu trong \`public/images/brands/\` là SVG tự sinh, không tải từ đâu cả.

> **Bảng này thiếu các ảnh tải trước Giai đoạn 8.** Cho đến lúc đó, script dựng bảng từ URL
> còn nằm trong mock — mà sau lần chạy đầu mock đã được ghi lại thành đường dẫn local, nên mỗi
> lần chạy lại bảng bị xoá bớt. Nay bảng dựng từ sổ \`public/images/.sources.json\` nên không
> mất nữa, nhưng phần đã mất thì không khôi phục được vì file này chưa từng được commit.

> **Thay ảnh:** đổi URL trong mock rồi chạy lại script. Script tự tải về **tên file mới**
> (\`ten-2.jpg\`) chứ không ghi đè, vì file trong \`public/\` không được Vite gắn hash — giữ
> nguyên tên sẽ khiến người dùng cũ vẫn thấy ảnh cũ trong cache. Sổ \`public/images/.sources.json\`
> là thứ giúp script phân biệt "thay ảnh" với "chạy lại sau khi bị ngắt".

| File local | Ảnh gốc |
|---|---|
${creditRows}
`,
)

console.log('\n==================== KET QUA ====================')
console.log(`Tai ve : ${stats.downloaded}`)
console.log(`Bo qua : ${stats.skipped} (da co san hoac da la duong dan local)`)
console.log(`Loi    : ${stats.failed.length}`)
if (stats.failed.length) {
  console.log('\nDanh sach loi:')
  stats.failed.forEach((f) => console.log('  ' + f))
  process.exitCode = 1
}
