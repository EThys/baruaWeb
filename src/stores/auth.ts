import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  User,
  UserRole,
  UserAccountProfile,
  LoginPayload,
  RegisterPayload,
  BackendLoginResponse,
  BackendLoginProfile,
  BackendRegisterResponse,
} from '@/types'
import authApi from '@/services/authApi'
import {
  accountRoleLabel,
  communeAdminProfile,
  resolveRoleFromProfiles,
} from '@/utils/accountRole'

function extractApiMessage(e: unknown): string | undefined {
  const err = e as { response?: { data?: { message?: string } } }
  return err.response?.data?.message
}

/** Messages API EN → FR pour l’UX */
function normalizeAuthErrorMessage(raw: string | undefined): string {
  if (!raw) return 'Une erreur est survenue.'
  const s = raw.trim()
  if (/invalid credentials/i.test(s)) return 'Identifiant ou mot de passe incorrect.'
  return s
}

function mapProfiles(raw: BackendLoginProfile[] | undefined): UserAccountProfile[] {
  if (!Array.isArray(raw)) return []
  return raw.map(p => ({
    accountId: p.account.id,
    accountName: p.account.name,
    typeAccountId: p.account.typeAccount.typeAccountId,
    typeAccountName: p.account.typeAccount.name,
    organismId: p.organism?.id,
    organismName: p.organism?.name,
    organismCity: p.organism?.city,
  }))
}

function mapBackendUserToAppUser(
  u: BackendLoginResponse['member']['user'],
  rawProfiles?: BackendLoginProfile[],
): User {
  const profiles = mapProfiles(rawProfiles)
  const role = resolveRoleFromProfiles(profiles)
  const primary = profiles.find(p => resolveRoleFromProfiles([p]) === role) ?? profiles[0]
  const communeProfile = communeAdminProfile(profiles)

  return {
    id: String(u.userId),
    email: u.email,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    city: u.city,
    role,
    profiles,
    accountId: primary?.accountId,
    accountName: primary?.accountName,
    typeAccountName: primary?.typeAccountName,
    adminOrganismId: communeProfile?.organismId,
    adminOrganismName: communeProfile?.organismName,
    isVerified: Boolean(u.isCertified),
    createdAt: new Date().toISOString(),
  }
}

const STAFF_ROLES: UserRole[] = ['commune_admin', 'ministry_admin', 'super_admin']

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(rehydrateStoredUser())
  const token = ref<string | null>(localStorage.getItem('barua_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  function rehydrateStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('barua_user')
      if (!raw) return null
      const parsed = JSON.parse(raw) as User
      if (!parsed?.id) return null
      // Recalcul du rôle si profils présents (corrige un ancien stockage incorrect)
      if (parsed.profiles?.length) {
        parsed.role = resolveRoleFromProfiles(parsed.profiles)
        const commune = communeAdminProfile(parsed.profiles)
        parsed.adminOrganismId = commune?.organismId
        parsed.adminOrganismName = commune?.organismName
        const primary = parsed.profiles.find(p => resolveRoleFromProfiles([p]) === parsed.role) ?? parsed.profiles[0]
        parsed.accountId = primary?.accountId
        parsed.accountName = primary?.accountName
        parsed.typeAccountName = primary?.typeAccountName
      }
      return parsed
    } catch {
      return null
    }
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
  )
  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
  })

  const isCitizen = computed(() => user.value?.role === 'citizen')

  const isStaff = computed(() =>
    user.value != null && STAFF_ROLES.includes(user.value.role),
  )

  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')

  const canManageServiceDocumentaires = computed(() => isStaff.value)

  const canManageDocuments = computed(() => isStaff.value)

  const canManageDocumentTypes = computed(() => isSuperAdmin.value)

  const roleLabel = computed(() =>
    user.value ? accountRoleLabel(user.value.role) : '',
  )

  function defaultHomeRoute(): string {
    return isStaff.value ? '/admin' : '/dashboard'
  }

  function _persist(u: User, t: string) {
    user.value = u
    token.value = t
    localStorage.setItem('barua_user', JSON.stringify(u))
    localStorage.setItem('barua_token', t)
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.post<BackendLoginResponse>('/auth/login', {
        identifiant: payload.email.trim(),
        password: payload.password,
      })
      const mapped = mapBackendUserToAppUser(data.member.user, data.member.profile)
      _persist(mapped, data.token)
      if (data.refresh_token) localStorage.setItem('barua_refresh_token', data.refresh_token)
      return { ok: true as const, message: data.message, user: mapped }
    } catch (e: unknown) {
      const msg = normalizeAuthErrorMessage(extractApiMessage(e))
      error.value = msg
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.post<BackendRegisterResponse>('/auth/register', {
        email: payload.email.trim(),
        password: payload.password,
        confirmPassword: payload.confirmPassword,
        pseudo: (payload.pseudo ?? '').trim(),
        phone: payload.phone.trim(),
        city: payload.city.trim(),
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
      })
      const msg = data.message ?? 'Compte créé.'
      return { ok: true as const, message: msg }
    } catch (e: unknown) {
      const msg = normalizeAuthErrorMessage(extractApiMessage(e))
      error.value = msg
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: Partial<User>) {
    loading.value = true
    try {
      const { data: body } = await authApi.post<User>('/auth/profile', data)
      if (body && typeof body === 'object' && 'email' in body) {
        user.value = body
        localStorage.setItem('barua_user', JSON.stringify(body))
      }
      return { success: true as const, data: body }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('barua_user')
    localStorage.removeItem('barua_token')
    localStorage.removeItem('barua_refresh_token')
    localStorage.removeItem('barua_requests_pinia_v1')
    void import('@/utils/userRoleCache').then(({ clearCachedUserRoles }) => {
      clearCachedUserRoles()
    })
    void import('@/stores/requests').then(({ useRequestsStore }) => {
      try {
        useRequestsStore().clearLocalCache()
      } catch {
        // store non initialisé
      }
    })
  }

  /** POST protected/token/refresh */
  async function refreshSession(): Promise<boolean> {
    const rt = localStorage.getItem('barua_refresh_token')
    if (!rt) return false
    try {
      const { refreshAccessToken } = await import('@/api/adminAuth')
      const data = await refreshAccessToken(rt)
      if (!data.accessToken) return false
      token.value = data.accessToken
      localStorage.setItem('barua_token', data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem('barua_refresh_token', data.refreshToken)
      }
      return true
    } catch {
      return false
    }
  }

  return {
    user, token, loading, error,
    isAuthenticated, fullName, initials,
    isCitizen, isStaff, isSuperAdmin,
    canManageServiceDocumentaires, canManageDocuments, canManageDocumentTypes,
    roleLabel,
    defaultHomeRoute,
    login, register, logout, updateProfile, refreshSession,
  }
})
