import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServiceCategory, Service } from '@/types'
import { CATEGORIES, SERVICES } from '@/data/services'
import { getPublicDocuments } from '@/api/publicDocuments'
import type { PublicDocument } from '@/models/publicDocuments'
import { docTypeIdToCategorySlug } from '@/utils/docType'

export const useServicesStore = defineStore('services', () => {
  const categories = ref<ServiceCategory[]>(CATEGORIES)
  const services = ref<Service[]>(SERVICES)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hydratedFromApi = ref(false)
  const searchQuery = ref('')
  const activeCategory = ref<string | null>(null)

  function publicDocumentToService(doc: PublicDocument, idx: number): Service {
    const slug = docTypeIdToCategorySlug(doc.type.documentTypeId)
    const title = doc.title
    const desc = doc.description ?? ''

    return {
      id: `pub-${doc.id}`,
      categoryId: `api-${doc.type.documentTypeId}`,
      categorySlug: slug,
      title,
      shortDescription: desc || 'Démarche disponible sur la plateforme Barua.',
      description: desc || 'Démarche disponible sur la plateforme Barua.',
      eligibility: 'citizen',
      estimatedDuration: 'À confirmer',
      cost: undefined,
      currency: 'FC',
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
        doc.type.name,
      ],
      isOnline: true,
      ministry: doc.type.name,
      isPopular: idx < 6, // “les plus demandés” = top 6 par défaut
    }
  }

  async function fetchServicesFromPublicDocuments(opts?: { force?: boolean }) {
    const force = opts?.force ?? false
    if (!force && hydratedFromApi.value) return

    loading.value = true
    error.value = null
    try {
      const docs = await getPublicDocuments()
      services.value = docs.map((d, i) => publicDocumentToService(d, i))
      hydratedFromApi.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
      // fallback: on garde les SERVICES mock
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

  const popularServices = computed(() => services.value.filter(s => s.isPopular))

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

  return {
    categories, services, loading, error, hydratedFromApi, searchQuery, activeCategory,
    filteredServices, popularServices,
    getCategoryBySlug, getServiceById, getServicesByCategory,
    setSearch, setCategory,
    fetchServicesFromPublicDocuments,
  }
})
