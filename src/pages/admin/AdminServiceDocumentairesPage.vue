<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Services documentaires</h1>
        <p class="text-sm text-gray-500 mt-1">
          Catalogue des services (document + organisme + tarif).
          <span v-if="!listLoading" class="text-gray-400">({{ total }} / {{ services.length }})</span>
        </p>
      </div>

      <button
        v-if="auth.canManageServiceDocumentaires"
        type="button"
        class="btn-primary btn-sm shrink-0"
        @click="openCreateModal"
      >
        Créer un service
      </button>
    </div>

    <div
      v-if="auth.user?.adminOrganismName"
      class="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand"
    >
      Organisme lié à votre compte : <strong>{{ auth.user.adminOrganismName }}</strong>
    </div>

    <div class="sheet-toolbar">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="listSearch"
          type="search"
          class="form-field !pl-10"
          placeholder="Document, commune, ville…"
          autocomplete="off"
        />
      </div>
    </div>

    <p v-if="listError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ listError }}
    </p>

    <LoadingShimmer
      v-if="listLoading"
      variant="table"
      :count="6"
      :columns="auth.canManageServiceDocumentaires ? 5 : 4"
    />

    <div v-else class="sheet">
      <div class="sheet-scroll">
        <table class="sheet-table min-w-[780px]">
          <thead>
            <tr>
              <th>Service</th>
              <th>Organisme</th>
              <th>Prix</th>
              <th>Délai</th>
              <th v-if="auth.canManageServiceDocumentaires" class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in pageItems" :key="s.serviceDocumentaireId">
              <td>
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sheet-avatar" aria-hidden="true">
                    {{ docInitials(s.document.title) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ s.document.title }}</p>
                    <p class="text-[11px] text-gray-400 font-mono">
                      #{{ s.serviceDocumentaireId }}
                      <span v-if="s.document.code"> · {{ s.document.code }}</span>
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <p class="font-medium text-gray-900">{{ s.organism.name }}</p>
                <p class="text-xs text-gray-500">
                  {{ s.organism.city || '-' }}
                  <span v-if="s.organism.type?.name"> · {{ s.organism.type.name }}</span>
                </p>
              </td>
              <td>
                <span class="sheet-pill sheet-pill--ok whitespace-nowrap">
                  {{ formatServicePrice(s.price, s.deviseId) }}
                </span>
              </td>
              <td>{{ s.delayDayOpen || '-' }}</td>
              <td v-if="auth.canManageServiceDocumentaires">
                <div class="sheet-actions">
                  <button
                    v-if="canEditService(s)"
                    type="button"
                    class="sheet-btn sheet-btn--primary"
                    @click="openEditModal(s)"
                  >
                    Modifier
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredServices.length" class="sheet-empty">
        Aucun service documentaire trouvé.
      </p>
      <SheetPagination
        v-else
        v-model:page="page"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="total"
        :from="from"
        :to="to"
      />
    </div>

    <AppModal
      :open="showServiceModal"
      :title="editingService ? 'Modifier le service documentaire' : 'Créer un service documentaire'"
      subtitle="Associez un document à un organisme avec tarif et délai."
      size="lg"
      @close="closeServiceModal"
    >
      <form id="service-doc-form" class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="form-label">Document</label>
          <select v-model.number="form.documentId" class="form-field" required>
            <option :value="0" disabled>Sélectionnez un document</option>
            <option v-for="d in documents" :key="d.id" :value="d.id">
              {{ d.title }}
            </option>
          </select>
          <p v-if="formDataLoading" class="mt-1 text-xs text-gray-400">Chargement…</p>
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
          <p v-if="organismLocked" class="mt-1 text-xs text-gray-500">
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
          <div class="flex flex-wrap items-center gap-2">
            <input
              v-model.number="form.delayFrom"
              type="number"
              min="1"
              step="1"
              class="form-field max-w-[6.5rem]"
              placeholder="Ex. 5"
              :required="!form.delayTo"
            />
            <span class="text-sm text-gray-500 shrink-0">à</span>
            <input
              v-model.number="form.delayTo"
              type="number"
              min="1"
              step="1"
              class="form-field max-w-[6.5rem]"
              placeholder="Ex. 10"
              :required="!form.delayFrom"
            />
            <select v-model="form.delayUnit" class="form-field max-w-[9rem]" required>
              <option
                v-for="opt in DELAY_UNIT_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <p class="mt-1 text-xs text-gray-400">
            Exemple : 5 à 10 jours · 2 à 3 semaines · 1 à 2 mois.
          </p>
        </div>
        <div>
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-field min-h-[80px]" placeholder="Optionnel" />
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-outline" @click="closeServiceModal">Annuler</button>
        <button type="submit" form="service-doc-form" class="btn-primary" :disabled="submitting">
          {{ submitting ? 'Enregistrement…' : (editingService ? 'Enregistrer' : 'Créer') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useServicesStore } from '@/stores/services'
import { usePublicOrganismsStore } from '@/stores/publicOrganisms'
import { useUIStore } from '@/stores/ui'
import { getPublicDocuments } from '@/api/publicDocuments'
import { getPublicServicesDocumentaires } from '@/api/publicServiceDocumentaire'
import { createServiceDocumentaire, updateServiceDocumentaire } from '@/api/serviceDocumentaire'
import { DEVISE_IDS, DEVISE_OPTIONS, formatServicePrice } from '@/data/devises'
import type { PublicDocument } from '@/models/publicDocuments'
import type { PublicServiceDocumentaire } from '@/models/publicServiceDocumentaire'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'
import AppModal from '@/components/ui/AppModal.vue'
import SheetPagination from '@/components/ui/SheetPagination.vue'
import { usePagination } from '@/composables/usePagination'

const auth = useAuthStore()
const servicesStore = useServicesStore()
const organismsStore = usePublicOrganismsStore()
const ui = useUIStore()

function docInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'S'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const services = ref<PublicServiceDocumentaire[]>([])
const listLoading = ref(true)
const listError = ref('')
const listSearch = ref('')

const showServiceModal = ref(false)
const editingService = ref<PublicServiceDocumentaire | null>(null)
const formDataLoading = ref(false)
const submitting = ref(false)
const formError = ref('')

const documents = ref<PublicDocument[]>([])

type DelayUnit = 'jours' | 'semaines' | 'mois'

const DELAY_UNIT_OPTIONS: { value: DelayUnit; label: string }[] = [
  { value: 'jours', label: 'jours' },
  { value: 'semaines', label: 'semaines' },
  { value: 'mois', label: 'mois' },
]

const form = reactive<{
  documentId: number
  organismId: number
  devise: number
  price: number
  delayFrom: number | null
  delayTo: number | null
  delayUnit: DelayUnit
  description: string
}>({
  documentId: 0,
  organismId: 0,
  devise: DEVISE_IDS.FC,
  price: 0,
  delayFrom: null,
  delayTo: null,
  delayUnit: 'jours',
  description: '',
})

function unitLabel(unit: DelayUnit, n: number): string {
  if (unit === 'mois') return 'mois'
  if (unit === 'semaines') return n > 1 ? 'semaines' : 'semaine'
  return n > 1 ? 'jours' : 'jour'
}

function detectDelayUnit(raw: string): DelayUnit {
  const s = raw.toLowerCase()
  if (/semaines?/.test(s)) return 'semaines'
  if (/mois/.test(s)) return 'mois'
  return 'jours'
}

/** Parse "5 à 10 jours", "2 semaines", etc. → { from, to, unit }. */
function parseDelayRange(raw: string): {
  from: number | null
  to: number | null
  unit: DelayUnit
} {
  const unit = detectDelayUnit(raw)
  const nums = (raw.match(/\d+/g) ?? []).map(Number).filter(n => Number.isFinite(n) && n > 0)
  if (nums.length === 0) return { from: null, to: null, unit }
  if (nums.length === 1) return { from: nums[0]!, to: null, unit }
  return {
    from: Math.min(nums[0]!, nums[1]!),
    to: Math.max(nums[0]!, nums[1]!),
    unit,
  }
}

function asPositiveInt(v: number | null | undefined): number | null {
  if (v == null || !Number.isFinite(v) || v <= 0) return null
  return Math.floor(v)
}

/** Ex. "5 à 10 jours", "3 semaines", "1 à 2 mois". */
function formatDelayRange(
  from: number | null,
  to: number | null,
  unit: DelayUnit,
): string {
  const a = asPositiveInt(from)
  const b = asPositiveInt(to)
  if (a != null && b != null) {
    if (a === b) return `${a} ${unitLabel(unit, a)}`
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    return `${lo} à ${hi} ${unitLabel(unit, hi)}`
  }
  if (a != null) return `${a} ${unitLabel(unit, a)}`
  if (b != null) return `${b} ${unitLabel(unit, b)}`
  return ''
}

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

const {
  page,
  pageSize,
  total,
  totalPages,
  from,
  to,
  pageItems,
} = usePagination(filteredServices, {
  resetOn: () => listSearch.value,
})

function extractErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string; detailMessage?: string } } }
  return err.response?.data?.message
    ?? err.response?.data?.detailMessage
    ?? 'Impossible d’enregistrer le service.'
}

