export interface ServiceDocumentaireDocument {
  documentId: number
  documentTypeId: number
  title: string
  code: string | null
  description: string | null
  isActive: boolean
}

export interface ServiceDocumentaireOrganismType {
  id: number
  name: string
  description: string
}

export interface ServiceDocumentaireOrganism {
  id: number
  city: string
  type: ServiceDocumentaireOrganismType
  name: string
  description: string
}

export interface PublicServiceDocumentaire {
  serviceDocumentaireId: number
  document: ServiceDocumentaireDocument
  organism: ServiceDocumentaireOrganism
  price: number
  deviseId: number
  delayDayOpen: string
  description: string
}

export interface PublicServicesDocumentairesResponse {
  services: PublicServiceDocumentaire[]
}
