<template>
  <!-- Stats grid -->
  <div v-if="variant === 'stats'" class="grid grid-cols-2 lg:grid-cols-4 gap-4" role="status" aria-label="Chargement">
    <div v-for="i in count" :key="i" class="card p-5 flex items-center gap-4">
      <Shimmer width="2.5rem" height="2.5rem" rounded="xl" class="shrink-0" />
      <div class="flex-1 space-y-2">
        <Shimmer width="3rem" height="1.25rem" />
        <Shimmer width="70%" height="0.625rem" />
      </div>
    </div>
  </div>

  <!-- Request / notification list cards -->
  <div v-else-if="variant === 'list'" class="space-y-3" role="status" aria-label="Chargement">
    <div v-for="i in count" :key="i" class="card p-5 flex items-center gap-4">
      <Shimmer width="3rem" height="3rem" rounded="xl" class="shrink-0" />
      <div class="flex-1 min-w-0 space-y-2">
        <Shimmer width="55%" height="0.875rem" />
        <Shimmer width="40%" height="0.625rem" />
      </div>
      <Shimmer width="4.5rem" height="1.5rem" rounded="full" class="shrink-0" />
    </div>
  </div>

  <!-- Document cards grid -->
  <div v-else-if="variant === 'cards'" class="grid grid-cols-1 lg:grid-cols-2 gap-4" role="status" aria-label="Chargement">
    <div v-for="i in count" :key="i" class="card p-5 space-y-4">
      <div class="flex items-start gap-4">
        <Shimmer width="2.75rem" height="2.75rem" rounded="xl" class="shrink-0" />
        <div class="flex-1 space-y-2">
          <Shimmer width="70%" height="0.875rem" />
          <Shimmer width="50%" height="0.625rem" />
          <div class="flex gap-2 pt-1">
            <Shimmer width="3.5rem" height="1.25rem" rounded="full" />
            <Shimmer width="3.5rem" height="1.25rem" rounded="full" />
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center pt-1">
        <Shimmer width="35%" height="0.625rem" />
        <Shimmer width="6rem" height="2rem" rounded="lg" />
      </div>
    </div>
  </div>

  <!-- Detail page -->
  <div v-else-if="variant === 'detail'" class="space-y-6" role="status" aria-label="Chargement">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div class="space-y-2 flex-1">
        <Shimmer width="60%" height="1.75rem" />
        <Shimmer width="30%" height="0.75rem" />
      </div>
      <Shimmer width="5rem" height="1.75rem" rounded="full" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 card p-6 space-y-5">
        <Shimmer width="40%" height="1rem" />
        <div v-for="i in 4" :key="i" class="flex gap-4">
          <Shimmer width="1.5rem" height="1.5rem" rounded="full" class="shrink-0" />
          <div class="flex-1 space-y-2">
            <Shimmer width="45%" height="0.75rem" />
            <Shimmer width="30%" height="0.5rem" />
            <Shimmer width="80%" height="2rem" rounded="lg" />
          </div>
        </div>
      </div>
      <div class="card p-5 space-y-3">
        <Shimmer width="50%" height="0.875rem" />
        <Shimmer width="100%" height="0.75rem" />
        <Shimmer width="100%" height="0.75rem" />
        <Shimmer width="100%" height="0.75rem" />
      </div>
    </div>
  </div>

  <!-- Table rows -->
  <div v-else-if="variant === 'table'" class="card overflow-hidden" role="status" aria-label="Chargement">
    <div class="overflow-x-auto">
      <table class="w-full text-sm min-w-[640px]">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/80">
            <th v-for="c in columns" :key="c" class="py-3 px-4">
              <Shimmer width="70%" height="0.625rem" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in count" :key="i" class="border-b border-gray-50">
            <td v-for="c in columns" :key="`${i}-${c}`" class="py-3 px-4">
              <Shimmer :width="c === columns - 1 ? '40%' : '75%'" height="0.75rem" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Profile form -->
  <div v-else-if="variant === 'profile'" class="card p-8 space-y-6" role="status" aria-label="Chargement">
    <div class="flex items-center gap-5">
      <Shimmer width="5rem" height="5rem" rounded="2xl" class="shrink-0" />
      <div class="flex-1 space-y-2">
        <Shimmer width="40%" height="1.25rem" />
        <Shimmer width="55%" height="0.75rem" />
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="space-y-2">
        <Shimmer width="30%" height="0.625rem" />
        <Shimmer width="100%" height="2.75rem" rounded="xl" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Shimmer from '@/components/ui/Shimmer.vue'

withDefaults(defineProps<{
  variant?: 'stats' | 'list' | 'cards' | 'detail' | 'table' | 'profile'
  count?: number
  columns?: number
}>(), {
  variant: 'list',
  count: 4,
  columns: 5,
})
</script>
