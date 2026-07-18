import { PUBLIC_ACCOUNT_IDS } from '@/data/publicAccounts'
import { accountRoleLabel, resolveRoleFromAccountProfile } from '@/utils/accountRole'
import type { UserAccountProfile } from '@/types'

export interface ParsedUserAccount {
  accountId?: number
  accountName?: string
  /** true si le rôle principal est citoyen (ou aucun rôle admin détecté). */
  isCitizen: boolean
  roleLabel: string
  organismId?: number
  organismName?: string
  organismCity?: string
  /** true seulement si l’API a réellement renvoyé un compte / profil. */
  resolved: boolean
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

function num(v: unknown): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function collectArrays(raw: Record<string, unknown>): unknown[] {
  const keys = [
    'profile', 'profiles', 'accounts', 'roles',
    'accountUsers', 'userAccounts', 'permissions',
    'permissionUsers', 'assignedAccounts', 'userRoles',
  ]
  const out: unknown[] = []
  for (const k of keys) {
    if (Array.isArray(raw[k])) out.push(...(raw[k] as unknown[]))
  }
  const member = asRecord(raw.member)
  if (member) {
    for (const k of ['profile', 'profiles', 'accounts', 'roles']) {
      if (Array.isArray(member[k])) out.push(...(member[k] as unknown[]))
    }
  }
  const data = asRecord(raw.data)
  if (data) {
    for (const k of ['profile', 'profiles', 'accounts', 'roles']) {
      if (Array.isArray(data[k])) out.push(...(data[k] as unknown[]))
    }
  }
  return out
}

/** Extrait le compte / rôle depuis une réponse user hétérogène. */
export function parseUserAccount(raw: Record<string, unknown>): ParsedUserAccount {
  const profiles: UserAccountProfile[] = []

  const pushProfile = (p: Record<string, unknown>) => {
    const account = asRecord(p.account) ?? p
    const accountId = num(
      account.id
      ?? account.accountId
      ?? p.accountId
      ?? p.profileId
      ?? p.id,
    )
    if (!accountId) return
    // Ignorer les ids qui ne correspondent pas à des comptes connus si ce n’est qu’un id d’entité random
    // (on accepte quand même tout id > 0 : la plateforme peut étendre les comptes)
    const typeAccount = asRecord(account.typeAccount) ?? asRecord(p.typeAccount)
    const organism = asRecord(p.organism) ?? asRecord(account.organism)
    profiles.push({
      accountId,
      accountName: String(account.name ?? account.accountName ?? p.accountName ?? ''),
      typeAccountId: num(typeAccount?.typeAccountId ?? typeAccount?.id) ?? 0,
      typeAccountName: String(typeAccount?.name ?? p.typeAccountName ?? ''),
      organismId: num(organism?.id ?? p.organismId),
      organismName: organism?.name != null ? String(organism.name) : undefined,
      organismCity: organism?.city != null ? String(organism.city) : undefined,
    })
  }

  for (const item of collectArrays(raw)) {
    const rec = asRecord(item)
    if (rec) pushProfile(rec)
  }

  const directId = num(
    raw.accountId
    ?? asRecord(raw.account)?.id
    ?? asRecord(raw.account)?.accountId,
  )
  if (directId && !profiles.some(p => p.accountId === directId)) {
    const account = asRecord(raw.account)
    profiles.push({
      accountId: directId,
      accountName: String(account?.name ?? raw.accountName ?? ''),
      typeAccountId: 0,
      typeAccountName: String(raw.typeAccountName ?? ''),
    })
  }

  if (!profiles.length) {
    // Ne pas inventer un rôle citoyen : sinon on écrase un vrai admin au reload.
    return {
      accountId: undefined,
      accountName: undefined,
      isCitizen: true,
      roleLabel: 'Citoyen',
      resolved: false,
    }
  }

  const staff = profiles.find(p => p.accountId !== PUBLIC_ACCOUNT_IDS.CITOYEN)
  const withOrganism = profiles.find(p => p.organismName || p.organismCity)
  const primary = staff ?? profiles[0]
  const role = resolveRoleFromAccountProfile(primary)
  return {
    accountId: primary.accountId,
    accountName: primary.accountName || accountRoleLabel(role),
    isCitizen: role === 'citizen' && !staff,
    roleLabel: accountRoleLabel(role),
    organismId: withOrganism?.organismId ?? primary.organismId,
    organismName: withOrganism?.organismName ?? primary.organismName,
    organismCity: withOrganism?.organismCity ?? primary.organismCity,
    resolved: true,
  }
}

export function isCitizenAccount(accountId?: number | null): boolean {
  return accountId == null || accountId === PUBLIC_ACCOUNT_IDS.CITOYEN
}
