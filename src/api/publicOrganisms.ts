import api from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'
import type { PublicOrganism, PublicOrganismsResponse } from '@/models/publicOrganisms'

export async function getPublicOrganisms(): Promise<PublicOrganism[]> {
  const { data } = await api.get<PublicOrganismsResponse>(ENDPOINTS.publicOrganisms)
  return data.organism
}

