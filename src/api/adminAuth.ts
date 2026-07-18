import api from '@/services/api'
import type { ApiRequestConfig } from '@/services/api'
import authApi from '@/services/authApi'
import { ENDPOINTS } from '@/api/endpoints'
import { parseUserAccount } from '@/utils/parseUserAccount'
import type { AdminUserDto, UpdateAdminUserPayload } from '@/types/admin'

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const o = data as Record<string, unknown>
  if (typeof o.message === 'string') return o.message
  return undefined
}

/** PUT protected/certification/{userId} — certifier / retirer la certification. */
export async function setUserCertification(
  userId: number,
  state: boolean,
): Promise<{ message?: string }> {
  const { data } = await api.put<Record<string, unknown>>(
    `${ENDPOINTS.protectedCertification}/${userId}`,
    { state },
  )
  return { message: extractMessage(data) }
}

/** PUT protected/recovery/user/{id} — débloquer / récupérer un compte. */
export async function recoverUserAccount(userId: number): Promise<{ message?: string }> {
  const { data } = await api.put<Record<string, string>>(
    `${ENDPOINTS.protectedRecoveryUser}/${userId}`,
  )
  return { message: data.message ?? extractMessage(data) }
}

/**
 * DELETE protected/users/delete/user — verrouille / supprime le compte connecté
 * (pas d’id cible dans l’OpenAPI).
 */
export async function deleteOwnAccount(): Promise<{ message?: string }> {
  const { data } = await api.delete<Record<string, string>>(ENDPOINTS.protectedDeleteUser)
  return { message: data.message ?? extractMessage(data) }
}

/** GET protected/users/{id} */
export async function getAdminUserDetail(userId: number): Promise<AdminUserDto | null> {
  const { data } = await api.get<unknown>(`${ENDPOINTS.protectedUsers}/${userId}`)
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  const nested = (obj.user ?? obj.data ?? obj) as Record<string, unknown>
  if (!nested || typeof nested !== 'object') return null
  const id = Number(nested.userId ?? nested.id ?? userId)
  if (!Number.isFinite(id)) return null
  const asBool = (v: unknown): boolean =>
    v === true || v === 1 || v === '1' || v === 'true' || v === 'TRUE' || v === 'yes'

  const account = parseUserAccount({ ...obj, ...nested })

  return {
    userId: id,
    email: String(nested.email ?? ''),
    username: nested.username != null ? String(nested.username) : undefined,
    phone: nested.phone != null ? String(nested.phone) : undefined,
    city: nested.city != null ? String(nested.city) : (nested.ville != null ? String(nested.ville) : undefined),
    firstName: String(nested.firstName ?? nested.prenom ?? ''),
    lastName: String(nested.lastName ?? nested.nom ?? ''),
    premium: asBool(nested.premium) || asBool(nested.isPremium),
    certified: asBool(nested.certified) || asBool(nested.isCertified) || asBool(nested.certification),
    accountId: account.accountId,
    accountName: account.accountName,
    roleLabel: account.roleLabel,
    isCitizen: account.isCitizen,
    organismId: account.organismId,
    organismName: account.organismName,
    organismCity: account.organismCity,
    roleResolved: account.resolved,
  }
}

/** PUT protected/users/{id} — modification profil. */
export async function updateAdminUser(
  userId: number,
  payload: UpdateAdminUserPayload,
): Promise<{ message?: string }> {
  const { data } = await api.put<Record<string, unknown>>(
    `${ENDPOINTS.protectedUsers}/${userId}`,
    payload,
  )
  return { message: extractMessage(data) }
}

/** POST /auth/register — création de compte (admin ou public). */
export async function adminRegisterUser(payload: {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  city: string
  phone?: string
  pseudo?: string
}): Promise<{ message?: string }> {
  const { data } = await authApi.post<Record<string, unknown>>('/auth/register', {
    email: payload.email.trim(),
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    city: payload.city.trim(),
    phone: payload.phone?.trim() || undefined,
    pseudo: payload.pseudo?.trim() || undefined,
  })
  return { message: extractMessage(data) ?? 'Compte créé.' }
}

/** POST public/otp/generate — renvoyer un code d’activation. */
export async function adminGenerateOtp(identifier: string): Promise<{ message?: string }> {
  const { data } = await api.post<Record<string, string>>(
    ENDPOINTS.publicOtpGenerate,
    { identifier: identifier.trim() },
    { skipAuth: true } as ApiRequestConfig,
  )
  return { message: data.message ?? 'Code envoyé.' }
}

/** POST protected/token/refresh */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken?: string
  refreshToken?: string
}> {
  const { data } = await api.post<{ accessToken?: string; refreshToken?: string }>(
    ENDPOINTS.protectedTokenRefresh,
    { refreshToken },
  )
  return data
}
