import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DocumentRecord } from '@/types'
import { MOCK_DOCUMENTS } from '@/data/documents'
import { useAuthStore } from '@/stores/auth'

export const useDocumentsStore = defineStore('documents', () => {
  const docs = ref<DocumentRecord[]>(MOCK_DOCUMENTS)
  const query = ref('')

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

  function incrementDownload(id: string) {
    const d = docs.value.find(x => x.id === id)
    if (d) d.downloads += 1
  }

  return {
    docs, query,
    myDocuments, filteredMyDocuments, filteredAllDocuments,
    incrementDownload,
  }
})

