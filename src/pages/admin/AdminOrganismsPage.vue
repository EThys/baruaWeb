<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display font-bold text-2xl text-gray-900">Communes & organismes</h1>
      <p class="text-sm text-gray-500 mt-1">
        Localités qui proposent des services et volume de demandes.
        <span v-if="!admin.loadingStats" class="text-gray-400">
          ({{ total }} / {{ admin.organismStats.length }})
        </span>
      </p>
    </div>

    <div class="sheet-toolbar">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="search"
          class="form-field !pl-10"
          placeholder="Nom, ville, type…"
          autocomplete="off"
        />
      </div>
    </div>

    <LoadingShimmer v-if="admin.loadingStats" variant="table" :count="8" :columns="4" />

    <div v-else class="sheet">
      <div class="sheet-scroll">
        <table class="sheet-table min-w-[640px]">
          <thead>
            <tr>
              <th>Organisme</th>
              <th>Type</th>
              <th>Services</th>
              <th>Demandes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageItems" :key="row.organismId">
              <td>
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sheet-avatar" aria-hidden="true">
                    {{ initials(row.organismName) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ row.organismName }}</p>
                    <p class="text-xs text-gray-500">{{ row.city || '-' }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span class="sheet-pill sheet-pill--muted">{{ row.typeName || '-' }}</span>
              </td>
              <td>
                <span class="sheet-pill sheet-pill--ok">{{ row.servicesCount }}</span>
              </td>
              <td class="font-semibold text-gray-900">{{ row.demandesCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredRows.length" class="sheet-empty">Aucun organisme trouvé.</p>
      <SheetPagination
        v-else
        v-model:page="page"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="total"
        :from="from"
        :to="to"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'
import SheetPagination from '@/components/ui/SheetPagination.vue'
import { usePagination } from '@/composables/usePagination'

const admin = useAdminStore()
const search = ref('')

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'O'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return admin.organismStats
  return admin.organismStats.filter(r =>
    r.organismName.toLowerCase().includes(q)
    || (r.city ?? '').toLowerCase().includes(q)
    || (r.typeName ?? '').toLowerCase().includes(q),
  )
})

const {
  page,
  pageSize,
  total,
  totalPages,
  from,
  to,
  pageItems,
} = usePagination(filteredRows, {
  resetOn: () => search.value,
})

onMounted(() => admin.fetchSuperAdminOverview())
</script>
