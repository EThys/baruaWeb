<template>
  <div>
    <!-- Hero -->
    <div class="hero-overlay py-10 relative overflow-hidden">
      <div class="absolute inset-0 jacquard-hero opacity-20 pointer-events-none" />
      <img
        :src="animalImg"
        alt=""
        class="absolute -right-24 top-6 w-64 h-64 object-cover grayscale opacity-5 blur-3xl pointer-events-none select-none"
      />
      <div class="page-container relative">
        <nav class="flex items-center gap-2 text-xs text-blue-200 mb-4">
          <RouterLink to="/" class="hover:text-white">Accueil</RouterLink>
          <ChevronRight :size="12" />
          <RouterLink to="/services" class="hover:text-white">Services</RouterLink>
          <ChevronRight :size="12" />
          <span class="text-white">{{ category?.name }}</span>
        </nav>
        <h1 class="font-display font-bold text-white text-3xl">{{ category?.name }}</h1>
        <p class="text-blue-100 text-sm mt-2">{{ category?.description }}</p>
      </div>
    </div>

    <div class="page-container py-10">
      <div v-if="categoryServices.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ServiceCard v-for="svc in categoryServices" :key="svc.id" :service="svc" />
      </div>
      <div v-else class="text-center py-20">
        <Inbox :size="48" class="text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">Aucun service dans cette catégorie pour l'instant.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronRight, Inbox } from 'lucide-vue-next'
import { useServicesStore } from '@/stores/services'
import { groupServicesByDocument } from '@/utils/serviceCatalog'
import ServiceCard from '@/components/services/ServiceCard.vue'

import animalImg from '@/assets/Animal.jfif'

const route = useRoute()
const store = useServicesStore()

const slug             = computed(() => route.params.categorySlug as string)
const category         = computed(() => store.getCategoryBySlug(slug.value))
const categoryServices = computed(() => {
  const list = store.getServicesByCategory(slug.value)
  if (store.activeOrganismId != null || store.activeOrganismName) return list
  return groupServicesByDocument(list)
})
</script>
