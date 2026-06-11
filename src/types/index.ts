// ─── User / Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  /** Ex: @Longoria (API backend) */
  username?: string
  phone?: string
  nationalId?: string
  dateOfBirth?: string
  address?: string
  city?: string
  avatar?: string
  role: UserRole
  /** Profils renvoyés par l’API au login (citoyen, admin commune, super-admin, etc.) */
  profiles?: UserAccountProfile[]
  /** Compte actif (ex. id 2 = citoyen) — aligné sur /public/accounts */
  accountId?: number
  accountName?: string
  typeAccountName?: string
  /** Organisme lié au profil admin commune (ex. Limete) */
  adminOrganismId?: number
  adminOrganismName?: string
  isVerified: boolean
  createdAt: string
}

export interface UserAccountProfile {
  accountId: number
  accountName: string
  typeAccountId: number
  typeAccountName: string
  organismId?: number
  organismName?: string
  organismCity?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  /** Pseudo affiché côté API (ex: Longoria → @Longoria) — optionnel */
  pseudo?: string
  phone: string
  city: string
}

/** Réponses brutes backend `/auth/*` (pas le wrapper ApiResponse) */
export interface BackendRegisterResponse {
  user?: {
    userId: number
    email: string
    username?: string
    phone?: string
    city?: string
    firstName: string
    lastName: string
    isPremium?: boolean
    isCertified?: boolean
  }
  message?: string
}

export interface BackendLoginAccount {
  id: number
  name: string
  typeAccount: {
    typeAccountId: number
    name: string
  }
}

export interface BackendLoginOrganism {
  id: number
  city: string
  name: string
  description?: string | null
  type?: { id: number; name: string; description?: string }
}

export interface BackendLoginProfile {
  account: BackendLoginAccount
  organism: BackendLoginOrganism | null
}

export interface BackendLoginResponse {
  member: {
    user: {
      userId: number
      email: string
      username?: string
      phone?: string
      city?: string
      firstName: string
      lastName: string
      isPremium?: boolean
      isCertified?: boolean
    }
    profile?: BackendLoginProfile[]
  }
  token: string
  refresh_token?: string
  message?: string
}

export interface CreateServiceDocumentairePayload {
  documentId: number
  organismId: number
  price: number
  devise: number
  delayDayOpen: string
  description: string
}

export interface ServiceDocumentaireRecord {
  serviceDocumentaireId: number
  documentId: number
  organismId: number
  userId: number
  price: number
  deviseId: number
  description: string
  delayDayOpen: string
  isActive: boolean
}

export interface CreateServiceDocumentaireResponse {
  serviceDocumentaire: ServiceDocumentaireRecord
  message: string
}

export type UpdateServiceDocumentaireResponse = CreateServiceDocumentaireResponse

export interface PublicAccount {
  id: number
  name: string
  typeAccount: {
    typeAccountId: number
    name: string
  }
}

export interface PublicAccountsResponse {
  accounts: PublicAccount[]
}

// ─── Service Categories ───────────────────────────────────────────────────────
export type CategorySlug =
  | 'etat-civil'
  | 'education'
  | 'emploi-securite-sociale'
  | 'sante'
  | 'justice'
  | 'habitat-transport'
  | 'fiscalite'
  | 'agriculture'
  | 'telecommunication'
  | 'securite'

export interface ServiceCategory {
  id: string
  slug: CategorySlug
  name: string
  description: string
  icon: string
  color: string
  serviceCount: number
}

// ─── Services ────────────────────────────────────────────────────────────────
export type Eligibility = 'citizen' | 'enterprise' | 'both'
export type ServiceDifficulty = 'easy' | 'medium' | 'hard'

export interface ServiceDocument {
  id: string
  label: string
  required: boolean
  description?: string
}

export interface ServiceStep {
  step: number
  title: string
  description: string
}

export interface Service {
  id: string
  categoryId: string
  categorySlug: CategorySlug
  title: string
  shortDescription: string
  description: string
  eligibility: Eligibility
  estimatedDuration: string // e.g. "3-5 jours ouvrables"
  cost?: number
  currency: 'FC' | 'USD'
  /** Libellé tarif regroupé (ex. « dès 5 000 FC · dès 10 $ ») */
  costLabel?: string
  /** Carte catalogue : plusieurs communes pour le même document */
  isCatalogEntry?: boolean
  catalogDocumentId?: number
  offeringCount?: number
  difficulty: ServiceDifficulty
  requiredDocuments: ServiceDocument[]
  steps: ServiceStep[]
  formFields: FormFieldConfig[]
  tags: string[]
  isOnline: boolean
  ministry: string
  isPopular?: boolean
  /** Référence API service documentaire */
  serviceDocumentaireId?: number
  documentId?: number
  organismId?: number
  organismName?: string
  organismTypeName?: string
  organismCity?: string
}

// ─── Form Builder ─────────────────────────────────────────────────────────────
export type FieldType =
  | 'text' | 'email' | 'tel' | 'number'
  | 'date' | 'select' | 'textarea' | 'radio'
  | 'checkbox' | 'file'

export interface SelectOption {
  value: string
  label: string
}

export interface FormFieldConfig {
  id: string
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required: boolean
  options?: SelectOption[]     // pour select / radio
  accept?: string              // pour file
  multiple?: boolean           // pour file
  rows?: number                // pour textarea
  min?: string | number
  max?: string | number
  helpText?: string
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    message?: string
  }
}

// ─── Demandes (Requests) ──────────────────────────────────────────────────────
export type RequestStatus =
  | 'brouillon'
  | 'soumise'
  | 'en_cours'
  | 'en_attente_document'
  | 'approuvee'
  | 'rejetee'
  | 'annulee'

export interface RequestStatusHistory {
  status: RequestStatus
  date: string
  note?: string
  agentName?: string
}

export interface ServiceRequest {
  id: string
  referenceNumber: string
  userId: string
  serviceId: string
  serviceName: string
  categorySlug: CategorySlug
  status: RequestStatus
  formData: Record<string, unknown>
  documents: UploadedDocument[]
  statusHistory: RequestStatusHistory[]
  submittedAt?: string
  updatedAt: string
  createdAt: string
  estimatedCompletionDate?: string
  agentNote?: string
  cost?: number
}

export interface UploadedDocument {
  id: string
  name: string
  fileName: string
  size: number
  mimeType: string
  uploadedAt: string
  url: string
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  isRead: boolean
  requestId?: string
  createdAt: string
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

// ─── Document archive ───────────────────────────────────────────────────────
export type UserRole =
  | 'citizen'
  | 'commune_admin'
  | 'ministry_admin'
  | 'super_admin'

export interface DocumentRecord {
  id: string
  title: string
  ownerUserId: string
  communeId?: string
  ministry?: string
  tags: string[]
  fileUrl: string
  fileName: string
  mimeType: string
  createdAt: string
  downloads: number
}
