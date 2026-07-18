<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Documents</h1>
        <p class="text-sm text-gray-500 mt-1">
          Référentiel des pièces administratives.
          <span v-if="!loading" class="text-gray-400">({{ total }} / {{ documents.length }})</span>
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-if="auth.canManageDocumentTypes"
          type="button"
          class="btn-outline btn-sm"
          @click="openTypeModal"
        >
          Types de documents
        </button>
        <button
          v-if="auth.canManageDocuments"
          type="button"
          class="btn-primary btn-sm"
          @click="openCreateModalWithTypes"
        >
          Créer un document
        </button>
      </div>
    </div>

    <div class="sheet-toolbar">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="search"
          class="form-field !pl-10"
          placeholder="Titre, code, type, description…"
          autocomplete="off"
        />
      </div>
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
    </p>

    <LoadingShimmer v-if="loading" variant="table" :count="6" :columns="auth.canManageDocuments ? 5 : 4" />

    <div v-else class="sheet">
      <div class="sheet-scroll">
        <table class="sheet-table min-w-[720px]">
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Description</th>
              <th v-if="auth.canManageDocuments" class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in pageItems" :key="d.id">
              <td>
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sheet-avatar" aria-hidden="true">
                    {{ docInitials(d.title) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ d.title }}</p>
                    <p class="text-[11px] text-gray-400 font-mono">
                      #{{ d.id }}<span v-if="d.code"> · {{ d.code }}</span>
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <span class="sheet-pill sheet-pill--ok">{{ d.type?.name || '-' }}</span>
              </td>
              <td class="max-w-xs truncate" :title="d.description || ''">
                {{ d.description || '-' }}
              </td>
              <td v-if="auth.canManageDocuments">
                <div class="sheet-actions">
                  <button type="button" class="sheet-btn sheet-btn--primary" @click="openEditModal(d)">
                    Modifier
                  </button>
                  <button
                    type="button"
                    class="sheet-btn"
                    :disabled="deactivatingId === d.id"
                    @click="confirmDeactivate(d)"
                  >
                    <Loader2 v-if="deactivatingId === d.id" :size="14" class="animate-spin" />
                    Désactiver
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredDocuments.length && !loading" class="sheet-empty">
        Aucun document trouvé.
      </p>
      <SheetPagination
        v-else-if="filteredDocuments.length"
        v-model:page="page"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="total"
        :from="from"
        :to="to"
      />
    </div>

    <AppModal
      :open="showTypeModal"
      title="Types de documents"
      subtitle="Référentiel des catégories (état civil, fiscalité…)."
      size="lg"
      @close="closeTypeModal"
    >
      <ul
        v-if="documentTypes.length"
        class="mb-4 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-sm"
      >
        <li
          v-for="t in documentTypes"
          :key="t.documentTypeId"
          class="flex justify-between gap-2 border-b border-gray-100 py-1.5 last:border-0"
        >
          <span class="font-medium text-gray-800">{{ t.name }}</span>
          <span class="shrink-0 text-xs text-gray-400">#{{ t.documentTypeId }}</span>
        </li>
      </ul>

      <form id="create-type-form" class="space-y-4 border-t border-gray-100 pt-4" @submit.prevent="handleCreateType">
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
        <p v-if="typeError" class="form-error">{{ typeError }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-outline" @click="closeTypeModal">Fermer</button>
        <button type="submit" form="create-type-form" class="btn-primary" :disabled="creatingType">
          {{ creatingType ? 'Création…' : 'Créer le type' }}
        </button>
      </template>
    </AppModal>

    <AppModal
      :open="showDocumentModal"
      :title="editingDocument ? 'Modifier le document' : 'Créer un document'"
      :subtitle="editingDocument ? 'Mettez à jour les informations du document.' : 'Ajoute une pièce au référentiel (titre, type, description).'"
      size="lg"
      @close="closeDocumentModal"
    >
      <form id="save-document-form" class="space-y-4" @submit.prevent="handleSaveDocument">
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
        <p v-if="documentFormError" class="form-error">{{ documentFormError }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-outline" @click="closeDocumentModal">Annuler</button>
        <button type="submit" form="save-document-form" class="btn-primary" :disabled="savingDocument">
          {{ savingDocument ? 'Enregistrement…' : (editingDocument ? 'Enregistrer' : 'Créer') }}
        </button>
      </template>
    </AppModal>

    <ConfirmModal
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      confirm-label="Désactiver"
      danger
      :loading="confirmState.loading"
      size="sm"
      @confirm="runDeactivate"
      @cancel="closeConfirm"
      @close="closeConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Loader2, Search } from 'lucide-vue-next'
import { createAdminDocument, createDocumentType, updateAdminDocument } from '@/api/admin'
import { getPublicDocuments, getPublicDocumentTypes } from '@/api/publicDocuments'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import type { PublicDocument, PublicDocumentType } from '@/models/publicDocuments'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import SheetPagination from '@/components/ui/SheetPagination.vue'
import { usePagination } from '@/composables/usePagination'

const auth = useAuthStore()
const ui = useUIStore()

function docInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const documents = ref<PublicDocument[]>([])
const documentTypes = ref<PublicDocumentType[]>([])
const loading = ref(true)
const loadError = ref('')
const search = ref('')

const showDocumentModal = ref(false)
const showTypeModal = ref(false)
const savingDocument = ref(false)
const creatingType = ref(false)
const documentFormError = ref('')
const typeError = ref('')
const editingDocument = ref<PublicDocument | null>(null)
const deactivatingId = ref<number | null>(null)

const confirmState = reactive<{
  open: boolean
  title: string
  message: string
  loading: boolean
  doc: PublicDocument | null
}>({
  open: false,
  title: '',
  message: '',
  loading: false,
  doc: null,
})

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

const {
  page,
  pageSize,
  total,
  totalPages,
  from,
  to,
  pageItems,
} = usePagination(filteredDocuments, {
  resetOn: () => search.value,
})

function resetCreateForm() {
  editingDocument.value = null
  createForm.documentTypeId = 0
  createForm.title = ''
  createForm.code = ''
  createForm.description = ''
  createForm.active = true
  documentFormError.value = ''
}

function openCreateModal() {
  resetCreateForm()
  showDocumentModal.value = true
}

function closeDocumentModal() {
  showDocumentModal.value = false
  editingDocument.value = null
  documentFormError.value = ''
}

async function openEditModal(doc: PublicDocument) {
  editingDocument.value = doc
  createForm.documentTypeId = doc.type?.documentTypeId ?? 0
  createForm.title = doc.title
  createForm.code = doc.code ?? ''
  createForm.description = doc.description ?? ''
  createForm.active = true
  documentFormError.value = ''
  showDocumentModal.value = true
  await ensureDocumentTypes()
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
    documentFormError.value = 'Impossible de charger les types de document.'
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

function documentPayload() {
  return {
    documentTypeId: createForm.documentTypeId,
    title: createForm.title.trim(),
    code: createForm.code.trim() || undefined,
    description: createForm.description.trim() || undefined,
    active: createForm.active,
  }
}

async function handleSaveDocument() {
  documentFormError.value = ''
  if (!createForm.documentTypeId || !createForm.title.trim()) {
    documentFormError.value = 'Type et titre sont obligatoires.'
    return
  }
  savingDocument.value = true
  try {
    const payload = documentPayload()
    if (editingDocument.value) {
      const res = await updateAdminDocument(editingDocument.value.id, payload)
      ui.toast.success('Document mis à jour', res.message ?? createForm.title)
    } else {
      const res = await createAdminDocument(payload)
      ui.toast.success('Document créé', res.message ?? createForm.title)
    }
    closeDocumentModal()
    await load()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    documentFormError.value = err.response?.data?.message
      ?? (editingDocument.value ? 'Impossible de modifier le document.' : 'Impossible de créer le document.')
  } finally {
    savingDocument.value = false
  }
}

function confirmDeactivate(doc: PublicDocument) {
  confirmState.open = true
  confirmState.title = 'Désactiver le document'
  confirmState.message = `Désactiver « ${doc.title} » ? Il ne sera plus proposé aux citoyens.`
  confirmState.loading = false
  confirmState.doc = doc
}

function closeConfirm() {
  if (confirmState.loading) return
  confirmState.open = false
  confirmState.doc = null
}

async function runDeactivate() {
  const doc = confirmState.doc
  if (!doc) return
  confirmState.loading = true
  deactivatingId.value = doc.id
  try {
    const res = await updateAdminDocument(doc.id, {
      documentTypeId: doc.type?.documentTypeId ?? 0,
      title: doc.title,
      code: doc.code ?? undefined,
      description: doc.description ?? undefined,
      active: false,
    })
    ui.toast.success('Document désactivé', res.message ?? doc.title)
    confirmState.open = false
    confirmState.doc = null
    await load()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    ui.toast.error('Échec', err.response?.data?.message ?? 'Impossible de désactiver le document.')
  } finally {
    confirmState.loading = false
    deactivatingId.value = null
  }
}

onMounted(load)
</script>
