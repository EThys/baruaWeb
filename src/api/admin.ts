import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'
import { getPublicAccounts } from '@/api/serviceDocumentaire'
import { parseUserAccount } from '@/utils/parseUserAccount'
import type {
  AdminUserDto,
  AssignAccountUserPayload,
  CreateDocumentPayload,
  CreateDocumentResponse,
  CreateDocumentTypePayload,
  CreateDocumentTypeResponse,
  UpdateDocumentPayload,
  UpdateDocumentResponse,
} from '@/types/admin'

export { getPublicAccounts }

export async function getAdminUsers(): Promise<AdminUserDto[]> {
  const asBool = (v: unknown): boolean =>
    v === true || v === 1 || v === '1' || v === 'true' || v === 'TRUE' || v === 'yes'

  const parseCertified = (u: Record<string, unknown>): boolean => {
    if (asBool(u.certified) || asBool(u.isCertified) || asBool(u.certification)) return true
    const nested = u.user
    if (nested && typeof nested === 'object') {
      const n = nested as Record<string, unknown>
      return asBool(n.certified) || asBool(n.isCertified) || asBool(n.certification)
    }
    return false
  }

  const normalizeItem = (item: unknown): AdminUserDto | null => {
    if (!item || typeof item !== 'object') return null
    const row = item as Record<string, unknown>
    const u = (row.user && typeof row.user === 'object'
      ? row.user
      : row) as Record<string, unknown>
    const userId = Number(u.userId ?? u.id ?? row.userId ?? 0)
    if (!Number.isFinite(userId) || userId <= 0) return null
    const account = parseUserAccount({ ...row, ...u })
    return {
      userId,
      email: String(u.email ?? ''),
      username: u.username != null ? String(u.username) : undefined,
      phone: u.phone != null ? String(u.phone) : undefined,
      city: u.city != null ? String(u.city) : (u.ville != null ? String(u.ville) : undefined),
      firstName: String(u.firstName ?? u.prenom ?? ''),
      lastName: String(u.lastName ?? u.nom ?? ''),
      premium: asBool(u.premium) || asBool(row.premium) || asBool(u.isPremium),
      certified: parseCertified(row) || parseCertified(u),
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

  const normalize = (raw: unknown): AdminUserDto[] => {
    const list = (() => {
      if (Array.isArray(raw)) return raw
      if (!raw || typeof raw !== 'object') return []
      const o = raw as Record<string, unknown>
      if (Array.isArray(o.data)) return o.data
      if (Array.isArray(o.users)) return o.users
      if (Array.isArray(o.content)) return o.content
      return []
    })()

    return list.map(normalizeItem).filter((u): u is AdminUserDto => u != null)
  }

  try {
    const { data } = await api.get<unknown>(ENDPOINTS.protectedUsers)
    const list = normalize(data)
    if (list.length) return list
  } catch { /* fallback private */ }

  const { data } = await api.get<unknown>(ENDPOINTS.privateUsers)
  return normalize(data)
}

/** POST protected/users/roles — attribuer un rôle (accountId + organismId optionnel). */
export async function assignUserRole(
  payload: AssignAccountUserPayload,
): Promise<Record<string, string>> {
  const body: Record<string, number> = {
    userId: payload.userId,
    accountId: payload.accountId,
  }
  if (payload.organismId != null && payload.organismId > 0) {
    body.organismId = payload.organismId
  }
  const { data } = await api.post<Record<string, string>>(
    ENDPOINTS.protectedUsersRoles,
    body,
  )
  return data
}

export async function createAdminDocument(
  payload: CreateDocumentPayload,
): Promise<CreateDocumentResponse> {
  const { data } = await api.post<CreateDocumentResponse>(ENDPOINTS.privateDocuments, payload)
  return data
}

export async function updateAdminDocument(
  documentId: number,
  payload: UpdateDocumentPayload,
): Promise<UpdateDocumentResponse> {
  const { data } = await api.put<UpdateDocumentResponse>(
    `${ENDPOINTS.privateDocuments}/${documentId}`,
    payload,
  )
  return data
}

export async function createDocumentType(
  payload: CreateDocumentTypePayload,
): Promise<CreateDocumentTypeResponse> {
  const { data } = await api.post<CreateDocumentTypeResponse>(
    ENDPOINTS.privateDocumentTypes,
    payload,
  )
  return data
}
