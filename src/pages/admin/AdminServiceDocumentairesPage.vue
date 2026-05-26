<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Services documentaires</h1>
        <p class="text-sm text-gray-500 mt-1">
          Catalogue des services (document + organisme + tarif).
          <span v-if="!listLoading" class="text-gray-400">— {{ filteredServices.length }} service(s)</span>
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div class="w-full sm:w-72">
          <label class="form-label">Recherche</label>
          <input
            v-model="listSearch"
            type="search"
            class="form-field"
            placeholder="Document, commune, ville…"
          />
        </div>
        <button
          v-if="auth.canManageServiceDocumentaires"
          type="button"
          class="btn-primary shrink-0"
          @click="openCreateModal"
        >
          Créer un service
        </button>
      </div>
    </div>

    <div
      v-if="auth.user?.adminOrganismName"
      class="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand"
    >
      Organisme lié à votre compte : <strong>{{ auth.user.adminOrganismName }}</strong>
    </div>

    <p v-if="listError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ listError }}
    </p>

    <div v-if="listLoading" class="text-sm text-gray-500">Chargement des services…</div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[760px]">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100 bg-gray-50/80">
              <th class="py-3 px-4">ID</th>
              <th class="py-3 px-4">Document</th>
              <th class="py-3 px-4">Organisme</th>
              <th class="py-3 px-4">Ville</th>
              <th class="py-3 px-4">Prix</th>
              <th class="py-3 px-4">Délai</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in filteredServices"
              :key="s.serviceDocumentaireId"
              class="border-b border-gray-50 hover:bg-gray-50/50"
            >
              <td class="py-3 px-4 text-gray-500 font-mono text-xs">#{{ s.serviceDocumentaireId }}</td>
              <td class="py-3 px-4">
                <p class="font-medium text-gray-900">{{ s.document.title }}</p>
                <p v-if="s.document.code" class="text-xs text-gray-400 font-mono mt-0.5">{{ s.document.code }}</p>
              </td>
              <td class="py-3 px-4 text-gray-700">
                {{ s.organism.name }}
                <span v-if="s.organism.type?.name" class="block text-xs text-gray-400">
                  {{ s.organism.type.name }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ s.organism.city || '—' }}</td>
              <td class="py-3 px-4 text-gray-800 whitespace-nowrap">
                {{ formatServicePrice(s.price, s.deviseId) }}
              </td>
              <td class="py-3 px-4 text-gray-600">{{ s.delayDayOpen || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredServices.length" class="p-8 text-center text-gray-500">
        Aucun service documentaire trouvé.
      </p>
    </div>

    <!-- Modal création service -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      @click.self="closeCreateModal"
    >
      <div class="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="font-semibold text-gray-900">Créer un service documentaire</h2>
        <p class="text-sm text-gray-500">
          Associez un document à un organisme avec tarif et délai.
        </p>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="form-label">Document</label>
            <select v-model.number="form.documentId" class="form-field" required>
              <option :value="0" disabled>Sélectionnez un document</option>
              <option v-for="d in documents" :key="d.id" :value="d.id">
                {{ d.title }}
              </option>
            </select>
            <p v-if="formDataLoading" class="text-xs text-gray-400 mt-1">Chargement…</p>
          </div>

          <div>
            <label class="form-label">Organisme</label>
            <select
              v-model.number="form.organismId"
              class="form-field"
              required
              :disabled="organismLocked"
            >
              <option :value="0" disabled>Sélectionnez un organisme</option>
              <option v-for="o in organisms" :key="o.id" :value="o.id">
                {{ o.name }}{{ o.city ? ` (${o.city})` : '' }}
              </option>
            </select>
            <p v-if="organismLocked" class="text-xs text-gray-500 mt-1">
              Fixé selon votre profil administrateur commune.
            </p>
          </div>

          <div>
            <label class="form-label">Devise</label>
            <select v-model.number="form.devise" class="form-field" required>
              <option v-for="opt in DEVISE_OPTIONS" :key="opt.id" :value="opt.id">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="form-label">Prix</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="1"
              class="form-field"
              required
              :placeholder="pricePlaceholder"
            />
          </div>

          <div>
            <label class="form-label">Délai d’ouverture</label>
            <input
              v-model="form.delayDayOpen"
              type="text"
              class="form-field"
              placeholder="Ex. Entre 2 à 5 jours"
              required
            />
          </div>

          <div>
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-field min-h-[80px]" placeholder="Optionnel" />
          </div>

          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>

          <div class="flex gap-3 justify-end pt-2">
            <button type="button" class="btn-outline" @click="closeCreateModal">Annuler</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Enregistrement…' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useServicesStore } from '@/stores/services'
import { usePublicOrganismsStore } from '@/stores/publicOrganisms'
import { useUIStore } from '@/stores/ui'
import { getPublicDocuments } from '@/api/publicDocuments'
import { getPublicServicesDocumentaires } from '@/api/publicServiceDocumentaire'
import { createServiceDocumentaire } from '@/api/serviceDocumentaire'
import { DEVISE_IDS, DEVISE_OPTIONS, formatServicePrice } from '@/data/devises'
import type { PublicDocument } from '@/models/publicDocuments'
import type { PublicServiceDocumentaire } from '@/models/publicServiceDocumentaire'

const auth = useAuthStore()
const servicesStore = useServicesStore()
const organismsStore = usePublicOrganismsStore()
const ui = useUIStore()

const services = ref<PublicServiceDocumentaire[]>([])
const listLoading = ref(true)
const listError = ref('')
const listSearch = ref('')

const showCreateModal = ref(false)
const formDataLoading = ref(false)
const submitting = ref(false)
const formError = ref('')

const documents = ref<PublicDocument[]>([])

const form = reactive<{ documentId: number; organismId: number; devise: number; price: number; delayDayOpen: string; description: string }>({
  documentId: 0,
  organismId: 0,
  devise: DEVISE_IDS.FC,
  price: 0,
  delayDayOpen: '',
  description: '',
})

const organisms = computed(() =>
  Array.isArray(organismsStore.organisms) ? organismsStore.organisms : [],
)

const organismLocked = computed(() =>
  auth.user?.role === 'commune_admin' && !!auth.user.adminOrganismId,
)

const pricePlaceholder = computed(() =>
  form.devise === DEVISE_IDS.USD ? 'Montant en USD' : 'Montant en FC',
)

const scopedServices = computed(() => {
  const oid = auth.user?.adminOrganismId
  if (auth.user?.role === 'commune_admin' && oid != null) {
    return services.value.filter(s => s.organism.id === oid)
  }
  return services.value
})

const filteredServices = computed(() => {
  const q = listSearch.value.trim().toLowerCase()
  const base = scopedServices.value
  if (!q) return base
  return base.filter(s =>
    s.document.title.toLowerCase().includes(q)
    || (s.document.code ?? '').toLowerCase().includes(q)
    || s.organism.name.toLowerCase().includes(q)
    || (s.organism.city ?? '').toLowerCase().includes(q)
    || (s.delayDayOpen ?? '').toLowerCase().includes(q),
  )
})

function extractErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string; detailMessage?: string } } }
  return err.response?.data?.message
    ?? err.response?.data?.detailMessage
    ?? 'Impossible d’enregistrer le service.'
}

