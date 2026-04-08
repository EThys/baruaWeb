<template>
  <div>
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 class="font-display font-bold text-2xl text-gray-900 mb-1">Créer un compte</h2>
        <p class="text-gray-600 text-sm">Rejoignez la plateforme officielle des services de l'État</p>
      </div>
      <RouterLink to="/" class="hidden sm:inline-flex text-sm text-gray-500 hover:text-brand transition-colors">
        Retour au site
      </RouterLink>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Nom</label>
          <div class="relative">
            <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input v-model="form.lastName" type="text" required placeholder="MAYUMBI" class="form-field pl-11 uppercase" />
          </div>
        </div>
        <div>
          <label class="form-label">Prénom(s)</label>
          <div class="relative">
            <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input v-model="form.firstName" type="text" required placeholder="Emy" class="form-field pl-11" />
          </div>
        </div>
      </div>
      <div>
        <label class="form-label">Email</label>
        <div class="relative">
          <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="form.email" type="email" required placeholder="jean@example.com" class="form-field pl-11" />
        </div>
      </div>
      <div>
        <label class="form-label">Téléphone (optionnel)</label>
        <div class="relative">
          <Phone :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="form.phone" type="tel" placeholder="+228 90 00 00 00" class="form-field pl-11" />
        </div>
      </div>
      <div>
        <label class="form-label">Mot de passe</label>
        <div class="relative">
          <LockKeyhole :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="form.password" :type="showPwd ? 'text' : 'password'" required placeholder="Minimum 8 caractères" class="form-field pl-11 pr-11" minlength="8" />
          <button type="button" @click="showPwd = !showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            <Eye v-if="!showPwd" :size="17" /><EyeOff v-else :size="17" />
          </button>
        </div>
        <!-- Strength bar -->
        <div class="mt-1.5 flex gap-1">
          <div
            v-for="n in 4"
            :key="n"
            :class="['h-1 flex-1 rounded-full transition-all', strengthLevel >= n ? strengthColor : 'bg-gray-200']"
          ></div>
        </div>
        <p class="text-[11px] mt-1" :class="strengthLevel >= 3 ? 'text-brand' : 'text-gray-400'">
          {{ strengthLabel }}
        </p>
      </div>
      <div>
        <label class="form-label">Confirmer le mot de passe</label>
        <div class="relative">
          <ShieldCheck :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="form.confirmPassword" :type="showPwd ? 'text' : 'password'" required placeholder="Répéter le mot de passe" class="form-field pl-11" />
        </div>
        <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="form-error">Les mots de passe ne correspondent pas.</p>
      </div>

      <label class="flex items-start gap-2 cursor-pointer rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
        <input v-model="accepted" type="checkbox" class="mt-1 accent-brand" />
        <span class="text-xs text-gray-500">
          J'accepte les <a href="#" class="text-brand font-medium hover:underline">Conditions d'utilisation</a>
          et la <a href="#" class="text-brand font-medium hover:underline">Politique de confidentialité</a>.
        </span>
      </label>

      <p v-if="error" class="text-xs text-red-500 flex items-center gap-1.5">
        <AlertCircle :size="13" /> {{ error }}
      </p>

      <button type="submit" class="btn-primary w-full btn-lg" :disabled="loading || !accepted">
        <Loader2 v-if="loading" :size="18" class="animate-spin" />
        <UserPlus v-else :size="18" />
        {{ loading ? 'Création…' : 'Créer mon compte' }}
      </button>
    </form>

    <p class="mt-5 text-center text-sm text-gray-500">
      Déjà inscrit ?
      <RouterLink to="/auth/login" class="text-brand font-semibold hover:underline ml-1">Se connecter</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, ShieldCheck, User, UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const auth   = useAuthStore()
const ui     = useUIStore()
const router = useRouter()

const form = reactive({
  lastName: '', firstName: '', email: '',
  phone: '', password: '', confirmPassword: '',
})
const showPwd  = ref(false)
const accepted = ref(false)
const loading  = ref(false)
const error    = ref('')

const strengthLevel = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8)          s++
  if (/[A-Z]/.test(p))        s++
  if (/[0-9]/.test(p))        s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const strengthColor = computed(() => ['bg-gray-300', 'bg-brand/40', 'bg-brand/70', 'bg-brand'][strengthLevel.value - 1] ?? 'bg-gray-200')
const strengthLabel = computed(() => ['','Faible','Passable','Bon','Très fort'][strengthLevel.value] ?? '')

async function handleRegister() {
  if (form.password !== form.confirmPassword) { error.value = 'Mots de passe différents.'; return }
  loading.value = true; error.value = ''
  try {
    await auth.register({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, phone: form.phone,
      password: form.password, confirmPassword: form.confirmPassword,
    })
    ui.toast.success('Compte créé !', `Bienvenue ${auth.fullName}`)
    router.push('/dashboard')
  } catch {
    error.value = auth.error ?? 'Erreur lors de la création du compte.'
  } finally {
    loading.value = false
  }
}
</script>
