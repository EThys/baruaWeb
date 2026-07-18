<template>
  <div class="space-y-8">
    <!-- Welcome banner -->
    <div class="rounded-2xl bg-hero-gradient p-6 text-white flex items-center justify-between">
      <div>
        <p class="text-blue-200 text-sm mb-1">Bonjour</p>
        <h1 class="font-display font-bold text-2xl">{{ auth.fullName || 'Citoyen' }}</h1>
        <p class="text-blue-100 text-sm mt-1">{{ today }} · {{ auth.roleLabel }}</p>
      </div>
      <div class="hidden sm:flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3">
        <Shield :size="20" class="text-yellow-300" />
        <div>
          <p class="text-xs text-blue-200">Compte vérifié</p>
          <p class="text-sm font-semibold">{{ auth.user?.nationalId }}</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <LoadingShimmer v-if="reqStore.loading" variant="stats" :count="4" />
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="s in statCards"
        :key="s.label"
        class="card p-5 flex items-center gap-4"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="s.bg"
        >
          <component :is="s.icon" :size="20" :class="s.color" />
        </div>
        <div>
          <p class="font-display font-bold text-xl text-gray-800">{{ s.value }}</p>
          <p class="text-xs text-gray-500">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Recent requests (sheet) -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-display font-semibold text-lg text-gray-800">Mes dernières demandes</h2>
        <RouterLink to="/dashboard/mes-demandes" class="text-sm text-brand font-medium hover:underline">
          Voir tout →
        </RouterLink>
      </div>
      <LoadingShimmer v-if="reqStore.loading" variant="table" :count="4" :columns="4" />
      <div v-else class="sheet">
        <div class="sheet-scroll">
          <table class="sheet-table min-w-[640px]">
            <thead>
              <tr>
                <th>Demande</th>
                <th>Date</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in recentRequests" :key="r.id">
                <td>
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="sheet-avatar" aria-hidden="true">
                      {{ requestInitials(r.serviceName) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-gray-900 truncate">{{ r.serviceName }}</p>
                      <p class="text-[11px] text-gray-400 font-mono">{{ r.referenceNumber }}</p>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap text-gray-600">{{ formatDate(r.createdAt) }}</td>
                <td>
                  <StatusBadge :status="r.status" />
                </td>
                <td>
                  <div class="sheet-actions">
                    <RouterLink
                      :to="`/dashboard/mes-demandes/${r.id}`"
                      class="sheet-btn sheet-btn--primary"
                    >
                      Ouvrir
                    </RouterLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="recentRequests.length === 0" class="sheet-empty">
          Aucune demande pour le moment.
        </p>
      </div>
    </div>

    <!-- Quick actions -->
    <div>
      <h2 class="font-display font-semibold text-lg text-gray-800 mb-4">Actions rapides</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <RouterLink
          v-for="a in quickActions"
          :key="a.label"
          :to="a.to"
          class="card p-4 flex flex-col items-center gap-2 text-center hover:border-gray-200 hover:shadow-md transition-all group"
        >
          <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200/80 transition-colors">
            <component :is="a.icon" :size="20" class="text-gray-700" />
          </div>
          <p class="text-xs font-medium text-gray-700">{{ a.label }}</p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { FileText, Clock, CheckCircle, XCircle, Shield, Search, Plus, Bell, User } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRequestsStore } from '@/stores/requests'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'

const auth = useAuthStore()
const reqStore = useRequestsStore()

onMounted(() => { void reqStore.fetchRequests() })

const recentRequests = computed(() => reqStore.requests.slice(0, 4))

const today = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const statCards = computed(() => [
  { label: 'Total demandes', value: reqStore.stats.total, icon: FileText, bg: 'bg-blue-50', color: 'text-blue-500' },
  { label: 'En attente', value: reqStore.stats.pending, icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-500' },
  { label: 'Approuvées', value: reqStore.stats.approved, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-500' },
  { label: 'Rejetées', value: reqStore.stats.rejected, icon: XCircle, bg: 'bg-red-50', color: 'text-red-500' },
])

const quickActions = [
  { label: 'Nouvelle demande', to: '/services', icon: Plus },
  { label: 'Rechercher', to: '/search', icon: Search },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
  { label: 'Mon profil', to: '/dashboard/profil', icon: User },
]

function requestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
