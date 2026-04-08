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
        <p class="text-blue-200 text-sm mb-6">{{ filteredServices.length }} services disponibles</p>
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
          <select v-model="localCategory" @change="store.setCategory(localCategory || null)" class="form-field sm:w-56">
            <option value="">Toutes les catégories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="page-container py-10">
      <div
        v-if="filteredServices.length"
        v-reveal="{ stagger: '> a', staggerMs: 75, variant: 'up', duration: 720 }"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <ServiceCard v-for="svc in filteredServices" :key="svc.id" :service="svc" />
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
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Search, SearchX } from 'lucide-vue-next'
import { useServicesStore } from '@/stores/services'
import ServiceCard from '@/components/services/ServiceCard.vue'

import jaguarImg from '@/assets/Jaguar.jfif'

const store = useServicesStore()
const { categories, filteredServices } = storeToRefs(store)

const localSearch   = ref(store.searchQuery)
const localCategory = ref(store.activeCategory || '')

watch(localSearch, v => { store.setSearch(v) })
watch(localCategory, v => { store.setCategory(v || null) })

onMounted(() => {
  localSearch.value = store.searchQuery
  localCategory.value = store.activeCategory || ''
})

function reset() {
  localSearch.value = ''
  localCategory.value = ''
  store.setSearch('')
  store.setCategory(null)
}
</script>
