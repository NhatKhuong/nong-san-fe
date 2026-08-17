/**
 * Sinh ảnh chia sẻ mạng xã hội mặc định 1200×630 dạng SVG.
 *
 * Chạy:  node scripts/generate-og-image.mjs
 *
 * Cùng cách làm với `generate-brand-logos.mjs`: tự sinh thay vì tải ảnh về, nên
 * không phụ thuộc mạng, nhẹ (~2 KB) và dùng đúng design token của dự án.
 *
 * LƯU Ý: một số nền tảng (Facebook, X) KHÔNG đọc được SVG trong thẻ `og:image`.
 * Vì vậy script cũng ghi kèm bản PNG nếu máy có sẵn công cụ chuyển đổi; nếu không
 * thì ghi rõ ra màn hình để người chạy biết mà xử lý trước khi deploy thật.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public/images/og')

/** Khớp với design token trong src/index.css. */
const PRIMARY = '#4a7c2a'
const PRIMARY_DARK = '#3a6220'
const SURFACE = '#faf8f2'
const INK = '#2b2b2b'
const INK_MUTED = '#5c5c5c'

const TITLE = 'Nông Sản Sạch'
const TAGLINE = 'Thực phẩm hữu cơ tươi mỗi ngày'
const BLURB = 'Rau củ, trái cây và thịt sạch từ nông trại đạt chuẩn hữu cơ — giao trong ngày.'

/**
 * Chữ được vẽ bằng `<text>` với font hệ thống chứ không nhúng font.
 * Ảnh này chỉ render một lần lúc build nên không cần font thương hiệu; nhúng
 * woff2 vào SVG sẽ đội kích thước lên nhiều lần mà gần như không ai nhận ra.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${SURFACE}"/>
      <stop offset="100%" stop-color="#eef4e6"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="12" fill="${PRIMARY}"/>

  <!-- Dấu lá đơn giản, cùng ngôn ngữ hình với logo trên header -->
  <g transform="translate(96 150)">
    <circle cx="44" cy="44" r="44" fill="${PRIMARY}"/>
    <path d="M28 52c0-16 12-28 32-30-2 20-14 32-32 30z" fill="#ffffff"/>
    <path d="M28 60c6-10 16-18 30-22" stroke="${PRIMARY_DARK}" stroke-width="3"
          stroke-linecap="round" fill="none"/>
  </g>

  <text x="212" y="196" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="64" font-weight="700" fill="${INK}">${TITLE}</text>
  <text x="212" y="238" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="26" fill="${INK_MUTED}">${TAGLINE}</text>

  <text x="96" y="360" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="34" fill="${INK}">${BLURB.slice(0, 52)}</text>
  <text x="96" y="410" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        font-size="34" fill="${INK}">${BLURB.slice(52)}</text>

  <g transform="translate(96 480)">
    <rect width="260" height="62" rx="31" fill="${PRIMARY}"/>
    <text x="130" y="40" text-anchor="middle"
          font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
          font-size="24" font-weight="600" fill="#ffffff">Mua sắm ngay</text>
  </g>
</svg>
`

mkdirSync(OUT, { recursive: true })
const svgPath = join(OUT, 'mac-dinh.svg')
writeFileSync(svgPath, svg)
console.log(`✓ ${svgPath.replace(ROOT, '.')} (${Math.round(svg.length / 1024)} KB)`)

const pngPath = join(OUT, 'mac-dinh.png')
if (!existsSync(pngPath)) {
  console.log('\nLUU Y: chua co ban PNG.')
  console.log('  Facebook va X khong doc duoc og:image dang SVG.')
  console.log('  Truoc khi deploy that, chuyen doi:')
  console.log(`  npx --yes sharp-cli -i "${svgPath}" -o "${pngPath}" resize 1200 630`)
}
