<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Mon profil</h1>
        <p class="text-sm text-gray-500 mt-1">Gérez vos informations personnelles et la sécurité du compte.</p>
      </div>
      <button @click="logout" class="btn border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors">
        <LogOut :size="16" /> Se déconnecter
      </button>
    </div>

    <div class="card p-8 relative overflow-hidden">
      <div class="absolute inset-0 jacquard-bg opacity-[0.04] pointer-events-none" />

      <!-- Header -->
      <div class="flex items-center gap-5 mb-8 relative">
        <div class="w-20 h-20 rounded-2xl bg-hero-gradient flex items-center justify-center text-white text-2xl font-display font-bold shadow-md">
          {{ auth.initials }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="font-display font-bold text-xl text-gray-900 truncate">{{ auth.fullName }}</h2>
          <p class="text-sm text-gray-500 truncate">{{ auth.user?.email }}</p>
          <span
            v-if="auth.user?.isVerified"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/5 text-brand text-xs font-semibold mt-2 border border-brand/15"
          >
            <ShieldCheck :size="13" /> Compte vérifié
          </span>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="save" class="space-y-5 relative">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label-text">Prénom</label>
            <div class="relative">
              <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input v-model="form.firstName" type="text" class="input-field pl-11" placeholder="Votre prénom" />
            </div>
          </div>
          <div>
            <label class="label-text">Nom</label>
            <div class="relative">
              <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input v-model="form.lastName" type="text" class="input-field pl-11" placeholder="Votre nom" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label-text">Email</label>
            <div class="relative">
              <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input v-model="form.email" type="email" class="input-field pl-11" placeholder="email@exemple.com" />
            </div>
          </div>
          <div>
            <label class="label-text">Téléphone</label>
            <div class="relative">
              <Phone :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input v-model="form.phone" type="tel" class="input-field pl-11" placeholder="+243 ..." />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label-text">Ville</label>
            <input v-model="form.city" type="text" class="input-field" placeholder="Kinshasa" />
          </div>
          <div>
            <label class="label-text">Pseudo</label>
            <input v-model="form.pseudo" type="text" class="input-field" placeholder="Identifiant public" />
          </div>
        </div>

        <div>
          <label class="label-text">Numéro CNI</label>
          <div class="relative">
            <CreditCard :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input :value="auth.user?.nationalId" type="text" class="input-field pl-11 bg-gray-50" disabled />
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" :disabled="saving" class="btn-primary">
            <Loader2 v-if="saving" :size="16" class="animate-spin" /> Enregistrer
          </button>
          <button type="button" @click="resetForm" class="btn-outline">Annuler</button>
          <span class="ml-auto text-xs text-gray-400 hidden sm:inline-flex items-center gap-1.5">
            <ShieldCheck :size="14" class="text-brand/70" /> Données protégées
          </span>
        </div>
      </form>
    </div>

    <!-- Security section -->
    <div class="card p-6 relative overflow-hidden">
      <div class="absolute inset-0 jacquard-bg opacity-[0.03] pointer-events-none" />
      <h3 class="font-semibold text-gray-900 mb-4 relative">Sécurité</h3>
      <p class="text-sm text-gray-500 mb-4 relative">Modifiez votre mot de passe (connexion requise).</p>
      <div class="relative max-w-md">
        <ChangePasswordForm />
      </div>
    </div>

    <!-- Danger zone -->
    <div class="card p-6 border border-red-100 relative overflow-hidden">
      <h3 class="font-semibold text-red-700 mb-2">Zone sensible</h3>
      <p class="text-sm text-gray-500 mb-4">
        Supprimer / verrouiller votre compte (API
        <code class="text-xs bg-gray-100 px-1 rounded">DELETE protected/users/delete/user</code>).
        Cette action concerne uniquement le compte connecté.
      </p>
      <button
        type="button"
        class="btn border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        :disabled="deleting"
        @click="openDeleteConfirm"
      >
        {{ deleting ? 'Suppression…' : 'Supprimer mon compte' }}
      </button>
    </div>

    <ConfirmModal
      :open="deleteConfirmOpen"
      title="Supprimer le compte"
      message="Confirmer la suppression / le verrouillage de votre compte ? Cette action est irréversible."
      confirm-label="Supprimer"
      danger
      :loading="deleting"
      size="sm"
      @confirm="deleteAccount"
      @cancel="closeDeleteConfirm"
      @close="closeDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, Loader2, LogOut, Mail, Phone, ShieldCheck, User } from 'lucide-vue-next'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { deleteOwnAccount, updateAdminUser } from '@/api/adminAuth'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const auth   = useAuthStore()
const ui     = useUIStore()
const router = useRouter()
const saving = ref(false)
const deleting = ref(false)
const deleteConfirmOpen = ref(false)

const form = ref({
  firstName: auth.user?.firstName ?? '',
  lastName:  auth.user?.lastName  ?? '',
  email:     auth.user?.email     ?? '',
  phone:     auth.user?.phone     ?? '',
  city:      auth.user?.city      ?? '',
  pseudo:    auth.user?.username  ?? '',
})

function resetForm() {
  form.value = {
    firstName: auth.user?.firstName ?? '',
    lastName:  auth.user?.lastName  ?? '',
    email:     auth.user?.email     ?? '',
    phone:     auth.user?.phone     ?? '',
    city:      auth.user?.city      ?? '',
    pseudo:    auth.user?.username  ?? '',
  }
}

async function save() {
  const userId = Number(auth.user?.id)
  if (!Number.isFinite(userId) || userId <= 0) {
    ui.toast.error('Erreur', 'Identifiant utilisateur invalide.')
    return
  }
  saving.value = true
  try {
    const res = await updateAdminUser(userId, {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim() || '',
      city: form.value.city.trim() || 'Kinshasa',
      pseudo: form.value.pseudo.trim() || form.value.email.trim().split('@')[0] || 'user',
    })
    if (auth.user) {
      auth.user.firstName = form.value.firstName.trim()
      auth.user.lastName = form.value.lastName.trim()
      auth.user.email = form.value.email.trim()
      auth.user.phone = form.value.phone.trim()
      auth.user.city = form.value.city.trim()
      auth.user.username = form.value.pseudo.trim() || auth.user.username
      localStorage.setItem('barua_user', JSON.stringify(auth.user))
    }
    ui.toast.success('Profil mis à jour', res.message ?? 'Vos informations ont été enregistrées.')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    ui.toast.error('Échec', err.response?.data?.message ?? 'Impossible d’enregistrer le profil.')
  } finally {
    saving.value = false
  }
}

function openDeleteConfirm() {
  if (deleting.value) return
  deleteConfirmOpen.value = true
}

function closeDeleteConfirm() {
  if (deleting.value) return
  deleteConfirmOpen.value = false
}

async function deleteAccount() {
  deleting.value = true
  try {
    const res = await deleteOwnAccount()
    ui.toast.success('Compte supprimé', res.message ?? 'Votre compte a été verrouillé.')
    deleteConfirmOpen.value = false
    auth.logout()
    router.push({ name: 'home' })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    ui.toast.error('Échec', err.response?.data?.message ?? 'Impossible de supprimer le compte.')
  } finally {
    deleting.value = false
  }
}

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>
