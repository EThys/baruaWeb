import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServiceRequest, RequestStatus } from '@/types'
import { MOCK_REQUESTS } from '@/data/requests'

export const useRequestsStore = defineStore('requests', () => {
  const requests = ref<ServiceRequest[]>(MOCK_REQUESTS)
  const loading = ref(false)
  const filterStatus = ref<RequestStatus | 'all'>('all')

  const filteredRequests = computed(() => {
    if (filterStatus.value === 'all') return requests.value
    return requests.value.filter(r => r.status === filterStatus.value)
  })

  const activeRequests = computed(() =>
    requests.value.filter(r => !['approuvee', 'rejetee', 'annulee'].includes(r.status)),
  )

  const stats = computed(() => ({
    total:    requests.value.length,
    pending:  requests.value.filter(r => r.status === 'soumise').length,
    inProgress: requests.value.filter(r => r.status === 'en_cours').length,
    approved: requests.value.filter(r => r.status === 'approuvee').length,
    rejected: requests.value.filter(r => r.status === 'rejetee').length,
  }))

  function getRequestById(id: string) {
    return requests.value.find(r => r.id === id)
  }

  function submitRequest(req: Omit<ServiceRequest, 'id' | 'referenceNumber' | 'statusHistory' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const newReq: ServiceRequest = {
      ...req,
      id: `req-${Date.now()}`,
      referenceNumber: `BRW-${new Date().getFullYear()}-${String(requests.value.length + 1).padStart(5, '0')}`,
      statusHistory: [{ status: 'soumise', date: now, note: 'Demande soumise avec succès' }],
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    }
    requests.value.unshift(newReq)
    return newReq
  }

  function cancelRequest(id: string) {
    const r = requests.value.find(r => r.id === id)
    if (r) {
      r.status = 'annulee'
      r.updatedAt = new Date().toISOString()
      r.statusHistory.push({ status: 'annulee', date: r.updatedAt, note: 'Demande annulée par le citoyen' })
    }
  }

  function adminUpdateStatus(opts: { id: string; status: RequestStatus; note?: string; agentName?: string }) {
    const r = requests.value.find(x => x.id === opts.id)
    if (!r) return
    const now = new Date().toISOString()
    r.status = opts.status
    r.updatedAt = now
    r.agentNote = opts.note
    r.statusHistory.unshift({
      status: opts.status,
      date: now,
      note: opts.note,
      agentName: opts.agentName,
    })
  }

  function requestCitizenJustification(opts: { id: string; message: string; agentName?: string }) {
    adminUpdateStatus({
      id: opts.id,
      status: 'en_attente_document',
      note: opts.message,
      agentName: opts.agentName,
    })
  }

  function setFilterStatus(s: RequestStatus | 'all') { filterStatus.value = s }

  return {
    requests, loading, filterStatus,
    filteredRequests, activeRequests, stats,
    getRequestById, submitRequest, cancelRequest,
    adminUpdateStatus, requestCitizenJustification,
    setFilterStatus,
  }
})
