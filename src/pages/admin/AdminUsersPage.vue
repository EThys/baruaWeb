<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display font-bold text-2xl text-gray-900">Utilisateurs</h1>
      <p class="text-sm text-gray-500 mt-1">Liste des comptes et attribution des rôles (compte + organisme).</p>
    </div>

    <div class="card p-4">
      <input
        v-model="search"
        type="search"
        class="form-field"
        placeholder="Rechercher par nom, e-mail…"
      />
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Chargement…</div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100 bg-gray-50/80">
              <th class="py-3 px-4">Utilisateur</th>
              <th class="py-3 px-4">E-mail</th>
              <th class="py-3 px-4">Ville</th>
              <th class="py-3 px-4">Certifié</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in filteredUsers"
              :key="u.userId"
              class="border-b border-gray-50 hover:bg-gray-50/50"
            >
              <td class="py-3 px-4 font-medium text-gray-800">
                {{ u.firstName }} {{ u.lastName }}
                <span v-if="u.username" class="block text-xs text-gray-400 font-normal">{{ u.username }}</span>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ u.email }}</td>
              <td class="py-3 px-4 text-gray-600">{{ u.city || '—' }}</td>
              <td class="py-3 px-4">
                <span
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="u.certified ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'"
                >
                  {{ u.certified ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button type="button" class="btn-outline btn-sm" @click="openAssign(u)">
                  Attribuer un rôle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredUsers.length" class="p-8 text-center text-gray-500">Aucun utilisateur trouvé.</p>
    </div>

  <!-- Modal attribution -->
    <div
      v-if="selectedUser"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      @click.self="selectedUser = null"
    >
      <div class="card p-6 w-full max-w-md space-y-4">
        <h2 class="font-semibold text-gray-900">Attribuer un rôle</h2>
        <p class="text-sm text-gray-600">
          {{ selectedUser.firstName }} {{ selectedUser.lastName }} — {{ selectedUser.email }}
        </p>

        <div>
          <label class="form-label">Type de compte</label>
          <select v-model.number="assignForm.profileId" class="form-field">
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

        <p v-if="assignError" class="text-sm text-red-600">{{ assignError }}</p>

        <div class="flex gap-3 justify-end">
          <button type="button" class="btn-outline" @click="selectedUser = null">Annuler</button>
          <button type="button" class="btn-primary" :disabled="assigning" @click="submitAssign">
            {{ assigning ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { assignUserRoles, getAdminUsers, getPublicAccounts } from '@/api/admin'
import { usePublicOrganismsStore } from '@/stores/publicOrganisms'
import { useUIStore } from '@/stores/ui'
import { PUBLIC_ACCOUNT_IDS } from '@/data/publicAccounts'
import type { AdminUserDto } from '@/types/admin'
import type { PublicAccount } from '@/types'

const ui = useUIStore()
const organismsStore = usePublicOrganismsStore()

const users = ref<AdminUserDto[]>([])
const accounts = ref<PublicAccount[]>([])
const loading = ref(true)
const search = ref('')
const selectedUser = ref<AdminUserDto | null>(null)
const assigning = ref(false)
const assignError = ref('')

const assignForm = reactive<{ profileId: number; organismId: number }>({
  profileId: PUBLIC_ACCOUNT_IDS.CITOYEN,
  organismId: 0,
})

const organisms = computed(() =>
  Array.isArray(organismsStore.organisms) ? organismsStore.organisms : [],
)

const needsOrganism = computed(() =>
  assignForm.profileId === PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE
  || assignForm.profileId === PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE,
)

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.email.toLowerCase().includes(q)
    || u.firstName.toLowerCase().includes(q)
    || u.lastName.toLowerCase().includes(q),
  )
})

function openAssign(u: AdminUserDto) {
  selectedUser.value = u
  assignForm.profileId = PUBLIC_ACCOUNT_IDS.CITOYEN
  assignForm.organismId = organisms.value[0]?.id ?? 0
  assignError.value = ''
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
  } catch {
    ui.toast.error('Erreur', 'Impossible de charger les utilisateurs.')
  } finally {
    loading.value = false
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
    const role = {
      profileId: assignForm.profileId,
      organismId: needsOrganism.value ? assignForm.organismId : null,
    }
    const res = await assignUserRoles(selectedUser.value.userId, { roles: [role] })
    ui.toast.success('Rôle attribué', res.message ?? 'Mise à jour enregistrée.')
    selectedUser.value = null
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    assignError.value = err.response?.data?.message ?? 'Échec de l’attribution.'
  } finally {
    assigning.value = false
  }
}

onMounted(load)
</script>
