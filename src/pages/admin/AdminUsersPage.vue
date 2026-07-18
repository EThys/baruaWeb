<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Utilisateurs</h1>
        <p class="text-sm text-gray-500 mt-1">
          Comptes, certification, déblocage, rôles et création.
          <span v-if="!loading" class="text-gray-400">({{ headerTotal }} / {{ users.length }})</span>
        </p>
      </div>
      <button type="button" class="btn-primary btn-sm" @click="openCreate">
        Créer un compte
      </button>
    </div>

    <div class="sheet-toolbar">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="search"
          class="form-field !pl-10"
          placeholder="Nom, e-mail, téléphone, ville, pseudo…"
          autocomplete="off"
        />
      </div>
      <select v-model="roleFilter" class="form-field sm:w-48">
        <option value="all">Tous les rôles</option>
        <option value="citizen">Citoyens ({{ citizenCount }})</option>
        <option value="staff">Autres rôles ({{ staffCount }})</option>
      </select>
      <select v-model="certFilter" class="form-field sm:w-44">
        <option value="all">Tous les statuts</option>
        <option value="yes">Certifiés</option>
        <option value="no">Non certifiés</option>
      </select>
    </div>

    <LoadingShimmer v-if="loading" variant="table" :count="6" :columns="6" />

    <template v-else>
      <section v-if="roleFilter !== 'staff'" class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h2 class="font-semibold text-gray-900">Citoyens</h2>
            <p class="text-xs text-gray-500">Comptes citoyens ({{ filteredCitizens.length }})</p>
          </div>
        </div>
        <div class="sheet">
          <div class="sheet-scroll">
            <table class="sheet-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Contact</th>
                  <th>Ville</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in citizenPageItems" :key="u.userId">
                  <td>
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="sheet-avatar" aria-hidden="true">{{ initials(u) }}</div>
                      <div class="min-w-0">
                        <p class="font-semibold text-gray-900 truncate">{{ displayName(u) }}</p>
                        <p v-if="u.username" class="text-xs text-gray-400 truncate">@{{ u.username }}</p>
                        <p class="text-[11px] text-gray-400 font-mono">#{{ u.userId }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p class="text-gray-800 truncate max-w-[220px]" :title="u.email">{{ u.email || '-' }}</p>
                    <p v-if="u.phone" class="text-xs text-gray-500 mt-0.5">{{ u.phone }}</p>
                  </td>
                  <td>{{ u.city || '-' }}</td>
                  <td>
                    <span class="sheet-pill sheet-pill--muted">{{ u.roleLabel || 'Citoyen' }}</span>
                  </td>
                  <td>
                    <span
                      class="sheet-pill"
                      :class="u.certified ? 'sheet-pill--ok' : 'sheet-pill--warn'"
                    >
                      {{ u.certified ? 'Certifié' : 'Non certifié' }}
                    </span>
                  </td>
                  <td>
                    <div class="sheet-actions">
                      <button type="button" class="sheet-btn" :disabled="isBusy(u.userId)" @click="toggleCertify(u)">
                        <Loader2 v-if="isAction(u.userId, 'certify')" :size="14" class="animate-spin" />
                        {{ u.certified ? 'Retirer' : 'Certifier' }}
                      </button>
                      <button type="button" class="sheet-btn" :disabled="isBusy(u.userId)" @click="recover(u)">
                        <Loader2 v-if="isAction(u.userId, 'recover')" :size="14" class="animate-spin" />
                        Débloquer
                      </button>
                      <button type="button" class="sheet-btn" :disabled="isBusy(u.userId)" @click="resendOtp(u)">
                        <Loader2 v-if="isAction(u.userId, 'otp')" :size="14" class="animate-spin" />
                        OTP
                      </button>
                      <button type="button" class="sheet-btn sheet-btn--primary" :disabled="isBusy(u.userId)" @click="openAssign(u)">
                        Rôle
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!filteredCitizens.length" class="sheet-empty">Aucun citoyen trouvé.</p>
          <SheetPagination
            v-else
            v-model:page="citizenPage"
            v-model:page-size="citizenPageSize"
            :total-pages="citizenTotalPages"
            :total="citizenTotal"
            :from="citizenFrom"
            :to="citizenTo"
          />
        </div>
      </section>

      <section v-if="roleFilter !== 'citizen'" class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h2 class="font-semibold text-gray-900">Autres rôles</h2>
            <p class="text-xs text-gray-500">
              Admins commune, ministère, super-admin ({{ filteredStaff.length }})
            </p>
          </div>
        </div>
        <div class="sheet">
          <div class="sheet-scroll">
            <table class="sheet-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Contact</th>
                  <th>Ville</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in staffPageItems" :key="u.userId">
                  <td>
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="sheet-avatar" aria-hidden="true">{{ initials(u) }}</div>
                      <div class="min-w-0">
                        <p class="font-semibold text-gray-900 truncate">{{ displayName(u) }}</p>
                        <p v-if="u.username" class="text-xs text-gray-400 truncate">@{{ u.username }}</p>
                        <p class="text-[11px] text-gray-400 font-mono">#{{ u.userId }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p class="text-gray-800 truncate max-w-[220px]" :title="u.email">{{ u.email || '-' }}</p>
                    <p v-if="u.phone" class="text-xs text-gray-500 mt-0.5">{{ u.phone }}</p>
                  </td>
                  <td>{{ u.city || '-' }}</td>
                  <td>
                    <span class="sheet-pill sheet-pill--ok">{{ u.roleLabel || 'Admin' }}</span>
                  </td>
                  <td>
                    <span
                      class="sheet-pill"
                      :class="u.certified ? 'sheet-pill--ok' : 'sheet-pill--warn'"
                    >
                      {{ u.certified ? 'Certifié' : 'Non certifié' }}
                    </span>
                  </td>
                  <td>
                    <div class="sheet-actions">
                      <button type="button" class="sheet-btn" :disabled="isBusy(u.userId)" @click="toggleCertify(u)">
                        <Loader2 v-if="isAction(u.userId, 'certify')" :size="14" class="animate-spin" />
                        {{ u.certified ? 'Retirer' : 'Certifier' }}
                      </button>
                      <button type="button" class="sheet-btn" :disabled="isBusy(u.userId)" @click="recover(u)">
                        <Loader2 v-if="isAction(u.userId, 'recover')" :size="14" class="animate-spin" />
                        Débloquer
                      </button>
                      <button type="button" class="sheet-btn" :disabled="isBusy(u.userId)" @click="resendOtp(u)">
                        <Loader2 v-if="isAction(u.userId, 'otp')" :size="14" class="animate-spin" />
                        OTP
                      </button>
                      <button type="button" class="sheet-btn sheet-btn--primary" :disabled="isBusy(u.userId)" @click="openAssign(u)">
                        Rôle
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!filteredStaff.length" class="sheet-empty">Aucun compte admin trouvé.</p>
          <SheetPagination
            v-else
            v-model:page="staffPage"
            v-model:page-size="staffPageSize"
            :total-pages="staffTotalPages"
            :total="staffTotal"
            :from="staffFrom"
            :to="staffTo"
          />
        </div>
      </section>
    </template>

    <AppModal
      :open="!!selectedUser"
      title="Attribuer un rôle"
      :subtitle="selectedUser ? `${displayName(selectedUser)} · ${selectedUser.email}` : undefined"
      size="md"
      @close="selectedUser = null"
    >
      <div class="space-y-4">
        <div>
          <label class="form-label">Type de compte</label>
          <select v-model.number="assignForm.accountId" class="form-field">
            <option v-for="a in accounts" :key="a.id" :value="a.id">
              {{ a.name }} ({{ a.typeAccount.name }})
            </option>
          </select>
        </div>
        <div v-if="needsOrganism">
          <label class="form-label">Organisme (commune / mairie)</label>
          <select v-model.number="assignForm.organismId" class="form-field">
            <option :value="0" disabled>Sélectionnez</option>
            <option v-for="o in organisms" :key="o.id" :value="o.id">
              {{ o.name }}{{ o.city ? ` (${o.city})` : '' }}
            </option>
          </select>
        </div>
        <p v-if="assignError" class="form-error">{{ assignError }}</p>
      </div>
      <template #footer>
        <button type="button" class="btn-outline" @click="selectedUser = null">Annuler</button>
        <button type="button" class="btn-primary" :disabled="assigning" @click="submitAssign">
          <Loader2 v-if="assigning" :size="16" class="animate-spin" />
          {{ assigning ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </template>
    </AppModal>

    <AppModal
      :open="createOpen"
      title="Créer un compte"
      subtitle="Le compte pourra nécessiter une activation OTP par e-mail."
      size="lg"
      @close="createOpen = false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="form-label">Prénom</label>
            <input v-model="createForm.firstName" class="form-field" required />
          </div>
          <div>
            <label class="form-label">Nom</label>
            <input v-model="createForm.lastName" class="form-field" required />
          </div>
        </div>
        <div>
          <label class="form-label">E-mail</label>
          <input v-model="createForm.email" type="email" class="form-field" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="form-label">Téléphone</label>
            <input v-model="createForm.phone" type="tel" class="form-field" />
          </div>
          <div>
            <label class="form-label">Ville</label>
            <input v-model="createForm.city" class="form-field" required />
          </div>
        </div>
        <div>
          <label class="form-label">Pseudo (optionnel)</label>
          <input v-model="createForm.pseudo" class="form-field" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="form-label">Mot de passe</label>
            <input v-model="createForm.password" type="password" class="form-field" minlength="6" required />
          </div>
          <div>
            <label class="form-label">Confirmation</label>
            <input v-model="createForm.confirmPassword" type="password" class="form-field" minlength="6" required />
          </div>
        </div>
        <p v-if="createError" class="form-error">{{ createError }}</p>
      </div>
      <template #footer>
        <button type="button" class="btn-outline" @click="createOpen = false">Annuler</button>
        <button type="button" class="btn-primary" :disabled="creating" @click="submitCreate">
          <Loader2 v-if="creating" :size="16" class="animate-spin" />
          {{ creating ? 'Création…' : 'Créer' }}
        </button>
      </template>
    </AppModal>

    <ConfirmModal
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-label="confirmState.confirmLabel"
      :danger="confirmState.danger"
      :loading="confirmState.loading"
      size="sm"
      @confirm="runConfirmAction"
      @cancel="closeConfirm"
      @close="closeConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Loader2, Search } from 'lucide-vue-next'
import { assignUserRole, getAdminUsers, getPublicAccounts } from '@/api/admin'
import {
  adminGenerateOtp,
  adminRegisterUser,
  getAdminUserDetail,
  recoverUserAccount,
  setUserCertification,
} from '@/api/adminAuth'
import { usePublicOrganismsStore } from '@/stores/publicOrganisms'
import { useUIStore } from '@/stores/ui'
import { PUBLIC_ACCOUNT_IDS } from '@/data/publicAccounts'
import { accountRoleLabel } from '@/utils/accountRole'
import { isCitizenAccount } from '@/utils/parseUserAccount'
import {
  applyCachedRoleToUser,
  setCachedUserRole,
} from '@/utils/userRoleCache'
import type { AdminUserDto } from '@/types/admin'
import type { PublicAccount } from '@/types'
import LoadingShimmer from '@/components/ui/LoadingShimmer.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import SheetPagination from '@/components/ui/SheetPagination.vue'
import { usePagination } from '@/composables/usePagination'

type BusyAction = 'certify' | 'recover' | 'otp'

const ui = useUIStore()
const organismsStore = usePublicOrganismsStore()

const users = ref<AdminUserDto[]>([])
const accounts = ref<PublicAccount[]>([])
const loading = ref(true)
const search = ref('')
const certFilter = ref<'all' | 'yes' | 'no'>('all')
const roleFilter = ref<'all' | 'citizen' | 'staff'>('all')
const selectedUser = ref<AdminUserDto | null>(null)
const assigning = ref(false)
const assignError = ref('')
const busy = ref<{ userId: number; action: BusyAction } | null>(null)

const confirmState = reactive<{
  open: boolean
  title: string
  message: string
  confirmLabel: string
  danger: boolean
  loading: boolean
  action: BusyAction | null
  user: AdminUserDto | null
}>({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmer',
  danger: false,
  loading: false,
  action: null,
  user: null,
})

const createOpen = ref(false)
const creating = ref(false)
const createError = ref('')
const createForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: 'Kinshasa',
  pseudo: '',
  password: '',
  confirmPassword: '',
})

