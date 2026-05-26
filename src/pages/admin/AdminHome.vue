<template>
  <SuperAdminHome v-if="auth.isSuperAdmin" />
  <div v-else class="space-y-6">
    <div class="rounded-2xl bg-hero-gradient p-6 text-white">
      <p class="text-blue-200 text-sm">Administration</p>
      <h1 class="font-display font-bold text-2xl mt-1">Vue d’ensemble</h1>
      <p class="text-blue-100 text-sm mt-2">Gestion des demandes et archives pour votre périmètre.</p>
    </div>

    <RouterLink
      v-if="auth.canManageServiceDocumentaires"
      to="/admin/services-documentaires"
      class="card p-5 flex items-center justify-between gap-4 hover:border-brand/30 hover:shadow-md transition-all group"
    >
      <div>
        <p class="text-sm font-semibold text-gray-900 group-hover:text-brand">Créer un service documentaire</p>
        <p class="text-xs text-gray-500 mt-1">Document + organisme + tarif + délai</p>
      </div>
      <span class="text-brand text-sm font-medium">Ouvrir →</span>
    </RouterLink>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card p-5">
        <p class="text-xs text-gray-500">Rôle</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">{{ auth.roleLabel }}</p>
      </div>
      <div v-if="auth.user?.adminOrganismName" class="card p-5 md:col-span-2">
        <p class="text-xs text-gray-500">Organisme</p>
        <p class="font-display font-bold text-xl text-gray-900 mt-1">{{ auth.user.adminOrganismName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SuperAdminHome from '@/pages/admin/SuperAdminHome.vue'

const auth = useAuthStore()
</script>
