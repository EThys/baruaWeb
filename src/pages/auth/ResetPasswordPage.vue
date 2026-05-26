<template>
  <div>
    <h2 class="font-display font-bold text-2xl text-gray-900 mb-1">Nouveau mot de passe</h2>
    <p class="text-gray-600 text-sm mb-6">
      Saisissez le code reçu par e-mail pour
      <span class="font-medium text-gray-800">{{ displayEmail }}</span>
      puis choisissez un nouveau mot de passe.
    </p>

    <p v-if="verification.lastInfoMessage" class="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand mb-4">
      {{ verification.lastInfoMessage }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
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
      <div>
        <label class="form-label">Nouveau mot de passe</label>
        <input
          v-model="newPassword"
          type="password"
          autocomplete="new-password"
          class="form-field"
          minlength="6"
          required
        />
      </div>
      <div>
        <label class="form-label">Confirmer le mot de passe</label>
        <input
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          class="form-field"
          required
        />
      </div>

      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

      <button type="submit" class="btn-primary w-full btn-lg" :disabled="loading">
        <Loader2 v-if="loading" :size="18" class="animate-spin" />
        {{ loading ? 'Mise à jour…' : 'Réinitialiser le mot de passe' }}
      </button>
    </form>

    <button
      type="button"
      class="btn-outline w-full mt-4 justify-center"
      :disabled="verification.loading"
      @click="resendCode"
    >
      Renvoyer le code
    </button>

    <RouterLink to="/auth/login" class="mt-6 flex items-center justify-center gap-1.5 text-sm text-brand hover:underline">
      <ArrowLeft :size="14" /> Retour à la connexion
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { resetPassword } from '@/api/authPassword'
import { useVerificationStore } from '@/stores/verification'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const verification = useVerificationStore()
const ui = useUIStore()

const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const displayEmail = computed(() => verification.maskedIdentifier || verification.identifier || 'votre adresse')

onMounted(() => {
  // Ne pas envoyer un ancien JWT sur reset — le corps API est seulement { newPassword }.
  localStorage.removeItem('barua_token')
  localStorage.removeItem('barua_user')
  verification.hydrateIdentifierFromRouteOrStorage(route.query.email as string | undefined)
  if (!verification.identifier) {
    router.replace({ name: 'forgot-password' })
  }
})

async function resendCode() {
  try {
    await verification.sendCode()
    ui.toast.success('Code renvoyé', verification.lastInfoMessage ?? '')
  } catch {
    /* erreur dans le store */
  }
}

async function handleSubmit() {
  error.value = ''
  if (newPassword.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loading.value = true
  try {
    await verification.confirmCode(code.value, { keepIdentifier: true })
    const res = await resetPassword(newPassword.value)
    verification.resetLocal()
    ui.toast.success('Mot de passe réinitialisé', res.message ?? 'Vous pouvez vous connecter.')
    router.push({ name: 'login', query: { reset: '1' } })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message
      ?? verification.error
      ?? 'Impossible de réinitialiser le mot de passe. Vérifiez le code.'
  } finally {
    loading.value = false
  }
}
</script>
