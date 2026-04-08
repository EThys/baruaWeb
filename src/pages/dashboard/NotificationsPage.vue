<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display font-bold text-2xl text-gray-900">Notifications</h1>
      <button
        v-if="ui.unreadCount > 0"
        @click="ui.markAllAsRead()"
        class="text-sm text-brand font-medium hover:underline"
      >
        Tout marquer comme lu
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="n in ui.notifications"
        :key="n.id"
        @click="ui.markAsRead(n.id)"
        class="card p-5 flex items-start gap-4 cursor-pointer hover:border-gray-200 transition-all"
        :class="{ 'bg-primary-50/30': !n.isRead }"
      >
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="{
            'bg-green-50': n.type === 'success',
            'bg-blue-50':  n.type === 'info',
            'bg-yellow-50': n.type === 'warning',
            'bg-red-50':   n.type === 'error',
          }">
          <CheckCircle v-if="n.type === 'success'" :size="18" class="text-green-500" />
          <Info        v-else-if="n.type === 'info'" :size="18" class="text-blue-500" />
          <AlertCircle v-else :size="18" class="text-yellow-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p v-if="n.title" class="font-semibold text-gray-800 text-sm">{{ n.title }}</p>
          <p class="text-sm text-gray-600 leading-snug">{{ n.message }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ timeAgo(n.createdAt) }}</p>
        </div>
        <div v-if="!n.isRead" class="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2" />
      </div>

      <div v-if="ui.notifications.length === 0" class="card p-12 text-center">
        <Bell :size="48" class="text-gray-200 mx-auto mb-3" />
        <p class="text-gray-500">Aucune notification pour le moment.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bell, CheckCircle, Info, AlertCircle } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return new Date(iso).toLocaleDateString('fr-FR')
}
</script>
