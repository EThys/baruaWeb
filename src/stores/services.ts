import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServiceCategory, Service } from '@/types'
import { CATEGORIES, SERVICES } from '@/data/services'

export const useServicesStore = defineStore('services', () => {
  const categories = ref<ServiceCategory[]>(CATEGORIES)
  const services = ref<Service[]>(SERVICES)
  const loading = ref(false)
  const searchQuery = ref('')
  const activeCategory = ref<string | null>(null)

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
    categories, services, loading, searchQuery, activeCategory,
    filteredServices, popularServices,
    getCategoryBySlug, getServiceById, getServicesByCategory,
    setSearch, setCategory,
  }
})
