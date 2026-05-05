import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload, RegisterPayload, BackendLoginResponse, BackendRegisterResponse } from '@/types'
import authApi from '@/services/authApi'

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

function mapProfileToRole(profile: BackendLoginResponse['member']['profile']): User['role'] {
  const name = profile?.[0]?.name?.toLowerCase()
  if (name === 'citoyen' || name === 'citizen') return 'citizen'
  if (name === 'commune_admin') return 'commune_admin'
  if (name === 'ministry_admin') return 'ministry_admin'
  if (name === 'super_admin') return 'super_admin'
  return 'citizen'
}

function mapBackendUserToAppUser(
  u: BackendLoginResponse['member']['user'],
  profile?: BackendLoginResponse['member']['profile'],
): User {
  return {
    id: String(u.userId),
    email: u.email,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    city: u.city,
    role: mapProfileToRole(profile),
    isVerified: Boolean(u.isCertified),
    createdAt: new Date().toISOString(),
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('barua_user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('barua_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
  )
  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
  })

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
      // POST /auth/login — backend uniquement en POST
      const { data } = await authApi.post<BackendLoginResponse>('/auth/login', {
        identifiant: payload.email.trim(),
        password: payload.password,
      })
      const mapped = mapBackendUserToAppUser(data.member.user, data.member.profile)
      _persist(mapped, data.token)
      if (data.refresh_token) localStorage.setItem('barua_refresh_token', data.refresh_token)
      return { ok: true as const, message: data.message }
    } catch (e: unknown) {
      const msg = normalizeAuthErrorMessage(extractApiMessage(e))
      error.value = msg
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscription : l’API renvoie `user` + `message` (pas de token).
   * Erreurs ex. `{ "message":"Mot de passe invalide." }` si confirmPassword ≠ password côté serveur.
   */
  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      // POST /auth/register — backend uniquement en POST
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
  }

  function demoLogin() {
    const demoUser: User = {
      id: 'demo-1',
      firstName: 'Emy',
      lastName: 'Mayumbi',
      email: 'emy.mayumbi@example.com',
      phone: '+243 90 00 00 00',
      nationalId: 'CD-2024-000001',
      role: 'citizen',
      isVerified: true,
      createdAt: new Date().toISOString(),
    }
    _persist(demoUser, 'demo-token-123')
  }

  function demoAdminLogin(role: User['role'] = 'super_admin') {
    const demoUser: User = {
      id: `demo-admin-${role}`,
      firstName: 'Admin',
      lastName: role === 'super_admin' ? 'Super' : role === 'ministry_admin' ? 'Ministère' : 'Commune',
      email: 'admin@example.com',
      phone: '+243 00 00 00 00',
      nationalId: 'ADMIN-DEMO-0001',
      role,
      isVerified: true,
      createdAt: new Date().toISOString(),
    }
    _persist(demoUser, 'demo-admin-token-456')
  }

  return {
    user, token, loading, error,
    isAuthenticated, fullName, initials,
    login, register, logout, updateProfile, demoLogin, demoAdminLogin,
  }
})
