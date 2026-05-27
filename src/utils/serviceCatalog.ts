import type { Service } from '@/types'
import { formatServiceCost } from '@/data/devises'

/** Une entrée catalogue = un document proposé par plusieurs communes. */
export function groupServicesByDocument(services: Service[]): Service[] {
  const groups = new Map<number, Service[]>()

  for (const s of services) {
    if (s.documentId == null) continue
    const list = groups.get(s.documentId) ?? []
    list.push(s)
    groups.set(s.documentId, list)
  }

  const ungrouped = services.filter(s => s.documentId == null)

  const catalog = [...groups.entries()].map(([documentId, variants]) =>
    buildCatalogService(documentId, variants),
  )

  return [...catalog, ...ungrouped].sort((a, b) =>
    a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }),
  )
}

function buildCatalogService(documentId: number, variants: Service[]): Service {
  const sorted = [...variants].sort((a, b) => {
    const pa = a.cost ?? Number.MAX_SAFE_INTEGER
    const pb = b.cost ?? Number.MAX_SAFE_INTEGER
    return pa - pb
  })
  const primary = sorted[0]
  const communeIds = new Set(variants.map(v => v.organismId).filter(id => id != null))
  const offeringCount = communeIds.size || variants.length
  const costLabel = summarizeCosts(variants)

  const cheapestPaid = sorted.find(v => v.cost != null && v.cost > 0)

  return {
    ...primary,
    id: `catalog-doc-${documentId}`,
    catalogDocumentId: documentId,
    isCatalogEntry: true,
    offeringCount,
    costLabel,
    cost: cheapestPaid?.cost,
    currency: cheapestPaid?.currency ?? primary.currency,
    isPopular: variants.some(v => v.isPopular),
    ministry:
      offeringCount > 1
        ? `${offeringCount} communes`
        : primary.ministry,
    shortDescription:
      offeringCount > 1
        ? `Disponible dans ${offeringCount} communes — choisissez la vôtre pour voir tarif et délais.`
        : primary.shortDescription,
  }
}

/** Résumé tarifaire quand plusieurs communes / devises. */
export function summarizeCosts(variants: Service[]): string {
  const paid = variants.filter(v => v.cost != null && v.cost > 0)
  if (!paid.length) return 'Gratuit'

  const byCurrency = new Map<'FC' | 'USD', number[]>()
  for (const v of paid) {
    const list = byCurrency.get(v.currency) ?? []
    list.push(v.cost!)
    byCurrency.set(v.currency, list)
  }

  // Au plus deux montants (FC puis USD), séparés par une virgule.
  const order: Array<'FC' | 'USD'> = ['FC', 'USD']
  const parts: string[] = []
  for (const currency of order) {
    const amounts = byCurrency.get(currency)
    if (!amounts?.length) continue
    parts.push(formatServiceCost(Math.min(...amounts), currency))
  }

  return parts.slice(0, 2).join(', ')
}

export function serviceCardTo(service: Service): string | { path: string; query: Record<string, string> } {
  if (service.isCatalogEntry && service.catalogDocumentId != null) {
    return {
      path: '/services',
      query: { documentId: String(service.catalogDocumentId) },
    }
  }
  return `/services/${service.categorySlug}/${service.id}`
}
