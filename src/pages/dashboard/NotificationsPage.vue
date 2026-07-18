<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Notifications</h1>
        <p class="text-sm text-gray-500 mt-1">
          Alertes liées à vos demandes et à votre compte.
          <span class="text-gray-400">({{ ui.notifications.length }})</span>
        </p>
      </div>
      <button
        v-if="ui.unreadCount > 0"
        type="button"
        class="btn-outline btn-sm shrink-0"
        @click="ui.markAllAsRead()"
      >
        Tout marquer comme lu
      </button>
    </div>

    <div class="sheet">
      <div class="sheet-scroll">
        <table class="sheet-table min-w-[640px]">
          <thead>
            <tr>
              <th>Notification</th>
              <th>Type</th>
              <th>Date</th>
              <th class="text-right">État</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="n in ui.notifications"
              :key="n.id"
              class="cursor-pointer"
              @click="ui.markAsRead(n.id)"
            >
              <td>
                <div class="flex items-center gap-3 min-w-0">
                  <div class="sheet-avatar" aria-hidden="true">
                    <CheckCircle v-if="n.type === 'success'" :size="16" />
                    <Info v-else-if="n.type === 'info'" :size="16" />
                    <AlertCircle v-else :size="16" />
                  </div>
                  <div class="min-w-0">
                    <p v-if="n.title" class="font-semibold text-gray-900 truncate">{{ n.title }}</p>
                    <p class="text-sm text-gray-600 truncate">{{ n.message }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span
                  class="sheet-pill"
                  :class="{
                    'sheet-pill--ok': n.type === 'success',
                    'sheet-pill--muted': n.type === 'info',
                    'sheet-pill--warn': n.type === 'warning' || n.type === 'error',
                  }"
                >
                  {{ typeLabel(n.type) }}
                </span>
              </td>
              <td class="whitespace-nowrap text-gray-600">{{ timeAgo(n.createdAt) }}</td>
              <td class="text-right">
                <span v-if="!n.isRead" class="sheet-pill sheet-pill--warn">Non lu</span>
                <span v-else class="sheet-pill sheet-pill--muted">Lu</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="ui.notifications.length === 0" class="sheet-empty">
        Aucune notification pour le moment.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle, Info } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

function typeLabel(type: string) {
  if (type === 'success') return 'Succès'
  if (type === 'warning') return 'Attention'
  if (type === 'error') return 'Erreur'
  return 'Info'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return new Date(iso).toLocaleDateString('fr-FR')
}
</script>
