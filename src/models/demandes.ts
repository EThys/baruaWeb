import type { CategorySlug, RequestStatus, RequestStatusHistory, ServiceRequest } from '@/types'

/** Statuts exposés par GET /public/demandes/procuration/status */
export type ApiDemandeStatusCode = 'soumises' | 'en_cours' | 'approuvees' | 'rejetees' | string

export interface ApiDemandeStatus {
  statusId: number
  code: ApiDemandeStatusCode
  label: string
}

/** Corps POST multipart (hors fichier). */
export interface CreateDemandeProcurationFields {
  serviceDocumentaireId: number
  commentaire?: string
  fullName?: string
  numberIdentity?: string
  phone?: string
}

export interface ChangeDemandeStatusPayload {
  statusCode: ApiDemandeStatusCode
  note?: string
}

/** DTO brut flexible (schéma OpenAPI non typé). */
export type ApiDemandeRaw = Record<string, unknown>

const API_TO_APP: Record<string, RequestStatus> = {
  soumises: 'soumise',
  soumise: 'soumise',
  soumisee: 'soumise',
  en_cours: 'en_cours',
  'en cours': 'en_cours',
  'en cours de traitement': 'en_cours',
  en_attente_document: 'en_attente_document',
  approuvees: 'approuvee',
  approuvee: 'approuvee',
  approuve: 'approuvee',
  rejetees: 'rejetee',
  rejetee: 'rejetee',
  rejete: 'rejetee',
  brouillon: 'brouillon',
  annulee: 'annulee',
  annulees: 'annulee',
  annule: 'annulee',
}

const APP_TO_API: Partial<Record<RequestStatus, ApiDemandeStatusCode>> = {
  soumise: 'soumises',
  en_cours: 'en_cours',
  approuvee: 'approuvees',
  rejetee: 'rejetees',
  /** Convention plurielle comme les autres codes API ; absent du catalogue public actuel. */
  annulee: 'annulees',
  /** Pas de code API dédié : on passe par « en cours » + note */
  en_attente_document: 'en_cours',
}

function normalizeStatusKey(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
}

export function mapApiStatusToApp(code: string | undefined | null): RequestStatus {
  if (!code) return 'soumise'
  const key = normalizeStatusKey(code)
  // clés avec underscore aussi
  return API_TO_APP[key]
    ?? API_TO_APP[key.replace(/ /g, '_')]
    ?? 'soumise'
}

export function mapAppStatusToApi(status: RequestStatus): ApiDemandeStatusCode {
  return APP_TO_API[status] ?? 'en_cours'
}

function pickString(obj: ApiDemandeRaw, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v
    if (typeof v === 'number') return String(v)
  }
  return undefined
}

function pickNumber(obj: ApiDemandeRaw, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v)
  }
  return undefined
}

function pickNested(obj: ApiDemandeRaw, path: string[]): unknown {
  let cur: unknown = obj
  for (const p of path) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

function asRecord(v: unknown): ApiDemandeRaw | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as ApiDemandeRaw) : null
}

/** Extrait un tableau depuis une réponse API souple. */
export function extractArray(data: unknown, preferredKeys: string[]): ApiDemandeRaw[] {
  if (Array.isArray(data)) return data as ApiDemandeRaw[]
  if (!data || typeof data !== 'object') return []
  const obj = data as Record<string, unknown>
  for (const k of preferredKeys) {
    if (Array.isArray(obj[k])) return obj[k] as ApiDemandeRaw[]
  }
  for (const v of Object.values(obj)) {
    if (Array.isArray(v) && v.length && typeof v[0] === 'object') return v as ApiDemandeRaw[]
  }
  return []
}

export const CITIZEN_CANCEL_NOTE = 'Demande annulée par le citoyen'

export function isCitizenCancelNote(note?: string | null): boolean {
  if (!note) return false
  return /annul[ée]*e?\s+par\s+le\s+citoyen/i.test(note)
}

function statusFromRaw(raw: ApiDemandeRaw): RequestStatus {
  const nested = pickNested(raw, ['status', 'code'])
  let status: RequestStatus =
    typeof nested === 'string'
      ? mapApiStatusToApp(nested)
      : (() => {
          const statusObj = raw.status
          if (statusObj && typeof statusObj === 'object') {
            const code = pickString(statusObj as ApiDemandeRaw, ['code', 'statusCode', 'label'])
            if (code) return mapApiStatusToApp(code)
          }
          return mapApiStatusToApp(
            pickString(raw, ['statusCode', 'code', 'statut', 'statusLabel', 'currentStatus']),
          )
        })()

  // Fallback API : si le backend n’a pas « annulees », on a pu poster « rejetees » + note citoyen.
  const note = pickString(raw, ['note', 'commentaire', 'comment', 'agentNote', 'lastNote'])
  if (status === 'rejetee' && isCitizenCancelNote(note)) {
    status = 'annulee'
  }
  return status
}

