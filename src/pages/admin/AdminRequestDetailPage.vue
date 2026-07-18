<template>
  <div class="demande-detail space-y-6">
    <RouterLink
      to="/admin/demandes"
      class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand transition-colors"
    >
      <ArrowLeft :size="16" /> Retour aux demandes
    </RouterLink>

    <LoadingShimmer v-if="store.loading && !request" variant="detail" />

    <template v-else-if="request">
      <!-- Header -->
      <header class="demande-hero">
        <div class="demande-hero__glow" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand/80">
              Dossier administratif
            </p>
            <h1 class="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-1 leading-tight">
              {{ request.serviceName }}
            </h1>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 font-mono text-xs text-slate-700 ring-1 ring-slate-200/80">
                <Hash :size="12" class="text-slate-400" />
                {{ request.referenceNumber }}
              </span>
              <span class="inline-flex items-center gap-1.5 text-xs">
                <Calendar :size="12" class="text-slate-400" />
                Créée le {{ formatDateTime(request.createdAt) }}
              </span>
            </div>
          </div>
          <StatusBadge :status="request.status" class="self-start shrink-0 scale-110 origin-left sm:origin-right" />
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div class="lg:col-span-2 space-y-6">
          <!-- Auteur -->
          <section class="sheet overflow-hidden">
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
              <div>
                <h2 class="font-semibold text-slate-900">Auteur de la demande</h2>
                <p class="text-xs text-slate-500">Identité et coordonnées du citoyen</p>
              </div>
              <UserRound :size="18" class="text-slate-400" />
            </div>

            <div class="p-5">
              <div class="flex flex-col sm:flex-row sm:items-start gap-5">
                <div class="sheet-avatar !h-16 !w-16 !text-base !rounded-2xl shadow-md" aria-hidden="true">
                  {{ authorInitials }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-display font-bold text-xl text-slate-900 leading-tight">{{ authorName }}</p>
                  <p v-if="authorUsername" class="text-sm text-slate-500 mt-0.5">@{{ authorUsername }}</p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-if="authorRole"
                      class="sheet-pill"
                      :class="authorIsCitizen ? 'sheet-pill--muted' : 'sheet-pill--ok'"
                    >
                      {{ authorRole }}
                    </span>
                    <span
                      v-if="authorCertified != null"
                      class="sheet-pill"
                      :class="authorCertified ? 'sheet-pill--ok' : 'sheet-pill--warn'"
                    >
                      {{ authorCertified ? 'Certifié' : 'Non certifié' }}
                    </span>
                    <span v-if="authorPremium" class="sheet-pill sheet-pill--ok">Premium</span>
                    <span v-if="request.userId" class="sheet-pill sheet-pill--muted font-mono">
                      #{{ request.userId }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  v-if="authorEmail"
                  :href="`mailto:${authorEmail}`"
                  class="demande-info-tile"
                >
                  <Mail :size="16" class="text-brand shrink-0" />
                  <div class="min-w-0">
                    <p class="demande-info-tile__label">E-mail</p>
                    <p class="demande-info-tile__value truncate">{{ authorEmail }}</p>
                  </div>
                </a>
                <a
                  v-if="authorPhone"
                  :href="`tel:${authorPhone}`"
                  class="demande-info-tile"
                >
                  <Phone :size="16" class="text-brand shrink-0" />
                  <div class="min-w-0">
                    <p class="demande-info-tile__label">Téléphone</p>
                    <p class="demande-info-tile__value">{{ authorPhone }}</p>
                  </div>
                </a>
                <div v-if="authorIdentity" class="demande-info-tile">
                  <IdCard :size="16" class="text-slate-500 shrink-0" />
                  <div class="min-w-0">
                    <p class="demande-info-tile__label">N° d'identité</p>
                    <p class="demande-info-tile__value font-mono">{{ authorIdentity }}</p>
                  </div>
                </div>
                <div v-if="authorCity" class="demande-info-tile">
                  <MapPin :size="16" class="text-slate-500 shrink-0" />
                  <div class="min-w-0">
                    <p class="demande-info-tile__label">Ville</p>
                    <p class="demande-info-tile__value">{{ authorCity }}</p>
                  </div>
                </div>
                <div v-if="authorCommune" class="demande-info-tile sm:col-span-2">
                  <Building2 :size="16" class="text-slate-500 shrink-0" />
                  <div class="min-w-0">
                    <p class="demande-info-tile__label">Commune / organisme</p>
                    <p class="demande-info-tile__value">
                      {{ authorCommune }}
                      <span v-if="authorOrganismCity" class="text-slate-500 font-normal">
                        · {{ authorOrganismCity }}
                      </span>
                      <span v-if="authorOrganismType" class="text-slate-400 font-normal">
                        · {{ authorOrganismType }}
                      </span>
                    </p>
                  </div>
                </div>
                <div v-if="authorFirstName || authorLastName" class="demande-info-tile sm:col-span-2">
                  <User :size="16" class="text-slate-500 shrink-0" />
                  <div class="min-w-0">
                    <p class="demande-info-tile__label">État civil</p>
                    <p class="demande-info-tile__value">
                      {{ [authorFirstName, authorLastName].filter(Boolean).join(' ') }}
                    </p>
                  </div>
                </div>
              </div>

              <p v-if="authorLoading" class="text-xs text-slate-400 mt-4 flex items-center gap-2">
                <Loader2 :size="12" class="animate-spin" /> Chargement du profil…
              </p>
            </div>
          </section>

          <!-- Détails -->
          <section class="sheet overflow-hidden">
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
              <div>
                <h2 class="font-semibold text-slate-900">Détails du dossier</h2>
                <p class="text-xs text-slate-500">Référence, dates et commentaire</p>
              </div>
              <FileText :size="18" class="text-slate-400" />
            </div>
            <div class="p-5">
              <dl class="grid grid-cols-2 gap-3">
                <div class="demande-meta">
                  <dt>Référence</dt>
                  <dd class="font-mono">{{ request.referenceNumber }}</dd>
                </div>
                <div class="demande-meta">
                  <dt>Catégorie</dt>
                  <dd class="capitalize">{{ categoryLabel }}</dd>
                </div>
                <div class="demande-meta">
                  <dt>Créée</dt>
                  <dd>{{ formatDateTime(request.createdAt) }}</dd>
                </div>
                <div class="demande-meta">
                  <dt>Mise à jour</dt>
                  <dd>{{ formatDateTime(request.updatedAt) }}</dd>
                </div>
              </dl>
              <div
                v-if="request.formData?.commentaire"
                class="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
              >
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Commentaire du citoyen
                </p>
                <p class="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {{ request.formData.commentaire }}
                </p>
              </div>
            </div>
          </section>

          <!-- Historique -->
          <section class="sheet overflow-hidden">
            <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
              <div>
                <h2 class="font-semibold text-slate-900">Historique</h2>
                <p class="text-xs text-slate-500">Évolution du statut</p>
              </div>
              <History :size="18" class="text-slate-400" />
            </div>
            <div class="p-5">
              <ol v-if="request.statusHistory.length" class="space-y-0">
                <li
                  v-for="(h, i) in request.statusHistory"
                  :key="i"
                  class="demande-timeline__item"
                  :class="{ 'demande-timeline__item--current': i === 0 }"
                >
                  <span class="demande-timeline__dot" aria-hidden="true">
                    <CheckCircle v-if="i === 0" :size="14" />
                    <Circle v-else :size="12" />
                  </span>
                  <div class="min-w-0 pb-6">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="font-semibold text-slate-800 text-sm">{{ statusLabel(h.status) }}</p>
                      <StatusBadge :status="h.status" />
                    </div>
                    <p class="text-xs text-slate-500 mt-1">
                      {{ formatDateTime(h.date) }}
                      <span v-if="h.agentName"> · {{ h.agentName }}</span>
                    </p>
                    <p
                      v-if="h.note"
                      class="mt-2 text-sm text-slate-700 rounded-xl bg-white border border-slate-200 px-3 py-2 leading-relaxed"
                    >
                      {{ h.note }}
                    </p>
                  </div>
                </li>
              </ol>
              <p v-else class="text-sm text-slate-500 text-center py-6">Aucun historique disponible.</p>
            </div>
          </section>
        </div>

        <!-- Actions -->
        <aside class="space-y-4 lg:sticky lg:top-6">
          <section class="sheet overflow-hidden">
            <div class="border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
              <h3 class="font-semibold text-slate-900">Décision</h3>
              <p class="text-xs text-slate-500 mt-0.5">Traiter ce dossier</p>
            </div>
            <div class="p-4 space-y-2">
              <button
                type="button"
                class="demande-action demande-action--neutral"
                :disabled="busy"
                @click="setInProgress"
              >
                <Loader2 v-if="busy" :size="16" class="animate-spin" />
                <Clock v-else :size="16" />
                Mettre en cours
              </button>
              <button
                type="button"
                class="demande-action demande-action--ok"
                :disabled="busy"
                @click="approve"
              >
                <CheckCircle :size="16" />
                Valider
              </button>
              <button
                type="button"
                class="demande-action demande-action--danger"
                :disabled="busy"
                @click="reject"
              >
                <XCircle :size="16" />
                Rejeter
              </button>
              <p v-if="actionError" class="text-sm text-red-600 pt-1">{{ actionError }}</p>
            </div>
          </section>

          <section class="sheet overflow-hidden">
            <div class="border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
              <h3 class="font-semibold text-slate-900">Note à joindre</h3>
              <p class="text-xs text-slate-500 mt-0.5">Visible dans l’historique</p>
            </div>
            <div class="p-4 space-y-3">
              <textarea
                v-model="message"
                rows="4"
                class="form-field resize-none !min-h-[6.5rem]"
                placeholder="Ex. : pièce manquante, dossier pris en charge…"
              />
              <button
                type="button"
                class="demande-action demande-action--primary"
                :disabled="busy || !message.trim()"
                @click="askForJustification"
              >
                <MessageSquare :size="16" />
                Envoyer la note
              </button>
              <p class="text-[11px] text-slate-500 leading-relaxed">
                L’envoi d’une note place le dossier en <strong class="font-semibold text-slate-700">en cours</strong>.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </template>

    <div v-else class="sheet px-6 py-16 text-center">
      <p class="text-slate-500 font-medium">Demande introuvable.</p>
      <RouterLink to="/admin/demandes" class="btn-primary mt-4 inline-flex">
        Retour aux demandes
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Hash,
  History,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  UserRound,
  XCircle,
} from 'lucide-vue-next'
import type { RequestStatus } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useRequestsStore } from '@/stores/requests'
import { useUIStore } from '@/stores/ui'
import StatusBadge from '@/components/requests/RequestStatusBadge.vue'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'

