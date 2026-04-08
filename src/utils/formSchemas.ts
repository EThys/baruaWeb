import { z } from 'zod'
import type { FormFieldConfig } from '@/types'

/** Étape 1 — coordonnées du demandeur */
export const identityStepSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet doit contenir au moins 2 caractères'),
  nationalId: z.string().min(2, 'Le numéro d’identité est obligatoire'),
  email: z.string().min(1, 'L’e-mail est obligatoire').email('Adresse e-mail invalide'),
  phone: z.string().refine(
    v => !v || String(v).trim() === '' || /^[\d\s+().-]{8,}$/.test(String(v).trim()),
    { message: 'Numéro de téléphone invalide' },
  ),
})

export type IdentityStepValues = z.infer<typeof identityStepSchema>

function fieldSchema(f: FormFieldConfig): z.ZodTypeAny {
  const label = f.label

  if (f.type === 'file') {
    return z.any().optional()
  }

  if (f.type === 'radio' || f.type === 'select') {
    const opts = f.options?.map(o => o.value).filter(Boolean) ?? []
    if (opts.length === 0) return z.string().optional()
    if (opts.length === 1) {
      const only = opts[0]
      if (!f.required) return z.union([z.literal(only), z.literal('')])
      return z.literal(only)
    }
    const tuple = [opts[0], ...opts.slice(1)] as [string, ...string[]]
    const enumSchema = z.enum(tuple, { errorMap: () => ({ message: `Veuillez choisir : ${label}` }) })
    if (!f.required) return z.union([enumSchema, z.literal('')])
    return enumSchema
  }

  if (f.type === 'number') {
    if (!f.required) {
      return z.preprocess(
        v => (v === '' || v === undefined || v === null ? undefined : v),
        z.coerce.number({ invalid_type_error: `${label} doit être un nombre` }).optional(),
      )
    }
    let n = z.coerce.number({ invalid_type_error: `${label} doit être un nombre` })
    if (f.min !== undefined && f.min !== '') n = n.min(Number(f.min), `Minimum ${f.min}`)
    if (f.max !== undefined && f.max !== '') n = n.max(Number(f.max), `Maximum ${f.max}`)
    return n
  }

  if (f.type === 'date') {
    const base = z.string()
    return f.required
      ? base.min(1, `${label} est obligatoire`)
      : base.optional()
  }

  if (f.type === 'checkbox') {
    return z.boolean().optional()
  }

  if (f.type === 'email') {
    const req = z.string().min(1, `${label} est obligatoire`).email('E-mail invalide')
    const opt = z.union([z.string().email('E-mail invalide'), z.literal('')])
    return f.required ? req : opt.optional()
  }

  if (f.type === 'tel') {
    const tel = z
      .string()
      .min(1, `${label} est obligatoire`)
      .regex(/^[\d\s+().-]{8,}$/, 'Numéro invalide')
    const optTel = z.union([z.string().regex(/^[\d\s+().-]{8,}$/, 'Numéro invalide'), z.literal('')])
    return f.required ? tel : optTel.optional()
  }

  // text, textarea
  let s = z.string()
  if (f.validation?.minLength) s = s.min(f.validation.minLength, `Minimum ${f.validation.minLength} caractères`)
  if (f.validation?.maxLength) s = s.max(f.validation.maxLength, `Maximum ${f.validation.maxLength} caractères`)
  if (f.validation?.pattern) {
    s = s.regex(new RegExp(f.validation.pattern), f.validation.message || 'Format invalide')
  }
  if (f.required) return s.min(1, `${label} est obligatoire`)
  return s.optional()
}

/** Étape 2 — champs dynamiques du service */
export function buildServiceFormSchema(fields: FormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of fields) {
    shape[f.name] = fieldSchema(f)
  }
  return z.object(shape)
}