function serviceNameFromRaw(raw: ApiDemandeRaw): string {
  const doc = pickNested(raw, ['serviceDocumentaire', 'document', 'title'])
  if (typeof doc === 'string') return doc
  const sd = raw.serviceDocumentaire
  if (sd && typeof sd === 'object') {
    const sdo = sd as ApiDemandeRaw
    const nestedDoc = sdo.document
    if (nestedDoc && typeof nestedDoc === 'object') {
      const t = pickString(nestedDoc as ApiDemandeRaw, ['title', 'name'])
      if (t) return t
    }
    const t2 = pickString(sdo, ['title', 'name', 'documentTitle'])
    if (t2) return t2
  }
  return pickString(raw, ['serviceName', 'documentTitle', 'title', 'libelle']) ?? 'Demande'
}

function mapHistoryItem(raw: ApiDemandeRaw): RequestStatusHistory {
  const statusObj = asRecord(raw.status) ?? asRecord(raw.statut) ?? asRecord(raw.newStatus)
  let status = mapApiStatusToApp(
    pickString(raw, ['statusCode', 'code', 'status', 'statut', 'label', 'statusLabel'])
    ?? pickString(statusObj ?? {}, ['code', 'statusCode', 'label', 'name'])
    ?? (typeof pickNested(raw, ['status', 'code']) === 'string'
      ? String(pickNested(raw, ['status', 'code']))
      : undefined),
  )
  const note = pickString(raw, ['note', 'commentaire', 'comment', 'message', 'description'])
  if (status === 'rejetee' && isCitizenCancelNote(note)) status = 'annulee'

  const date =
    pickString(raw, ['date', 'createdAt', 'changedAt', 'updatedAt', 'timestamp', 'dateChange', 'dateModification'])
    ?? new Date().toISOString()

  const agentObj =
    asRecord(raw.agent)
    ?? asRecord(raw.changedBy)
    ?? asRecord(raw.auteur)
    ?? asRecord(raw.user)
    ?? asRecord(raw.admin)

  const agentFromObj = agentObj
    ? (
        [pickString(agentObj, ['firstName', 'prenom']), pickString(agentObj, ['lastName', 'nom'])]
          .filter(Boolean)
          .join(' ')
          .trim()
        || pickString(agentObj, ['fullName', 'name', 'username', 'email'])
      )
    : undefined

  const agentName =
    pickString(raw, ['agentName', 'changedByName', 'userName', 'auteur', 'adminName'])
    || (typeof raw.agent === 'string' ? raw.agent : undefined)
    || agentFromObj
    || undefined

  return {
    status,
    date,
    note,
    agentName,
  }
}

/** Filtre l’historique global admin pour une demande. */
export function filterHistoriqueByDemandeId(list: ApiDemandeRaw[], demandeId: number): ApiDemandeRaw[] {
  const target = String(demandeId)
  const matched = list.filter((item) => {
    const nestedDemande = asRecord(item.demande) ?? asRecord(item.demandeProcuration)
    const id =
      pickNumber(item, ['demandeProcurationId', 'demandeId', 'procurationId'])
      ?? pickNumber(nestedDemande ?? {}, ['demandeProcurationId', 'id', 'demandeId'])
    if (id === demandeId) return true

    // Fallback : chercher une clé liée à la demande dans l’objet
    for (const [k, v] of Object.entries(item)) {
      if (!/demande|procuration/i.test(k)) continue
      if (v === demandeId || v === target) return true
      const nested = asRecord(v)
      if (nested) {
        const nid = pickNumber(nested, ['demandeProcurationId', 'id', 'demandeId'])
        if (nid === demandeId) return true
      }
    }
    return false
  })

  // Si aucun item n’a d’id demande exploitable, ne pas renvoyer toute la liste.
  return matched
}