function canEditService(s: PublicServiceDocumentaire) {
  const oid = auth.user?.adminOrganismId
  if (auth.user?.role === 'commune_admin' && oid != null) {
    return s.organism.id === oid
  }
  return true
}

function resetForm() {
  editingService.value = null
  form.documentId = 0
  form.organismId = auth.user?.adminOrganismId ?? 0
  form.devise = DEVISE_IDS.FC
  form.price = 0
  form.delayFrom = null
  form.delayTo = null
  form.delayUnit = 'jours'
  form.description = ''
  formError.value = ''
}

function closeServiceModal() {
  showServiceModal.value = false
  editingService.value = null
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
  showServiceModal.value = true
  await loadFormData()
}

async function openEditModal(service: PublicServiceDocumentaire) {
  editingService.value = service
  form.documentId = service.document.documentId
  form.organismId = service.organism.id
  form.devise = service.deviseId
  form.price = service.price
  {
    const d = parseDelayRange(service.delayDayOpen ?? '')
    form.delayFrom = d.from
    form.delayTo = d.to
    form.delayUnit = d.unit
  }
  form.description = service.description ?? ''
  formError.value = ''
  showServiceModal.value = true
  await loadFormData()
}

function servicePayload() {
  return {
    documentId: form.documentId,
    organismId: form.organismId,
    price: form.price,
    devise: form.devise,
    delayDayOpen: formatDelayRange(form.delayFrom, form.delayTo, form.delayUnit),
    description: form.description.trim(),
  }
}

async function handleSubmit() {
  formError.value = ''

  if (!form.documentId || !form.organismId) {
    formError.value = 'Sélectionnez un document et un organisme.'
    return
  }

  const delay = formatDelayRange(form.delayFrom, form.delayTo, form.delayUnit)
  if (!delay) {
    formError.value = 'Indiquez un délai (ex. 5 à 10 jours).'
    return
  }

  submitting.value = true
  try {
    const payload = servicePayload()
    const res = editingService.value
      ? await updateServiceDocumentaire(editingService.value.serviceDocumentaireId, payload)
      : await createServiceDocumentaire(payload)
    ui.toast.success(
      editingService.value ? 'Service mis à jour' : 'Service créé',
      res.message || 'Enregistrement réussi.',
    )
    closeServiceModal()
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
