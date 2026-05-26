<template>
  <div>
    <h2 class="font-display font-bold text-2xl text-gray-900 mb-1">Mot de passe oublié</h2>
    <p class="text-gray-600 text-sm mb-7">
      Saisissez votre e-mail. Un code de vérification vous sera envoyé pour définir un nouveau mot de passe.
    </p>

    <form v-if="!sent" @submit.prevent="handleSend" class="space-y-4">
      <div>
        <label class="form-label">E-mail</label>
        <input v-model="email" type="email" required placeholder="email@exemple.com" class="form-field" />
      </div>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <button type="submit" class="btn-primary w-full btn-lg" :disabled="loading">
        <Loader2 v-if="loading" :size="18" class="animate-spin" />
        <Send v-else :size="18" />
        {{ loading ? 'Envoi…' : 'Envoyer le code' }}
      </button>
    </form>

    <div v-else class="text-center py-4">
      <CheckCircle :size="48" class="text-green-500 mx-auto mb-3" />
      <p class="font-semibold text-gray-800">Code envoyé</p>
      <p class="text-sm text-gray-500 mt-1">Consultez votre boîte mail et continuez la réinitialisation.</p>
      <RouterLink
        :to="{ name: 'reset-password', query: { email } }"
        class="btn-primary w-full mt-6 inline-flex justify-center"
      >
        Saisir le code
      </RouterLink>
    </div>

    <RouterLink to="/auth/login" class="mt-6 flex items-center justify-center gap-1.5 text-sm text-brand hover:underline">
      <ArrowLeft :size="14" /> Retour à la connexion
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, CheckCircle, Loader2, Send } from 'lucide-vue-next'
import { useVerificationStore } from '@/stores/verification'

const verification = useVerificationStore()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function handleSend() {
  error.value = ''
  loading.value = true
  try {
    verification.setIdentifier(email.value)
    await verification.sendCode()
    sent.value = true
  } catch {
    error.value = verification.error ?? 'Impossible d’envoyer le code.'
  } finally {
    loading.value = false
  }
}
</script>
