import api from '@/services/api'
import type { ApiRequestConfig } from '@/services/api'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  ApiDemandeRaw,
  ApiDemandeStatus,
  ChangeDemandeStatusPayload,
  CreateDemandeProcurationFields,
} from '@/models/demandes'
import { extractArray, filterHistoriqueByDemandeId } from '@/models/demandes'

export async function getDemandeStatuses(): Promise<ApiDemandeStatus[]> {
  const { data } = await api.get<unknown>(ENDPOINTS.publicDemandeStatuses, {
    skipAuth: true,
  } as ApiRequestConfig)
  const list = extractArray(data, ['status', 'statuses', 'data'])
  return list.map(s => ({
    statusId: Number(s.statusId ?? s.id ?? 0),
    code: String(s.code ?? ''),
    label: String(s.label ?? s.code ?? ''),
  })).filter(s => s.code)
}

/** Liste des demandes du citoyen connecté. */
export async function getMyDemandes(): Promise<ApiDemandeRaw[]> {
  const { data } = await api.get<unknown>(ENDPOINTS.protectedDemandesProcuration)
  return extractArray(data, ['demandes', 'demandeProcurations', 'data', 'items', 'content'])
}

/** Liste admin de toutes les demandes. */
export async function getAllDemandesAdmin(): Promise<ApiDemandeRaw[]> {
  const { data } = await api.get<unknown>(ENDPOINTS.privateDemandesProcuration)
  return extractArray(data, ['demandes', 'demandeProcurations', 'data', 'items', 'content'])
}

/** Évolution / historique d’une demande (citoyen). */
export async function getDemandeEvolution(id: number): Promise<unknown> {
  const { data } = await api.get<unknown>(
    `${ENDPOINTS.protectedDemandesProcuration}/${id}/evolution`,
  )
  return data
}

/** Historique global admin. */
export async function getDemandesHistoriqueAdmin(): Promise<ApiDemandeRaw[]> {
  const { data } = await api.get<unknown>(
    `${ENDPOINTS.privateDemandesProcuration}/historique`,
  )
  return extractArray(data, ['historique', 'history', 'data', 'items', 'content', 'evolutions'])
}

/** Historique d’une demande pour l’admin (filtre sur l’historique global). */
export async function getDemandeEvolutionAdmin(id: number): Promise<ApiDemandeRaw[]> {
  const { data } = await api.get<unknown>(
    `${ENDPOINTS.privateDemandesProcuration}/historique`,
  )

  // Parfois l’API groupe par id : { "2": [ ... ] } ou { data: { "2": [...] } }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const root = data as Record<string, unknown>
    const nested = (root.data && typeof root.data === 'object' && !Array.isArray(root.data))
      ? (root.data as Record<string, unknown>)
      : root
    const byId = nested[String(id)] ?? nested[id as unknown as string]
    if (Array.isArray(byId)) return byId as ApiDemandeRaw[]
  }

  const all = extractArray(data, ['historique', 'history', 'data', 'items', 'content', 'evolutions'])
  return filterHistoriqueByDemandeId(all, id)
}

/**
 * Création d’une demande (multipart/form-data).
 * Champs : serviceDocumentaireId, commentaire, fullName, numberIdentity, phone, piece(s).
 */
export async function createDemandeProcuration(
  fields: CreateDemandeProcurationFields,
  files: File[] = [],
): Promise<unknown> {
  const form = new FormData()
  form.append('serviceDocumentaireId', String(fields.serviceDocumentaireId))
  if (fields.commentaire != null) form.append('commentaire', fields.commentaire)
  if (fields.fullName != null) form.append('fullName', fields.fullName)
  if (fields.numberIdentity != null) form.append('numberIdentity', fields.numberIdentity)
  if (fields.phone != null) form.append('phone', fields.phone)

  // Swagger : champ `piece` (binary). On envoie le 1er fichier sous `piece`,
  // et les suivants aussi sous `piece` (backends Spring acceptent souvent multi).
  if (files.length === 1) {
    form.append('piece', files[0], files[0].name)
  } else if (files.length > 1) {
    for (const f of files) form.append('piece', f, f.name)
  }

  const { data } = await api.post<unknown>(ENDPOINTS.protectedDemandesProcuration, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return data
}

/** Admin / citoyen : changer le statut d’une demande. */
export async function changeDemandeStatus(
  id: number,
  payload: ChangeDemandeStatusPayload,
): Promise<unknown> {
  const body = {
    statusCode: payload.statusCode,
    ...(payload.note != null && payload.note !== '' ? { note: payload.note } : {}),
  }
  const { data } = await api.put<unknown>(
    `${ENDPOINTS.privateDemandesProcuration}/${id}/status`,
    body,
  )
  return data
}

/**
 * Annulation citoyen.
 * Pas d’endpoint dédié : on utilise PUT …/status.
 * 1) essaie `protected/…/status` (si le backend l’expose pour le propriétaire)
 * 2) sinon `private/…/status`
 * 3) si `annulees` est refusé, fallback `rejetees` + note « Annulée par le citoyen »
 */
export async function cancelDemandeProcuration(
  id: number,
  note = 'Demande annulée par le citoyen',
): Promise<{ statusCode: string }> {
  const tryPut = async (path: string, statusCode: string) => {
    await api.put(path, { statusCode, note })
    return statusCode
  }

  const protectedPath = `${ENDPOINTS.protectedDemandesProcuration}/${id}/status`
  const privatePath = `${ENDPOINTS.privateDemandesProcuration}/${id}/status`

  const attempt = async (statusCode: string) => {
    try {
      return await tryPut(protectedPath, statusCode)
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      // 404 = route inexistante → bascule private
      if (status === 404 || status === 405) {
        return tryPut(privatePath, statusCode)
      }
      // 403 sur protected → tenter private (certains rôles)
      if (status === 403) {
        return tryPut(privatePath, statusCode)
      }
      throw e
    }
  }

  try {
    const code = await attempt('annulees')
    return { statusCode: code }
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    const msg = String((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '')
    // Code statut inconnu → fallback catalogue public
    if (status === 400 || status === 422 || /statut|status|code/i.test(msg)) {
      const code = await attempt('rejetees')
      return { statusCode: code }
    }
    throw e
  }
}
