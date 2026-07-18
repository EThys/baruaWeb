import api from '@/services/api'
import type { ApiRequestConfig } from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'

/** Corps API `UserPassword` — `{ "newPassword": "…" }` (min. 6 caractères). */
export interface UserPasswordBody {
  newPassword: string
  /** Champs additionnels parfois acceptés après OTP (hors swagger strict). */
  identifier?: string
  code?: string
  email?: string
}

type PasswordCallOpts = {
  skipAuthRedirect?: boolean
  accessToken?: string | null
  /** Si true, n’envoie pas de Bearer (OTP public sans jeton). */
  skipAuth?: boolean
  identifier?: string
  code?: string
}

function buildBody(
  newPassword: string,
  opts?: Pick<PasswordCallOpts, 'identifier' | 'code'>,
): UserPasswordBody {
  return {
    newPassword,
    ...(opts?.identifier ? { identifier: opts.identifier, email: opts.identifier } : {}),
    ...(opts?.code ? { code: opts.code } : {}),
  }
}

function buildConfig(opts?: PasswordCallOpts): ApiRequestConfig {
  const headers: Record<string, string> = {}
  if (opts?.accessToken) {
    headers.Authorization = `Bearer ${opts.accessToken}`
  }
  return {
    skipAuth: opts?.skipAuth === true && !opts?.accessToken,
    skipAuthRedirect: opts?.skipAuthRedirect ?? true,
    headers: Object.keys(headers).length ? headers : undefined,
  } as ApiRequestConfig
}

/** PUT protected/change/password — profil connecté. */
export async function changePassword(
  newPassword: string,
  opts?: PasswordCallOpts,
): Promise<Record<string, string>> {
  const { data } = await api.put<Record<string, string>>(
    ENDPOINTS.protectedChangePassword,
    buildBody(newPassword, opts),
    buildConfig({ ...opts, skipAuthRedirect: opts?.skipAuthRedirect ?? false }),
  )
  return data
}

/** PUT protected/reset/password — après OTP (mot de passe oublié). */
export async function resetPassword(
  newPassword: string,
  opts?: {
    accessToken?: string | null
    identifier?: string
    code?: string
  },
): Promise<Record<string, string>> {
  const { data } = await api.put<Record<string, string>>(
    ENDPOINTS.protectedResetPassword,
    buildBody(newPassword, opts),
    buildConfig({
      skipAuthRedirect: true,
      accessToken: opts?.accessToken,
      skipAuth: !opts?.accessToken,
      identifier: opts?.identifier,
      code: opts?.code,
    }),
  )
  return data
}
