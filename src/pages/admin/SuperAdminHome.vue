<template>
  <div class="space-y-6">
    <div class="rounded-2xl bg-hero-gradient p-6 text-white">
      <p class="text-blue-200 text-sm">Super-administration</p>
      <h1 class="font-display font-bold text-2xl mt-1">Pilotage Barua</h1>
      <p class="text-blue-100 text-sm mt-2">
        Utilisateurs, documents, services par commune, demandes et attribution des rôles.
      </p>
    </div>

    <div
      v-if="admin.error"
      class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {{ admin.error }}
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5">
        <p class="text-xs text-gray-500">Utilisateurs</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">
          {{ admin.loadingUsers ? '…' : admin.usersCount }}
        </p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500">Comptes certifiés</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">{{ admin.certifiedCount }}</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500">Demandes (total)</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">{{ admin.totalDemandes }}</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500">Demandes en cours</p>
        <p class="font-display font-bold text-2xl text-gray-900 mt-1">{{ admin.openDemandes }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="action in quickActions"
        :key="action.to"
        :to="action.to"
        class="card p-5 hover:border-brand/30 hover:shadow-md transition-all group"
      >
        <component :is="action.icon" :size="22" class="text-brand mb-3" />
        <p class="text-sm font-semibold text-gray-900 group-hover:text-brand">{{ action.label }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ action.desc }}</p>
      </RouterLink>
    </div>

    <div class="card p-6">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="font-semibold text-gray-900">Communes & organismes</h2>
          <p class="text-xs text-gray-500">Services documentaires et demandes associées (estimation)</p>
        </div>
        <RouterLink to="/admin/organismes" class="text-sm text-brand font-medium hover:underline">
          Voir tout →
        </RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100">
              <th class="py-2 pr-4">Organisme</th>
              <th class="py-2 pr-4">Ville</th>
              <th class="py-2 pr-4">Services</th>
              <th class="py-2">Demandes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in topOrganisms"
              :key="row.organismId"
              class="border-b border-gray-50 last:border-0"
            >
              <td class="py-3 pr-4 font-medium text-gray-800">{{ row.organismName }}</td>
              <td class="py-3 pr-4 text-gray-600">{{ row.city || '—' }}</td>
              <td class="py-3 pr-4">{{ row.servicesCount }}</td>
              <td class="py-3">{{ row.demandesCount }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!topOrganisms.length && !admin.loadingStats" class="text-sm text-gray-500 py-4 text-center">
          Aucun organisme chargé.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  FilePlus2, FileText, Landmark, Users, Shield,
} from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()

const quickActions = [
  { to: '/admin/utilisateurs', label: 'Utilisateurs', desc: 'Liste et attribution des rôles', icon: Users },
  { to: '/admin/documents', label: 'Documents', desc: 'Liste et création', icon: FileText },
  { to: '/admin/services-documentaires', label: 'Services documentaires', desc: 'Liste et création', icon: FilePlus2 },
  { to: '/admin/demandes', label: 'Demandes', desc: 'Suivi et traitement', icon: Shield },
  { to: '/admin/organismes', label: 'Communes', desc: 'Activité par localité', icon: Landmark },
  { to: '/admin/roles', label: 'Rôles & accès', desc: 'Types de comptes plateforme', icon: Users },
]

const topOrganisms = computed(() => admin.organismStats.slice(0, 8))

onMounted(() => admin.fetchSuperAdminOverview())
</script>
