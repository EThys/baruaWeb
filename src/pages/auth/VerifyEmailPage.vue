<template>
  <div>
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 class="font-display font-bold text-2xl text-gray-900 mb-1">Valider votre compte</h2>
        <p class="text-gray-600 text-sm">
          Saisissez le code reçu par e-mail pour <span class="font-medium text-gray-800">{{ displayEmail }}</span>
          (envoyé lors de votre inscription). « Renvoyer » renvoie le même code par e-mail si besoin.
        </p>
      </div>
      <RouterLink to="/" class="hidden sm:inline-flex text-sm text-gray-500 hover:text-brand transition-colors">
        Retour au site
      </RouterLink>
    </div>

    <p v-if="verification.lastInfoMessage" class="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand mb-4">
      {{ verification.lastInfoMessage }}
    </p>

    <form @submit.prevent="handleValidate" class="space-y-4">
      <div>
        <label class="form-label">Code reçu par e-mail</label>
        <div class="relative">
          <ShieldCheck :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="16"
            placeholder="0123456"
            class="form-field pl-11 tracking-widest font-mono text-lg"
            :class="codeError ? 'ring-1 ring-red-400/35 border-red-300' : ''"
            @input="onCodeInput"
          />
        </div>
        <p v-if="codeError" class="form-error text-xs mt-1">{{ codeError }}</p>
      </div>

      <p v-if="verification.error" class="text-xs text-red-500 flex items-center gap-1.5">
        <AlertCircle :size="13" /> {{ verification.error }}
      </p>

      <button type="submit" class="btn-primary w-full btn-lg" :disabled="verification.loading || !code.trim()">
        <Loader2 v-if="verification.loading" :size="18" class="animate-spin" />
        <ShieldCheck v-else :size="18" />
        {{ verification.loading ? 'Vérification…' : 'Confirmer le code' }}
      </button>
    </form>

    <div class="mt-6 pt-6 border-t border-gray-100 space-y-3">
      <p class="text-xs text-gray-500">Vous n’avez rien reçu ? Vérifiez les courriers indésirables.</p>
      <button
        type="button"
        class="btn-outline w-full justify-center"
        :disabled="verification.loading"
        @click="handleResend"
      >
        <RefreshCw :size="16" class="shrink-0" :class="{ 'animate-spin': verification.loading }" />
        Renvoyer le code par e-mail
      </button>
    </div>

    <p class="mt-6 text-center text-sm text-gray-500">
      <RouterLink to="/auth/login" class="text-brand font-semibold hover:underline">Retour à la connexion</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { AlertCircle, Loader2, RefreshCw, ShieldCheck } from 'lucide-vue-next'
import { useVerificationStore } from '@/stores/verification'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const verification = useVerificationStore()
const ui = useUIStore()

const code = ref('')
const codeError = ref('')

const displayEmail = computed(() => verification.identifier || 'votre adresse')

function onCodeInput(e: Event) {
  const t = e.target as HTMLInputElement
  code.value = t.value.replace(/\D/g, '')
}

async function handleValidate() {
  verification.error = null
  codeError.value = ''
  const c = code.value.trim()
  if (!c) {
    codeError.value = 'Saisissez le code reçu par e-mail.'
    return
  }
  if (c.length < 4) {
    codeError.value = 'Le code semble incomplet.'
    return
  }
  try {
    const res = await verification.confirmCode(code.value)
    ui.toast.success('Compte validé', res?.message ?? 'Vous pouvez vous connecter.')
    router.push({ path: '/auth/login', query: { verified: '1' } })
  } catch {
    // erreurs locales / API déjà dans verification.error sauf throw sans message
  }
}

async function handleResend() {
  verification.error = null
  try {
    await verification.sendCode()
    ui.toast.info('E-mail envoyé', verification.lastInfoMessage ?? 'Le code reste le même ; vérifiez votre boîte.')
  } catch {
    // déjà dans store
  }
}

onMounted(() => {
  verification.hydrateIdentifierFromRouteOrStorage(
    typeof route.query.identifier === 'string' ? route.query.identifier : null,
  )
  if (!verification.identifier) {
    ui.toast.warning('Session', 'Indiquez d’abord votre e-mail depuis l’inscription.')
    router.replace({ name: 'register' })
    return
  }
  // Pas d’appel automatique à /otp/generate : l’inscription envoie déjà le premier e-mail.
})
</script>
