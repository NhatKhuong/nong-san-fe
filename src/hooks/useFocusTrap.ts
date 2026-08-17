import { useEffect, useRef } from 'react'

/** Các phần tử có thể nhận focus bên trong panel. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Giam focus trong một panel dạng hộp thoại và trả focus về chỗ cũ khi đóng.
 *
 * `Drawer` và `Modal` đều khai `aria-modal="true"`, nhưng thuộc tính đó chỉ là
 * lời tuyên bố với trình đọc màn hình — nó KHÔNG chặn phím Tab. Trước Giai đoạn 9,
 * mở mini-cart bằng bàn phím rồi Tab vài lần là con trỏ chạy ra ngoài, xuống các
 * nút của trang nền đang bị lớp phủ che. Đóng xong focus lại rơi về đầu trang
 * thay vì về nút đã mở, nên người dùng bàn phím mất dấu hoàn toàn.
 *
 * Hook làm ba việc: nhớ phần tử đang focus, đưa focus vào panel, và vòng Tab
 * quanh phần tử đầu ↔ cuối.
 *
 * Trả về `ref` để gắn vào phần tử panel.
 */
export function useFocusTrap<T extends HTMLElement>(isOpen: boolean) {
  const panelRef = useRef<T>(null)

  useEffect(() => {
    if (!isOpen) return

    const panel = panelRef.current
    if (!panel) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = () =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      )

    // Đưa focus vào panel. Nếu panel chưa có gì focus được thì focus chính nó.
    const focusable = getFocusable()
    if (focusable.length > 0) focusable[0].focus()
    else panel.focus()

    // Arrow function chứ không phải `function`: khai báo hàm bị hoisted lên trước
    // phép kiểm tra null ở trên nên TypeScript coi `panel` vẫn có thể là null.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      // Đọc lại mỗi lần: nội dung panel có thể đổi (ví dụ giỏ hàng vừa xoá một dòng).
      const elements = getFocusable()
      if (elements.length === 0) {
        event.preventDefault()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)


    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Trả focus về nút đã mở panel — nếu nút đó vẫn còn trong DOM.
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [isOpen])

  return panelRef
}
