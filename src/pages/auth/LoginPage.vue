<template>
  <div>
    <div class="flex items-start justify-between gap-4 mb-7">
      <div>
        <h2 class="font-display font-bold text-2xl text-gray-900 mb-1">Connexion</h2>
        <p class="text-gray-600 text-sm">Accédez à votre espace citoyen</p>
      </div>
      <RouterLink to="/" class="hidden sm:inline-flex text-sm text-gray-500 hover:text-brand transition-colors">
        Retour au site
      </RouterLink>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <p
        v-if="route.query.verified === '1'"
        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 mb-4"
      >
        Votre compte est validé. Vous pouvez vous connecter.
      </p>
      <p
        v-else-if="route.query.registered === '1'"
        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 mb-4"
      >
        Compte créé. Un code de vérification a été envoyé à votre adresse e-mail : confirmez-le, puis connectez-vous.
      </p>
      <div>
        <label class="form-label">Email ou identifiant</label>
        <div class="relative">
          <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.email"
            type="text"
            autocomplete="username"
            placeholder="email@exemple.com ou @Pseudo"
            class="form-field pl-11"
            :class="fieldErrors.email ? 'ring-1 ring-red-400/35 border-red-300' : ''"
          />
          <p v-if="fieldErrors.email" class="form-error text-xs mt-1">{{ fieldErrors.email }}</p>
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="form-label !mb-0">Mot de passe</label>
          <RouterLink to="/auth/forgot-password" class="text-xs text-brand hover:underline">Oublié ?</RouterLink>
        </div>
        <div class="relative">
          <LockKeyhole :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            class="form-field pl-11 pr-11"
            :class="fieldErrors.password ? 'ring-1 ring-red-400/35 border-red-300' : ''"
          />
          <p v-if="fieldErrors.password" class="form-error text-xs mt-1">{{ fieldErrors.password }}</p>
          <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            <Eye v-if="!showPassword" :size="17" />
            <EyeOff v-else :size="17" />
          </button>
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-500 flex items-center gap-1.5">
        <AlertCircle :size="13" /> {{ error }}
      </p>

      <button type="submit" class="btn-primary w-full btn-lg" :disabled="loading">
        <Loader2 v-if="loading" :size="18" class="animate-spin" />
        <LogIn v-else :size="18" />
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>

    <!-- Demo shortcut -->
    <div class="my-5 flex items-center gap-3">
      <div class="flex-1 h-px bg-gray-200"></div>
      <span class="text-xs text-gray-400">ou</span>
      <div class="flex-1 h-px bg-gray-200"></div>
    </div>
    <button @click="demoLogin" class="btn-outline w-full">
      <Sparkles :size="16" class="text-brand" />
      Mode démo (accès rapide)
    </button>

    <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
      <button @click="demoAdmin('commune_admin')" class="btn-outline w-full text-xs justify-center">
        Mode démo admin commune
      </button>
      <button @click="demoAdmin('ministry_admin')" class="btn-outline w-full text-xs justify-center">
        Mode démo admin ministère
      </button>
      <button @click="demoAdmin('super_admin')" class="btn-outline w-full text-xs justify-center">
        Mode démo super-admin
      </button>
    </div>

    <p class="mt-6 text-center text-sm text-gray-500">
      Pas encore de compte ?
      <RouterLink to="/auth/register" class="text-brand font-semibold hover:underline ml-1">Créer un compte</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, LogIn, Mail, Sparkles } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const auth   = useAuthStore()
const ui     = useUIStore()
const router = useRouter()
const route  = useRoute()

const form         = reactive({ email: '', password: '' })
const fieldErrors  = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading      = ref(false)
const error        = ref('')

function validateLogin(): boolean {
  fieldErrors.email = ''
  fieldErrors.password = ''
  let ok = true
  if (!form.email.trim()) {
    fieldErrors.email = 'Saisissez votre e-mail ou identifiant.'
    ok = false
  }
  if (!form.password) {
    fieldErrors.password = 'Saisissez votre mot de passe.'
    ok = false
  }
  return ok
}

async function handleLogin() {
  if (!validateLogin()) return
  loading.value = true
  error.value   = ''
  try {
    const res = await auth.login({ email: form.email, password: form.password })
    ui.toast.success('Bienvenue !', res.message || `Bonjour ${auth.fullName}`)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch {
    error.value = auth.error ?? 'Email ou mot de passe incorrect.'
  } finally {
    loading.value = false
  }
}

function demoLogin() {
  auth.demoLogin()
  ui.toast.success('Mode démo activé !', 'Bienvenue Emy Mayumbi')
  router.push('/dashboard')
}

function demoAdmin(role: 'commune_admin' | 'ministry_admin' | 'super_admin') {
  auth.demoAdminLogin(role)
  ui.toast.success('Mode démo activé !', `Connecté en tant que ${role}`)
  router.push('/admin')
}
</script>
