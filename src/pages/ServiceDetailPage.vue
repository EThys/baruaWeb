<template>
  <div v-if="service" class="pb-16">
    <!-- Hero -->
    <div class="hero-overlay py-10 relative overflow-hidden">
      <div class="absolute inset-0 jacquard-hero opacity-20 pointer-events-none" />
      <div class="page-container relative">
        <nav class="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
          <RouterLink to="/" class="hover:text-white">Accueil</RouterLink>
          <ChevronRight :size="12" />
          <RouterLink :to="`/services/${service.categorySlug}`" class="hover:text-white">{{ categoryName }}</RouterLink>
          <ChevronRight :size="12" />
          <span class="text-white">{{ service.title }}</span>
        </nav>
        <div class="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 class="font-display font-bold text-white text-3xl mb-2">{{ service.title }}</h1>
            <p class="text-blue-100 max-w-xl">{{ service.shortDescription }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-4">
              <span
                v-if="service.cost === 0 || service.cost === undefined"
                class="badge-gray"
              >Gratuit</span>
              <span
                v-else
                class="badge-gray"
              >{{ service.cost?.toLocaleString('fr-FR') }} FC</span>
              <span class="glass rounded-full px-3 py-1 text-white text-xs flex items-center gap-1">
                <Clock :size="12" /> {{ service.estimatedDuration }}
              </span>
              <span class="glass rounded-full px-3 py-1 text-white text-xs">{{ service.ministry }}</span>
            </div>
          </div>
          <RouterLink
            v-if="auth.isAuthenticated"
            :to="{ name: 'new-request', params: { serviceId: service.id } }"
            class="btn-white btn-lg shadow-glow shrink-0"
          >
            Déposer ma demande <ArrowRight :size="18" />
          </RouterLink>
          <RouterLink v-else :to="{ name: 'login', query: { redirect: `/dashboard/nouvelle-demande/${service.id}` } }" class="btn-white btn-lg shadow-glow shrink-0">
            Se connecter pour demander <ArrowRight :size="18" />
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="page-container py-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: details -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="card p-6 relative overflow-hidden">
            <div class="absolute inset-0 jacquard-bg opacity-4 pointer-events-none" />
            <h2 class="section-title text-lg mb-3">Description du service</h2>
            <p class="text-gray-600 text-sm leading-relaxed">{{ service.description }}</p>
          </div>

          <!-- Steps -->
          <div class="card p-6 relative overflow-hidden">
            <div class="absolute inset-0 jacquard-bg opacity-4 pointer-events-none" />
            <h2 class="section-title text-lg mb-5">Comment faire votre demande</h2>
            <div class="space-y-4">
              <div v-for="step in service.steps" :key="step.step" class="flex gap-4">
                <div class="status-step-active shrink-0">{{ step.step }}</div>
                <div class="flex-1 pb-4 border-b border-gray-100 last:border-0">
                  <p class="font-semibold text-gray-800 text-sm">{{ step.title }}</p>
                  <p class="text-gray-500 text-xs mt-1">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA vers formulaire guidé (étapes) -->
          <div v-if="auth.isAuthenticated" class="card p-8 relative overflow-hidden">
            <div class="absolute inset-0 jacquard-bg opacity-3 pointer-events-none" />
            <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h2 class="section-title text-lg mb-2">Déposer une demande</h2>
                <p class="text-gray-600 text-sm max-w-xl">
                  Le formulaire s’ouvre dans un parcours par étapes : coordonnées, informations du dossier, pièces jointes puis validation. Les champs sont contrôlés avant envoi.
                </p>
              </div>
              <RouterLink
                :to="{ name: 'new-request', params: { serviceId: service.id } }"
                class="btn-primary btn-lg shrink-0 justify-center"
              >
                Continuer vers le formulaire <ArrowRight :size="18" />
              </RouterLink>
            </div>
          </div>

          <!-- Not logged in call to action -->
          <div v-else class="card p-8 text-center border-2 border-dashed border-gray-200">
            <Lock :size="36" class="text-brand mx-auto mb-3" />
            <h3 class="font-semibold text-gray-800 mb-2">Connexion requise</h3>
            <p class="text-gray-500 text-sm mb-5">Connectez-vous ou créez un compte pour pouvoir soumettre cette demande.</p>
            <div class="flex justify-center gap-3">
              <RouterLink to="/auth/login" class="btn-outline">Se connecter</RouterLink>
              <RouterLink to="/auth/register" class="btn-primary">Créer un compte</RouterLink>
            </div>
          </div>
        </div>

        <!-- Right: sidebar info -->
        <div class="space-y-5">
          <!-- Info card -->
          <div class="card p-5 space-y-4 relative overflow-hidden">
            <div class="absolute inset-0 jacquard-bg opacity-3 pointer-events-none" />
            <h3 class="font-semibold text-gray-800 text-sm">Informations pratiques</h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Clock :size="15" class="text-brand" />
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Délai moyen</p>
                  <p class="font-medium text-gray-800">{{ service.estimatedDuration }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center shrink-0">
                  <CreditCard :size="15" class="text-brand" />
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Coût</p>
                  <p class="font-medium text-gray-800">
                    {{ service.cost === 0 || service.cost === undefined ? 'Gratuit' : `${service.cost?.toLocaleString('fr-FR')} FC` }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center shrink-0">
                  <Landmark :size="15" class="text-brand" />
                </div>
                <div>
                  <p class="text-gray-400 text-xs">Ministère</p>
                  <p class="font-medium text-gray-800 text-xs leading-snug">{{ service.ministry }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Required documents -->
          <div class="card p-5 relative overflow-hidden">
            <div class="absolute inset-0 jacquard-bg opacity-3 pointer-events-none" />
            <h3 class="font-semibold text-gray-800 text-sm mb-3">Documents requis</h3>
            <ul class="space-y-2">
              <li v-for="doc in service.requiredDocuments" :key="doc.id"
                class="flex items-start gap-2 text-sm">
                <CheckCircle v-if="doc.required" :size="14" class="text-green-500 shrink-0 mt-0.5" />
                <Circle v-else :size="14" class="text-gray-300 shrink-0 mt-0.5" />
                <span :class="doc.required ? 'text-gray-700' : 'text-gray-400'">{{ doc.label }}</span>
              </li>
            </ul>
            <p class="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <Info :size="11" /> Documents optionnels en gris
            </p>
          </div>

          <!-- Tags -->
          <div class="card p-5 relative overflow-hidden">
            <div class="absolute inset-0 jacquard-bg opacity-3 pointer-events-none" />
            <h3 class="font-semibold text-gray-800 text-sm mb-3">Mots-clés</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in service.tags" :key="tag" class="badge-gray">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="text-center py-20">
    <p class="text-gray-400">Service introuvable.</p>
    <RouterLink to="/services" class="btn-outline btn-sm mt-4">Retour aux services</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowRight, CheckCircle, ChevronRight, Circle, Clock, CreditCard,
  Info, Landmark, Lock,
} from 'lucide-vue-next'
import { useServicesStore } from '@/stores/services'
import { useAuthStore } from '@/stores/auth'

const route   = useRoute()
const store   = useServicesStore()
const auth    = useAuthStore()

const service      = computed(() => store.getServiceById(route.params.serviceId as string))
const categoryName = computed(() => store.getCategoryBySlug(service.value?.categorySlug ?? '')?.name ?? '')

</script>
