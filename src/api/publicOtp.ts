import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'

export interface OtpMessageResponse {
  message: string
}

export async function generatePublicOtp(identifier: string): Promise<OtpMessageResponse> {
  const { data } = await api.post<OtpMessageResponse>(ENDPOINTS.publicOtpGenerate, { identifier: identifier.trim() })
  return data
}

export async function validatePublicOtp(identifier: string, code: string): Promise<OtpMessageResponse> {
  const { data } = await api.post<OtpMessageResponse>(ENDPOINTS.publicOtpValidate, {
    identifier: identifier.trim(),
    code: code.trim(),
  })
  return data
}
