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
  /** Compte /public/accounts (2 = citoyen, 3 = admin commune…). */
  accountId?: number
  accountName?: string
  roleLabel?: string
  isCitizen?: boolean
  organismId?: number
  organismName?: string
  organismCity?: string
  /** true si le rôle vient vraiment de l’API (pas un défaut citoyen). */
  roleResolved?: boolean
}

/** Corps PUT protected/users/{id} (UserRequestChange). */
export interface UpdateAdminUserPayload {
  email: string
  pseudo: string
  phone: string
  city: string
  firstName: string
  lastName: string
}

export interface PermissionRoleItem {
  organismId?: number | null
  profileId: number
}

/** @deprecated Prefer AssignAccountUserPayload (POST /protected/users/roles). */
export interface AssignUserRolesPayload {
  roles: PermissionRoleItem[]
}

/** Corps POST protected/users/roles (AssignAccountUserRequest). */
export interface AssignAccountUserPayload {
  userId: number
  accountId: number
  organismId?: number | null
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

export interface DocumentPayload {
  documentTypeId: number
  title: string
  code?: string
  description?: string
  active?: boolean
}

export type CreateDocumentPayload = DocumentPayload

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

export type UpdateDocumentPayload = DocumentPayload

export interface UpdateDocumentResponse {
  document?: CreateDocumentResponse['document']
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
