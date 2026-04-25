<template>
  <div>
    <!-- Hero -->
    <div class="hero-overlay py-10 relative overflow-hidden">
      <div class="absolute inset-0 jacquard-hero opacity-20 pointer-events-none" />
      <img
        :src="jaguarImg"
        alt=""
        class="absolute -right-36 -top-16 w-[28rem] h-[28rem] object-cover grayscale opacity-5 blur-3xl pointer-events-none select-none"
      />
      <div class="page-container relative">
        <h1 class="font-display font-bold text-white text-3xl mb-2">Tous les services</h1>
        <p class="text-blue-200 text-sm mb-2">{{ filteredServices.length }} services disponibles</p>
        <p v-if="selectedLocalityLabel" class="text-blue-100/90 text-sm mb-6">
          Filtre localité: <span class="font-semibold">{{ selectedLocalityLabel }}</span>
          <span class="text-blue-200/80">— le filtrage “par commune/mairie/ville” sera activé dès que l’API fournit la correspondance.</span>
        </p>
        <div v-else class="mb-6" />
        <!-- Search + filter -->
        <div class="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-stretch">
          <div class="relative min-w-0 flex-1">
            <Search :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="localSearch"
              type="search"
              aria-label="Filtrer les services par mot-clé"
              autocomplete="off"
              placeholder="Mots-clés…"
              class="form-field w-full pl-10 pr-4 max-sm:min-h-[2.75rem]"
            />
          </div>
          <select v-model="localDocTypeId" class="form-field sm:w-64">
            <option value="">Tous les types de documents</option>
            <option v-for="t in documentTypes" :key="t.documentTypeId" :value="String(t.documentTypeId)">
              {{ t.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="page-container py-10">
      <!-- Most requested -->
      <section v-if="showPopular" class="mb-10">
        <div class="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Les plus demandés</h2>
            <p class="text-sm text-gray-500">Les démarches que les citoyens utilisent le plus</p>
          </div>
        </div>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="i in 6" :key="i" class="rounded-xl border border-gray-200 bg-white p-5">
            <div class="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
            <div class="h-3 w-full bg-gray-100 rounded mt-3 animate-pulse" />
            <div class="h-3 w-5/6 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div
          v-else-if="error"
          class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 mb-4"
        >
          Impossible de charger les services depuis l’API. Affichage d’une liste par défaut.
        </div>
        <div v-if="!loading && popularServices.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ServiceCard v-for="svc in popularServices" :key="svc.id" :service="svc" />
        </div>
      </section>

      <div
        v-if="filteredServices.length"
        v-reveal="{ stagger: '> a', staggerMs: 75, variant: 'up', duration: 720 }"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <ServiceCard v-for="svc in pagedServices" :key="svc.id" :service="svc" />
      </div>

      <!-- Pagination -->
      <div v-if="filteredServices.length > PAGE_SIZE" class="mt-10 flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          class="btn-outline btn-sm"
          :disabled="page === 1"
          @click="page = Math.max(1, page - 1)"
        >
          Précédent
        </button>

        <button
          v-for="p in pages"
          :key="p"
          type="button"
          class="btn-outline btn-sm min-w-[2.25rem]"
          :class="p === page ? 'bg-brand/10 border-brand/25 text-brand' : ''"
          @click="page = p"
        >
          {{ p }}
        </button>

        <button
          type="button"
          class="btn-outline btn-sm"
          :disabled="page === totalPages"
          @click="page = Math.min(totalPages, page + 1)"
        >
          Suivant
        </button>
      </div>

      <div v-else class="text-center py-20">
        <SearchX :size="48" class="text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Aucun service trouvé</p>
        <p class="text-gray-400 text-sm mt-1">Essayez un autre terme ou réinitialisez les filtres</p>
        <button @click="reset" class="btn-outline btn-sm mt-4">Réinitialiser</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Search, SearchX } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useServicesStore } from '@/stores/services'
import ServiceCard from '@/components/services/ServiceCard.vue'
import { docTypeIdToCategorySlug } from '@/utils/docType'
import { usePublicDocumentsStore } from '@/stores/publicDocuments'

import jaguarImg from '@/assets/Jaguar.jfif'

const store = useServicesStore()
const { filteredServices, popularServices, loading, error } = storeToRefs(store)
const route = useRoute()
const publicDocs = usePublicDocumentsStore()
const { documentTypes } = storeToRefs(publicDocs)

const localSearch   = ref(store.searchQuery)
const localDocTypeId = ref('')
const selectedLocalityLabel = computed(() => {
  const name = (route.query.localityName as string | undefined) ?? ''
  const type = (route.query.localityType as string | undefined) ?? ''
  if (!name) return ''
  return type ? `${type} — ${name}` : name
})

const PAGE_SIZE = 12
const page = ref(1)

const showPopular = computed(() => !localSearch.value.trim() && !localDocTypeId.value)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredServices.value.length / PAGE_SIZE)))
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const pagedServices = computed(() => {
  const p = Math.min(page.value, totalPages.value)
  const start = (p - 1) * PAGE_SIZE
  return filteredServices.value.slice(start, start + PAGE_SIZE)
})

watch(localSearch, v => {
  store.setSearch(v)
  page.value = 1
})
watch(localDocTypeId, v => {
  const id = Number(v)
  if (Number.isFinite(id) && id > 0) {
    store.setCategory(docTypeIdToCategorySlug(id))
  } else {
    store.setCategory(null)
  }
  page.value = 1
})
watch(filteredServices, () => {
  // Si la liste change (API / filtre), on garde la page dans les bornes.
  if (page.value > totalPages.value) page.value = totalPages.value
})

onMounted(() => {
  store.fetchServicesFromPublicDocuments()
  publicDocs.fetchDocumentTypes()
  localSearch.value = store.searchQuery
  const docTypeId = Number(route.query.docTypeId)
  if (Number.isFinite(docTypeId) && docTypeId > 0) {
    store.setCategory(docTypeIdToCategorySlug(docTypeId))
    localDocTypeId.value = String(docTypeId)
    page.value = 1
  } else {
    localDocTypeId.value = ''
  }
})

function reset() {
  localSearch.value = ''
  localDocTypeId.value = ''
  store.setSearch('')
  store.setCategory(null)
  page.value = 1
}
</script>