const route = useRoute()
const auth = useAuthStore()
const store = useRequestsStore()
const ui = useUIStore()

const request = computed(() => store.getRequestById(route.params.id as string))
const message = ref('')
const busy = ref(false)
const actionError = ref('')
const authorLoading = ref(false)

function stripAt(value?: string | null): string | undefined {
  if (!value) return undefined
  return value.replace(/^@+/, '').trim() || undefined
}

const cachedProfile = computed(() => store.getCachedProfile(request.value?.userId))

const authorName = computed(() =>
  cachedProfile.value?.name
  || request.value?.applicantName
  || (typeof request.value?.formData?.fullName === 'string' ? request.value.formData.fullName : '')
  || (request.value?.userId ? `Utilisateur #${request.value.userId}` : 'Auteur inconnu'),
)

const authorFirstName = computed(() => cachedProfile.value?.firstName)
const authorLastName = computed(() => cachedProfile.value?.lastName)

const authorEmail = computed(() =>
  cachedProfile.value?.email
  || request.value?.applicantEmail
  || (typeof request.value?.formData?.email === 'string' ? request.value.formData.email : undefined),
)

const authorPhone = computed(() =>
  cachedProfile.value?.phone
  || request.value?.applicantPhone
  || (typeof request.value?.formData?.phone === 'string' ? request.value.formData.phone : undefined),
)

