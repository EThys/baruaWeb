<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex flex-col items-end gap-3 p-4 sm:p-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          class="toast-item pointer-events-auto relative w-full max-w-[22rem] overflow-hidden rounded-2xl border shadow-lg backdrop-blur-md"
          :class="shellClass[toast.type]"
          role="status"
        >
          <div class="flex items-start gap-3 p-4 pr-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              :class="iconWrapClass[toast.type]"
            >
              <component :is="iconMap[toast.type]" :size="20" stroke-width="2.25" />
            </div>
            <div class="min-w-0 flex-1 pt-0.5">
              <p class="text-sm font-semibold leading-snug text-gray-900">{{ toast.title }}</p>
              <p v-if="toast.message" class="mt-1 text-xs leading-relaxed text-gray-600">
                {{ toast.message }}
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-700"
              aria-label="Fermer"
              @click.stop="ui.removeToast(toast.id)"
            >
              <X :size="16" />
            </button>
          </div>
          <div class="h-1 w-full bg-black/[0.04]">
            <div
              class="toast-progress h-full origin-left"
              :class="progressClass[toast.type]"
              :style="{ animationDuration: `${toast.duration ?? 4000}ms` }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const ui = useUIStore()

const shellClass: Record<string, string> = {
  success: 'border-emerald-200/80 bg-white/95',
  error:   'border-red-200/80 bg-white/95',
  warning: 'border-amber-200/80 bg-white/95',
  info:    'border-sky-200/80 bg-white/95',
}

const iconWrapClass: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  error:   'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-600',
  info:    'bg-sky-50 text-sky-600',
}

const progressClass: Record<string, string> = {
  success: 'bg-emerald-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-sky-500',
}

const iconMap: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-leave-active {
  transition: all 0.28s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translate3d(1.25rem, -0.75rem, 0) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translate3d(1.5rem, 0, 0) scale(0.94);
}
.toast-move {
  transition: transform 0.3s ease;
}

.toast-progress {
  animation-name: toastShrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes toastShrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move { transition: none; }
  .toast-progress { animation: none; width: 100%; }
}
</style>
