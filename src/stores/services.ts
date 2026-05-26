import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServiceCategory, Service } from '@/types'
import { CATEGORIES, SERVICES } from '@/data/services'
import { getPublicServicesDocumentaires } from '@/api/publicServiceDocumentaire'
import type { PublicServiceDocumentaire } from '@/models/publicServiceDocumentaire'
import { docTypeIdToCategorySlug } from '@/utils/docType'
import { deviseCodeById } from '@/data/devises'
import { DEFAULT_PUBLIC_DOCUMENT_TYPES } from '@/data/publicDocumentTypes'

function isPlaceholderApiText(value: string | null | undefined): boolean {
  if (!value) return true
  const t = value.trim().toLowerCase()
  return t === 'string' || t === ''
}

function documentTypeName(documentTypeId: number): string {
  return (
    DEFAULT_PUBLIC_DOCUMENT_TYPES.find(t => t.documentTypeId === documentTypeId)?.name
    ?? 'Administration'
  )
}

function normalizeLocalityName(name: string): string {
  return name.trim().toLocaleLowerCase('fr')
}

function serviceMatchesLocality(
  s: Service,
  organismId: number | null,
  organismName: string | null,
): boolean {
  if (organismId != null && s.organismId === organismId) return true
  if (organismName) {
    const target = normalizeLocalityName(organismName)
    return !!s.organismName && normalizeLocalityName(s.organismName) === target
  }
  return false
}

function organismLabel(svc: PublicServiceDocumentaire): string {
  const { organism } = svc
  const typeName = organism.type?.name ?? ''
  const parts = [typeName, organism.name].filter(Boolean)
  const base = parts.join(' — ')
  return organism.city ? `${base} (${organism.city})` : base
}

