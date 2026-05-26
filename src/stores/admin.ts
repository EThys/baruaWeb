import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAdminUsers } from '@/api/admin'
import { getPublicServicesDocumentaires } from '@/api/publicServiceDocumentaire'
import { usePublicOrganismsStore } from '@/stores/publicOrganisms'
import { useRequestsStore } from '@/stores/requests'
import type { AdminUserDto, OrganismDemandStat } from '@/types/admin'
import type { PublicServiceDocumentaire } from '@/models/publicServiceDocumentaire'

export const useAdminStore = defineStore('admin', () => {
  const users = ref<AdminUserDto[]>([])
  const services = ref<PublicServiceDocumentaire[]>([])
  const loadingUsers = ref(false)
  const loadingStats = ref(false)
  const error = ref<string | null>(null)

  const usersCount = computed(() => users.value.length)
  const certifiedCount = computed(() => users.value.filter(u => u.certified).length)

  const organismStats = computed((): OrganismDemandStat[] => {
    const organismsStore = usePublicOrganismsStore()
    const requestsStore = useRequestsStore()
    const orgs = Array.isArray(organismsStore.organisms) ? organismsStore.organisms : []

    const serviceCountByOrg = new Map<number, number>()
    for (const s of services.value) {
      const id = s.organism.id
      serviceCountByOrg.set(id, (serviceCountByOrg.get(id) ?? 0) + 1)
    }

    function demandesForOrganism(orgId: number): number {
      const titles = services.value
        .filter(s => s.organism.id === orgId)
        .map(s => s.document.title.toLowerCase())
      if (!titles.length) return 0
      return requestsStore.requests.filter(r => {
        const name = r.serviceName.toLowerCase()
        return titles.some(t => name.includes(t) || t.includes(name))
      }).length
    }

    return orgs.map(o => ({
      organismId: o.id,
      organismName: o.name,
      city: o.city ?? '',
      typeName: o.type?.name ?? '',
      servicesCount: serviceCountByOrg.get(o.id) ?? 0,
      demandesCount: demandesForOrganism(o.id),
    })).sort((a, b) => b.demandesCount - a.demandesCount || b.servicesCount - a.servicesCount)
  })

  const totalDemandes = computed(() => {
    const requestsStore = useRequestsStore()
    return requestsStore.requests.length
  })

  const openDemandes = computed(() => {
    const requestsStore = useRequestsStore()
    return requestsStore.activeRequests.length
  })

  async function fetchSuperAdminOverview() {
    loadingUsers.value = true
    loadingStats.value = true
    error.value = null
    try {
      const organismsStore = usePublicOrganismsStore()
      const [usersList, svcList] = await Promise.all([
        getAdminUsers(),
        getPublicServicesDocumentaires(),
        organismsStore.fetchOrganisms(),
      ])
      users.value = usersList
      services.value = svcList
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement des données admin'
    } finally {
      loadingUsers.value = false
      loadingStats.value = false
    }
  }

  return {
    users,
    services,
    loadingUsers,
    loadingStats,
    error,
    usersCount,
    certifiedCount,
    organismStats,
    totalDemandes,
    openDemandes,
    fetchSuperAdminOverview,
  }
})
