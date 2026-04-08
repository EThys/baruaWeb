<template>
  <div class="space-y-6">
    <div class="rounded-2xl bg-hero-gradient p-6 text-white">
      <p class="text-blue-200 text-sm">Administration</p>
      <h1 class="font-display font-bold text-2xl mt-1">Vue d’ensemble</h1>
      <p class="text-blue-100 text-sm mt-2">Gérez les archives, et l’accès selon les rôles (commune, ministère, super-admin).</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card p-5">
        <p class="text-xs text-gray-500">Documents (total)</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">{{ totalDocs }}</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500">Téléchargements (total)</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">{{ totalDownloads }}</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500">Rôle</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">{{ roleLabel }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDocumentsStore } from '@/stores/documents'

const auth = useAuthStore()
const docs = useDocumentsStore()

const totalDocs = computed(() => docs.docs.length)
const totalDownloads = computed(() => docs.docs.reduce((s, d) => s + d.downloads, 0))
const roleLabel = computed(() => auth.user?.role ?? '')
</script>