export function mapEvolutionToHistory(data: unknown): RequestStatusHistory[] {
  const list = extractArray(data, [
    'evolutions', 'historique', 'history', 'statusHistory', 'data', 'items', 'content',
  ])
  return list
    .map(mapHistoryItem)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

/** Identité de l’auteur / demandeur depuis le DTO API (champs plats ou user imbriqué). */
export function applicantFromRaw(raw: ApiDemandeRaw): {
  userId?: string
  fullName?: string
  email?: string
  phone?: string
  numberIdentity?: string
  username?: string
  city?: string
} {
  const userField = raw.user ?? raw.citoyen ?? raw.citizen ?? raw.applicant ?? raw.auteur ?? raw.demandeur
  // Parfois l’API renvoie seulement l’id (ex. user: 20) sans objet profil.
  const userIdFromScalar =
    typeof userField === 'number' || (typeof userField === 'string' && /^\d+$/.test(userField.trim()))
      ? String(userField).trim()
      : undefined

  const user = asRecord(userField)
    ?? asRecord(raw.createdBy)
    ?? asRecord(raw.owner)
    ?? asRecord(asRecord(raw.member)?.user)

  const firstName = pickString(user ?? {}, ['firstName', 'prenom', 'first_name'])
  const lastName = pickString(user ?? {}, ['lastName', 'nom', 'last_name'])
  const composed = [firstName, lastName].filter(Boolean).join(' ').trim()

  const fullName =
    pickString(raw, ['fullName', 'nomComplet', 'applicantName', 'auteur', 'demandeur', 'citizenName', 'userName'])
    || (composed || undefined)
    || pickString(user ?? {}, ['fullName', 'name'])
    // Ne pas prendre username comme « nom » principal si on a un vrai nom ailleurs

  const userId =
    userIdFromScalar
    ?? pickString(raw, ['userId', 'citizenId', 'auteurId', 'createdById'])
    ?? pickString(user ?? {}, ['userId', 'id'])

  return {
    userId,
    fullName: fullName || pickString(user ?? {}, ['username', 'pseudo']),
    email:
      pickString(raw, ['email', 'userEmail', 'mail', 'courriel'])
      || pickString(user ?? {}, ['email', 'mail']),
    phone:
      pickString(raw, ['phone', 'telephone', 'tel', 'mobile'])
      || pickString(user ?? {}, ['phone', 'telephone', 'tel']),
    numberIdentity:
      pickString(raw, ['numberIdentity', 'nationalId', 'numeroIdentite', 'identityNumber', 'cni'])
      || pickString(user ?? {}, ['numberIdentity', 'nationalId', 'numeroIdentite']),
    username: pickString(user ?? {}, ['username', 'pseudo']),
    city: pickString(user ?? {}, ['city', 'ville']) || pickString(raw, ['city', 'ville']),
  }
}

export function mapApiDemandeToServiceRequest(raw: ApiDemandeRaw): ServiceRequest {
  const idNum = pickNumber(raw, [
    'demandeProcurationId', 'demandeId', 'id', 'procurationId',
  ])
  const id = idNum != null ? String(idNum) : pickString(raw, ['id']) ?? `demande-${Date.now()}`

  const sdId = pickNumber(raw, ['serviceDocumentaireId'])
    ?? pickNumber((raw.serviceDocumentaire as ApiDemandeRaw) ?? {}, ['serviceDocumentaireId', 'id'])

  const status = statusFromRaw(raw)
  const createdAt =
    pickString(raw, ['createdAt', 'submittedAt', 'dateCreation', 'created'])
    ?? new Date().toISOString()
  const updatedAt =
    pickString(raw, ['updatedAt', 'dateUpdate', 'modifiedAt'])
    ?? createdAt

  const historyRaw = extractArray(raw.historique ?? raw.evolutions ?? raw.statusHistory ?? raw.history, [
    'historique', 'evolutions', 'items', 'data',
  ])
  const statusHistory: RequestStatusHistory[] = historyRaw.length
    ? historyRaw.map(mapHistoryItem)
    : [{ status, date: createdAt, note: pickString(raw, ['commentaire', 'note', 'description']) }]

  const applicant = applicantFromRaw(raw)

  const sd = asRecord(raw.serviceDocumentaire)
  const organism = asRecord(sd?.organism) ?? asRecord(raw.organism) ?? asRecord(raw.commune)
  const organismType = asRecord(organism?.type)
  const serviceOrganismName = pickString(organism ?? {}, ['name', 'libelle', 'title'])
  const serviceOrganismCity = pickString(organism ?? {}, ['city', 'ville'])
  const serviceOrganismType = pickString(organismType ?? {}, ['name'])
    || pickString(organism ?? {}, ['typeName', 'type'])

  return {
    id,
    referenceNumber:
      pickString(raw, ['reference', 'referenceNumber', 'ref', 'code'])
      ?? `DEM-${id}`,
    userId: applicant.userId ?? '',
    serviceId: sdId != null ? `sd-${sdId}` : 'unknown',
    serviceName: serviceNameFromRaw(raw),
    categorySlug: (pickString(raw, ['categorySlug']) as CategorySlug | undefined) ?? 'etat-civil',
    status,
    formData: {
      fullName: applicant.fullName,
      phone: applicant.phone,
      numberIdentity: applicant.numberIdentity,
      email: applicant.email,
      username: applicant.username,
      city: applicant.city,
      commentaire: pickString(raw, ['commentaire', 'comment', 'description']),
    },
    documents: [],
    statusHistory,
    submittedAt: createdAt,
    updatedAt,
    createdAt,
    agentNote: pickString(raw, ['agentNote', 'note']),
    serviceDocumentaireId: sdId,
    demandeProcurationId: idNum,
    applicantName: applicant.fullName,
    applicantEmail: applicant.email,
    applicantPhone: applicant.phone,
    applicantIdentity: applicant.numberIdentity,
    applicantUsername: applicant.username,
    applicantCity: applicant.city,
    serviceOrganismName,
    serviceOrganismCity,
    serviceOrganismType,
  }
}
