import { useMutation } from '@tanstack/react-query'
import { sendContactMessage } from '@/api/contact.api'

export function useSendContactMessage() {
  return useMutation({ mutationFn: sendContactMessage })
}
