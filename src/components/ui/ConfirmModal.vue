<template>
  <AppModal
    :open="open"
    :title="title"
    :subtitle="subtitle"
    :size="size"
    :close-on-backdrop="!loading"
    @close="onClose"
  >
    <p v-if="message" class="text-sm leading-relaxed text-gray-600">{{ message }}</p>
    <slot />

    <template #footer>
      <button
        type="button"
        class="btn-outline"
        :disabled="loading"
        @click="emit('cancel')"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="button"
        class="btn inline-flex items-center gap-2"
        :class="danger
          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400 disabled:opacity-60'
          : 'btn-primary'"
        :disabled="loading"
        @click="emit('confirm')"
      >
        <Loader2 v-if="loading" :size="16" class="animate-spin" />
        {{ confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import AppModal from '@/components/ui/AppModal.vue'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  subtitle?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  danger: false,
  loading: false,
  size: 'sm',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()

function onClose() {
  if (props.loading) return
  emit('close')
}
</script>
