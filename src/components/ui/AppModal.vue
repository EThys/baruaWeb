<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-overlay fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.self="onBackdrop"
      >
        <div
          class="modal-panel flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:rounded-2xl"
          :class="widthClass"
        >
          <header class="flex shrink-0 items-start gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
            <div class="min-w-0 flex-1">
              <h2 :id="titleId" class="font-display text-lg font-bold text-gray-900">
                {{ title }}
              </h2>
              <p v-if="subtitle" class="mt-0.5 text-sm text-gray-500">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Fermer"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>
          </header>

          <div class="modal-body flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-3.5 sm:px-6"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  subtitle?: string
  /** sm | md | lg | xl */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}>(), {
  size: 'md',
  closeOnBackdrop: true,
})

const emit = defineEmits<{ close: [] }>()

const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`

const widthClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'sm:max-w-lg'
    case 'md': return 'sm:max-w-2xl'
    case 'lg': return 'sm:max-w-3xl'
    case 'xl': return 'sm:max-w-4xl'
    default: return 'sm:max-w-2xl'
  }
})

function onBackdrop() {
  if (props.closeOnBackdrop) emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

watch(() => props.open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  opacity: 0;
  transform: translateY(1.25rem) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-panel,
  .modal-leave-active .modal-panel {
    transition: none;
  }
}
</style>
