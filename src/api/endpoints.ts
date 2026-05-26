export const ENDPOINTS = {
  publicDocuments: '/public/documents',
  publicDocumentTypes: '/public/documents/types',
  publicServicesDocumentaires: '/public/service/documentaires',
  privateServicesDocumentaires: 'private/service/documentaires',
  privateDocuments: 'private/documents',
  privateDocumentTypes: 'private/documents/types',
  protectedChangePassword: 'protected/change/password',
  protectedResetPassword: 'protected/reset/password',
  protectedUsers: 'protected/users',
  privateUsers: 'private/users',
  publicAccounts: '/public/accounts',
  publicOrganisms: '/public/organism',
  publicOtpGenerate: '/public/otp/generate',
  publicOtpValidate: '/public/otp/validate',
} as const