function resetForm() {
  form.documentId = 0
  form.organismId = auth.user?.adminOrganismId ?? 0
  form.devise = DEVISE_IDS.FC
  form.price = 0
  form.delayDayOpen = ''
  form.description = ''
  formError.value = ''
}

function closeCreateModal() {
  showCreateModal.value = false
  formError.value = ''
}

async function loadServicesList() {
  listLoading.value = true
  listError.value = ''
  try {
    services.value = await getPublicServicesDocumentaires()
  } catch {
    listError.value = 'Impossible de charger la liste des services documentaires.'
    services.value = []
  } finally {
    listLoading.value = false
  }
}

async function loadFormData() {
  formDataLoading.value = true
  try {
    const [docs] = await Promise.all([
      getPublicDocuments(),
      organismsStore.fetchOrganisms(),
    ])
    documents.value = docs
    if (auth.user?.adminOrganismId) {
      form.organismId = auth.user.adminOrganismId
    }
  } catch {
    formError.value = 'Impossible de charger les listes document / organisme.'
  } finally {
    formDataLoading.value = false
  }
}

async function openCreateModal() {
  resetForm()
  showCreateModal.value = true
  await loadFormData()
}

async function handleSubmit() {
  formError.value = ''

  if (!form.documentId || !form.organismId) {
    formError.value = 'Sélectionnez un document et un organisme.'
    return
  }

  submitting.value = true
  try {
    const res = await createServiceDocumentaire({
      documentId: form.documentId,
      organismId: form.organismId,
      price: form.price,
      devise: form.devise,
      delayDayOpen: form.delayDayOpen.trim(),
      description: form.description.trim(),
    })
    ui.toast.success('Service créé', res.message || 'Enregistrement réussi.')
    closeCreateModal()
    await Promise.all([
      servicesStore.fetchServicesFromPublicDocuments({ force: true }),
      loadServicesList(),
    ])
  } catch (e: unknown) {
    formError.value = extractErrorMessage(e)
    ui.toast.error('Échec', formError.value)
  } finally {
    submitting.value = false
  }
}

onMounted(loadServicesList)
</script>
