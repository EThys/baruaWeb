import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generatePublicOtp, validatePublicOtp } from '@/api/publicOtp'
import {
  clearPendingVerification,
  persistPendingVerification,
  readPendingVerification,
} from '@/utils/verificationSession'

function normalizeOtpError(raw: string | undefined): string {
  if (!raw) return 'Une erreur est survenue.'
  const s = raw.trim()
  if (/indentifiant invalide/i.test(s)) return 'Identifiant invalide.'
  if (/code invalide/i.test(s)) return 'Code invalide.'
  return s
}

export const useVerificationStore = defineStore('verification', () => {
  const identifier = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastInfoMessage = ref<string | null>(null)

  const maskedIdentifier = computed(() => {
    const e = identifier.value
    if (!e.includes('@')) return e
    const [user, domain] = e.split('@')
    if (!user || !domain) return e
    const u = user.length <= 2 ? `${user[0] ?? ''}•` : `${user.slice(0, 2)}•••`
    return `${u}@${domain}`
  })

  function setIdentifier(value: string) {
    identifier.value = value.trim()
    if (identifier.value) persistPendingVerification(identifier.value)
  }

  function hydrateIdentifierFromRouteOrStorage(queryIdentifier?: string | null) {
    const q = queryIdentifier?.trim()
    if (q) {
      setIdentifier(q)
      return
    }
    const stored = readPendingVerification()
    if (stored) identifier.value = stored
  }

  async function sendCode() {
    if (!identifier.value) {
      error.value = 'Adresse e-mail manquante.'
      return
    }
    if (loading.value) return
    loading.value = true
    error.value = null
    lastInfoMessage.value = null
    try {
      const res = await generatePublicOtp(identifier.value)
      lastInfoMessage.value = res.message
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = normalizeOtpError(msg)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function confirmCode(code: string) {
    if (!identifier.value) {
      error.value = 'Adresse e-mail manquante.'
      throw new Error('missing-identifier')
    }
    if (!code.trim()) {
      error.value = 'Saisissez le code reçu par e-mail.'
      throw new Error('missing-code')
    }
    loading.value = true
    error.value = null
    lastInfoMessage.value = null
    try {
      const res = await validatePublicOtp(identifier.value, code)
      lastInfoMessage.value = res.message
      clearPendingVerification()
      identifier.value = ''
      return res
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = normalizeOtpError(msg)
      throw e
    } finally {
      loading.value = false
    }
  }

  function resetLocal() {
    identifier.value = ''
    error.value = null
    lastInfoMessage.value = null
    clearPendingVerification()
  }

  return {
    identifier,
    loading,
    error,
    lastInfoMessage,
    maskedIdentifier,
    setIdentifier,
    hydrateIdentifierFromRouteOrStorage,
    sendCode,
    confirmCode,
    resetLocal,
  }
})
