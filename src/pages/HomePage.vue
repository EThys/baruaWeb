<template>
  <div>
    <!-- HERO SECTION -->
    <section class="relative pt-20 pb-28 overflow-hidden bg-hero-gradient">
      <!-- Background image (Animal) -->
      <img
        :src="animalImg"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-left opacity-[0.14] pointer-events-none select-none"
      />
      <!-- Lighten: remove stormy look (no dark overlay), keep readability -->
      <div class="absolute inset-0 bg-gradient-to-b from-brand-dark/10 via-transparent to-brand-dark/10 pointer-events-none" />
      <div class="absolute inset-0 jacquard-hero opacity-15 pointer-events-none" />

      <!-- Armoiries RDC (filigrane, à droite) -->
      <div class="absolute inset-y-0 right-0 w-1/2 pointer-events-none flex items-center justify-end overflow-hidden">
        <img
          :src="armoiryImg"
          alt=""
          class="w-[min(92vw,580px)] h-auto max-h-[min(88vh,580px)] sm:w-[580px] sm:max-h-[580px] -mr-20 sm:-mr-32 object-contain object-right opacity-[0.12] select-none"
        />
      </div>

      <div class="page-container relative z-10 text-center">
        <div
          v-reveal="{
            stagger: '[data-reveal-item]',
            staggerMs: 130,
            variant: 'up',
            once: true,
            margin: '0px 0px 0px 0px',
            threshold: 0.01,
          }"
        >
          <h1
            data-reveal-item
            class="font-display font-bold text-white text-3xl sm:text-4xl lg:text-6xl leading-tight mb-6"
          >
            Vos démarches administratives,<br class="hidden sm:block" /> réunies au même endroit
          </h1>
          <p data-reveal-item class="text-blue-100/90 max-w-2xl mx-auto mb-10">
            Retrouvez les services de l’État, déposez vos dossiers en ligne et suivez chaque étape de votre demande avec clarté et sérénité.
          </p>

          <!-- Search bar -->
          <div
            data-reveal-item
            class="relative flex max-w-3xl mx-auto bg-white rounded-2xl overflow-hidden shadow-hero ring-1 ring-gray-900/5"
          >
          <div class="absolute inset-0 jacquard-bg opacity-10 pointer-events-none" />
          <input
            v-model="searchQuery"
            @keyup.enter="doSearch"
            type="text"
            placeholder="Rechercher un service, un mot-clé…"
            class="flex-1 relative px-6 sm:px-8 py-4 sm:py-5 border-0 focus:ring-0 text-gray-800 text-base sm:text-lg focus:outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            @click="doSearch"
            class="relative flex min-w-[3.25rem] items-center justify-center bg-brand-accent px-4 py-4 font-medium text-white transition-colors hover:bg-brand sm:min-w-0 sm:px-10 sm:py-5"
            aria-label="Rechercher"
          >
            <Search :size="22" class="shrink-0 sm:mr-2" />
            <span class="hidden sm:inline">Rechercher</span>
          </button>
        </div>
        </div>
      </div>
    </section>

    <!-- OVERLAPPING CATEGORIES -->
    <section v-reveal="{ variant: 'scale', duration: 820 }" class="page-container relative z-20 -mt-14 mb-16 hidden md:block">
      <div class="relative">
        <div class="absolute inset-0 -z-10 jacquard-bg opacity-6 rounded-3xl" />
        <!-- Bannière catégories : lignes haut / bas tricolore RDC (3 bandes nettes, sans fusion) -->
        <div class="rounded-2xl shadow-hero overflow-hidden text-brand ring-1 ring-gray-900/5">
          <div class="flex h-1 sm:h-1.5 w-full shrink-0" aria-hidden="true">
            <div class="flex-1 min-w-0 bg-rdc-yellow" />
            <div class="flex-1 min-w-0 bg-rdc-blue" />
            <div class="flex-1 min-w-0 bg-rdc-red" />
          </div>
          <div class="bg-white flex border-x border-gray-100/50">
            <RouterLink
              v-for="cat in mainCategories"
              :key="cat.id"
              :to="`/services/${cat.slug}`"
              class="flex-1 p-8 flex flex-col items-center justify-center text-center gap-4 hover:bg-brand/5 border-r border-gray-100 last:border-0 transition-all duration-300 group"
            >
              <div class="w-16 h-16 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center group-hover:bg-brand/10 transition-colors duration-300 text-brand mb-1">
                <component :is="catIcon(cat.icon)" :size="32" stroke-width="1.5" />
              </div>
              <div class="flex flex-col items-center">
                <p class="font-semibold text-gray-800 text-sm group-hover:text-brand transition-colors">{{ cat.name }}</p>
              </div>
            </RouterLink>
          </div>
          <div class="flex h-1 sm:h-1.5 w-full shrink-0" aria-hidden="true">
            <div class="flex-1 min-w-0 bg-rdc-yellow" />
            <div class="flex-1 min-w-0 bg-rdc-blue" />
            <div class="flex-1 min-w-0 bg-rdc-red" />
          </div>
        </div>
      </div>
    </section>

    <!-- MOBILE CATEGORIES (Fallback) -->
    <section v-reveal="{ variant: 'up', stagger: 'a', staggerMs: 70 }" class="page-container mb-16 mt-8 md:hidden">
      <div class="grid grid-cols-2 gap-4">
        <RouterLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/services/${cat.slug}`"
          class="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center gap-2 overflow-hidden group"
        >
          <div class="absolute inset-0 jacquard-bg opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
          <component :is="catIcon(cat.icon)" :size="32" class="text-brand" stroke-width="1.5" />
          <div class="flex flex-col items-center">
            <p class="font-medium text-gray-800 text-xs">{{ cat.name }}</p>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- POPULAR SERVICES -->
    <section v-reveal="{ variant: 'fade', duration: 880 }" class="py-16 bg-surface-muted/40">
      <div class="page-container relative">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 relative overflow-hidden">
          <div class="absolute inset-0 -z-10 jacquard-bg opacity-4 pointer-events-none" />

          <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div class="min-w-[220px]">
              <h2 class="section-title">Services les plus demandés</h2>
              <p class="section-subtitle">Les démarches que les citoyens utilisent le plus</p>
            </div>
            <RouterLink to="/services" class="btn-outline hidden sm:inline-flex text-brand border-brand/20 hover:bg-brand/5 font-medium px-5">
              Explorer tous les services <ArrowRight :size="16" class="ml-1.5" />
            </RouterLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ServiceCard v-for="service in popularServices" :key="service.id" :service="service" />
          </div>

          <!-- Mobile only CTA -->
          <div class="text-center mt-10 sm:hidden">
            <RouterLink to="/services" class="btn-primary btn-lg w-full justify-center">
              Explorer tous les services <ArrowRight :size="18" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section ref="howItWorksEl" class="relative overflow-hidden py-16 mb-10 sm:mb-14">
      <!-- Background (parallaxe liée à la position de la section dans l’écran) -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute inset-0 bg-hero-gradient" />
        <div
          class="absolute inset-0 jacquard-hero opacity-20 will-change-transform"
          :style="{ transform: `translate3d(0, ${hiwJacquardY}px, 0)` }"
        />
        <img
          :src="animalImg"
          alt=""
          class="absolute -right-20 -top-24 w-[680px] h-[680px] object-cover opacity-[0.10] blur-3xl rounded-[3rem] will-change-transform"
          :style="{ transform: `translate3d(0, ${hiwAnimalY}px, 0) scale(1.06)` }"
        />
        <div
          class="absolute -left-48 -bottom-56 w-[520px] h-[520px] rounded-full bg-white/10 blur-[110px] will-change-transform"
          :style="{ transform: `translate3d(0, ${hiwBlobY}px, 0)` }"
        />
      </div>

      <div
        class="page-container relative z-10 will-change-transform"
        :style="{ transform: `translate3d(0, ${hiwContentY}px, 0)` }"
      >
        <!-- Header -->
        <div v-reveal="{ variant: 'fade', duration: 720 }" class="text-center mb-10">
          <h2 class="font-display font-bold text-2xl sm:text-3xl text-white">Comment ça marche</h2>
          <p class="text-blue-100/90 text-sm sm:text-base mt-1 max-w-xl mx-auto">
            Une timeline claire, de la recherche jusqu’à la réception du document.
          </p>
        </div>

        <!-- Timeline -->
        <div
          v-reveal="{ stagger: 'li', staggerMs: 100, variant: 'up', duration: 760 }"
          class="relative max-w-5xl mx-auto"
        >
          <!-- center line (desktop) -->
          <div class="hidden lg:block absolute left-1/2 top-6 bottom-6 w-px bg-white/25"></div>

          <ol class="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
            <li
              v-for="(step, i) in howItWorks"
              :key="i"
              class="relative"
              :class="i % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12 lg:col-start-2'"
            >
              <!-- Node -->
              <div
                class="hidden lg:flex absolute top-6 items-center justify-center w-10 h-10 rounded-full bg-white text-brand font-display font-bold shadow-md"
                :class="i % 2 === 0 ? 'right-[-1.25rem]' : 'left-[-1.25rem]'"
              >
                {{ i + 1 }}
              </div>

              <div class="bg-white/95 backdrop-blur rounded-3xl border border-white/30 shadow-hero p-6 sm:p-7 relative overflow-hidden">
                <div class="absolute inset-0 jacquard-bg opacity-[0.06] pointer-events-none" />
                <div class="relative flex items-start gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand shrink-0">
                    <component :is="step.icon" :size="24" stroke-width="1.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="inline-flex lg:hidden w-7 h-7 rounded-full bg-brand text-white text-xs font-bold items-center justify-center">
                        {{ i + 1 }}
                      </span>
                      <h3 class="font-semibold text-gray-900">{{ step.title }}</h3>
                    </div>
                    <p class="text-sm text-gray-600 leading-relaxed">
                      {{ step.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- COMMUNES (KINSHASA) -->
    <section v-reveal="{ variant: 'left', duration: 800 }" class="relative overflow-hidden pb-16">
      <!-- Background -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- More “territorial / institutional” feel -->
        <div class="absolute inset-0 bg-gradient-to-b from-white via-surface-muted/60 to-white"></div>
        <div class="absolute inset-0 jacquard-bg opacity-[0.05]"></div>
        <img
          :src="animalImg"
          alt=""
          class="absolute -right-28 -top-16 w-[560px] h-[560px] object-cover opacity-[0.06] blur-3xl rounded-[3rem]"
          :style="{ transform: `translate3d(0, ${parallaxSmall}px, 0)` }"
        />
        <div
          class="absolute -left-40 -bottom-56 w-[520px] h-[520px] rounded-full bg-primary-200/20 blur-[110px]"
          :style="{ transform: `translate3d(0, ${parallaxLarge}px, 0)` }"
        />
      </div>

      <div class="page-container relative">
        <!-- Header (underline design) -->
        <div class="mb-8">
          <h2 class="font-display font-bold text-2xl sm:text-3xl text-gray-900 inline-flex flex-col">
            <span>Communes de Kinshasa</span>
            <span class="mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-brand to-brand-accent"></span>
          </h2>
          <p class="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl">
            Sélectionnez une commune pour afficher les services disponibles
          </p>
        </div>

        <!-- Liste + services : même hauteur de blocs (desktop) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch lg:min-h-[560px]">
          <!-- Commune list -->
          <div class="lg:col-span-4 flex min-h-[280px] lg:min-h-0">
            <div class="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden flex flex-col w-full h-full min-h-0">
              <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <p class="text-sm font-semibold text-gray-900">Communes</p>
                <span class="text-xs text-gray-500">{{ communes.length }}</span>
              </div>
              <div class="p-3 flex-1 min-h-0 overflow-y-auto">
                <button
                  v-for="c in communes"
                  :key="c.id"
                  type="button"
                  @click="selectedCommuneId = c.id"
                  :class="[
                    'group w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200 flex items-center gap-3',
                    selectedCommuneId === c.id
                      ? 'border-brand/40 bg-gradient-to-r from-brand/10 to-transparent shadow-sm'
                      : 'border-gray-200 hover:border-brand/25 hover:bg-gray-50'
                  ]"
                >
                  <div
                    class="w-2.5 h-10 rounded-full transition-colors"
                    :class="selectedCommuneId === c.id ? 'bg-brand' : 'bg-gray-200 group-hover:bg-brand/40'"
                    aria-hidden="true"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-semibold text-gray-900 truncate">{{ c.label }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">
                      {{ (communeToServiceIds[c.id]?.length ?? 0) }} service(s)
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Services panel -->
          <div class="lg:col-span-8 flex min-h-[280px] lg:min-h-0">
            <div class="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 relative overflow-hidden flex flex-col w-full h-full min-h-0">
              <div class="absolute inset-0 -z-10 jacquard-bg opacity-4 pointer-events-none" />
              <div class="flex items-center justify-between gap-4 flex-wrap mb-6 shrink-0">
                <div>
                  <h3 class="font-display font-bold text-xl text-gray-900">
                    Services — {{ communes.find(c => c.id === selectedCommuneId)?.label }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Jusqu’à 4 services affichés — voir l’annuaire complet pour plus.
                  </p>
                </div>
                <RouterLink to="/services" class="btn-outline text-brand border-brand/20 hover:bg-brand/5 font-medium shrink-0">
                  Voir tous les services <ArrowRight :size="16" class="ml-1.5" />
                </RouterLink>
              </div>

              <div class="flex-1 min-h-0 flex flex-col">
                <div v-if="communeServices.length" class="grid grid-cols-1 sm:grid-cols-2 gap-5 content-start flex-1">
                  <ServiceCard v-for="s in communeServices" :key="s.id" :service="s" />
                </div>
                <div v-else class="flex-1 flex items-center justify-center text-center text-sm text-gray-500 py-8">
                  Aucun service configuré pour cette commune.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <PartnersMarquee />

    <!-- CTA — même logique d’arrière-plan que le hero + parallaxe au scroll -->
    <section
      ref="ctaEl"
      v-reveal="{ variant: 'scale', duration: 900 }"
      class="relative w-full overflow-hidden bg-hero-gradient pt-16 lg:pt-24 pb-16 lg:pb-20 min-h-[min(78vh,760px)] flex items-center"
    >
      <img
        :src="animalImg"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-left opacity-[0.14] pointer-events-none select-none will-change-transform"
        :style="{ transform: `translate3d(0, ${ctaBgY}px, 0) scale(1.12)` }"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-brand-dark/10 via-transparent to-brand-dark/10 pointer-events-none" />
      <div
        class="absolute inset-0 jacquard-hero opacity-15 pointer-events-none will-change-transform"
        :style="{ transform: `translate3d(0, ${ctaJacquardY}px, 0)` }"
      />
      <div class="absolute inset-y-0 right-0 w-1/2 pointer-events-none flex items-center justify-end overflow-hidden">
        <img
          :src="armoiryImg"
          alt=""
          class="w-[min(92vw,580px)] h-auto max-h-[min(88vh,580px)] sm:w-[580px] sm:max-h-[580px] -mr-20 sm:-mr-32 object-contain object-right opacity-[0.12] select-none will-change-transform"
          :style="{ transform: `translate3d(0, ${ctaArmoiryY}px, 0)` }"
        />
      </div>

      <div
        class="page-container relative z-10 w-full will-change-transform"
        :style="{ transform: `translate3d(0, ${ctaContentY}px, 0)` }"
      >
        <div class="max-w-3xl mx-auto text-center text-white">
          <h2 class="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 drop-shadow-sm">
            Prêt à simplifier vos démarches ?
          </h2>
          <p class="text-blue-100/95 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Créez votre compte citoyen gratuit et accédez à l'ensemble des services de l'État en quelques clics.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <RouterLink to="/auth/register" class="btn-white btn-lg font-bold shadow-lg">
              Créer mon compte gratuit <UserPlus :size="18" />
            </RouterLink>
            <RouterLink to="/services" class="btn border-2 border-white/55 text-white hover:bg-white/15 btn-lg shadow-md">
              Explorer les services
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  ArrowRight, FileText, GraduationCap, Briefcase, Heart, Scale,
  Home, Landmark, Wheat, Radio, ShieldCheck, Search,
  UserPlus, MousePointerClick, Send, Download
} from 'lucide-vue-next'
import { useServicesStore } from '@/stores/services'
import ServiceCard from '@/components/services/ServiceCard.vue'
import PartnersMarquee from '@/components/home/PartnersMarquee.vue'

import animalImg from '@/assets/Animal.jfif'
import armoiryImg from '@/assets/armoiry.png'

const store  = useServicesStore()
const router = useRouter()

const categories     = store.categories
const mainCategories = computed(() => categories.filter(c => ['education', 'emploi-securite-sociale', 'etat-civil', 'fiscalite', 'agriculture'].includes(c.slug)))
const popularServices = store.popularServices
const searchQuery    = ref('')

// ─── Communes de Kinshasa (demo mapping) ────────────────────────────────────
const communes = [
  { id: 'gombe', label: 'Gombe' },
  { id: 'limete', label: 'Limete' },
  { id: 'kalamu', label: 'Kalamu' },
  { id: 'lemba', label: 'Lemba' },
  { id: 'ngaliema', label: 'Ngaliema' },
  { id: 'masina', label: 'Masina' },
  { id: 'kimbanseke', label: 'Kimbanseke' },
  { id: 'ndjili', label: 'N’djili' },
]

const communeToServiceIds: Record<string, string[]> = {
  gombe: ['svc-001', 'svc-003', 'svc-010'],
  limete: ['svc-001', 'svc-002'],
  kalamu: ['svc-001', 'svc-010'],
  lemba: ['svc-002'],
  ngaliema: ['svc-003', 'svc-010'],
  masina: ['svc-001'],
  kimbanseke: ['svc-001', 'svc-002'],
  ndjili: ['svc-010'],
}

const selectedCommuneId = ref<string>('gombe')
const communeServices = computed(() => {
  const ids = communeToServiceIds[selectedCommuneId.value] ?? []
  return store.services.filter(s => ids.includes(s.id)).slice(0, 4)
})

// ─── Parallax : scroll global (Communes) + par section (Comment ça marche + CTA) ─
const scrollY = ref(0)
const howItWorksEl = ref<HTMLElement | null>(null)
const ctaEl = ref<HTMLElement | null>(null)

const hiwAnimalY = ref(0)
const hiwBlobY = ref(0)
const hiwJacquardY = ref(0)
const hiwContentY = ref(0)
const ctaBgY = ref(0)
const ctaArmoiryY = ref(0)
const ctaJacquardY = ref(0)
const ctaContentY = ref(0)

const reduceMotion = ref(false)
let mq: MediaQueryList | null = null

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/** Décalage vertical selon l’écart du centre de la section au milieu du viewport */
function parallaxFromRect(rect: DOMRect, strength: number) {
  const vh = window.innerHeight
  const sectionMid = rect.top + rect.height / 2
  const viewMid = vh / 2
  return Math.round((viewMid - sectionMid) * strength)
}

let raf = 0
function onScroll() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    scrollY.value = window.scrollY || 0

    if (reduceMotion.value) {
      hiwAnimalY.value = hiwBlobY.value = hiwJacquardY.value = hiwContentY.value = 0
      ctaBgY.value = ctaArmoiryY.value = ctaJacquardY.value = ctaContentY.value = 0
      return
    }

    const hiw = howItWorksEl.value?.getBoundingClientRect()
    if (hiw && hiw.height > 0) {
      hiwAnimalY.value = clamp(parallaxFromRect(hiw, 0.13), -96, 96)
      hiwBlobY.value = clamp(parallaxFromRect(hiw, 0.08), -72, 72)
      hiwJacquardY.value = clamp(parallaxFromRect(hiw, 0.035), -40, 40)
      hiwContentY.value = clamp(parallaxFromRect(hiw, -0.04), -32, 32)
    }

    const cta = ctaEl.value?.getBoundingClientRect()
    if (cta && cta.height > 0) {
      ctaBgY.value = clamp(parallaxFromRect(cta, 0.16), -110, 110)
      ctaArmoiryY.value = clamp(parallaxFromRect(cta, 0.26), -150, 150)
      ctaJacquardY.value = clamp(parallaxFromRect(cta, 0.055), -48, 48)
      ctaContentY.value = clamp(parallaxFromRect(cta, -0.065), -44, 44)
    }
  })
}

function onReduceMotionChange() {
  mq && (reduceMotion.value = mq.matches)
  onScroll()
}

onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = mq.matches
  mq.addEventListener('change', onReduceMotionChange)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  mq?.removeEventListener('change', onReduceMotionChange)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(raf)
})

const parallaxSmall = computed(() => Math.round(-scrollY.value * 0.03))
const parallaxLarge = computed(() => Math.round(-scrollY.value * 0.05))

const howItWorks = [
  { icon: Search,             title: 'Trouvez votre service',   desc: 'Recherchez parmi nos 120+ démarches par catégorie ou mot-clé.' },
  { icon: MousePointerClick,  title: 'Remplissez le formulaire', desc: 'Complétez le formulaire sécurisé et joignez vos documents.' },
  { icon: Send,               title: 'Soumettez votre demande',  desc: 'Envoyez votre dossier et recevez un numéro de suivi immédiatement.' },
  { icon: Download,           title: 'Recevez votre document',   desc: 'Téléchargez ou retirez votre document une fois validé.' },
]

function doSearch() {
  if (searchQuery.value.trim()) {
    store.setSearch(searchQuery.value)
    router.push({ name: 'search', query: { q: searchQuery.value } })
  }
}

const catIcons: Record<string, typeof FileText> = {
  FileText: FileText, GraduationCap: GraduationCap, Briefcase: Briefcase,
  Heart: Heart, Scale: Scale, Home: Home, Landmark: Landmark,
  Wheat: Wheat, Radio: Radio, ShieldCheck: ShieldCheck,
}
function catIcon(name: string) { return catIcons[name] ?? FileText }
</script>