const assignForm = reactive<{ accountId: number; organismId: number }>({
  accountId: PUBLIC_ACCOUNT_IDS.CITOYEN,
  organismId: 0,
})

const organisms = computed(() =>
  Array.isArray(organismsStore.organisms) ? organismsStore.organisms : [],
)

const needsOrganism = computed(() =>
  assignForm.accountId === PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE
  || assignForm.accountId === PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE,
)

const citizenCount = computed(() => users.value.filter(u => u.isCitizen !== false).length)
const staffCount = computed(() => users.value.filter(u => u.isCitizen === false).length)

const headerTotal = computed(() => {
  if (roleFilter.value === 'citizen') return filteredCitizens.value.length
  if (roleFilter.value === 'staff') return filteredStaff.value.length
  return filteredCitizens.value.length + filteredStaff.value.length
})

function normalize(s: string | undefined | null): string {
  return (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function displayName(u: AdminUserDto): string {
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
  return name || u.username || u.email || `User #${u.userId}`
}

function initials(u: AdminUserDto): string {
  const a = (u.firstName?.[0] ?? '').toUpperCase()
  const b = (u.lastName?.[0] ?? '').toUpperCase()
  if (a || b) return `${a}${b}` || '?'
  return (u.email?.[0] ?? '?').toUpperCase()
}

function searchBlob(u: AdminUserDto): string {
  return normalize([
    u.firstName,
    u.lastName,
    `${u.firstName} ${u.lastName}`,
    u.email,
    u.username,
    u.phone,
    u.city,
    String(u.userId),
  ].filter(Boolean).join(' '))
}

const filteredUsers = computed(() => {
  let list = users.value
  if (certFilter.value === 'yes') list = list.filter(u => !!u.certified)
  if (certFilter.value === 'no') list = list.filter(u => !u.certified)

  const raw = search.value.trim()
  if (!raw) return list

  const tokens = normalize(raw).split(/\s+/).filter(Boolean)
  return list.filter((u) => {
    const blob = searchBlob(u)
    return tokens.every(t => blob.includes(t))
  })
})

const filteredCitizens = computed(() =>
  filteredUsers.value.filter(u => u.isCitizen !== false),
)
const filteredStaff = computed(() =>
  filteredUsers.value.filter(u => u.isCitizen === false),
)

const {
  page: citizenPage,
  pageSize: citizenPageSize,
  total: citizenTotal,
  totalPages: citizenTotalPages,
  from: citizenFrom,
  to: citizenTo,
  pageItems: citizenPageItems,
} = usePagination(filteredCitizens, {
  resetOn: () => [search.value, certFilter.value, roleFilter.value],
})

const {
  page: staffPage,
  pageSize: staffPageSize,
  total: staffTotal,
  totalPages: staffTotalPages,
  from: staffFrom,
  to: staffTo,
  pageItems: staffPageItems,
} = usePagination(filteredStaff, {
  resetOn: () => [search.value, certFilter.value, roleFilter.value],
})

function isBusy(userId: number) {
  return busy.value?.userId === userId
}

function isAction(userId: number, action: BusyAction) {
  return busy.value?.userId === userId && busy.value.action === action
}

function apiErr(e: unknown): string {
  const err = e as { response?: { data?: { message?: string; detailMessage?: string } } }
  return err.response?.data?.message
    ?? err.response?.data?.detailMessage
    ?? 'Une erreur est survenue.'
}

function applyAccountToUser(u: AdminUserDto, accountId: number, organismId?: number | null) {
  u.accountId = accountId
  u.isCitizen = isCitizenAccount(accountId)
  u.organismId = organismId ?? undefined
  const acc = accounts.value.find(a => a.id === accountId)
  u.accountName = acc?.name
  u.roleLabel = acc?.name || accountRoleLabel(
    accountId === PUBLIC_ACCOUNT_IDS.SUPER_ADMIN ? 'super_admin'
      : accountId === PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE ? 'ministry_admin'
        : accountId === PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE ? 'commune_admin'
          : 'citizen',
  )
  u.roleResolved = true
  setCachedUserRole(u.userId, accountId, {
    organismId,
    roleLabel: u.roleLabel,
    accountName: u.accountName,
  })
}

async function enrichRoles(list: AdminUserDto[]) {
  // 1) Rôles déjà connus localement (après attribution API sans retour profil)
  for (const u of list) {
    if (!u.roleResolved) applyCachedRoleToUser(u, accounts.value)
  }

  // 2) Compléter via détail API quand le backend expose vraiment le compte
  const batchSize = 8
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize)
    const results = await Promise.allSettled(batch.map(u => getAdminUserDetail(u.userId)))
    results.forEach((res, idx) => {
      if (res.status !== 'fulfilled' || !res.value) return
      const detail = res.value
      const target = batch[idx]
      if (!target) return

      if (detail.roleResolved && detail.accountId != null) {
        target.accountId = detail.accountId
        target.accountName = detail.accountName
        target.roleLabel = detail.roleLabel
        target.isCitizen = detail.isCitizen
        target.organismId = detail.organismId
        target.organismName = detail.organismName
        target.organismCity = detail.organismCity
        target.roleResolved = true
        setCachedUserRole(target.userId, detail.accountId, {
          organismId: detail.organismId,
          roleLabel: detail.roleLabel,
          accountName: detail.accountName,
        })
      } else if (!target.roleResolved) {
        applyCachedRoleToUser(target, accounts.value)
      }

      if (detail.certified != null) target.certified = detail.certified
    })
  }
}

