import { Fragment } from 'react'

/**
 * Render nội dung bài viết từ tập cú pháp Markdown rút gọn.
 *
 * CỐ Ý không dùng thư viện markdown: stack đã chốt trong CLAUDE.md không có nó,
 * bundle vốn đã vượt ngưỡng cảnh báo 500 KB, và mock chỉ dùng đúng vài cú pháp
 * dưới đây. Nếu sau này cần bảng, ảnh trong bài hay HTML nhúng thì hãy hỏi trước
 * khi thêm thư viện, đừng cơi nới hàm này thành một bộ parse đầy đủ.
 *
 * Hỗ trợ: `##` / `###` tiêu đề · `-` danh sách · `1.` danh sách đánh số ·
 * `>` trích dẫn · `**đậm**` trong đoạn · dòng trống ngắt khối.
 */

interface Block {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'quote'
  lines: string[]
}

/** Gom các dòng thành khối. Danh sách nhiều dòng liền nhau được gộp làm một khối. */
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []

  for (const rawBlock of content.split(/\n\s*\n/)) {
    const lines = rawBlock.split('\n').map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) continue

    for (const line of lines) {
      const previous = blocks.at(-1)

      if (line.startsWith('### ')) {
        blocks.push({ type: 'h3', lines: [line.slice(4)] })
      } else if (line.startsWith('## ')) {
        blocks.push({ type: 'h2', lines: [line.slice(3)] })
      } else if (line.startsWith('> ')) {
        if (previous?.type === 'quote') previous.lines.push(line.slice(2))
        else blocks.push({ type: 'quote', lines: [line.slice(2)] })
      } else if (line.startsWith('- ')) {
        if (previous?.type === 'ul') previous.lines.push(line.slice(2))
        else blocks.push({ type: 'ul', lines: [line.slice(2)] })
      } else if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, '')
        if (previous?.type === 'ol') previous.lines.push(text)
        else blocks.push({ type: 'ol', lines: [text] })
      } else {
        blocks.push({ type: 'p', lines: [line] })
      }
    }
  }

  return blocks
}

/**
 * Dựng `**đậm**` thành mảng React node.
 * Không dùng `dangerouslySetInnerHTML` — không cần thiết, và sẽ thành lỗ hổng
 * ngay khi nội dung bài viết đến từ backend thay vì từ mock của chính dự án.
 */
function renderInline(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

export default function PostContent({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-ink-muted">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={index} className="pt-3 text-xl text-ink sm:text-2xl">
                {renderInline(block.lines[0])}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={index} className="pt-2 text-base text-ink sm:text-lg">
                {renderInline(block.lines[0])}
              </h3>
            )
          case 'quote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-primary bg-surface px-5 py-4 text-ink italic"
              >
                {block.lines.map((line, lineIndex) => (
                  <p key={lineIndex}>{renderInline(line)}</p>
                ))}
              </blockquote>
            )
          case 'ul':
            return (
              <ul key={index} className="list-disc space-y-1.5 pl-6 marker:text-primary">
                {block.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>{renderInline(line)}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol
                key={index}
                className="list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-primary"
              >
                {block.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>{renderInline(line)}</li>
                ))}
              </ol>
            )
          default:
            return <p key={index}>{renderInline(block.lines[0])}</p>
        }
      })}
    </div>
  )
}
