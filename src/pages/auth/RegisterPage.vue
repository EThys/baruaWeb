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
            <input
              v-model="form.lastName"
              type="text"
              placeholder="MAYUMBI"
              class="form-field pl-11 uppercase"
              :class="fieldClass('lastName')"
            />
            <p v-if="fieldErrors.lastName" class="form-error text-xs mt-1">{{ fieldErrors.lastName }}</p>
          </div>
        </div>
        <div>
          <label class="form-label">Prénom(s)</label>
          <div class="relative">
            <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="form.firstName"
              type="text"
              placeholder="Emy"
              class="form-field pl-11"
              :class="fieldClass('firstName')"
            />
            <p v-if="fieldErrors.firstName" class="form-error text-xs mt-1">{{ fieldErrors.firstName }}</p>
          </div>
        </div>
      </div>
      <div>
        <label class="form-label">Email</label>
        <div class="relative">
          <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.email"
            type="text"
            inputmode="email"
            autocomplete="email"
            placeholder="emymuyumbi@gmail.com"
            class="form-field pl-11"
            :class="fieldClass('email')"
          />
          <p v-if="fieldErrors.email" class="form-error text-xs mt-1">{{ fieldErrors.email }}</p>
        </div>
      </div>
      <div>
        <label class="form-label">Pseudo <span class="text-gray-400 font-normal">(optionnel)</span></label>
        <div class="relative">
          <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.pseudo"
            type="text"
            placeholder="Longoria"
            class="form-field pl-11"
            autocomplete="username"
            :class="fieldClass('pseudo')"
          />
          <p v-if="fieldErrors.pseudo" class="form-error text-xs mt-1">{{ fieldErrors.pseudo }}</p>
        </div>
        <p class="text-[11px] text-gray-400 mt-1">Affiché comme @Pseudo sur la plateforme.</p>
      </div>
      <div>
        <label class="form-label">Ville</label>
        <div class="relative">
          <MapPin :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.city"
            type="text"
            placeholder="Kinshasa"
            class="form-field pl-11"
            :class="fieldClass('city')"
          />
          <p v-if="fieldErrors.city" class="form-error text-xs mt-1">{{ fieldErrors.city }}</p>
        </div>
      </div>
      <div>
        <label class="form-label">Téléphone</label>
        <div
          class="flex rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow"
          :class="fieldErrors.phone ? 'ring-1 ring-red-400/35 border-red-300' : 'focus-within:ring-2 focus-within:ring-brand/25 focus-within:border-brand'"
        >
          <div
            class="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-r border-gray-200 shrink-0 select-none"
            title="République démocratique du Congo"
          >
            <span class="text-xl leading-none" role="img" aria-label="Drapeau RDC">🇨🇩</span>
            <span class="text-sm font-medium text-gray-800 tabular-nums">+243</span>
          </div>
          <input
            v-model="form.phoneLocal"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="tel-national"
            placeholder="8XX XXX XXX"
            class="min-w-0 flex-1 border-0 py-2.5 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
            aria-label="Numéro de mobile (sans indicatif)"
          />
        </div>
        <p v-if="fieldErrors.phone" class="form-error text-xs mt-1">{{ fieldErrors.phone }}</p>
      </div>
      <div>
        <label class="form-label">Mot de passe</label>
        <div class="relative">
          <LockKeyhole :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Minimum 6 caractères"
            class="form-field pl-11 pr-11"
            :class="fieldClass('password')"
          />
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
        <p v-if="fieldErrors.password" class="form-error text-xs mt-1">{{ fieldErrors.password }}</p>
      </div>
      <div>
        <label class="form-label">Confirmer le mot de passe</label>
        <div class="relative">
          <ShieldCheck :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.confirmPassword"
            :type="showPwd ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Répéter le mot de passe"
            class="form-field pl-11"
            :class="fieldClass('confirmPassword')"
          />
        </div>
        <p v-if="fieldErrors.confirmPassword" class="form-error text-xs mt-1">{{ fieldErrors.confirmPassword }}</p>
      </div>

      <label class="flex items-start gap-2 cursor-pointer rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
        <input v-model="accepted" type="checkbox" class="mt-1 accent-brand" />
        <span class="text-xs text-gray-500">
          J'accepte les <a href="#" class="text-brand font-medium hover:underline">Conditions d'utilisation</a>
          et la <a href="#" class="text-brand font-medium hover:underline">Politique de confidentialité</a>.
        </span>
      </label>
      <p v-if="termsError" class="form-error text-xs">{{ termsError }}</p>

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
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail, MapPin, ShieldCheck, User, UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useVerificationStore } from '@/stores/verification'
import { persistPendingLoginCredentials } from '@/utils/verificationSession'

