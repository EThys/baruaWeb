<template>
  <div class="page-container py-10 sm:py-12">
    <header class="mb-8 sm:mb-10 max-w-3xl">
      <h1 class="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
        Annuaire de l’administration — RDC
      </h1>
      <p class="text-gray-600 text-sm sm:text-base leading-relaxed">
        Ministères et organismes publics utiles aux démarches en ligne : contacts publics et sites officiels
        (DGI, CNSS, DGM, ARPTC, BCC, etc.). Vérifiez les numéros sur le site de chaque institution en cas de mise à jour.
      </p>
      <div class="mt-4 relative max-w-md">
        <Search
          :size="17"
          class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          v-model="query"
          type="search"
          autocomplete="off"
          placeholder="Rechercher un ministère, un sigle…"
          class="form-field w-full pl-10 pr-4 py-2.5 text-sm"
          aria-label="Filtrer l’annuaire"
        />
      </div>
    </header>

    <!-- Ministères -->
    <section class="mb-12 sm:mb-14" aria-labelledby="dir-ministres">
      <div class="flex items-end justify-between gap-4 flex-wrap mb-5">
        <h2 id="dir-ministres" class="font-display font-bold text-xl text-brand">
          Ministères
        </h2>
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {{ filteredMinisteres.length }} entrée(s)
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <article
          v-for="org in filteredMinisteres"
          :key="org.id"
          class="card p-5 sm:p-6 hover:border-primary-200 hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div class="flex flex-col gap-3 flex-1 min-h-0">
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-brand">
                <Landmark :size="20" stroke-width="1.75" />
              </div>
              <div class="min-w-0 flex-1">
                <span
                  v-if="org.sigle"
                  class="inline-block text-[10px] font-bold uppercase tracking-wider text-brand/80 mb-1"
                >
                  {{ org.sigle }}
                </span>
                <h3 class="font-semibold text-gray-900 text-sm leading-snug">{{ org.name }}</h3>
                <p class="text-xs text-gray-500 mt-1.5 leading-relaxed">{{ org.description }}</p>
              </div>
            </div>
            <div class="mt-auto pt-2 space-y-2 border-t border-gray-100">
              <div v-if="org.phone" class="flex items-start gap-2 text-xs">
                <Phone :size="14" stroke-width="2" class="text-brand shrink-0 mt-0.5" />
                <a
                  v-if="phoneHref(org.phone)"
                  :href="phoneHref(org.phone)!"
                  class="text-brand font-medium hover:underline break-words"
                >
                  {{ org.phone }}
                </a>
                <span v-else class="text-gray-700 font-medium break-words">{{ org.phone }}</span>
              </div>
              <div v-else class="flex items-center gap-2 text-xs text-gray-400">
                <Phone :size="14" stroke-width="2" class="shrink-0" />
                <span>Téléphone : voir le site officiel</span>
              </div>
              <div class="flex items-start gap-2 text-xs">
                <ExternalLink :size="14" stroke-width="2" class="text-emerald-600 shrink-0 mt-0.5" />
                <a
                  :href="org.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-emerald-700 font-medium hover:underline break-all"
                >
                  {{ displayUrl(org.website) }}
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
      <p v-if="!filteredMinisteres.length" class="text-center text-sm text-gray-500 py-10">
        Aucun ministère ne correspond à « {{ query }} ».
      </p>
    </section>

    <!-- Organismes -->
    <section aria-labelledby="dir-organismes">
      <div class="flex items-end justify-between gap-4 flex-wrap mb-5">
        <h2 id="dir-organismes" class="font-display font-bold text-xl text-brand">
          Organismes & offices publics
        </h2>
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {{ filteredOrganismes.length }} entrée(s)
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <article
          v-for="org in filteredOrganismes"
          :key="org.id"
          class="card p-5 sm:p-6 hover:border-primary-200 hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div class="flex flex-col gap-3 flex-1 min-h-0">
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-brand">
                <Building2 :size="20" stroke-width="1.75" />
              </div>
              <div class="min-w-0 flex-1">
                <span
                  v-if="org.sigle"
                  class="inline-block text-[10px] font-bold uppercase tracking-wider text-brand/80 mb-1"
                >
                  {{ org.sigle }}
                </span>
                <h3 class="font-semibold text-gray-900 text-sm leading-snug">{{ org.name }}</h3>
                <p class="text-xs text-gray-500 mt-1.5 leading-relaxed">{{ org.description }}</p>
              </div>
            </div>
            <div class="mt-auto pt-2 space-y-2 border-t border-gray-100">
              <div v-if="org.phone" class="flex items-start gap-2 text-xs">
                <Phone :size="14" stroke-width="2" class="text-brand shrink-0 mt-0.5" />
                <a
                  v-if="phoneHref(org.phone)"
                  :href="phoneHref(org.phone)!"
                  class="text-brand font-medium hover:underline break-words"
                >
                  {{ org.phone }}
                </a>
                <span v-else class="text-gray-700 font-medium break-words">{{ org.phone }}</span>
              </div>
              <div v-else class="flex items-center gap-2 text-xs text-gray-400">
                <Phone :size="14" stroke-width="2" class="shrink-0" />
                <span>Téléphone : voir le site officiel</span>
              </div>
              <div class="flex items-start gap-2 text-xs">
                <ExternalLink :size="14" stroke-width="2" class="text-emerald-600 shrink-0 mt-0.5" />
                <a
                  :href="org.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-emerald-700 font-medium hover:underline break-all"
                >
                  {{ displayUrl(org.website) }}
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
      <p v-if="!filteredOrganismes.length" class="text-center text-sm text-gray-500 py-10">
        Aucun organisme ne correspond à « {{ query }} ».
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Building2, ExternalLink, Landmark, Phone, Search } from 'lucide-vue-next'
import { directoryByCategory, type DirectoryEntry } from '@/data/directory'

const query = ref('')

const ministeres = directoryByCategory('ministere')
const organismes = directoryByCategory('organisme')

function matches(entry: DirectoryEntry, q: string) {
  if (!q.trim()) return true
  const s = q.trim().toLowerCase()
  return (
    entry.name.toLowerCase().includes(s) ||
    (entry.sigle?.toLowerCase().includes(s) ?? false) ||
    entry.description.toLowerCase().includes(s)
  )
}

const filteredMinisteres = computed(() => ministeres.filter(o => matches(o, query.value)))
const filteredOrganismes = computed(() => organismes.filter(o => matches(o, query.value)))

/** Lien cliquable seulement pour +243… ou ligne 151 */
function phoneHref(phone: string): string | undefined {
  if (/\b151\b/.test(phone)) return 'tel:151'
  const m = phone.match(/\+243[\d\s]{8,}/)
  if (m) return 'tel:' + m[0].replace(/\s/g, '')
  return undefined
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//i, '')
}
</script>
