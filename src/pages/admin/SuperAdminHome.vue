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
      <template v-if="admin.loadingUsers || admin.loadingStats">
        <div v-for="i in 4" :key="i" class="card p-5 space-y-3">
          <Shimmer width="40%" height="0.625rem" />
          <Shimmer width="3rem" height="1.75rem" />
        </div>
      </template>
      <template v-else>
        <div class="card p-5">
          <p class="text-xs text-gray-500">Utilisateurs</p>
          <p class="font-display font-bold text-2xl text-gray-900 mt-1">
            {{ admin.usersCount }}
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
      </template>
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

    <div class="sheet">
      <div class="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5">
        <div>
          <h2 class="font-semibold text-gray-900">Communes & organismes</h2>
          <p class="text-xs text-gray-500">Services documentaires et demandes associées</p>
        </div>
        <RouterLink to="/admin/organismes" class="text-sm text-brand font-medium hover:underline">
          Voir tout →
        </RouterLink>
      </div>
      <div class="sheet-scroll">
        <table v-if="admin.loadingStats" class="sheet-table min-w-[480px]" role="status" aria-label="Chargement">
          <tbody>
            <tr v-for="i in 5" :key="i">
              <td><Shimmer width="70%" height="0.75rem" /></td>
              <td><Shimmer width="50%" height="0.75rem" /></td>
              <td><Shimmer width="2rem" height="0.75rem" /></td>
              <td><Shimmer width="2rem" height="0.75rem" /></td>
            </tr>
          </tbody>
        </table>
        <table v-else class="sheet-table">
          <thead>
            <tr>
              <th>Organisme</th>
              <th>Ville</th>
              <th>Services</th>
              <th>Demandes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in topOrganisms" :key="row.organismId">
              <td>
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sheet-avatar !h-9 !w-9 !text-[10px]" aria-hidden="true">
                    {{ orgInitials(row.organismName) }}
                  </div>
                  <p class="font-semibold text-gray-900 truncate">{{ row.organismName }}</p>
                </div>
              </td>
              <td>{{ row.city || '-' }}</td>
              <td><span class="sheet-pill sheet-pill--ok">{{ row.servicesCount }}</span></td>
              <td class="font-semibold">{{ row.demandesCount }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!topOrganisms.length && !admin.loadingStats" class="sheet-empty">
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
import Shimmer from '@/components/ui/Shimmer.vue'

const admin = useAdminStore()

function orgInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'O'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

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
