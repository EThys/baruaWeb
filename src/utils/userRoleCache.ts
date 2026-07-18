import { PUBLIC_ACCOUNT_IDS } from '@/data/publicAccounts'
import { accountRoleLabel } from '@/utils/accountRole'
import { isCitizenAccount } from '@/utils/parseUserAccount'

const STORAGE_KEY = 'barua_user_roles_v1'

export interface CachedUserRole {
  accountId: number
  organismId?: number | null
  roleLabel?: string
  accountName?: string
  updatedAt: number
}

type RoleCacheMap = Record<string, CachedUserRole>

function readAll(): RoleCacheMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as RoleCacheMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(map: RoleCacheMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // quota / private mode
  }
}

export function getCachedUserRole(userId: number): CachedUserRole | null {
  return readAll()[String(userId)] ?? null
}

export function setCachedUserRole(
  userId: number,
  accountId: number,
  opts?: { organismId?: number | null; roleLabel?: string; accountName?: string },
) {
  const map = readAll()
  map[String(userId)] = {
    accountId,
    organismId: opts?.organismId ?? null,
    roleLabel: opts?.roleLabel,
    accountName: opts?.accountName,
    updatedAt: Date.now(),
  }
  writeAll(map)
}

export function clearCachedUserRoles() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

export function applyCachedRoleToUser<T extends {
  userId: number
  accountId?: number
  accountName?: string
  roleLabel?: string
  isCitizen?: boolean
  organismId?: number
  roleResolved?: boolean
}>(u: T, accounts?: { id: number; name: string }[]): T {
  const cached = getCachedUserRole(u.userId)
  if (!cached) {
    if (u.accountId == null && u.isCitizen == null) {
      u.isCitizen = true
      u.accountId = PUBLIC_ACCOUNT_IDS.CITOYEN
      u.roleLabel = u.roleLabel || 'Citoyen'
    }
    return u
  }

  u.accountId = cached.accountId
  u.isCitizen = isCitizenAccount(cached.accountId)
  u.organismId = cached.organismId ?? undefined
  const accName = accounts?.find(a => a.id === cached.accountId)?.name
  u.accountName = cached.accountName || accName
  u.roleLabel = cached.roleLabel
    || accName
    || accountRoleLabel(
      cached.accountId === PUBLIC_ACCOUNT_IDS.SUPER_ADMIN ? 'super_admin'
        : cached.accountId === PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE ? 'ministry_admin'
          : cached.accountId === PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE ? 'commune_admin'
            : 'citizen',
    )
  u.roleResolved = true
  return u
}
