import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  PublicDocument,
  PublicDocumentType,
  PublicDocumentsResponse,
  PublicDocumentTypesResponse,
} from '@/models/publicDocuments'

export async function getPublicDocuments(): Promise<PublicDocument[]> {
  const { data } = await api.get<PublicDocumentsResponse>(ENDPOINTS.publicDocuments)
  return data.documents
}

export async function getPublicDocumentTypes(): Promise<PublicDocumentType[]> {
  const { data } = await api.get<PublicDocumentTypesResponse>(ENDPOINTS.publicDocumentTypes)
  return data.documentTypes
}

