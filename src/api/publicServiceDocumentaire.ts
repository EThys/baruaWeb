import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  PublicServiceDocumentaire,
  PublicServicesDocumentairesResponse,
} from '@/models/publicServiceDocumentaire'

export async function getPublicServicesDocumentaires(): Promise<PublicServiceDocumentaire[]> {
  const { data } = await api.get<PublicServicesDocumentairesResponse>(
    ENDPOINTS.publicServicesDocumentaires,
  )
  return data.services
}
