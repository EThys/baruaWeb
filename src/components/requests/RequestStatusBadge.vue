<template>
  <span :class="['badge', config.cls]">
    <component :is="config.icon" :size="11" />
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Loader2, AlertCircle, CheckCircle, XCircle, Minus, FileQuestion } from 'lucide-vue-next'
import type { RequestStatus } from '@/types'

const props = defineProps<{ status: RequestStatus }>()

const statusMap: Record<RequestStatus, { label: string; cls: string; icon: typeof Clock }> = {
  brouillon:            { label: 'Brouillon',            cls: 'badge-gray',    icon: Minus },
  soumise:              { label: 'Soumise',              cls: 'badge-info',    icon: Clock },
  en_cours:             { label: 'En cours',             cls: 'badge-primary', icon: Loader2 },
  en_attente_document:  { label: 'Docs requis',          cls: 'badge-warning', icon: AlertCircle },
  approuvee:            { label: 'Approuvée',            cls: 'badge-success', icon: CheckCircle },
  rejetee:              { label: 'Rejetée',              cls: 'badge-danger',  icon: XCircle },
  annulee:              { label: 'Annulée',              cls: 'badge-gray',    icon: Minus },
}

const config = computed(() => statusMap[props.status] ?? { label: props.status, cls: 'badge-gray', icon: FileQuestion })
</script>
