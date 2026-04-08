<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Mes documents</h1>
        <p class="text-sm text-gray-500 mt-1">Recherchez, téléchargez et re-téléchargez vos documents archivés.</p>
      </div>

      <div class="w-full sm:w-[360px]">
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="d in store.filteredMyDocuments"
        :key="d.id"
        class="card p-5"
      >
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-xl bg-brand/5 flex items-center justify-center shrink-0">
            <FileText :size="20" class="text-brand" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ d.title }}</p>
            <p class="text-xs text-gray-500 mt-1">
              <span v-if="d.ministry">{{ d.ministry }}</span>
              <span v-if="d.ministry" class="mx-2">•</span>
              <span>{{ formatDate(d.createdAt) }}</span>
              <span class="mx-2">•</span>
              <span>{{ d.downloads }} téléchargement(s)</span>
            </p>

            <div class="flex flex-wrap gap-2 mt-3">
              <span v-for="t in d.tags" :key="t" class="badge bg-gray-100 text-gray-700">
                {{ t }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div class="text-xs text-gray-400">
            <span class="font-mono">{{ d.fileName }}</span>
          </div>
          <a
            class="btn-primary btn-sm inline-flex justify-center"
            :href="d.fileUrl"
            download
            @click="store.incrementDownload(d.id)"
          >
            <Download :size="16" />
            Télécharger
          </a>
        </div>
      </div>

      <div v-if="store.filteredMyDocuments.length === 0" class="card p-12 text-center lg:col-span-2">
        <Inbox :size="44" class="text-gray-200 mx-auto mb-3" />
        <p class="text-gray-600 font-medium">Aucun document trouvé</p>
        <p class="text-sm text-gray-500 mt-1">Essayez une autre recherche.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Download, Inbox, Search } from 'lucide-vue-next'
import { useDocumentsStore } from '@/stores/documents'

const store = useDocumentsStore()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

