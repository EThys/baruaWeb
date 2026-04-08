<template>
  <div>
    <h2 class="font-display font-bold text-2xl text-gray-800 mb-1">Mot de passe oublié</h2>
    <p class="text-gray-500 text-sm mb-7">Saisissez votre email pour recevoir un lien de réinitialisation.</p>
    <div v-if="!sent">
      <form @submit.prevent="handleSend" class="space-y-4">
        <div>
          <label class="form-label">Email</label>
          <input v-model="email" type="email" required placeholder="jean@example.com" class="form-field" />
        </div>
        <button type="submit" class="btn-primary w-full btn-lg" :disabled="loading">
          <Loader2 v-if="loading" :size="18" class="animate-spin" />
          <Send v-else :size="18" />
          {{ loading ? 'Envoi…' : 'Envoyer le lien' }}
        </button>
      </form>
    </div>
    <div v-else class="text-center py-6">
      <CheckCircle :size="48" class="text-green-500 mx-auto mb-3" />
      <p class="font-semibold text-gray-800">Email envoyé !</p>
      <p class="text-sm text-gray-500 mt-1">Vérifiez votre boîte de réception et cliquez sur le lien.</p>
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
const email = ref(''); const loading = ref(false); const sent = ref(false)
async function handleSend() {
  loading.value = true
  await new Promise(r => setTimeout(r, 1500))
  loading.value = false; sent.value = true
}
</script>
