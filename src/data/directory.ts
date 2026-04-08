/**
 * Annuaire institutionnel RDC — ministères et organismes utiles à une plateforme
 * de services publics (coordonnées publiées sur les sites officiels ; à vérifier en cas de changement).
 */
export type DirectoryCategory = 'ministere' | 'organisme'

export interface DirectoryEntry {
  id: string
  category: DirectoryCategory
  /** Nom complet */
  name: string
  /** Sigle ou acronyme affiché sur la carte */
  sigle?: string
  description: string
  /** Téléphone ou ligne verte (format affichage ; le lien tel: est dérivé) */
  phone?: string
  /** URL du site officiel */
  website: string
}

export const directoryEntries: DirectoryEntry[] = [
  // ─── Ministères (RDC) ─────────────────────────────────────────────────────
  {
    id: 'primature',
    category: 'ministere',
    name: 'Primature — Secrétariat général du Gouvernement',
    sigle: 'Primature',
    description:
      'Coordination des politiques publiques, suivi des réformes et liaison entre les ministères.',
    phone: '+243 81 555 56 67',
    website: 'https://www.primature.gouv.cd',
  },
  {
    id: 'mi',
    category: 'ministere',
    name: "Ministère de l'Intérieur, Sécurité, Décentralisation et Affaires coutumières",
    sigle: 'MI',
    description:
      'État civil, sécurité intérieure, décentralisation, affaires coutumières et migrations (tutelle DGM).',
    website: 'https://mic.gov.cd',
  },
  {
    id: 'sante',
    category: 'ministere',
    name: 'Ministère de la Santé Publique, Hygiène et Prévoyance sociale',
    sigle: 'MSP',
    description:
      'Politique sanitaire, régulation des établissements, ligne verte citoyenne pour questions de santé.',
    phone: '151 (ligne verte, appel gratuit)',
    website: 'https://sante.gouv.cd',
  },
  {
    id: 'epst',
    category: 'ministere',
    name: "Ministère de l'Enseignement Primaire, Secondaire et Technique",
    sigle: 'EPST',
    description: 'Scolarité, examens d’État, équivalences et enseignement technique.',
    phone: '+243 840 018 006',
    website: 'https://minepst.gouv.cd',
  },
  {
    id: 'esu',
    category: 'ministere',
    name: "Ministère de l'Enseignement Supérieur et Universitaire",
    sigle: 'ESU',
    description: 'Universités, diplômes supérieurs, recherche et innovation dans l’enseignement supérieur.',
    website: 'https://www.esu.gouv.cd',
  },
  {
    id: 'justice',
    category: 'ministere',
    name: 'Ministère de la Justice',
    sigle: 'Justice',
    description: 'Ordre judiciaire, casier judiciaire, légalisations et accès à la justice.',
    website: 'https://www.justice.gouv.cd',
  },
  {
    id: 'finances',
    category: 'ministere',
    name: 'Ministère des Finances',
    sigle: 'MinFin',
    description: 'Budget de l’État, dette publique, trésorerie et politique fiscale (tutelle DGI).',
    website: 'https://www.minfin.cd',
  },
  {
    id: 'economie',
    category: 'ministere',
    name: "Ministère de l'Économie nationale",
    sigle: 'Minecon',
    description: 'Politique économique, commerce, concurrence et développement du secteur privé.',
    website: 'https://www.minecon.cd',
  },
  {
    id: 'numerique',
    category: 'ministere',
    name: 'Ministère du Numérique et de la Nouvelle Technologie',
    sigle: 'MinNum',
    description: 'Transformation numérique de l’État, gouvernement électronique et économie numérique.',
    website: 'https://www.minnum.gov.cd',
  },
  {
    id: 'mfptps',
    category: 'ministere',
    name: 'Ministère de la Fonction Publique, Travail et Prévoyance sociale',
    sigle: 'MFPTPS',
    description: 'Emploi public, droit du travail, sécurité sociale et prévoyance (lien avec la CNSS).',
    website: 'https://www.mfptps.gouv.cd',
  },
  {
    id: 'agriculture',
    category: 'ministere',
    name: "Ministère de l'Agriculture",
    sigle: 'MinAgri',
    description: 'Politique agricole, filières, sécurité alimentaire et développement rural.',
    website: 'https://www.agriculture.gouv.cd',
  },
  {
    id: 'urbanisme',
    category: 'ministere',
    name: "Ministère de l'Urbanisme et Habitat",
    sigle: 'MUH',
    description: 'Urbanisme, habitat, aménagement du territoire et cadastre.',
    website: 'https://www.urbanisme.gouv.cd',
  },

  // ─── Organismes & offices (plateforme services / fiscalité / sécu / régulation) ─
  {
    id: 'dgi',
    category: 'organisme',
    name: 'Direction Générale des Impôts',
    sigle: 'DGI',
    description: 'Recouvrement des impôts, taxes, déclarations et services fiscaux en ligne.',
    website: 'https://www.dgi.gouv.cd',
  },
  {
    id: 'cnss',
    category: 'organisme',
    name: 'Caisse Nationale de Sécurité Sociale',
    sigle: 'CNSS',
    description: 'Cotisations sociales, prestations famille et vieillesse pour le secteur privé et assimilés.',
    phone: '+243 996 030 210',
    website: 'https://www.cnss.cd',
  },
  {
    id: 'dgm',
    category: 'organisme',
    name: 'Direction Générale de Migration',
    sigle: 'DGM',
    description: 'Visas, titres de séjour, contrôle des frontières et police des étrangers.',
    phone: '+243 810 300 755',
    website: 'https://dgm.cd',
  },
  {
    id: 'arptc',
    category: 'organisme',
    name: 'Autorité de Régulation de la Poste et des Télécommunications',
    sigle: 'ARPTC',
    description: 'Régulation poste & télécoms, numéros, fréquences et médiation consommateurs.',
    phone: '+243 810 385 910 — call center 155',
    website: 'https://www.arptc.gouv.cd',
  },
  {
    id: 'bcc',
    category: 'organisme',
    name: 'Banque Centrale du Congo',
    sigle: 'BCC',
    description: 'Politique monétaire, taux de change, régulation bancaire et sécurité du franc congolais.',
    website: 'https://www.bcc.cd',
  },
  {
    id: 'dgda',
    category: 'organisme',
    name: 'Direction Générale des Douanes et Accises',
    sigle: 'DGDA',
    description: 'Douanes, accises, transit et lutte contre la fraude à la frontière.',
    website: 'https://www.dgda.cd',
  },
  {
    id: 'arsp',
    category: 'organisme',
    name: 'Autorité de Régulation des Services Publics',
    sigle: 'ARSP',
    description: 'Qualité et tarifs des services publics (eau, électricité, transports, etc.).',
    website: 'https://www.arsp.cd',
  },
  {
    id: 'regideso',
    category: 'organisme',
    name: 'Régie de distribution d’eau',
    sigle: 'REGIDESO',
    description: 'Production et distribution d’eau potable sur le réseau national.',
    website: 'https://www.regideso.cd',
  },
  {
    id: 'snel',
    category: 'organisme',
    name: 'Société nationale d’électricité',
    sigle: 'SNEL',
    description: 'Production, transport et distribution de l’électricité.',
    website: 'https://www.snel.cd',
  },
  {
    id: 'ogefrem',
    category: 'organisme',
    name: 'Office des transports du fleuve Congo',
    sigle: 'OGEFREM',
    description: 'Navigation fluviale, ports et transport multimodal sur le réseau congolais.',
    website: 'https://www.ogefrem.cd',
  },
]

export function directoryByCategory(cat: DirectoryCategory) {
  return directoryEntries.filter(e => e.category === cat)
}
