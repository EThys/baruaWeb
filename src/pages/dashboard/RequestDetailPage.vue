<template>
  <div>
    <!-- Back -->
    <button @click="router.back()" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
      <ArrowLeft :size="16" /> Retour
    </button>

    <div v-if="request">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 class="font-display font-bold text-2xl text-gray-900 mb-1">{{ request.serviceName }}</h1>
          <p class="text-sm text-gray-500">{{ request.referenceNumber }}</p>
        </div>
        <StatusBadge :status="request.status" class="self-start" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Timeline -->
        <div class="lg:col-span-2 card p-6">
          <h2 class="font-semibold text-gray-800 mb-5">Historique du dossier</h2>
          <ol class="relative border-l border-gray-200 space-y-6 ml-3">
            <li v-for="(h, i) in request.statusHistory" :key="i" class="ml-6">
              <span class="absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center"
                :class="i === 0 ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'">
                <CheckCircle v-if="i === 0" :size="14" />
                <Circle v-else :size="14" />
              </span>
              <div>
                <p class="font-medium text-gray-700 text-sm">{{ statusLabel(h.status) }}</p>
                <time class="text-xs text-gray-400 block mb-1">{{ formatDate(h.date) }}</time>
                <p v-if="h.note" class="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{{ h.note }}</p>
              </div>
            </li>
          </ol>
        </div>

        <!-- Sidebar info -->
        <div class="space-y-4">
          <div class="card p-5">
            <h3 class="font-semibold text-gray-800 text-sm mb-3">Informations</h3>
            <dl class="space-y-2 text-xs">
              <div class="flex justify-between">
                <dt class="text-gray-500">Créée le</dt>
                <dd class="text-gray-700 font-medium">{{ formatDate(request.createdAt) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Mise à jour</dt>
                <dd class="text-gray-700 font-medium">{{ formatDate(request.updatedAt) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Catégorie</dt>
                <dd class="text-gray-700 font-medium">{{ request.categorySlug }}</dd>
              </div>
            </dl>
          </div>

          <!-- Cancel button -->
          <button
            v-if="canCancel"
            @click="cancel"
            class="w-full btn border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm"
          >
            Annuler la demande
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-24">
      <p class="text-gray-400">Demande introuvable.</p>
      <RouterLink to="/dashboard/mes-demandes" class="btn-primary mt-4 inline-flex">
        Retour à mes demandes
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, CheckCircle, Circle } from 'lucide-vue-next'
import { useRequestsStore } from '@/stores/requests'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'
import type { RequestStatus } from '@/types'

const route  = useRoute()
const router = useRouter()
const store  = useRequestsStore()

const request = computed(() => store.getRequestById(route.params.id as string))
const canCancel = computed(() =>
  request.value && ['soumise', 'en_cours'].includes(request.value.status),
)

const STATUS_LABELS: Record<RequestStatus, string> = {
  brouillon:            'Brouillon',
  soumise:              'Demande soumise',
  en_cours:             'En cours de traitement',
  en_attente_document:  'Complément requis',
  approuvee:            'Approuvée',
  rejetee:              'Rejetée',
  annulee:              'Annulée',
}
function statusLabel(s: RequestStatus) { return STATUS_LABELS[s] ?? s }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function cancel() {
  if (request.value && confirm('Confirmer l\'annulation ?')) {
    store.cancelRequest(request.value.id)
  }
}
</script>
