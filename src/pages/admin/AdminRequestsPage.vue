<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Demandes</h1>
        <p class="text-sm text-gray-500 mt-1">Valider, annuler, ou demander des compléments au citoyen.</p>
      </div>

      <div class="w-full sm:w-[360px]">
        <label class="label-text">Recherche</label>
        <div class="relative">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="q" class="input-field pl-10" placeholder="Référence, service…" />
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        class="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
        :class="filter === f.value
          ? 'bg-brand text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="filter = f.value"
      >
        {{ f.label }}
        <span class="ml-1 opacity-70">({{ f.count }})</span>
      </button>
    </div>

    <div class="space-y-3">
      <RouterLink
        v-for="r in visible"
        :key="r.id"
        :to="`/admin/demandes/${r.id}`"
        class="card p-5 flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all"
      >
        <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <FileText :size="22" class="text-brand" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 truncate">{{ r.serviceName }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ r.referenceNumber }} · {{ formatDate(r.createdAt) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <StatusBadge :status="r.status" />
          <ChevronRight :size="16" class="text-gray-300" />
        </div>
      </RouterLink>

      <div v-if="visible.length === 0" class="card p-12 text-center">
        <Inbox :size="44" class="text-gray-200 mx-auto mb-3" />
        <p class="text-gray-600 font-medium">Aucune demande</p>
        <p class="text-sm text-gray-500 mt-1">Aucun résultat pour les filtres actuels.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronRight, FileText, Inbox, Search } from 'lucide-vue-next'
import { useRequestsStore } from '@/stores/requests'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'
import type { RequestStatus } from '@/types'

const store = useRequestsStore()

const q = ref('')
const filter = ref<RequestStatus | 'all' | 'open'>('open')

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
    r.referenceNumber.toLowerCase().includes(query) ||
    r.serviceName.toLowerCase().includes(query),
  )
})

const visible = computed(() => filtered.value.slice(0, 50))

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
    brouillon: store.requests.filter(r => r.status === 'brouillon').length,
  }
  return [
    { label: 'Ouvertes', value: 'open', count: counts.open },
    { label: 'Toutes', value: 'all', count: counts.all },
    { label: 'Soumises', value: 'soumise', count: counts.soumise },
    { label: 'En cours', value: 'en_cours', count: counts.en_cours },
    { label: 'Complément', value: 'en_attente_document', count: counts.en_attente_document },
    { label: 'Approuvées', value: 'approuvee', count: counts.approuvee },
    { label: 'Rejetées', value: 'rejetee', count: counts.rejetee },
    { label: 'Annulées', value: 'annulee', count: counts.annulee },
  ] as { label: string; value: typeof filter.value; count: number }[]
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