function openAssign(u: AdminUserDto) {
  selectedUser.value = u
  assignForm.accountId = u.accountId && !isCitizenAccount(u.accountId)
    ? u.accountId
    : PUBLIC_ACCOUNT_IDS.CITOYEN
  assignForm.organismId = organisms.value[0]?.id ?? 0
  assignError.value = ''
}

function openCreate() {
  createError.value = ''
  createForm.firstName = ''
  createForm.lastName = ''
  createForm.email = ''
  createForm.phone = ''
  createForm.city = 'Kinshasa'
  createForm.pseudo = ''
  createForm.password = ''
  createForm.confirmPassword = ''
  createOpen.value = true
}

async function load() {
  loading.value = true
  try {
    const [list, acc] = await Promise.all([
      getAdminUsers(),
      getPublicAccounts(),
      organismsStore.fetchOrganisms(),
    ])
    users.value = list
    accounts.value = acc
    for (const u of users.value) {
      if (!u.roleResolved) applyCachedRoleToUser(u, accounts.value)
    }
    void enrichRoles(list).then(() => {
      users.value = [...users.value]
    })
  } catch {
    ui.toast.error('Erreur', 'Impossible de charger les utilisateurs.')
  } finally {
    loading.value = false
  }
}

function closeConfirm() {
  if (confirmState.loading) return
  confirmState.open = false
  confirmState.action = null
  confirmState.user = null
}

