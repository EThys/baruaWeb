import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'

export interface OtpMessageResponse {
  message: string
  token?: string
  access_token?: string
  accessToken?: string
  refresh_token?: string
  refreshToken?: string
  [key: string]: unknown
}

const TOKEN_KEYS = [
  'token',
  'access_token',
  'accessToken',
  'jwt',
  'jwtToken',
  'bearerToken',
  'authToken',
  'id_token',
  'idToken',
]

const REFRESH_KEYS = ['refresh_token', 'refreshToken', 'refresh']

/** JWT typique : 3 segments séparés par des points. */
function isJwtShape(v: string): boolean {
  const s = v.trim()
  if (s.length < 30) return false
  const parts = s.split('.')
  return parts.length === 3 && parts.every(p => p.length > 0)
}

function pickFromObject(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && isJwtShape(v)) return v.trim()
  }
  return undefined
}

/** Parcourt la réponse OTP : clés connues, puis tout string au format JWT. */
export function extractOtpAccessToken(res: OtpMessageResponse | Record<string, unknown>): string | undefined {
  const root = res as Record<string, unknown>
  const queue: unknown[] = [root]
  const seen = new Set<unknown>()
  const jwtCandidates: string[] = []

  while (queue.length) {
    const cur = queue.shift()
    if (!cur || typeof cur !== 'object' || seen.has(cur)) continue
    seen.add(cur)

    if (Array.isArray(cur)) {
      queue.push(...cur)
      continue
    }

    const obj = cur as Record<string, unknown>
    const hit = pickFromObject(obj, TOKEN_KEYS)
    if (hit) return hit

    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string' && isJwtShape(v) && k.toLowerCase() !== 'message') {
        jwtCandidates.push(v.trim())
      } else if (v && typeof v === 'object') {
        queue.push(v)
      }
    }
  }

  return jwtCandidates[0]
}

export function extractOtpRefreshToken(res: OtpMessageResponse | Record<string, unknown>): string | undefined {
  const root = res as Record<string, unknown>
  const queue: unknown[] = [root]
  const seen = new Set<unknown>()

  while (queue.length) {
    const cur = queue.shift()
    if (!cur || typeof cur !== 'object' || seen.has(cur)) continue
    seen.add(cur)
    if (Array.isArray(cur)) {
      queue.push(...cur)
      continue
    }
    const obj = cur as Record<string, unknown>
    const hit = pickFromObject(obj, REFRESH_KEYS)
    if (hit) return hit
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') queue.push(v)
    }
  }
  return undefined
}

function tokenFromAuthHeader(header: string | undefined): string | undefined {
  if (!header) return undefined
  const m = header.match(/^Bearer\s+(.+)$/i)
  const raw = (m?.[1] ?? header).trim()
  return isJwtShape(raw) ? raw : undefined
}

export async function generatePublicOtp(identifier: string): Promise<OtpMessageResponse> {
  const { data } = await api.post<OtpMessageResponse>(ENDPOINTS.publicOtpGenerate, {
    identifier: identifier.trim(),
  })
  return data
}

export async function validatePublicOtp(
  identifier: string,
  code: string,
): Promise<OtpMessageResponse> {
  const response = await api.post<OtpMessageResponse>(ENDPOINTS.publicOtpValidate, {
    identifier: identifier.trim(),
    code: code.trim(),
  })

  const data = (response.data ?? {}) as OtpMessageResponse
  if (!extractOtpAccessToken(data)) {
    const headerToken =
      tokenFromAuthHeader(response.headers?.authorization as string | undefined)
      ?? tokenFromAuthHeader(response.headers?.Authorization as string | undefined)
    if (headerToken) {
      return { ...data, accessToken: headerToken, message: data.message ?? 'Code validé.' }
    }
  }
  return data
}