export const useServicesStore = defineStore('services', () => {
  const categories = ref<ServiceCategory[]>(CATEGORIES)
  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hydratedFromApi = ref(false)
  const searchQuery = ref('')
  const activeCategory = ref<string | null>(null)
  const activeOrganismId = ref<number | null>(null)
  const activeOrganismName = ref<string | null>(null)
  const CACHE_KEY = 'barua_public_service_documentaires_cache_v1'

  function serviceDocumentaireToService(svc: PublicServiceDocumentaire, idx: number): Service {
    const doc = svc.document
    const slug = docTypeIdToCategorySlug(doc.documentTypeId)
    const typeName = documentTypeName(doc.documentTypeId)
    const docDesc = isPlaceholderApiText(doc.description) ? '' : (doc.description ?? '')
    const svcDesc = isPlaceholderApiText(svc.description) ? '' : (svc.description ?? '')
    const description = svcDesc || docDesc || 'Démarche disponible sur la plateforme Barua.'
    const price = svc.price > 0 ? svc.price : undefined

    return {
      id: `sd-${svc.serviceDocumentaireId}`,
      categoryId: `api-${doc.documentTypeId}`,
      categorySlug: slug,
      title: doc.title,
      shortDescription: docDesc || description,
      description,
      eligibility: 'citizen',
      estimatedDuration: svc.delayDayOpen?.trim() || 'À confirmer',
      cost: price,
      currency: deviseCodeById(svc.deviseId),
      difficulty: 'easy',
      requiredDocuments: [],
      steps: [
        { step: 1, title: 'Sélectionnez le service', description: 'Ouvrez la fiche et lisez les informations.' },
        { step: 2, title: 'Préparez vos pièces', description: 'Rassemblez les documents requis selon votre situation.' },
        { step: 3, title: 'Soumettez la demande', description: 'Complétez le formulaire et envoyez votre dossier.' },
        { step: 4, title: 'Suivez le traitement', description: 'Recevez une notification dès que le document est prêt.' },
      ],
      formFields: [],
      tags: [
        typeName,
        doc.title,
        svc.organism.name,
        svc.organism.city,
      ].filter(Boolean),
      isOnline: doc.isActive,
      ministry: organismLabel(svc),
      isPopular: idx < 6,
      serviceDocumentaireId: svc.serviceDocumentaireId,
      documentId: doc.documentId,
      organismId: svc.organism.id,
      organismName: svc.organism.name,
      organismTypeName: svc.organism.type?.name ?? undefined,
      organismCity: svc.organism.city,
    }
  }

  function countServicesForLocality(organismId: number | null, organismName: string | null): number {
    if (organismId == null && !organismName) return 0
    return services.value.filter(s => serviceMatchesLocality(s, organismId, organismName)).length
  }

  function getServicesForLocality(
    organismId: number | null,
    organismName: string | null,
    limit?: number,
  ): Service[] {
    let result = services.value.filter(s => serviceMatchesLocality(s, organismId, organismName))
    if (limit != null && limit > 0) result = result.slice(0, limit)
    return result
  }

  async function fetchServicesFromPublicDocuments(opts?: { force?: boolean }) {
    const force = opts?.force ?? false
    if (!force && hydratedFromApi.value) return

    loading.value = true
    error.value = null
    try {
      const items = await getPublicServicesDocumentaires()
      services.value = items.map((s, i) => serviceDocumentaireToService(s, i))
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(items))
      } catch {
        // ignore
      }
      hydratedFromApi.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) {
          const cached = JSON.parse(raw) as unknown
          if (Array.isArray(cached) && cached.length > 0 && 'serviceDocumentaireId' in (cached[0] as object)) {
            const items = cached as PublicServiceDocumentaire[]
            services.value = items.map((s, i) => serviceDocumentaireToService(s, i))
          }
        }
      } catch {
        // ignore
      }
      if (!services.value.length) {
        services.value = SERVICES
      }
      hydratedFromApi.value = false
    } finally {
      loading.value = false
    }
  }

  const filteredServices = computed(() => {
    let result = services.value
    if (activeCategory.value) {
      result = result.filter(s => s.categorySlug === activeCategory.value)
    }
    if (activeOrganismId.value != null || activeOrganismName.value) {
      result = result.filter(s =>
        serviceMatchesLocality(s, activeOrganismId.value, activeOrganismName.value),
      )
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q)) ||
        s.ministry.toLowerCase().includes(q),
      )
    }
    return result
  })

  const popularServices = computed(() => {
    if (activeOrganismId.value != null || activeOrganismName.value) {
      return getServicesForLocality(activeOrganismId.value, activeOrganismName.value, 6)
    }
    const flagged = services.value.filter(s => s.isPopular)
    if (flagged.length > 0) return flagged.slice(0, 6)
    // API chargée : afficher les premiers services même sans flag « populaire »
    if (hydratedFromApi.value && services.value.length > 0) {
      return services.value.slice(0, 6)
    }
    return []
  })

  const communesFromServices = computed(() => {
    const map = new Map<string, { id: number; name: string; city: string }>()
    for (const s of services.value) {
      if (!s.organismName) continue
      const isCommune =
        s.organismTypeName?.toLocaleLowerCase('fr') === 'commune'
      if (!isCommune) continue
      const key = normalizeLocalityName(s.organismName)
      if (!map.has(key)) {
        map.set(key, {
          id: s.organismId ?? 0,
          name: s.organismName,
          city: s.organismCity ?? '',
        })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  })

  function getCategoryBySlug(slug: string) {
    return categories.value.find(c => c.slug === slug)
  }

  function getServiceById(id: string) {
    return services.value.find(s => s.id === id)
  }

  function getServicesByCategory(slug: string) {
    return services.value.filter(s => s.categorySlug === slug)
  }

  function setSearch(q: string) { searchQuery.value = q }
  function setCategory(slug: string | null) { activeCategory.value = slug }
  function setLocalityFilter(opts: { organismId?: number | null; organismName?: string | null }) {
    activeOrganismId.value = opts.organismId ?? null
    activeOrganismName.value = opts.organismName?.trim() || null
  }

  return {
    categories, services, loading, error, hydratedFromApi, searchQuery, activeCategory,
    activeOrganismId, activeOrganismName,
    filteredServices, popularServices, communesFromServices,
    getCategoryBySlug, getServiceById, getServicesByCategory,
    getServicesForLocality, countServicesForLocality,
    setSearch, setCategory, setLocalityFilter,
    fetchServicesFromPublicDocuments,
  }
})
