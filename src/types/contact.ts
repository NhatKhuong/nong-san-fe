export interface ContactPayload {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
}

/** Bản ghi đã được ghi nhận, `id` do backend cấp. */
export interface ContactMessage extends ContactPayload {
  id: number
  createdAt: string
}
