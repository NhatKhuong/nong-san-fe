import { delay } from '@/lib/utils'
import type { ContactMessage, ContactPayload } from '@/types'

const MESSAGES_KEY = 'nss_mock_contact_messages'

function readMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY)
    return raw ? (JSON.parse(raw) as ContactMessage[]) : []
  } catch {
    return []
  }
}

/**
 * Gửi liên hệ từ trang Liên hệ.
 *
 * Lưu localStorage để lần gửi sau còn thấy được dữ liệu cũ khi cần kiểm tra —
 * backend thật sẽ ghi vào cơ sở dữ liệu và gửi email cho bộ phận chăm sóc khách.
 *
 * Khi có backend: `const { data } = await client.post('/contact', payload); return data`
 */
export async function sendContactMessage(payload: ContactPayload): Promise<ContactMessage> {
  await delay(800)

  const message: ContactMessage = {
    ...payload,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(MESSAGES_KEY, JSON.stringify([message, ...readMessages()].slice(0, 50)))
  return message
}