const authorIdentity = computed(() =>
  request.value?.applicantIdentity
  || (typeof request.value?.formData?.numberIdentity === 'string'
    ? request.value.formData.numberIdentity
    : undefined),
)

const authorUsername = computed(() =>
  stripAt(
    cachedProfile.value?.username
    || request.value?.applicantUsername
    || (typeof request.value?.formData?.username === 'string' ? request.value.formData.username : undefined),
  ),
)

const authorCity = computed(() =>
  cachedProfile.value?.city
  || request.value?.applicantCity
  || (typeof request.value?.formData?.city === 'string' ? request.value.formData.city : undefined),
)

const authorCommune = computed(() =>
  cachedProfile.value?.organismName
  || request.value?.serviceOrganismName,
)

const authorOrganismCity = computed(() =>
  cachedProfile.value?.organismCity
  || request.value?.serviceOrganismCity,
)

const authorOrganismType = computed(() => request.value?.serviceOrganismType)

const authorRole = computed(() => cachedProfile.value?.roleLabel)
const authorIsCitizen = computed(() => cachedProfile.value?.isCitizen !== false)
const authorCertified = computed(() => cachedProfile.value?.certified)
const authorPremium = computed(() => cachedProfile.value?.premium === true)

const categoryLabel = computed(() =>
  (request.value?.categorySlug ?? '').replace(/-/g, ' ') || '-',
)

