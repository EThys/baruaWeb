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
        <p class="text-blue-200 text-sm mb-2">{{ listHeading }}</p>
        <p v-if="selectedLocalityLabel" class="text-blue-100/90 text-sm mb-6">
          Services pour : <span class="font-semibold">{{ selectedLocalityLabel }}</span>
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
          <select v-model="localCommuneName" class="form-field sm:w-56" aria-label="Filtrer par commune">
            <option value="">Toutes les communes</option>
            <option v-for="c in communesFromServices" :key="c.name" :value="c.name">
              {{ c.name }}{{ c.city ? ` (${c.city})` : '' }}
            </option>
          </select>
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
      <div
        v-if="error && !loading"
        class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 mb-6"
      >
        Impossible de charger les services depuis l’API. Affichage d’une liste par défaut.
      </div>

      <div v-if="loading && !displayServices.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i" class="rounded-xl border border-gray-200 bg-white p-5">
          <div class="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
          <div class="h-3 w-full bg-gray-100 rounded mt-3 animate-pulse" />
          <div class="h-3 w-5/6 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
      </div>

      <template v-else-if="displayServices.length">
        <p
          v-if="documentPickerTitle"
          class="text-sm text-gray-600 mb-6 rounded-xl border border-brand/15 bg-brand/5 px-4 py-3"
        >
          {{ documentPickerTitle }}
          <button type="button" class="ml-2 text-brand font-medium underline" @click="clearDocumentFilter">
            Voir tous les types
          </button>
        </p>
        <div
          v-reveal="{ stagger: '> a', staggerMs: 75, variant: 'up', duration: 720 }"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <ServiceCard v-for="svc in pagedServices" :key="svc.id" :service="svc" />
        </div>

        <div v-if="displayServices.length > PAGE_SIZE" class="mt-10 flex items-center justify-center gap-2 flex-wrap">
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
      </template>

      <div v-else-if="!loading" class="text-center py-20">
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
import { useRoute, useRouter } from 'vue-router'
import { useServicesStore } from '@/stores/services'
import ServiceCard from '@/components/services/ServiceCard.vue'
import { docTypeIdToCategorySlug } from '@/utils/docType'
import { usePublicDocumentsStore } from '@/stores/publicDocuments'

import jaguarImg from '@/assets/Jaguar.jfif'

const store = useServicesStore()
const { filteredServices, catalogServices, loading, error, communesFromServices } = storeToRefs(store)
const route = useRoute()
const router = useRouter()
const publicDocs = usePublicDocumentsStore()
const { documentTypes } = storeToRefs(publicDocs)

const localSearch = ref(store.searchQuery)
const localDocTypeId = ref('')
const localCommuneName = ref('')
const selectedLocalityLabel = computed(() => {
  const name = (route.query.localityName as string | undefined) ?? ''
  const type = (route.query.localityType as string | undefined) ?? ''
  if (!name) return ''
  return type ? `${type} — ${name}` : name
})

const activeDocumentId = ref<number | null>(null)

const displayServices = computed(() => {
  if (activeDocumentId.value != null) {
    return filteredServices.value.filter(s => s.documentId === activeDocumentId.value)
  }
  return catalogServices.value
})

const documentPickerTitle = computed(() => {
  if (activeDocumentId.value == null) return ''
  const first = displayServices.value[0]
  if (!first) return ''
  const n = displayServices.value.length
  return `Choisissez votre commune pour « ${first.title} » (${n} offre${n > 1 ? 's' : ''}).`
})

const listHeading = computed(() => {
  const n = displayServices.value.length
  if (activeDocumentId.value != null) {
    return `${n} commune${n > 1 ? 's' : ''} proposent ce document`
  }
  return `${n} type${n > 1 ? 's' : ''} de documents disponibles`
})

const PAGE_SIZE = 12
const page = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(displayServices.value.length / PAGE_SIZE)))
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const pagedServices = computed(() => {
  const p = Math.min(page.value, totalPages.value)
  const start = (p - 1) * PAGE_SIZE
  return displayServices.value.slice(start, start + PAGE_SIZE)
})

function clearDocumentFilter() {
  activeDocumentId.value = null
  page.value = 1
  const q = { ...route.query }
  delete q.documentId
  router.replace({ query: q })
}

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
watch(localCommuneName, name => {
  const commune = communesFromServices.value.find(
    c => c.name.toLocaleLowerCase('fr') === name.trim().toLocaleLowerCase('fr'),
  )
  store.setLocalityFilter({
    organismId: commune?.id && commune.id > 0 ? commune.id : null,
    organismName: name.trim() || null,
  })
  page.value = 1
})
watch(displayServices, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

function applyRouteFilters() {
  const documentId = Number(route.query.documentId)
  activeDocumentId.value = Number.isFinite(documentId) && documentId > 0 ? documentId : null

  const docTypeId = Number(route.query.docTypeId)
  if (Number.isFinite(docTypeId) && docTypeId > 0) {
    store.setCategory(docTypeIdToCategorySlug(docTypeId))
    localDocTypeId.value = String(docTypeId)
  } else {
    store.setCategory(null)
    localDocTypeId.value = ''
  }

  const localityId = Number(route.query.localityId)
  const localityName = ((route.query.localityName as string | undefined) ?? '').trim()
  localCommuneName.value = localityName
  store.setLocalityFilter({
    organismId: Number.isFinite(localityId) && localityId > 0 ? localityId : null,
    organismName: localityName || null,
  })
  page.value = 1
}

onMounted(() => {
  store.fetchServicesFromPublicDocuments()
  publicDocs.fetchDocumentTypes()
  localSearch.value = store.searchQuery
  applyRouteFilters()
})

watch(
  () => [route.query.documentId, route.query.docTypeId, route.query.localityId, route.query.localityName],
  () => applyRouteFilters(),
)

function reset() {
  localSearch.value = ''
  localDocTypeId.value = ''
  localCommuneName.value = ''
  activeDocumentId.value = null
  store.setSearch('')
  store.setCategory(null)
  store.setLocalityFilter({ organismId: null, organismName: null })
  page.value = 1
}
</script>
