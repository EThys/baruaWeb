<template>
  <div class="page-container py-12">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <Search :size="22" class="text-brand" />
        <h1 class="font-display font-bold text-2xl text-gray-900">
          Résultats pour
          <span class="text-brand">"{{ query }}"</span>
        </h1>
      </div>
      <p class="text-gray-500 text-sm">
        {{ filteredServices.length }} service(s) trouvé(s)
      </p>
    </div>

    <!-- Search bar -->
    <div class="mb-10 flex max-w-xl gap-2">
      <div class="relative min-w-0 flex-1">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="localQuery"
          type="search"
          aria-label="Rechercher un service"
          placeholder="Mots-clés, ministère…"
          @keyup.enter="doSearch"
          class="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>
      <button
        type="button"
        class="btn-primary inline-flex shrink-0 items-center justify-center rounded-xl p-2.5 sm:px-5 sm:py-2.5"
        aria-label="Lancer la recherche"
        @click="doSearch"
      >
        <Search :size="20" class="sm:hidden" />
        <span class="hidden sm:inline">Rechercher</span>
      </button>
    </div>

    <!-- Results or empty -->
    <div v-if="filteredServices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ServiceCard v-for="s in filteredServices" :key="s.id" :service="s" />
    </div>
    <div v-else class="text-center py-24">
      <FileSearch :size="56" class="text-gray-200 mx-auto mb-4" />
      <p class="text-gray-500 font-medium">Aucun service ne correspond à votre recherche.</p>
      <RouterLink to="/services" class="btn-primary mt-6 inline-flex">Voir tous les services</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Search, FileSearch } from 'lucide-vue-next'
import { useServicesStore } from '@/stores/services'
import { groupServicesByDocument } from '@/utils/serviceCatalog'
import ServiceCard from '@/components/services/ServiceCard.vue'

const route  = useRoute()
const router = useRouter()
const store  = useServicesStore()

const query      = ref((route.query.q as string) || '')
const localQuery = ref(query.value)

const filteredServices = computed(() => {
  const q = query.value.toLowerCase().trim()
  let list = store.services
  if (q) {
    list = list.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.ministry.toLowerCase().includes(q),
    )
  }
  if (store.activeOrganismId != null || store.activeOrganismName) return list
  return groupServicesByDocument(list)
})

function doSearch() {
  query.value = localQuery.value
  router.replace({ name: 'search', query: { q: localQuery.value } })
}

watch(() => route.query.q, v => {
  query.value      = (v as string) || ''
  localQuery.value = query.value
})
</script>
