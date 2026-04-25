import type { CategorySlug } from '@/types'

export function docTypeIdToCategorySlug(documentTypeId: number): CategorySlug {
  // Mapping basé sur l’API /public/documents/types (ids 1..10)
  switch (documentTypeId) {
    case 1: return 'etat-civil'
    case 2: return 'emploi-securite-sociale'
    case 3: return 'education'
    case 4: return 'fiscalite'
    case 5: return 'agriculture'
    case 6: return 'justice'
    case 7: return 'habitat-transport'
    case 8: return 'telecommunication'
    case 9: return 'securite'
    case 10: return 'sante'
    default: return 'etat-civil'
  }
}

