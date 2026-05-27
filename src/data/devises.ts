/** Référence API — devise envoyée à POST private/service/documentaires */
export const DEVISE_IDS = {
  FC: 1,
  USD: 2,
} as const

export const DEVISE_OPTIONS = [
  { id: DEVISE_IDS.FC, code: 'FC', label: 'Franc congolais (FC)' },
  { id: DEVISE_IDS.USD, code: 'USD', label: 'Dollar américain (USD)' },
] as const

export function deviseCodeById(deviseId: number): 'FC' | 'USD' {
  const code = DEVISE_OPTIONS.find(d => d.id === deviseId)?.code
  return code === 'USD' ? 'USD' : 'FC'
}

export function formatServicePrice(price: number, deviseId: number): string {
  if (price <= 0) return '—'
  return formatServiceCost(price, deviseCodeById(deviseId))
}

/** Affichage citoyen : FC ou symbole $ pour USD. */
export function formatServiceCost(cost: number | undefined, currency: 'FC' | 'USD'): string {
  if (cost == null || cost <= 0) return 'Gratuit'
  const n = cost.toLocaleString('fr-FR')
  return currency === 'USD' ? `${n} $` : `${n} FC`
}
