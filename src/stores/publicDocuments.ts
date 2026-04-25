import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getPublicDocumentTypes } from '@/api/publicDocuments'
import type { PublicDocumentType } from '@/models/publicDocuments'
import { DEFAULT_PUBLIC_DOCUMENT_TYPES } from '@/data/publicDocumentTypes'

export const usePublicDocumentsStore = defineStore('publicDocuments', () => {
  // Valeur par défaut pour éviter un hero vide au 1er rendu.
  const documentTypes = ref<PublicDocumentType[]>(DEFAULT_PUBLIC_DOCUMENT_TYPES)
  const loadingTypes = ref(false)
  const typesError = ref<string | null>(null)
  const lastFetchedAt = ref<number | null>(null)

  const heroDocumentTypes = computed(() => documentTypes.value.slice(0, 10))

  async function fetchDocumentTypes(opts?: { force?: boolean }) {
    const force = opts?.force ?? false
    if (!force && documentTypes.value.length > 0) return documentTypes.value
    if (loadingTypes.value) return documentTypes.value

    loadingTypes.value = true
    typesError.value = null
    try {
      const types = await getPublicDocumentTypes()
      documentTypes.value = types
      lastFetchedAt.value = Date.now()
      return documentTypes.value
    } catch (e) {
      typesError.value = e instanceof Error ? e.message : 'Erreur de chargement'
      // On garde la liste par défaut si l’API échoue.
      return documentTypes.value
    } finally {
      loadingTypes.value = false
    }
  }

  return {
    documentTypes,
    heroDocumentTypes,
    loadingTypes,
    typesError,
    lastFetchedAt,
    fetchDocumentTypes,
  }
})

