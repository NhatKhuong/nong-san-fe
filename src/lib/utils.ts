import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Gộp class Tailwind có điều kiện, tự xử lý xung đột utility.
 * Dùng thay cho việc nối chuỗi className thủ công.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Giả lập độ trễ mạng cho lớp API mock. */
export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Dải dấu thanh tổ hợp Unicode, tách ra sau khi normalize('NFD'). */
const COMBINING_MARKS = /[̀-ͯ]/g

/** Chuyển tiếng Việt có dấu thành slug không dấu: "Cam hữu cơ" → "cam-huu-co". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
