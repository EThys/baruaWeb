<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display font-bold text-2xl text-gray-900">Demandes</h1>
      <p class="text-sm text-gray-500 mt-1">
        Valider, annuler, ou demander des compléments au citoyen.
        <span v-if="!store.loading" class="text-gray-400">({{ total }} / {{ store.requests.length }})</span>
      </p>
    </div>

    <div class="sheet-toolbar">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="q"
          type="search"
          class="form-field !pl-10"
          placeholder="Référence, service, auteur…"
          autocomplete="off"
        />
      </div>
      <select v-model="filter" class="form-field sm:w-52">
        <option
          v-for="f in filters"
          :key="String(f.value)"
          :value="f.value"
        >
          {{ f.label }} ({{ f.count }})
        </option>
      </select>
    </div>

    <LoadingShimmer v-if="store.loading" variant="table" :count="6" :columns="5" />

    <div v-else class="sheet">
      <div class="sheet-scroll">
        <table class="sheet-table min-w-[720px]">
          <thead>
            <tr>
              <th>Demande</th>
              <th>Auteur</th>
              <th>Date</th>
              <th>Statut</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pageItems" :key="r.id">
              <td>
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sheet-avatar" aria-hidden="true">
                    {{ requestInitials(r.serviceName) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ r.serviceName }}</p>
                    <p class="text-[11px] text-gray-400 font-mono">{{ r.referenceNumber }}</p>
                  </div>
                </div>
              </td>
              <td>
                <p class="font-medium text-gray-900 truncate max-w-[180px]">
                  {{ authorLabel(r) }}
                </p>
                <p v-if="r.applicantPhone || r.applicantEmail" class="text-xs text-gray-500 truncate max-w-[180px]">
                  {{ r.applicantPhone || r.applicantEmail }}
                </p>
              </td>
              <td class="whitespace-nowrap text-gray-600">{{ formatDate(r.createdAt) }}</td>
              <td>
                <StatusBadge :status="r.status" />
              </td>
              <td>
                <div class="sheet-actions">
                  <RouterLink
                    :to="`/admin/demandes/${r.id}`"
                    class="sheet-btn sheet-btn--primary"
                  >
                    Ouvrir
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filtered.length" class="sheet-empty">
        Aucune demande ne correspond aux filtres actuels.
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { useRequestsStore } from '@/stores/requests'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'
import SheetPagination from '@/components/ui/SheetPagination.vue'
import { usePagination } from '@/composables/usePagination'
import type { RequestStatus } from '@/types'

const store = useRequestsStore()

onMounted(() => { void store.fetchRequests() })

const q = ref('')
const filter = ref<RequestStatus | 'all' | 'open'>('open')

function requestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function authorLabel(r: {
  applicantName?: string
  applicantUsername?: string
  applicantEmail?: string
  userId?: string
  formData?: Record<string, unknown>
}) {
  if (r.applicantName) return r.applicantName
  const formName = typeof r.formData?.fullName === 'string' ? r.formData.fullName : ''
  if (formName) return formName
  if (r.applicantUsername) return `@${r.applicantUsername.replace(/^@+/, '')}`
  if (r.applicantEmail) return r.applicantEmail
  if (r.userId) return `Utilisateur #${r.userId}`
  return 'Inconnu'
}

const filtered = computed(() => {
  let list = store.requests
  if (filter.value === 'open') {
    list = list.filter(r => !['approuvee', 'rejetee', 'annulee'].includes(r.status))
  } else if (filter.value !== 'all') {
    list = list.filter(r => r.status === filter.value)
  }

  const query = q.value.trim().toLowerCase()
  if (!query) return list
  return list.filter(r =>
    r.referenceNumber.toLowerCase().includes(query)
    || r.serviceName.toLowerCase().includes(query)
    || (r.applicantName ?? '').toLowerCase().includes(query)
    || (r.applicantEmail ?? '').toLowerCase().includes(query)
    || (r.applicantPhone ?? '').toLowerCase().includes(query)
    || (typeof r.formData?.fullName === 'string' && r.formData.fullName.toLowerCase().includes(query)),
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
} = usePagination(filtered, {
  resetOn: () => [q.value, filter.value],
})

const filters = computed(() => {
  const counts = {
    all: store.requests.length,
    open: store.requests.filter(r => !['approuvee', 'rejetee', 'annulee'].includes(r.status)).length,
    soumise: store.requests.filter(r => r.status === 'soumise').length,
    en_cours: store.requests.filter(r => r.status === 'en_cours').length,
    en_attente_document: store.requests.filter(r => r.status === 'en_attente_document').length,
    approuvee: store.requests.filter(r => r.status === 'approuvee').length,
    rejetee: store.requests.filter(r => r.status === 'rejetee').length,
    annulee: store.requests.filter(r => r.status === 'annulee').length,
  }
  return [
    { label: 'Ouvertes', value: 'open' as const, count: counts.open },
    { label: 'Toutes', value: 'all' as const, count: counts.all },
    { label: 'Soumises', value: 'soumise' as const, count: counts.soumise },
    { label: 'En cours', value: 'en_cours' as const, count: counts.en_cours },
    { label: 'Complément', value: 'en_attente_document' as const, count: counts.en_attente_document },
    { label: 'Approuvées', value: 'approuvee' as const, count: counts.approuvee },
    { label: 'Rejetées', value: 'rejetee' as const, count: counts.rejetee },
    { label: 'Annulées', value: 'annulee' as const, count: counts.annulee },
  ]
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
