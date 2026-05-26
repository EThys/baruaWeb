export interface AdminUserDto {
  userId: number
  email: string
  username?: string
  phone?: string
  city?: string
  firstName: string
  lastName: string
  premium?: boolean
  certified?: boolean
}

export interface PermissionRoleItem {
  organismId?: number | null
  profileId: number
}

export interface AssignUserRolesPayload {
  roles: PermissionRoleItem[]
}

export interface CreateDocumentTypePayload {
  name: string
  description?: string
  active?: boolean
}

export interface CreateDocumentTypeResponse {
  documentType?: {
    documentTypeId: number
    name: string
    description?: string | null
    active?: boolean
  }
  message?: string
}

export interface CreateDocumentPayload {
  documentTypeId: number
  title: string
  code?: string
  description?: string
  active?: boolean
}

export interface CreateDocumentResponse {
  document?: {
    documentId: number
    documentTypeId: number
    title: string
    code?: string | null
    description?: string | null
    active?: boolean
  }
  message?: string
}

export interface OrganismDemandStat {
  organismId: number
  organismName: string
  city: string
  typeName: string
  servicesCount: number
  demandesCount: number
}
