import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload, RegisterPayload } from '@/types'
import { apiPost } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const user = ref<User | null>(JSON.parse(localStorage.getItem('barua_user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('barua_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Getters ─────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
  )
  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
  })

  // ─── Actions ─────────────────────────────────────────────────────────────
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
      const res = await apiPost<{ user: User; token: string }>('/auth/login', payload)
      if (res.success) _persist(res.data.user, res.data.token)
      return res
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur de connexion'
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
      const res = await apiPost<{ user: User; token: string }>('/auth/register', payload)
      if (res.success) _persist(res.data.user, res.data.token)
      return res
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur d\'inscription'
      error.value = msg
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: Partial<User>) {
    loading.value = true
    try {
      const res = await apiPost<User>('/auth/profile', data)
      if (res.success) {
        user.value = res.data
        localStorage.setItem('barua_user', JSON.stringify(res.data))
      }
      return res
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('barua_user')
    localStorage.removeItem('barua_token')
  }

  // Demo login (no API needed in dev)
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
