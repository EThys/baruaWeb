<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      <TransitionGroup name="toast">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="['card flex items-start gap-3 p-4 shadow-hero cursor-pointer', colorMap[toast.type]]"
          @click="ui.removeToast(toast.id)"
        >
          <component :is="iconMap[toast.type]" :size="20" class="shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-xs mt-0.5 opacity-80">{{ toast.message }}</p>
          </div>
          <X :size="14" class="shrink-0 opacity-50 hover:opacity-100 mt-0.5" />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

const colorMap: Record<string, string> = {
  success: 'border-l-4 border-green-500 bg-green-50 text-green-800',
  error:   'border-l-4 border-red-500 bg-red-50 text-red-800',
  warning: 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-800',
  info:    'border-l-4 border-blue-500 bg-blue-50 text-blue-800',
}
const iconMap: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(100%); }
.toast-leave-to     { opacity: 0; transform: translateX(100%) scale(0.9); }
.toast-move         { transition: transform 0.3s ease; }
</style>