const authorInitials = computed(() => {
  const parts = authorName.value.trim().split(/\s+/).filter(Boolean)
  if (!parts.length || authorName.value.startsWith('Utilisateur') || authorName.value === 'Auteur inconnu') {
    return '?'
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
})

async function resolveAuthor() {
  const req = request.value
  if (!req?.userId) return
  const cached = store.getCachedProfile(req.userId)
  if (cached?.name && cached.email) {
    authorLoading.value = false
    return
  }
  authorLoading.value = true
  try {
    await store.ensureApplicantProfile(req.userId)
  } finally {
    authorLoading.value = false
  }
}

onMounted(async () => {
  // Cache Pinia / localStorage d’abord, refresh réseau seulement si besoin
  await store.fetchRequests()
  const id = route.params.id as string
  if (id) await store.fetchRequestEvolution(id)
  await resolveAuthor()
})

watch(
  () => request.value?.userId,
  () => { void resolveAuthor() },
)

const STATUS_LABELS: Record<RequestStatus, string> = {
  brouillon: 'Brouillon',
  soumise: 'Demande soumise',
  en_cours: 'En cours de traitement',
  en_attente_document: 'Complément requis',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
  annulee: 'Annulée',
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
  return `${label} · ${auth.fullName || 'Utilisateur'}`
}

async function runStatus(status: RequestStatus, note: string, toastTitle: string, toastMsg: string) {
  if (!request.value) return
  busy.value = true
  actionError.value = ''
  try {
    await store.adminUpdateStatus({
      id: request.value.id,
      status,
      note,
      agentName: agentName(),
    })
    ui.toast.success(toastTitle, toastMsg)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    actionError.value = err.response?.data?.message ?? err.message ?? 'Échec du changement de statut.'
    ui.toast.error('Échec', actionError.value)
  } finally {
    busy.value = false
  }
}

async function setInProgress() {
  await runStatus('en_cours', message.value.trim() || 'Dossier pris en charge.', 'En cours', 'Statut mis à jour.')
}

async function approve() {
  await runStatus('approuvee', message.value.trim() || 'Dossier validé.', 'Validé', 'La demande a été approuvée.')
}

async function reject() {
  await runStatus('rejetee', message.value.trim() || 'Demande rejetée.', 'Rejetée', 'La demande a été rejetée.')
}

async function askForJustification() {
  if (!request.value) return
  busy.value = true
  actionError.value = ''
  try {
    await store.requestCitizenJustification({
      id: request.value.id,
      message: message.value.trim(),
      agentName: agentName(),
    })
    ui.toast.info('Note envoyée', 'Le dossier est en cours avec votre message.')
    message.value = ''
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    actionError.value = err.response?.data?.message ?? err.message ?? 'Échec.'
    ui.toast.error('Échec', actionError.value)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.demande-hero {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid rgb(226 232 240 / 0.9);
  background:
    linear-gradient(135deg, rgb(248 250 252) 0%, rgb(255 255 255) 48%, rgb(239 246 255 / 0.7) 100%);
  padding: 1.35rem 1.5rem;
  box-shadow: 0 10px 40px -18px rgb(15 23 42 / 0.14);
}

.demande-hero__glow {
  pointer-events: none;
  position: absolute;
  inset: auto -20% -60% auto;
  width: 55%;
  height: 140%;
  background: radial-gradient(circle, rgb(14 165 233 / 0.14), transparent 68%);
}

.demande-info-tile {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid rgb(226 232 240);
  background: rgb(248 250 252 / 0.65);
  padding: 0.75rem 0.9rem;
  transition: border-color 0.15s, background-color 0.15s;
  text-decoration: none;
  color: inherit;
}

a.demande-info-tile:hover {
  border-color: rgb(14 165 233 / 0.35);
  background: rgb(239 246 255 / 0.7);
}

.demande-info-tile__label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(100 116 139);
}

.demande-info-tile__value {
  margin-top: 0.15rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(15 23 42);
}

.demande-meta {
  border-radius: 0.9rem;
  border: 1px solid rgb(226 232 240);
  background: rgb(248 250 252 / 0.55);
  padding: 0.75rem 0.9rem;
}

.demande-meta dt {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(100 116 139);
}

.demande-meta dd {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(15 23 42);
}

.demande-timeline__item {
  position: relative;
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  gap: 0.85rem;
  padding-left: 0.15rem;
}

.demande-timeline__item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 0.7rem;
  top: 1.4rem;
  bottom: 0;
  width: 2px;
  background: rgb(226 232 240);
}

.demande-timeline__dot {
  position: relative;
  z-index: 1;
  margin-top: 0.15rem;
  display: flex;
  height: 1.4rem;
  width: 1.4rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgb(241 245 249);
  color: rgb(148 163 184);
  ring: 1px solid rgb(226 232 240);
  box-shadow: 0 0 0 1px rgb(226 232 240);
}

.demande-timeline__item--current .demande-timeline__dot {
  background: var(--color-brand, #0ea5e9);
  color: white;
  box-shadow: 0 0 0 4px rgb(14 165 233 / 0.15);
}

.demande-action {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.85rem;
  border: 1px solid transparent;
  padding: 0.7rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;
}

.demande-action:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.demande-action--neutral {
  border-color: rgb(226 232 240);
  background: white;
  color: rgb(51 65 85);
}

.demande-action--neutral:hover {
  background: rgb(248 250 252);
}

.demande-action--ok {
  border-color: rgb(167 243 208);
  background: rgb(236 253 245);
  color: rgb(4 120 87);
}

.demande-action--ok:hover {
  background: rgb(209 250 229);
}

.demande-action--danger {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

.demande-action--danger:hover {
  background: rgb(254 226 226);
}

.demande-action--primary {
  border-color: rgb(14 165 233 / 0.3);
  background: rgb(14 165 233 / 0.08);
  color: var(--color-brand, #0ea5e9);
}

.demande-action--primary:hover {
  background: rgb(14 165 233 / 0.14);
}
</style>
