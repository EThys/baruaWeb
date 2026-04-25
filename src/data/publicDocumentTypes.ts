import type { PublicDocumentType } from '@/models/publicDocuments'

export const DEFAULT_PUBLIC_DOCUMENT_TYPES: PublicDocumentType[] = [
  { documentTypeId: 1, name: 'État Civil & Papiers', description: "Actes de naissance, mariage, nationalité, passeport, carte d'identité..." },
  { documentTypeId: 2, name: 'Emploi & Sécurité Sociale', description: "Volontariat, carte de demandeur d'emploi, cotisation sociale..." },
  { documentTypeId: 3, name: 'Éducation & Formation', description: "Examens, concours, bourses d'études, équivalences de diplômes..." },
  { documentTypeId: 4, name: 'Fiscalité, Foncier & Douanes', description: 'Titre foncier, justificatif fiscal, taxes, redevances...' },
  { documentTypeId: 5, name: 'Agriculture, Élevage & Industrie', description: 'Enrôlement des petits agriculteurs, subventions, licences...' },
  { documentTypeId: 6, name: 'Justice & Droit', description: null },
  { documentTypeId: 7, name: 'Habitat & Transport', description: null },
  { documentTypeId: 8, name: 'Télécommunication & Culture', description: null },
  { documentTypeId: 9, name: 'Sécurité & Ordre Public', description: null },
  { documentTypeId: 10, name: 'Santé & Protection Sociale', description: null },
]

