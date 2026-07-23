import { SERVICES } from '@/data/services'
import type { FormFieldConfig, Service, ServiceDocument } from '@/types'

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Schéma fake générique si aucun mock ne matche le titre API. */
const FALLBACK_FORM_FIELDS: FormFieldConfig[] = [
  {
    id: 'mock-ff1',
    name: 'lastName',
    label: 'Nom de famille',
    type: 'text',
    required: true,
    placeholder: 'MAYUMBI',
  },
  {
    id: 'mock-ff2',
    name: 'firstName',
    label: 'Prénom(s)',
    type: 'text',
    required: true,
    placeholder: 'Emy',
  },
  {
    id: 'mock-ff3',
    name: 'purpose',
    label: 'Motif de la demande',
    type: 'textarea',
    required: false,
    rows: 3,
    placeholder: 'Précisez le motif (test UI uniquement)…',
  },
]

const FALLBACK_REQUIRED_DOCS: ServiceDocument[] = [
  { id: 'mock-d1', label: 'Copie de la pièce d’identité', required: true },
  { id: 'mock-d2', label: 'Justificatif de domicile', required: false },
]

/**
 * Trouve le service mock le plus proche (titre / catégorie) pour peupler
 * le formulaire « Informations du dossier » en mode test UI.
 */
export function findMockServiceSchema(
  title: string,
  categorySlug?: string,
): Pick<Service, 'formFields' | 'requiredDocuments'> {
  const n = normalizeTitle(title)
  const pool = categorySlug
    ? SERVICES.filter(s => s.categorySlug === categorySlug)
    : SERVICES

  const searchIn = pool.length ? pool : SERVICES

  const exact = searchIn.find(s => normalizeTitle(s.title) === n)
  if (exact?.formFields.length) {
    return {
      formFields: exact.formFields,
      requiredDocuments: exact.requiredDocuments,
    }
  }

  const partial = searchIn.find(s => {
    const t = normalizeTitle(s.title)
    return n.includes(t) || t.includes(n)
  })
  if (partial?.formFields.length) {
    return {
      formFields: partial.formFields,
      requiredDocuments: partial.requiredDocuments,
    }
  }

  const byWord = searchIn.find(s => {
    const words = normalizeTitle(s.title).split(' ').filter(w => w.length > 3)
    return words.some(w => n.includes(w))
  })
  if (byWord?.formFields.length) {
    return {
      formFields: byWord.formFields,
      requiredDocuments: byWord.requiredDocuments,
    }
  }

  const any = SERVICES.find(s => s.formFields.length > 0)
  if (any) {
    return {
      formFields: any.formFields,
      requiredDocuments: any.requiredDocuments,
    }
  }

  return {
    formFields: FALLBACK_FORM_FIELDS,
    requiredDocuments: FALLBACK_REQUIRED_DOCS,
  }
}
