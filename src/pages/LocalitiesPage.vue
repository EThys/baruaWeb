<template>
  <div>
    <div class="hero-overlay py-10 relative overflow-hidden">
      <div class="absolute inset-0 jacquard-hero opacity-20 pointer-events-none" />
      <div class="page-container relative">
        <h1 class="font-display font-bold text-white text-3xl mb-2">Localités</h1>
        <p class="text-blue-200 text-sm">
          Recherchez une commune, mairie ou ville puis explorez les services.
        </p>

        <div class="mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-stretch">
          <div class="relative min-w-0 flex-1">
            <Search :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="q"
              type="search"
              aria-label="Rechercher une localité"
              autocomplete="off"
              placeholder="Ex: Gombe, Limete…"
              class="form-field w-full pl-10 pr-4 max-sm:min-h-[2.75rem]"
            />
          </div>
          <select v-model="typeId" class="form-field sm:w-64" aria-label="Type de localité">
            <option value="">Tous les types</option>
            <option v-for="t in availableTypes" :key="t.id" :value="String(t.id)">
              {{ t.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="page-container py-10">
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 9" :key="i" class="rounded-xl border border-gray-200 bg-white p-5">
          <div class="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
          <div class="h-3 w-5/6 bg-gray-100 rounded mt-3 animate-pulse" />
        </div>
      </div>

      <div v-else-if="error" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Impossible de charger la liste via l’API. Réessayez plus tard.
      </div>

      <div v-else>
        <div class="flex items-end justify-between gap-4 flex-wrap mb-5">
          <p class="text-sm text-gray-600">
            {{ filtered.length }} localité(s)
          </p>
        </div>

        <div v-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="o in filtered"
            :key="o.id"
            type="button"
            class="card p-5 text-left hover:border-brand/25 hover:shadow-md transition-all duration-300"
            @click="goToServices(o)"
          >
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0 text-brand">
                <MapPin :size="18" stroke-width="1.75" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold uppercase tracking-wider text-brand/80">
                  {{ o.type?.name ?? 'Localité' }}
                </p>
                <h3 class="font-semibold text-gray-900 text-sm leading-snug mt-1">
                  {{ o.name }}
                </h3>
                <p v-if="o.description" class="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {{ o.description }}
                </p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>Voir les services</span>
              <ArrowRight :size="16" class="text-brand" />
            </div>
          </button>
        </div>

        <div v-else class="text-center py-16">
          <SearchX :size="48" class="text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">Aucune localité trouvée</p>
          <p class="text-gray-400 text-sm mt-1">Essayez un autre terme.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ArrowRight, MapPin, Search, SearchX } from 'lucide-vue-next'
import { usePublicOrganismsStore } from '@/stores/publicOrganisms'
import type { PublicOrganism } from '@/models/publicOrganisms'

const router = useRouter()
const store = usePublicOrganismsStore()
const { organisms, loading, error } = storeToRefs(store)

const q = ref('')
const typeId = ref<string>('')

const availableTypes = computed(() => {
  const map = new Map<number, { id: number; name: string }>()
  for (const o of organisms.value) {
    if (o.type?.id && o.type?.name) map.set(o.type.id, { id: o.type.id, name: o.type.name })
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

const filtered = computed(() => {
  const qq = q.value.trim().toLowerCase()
  const tid = Number(typeId.value)
  return organisms.value
    .filter(o => (Number.isFinite(tid) && tid > 0 ? o.type?.id === tid : true))
    .filter(o => (qq ? o.name.toLowerCase().includes(qq) : true))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})

function goToServices(o: PublicOrganism) {
  router.push({
    name: 'services',
    query: {
      localityId: String(o.id),
      localityName: o.name,
      localityType: o.type?.name ?? '',
    },
  })
}

onMounted(() => {
  store.fetchOrganisms()
})
</script>

