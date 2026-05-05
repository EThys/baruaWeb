import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getPublicOrganisms } from '@/api/publicOrganisms'
import type { PublicOrganism } from '@/models/publicOrganisms'
import { FALLBACK_ORGANISMS } from '@/data/publicOrganismsFallback'

export const usePublicOrganismsStore = defineStore('publicOrganisms', () => {
  const CACHE_KEY = 'barua_public_organisms_cache_v1'
  const cached = (() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? (parsed as PublicOrganism[]) : null
    } catch {
      return null
    }
  })()

  const organisms = ref<PublicOrganism[]>(cached ?? FALLBACK_ORGANISMS)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hydrated = ref(false)

  const communes = computed(() =>
    (Array.isArray(organisms.value) ? organisms.value : [])
      .filter(o => o.type?.name?.toLowerCase() === 'commune' || o.type?.id === 2)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  )

  async function fetchOrganisms(opts?: { force?: boolean }) {
    const force = opts?.force ?? false
    if (!force && hydrated.value) return organisms.value
    if (loading.value) return organisms.value

    loading.value = true
    error.value = null
    try {
      const res = await getPublicOrganisms()
      organisms.value = Array.isArray(res) ? res : []
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(organisms.value))
      } catch {
        // ignore
      }
      hydrated.value = true
      return organisms.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
      hydrated.value = false
      // fallback: cache -> fallback list
      if (!organisms.value?.length) {
        organisms.value = cached ?? FALLBACK_ORGANISMS
      }
      return organisms.value
    } finally {
      loading.value = false
    }
  }

  return {
    organisms,
    communes,
    loading,
    error,
    hydrated,
    fetchOrganisms,
  }
})

