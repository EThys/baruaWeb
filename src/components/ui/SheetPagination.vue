<template>
  <div v-if="total > 0" class="sheet-pagination">
    <p class="sheet-pagination__meta">
      {{ from }}–{{ to }} sur {{ total }}
    </p>

    <div class="sheet-pagination__controls">
      <label class="sheet-pagination__size">
        <span class="sr-only">Lignes par page</span>
        <select
          :value="pageSize"
          class="form-field !py-1.5 !text-xs !w-auto"
          @change="onSizeChange"
        >
          <option v-for="n in sizeOptions" :key="n" :value="n">{{ n }} / page</option>
        </select>
      </label>

      <div class="sheet-pagination__nav">
        <button
          type="button"
          class="sheet-btn"
          :disabled="page <= 1"
          aria-label="Page précédente"
          @click="$emit('update:page', page - 1)"
        >
          <ChevronLeft :size="14" />
        </button>
        <span class="sheet-pagination__page">
          {{ page }} / {{ totalPages }}
        </span>
        <button
          type="button"
          class="sheet-btn"
          :disabled="page >= totalPages"
          aria-label="Page suivante"
          @click="$emit('update:page', page + 1)"
        >
          <ChevronRight :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { PAGE_SIZE_OPTIONS } from '@/composables/usePagination'

defineProps<{
  page: number
  totalPages: number
  total: number
  from: number
  to: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

const sizeOptions = PAGE_SIZE_OPTIONS

function onSizeChange(e: Event) {
  const value = Number((e.target as HTMLSelectElement).value)
  emit('update:pageSize', value)
}
</script>
