<template>
  <div>
    <h2 class="font-display font-bold text-2xl text-gray-900 mb-1">
      {{ step === 1 ? 'Vérifier le code' : 'Nouveau mot de passe' }}
    </h2>
    <p class="text-gray-600 text-sm mb-6">
      <template v-if="step === 1">
        Saisissez le code reçu par e-mail pour
        <span class="font-medium text-gray-800">{{ displayEmail }}</span>.
      </template>
      <template v-else>
        Choisissez un nouveau mot de passe pour
        <span class="font-medium text-gray-800">{{ displayEmail }}</span>.
      </template>
    </p>

    <div class="mb-6 flex items-center gap-2 text-xs font-semibold">
      <span
        class="rounded-full px-3 py-1"
        :class="step === 1 ? 'bg-brand text-white' : 'bg-emerald-50 text-emerald-700'"
      >
        1. Code
      </span>
      <span class="text-gray-300">→</span>
      <span
        class="rounded-full px-3 py-1"
        :class="step === 2 ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'"
      >
        2. Mot de passe
      </span>
    </div>

    <p
      v-if="verification.lastInfoMessage"
      class="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand mb-4"
    >
      {{ verification.lastInfoMessage }}
    </p>

    <form v-if="step === 1" class="space-y-4" @submit.prevent="handleVerifyCode">
      <div>
        <label class="form-label">Code reçu par e-mail</label>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="16"
          class="form-field font-mono tracking-widest"
          placeholder="0123456"
          required
        />
      </div>

      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

      <button type="submit" class="btn-primary w-full btn-lg" :disabled="loading">
        <Loader2 v-if="loading" :size="18" class="animate-spin" />
        {{ loading ? 'Vérification…' : 'Continuer' }}
      </button>
    </form>

    <form v-else class="space-y-4" @submit.prevent="handleSetPassword">
      <div>
        <label class="form-label">Nouveau mot de passe</label>
        <div class="relative">
          <input
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="form-field !pr-11"
            minlength="6"
            required
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            @click="showPassword = !showPassword"
          >
            <Eye v-if="!showPassword" :size="17" />
            <EyeOff v-else :size="17" />
          </button>
        </div>
      </div>
      <div>
        <label class="form-label">Confirmer le mot de passe</label>
        <div class="relative">
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="form-field !pr-11"
            required
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            @click="showPassword = !showPassword"
          >
            <Eye v-if="!showPassword" :size="17" />
            <EyeOff v-else :size="17" />
          </button>
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

      <button type="submit" class="btn-primary w-full btn-lg" :disabled="loading">
        <Loader2 v-if="loading" :size="18" class="animate-spin" />
        {{ loading ? 'Mise à jour…' : 'Enregistrer le mot de passe' }}
      </button>

      <button
        type="button"
        class="btn-outline w-full justify-center"
        :disabled="loading"
        @click="backToCode"
      >
        Modifier le code
      </button>
    </form>

    <button
      v-if="step === 1"
      type="button"
      class="btn-outline w-full mt-4 justify-center"
      :disabled="verification.loading || loading"
      @click="resendCode"
    >
      Renvoyer le code
    </button>

    <RouterLink
      to="/auth/login"
      class="mt-6 flex items-center justify-center gap-1.5 text-sm text-brand hover:underline"
    >
      <ArrowLeft :size="14" /> Retour à la connexion
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { resetPassword } from '@/api/authPassword'
import {
  extractOtpAccessToken,
  extractOtpRefreshToken,
} from '@/api/publicOtp'
import { useVerificationStore } from '@/stores/verification'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const verification = useVerificationStore()
const ui = useUIStore()

const step = ref<1 | 2>(1)
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
/** JWT optionnel si l’OTP en renvoie un (souvent absent : l’API ne renvoie qu’un message). */
const otpAccessToken = ref<string | null>(null)

const displayEmail = computed(
  () => verification.maskedIdentifier || verification.identifier || 'votre adresse',
)

function clearSessionTokens() {
  localStorage.removeItem('barua_token')
  localStorage.removeItem('barua_refresh_token')
  localStorage.removeItem('barua_user')
}

onMounted(() => {
  clearSessionTokens()
  otpAccessToken.value = null
  verification.hydrateIdentifierFromRouteOrStorage(route.query.email as string | undefined)
  if (!verification.identifier) {
    router.replace({ name: 'forgot-password' })
  }
})

async function resendCode() {
  error.value = ''
  try {
    await verification.sendCode()
    ui.toast.success('Code renvoyé', verification.lastInfoMessage ?? '')
  } catch {
    error.value = verification.error ?? 'Impossible de renvoyer le code.'
  }
}

function backToCode() {
  step.value = 1
  error.value = ''
  otpAccessToken.value = null
  clearSessionTokens()
}

async function handleVerifyCode() {
  error.value = ''
  if (!code.value.trim()) {
    error.value = 'Saisissez le code reçu par e-mail.'
    return
  }

  loading.value = true
  try {
    // L’API OTP valide le compte et renvoie en général seulement { message } — pas de JWT.
    const otpRes = await verification.confirmCode(code.value, { keepIdentifier: true })
    const accessToken = extractOtpAccessToken(otpRes) ?? null
    otpAccessToken.value = accessToken

    if (accessToken) {
      localStorage.setItem('barua_token', accessToken)
      const refreshToken = extractOtpRefreshToken(otpRes)
      if (refreshToken) localStorage.setItem('barua_refresh_token', refreshToken)
    } else {
      clearSessionTokens()
    }

    // Code accepté (200) → toujours passer à l’étape mot de passe
    step.value = 2
    ui.toast.success('Code validé', 'Choisissez maintenant votre nouveau mot de passe.')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value =
      err.response?.data?.message
      ?? verification.error
      ?? 'Code invalide. Réessayez.'
  } finally {
    loading.value = false
  }
}

async function handleSetPassword() {
  error.value = ''
  if (newPassword.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  if (otpAccessToken.value) {
    localStorage.setItem('barua_token', otpAccessToken.value)
  }

  loading.value = true
  try {
    // PUT /api/v1/protected/reset/password
    const res = await resetPassword(newPassword.value, {
      accessToken: otpAccessToken.value,
      identifier: verification.identifier || undefined,
      code: code.value.trim() || undefined,
    })

    clearSessionTokens()
    otpAccessToken.value = null
    verification.resetLocal()
    ui.toast.success(
      'Mot de passe réinitialisé',
      res.message ?? 'Vous pouvez vous connecter.',
    )
    router.push({ name: 'login', query: { reset: '1' } })
  } catch (e: unknown) {
    const err = e as { response?: { status?: number; data?: { message?: string } } }
    const status = err.response?.status
    const apiMsg = err.response?.data?.message
    if (status === 401) {
      error.value =
        apiMsg
        ?? 'L’API exige un JWT pour changer le mot de passe, mais la validation OTP n’en renvoie pas. Contactez le support backend.'
    } else {
      error.value = apiMsg ?? 'Impossible d’enregistrer le mot de passe.'
    }
  } finally {
    loading.value = false
  }
}
</script>
