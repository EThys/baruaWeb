export interface PublicOrganismType {
  id: number
  name: string
  description: string | null
}

export interface PublicOrganism {
  id: number
  type: PublicOrganismType
  name: string
  city?: string
  description: string | null
}

export interface PublicOrganismsResponse {
  organism: PublicOrganism[]
}

