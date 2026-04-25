export interface PublicDocumentType {
  documentTypeId: number
  name: string
  description: string | null
}

export interface PublicDocument {
  id: number
  type: PublicDocumentType
  title: string
  code: string | null
  description: string | null
}

export interface PublicDocumentsResponse {
  documents: PublicDocument[]
}

export interface PublicDocumentTypesResponse {
  documentTypes: PublicDocumentType[]
}