function openConfirm(opts: {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  action: BusyAction
  user: AdminUserDto
}) {
  confirmState.open = true
  confirmState.title = opts.title
  confirmState.message = opts.message
  confirmState.confirmLabel = opts.confirmLabel
  confirmState.danger = opts.danger ?? false
  confirmState.loading = false
  confirmState.action = opts.action
  confirmState.user = opts.user
}

function toggleCertify(u: AdminUserDto) {
  const next = !u.certified
  openConfirm({
    title: next ? 'Certifier le compte' : 'Retirer la certification',
    message: next
      ? `Certifier le compte de ${displayName(u)} ?`
      : `Retirer la certification de ${displayName(u)} ?`,
    confirmLabel: next ? 'Certifier' : 'Retirer',
    danger: !next,
    action: 'certify',
    user: u,
  })
}

function recover(u: AdminUserDto) {
  openConfirm({
    title: 'Débloquer le compte',
    message: `Débloquer / récupérer le compte de ${u.email || displayName(u)} ?`,
    confirmLabel: 'Débloquer',
    action: 'recover',
    user: u,
  })
}

function resendOtp(u: AdminUserDto) {
  const identifier = (u.email || u.phone || '').trim()
  if (!identifier) {
    ui.toast.error('OTP', 'Aucun e-mail ni téléphone pour cet utilisateur.')
    return
  }
  openConfirm({
    title: 'Renvoyer le code OTP',
    message: `Renvoyer un code OTP d’activation à ${identifier} ?`,
    confirmLabel: 'Renvoyer',
    action: 'otp',
    user: u,
  })
}

