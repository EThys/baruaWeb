import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'
import { getPublicAccounts } from '@/api/serviceDocumentaire'
import type {
  AdminUserDto,
  AssignUserRolesPayload,
  CreateDocumentPayload,
  CreateDocumentResponse,
  CreateDocumentTypePayload,
  CreateDocumentTypeResponse,
} from '@/types/admin'

export { getPublicAccounts }

export async function getAdminUsers(): Promise<AdminUserDto[]> {
  try {
    const { data } = await api.get<{ data?: AdminUserDto[]; users?: AdminUserDto[] }>(
      ENDPOINTS.protectedUsers,
    )
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray(data.users)) return data.users
    if (Array.isArray(data)) return data as AdminUserDto[]
    return []
  } catch {
    const { data } = await api.get<{ data?: AdminUserDto[] }>(ENDPOINTS.privateUsers)
    return data.data ?? []
  }
}

export async function assignUserRoles(
  userId: number,
  payload: AssignUserRolesPayload,
): Promise<Record<string, string>> {
  const { data } = await api.put<Record<string, string>>(
    `${ENDPOINTS.protectedUsers}/${userId}`,
    payload,
  )
  return data
}

export async function createAdminDocument(
  payload: CreateDocumentPayload,
): Promise<CreateDocumentResponse> {
  const { data } = await api.post<CreateDocumentResponse>(ENDPOINTS.privateDocuments, payload)
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
