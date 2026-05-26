<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label class="form-label">Nouveau mot de passe</label>
      <input
        v-model="form.newPassword"
        :type="showPwd ? 'text' : 'password'"
        autocomplete="new-password"
        class="form-field"
        minlength="6"
        required
        placeholder="Au moins 6 caractères"
      />
    </div>
    <div>
      <label class="form-label">Confirmer le mot de passe</label>
      <input
        v-model="form.confirmPassword"
        :type="showPwd ? 'text' : 'password'"
        autocomplete="new-password"
        class="form-field"
        required
        placeholder="Répéter le mot de passe"
      />
    </div>
    <label class="flex items-center gap-2 text-sm text-gray-600">
      <input v-model="showPwd" type="checkbox" class="rounded border-gray-300 text-brand" />
      Afficher les mots de passe
    </label>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <button type="submit" class="btn-primary" :disabled="submitting">
      {{ submitting ? 'Enregistrement…' : 'Mettre à jour le mot de passe' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { changePassword } from '@/api/authPassword'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()
const submitting = ref(false)
const error = ref('')
const showPwd = ref(false)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

async function handleSubmit() {
  error.value = ''
  if (form.newPassword.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  submitting.value = true
  try {
    const res = await changePassword(form.newPassword)
    ui.toast.success('Mot de passe mis à jour', res.message ?? 'Modification enregistrée.')
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Impossible de modifier le mot de passe.'
  } finally {
    submitting.value = false
  }
}
</script>
