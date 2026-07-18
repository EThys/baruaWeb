<template>
  <ConfirmModal
    :open="!!dialog?.open"
    :title="dialog?.title ?? 'Confirmation'"
    :message="dialog?.message"
    :confirm-label="dialog?.confirmLabel"
    :cancel-label="dialog?.cancelLabel"
    :danger="dialog?.danger"
    size="sm"
    @confirm="ui.resolveConfirm(true)"
    @cancel="ui.resolveConfirm(false)"
    @close="ui.resolveConfirm(false)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const ui = useUIStore()
const dialog = computed(() => ui.confirmDialog)
</script>
