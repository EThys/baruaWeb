<template>
  <div class="directory-page">
    <!-- Hero -->
    <header class="relative overflow-hidden bg-hero-gradient">
      <div class="absolute inset-0 jacquard-hero opacity-20 pointer-events-none" aria-hidden="true" />
      <div
        class="absolute inset-0 bg-gradient-to-b from-brand-dark/15 via-transparent to-brand-dark/25 pointer-events-none"
        aria-hidden="true"
      />
      <div
        class="absolute inset-y-0 right-0 w-1/2 pointer-events-none flex items-center justify-end overflow-hidden"
        aria-hidden="true"
      >
        <img
          :src="armoiryImg"
          alt=""
          class="w-[min(80vw,420px)] h-auto max-h-[360px] -mr-16 sm:-mr-24 object-contain opacity-[0.1] select-none"
        />
      </div>

      <div
        class="page-container relative z-10 py-14 sm:py-16"
        v-reveal="{ stagger: '[data-reveal-item]', staggerMs: 100, variant: 'up', once: true }"
      >
        <h1
          data-reveal-item
          class="font-display font-bold text-white text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight max-w-3xl"
        >
          Annuaire de l’administration
        </h1>
        <p data-reveal-item class="mt-4 text-blue-100/90 max-w-2xl text-sm sm:text-base leading-relaxed">
          Ministères et organismes publics utiles à vos démarches : contacts et sites officiels
          (DGI, CNSS, DGM, ARPTC, BCC, etc.).
        </p>

        <div data-reveal-item class="mt-8 max-w-xl relative">
          <Search
            :size="18"
            class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Rechercher un ministère, un sigle…"
            class="w-full rounded-2xl border-0 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 shadow-lg ring-1 ring-slate-900/5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Filtrer l’annuaire"
          />
        </div>
      </div>

      <div class="flex h-1 sm:h-1.5 w-full" aria-hidden="true">
        <div class="flex-1 bg-rdc-yellow" />
        <div class="flex-1 bg-rdc-blue" />
        <div class="flex-1 bg-rdc-red" />
      </div>
    </header>

    <!-- Stats -->
    <section class="page-container -mt-8 relative z-20 mb-10 sm:mb-12">
      <div
        class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        v-reveal="{ stagger: '[data-pill]', staggerMs: 80, variant: 'up', once: true }"
      >
        <div
          v-for="pill in pillars"
          :key="pill.title"
          data-pill
          class="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm ring-1 ring-slate-900/5"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand mb-3">
            <component :is="pill.icon" :size="20" />
          </div>
          <p class="font-semibold text-slate-900 text-sm">{{ pill.title }}</p>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ pill.text }}</p>
        </div>
      </div>
    </section>

    <!-- Corps -->
    <div class="page-container pb-16 lg:pb-24">
      <div class="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        <!-- Nav latérale -->
        <aside class="hidden lg:block">
          <nav
            class="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            aria-label="Catégories"
          >
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 px-2">
              Catégories
            </p>
            <ul class="space-y-0.5">
              <li v-for="nav in categoryNav" :key="nav.id">
                <a
                  :href="`#${nav.id}`"
                  class="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors"
                  :class="activeSection === nav.id
                    ? 'bg-brand/10 text-brand font-semibold'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'"
                  @click="activeSection = nav.id"
                >
                  <span class="flex items-center gap-2 min-w-0">
                    <component :is="nav.icon" :size="15" class="shrink-0" />
                    <span class="truncate">{{ nav.label }}</span>
                  </span>
                  <span class="text-[11px] font-mono text-slate-400 tabular-nums">{{ nav.count }}</span>
                </a>
              </li>
            </ul>
            <p class="mt-4 px-2 text-[11px] text-slate-400 leading-relaxed">
              Vérifiez les numéros sur le site de chaque institution en cas de mise à jour.
            </p>
          </nav>
        </aside>

        <div class="min-w-0 space-y-12 sm:space-y-14">
          <!-- Filtres mobile -->
          <div class="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <a
              v-for="nav in categoryNav"
              :key="`m-${nav.id}`"
              :href="`#${nav.id}`"
              class="inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors"
              :class="activeSection === nav.id
                ? 'border-brand/25 bg-brand/10 text-brand'
                : 'border-slate-200 bg-white text-slate-600'"
              @click="activeSection = nav.id"
            >
              <component :is="nav.icon" :size="14" />
              {{ nav.label }}
              <span class="text-slate-400 font-mono">{{ nav.count }}</span>
            </a>
          </div>

          <!-- Ministères -->
          <section
            id="ministeres"
            class="scroll-mt-28"
            aria-labelledby="dir-ministres"
            v-reveal="{ variant: 'up', duration: 700, once: true }"
          >
            <div class="flex items-start gap-3 sm:gap-4 mb-6">
              <span
                class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm"
              >
                <Landmark :size="18" />
              </span>
              <div class="min-w-0 pt-0.5">
                <h2 id="dir-ministres" class="font-display font-bold text-xl sm:text-2xl text-slate-900">
                  Ministères
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ filteredMinisteres.length }}
                  entrée{{ filteredMinisteres.length > 1 ? 's' : '' }}
                  <template v-if="query.trim()"> pour « {{ query.trim() }} »</template>
                </p>
              </div>
            </div>

            <div
              v-if="filteredMinisteres.length"
              class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              v-reveal="{ stagger: 'article', staggerMs: 50, variant: 'up', once: true }"
            >
              <article
                v-for="org in filteredMinisteres"
                :key="org.id"
                class="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:border-brand/20 hover:shadow-md"
              >
                <div class="flex items-start gap-3 mb-3">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand transition-colors group-hover:bg-brand/10"
                  >
                    <Landmark :size="20" stroke-width="1.75" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <span
                      v-if="org.sigle"
                      class="inline-block rounded-md bg-brand/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand mb-1.5"
                    >
                      {{ org.sigle }}
                    </span>
                    <h3 class="font-semibold text-slate-900 text-sm leading-snug">{{ org.name }}</h3>
                  </div>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed flex-1 mb-4">{{ org.description }}</p>
                <div class="mt-auto space-y-2 border-t border-slate-100 pt-3">
                  <div v-if="org.phone" class="flex items-start gap-2 text-xs">
                    <Phone :size="14" class="text-brand shrink-0 mt-0.5" />
                    <a
                      v-if="phoneHref(org.phone)"
                      :href="phoneHref(org.phone)!"
                      class="text-brand font-medium hover:underline break-words"
                    >
                      {{ org.phone }}
                    </a>
                    <span v-else class="text-slate-700 font-medium break-words">{{ org.phone }}</span>
                  </div>
                  <div v-else class="flex items-center gap-2 text-xs text-slate-400">
                    <Phone :size="14" class="shrink-0" />
                    <span>Téléphone : voir le site officiel</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs">
                    <ExternalLink :size="14" class="text-brand/70 shrink-0 mt-0.5" />
                    <a
                      :href="org.website"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-brand font-medium hover:underline break-all"
                    >
                      {{ displayUrl(org.website) }}
                    </a>
                  </div>
                </div>
              </article>
            </div>
            <p
              v-else
              class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500"
            >
              Aucun ministère ne correspond à « {{ query }} ».
            </p>
          </section>

          <!-- Organismes -->
          <section
            id="organismes"
            class="scroll-mt-28 border-t border-slate-200/90 pt-12 sm:pt-14"
            aria-labelledby="dir-organismes"
            v-reveal="{ variant: 'up', duration: 700, once: true }"
          >
            <div class="flex items-start gap-3 sm:gap-4 mb-6">
              <span
                class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm"
              >
                <Building2 :size="18" />
              </span>
              <div class="min-w-0 pt-0.5">
                <h2 id="dir-organismes" class="font-display font-bold text-xl sm:text-2xl text-slate-900">
                  Organismes et offices publics
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ filteredOrganismes.length }}
                  entrée{{ filteredOrganismes.length > 1 ? 's' : '' }}
                  <template v-if="query.trim()"> pour « {{ query.trim() }} »</template>
                </p>
              </div>
            </div>

            <div
              v-if="filteredOrganismes.length"
              class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              v-reveal="{ stagger: 'article', staggerMs: 50, variant: 'up', once: true }"
            >
              <article
                v-for="org in filteredOrganismes"
                :key="org.id"
                class="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:border-brand/20 hover:shadow-md"
              >
                <div class="flex items-start gap-3 mb-3">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand transition-colors group-hover:bg-brand/10"
                  >
                    <Building2 :size="20" stroke-width="1.75" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <span
                      v-if="org.sigle"
                      class="inline-block rounded-md bg-brand/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand mb-1.5"
                    >
                      {{ org.sigle }}
                    </span>
                    <h3 class="font-semibold text-slate-900 text-sm leading-snug">{{ org.name }}</h3>
                  </div>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed flex-1 mb-4">{{ org.description }}</p>
                <div class="mt-auto space-y-2 border-t border-slate-100 pt-3">
                  <div v-if="org.phone" class="flex items-start gap-2 text-xs">
                    <Phone :size="14" class="text-brand shrink-0 mt-0.5" />
                    <a
                      v-if="phoneHref(org.phone)"
                      :href="phoneHref(org.phone)!"
                      class="text-brand font-medium hover:underline break-words"
                    >
                      {{ org.phone }}
                    </a>
                    <span v-else class="text-slate-700 font-medium break-words">{{ org.phone }}</span>
                  </div>
                  <div v-else class="flex items-center gap-2 text-xs text-slate-400">
                    <Phone :size="14" class="shrink-0" />
                    <span>Téléphone : voir le site officiel</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs">
                    <ExternalLink :size="14" class="text-brand/70 shrink-0 mt-0.5" />
                    <a
                      :href="org.website"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-brand font-medium hover:underline break-all"
                    >
                      {{ displayUrl(org.website) }}
                    </a>
                  </div>
                </div>
              </article>
            </div>
            <p
              v-else
              class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500"
            >
              Aucun organisme ne correspond à « {{ query }} ».
            </p>
          </section>

          <!-- Note -->
          <div
            class="rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-50 to-white relative"
            v-reveal="{ variant: 'scale', duration: 800, once: true }"
          >
            <div class="absolute inset-0 jacquard-bg opacity-[0.05] pointer-events-none" aria-hidden="true" />
            <div class="relative p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
                <Phone :size="22" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-display font-bold text-lg text-slate-900">Besoin d’aide Barua ?</h3>
                <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                  Support plateforme :
                  <a href="tel:+243900727272" class="font-semibold text-brand hover:underline whitespace-nowrap">
                    +243 900 727 272
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Building2,
  ExternalLink,
  Landmark,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-vue-next'
