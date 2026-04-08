<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display font-bold text-2xl text-gray-900">Mes demandes</h1>
      <RouterLink to="/services" class="btn-primary btn-sm">
        <Plus :size="16" /> Nouvelle demande
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="store.setFilterStatus(f.value)"
        class="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
        :class="store.filterStatus === f.value
          ? 'bg-brand text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        {{ f.label }}
        <span v-if="f.count !== undefined" class="ml-1 opacity-70">({{ f.count }})</span>
      </button>
    </div>

    <!-- List -->
    <div class="space-y-3">
      <RouterLink
        v-for="r in store.filteredRequests"
        :key="r.id"
        :to="`/dashboard/mes-demandes/${r.id}`"
        class="card p-5 flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all"
      >
        <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <FileText :size="22" class="text-brand" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 truncate">{{ r.serviceName }}</p>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ r.referenceNumber }} · {{ formatDate(r.createdAt) }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <StatusBadge :status="r.status" />
          <ChevronRight :size="16" class="text-gray-300" />
        </div>
      </RouterLink>

      <div v-if="store.filteredRequests.length === 0"
        class="card p-12 text-center">
        <Inbox :size="48" class="text-gray-200 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Aucune demande trouvée</p>
        <RouterLink to="/services" class="btn-primary mt-4 inline-flex">
          Faire une demande
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { FileText, Plus, ChevronRight, Inbox } from 'lucide-vue-next'
import { useRequestsStore } from '@/stores/requests'
import type { RequestStatus } from '@/types'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'

const store = useRequestsStore()

const filters: { label: string; value: RequestStatus | 'all'; count?: number }[] = [
  { label: 'Toutes',       value: 'all',        count: store.requests.length },
  { label: 'Soumises',     value: 'soumise',    count: store.stats.pending },
  { label: 'En cours',     value: 'en_cours',   count: store.stats.inProgress },
  { label: 'Approuvées',   value: 'approuvee',  count: store.stats.approved },
  { label: 'Rejetées',     value: 'rejetee',    count: store.stats.rejected },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
