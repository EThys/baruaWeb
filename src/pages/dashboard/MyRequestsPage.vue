<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Mes demandes</h1>
        <p class="text-sm text-gray-500 mt-1">
          Suivi de vos dossiers administratifs.
          <span v-if="!store.loading" class="text-gray-400">({{ total }} / {{ store.requests.length }})</span>
        </p>
      </div>
      <RouterLink to="/services" class="btn-primary btn-sm shrink-0">
        <Plus :size="16" /> Nouvelle demande
      </RouterLink>
    </div>

    <div class="sheet-toolbar">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="q"
          type="search"
          class="form-field !pl-10"
          placeholder="Référence, service…"
          autocomplete="off"
        />
      </div>
      <select
        :value="store.filterStatus"
        class="form-field sm:w-52"
        @change="onFilterChange"
      >
        <option
          v-for="f in filters"
          :key="String(f.value)"
          :value="f.value"
        >
          {{ f.label }} ({{ f.count }})
        </option>
      </select>
    </div>

    <p
      v-if="store.error && !store.loading"
      class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {{ store.error }}
    </p>

    <LoadingShimmer v-if="store.loading" variant="table" :count="6" :columns="4" />

    <div v-else class="sheet">
      <div class="sheet-scroll">
        <table class="sheet-table min-w-[680px]">
          <thead>
            <tr>
              <th>Demande</th>
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
              <td class="whitespace-nowrap text-gray-600">{{ formatDate(r.createdAt) }}</td>
              <td>
                <StatusBadge :status="r.status" />
              </td>
              <td>
                <div class="sheet-actions">
                  <RouterLink
                    :to="`/dashboard/mes-demandes/${r.id}`"
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
        Aucune demande trouvée.
        <RouterLink to="/services" class="text-brand font-medium hover:underline ml-1">
          Faire une demande
        </RouterLink>
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
import { Plus, Search } from 'lucide-vue-next'
import { useRequestsStore } from '@/stores/requests'
import type { RequestStatus } from '@/types'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'
import SheetPagination from '@/components/ui/SheetPagination.vue'
import { usePagination } from '@/composables/usePagination'

const store = useRequestsStore()
const q = ref('')

onMounted(() => { void store.fetchRequests() })

function requestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function onFilterChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as RequestStatus | 'all'
  store.setFilterStatus(value)
}

const filtered = computed(() => {
  let list = store.filteredRequests
  const query = q.value.trim().toLowerCase()
  if (!query) return list
  return list.filter(r =>
    r.referenceNumber.toLowerCase().includes(query)
    || r.serviceName.toLowerCase().includes(query),
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
  resetOn: () => [q.value, store.filterStatus],
})

const filters = computed(() => {
  const list: { label: string; value: RequestStatus | 'all'; count: number }[] = [
    { label: 'Toutes', value: 'all', count: store.requests.length },
    { label: 'Soumises', value: 'soumise', count: store.stats.pending },
    { label: 'En cours', value: 'en_cours', count: store.stats.inProgress },
    { label: 'Approuvées', value: 'approuvee', count: store.stats.approved },
    { label: 'Rejetées', value: 'rejetee', count: store.stats.rejected },
  ]
  return list
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
