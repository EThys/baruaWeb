import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  CreateServiceDocumentairePayload,
  CreateServiceDocumentaireResponse,
  PublicAccountsResponse,
} from '@/types'

export async function createServiceDocumentaire(
  payload: CreateServiceDocumentairePayload,
): Promise<CreateServiceDocumentaireResponse> {
  const { data } = await api.post<CreateServiceDocumentaireResponse>(
    ENDPOINTS.privateServicesDocumentaires,
    payload,
  )
  return data
}

export async function getPublicAccounts(): Promise<PublicAccountsResponse['accounts']> {
  const { data } = await api.get<PublicAccountsResponse>(ENDPOINTS.publicAccounts)
  return data.accounts
}
