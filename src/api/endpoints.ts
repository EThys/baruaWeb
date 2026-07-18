export const ENDPOINTS = {
  publicDocuments: '/public/documents',
  publicDocumentTypes: '/public/documents/types',
  publicServicesDocumentaires: '/public/service/documentaires',
  privateServicesDocumentaires: 'private/service/documentaires',
  privateDocuments: 'private/documents',
  privateDocumentTypes: 'private/documents/types',
  protectedChangePassword: 'protected/change/password',
  protectedResetPassword: 'protected/reset/password',
  /** PUT …/certification/{userId} — corps `{ state: boolean }` */
  protectedCertification: 'protected/certification',
  /** PUT …/recovery/user/{id} — débloquer un compte */
  protectedRecoveryUser: 'protected/recovery/user',
  /** DELETE — suppression / verrouillage du compte connecté */
  protectedDeleteUser: 'protected/users/delete/user',
  protectedTokenRefresh: 'protected/token/refresh',
  protectedUsers: 'protected/users',
  protectedUsersRoles: 'protected/users/roles',
  privateUsers: 'private/users',
  publicAccounts: '/public/accounts',
  publicOrganisms: '/public/organism',
  publicOtpGenerate: '/public/otp/generate',
  publicOtpValidate: '/public/otp/validate',
  /** Demandes de procuration (citoyen) */
  protectedDemandesProcuration: 'protected/demandes/procuration',
  /** Liste admin + changement de statut */
  privateDemandesProcuration: 'private/demandes/procuration',
  publicDemandeStatuses: 'public/demandes/procuration/status',
} as const
