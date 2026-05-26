import api from '@/services/api'
import type { ApiRequestConfig } from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'

/** Corps API `UserPassword` — change & reset : `{ "newPassword": "…" }` (min. 6 caractères). */
export interface UserPasswordBody {
  newPassword: string
}

export async function changePassword(newPassword: string): Promise<Record<string, string>> {
  const body: UserPasswordBody = { newPassword }
  const { data } = await api.put<Record<string, string>>(
    ENDPOINTS.protectedChangePassword,
    body,
  )
  return data
}


/** Réinitialisation après validation OTP — corps strict `{ newPassword }` uniquement. */
export async function resetPassword(newPassword: string): Promise<Record<string, string>> {
  const body: UserPasswordBody = { newPassword }
  const { data } = await api.put<Record<string, string>>(
    ENDPOINTS.protectedResetPassword,
    body,
    { skipAuth: true } as ApiRequestConfig,
  )
  return data
}
