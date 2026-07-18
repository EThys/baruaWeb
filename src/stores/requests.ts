import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RequestStatus, RequestStatusHistory, ServiceRequest } from '@/types'
import type { AdminUserDto } from '@/types/admin'
import {
  cancelDemandeProcuration,
  changeDemandeStatus,
  createDemandeProcuration,
  getAllDemandesAdmin,
  getDemandeEvolution,
  getDemandeEvolutionAdmin,
  getMyDemandes,
} from '@/api/demandes'
import { getAdminUserDetail } from '@/api/adminAuth'
import {
  CITIZEN_CANCEL_NOTE,
  mapApiDemandeToServiceRequest,
  mapAppStatusToApi,
  mapEvolutionToHistory,
  type CreateDemandeProcurationFields,
} from '@/models/demandes'
import { useAuthStore } from '@/stores/auth'

const LIST_TTL_MS = 45_000
const EVOLUTION_TTL_MS = 30_000
const PROFILE_TTL_MS = 5 * 60_000
const STORAGE_KEY = 'barua_requests_pinia_v1'

export interface CachedUserProfile {
  userId: number
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
  username?: string
  city?: string
  certified?: boolean
  premium?: boolean
  roleLabel?: string
  isCitizen?: boolean
  organismName?: string
  organismCity?: string
  fetchedAt: number
}

interface PersistedCache {
  scope: 'staff' | 'citizen'
  fetchedAt: number
  requests: ServiceRequest[]
  evolutionFetchedAt: Record<string, number>
  userProfiles: Record<string, CachedUserProfile>
}

function extractCreatedDemande(data: unknown): ServiceRequest | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  const candidate =
    obj.demande
    ?? obj.demandeProcuration
    ?? obj.data
    ?? obj
  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
    return mapApiDemandeToServiceRequest(candidate as Record<string, unknown>)
  }
  return null
}

function extractErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string; detailMessage?: string } }; message?: string }
  return err.response?.data?.message
    ?? err.response?.data?.detailMessage
    ?? err.message
    ?? 'Une erreur est survenue.'
}

function isFresh(ts: number, ttl: number): boolean {
  return ts > 0 && Date.now() - ts < ttl
}

function currentScope(): 'staff' | 'citizen' {
  return useAuthStore().isStaff ? 'staff' : 'citizen'
}

function profileFromAdminUser(detail: AdminUserDto): CachedUserProfile {
  const name = `${detail.firstName ?? ''} ${detail.lastName ?? ''}`.trim()
    || (detail.username ? detail.username.replace(/^@+/, '') : '')
    || detail.email
  return {
    userId: detail.userId,
    firstName: detail.firstName || undefined,
    lastName: detail.lastName || undefined,
    name: name || undefined,
    email: detail.email || undefined,
    phone: detail.phone || undefined,
    username: detail.username?.replace(/^@+/, '') || undefined,
    city: detail.city || undefined,
    certified: detail.certified,
    premium: detail.premium,
    roleLabel: detail.roleLabel,
    isCitizen: detail.isCitizen,
    organismName: detail.organismName,
    organismCity: detail.organismCity,
    fetchedAt: Date.now(),
  }
}

function applyProfileToRequest(r: ServiceRequest, profile: CachedUserProfile) {
  if (profile.name) r.applicantName = profile.name
  if (profile.email) r.applicantEmail = profile.email
  if (profile.phone) r.applicantPhone = profile.phone
  if (profile.city) r.applicantCity = profile.city
  if (profile.username) r.applicantUsername = profile.username
  r.formData = {
    ...r.formData,
    fullName: r.formData.fullName || profile.name,
    email: r.formData.email || profile.email,
    phone: r.formData.phone || profile.phone,
    city: r.formData.city || profile.city,
    username: r.formData.username || profile.username,
  }
}