const auth   = useAuthStore()
const ui     = useUIStore()
const verify = useVerificationStore()
const router = useRouter()

const form = reactive({
  lastName: '', firstName: '', email: '',
  pseudo: '', city: 'Kinshasa', phoneLocal: '',
  password: '', confirmPassword: '',
})
const showPwd  = ref(false)
const accepted = ref(false)
const loading  = ref(false)
const error    = ref('')
const termsError = ref('')
const fieldErrors = reactive({
  lastName: '',
  firstName: '',
  email: '',
  pseudo: '',
  city: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

function clearFieldErrors() {
  Object.keys(fieldErrors).forEach(k => {
    fieldErrors[k as keyof typeof fieldErrors] = ''
  })
  termsError.value = ''
}

function fieldClass(name: keyof typeof fieldErrors) {
  return fieldErrors[name] ? 'ring-1 ring-red-400/35 border-red-300' : ''
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Chiffres locaux RDC : retire 243/0 en tête si l’utilisateur les a collés. */
function normalizeCdLocalDigits(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('243')) d = d.slice(3)
  d = d.replace(/^0+/, '')
  return d
}

function fullCdE164Phone(localRaw: string): string {
  return `+243${normalizeCdLocalDigits(localRaw)}`
}

function validateRegister(): boolean {
  clearFieldErrors()
  let ok = true
  if (!form.lastName.trim()) {
    fieldErrors.lastName = 'Le nom est obligatoire.'
    ok = false
  }
  if (!form.firstName.trim()) {
    fieldErrors.firstName = 'Le prénom est obligatoire.'
    ok = false
  }
  const em = form.email.trim()
  if (!em || !EMAIL_RE.test(em)) {
    fieldErrors.email = 'Saisissez une adresse e-mail valide.'
    ok = false
  }
  if (!form.city.trim()) {
    fieldErrors.city = 'La ville est obligatoire.'
    ok = false
  }
  const local = normalizeCdLocalDigits(form.phoneLocal)
  if (!form.phoneLocal.trim() || local.length < 9) {
    fieldErrors.phone = 'Saisissez 9 chiffres (numéro mobile RDC).'
    ok = false
  }
  if (form.password.length < 6) {
    fieldErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    ok = false
  }
  if (form.password !== form.confirmPassword) {
    fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    ok = false
  }
  if (!accepted.value) {
    termsError.value = 'Vous devez accepter les conditions pour continuer.'
    ok = false
  }
  return ok
}

const strengthLevel = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6)          s++
  if (/[A-Z]/.test(p))        s++
  if (/[0-9]/.test(p))        s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const strengthColor = computed(() => ['bg-gray-300', 'bg-brand/40', 'bg-brand/70', 'bg-brand'][strengthLevel.value - 1] ?? 'bg-gray-200')
const strengthLabel = computed(() => ['','Faible','Passable','Bon','Très fort'][strengthLevel.value] ?? '')

async function handleRegister() {
  if (!validateRegister()) return
  loading.value = true; error.value = ''
  try {
    const res = await auth.register({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email,
      pseudo: form.pseudo.trim() || undefined,
      city: form.city, phone: fullCdE164Phone(form.phoneLocal),
      password: form.password, confirmPassword: form.confirmPassword,
    })
    const email = form.email.trim()
    verify.setIdentifier(email)
    persistPendingLoginCredentials(email, form.password)
    ui.toast.success('Inscription', res.message)
    // Un seul envoi d’OTP : l’e-mail vient de l’inscription. Pas d’appel /otp/generate ici.
    router.push({
      name: 'verify-email',
      query: { identifier: email },
    })
  } catch {
    error.value = auth.error ?? 'Erreur lors de la création du compte.'
  } finally {
    loading.value = false
  }
}
</script>