async function runConfirmAction() {
  const u = confirmState.user
  const action = confirmState.action
  if (!u || !action) return

  confirmState.loading = true
  busy.value = { userId: u.userId, action }
  try {
    if (action === 'certify') {
      const next = !u.certified
      const res = await setUserCertification(u.userId, next)
      u.certified = next
      ui.toast.success(
        next ? 'Compte certifié' : 'Certification retirée',
        res.message ?? 'Mise à jour enregistrée.',
      )
    } else if (action === 'recover') {
      const res = await recoverUserAccount(u.userId)
      ui.toast.success('Compte débloqué', res.message ?? 'Récupération effectuée.')
    } else {
      const identifier = (u.email || u.phone || '').trim()
      const res = await adminGenerateOtp(identifier)
      ui.toast.success('OTP envoyé', res.message ?? 'Code envoyé.')
    }
    confirmState.open = false
    confirmState.action = null
    confirmState.user = null
  } catch (e) {
    ui.toast.error('Échec', apiErr(e))
  } finally {
    confirmState.loading = false
    busy.value = null
  }
}

async function submitAssign() {
  if (!selectedUser.value) return
  if (needsOrganism.value && !assignForm.organismId) {
    assignError.value = 'Sélectionnez un organisme pour ce rôle.'
    return
  }
  assigning.value = true
  assignError.value = ''
  try {
    const res = await assignUserRole({
      userId: selectedUser.value.userId,
      accountId: assignForm.accountId,
      organismId: needsOrganism.value ? assignForm.organismId : null,
    })
    ui.toast.success('Rôle attribué', res.message ?? 'Mise à jour enregistrée.')
    applyAccountToUser(
      selectedUser.value,
      assignForm.accountId,
      needsOrganism.value ? assignForm.organismId : null,
    )
    users.value = [...users.value]
    selectedUser.value = null
  } catch (e: unknown) {
    assignError.value = apiErr(e)
  } finally {
    assigning.value = false
  }
}

async function submitCreate() {
  createError.value = ''
  if (createForm.password.length < 6) {
    createError.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (createForm.password !== createForm.confirmPassword) {
    createError.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  if (!createForm.firstName.trim() || !createForm.lastName.trim() || !createForm.email.trim() || !createForm.city.trim()) {
    createError.value = 'Prénom, nom, e-mail et ville sont requis.'
    return
  }
  creating.value = true
  try {
    const res = await adminRegisterUser({ ...createForm })
    ui.toast.success('Compte créé', res.message ?? 'Utilisateur enregistré.')
    createOpen.value = false
    await load()
  } catch (e) {
    createError.value = apiErr(e)
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>
