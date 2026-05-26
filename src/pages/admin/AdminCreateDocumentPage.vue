<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h1 class="font-display font-bold text-2xl text-gray-900">Créer un document</h1>
      <p class="text-sm text-gray-500 mt-1">Ajoute une pièce au référentiel (titre, type, description).</p>
    </div>

    <form class="card p-6 space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label class="form-label">Type de document</label>
        <select v-model.number="form.documentTypeId" class="form-field" required>
          <option :value="0" disabled>Choisir un type</option>
          <option v-for="t in documentTypes" :key="t.documentTypeId" :value="t.documentTypeId">
            {{ t.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="form-label">Titre</label>
        <input v-model="form.title" type="text" class="form-field" required placeholder="Ex. Attestation de vie" />
      </div>

      <div>
        <label class="form-label">Code <span class="text-gray-400 font-normal">(optionnel)</span></label>
        <input v-model="form.code" type="text" class="form-field" />
      </div>

      <div>
        <label class="form-label">Description</label>
        <textarea v-model="form.description" class="form-field min-h-[100px]" />
      </div>

      <label class="flex items-center gap-2 text-sm text-gray-700">
        <input v-model="form.active" type="checkbox" class="rounded border-gray-300 text-brand" />
        Document actif
      </label>

      <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>

      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Création…' : 'Créer le document' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { createAdminDocument } from '@/api/admin'
import { getPublicDocumentTypes } from '@/api/publicDocuments'
import { useUIStore } from '@/stores/ui'
import type { PublicDocumentType } from '@/models/publicDocuments'

const ui = useUIStore()
const documentTypes = ref<PublicDocumentType[]>([])
const submitting = ref(false)
const formError = ref('')

const form = reactive({
  documentTypeId: 0,
  title: '',
  code: '',
  description: '',
  active: true,
})

async function handleSubmit() {
  formError.value = ''
  if (!form.documentTypeId || !form.title.trim()) {
    formError.value = 'Type et titre sont obligatoires.'
    return
  }
  submitting.value = true
  try {
    const res = await createAdminDocument({
      documentTypeId: form.documentTypeId,
      title: form.title.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      active: form.active,
    })
    ui.toast.success('Document créé', res.message ?? form.title)
    form.title = ''
    form.code = ''
    form.description = ''
    form.documentTypeId = 0
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    formError.value = err.response?.data?.message ?? 'Impossible de créer le document.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  documentTypes.value = await getPublicDocumentTypes()
})
</script>
