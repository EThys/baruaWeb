<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Archives</h1>
        <p class="text-sm text-gray-500 mt-1">Recherche globale dans les documents archivés.</p>
      </div>

      <div class="w-full sm:w-[420px]">
        <label class="label-text">Recherche</label>
        <div class="relative">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="store.query"
            class="input-field pl-10"
            placeholder="Titre, ministère, tag…"
          />
        </div>
      </div>
    </div>

    <div class="card p-5 overflow-x-auto">
      <table class="min-w-[860px] w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-500">
            <th class="py-2 pr-4">Document</th>
            <th class="py-2 pr-4">Ministère</th>
            <th class="py-2 pr-4">Commune</th>
            <th class="py-2 pr-4">Créé</th>
            <th class="py-2 pr-4">Téléchargements</th>
            <th class="py-2 pr-0 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in store.filteredAllDocuments"
            :key="d.id"
            class="border-t border-gray-100"
          >
            <td class="py-3 pr-4">
              <p class="font-semibold text-gray-900">{{ d.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ d.fileName }}</p>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span v-for="t in d.tags" :key="t" class="badge bg-gray-100 text-gray-700">
                  {{ t }}
                </span>
              </div>
            </td>
            <td class="py-3 pr-4 text-gray-700">{{ d.ministry ?? '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ d.communeId ?? '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ formatDate(d.createdAt) }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ d.downloads }}</td>
            <td class="py-3 pr-0 text-right">
              <a
                class="btn-outline btn-sm inline-flex justify-center"
                :href="d.fileUrl"
                download
                @click="store.incrementDownload(d.id)"
              >
                <Download :size="16" />
                Télécharger
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.filteredAllDocuments.length === 0" class="py-10 text-center text-gray-500">
        Aucun résultat.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Search } from 'lucide-vue-next'
import { useDocumentsStore } from '@/stores/documents'

const store = useDocumentsStore()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

