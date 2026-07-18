import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DocumentRecord } from '@/types'
import { MOCK_DOCUMENTS } from '@/data/documents'
import { useAuthStore } from '@/stores/auth'

export const useDocumentsStore = defineStore('documents', () => {
  const docs = ref<DocumentRecord[]>([])
  const query = ref('')
  const loading = ref(true)
  const hydrated = ref(false)

  const auth = useAuthStore()

  const myDocuments = computed(() => {
    const uid = auth.user?.id
    if (!uid) return []
    return docs.value.filter(d => d.ownerUserId === uid)
  })

  const filteredMyDocuments = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return myDocuments.value
    return myDocuments.value.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q)) ||
      (d.ministry ?? '').toLowerCase().includes(q),
    )
  })

  const filteredAllDocuments = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return docs.value
    return docs.value.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q)) ||
      (d.ministry ?? '').toLowerCase().includes(q),
    )
  })

  async function fetchDocuments(opts?: { force?: boolean }) {
    if (hydrated.value && !opts?.force) {
      loading.value = false
      return
    }

    loading.value = true
    try {
      if (!docs.value.length || opts?.force) {
        docs.value = [...MOCK_DOCUMENTS]
      }
      hydrated.value = true
    } finally {
      loading.value = false
    }
  }

  function incrementDownload(id: string) {
    const d = docs.value.find(x => x.id === id)
    if (d) d.downloads += 1
  }

  return {
    docs, query, loading, hydrated,
    myDocuments, filteredMyDocuments, filteredAllDocuments,
    fetchDocuments, incrementDownload,
  }
})
