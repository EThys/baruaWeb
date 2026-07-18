<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display font-bold text-2xl text-gray-900">Mes documents</h1>
      <p class="text-sm text-gray-500 mt-1">
        Recherchez et téléchargez vos documents archivés.
        <span v-if="!store.loading" class="text-gray-400">({{ total }} / {{ store.myDocuments.length }})</span>
      </p>
    </div>

    <div class="sheet-toolbar">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="store.query"
          type="search"
          class="form-field !pl-10"
          placeholder="Titre, ministère, tag…"
          autocomplete="off"
          :disabled="store.loading"
        />
      </div>
    </div>

    <LoadingShimmer v-if="store.loading" variant="table" :count="6" :columns="4" />

    <div v-else class="sheet">
      <div class="sheet-scroll">
        <table class="sheet-table min-w-[720px]">
          <thead>
            <tr>
              <th>Document</th>
              <th>Ministère</th>
              <th>Date</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in pageItems" :key="d.id">
              <td>
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sheet-avatar" aria-hidden="true">
                    {{ docInitials(d.title) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ d.title }}</p>
                    <p class="text-[11px] text-gray-400 font-mono truncate">{{ d.fileName || '-' }}</p>
                    <div v-if="d.tags?.length" class="mt-1 flex flex-wrap gap-1">
                      <span
                        v-for="t in d.tags.slice(0, 3)"
                        :key="t"
                        class="sheet-pill sheet-pill--muted"
                      >
                        {{ t }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-gray-600">{{ d.ministry || '-' }}</td>
              <td class="whitespace-nowrap text-gray-600">
                {{ formatDate(d.createdAt) }}
                <p class="text-[11px] text-gray-400">{{ d.downloads }} téléch.</p>
              </td>
              <td>
                <div class="sheet-actions">
                  <a
                    class="sheet-btn sheet-btn--primary"
                    :href="d.fileUrl"
                    download
                    @click="store.incrementDownload(d.id)"
                  >
                    Télécharger
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filtered.length" class="sheet-empty">
        Aucun document trouvé.
      </p>
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
import { computed, onMounted } from 'vue'
import { Search } from 'lucide-vue-next'
import { useDocumentsStore } from '@/stores/documents'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'
import SheetPagination from '@/components/ui/SheetPagination.vue'
import { usePagination } from '@/composables/usePagination'

const store = useDocumentsStore()

onMounted(() => { void store.fetchDocuments() })

function docInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const filtered = computed(() => store.filteredMyDocuments)

const {
  page,
  pageSize,
  total,
  totalPages,
  from,
  to,
  pageItems,
} = usePagination(filtered, {
  resetOn: () => store.query,
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
