/**
 * Tải font Quicksand + Inter về `public/fonts/` và sinh `src/styles/fonts.css`.
 *
 * Chạy:  node scripts/download-fonts.mjs
 *
 * Vì sao tự host: cùng lý do đã đưa toàn bộ ảnh về local ở Giai đoạn 5.5 —
 * không phụ thuộc bên thứ ba lúc chạy. Ngoài ra còn bớt một vòng DNS + TLS tới
 * fonts.gstatic.com khi tải trang, và các bộ kiểm thử hết bị nhiễu bởi lỗi 404
 * của font (xem ghi chú về patchright trong nhật ký).
 *
 * An toàn khi chạy lại: file đã tồn tại thì bỏ qua, chỉ sinh lại CSS.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_FONTS = join(ROOT, 'public/fonts')
const OUT_CSS = join(ROOT, 'src/styles/fonts.css')

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600&display=swap'

/**
 * User-Agent của Chrome là bắt buộc: Google trả về định dạng font theo UA.
 * UA mặc định của Node sẽ nhận ttf thay vì woff2, nặng hơn nhiều lần.
 */
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

/**
 * Chỉ giữ ba bộ ký tự này.
 *
 * `vietnamese` là bắt buộc và cũng là thứ dễ quên nhất: thiếu nó thì chữ có dấu
 * rơi về font hệ thống, trang trông vẫn "chạy" nên rất khó phát hiện. Bỏ
 * cyrillic và greek vì dự án không dùng.
 */
const WANTED_SUBSETS = ['latin', 'latin-ext', 'vietnamese']

const stats = { downloaded: 0, skipped: 0, failed: [] }

/** Tách CSS của Google thành từng khối @font-face kèm tên subset ở comment ngay trước. */
function parseFontFaces(css) {
  const faces = []
  // Mỗi khối có dạng: /* latin */\n@font-face {...}
  const pattern = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g

  for (const match of css.matchAll(pattern)) {
    const [, subset, body] = match
    const family = body.match(/font-family:\s*'([^']+)'/)?.[1]
    const weight = body.match(/font-weight:\s*(\d+)/)?.[1]
    const style = body.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal'
    const url = body.match(/url\(([^)]+)\)\s*format\('woff2'\)/)?.[1]
    const unicodeRange = body.match(/unicode-range:\s*([^;]+);/)?.[1]

    if (family && weight && url && unicodeRange) {
      faces.push({ subset, family, weight, style, url, unicodeRange })
    }
  }

  return faces
}

/** "Quicksand" + 600 + "vietnamese" -> "quicksand-600-vietnamese.woff2" */
function fileNameOf({ family, weight, subset }) {
  return `${family.toLowerCase().replace(/\s+/g, '-')}-${weight}-${subset}.woff2`
}

console.log('[1/3] Tai CSS tu Google Fonts')
const response = await fetch(CSS_URL, { headers: { 'User-Agent': CHROME_UA } })
if (!response.ok) throw new Error(`Khong tai duoc CSS: HTTP ${response.status}`)

const allFaces = parseFontFaces(await response.text())
const faces = allFaces.filter((face) => WANTED_SUBSETS.includes(face.subset))

console.log(`  Tim thay ${allFaces.length} @font-face, giu lai ${faces.length}`)

// Chặn sớm nếu vì lý do nào đó không có bộ tiếng Việt — thà dừng còn hơn để lọt.
for (const family of new Set(faces.map((face) => face.family))) {
  const hasVietnamese = faces.some(
    (face) => face.family === family && face.subset === 'vietnamese',
  )
  if (!hasVietnamese) {
    throw new Error(`Font ${family} khong co bo ky tu tieng Viet — dung lai de khong deploy thieu`)
  }
}

console.log('\n[2/3] Tai file woff2')
mkdirSync(OUT_FONTS, { recursive: true })

for (const face of faces) {
  const name = fileNameOf(face)
  const target = join(OUT_FONTS, name)

  if (existsSync(target)) {
    stats.skipped++
    continue
  }

  try {
    const fontResponse = await fetch(face.url, { headers: { 'User-Agent': CHROME_UA } })
    if (!fontResponse.ok) throw new Error(`HTTP ${fontResponse.status}`)

    const buffer = Buffer.from(await fontResponse.arrayBuffer())
    writeFileSync(target, buffer)
    stats.downloaded++
    process.stdout.write(`  ✓ ${name} (${Math.round(buffer.length / 1024)} KB)\n`)
  } catch (error) {
    stats.failed.push(`${name} -> ${error.message}`)
    process.stdout.write(`  ✗ THAT BAI: ${name} (${error.message})\n`)
  }
}

console.log('\n[3/3] Sinh src/styles/fonts.css')
mkdirSync(dirname(OUT_CSS), { recursive: true })

const blocks = faces
  .map(
    (face) => `/* ${face.family} ${face.weight} — ${face.subset} */
@font-face {
  font-family: '${face.family}';
  font-style: ${face.style};
  font-weight: ${face.weight};
  font-display: swap;
  src: url('/fonts/${fileNameOf(face)}') format('woff2');
  unicode-range: ${face.unicodeRange};
}`,
  )
  .join('\n\n')

writeFileSync(
  OUT_CSS,
  `/*
 * FILE NAY DUOC SINH TU DONG — dung sua tay.
 * Chay lai: node scripts/download-fonts.mjs
 *
 * Giu nguyen \`unicode-range\` cua Google: trinh duyet chi tai file chua ky tu
 * that su can. Nho vay trang tieng Viet khong phai tai bo latin-ext cua chau Au.
 */

${blocks}
`,
)

console.log('\n==================== KET QUA ====================')
console.log(`Tai ve : ${stats.downloaded}`)
console.log(`Bo qua : ${stats.skipped} (da co san)`)
console.log(`Loi    : ${stats.failed.length}`)
console.log(`Subset : ${[...new Set(faces.map((f) => f.subset))].join(', ')}`)
if (stats.failed.length) {
  console.log('\nDanh sach loi:')
  stats.failed.forEach((f) => console.log('  ' + f))
  process.exitCode = 1
}
