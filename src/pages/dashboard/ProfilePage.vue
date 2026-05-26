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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, Loader2, LogOut, Mail, Phone, ShieldCheck, User } from 'lucide-vue-next'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const auth   = useAuthStore()
const ui     = useUIStore()
const router = useRouter()
const saving = ref(false)

const form = ref({
  firstName: auth.user?.firstName ?? '',
  lastName:  auth.user?.lastName  ?? '',
  email:     auth.user?.email     ?? '',
  phone:     auth.user?.phone     ?? '',
})

function resetForm() {
  form.value = {
    firstName: auth.user?.firstName ?? '',
    lastName:  auth.user?.lastName  ?? '',
    email:     auth.user?.email     ?? '',
    phone:     auth.user?.phone     ?? '',
  }
}

async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 800))
  // In production, call auth.updateProfile(form.value)
  saving.value = false
  ui.toast.success('Profil mis à jour', 'Vos informations ont été enregistrées.')
}

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>
