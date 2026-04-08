<template>
  <div>
    <button @click="router.back()" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
      <ArrowLeft :size="16" /> Retour
    </button>

    <div v-if="request">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display font-bold text-2xl text-gray-900 mb-1">{{ request.serviceName }}</h1>
          <p class="text-sm text-gray-500">{{ request.referenceNumber }}</p>
        </div>
        <StatusBadge :status="request.status" class="self-start" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-6">
            <h2 class="font-semibold text-gray-800 mb-4">Détails de la demande</h2>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div class="flex justify-between sm:block">
                <dt class="text-gray-500 text-xs">Référence</dt>
                <dd class="text-gray-800 font-semibold font-mono">{{ request.referenceNumber }}</dd>
              </div>
              <div class="flex justify-between sm:block">
                <dt class="text-gray-500 text-xs">Catégorie</dt>
                <dd class="text-gray-800 font-medium">{{ request.categorySlug }}</dd>
              </div>
              <div class="flex justify-between sm:block">
                <dt class="text-gray-500 text-xs">Créée</dt>
                <dd class="text-gray-800 font-medium">{{ formatDateTime(request.createdAt) }}</dd>
              </div>
              <div class="flex justify-between sm:block">
                <dt class="text-gray-500 text-xs">Mise à jour</dt>
                <dd class="text-gray-800 font-medium">{{ formatDateTime(request.updatedAt) }}</dd>
              </div>
            </dl>
          </div>

          <div class="card p-6">
            <h2 class="font-semibold text-gray-800 mb-4">Historique</h2>
            <ol class="relative border-l border-gray-200 space-y-6 ml-3">
              <li v-for="(h, i) in request.statusHistory" :key="i" class="ml-6">
                <span class="absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center"
                  :class="i === 0 ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'">
                  <CheckCircle v-if="i === 0" :size="14" />
                  <Circle v-else :size="14" />
                </span>
                <div>
                  <p class="font-medium text-gray-700 text-sm">
                    {{ statusLabel(h.status) }}
                    <span v-if="h.agentName" class="text-xs text-gray-400 font-normal">— {{ h.agentName }}</span>
                  </p>
                  <time class="text-xs text-gray-400 block mb-1">{{ formatDateTime(h.date) }}</time>
                  <p v-if="h.note" class="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">{{ h.note }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-4">
          <div class="card p-5">
            <h3 class="font-semibold text-gray-800 text-sm mb-3">Décision</h3>

            <div class="grid grid-cols-1 gap-2">
              <button class="btn-primary btn-sm w-full justify-center" @click="approve" :disabled="busy">
                <CheckCircle :size="16" /> Valider
              </button>
              <button class="btn border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm w-full justify-center"
                @click="reject"
                :disabled="busy"
              >
                <XCircle :size="16" /> Annuler / rejeter
              </button>
            </div>
          </div>

          <div class="card p-5">
            <h3 class="font-semibold text-gray-800 text-sm mb-3">Demander une justification / correction</h3>
            <label class="label-text">Message au citoyen</label>
            <textarea v-model="message" rows="4" class="input-field resize-none" placeholder="Expliquez ce qu'il doit corriger / justifier…"></textarea>
            <button class="btn-outline btn-sm w-full justify-center mt-3" @click="askForJustification" :disabled="busy || !message.trim()">
              <MessageSquare :size="16" /> Demander un complément
            </button>
            <p class="text-xs text-gray-500 mt-2">
              Cela mettra le dossier en statut <span class="font-semibold">Complément requis</span> et la note apparaîtra dans l’historique côté citoyen.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-24">
      <p class="text-gray-400">Demande introuvable.</p>
      <RouterLink to="/admin/demandes" class="btn-primary mt-4 inline-flex">
        Retour aux demandes
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle, Circle, MessageSquare, XCircle } from 'lucide-vue-next'
import type { RequestStatus } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useRequestsStore } from '@/stores/requests'
import { useUIStore } from '@/stores/ui'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useRequestsStore()
const ui = useUIStore()

const request = computed(() => store.getRequestById(route.params.id as string))
const message = ref('')
const busy = ref(false)

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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function agentName() {
  const role = auth.user?.role
  const label =
    role === 'commune_admin' ? 'Commune' :
    role === 'ministry_admin' ? 'Ministère' :
    role === 'super_admin' ? 'Super-admin' :
    'Agent'
  return `${label} — ${auth.fullName || 'Utilisateur'}`
}

async function approve() {
  if (!request.value) return
  busy.value = true
  store.adminUpdateStatus({ id: request.value.id, status: 'approuvee', note: 'Dossier validé.', agentName: agentName() })
  ui.toast.success('Validé', 'La demande a été approuvée.')
  busy.value = false
}

async function reject() {
  if (!request.value) return
  busy.value = true
  store.adminUpdateStatus({ id: request.value.id, status: 'rejetee', note: 'Demande annulée / rejetée.', agentName: agentName() })
  ui.toast.warning('Rejetée', 'La demande a été rejetée.')
  busy.value = false
}

async function askForJustification() {
  if (!request.value) return
  busy.value = true
  store.requestCitizenJustification({ id: request.value.id, message: message.value.trim(), agentName: agentName() })
  ui.toast.info('Complément demandé', 'Le citoyen verra votre message dans son historique.')
  message.value = ''
  busy.value = false
}
</script>

