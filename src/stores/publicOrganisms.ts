import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getPublicOrganisms } from '@/api/publicOrganisms'
import type { PublicOrganism } from '@/models/publicOrganisms'

export const usePublicOrganismsStore = defineStore('publicOrganisms', () => {
  const organisms = ref<PublicOrganism[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hydrated = ref(false)

  const communes = computed(() =>
    organisms.value
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
      organisms.value = await getPublicOrganisms()
      hydrated.value = true
      return organisms.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
      hydrated.value = false
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