export const useRequestsStore = defineStore('requests', () => {
  const requests = ref<ServiceRequest[]>([])
  const loading = ref(false)
  const hydrated = ref(false)
  const error = ref<string | null>(null)
  const filterStatus = ref<RequestStatus | 'all'>('all')
  const listFetchedAt = ref(0)
  const evolutionFetchedAt = ref<Record<string, number>>({})
  const userProfiles = ref<Record<string, CachedUserProfile>>({})
  const evolutionLoading = ref<Record<string, boolean>>({})
  let listInflight: Promise<void> | null = null
  const evolutionInflight = new Map<string, Promise<void>>()

  const filteredRequests = computed(() => {
    if (filterStatus.value === 'all') return requests.value
    return requests.value.filter(r => r.status === filterStatus.value)
  })

  const activeRequests = computed(() =>
    requests.value.filter(r => !['approuvee', 'rejetee', 'annulee'].includes(r.status)),
  )

  const stats = computed(() => ({
    total: requests.value.length,
    pending: requests.value.filter(r => r.status === 'soumise').length,
    inProgress: requests.value.filter(r => r.status === 'en_cours').length,
    approved: requests.value.filter(r => r.status === 'approuvee').length,
    rejected: requests.value.filter(r => r.status === 'rejetee').length,
  }))

  function persistLocal() {
    try {
      const payload: PersistedCache = {
        scope: currentScope(),
        fetchedAt: listFetchedAt.value,
        requests: requests.value,
        evolutionFetchedAt: { ...evolutionFetchedAt.value },
        userProfiles: { ...userProfiles.value },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // quota / private mode
    }
  }

  function restoreLocal(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return false
      const parsed = JSON.parse(raw) as PersistedCache
      if (!parsed || parsed.scope !== currentScope()) return false
      if (!Array.isArray(parsed.requests) || !parsed.requests.length) return false
      requests.value = parsed.requests
      listFetchedAt.value = parsed.fetchedAt || 0
      evolutionFetchedAt.value = parsed.evolutionFetchedAt || {}
      userProfiles.value = parsed.userProfiles || {}
      hydrated.value = true
      return true
    } catch {
      return false
    }
  }

  function clearLocalCache() {
    requests.value = []
    hydrated.value = false
    listFetchedAt.value = 0
    evolutionFetchedAt.value = {}
    userProfiles.value = {}
    error.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore */ }
  }

  function getRequestById(id: string) {
    return requests.value.find(r => r.id === id || String(r.demandeProcurationId) === id)
  }

  function getCachedProfile(userId: string | number | undefined | null): CachedUserProfile | null {
    if (userId == null || userId === '') return null
    return userProfiles.value[String(userId)] ?? null
  }

  function upsertRequest(req: ServiceRequest) {
    const idx = requests.value.findIndex(
      r => r.id === req.id || (r.demandeProcurationId != null && r.demandeProcurationId === req.demandeProcurationId),
    )
    if (idx >= 0) requests.value[idx] = req
    else requests.value.unshift(req)
    persistLocal()
  }

  async function fetchUserProfile(userId: number, opts?: { force?: boolean }): Promise<CachedUserProfile | null> {
    const key = String(userId)
    const cached = userProfiles.value[key]
    if (!opts?.force && cached && isFresh(cached.fetchedAt, PROFILE_TTL_MS)) {
      return cached
    }
    try {
      const detail = await getAdminUserDetail(userId)
      if (!detail) return cached ?? null
      const profile = profileFromAdminUser(detail)
      userProfiles.value = { ...userProfiles.value, [key]: profile }
      persistLocal()
      return profile
    } catch {
      return cached ?? null
    }
  }

  async function enrichApplicants(list: ServiceRequest[]) {
    const missingIds = [...new Set(
      list
        .filter(r => !!r.userId && !r.applicantName)
        .map(r => Number(r.userId))
        .filter(id => Number.isFinite(id) && id > 0),
    )]

    // Appliquer d’abord le cache Pinia / localStorage
    for (const r of list) {
      const cached = getCachedProfile(r.userId)
      if (cached && !r.applicantName) applyProfileToRequest(r, cached)
    }

    const toFetch = missingIds.filter((id) => {
      const cached = userProfiles.value[String(id)]
      return !cached || !isFresh(cached.fetchedAt, PROFILE_TTL_MS)
    })
    if (!toFetch.length) return

    const batchSize = 8
    for (let i = 0; i < toFetch.length; i += batchSize) {
      const batch = toFetch.slice(i, i + batchSize)
      await Promise.allSettled(batch.map(id => fetchUserProfile(id)))
    }

    for (const r of list) {
      const cached = getCachedProfile(r.userId)
      if (cached) applyProfileToRequest(r, cached)
    }
  }

  async function loadRequestsFromApi() {
    const auth = useAuthStore()
    const raw = auth.isStaff
      ? await getAllDemandesAdmin()
      : await getMyDemandes()
    const mapped = raw.map(mapApiDemandeToServiceRequest)

    // Préserver historiques déjà chargés en local
    for (const next of mapped) {
      const prev = getRequestById(next.id) ?? (
        next.demandeProcurationId != null
          ? requests.value.find(r => r.demandeProcurationId === next.demandeProcurationId)
          : undefined
      )
      if (prev && prev.statusHistory.length > next.statusHistory.length) {
        next.statusHistory = prev.statusHistory
      }
      if (prev?.applicantName && !next.applicantName) {
        next.applicantName = prev.applicantName
        next.applicantEmail = prev.applicantEmail ?? next.applicantEmail
        next.applicantPhone = prev.applicantPhone ?? next.applicantPhone
        next.applicantCity = prev.applicantCity ?? next.applicantCity
        next.applicantUsername = prev.applicantUsername ?? next.applicantUsername
      }
    }

    requests.value = mapped
    listFetchedAt.value = Date.now()
    hydrated.value = true
    persistLocal()

    if (auth.isStaff) {
      try {
        await enrichApplicants(mapped)
        requests.value = [...mapped]
        persistLocal()
      } catch {
        // noms optionnels
      }
    }
  }

  /**
   * Citoyen : GET protected/demandes/procuration
   * Admin : GET private/demandes/procuration
   * Cache Pinia + localStorage, refresh en arrière-plan si périmé.
   */
  async function fetchRequests(opts?: { force?: boolean }) {
    error.value = null

    if (!hydrated.value) {
      restoreLocal()
    }

    if (!opts?.force && hydrated.value && isFresh(listFetchedAt.value, LIST_TTL_MS)) {
      loading.value = false
      return
    }

    // Données locales présentes : afficher tout de suite, rafraîchir en fond
    if (!opts?.force && hydrated.value && requests.value.length) {
      loading.value = false
      if (!listInflight) {
        listInflight = loadRequestsFromApi()
          .catch((e) => { error.value = extractErrorMessage(e) })
          .finally(() => { listInflight = null })
      }
      return listInflight
    }

    if (listInflight && !opts?.force) return listInflight

    loading.value = true
    listInflight = (async () => {
      try {
        await loadRequestsFromApi()
      } catch (e) {
        error.value = extractErrorMessage(e)
        if (!hydrated.value) requests.value = []
        hydrated.value = true
      } finally {
        loading.value = false
        listInflight = null
      }
    })()
    return listInflight
  }

  async function fetchRequestEvolution(id: string, opts?: { force?: boolean }) {
    const numericId = Number(id)
    if (!Number.isFinite(numericId)) return
    const key = String(numericId)
    const auth = useAuthStore()
    const req = getRequestById(id) ?? requests.value.find(r => r.demandeProcurationId === numericId)

    const cachedAt = evolutionFetchedAt.value[key] ?? 0
    const hasUsefulHistory = (req?.statusHistory.length ?? 0) > 1
      || (req?.statusHistory.length === 1 && !!req.statusHistory[0]?.note)

    if (!opts?.force && isFresh(cachedAt, EVOLUTION_TTL_MS) && hasUsefulHistory) {
      return
    }

    const existing = evolutionInflight.get(key)
    if (existing && !opts?.force) return existing

    evolutionLoading.value = { ...evolutionLoading.value, [key]: true }
    const task = (async () => {
      try {
        let history: RequestStatusHistory[] = []

        if (auth.isStaff) {
          try {
            const adminRows = await getDemandeEvolutionAdmin(numericId)
            history = mapEvolutionToHistory(adminRows)
          } catch {
            // fallback protected
          }
        }

        if (!history.length) {
          try {
            const data = await getDemandeEvolution(numericId)
            history = mapEvolutionToHistory(data)
          } catch {
            // ignore
          }
        }

        if (req && history.length) {
          req.statusHistory = history
          req.status = history[0]?.status ?? req.status
          req.updatedAt = history[0]?.date ?? req.updatedAt
          requests.value = [...requests.value]
        }

        evolutionFetchedAt.value = {
          ...evolutionFetchedAt.value,
          [key]: Date.now(),
        }
        persistLocal()
      } finally {
        evolutionLoading.value = { ...evolutionLoading.value, [key]: false }
        evolutionInflight.delete(key)
      }
    })()

    evolutionInflight.set(key, task)
    return task
  }

  async function ensureApplicantProfile(userId: string | number | undefined | null) {
    if (userId == null || userId === '') return null
    const id = Number(userId)
    if (!Number.isFinite(id) || id <= 0) return getCachedProfile(userId)
    return fetchUserProfile(id)
  }

  async function submitDemandeProcuration(
    fields: CreateDemandeProcurationFields,
    files: File[],
    meta?: { serviceName?: string; categorySlug?: ServiceRequest['categorySlug']; serviceId?: string },
  ): Promise<ServiceRequest> {
    const data = await createDemandeProcuration(fields, files)
    let mapped = extractCreatedDemande(data)
    if (!mapped) {
      const authUser = useAuthStore().user
      mapped = {
        id: `tmp-${Date.now()}`,
        referenceNumber: `DEM-${Date.now()}`,
        userId: authUser?.id ?? '',
        serviceId: meta?.serviceId ?? `sd-${fields.serviceDocumentaireId}`,
        serviceName: meta?.serviceName ?? 'Demande',
        categorySlug: meta?.categorySlug ?? 'etat-civil',
        status: 'soumise',
        formData: {
          fullName: fields.fullName,
          phone: fields.phone,
          numberIdentity: fields.numberIdentity,
          email: authUser?.email,
          commentaire: fields.commentaire,
        },
        documents: [],
        statusHistory: [{ status: 'soumise', date: new Date().toISOString(), note: 'Demande soumise' }],
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serviceDocumentaireId: fields.serviceDocumentaireId,
        applicantName: fields.fullName,
        applicantPhone: fields.phone,
        applicantIdentity: fields.numberIdentity,
        applicantEmail: authUser?.email,
        applicantUsername: authUser?.username,
        applicantCity: authUser?.city,
      }
    } else {
      if (!mapped.applicantName && fields.fullName) mapped.applicantName = fields.fullName
      if (!mapped.applicantPhone && fields.phone) mapped.applicantPhone = fields.phone
      if (!mapped.applicantIdentity && fields.numberIdentity) mapped.applicantIdentity = fields.numberIdentity
    }
    if (meta?.serviceName) mapped.serviceName = meta.serviceName
    if (meta?.categorySlug) mapped.categorySlug = meta.categorySlug
    upsertRequest(mapped)
    try {
      await fetchRequests({ force: true })
      const found = requests.value.find(
        r => r.serviceDocumentaireId === fields.serviceDocumentaireId
          && r.formData?.fullName === fields.fullName,
      ) ?? requests.value[0]
      if (found) return found
    } catch { /* keep mapped */ }
    return mapped
  }

  /** @deprecated Utiliser submitDemandeProcuration */
  function submitRequest(
    req: Omit<ServiceRequest, 'id' | 'referenceNumber' | 'statusHistory' | 'createdAt' | 'updatedAt'>,
  ) {
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
    persistLocal()
    return newReq
  }

  async function cancelRequest(id: string) {
    const r = getRequestById(id)
    if (!r) throw new Error('Demande introuvable')
    if (!['soumise', 'en_cours'].includes(r.status)) {
      throw new Error('Cette demande ne peut plus être annulée.')
    }
    const numericId = r.demandeProcurationId ?? Number(r.id)
    if (!Number.isFinite(numericId)) throw new Error('Identifiant de demande invalide')

    await cancelDemandeProcuration(numericId, CITIZEN_CANCEL_NOTE)
    const now = new Date().toISOString()
    // Affiché « Annulée » même si l’API a dû poster « rejetees » (catalogue sans annulees).
    r.status = 'annulee'
    r.updatedAt = now
    r.agentNote = CITIZEN_CANCEL_NOTE
    r.statusHistory.unshift({
      status: 'annulee',
      date: now,
      note: CITIZEN_CANCEL_NOTE,
    })
    evolutionFetchedAt.value = {
      ...evolutionFetchedAt.value,
      [String(numericId)]: Date.now(),
    }
    persistLocal()

    try {
      await fetchRequestEvolution(String(numericId), { force: true })
    } catch { /* keep local history */ }
  }

  async function adminUpdateStatus(opts: {
    id: string
    status: RequestStatus
    note?: string
    agentName?: string
  }) {
    const r = getRequestById(opts.id)
    if (!r) throw new Error('Demande introuvable')
    const numericId = r.demandeProcurationId ?? Number(r.id)
    if (!Number.isFinite(numericId)) throw new Error('Identifiant de demande invalide')

    await changeDemandeStatus(numericId, {
      statusCode: mapAppStatusToApi(opts.status),
      note: opts.note,
    })

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
    evolutionFetchedAt.value = {
      ...evolutionFetchedAt.value,
      [String(numericId)]: Date.now(),
    }
    persistLocal()

    try {
      await fetchRequestEvolution(String(numericId), { force: true })
    } catch { /* keep local history */ }
  }

  async function requestCitizenJustification(opts: {
    id: string
    message: string
    agentName?: string
  }) {
    await adminUpdateStatus({
      id: opts.id,
      status: 'en_cours',
      note: opts.message,
      agentName: opts.agentName,
    })
  }

  function setFilterStatus(s: RequestStatus | 'all') { filterStatus.value = s }

  return {
    requests,
    loading,
    hydrated,
    error,
    filterStatus,
    listFetchedAt,
    evolutionFetchedAt,
    evolutionLoading,
    userProfiles,
    filteredRequests,
    activeRequests,
    stats,
    getRequestById,
    getCachedProfile,
    ensureApplicantProfile,
    fetchRequests,
    fetchRequestEvolution,
    submitDemandeProcuration,
    submitRequest,
    cancelRequest,
    adminUpdateStatus,
    requestCitizenJustification,
    setFilterStatus,
    clearLocalCache,
    persistLocal,
    restoreLocal,
  }
})
