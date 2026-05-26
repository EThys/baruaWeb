<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Documents</h1>
        <p class="text-sm text-gray-500 mt-1">
          Référentiel des pièces administratives.
          <span v-if="!loading" class="text-gray-400">— {{ filteredDocuments.length }} document(s)</span>
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div class="w-full sm:w-72">
          <label class="form-label">Recherche</label>
          <input
            v-model="search"
            type="search"
            class="form-field"
            placeholder="Titre, code, type…"
          />
        </div>
        <button
          v-if="auth.canManageDocumentTypes"
          type="button"
          class="btn-outline shrink-0"
          @click="openTypeModal"
        >
          Types de documents
        </button>
        <button
          v-if="auth.canManageDocuments"
          type="button"
          class="btn-primary shrink-0"
          @click="openCreateModalWithTypes"
        >
          Créer un document
        </button>
      </div>
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
    </p>

    <div v-if="loading" class="text-sm text-gray-500">Chargement des documents…</div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100 bg-gray-50/80">
              <th class="py-3 px-4">ID</th>
              <th class="py-3 px-4">Titre</th>
              <th class="py-3 px-4">Code</th>
              <th class="py-3 px-4">Type</th>
              <th class="py-3 px-4">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="d in filteredDocuments"
              :key="d.id"
              class="border-b border-gray-50 hover:bg-gray-50/50"
            >
              <td class="py-3 px-4 text-gray-500 font-mono text-xs">#{{ d.id }}</td>
              <td class="py-3 px-4 font-medium text-gray-900">{{ d.title }}</td>
              <td class="py-3 px-4 text-gray-600 font-mono text-xs">{{ d.code || '—' }}</td>
              <td class="py-3 px-4">
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">
                  {{ d.type?.name || '—' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-600 max-w-xs truncate" :title="d.description || ''">
                {{ d.description || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredDocuments.length && !loading" class="p-8 text-center text-gray-500">
        Aucun document trouvé.
      </p>
    </div>

    <!-- Modal types de documents (super-admin) -->
    <div
      v-if="showTypeModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      @click.self="closeTypeModal"
    >
      <div class="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="font-semibold text-gray-900">Types de documents</h2>
        <p class="text-sm text-gray-500">Référentiel des catégories (état civil, fiscalité…).</p>

        <ul v-if="documentTypes.length" class="text-sm space-y-2 max-h-40 overflow-y-auto border border-gray-100 rounded-xl p-3">
          <li
            v-for="t in documentTypes"
            :key="t.documentTypeId"
            class="flex justify-between gap-2 py-1 border-b border-gray-50 last:border-0"
          >
            <span class="font-medium text-gray-800">{{ t.name }}</span>
            <span class="text-gray-400 text-xs shrink-0">#{{ t.documentTypeId }}</span>
          </li>
        </ul>

        <form class="space-y-4 border-t border-gray-100 pt-4" @submit.prevent="handleCreateType">
          <p class="text-sm font-medium text-gray-800">Nouveau type</p>
          <div>
            <label class="form-label">Nom</label>
            <input v-model="typeForm.name" type="text" class="form-field" required placeholder="Ex. État civil" />
          </div>
          <div>
            <label class="form-label">Description</label>
            <textarea v-model="typeForm.description" class="form-field min-h-[60px]" placeholder="Optionnel" />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="typeForm.active" type="checkbox" class="rounded border-gray-300 text-brand" />
            Type actif
          </label>
          <p v-if="typeError" class="text-sm text-red-600">{{ typeError }}</p>
          <div class="flex gap-3 justify-end">
            <button type="button" class="btn-outline" @click="closeTypeModal">Fermer</button>
            <button type="submit" class="btn-primary" :disabled="creatingType">
              {{ creatingType ? 'Création…' : 'Créer le type' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal création document -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      @click.self="closeCreateModal"
    >
      <div class="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="font-semibold text-gray-900">Créer un document</h2>
        <p class="text-sm text-gray-500">Ajoute une pièce au référentiel (titre, type, description).</p>

        <form class="space-y-4" @submit.prevent="handleCreate">
          <div>
            <label class="form-label">Type de document</label>
            <select v-model.number="createForm.documentTypeId" class="form-field" required>
              <option :value="0" disabled>Choisir un type</option>
              <option v-for="t in documentTypes" :key="t.documentTypeId" :value="t.documentTypeId">
                {{ t.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="form-label">Titre</label>
            <input
              v-model="createForm.title"
              type="text"
              class="form-field"
              required
              placeholder="Ex. Attestation de vie"
            />
          </div>

          <div>
            <label class="form-label">Code <span class="text-gray-400 font-normal">(optionnel)</span></label>
            <input v-model="createForm.code" type="text" class="form-field" />
          </div>

          <div>
            <label class="form-label">Description</label>
            <textarea v-model="createForm.description" class="form-field min-h-[80px]" />
          </div>

          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="createForm.active" type="checkbox" class="rounded border-gray-300 text-brand" />
            Document actif
          </label>

          <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>

          <div class="flex gap-3 justify-end pt-2">
            <button type="button" class="btn-outline" @click="closeCreateModal">Annuler</button>
            <button type="submit" class="btn-primary" :disabled="creating">
              {{ creating ? 'Création…' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { createAdminDocument, createDocumentType } from '@/api/admin'
import { getPublicDocuments, getPublicDocumentTypes } from '@/api/publicDocuments'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import type { PublicDocument, PublicDocumentType } from '@/models/publicDocuments'

const auth = useAuthStore()
const ui = useUIStore()

const documents = ref<PublicDocument[]>([])
const documentTypes = ref<PublicDocumentType[]>([])
const loading = ref(true)
const loadError = ref('')
const search = ref('')

const showCreateModal = ref(false)
const showTypeModal = ref(false)
const creating = ref(false)
const creatingType = ref(false)
const createError = ref('')
const typeError = ref('')

const createForm = reactive({
  documentTypeId: 0,
  title: '',
  code: '',
  description: '',
  active: true,
})

const typeForm = reactive({
  name: '',
  description: '',
  active: true,
})

const filteredDocuments = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return documents.value
  return documents.value.filter(d =>
    d.title.toLowerCase().includes(q)
    || (d.code ?? '').toLowerCase().includes(q)
    || (d.type?.name ?? '').toLowerCase().includes(q)
    || (d.description ?? '').toLowerCase().includes(q),
  )
})

function resetCreateForm() {
  createForm.documentTypeId = 0
  createForm.title = ''
  createForm.code = ''
  createForm.description = ''
  createForm.active = true
  createError.value = ''
}

function openCreateModal() {
  resetCreateForm()
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  createError.value = ''
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    documents.value = await getPublicDocuments()
  } catch {
    loadError.value = 'Impossible de charger la liste des documents.'
    documents.value = []
  } finally {
    loading.value = false
  }
}

async function loadDocumentTypes() {
  try {
    documentTypes.value = await getPublicDocumentTypes()
  } catch {
    createError.value = 'Impossible de charger les types de document.'
  }
}

async function ensureDocumentTypes() {
  if (!documentTypes.value.length) await loadDocumentTypes()
}

async function openCreateModalWithTypes() {
  openCreateModal()
  await ensureDocumentTypes()
}

function closeTypeModal() {
  showTypeModal.value = false
  typeError.value = ''
}

async function openTypeModal() {
  typeForm.name = ''
  typeForm.description = ''
  typeForm.active = true
  typeError.value = ''
  showTypeModal.value = true
  await loadDocumentTypes()
}

async function handleCreateType() {
  typeError.value = ''
  if (!typeForm.name.trim()) {
    typeError.value = 'Le nom est obligatoire.'
    return
  }
  creatingType.value = true
  try {
    const res = await createDocumentType({
      name: typeForm.name.trim(),
      description: typeForm.description.trim() || undefined,
      active: typeForm.active,
    })
    ui.toast.success('Type créé', res.message ?? typeForm.name)
    typeForm.name = ''
    typeForm.description = ''
    await loadDocumentTypes()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    typeError.value = err.response?.data?.message ?? 'Impossible de créer le type.'
  } finally {
    creatingType.value = false
  }
}

async function handleCreate() {
  createError.value = ''
  if (!createForm.documentTypeId || !createForm.title.trim()) {
    createError.value = 'Type et titre sont obligatoires.'
    return
  }
  creating.value = true
  try {
    const res = await createAdminDocument({
      documentTypeId: createForm.documentTypeId,
      title: createForm.title.trim(),
      code: createForm.code.trim() || undefined,
      description: createForm.description.trim() || undefined,
      active: createForm.active,
    })
    ui.toast.success('Document créé', res.message ?? createForm.title)
    closeCreateModal()
    await load()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    createError.value = err.response?.data?.message ?? 'Impossible de créer le document.'
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>
