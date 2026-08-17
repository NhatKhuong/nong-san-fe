/**
 * Sinh logo thương hiệu dạng SVG wordmark từ `src/mocks/brands.json`.
 *
 * Chạy:  node scripts/generate-brand-logos.mjs
 *
 * Trước đây phần này dùng ảnh chụp ngẫu nhiên từ picsum, trông không giống logo.
 * SVG tự sinh vừa đúng ngữ nghĩa "logo", vừa nhẹ (~1 KB) và không phụ thuộc mạng.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MOCKS = join(ROOT, 'src/mocks')
const OUT = join(ROOT, 'public/images/brands')

/** Khớp với design token trong src/index.css. */
const INK_MUTED = '#5c5c5c'
const PRIMARY = '#4a7c2a'

/** Bỏ dấu tiếng Việt để chữ cái đầu hiển thị gọn trong hình tròn. */
function firstLetter(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .trim()
    .charAt(0)
    .toUpperCase()
}

/** Ước lượng bề rộng chữ để canh giữa — đủ dùng cho wordmark ngắn. */
function estimateWidth(text) {
  return text.length * 9.2
}

function buildSvg(name) {
  const letter = firstLetter(name)
  const textWidth = estimateWidth(name)
  const width = Math.max(200, 54 + textWidth)
  const height = 80
  const centerY = height / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${name}">
  <circle cx="26" cy="${centerY}" r="17" fill="${PRIMARY}"/>
  <text x="26" y="${centerY}" fill="#ffffff" font-family="Quicksand, ui-sans-serif, sans-serif" font-size="18" font-weight="700" text-anchor="middle" dominant-baseline="central">${letter}</text>
  <text x="52" y="${centerY}" fill="${INK_MUTED}" font-family="Quicksand, ui-sans-serif, sans-serif" font-size="16" font-weight="600" dominant-baseline="central">${name}</text>
</svg>
`
}

const brands = JSON.parse(readFileSync(join(MOCKS, 'brands.json'), 'utf8'))
mkdirSync(OUT, { recursive: true })

for (const brand of brands) {
  const slug = brand.name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const file = `${slug}.svg`
  writeFileSync(join(OUT, file), buildSvg(brand.name))
  brand.logo = `/images/brands/${file}`
  console.log(`  ✓ /images/brands/${file}`)
}

writeFileSync(join(MOCKS, 'brands.json'), JSON.stringify(brands, null, 2) + '\n')
console.log(`\nDa sinh ${brands.length} logo SVG.`)