import { directoryByCategory, type DirectoryEntry } from '@/data/directory'
import armoiryImg from '@/assets/armoiry.png'

const query = ref('')
const activeSection = ref('ministeres')

const ministeres = directoryByCategory('ministere')
const organismes = directoryByCategory('organisme')

const pillars = computed(() => [
  {
    icon: Landmark,
    title: `${filteredMinisteres.value.length} ministères`,
    text: 'Tutelles et administrations centrales pour vos démarches.',
  },
  {
    icon: Building2,
    title: `${filteredOrganismes.value.length} organismes`,
    text: 'Offices, régulateurs et services techniques publics.',
  },
  {
    icon: ShieldCheck,
    title: 'Sources officielles',
    text: 'Liens et contacts issus des sites institutionnels.',
  },
])

const categoryNav = computed(() => [
  {
    id: 'ministeres',
    label: 'Ministères',
    icon: Landmark,
    count: filteredMinisteres.value.length,
  },
  {
    id: 'organismes',
    label: 'Organismes',
    icon: Building2,
    count: filteredOrganismes.value.length,
  },
])

function matches(entry: DirectoryEntry, q: string) {
  if (!q.trim()) return true
  const s = q.trim().toLowerCase()
  return (
    entry.name.toLowerCase().includes(s)
    || (entry.sigle?.toLowerCase().includes(s) ?? false)
    || entry.description.toLowerCase().includes(s)
  )
}

const filteredMinisteres = computed(() => ministeres.filter(o => matches(o, query.value)))
const filteredOrganismes = computed(() => organismes.filter(o => matches(o, query.value)))

function phoneHref(phone: string): string | undefined {
  const trimmed = phone.trim()
  if (/\b151\b/.test(trimmed)) return 'tel:151'
  if (/^\d{3,5}$/.test(trimmed)) return `tel:${trimmed}`
  const m = trimmed.match(/\+243[\d\s().]{8,}/)
  if (m) return 'tel:' + m[0].replace(/[\s()]/g, '')
  const local = trimmed.match(/^0\d{9}$/)
  if (local) return `tel:+243${local[0].slice(1)}`
  return undefined
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//i, '')
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  const ids = ['ministeres', 'organismes']
  const els = ids
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el)

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]?.target?.id) activeSection.value = visible[0].target.id
    },
    { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
  )

  for (const el of els) observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>
