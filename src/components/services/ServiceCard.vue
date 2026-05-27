<template>
  <RouterLink :to="cardTo" class="card p-6 flex flex-col h-full group hover:border-gray-200 hover:shadow-md transition-all duration-300 relative overflow-hidden">

    <!-- Subtle jacquard texture -->
    <div class="absolute inset-0 jacquard-bg opacity-5 pointer-events-none" />

    <!-- Icon + badges -->
    <div class="flex items-start justify-between mb-5 relative z-10">
      <div class="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center transition-colors duration-300 shadow-sm group-hover:bg-gray-200/80">
        <FileText :size="22" stroke-width="1.5" />
      </div>
      <div class="flex gap-1.5 flex-wrap justify-end">
        <span
          v-if="service.isPopular"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/5 text-brand border border-brand/15"
        >
          Populaire
        </span>
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-brand border border-gray-200"
        >
          {{ priceBadge }}
        </span>
      </div>
    </div>

    <!-- Title + description -->
    <div class="relative z-10 flex-1 flex flex-col">
      <template v-if="communeLabel">
        <h3 class="font-display font-semibold text-gray-900 text-lg transition-colors leading-tight mb-1 flex items-start gap-1.5">
          <MapPin :size="18" class="shrink-0 text-brand mt-0.5" />
          <span>{{ communeLabel }}</span>
        </h3>
        <p class="text-xs text-gray-500 mb-2">{{ service.title }}</p>
      </template>
      <template v-else>
        <h3 class="font-display font-semibold text-gray-900 text-lg transition-colors leading-tight mb-1">
          {{ service.title }}
        </h3>
        <p v-if="service.offeringCount && service.offeringCount > 1" class="text-xs font-medium text-brand/80 mb-1">
          {{ service.offeringCount }} communes
        </p>
      </template>
      <p class="text-sm text-gray-500 flex-1 leading-relaxed line-clamp-2">
        {{ service.shortDescription }}
      </p>
    </div>

    <!-- Meta -->
    <div class="mt-5 pt-4 border-t border-gray-100/80 flex items-center justify-between text-xs font-medium text-gray-500 relative z-10">
      <div class="flex items-center gap-1.5 text-gray-500 transition-colors">
        <Clock :size="14" class="text-gray-400" />
        <span>{{ service.estimatedDuration }}</span>
      </div>
      <span class="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
        {{ service.isCatalogEntry ? 'Choisir une commune' : 'Voir détails' }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Clock, FileText, MapPin } from 'lucide-vue-next'
import type { Service } from '@/types'
import { formatServiceCost } from '@/data/devises'
import { serviceCardTo } from '@/utils/serviceCatalog'
import { formatOrganismPlaceName } from '@/utils/organismDisplay'

const props = defineProps<{ service: Service }>()

const cardTo = computed(() => serviceCardTo(props.service))

const communeLabel = computed(() => {
  if (props.service.isCatalogEntry) return ''
  return formatOrganismPlaceName(
    props.service.organismTypeName,
    props.service.organismName,
    props.service.organismCity,
  )
})

const priceBadge = computed(() => {
  if (props.service.costLabel) return props.service.costLabel
  if (props.service.cost === 0 || props.service.cost === undefined) return 'Gratuit'
  return formatServiceCost(props.service.cost, props.service.currency)
})
</script>
