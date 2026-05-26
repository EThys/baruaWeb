import type { UserRole, UserAccountProfile } from '@/types'
import { PUBLIC_ACCOUNT_IDS } from '@/data/publicAccounts'

const ROLE_PRIORITY: Record<UserRole, number> = {
  citizen: 0,
  ministry_admin: 1,
  commune_admin: 2,
  super_admin: 3,
}

/** Rôle déduit du compte API (ids public/accounts). */
export function resolveRoleFromAccountProfile(profile: UserAccountProfile): UserRole {
  switch (profile.accountId) {
    case PUBLIC_ACCOUNT_IDS.SUPER_ADMIN:
      return 'super_admin'
    case PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE:
      return 'ministry_admin'
    case PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE:
      return 'commune_admin'
    case PUBLIC_ACCOUNT_IDS.CITOYEN:
      return 'citizen'
    default:
      break
  }

  const account = profile.accountName.toLowerCase()
  const typeAcc = profile.typeAccountName.toLowerCase()

  if (account === 'super-admin' || account === 'super_admin') return 'super_admin'
  if (account === 'citoyen' || account === 'citizen') return 'citizen'
  if (account === 'admin') {
    if (typeAcc === 'commune') return 'commune_admin'
    if (typeAcc === 'ministere' || typeAcc === 'ministry' || typeAcc === 'ministère') {
      return 'ministry_admin'
    }
  }

  return 'citizen'
}

/** Un profil unique → son rôle ; plusieurs profils (tests) → le plus élevé. */
export function resolveRoleFromProfiles(profiles: UserAccountProfile[]): UserRole {
  if (!profiles.length) return 'citizen'
  return profiles.reduce<UserRole>((best, p) => {
    const role = resolveRoleFromAccountProfile(p)
    return ROLE_PRIORITY[role] > ROLE_PRIORITY[best] ? role : best
  }, 'citizen')
}

export function communeAdminProfile(
  profiles: UserAccountProfile[],
): UserAccountProfile | undefined {
  return profiles.find(p => resolveRoleFromAccountProfile(p) === 'commune_admin' && p.organismId != null)
    ?? profiles.find(p => p.accountId === PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE)
}

export function accountRoleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin': return 'Super-admin'
    case 'commune_admin': return 'Admin commune'
    case 'ministry_admin': return 'Admin ministère'
    default: return 'Citoyen'
  }
}
