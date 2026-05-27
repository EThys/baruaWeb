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
    phone: '0815555667',
    website: 'https://www.primature.gouv.cd',
  },
  {
    id: 'diplomatie',
    category: 'ministere',
    name: 'Ministère des Affaires étrangères',
    sigle: 'MAE',
    description: 'Relations diplomatiques, visas consulaires et coopération internationale.',
    phone: '+243 838 692 595',
    website: 'https://diplomatie.gouv.cd',
  },
  {
    id: 'mi',
    category: 'ministere',
    name: "Ministère de l'Intérieur, Sécurité, Décentralisation et Affaires coutumières",
    sigle: 'MI',
    description:
      'État civil, sécurité intérieure, décentralisation, affaires coutumières et migrations (tutelle DGM).',
    phone: '+243 838 394 946',
    website: 'https://interieur.gouv.cd',
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
    name: "Ministère de l'Éducation nationale et de la Nouvelle citoyenneté",
    sigle: 'MENNC',
    description:
      'Scolarité, examens d’État, équivalences, enseignement technique et éducation à la citoyenneté.',
    phone: '+243 840 018 006',
    website: 'https://edu-nc.gouv.cd',
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
    phone: '+243 998 281 875',
    website: 'https://economie.gouv.cd',
  },
  {
    id: 'numerique',
    category: 'ministere',
    name: 'Ministère de l’Économie numérique',
    sigle: 'MinNum',
    description: 'Transformation numérique de l’État, gouvernement électronique et économie numérique.',
    phone: '+243 820 112 385',
    website: 'https://economienumerique.gouv.cd',
  },
  {
    id: 'mfptps',
    category: 'ministere',
    name: "Ministère de la Fonction publique, Modernisation de l'administration et Innovation du service public",
    sigle: 'MFP-MAI',
    description:
      'Fonction publique, modernisation administrative, innovation des services publics et réforme de l’État.',
    phone: '+243 85 810 77 74',
    website: 'https://fonctionpublique.gouv.cd',
  },
  {
    id: 'agriculture',
    category: 'ministere',
    name: "Ministère de l'Agriculture",
    sigle: 'MinAgri',
    description: 'Politique agricole, filières, sécurité alimentaire et développement rural.',
    phone: '+243 828 174 932',
    website: 'https://agriculture.gouv.cd',
  },
  {
    id: 'medd-nec',
    category: 'ministere',
    name: "Ministère de l'Environnement, Développement durable et Nouvelle économie du climat",
    sigle: 'MEDD-NEC',
    description:
      'Environnement, biodiversité, forêts, changement climatique et économie verte (RDC, pays solution).',
    phone: '08165000333',
    website: 'https://medd.gouv.cd',
  },

  // ─── Organismes & offices ─────────────────────────────────────────────────
  {
    id: 'dgi',
    category: 'organisme',
    name: 'Direction Générale des Impôts',
    sigle: 'DGI',
    description: 'Recouvrement des impôts, taxes, déclarations et services fiscaux en ligne.',
    phone: '+243 828 135 555',
    website: 'https://dgi.gouv.cd',
  },
  {
    id: 'dgda',
    category: 'organisme',
    name: 'Direction Générale des Douanes et Accises',
    sigle: 'DGDA',
    description: 'Douanes, accises, transit et lutte contre la fraude à la frontière.',
    phone: '+243 818 968 481',
    website: 'https://douane.gouv.cd',
  },
  {
    id: 'cnss',
    category: 'organisme',
    name: 'Caisse Nationale de Sécurité Sociale',
    sigle: 'CNSS',
    description: 'Cotisations sociales, prestations famille et vieillesse pour le secteur privé et assimilés.',
    phone: '+243 996 030 210',
    website: 'https://cnss.cd',
  },
  {
    id: 'dgm',
    category: 'organisme',
    name: 'Direction Générale de Migration',
    sigle: 'DGM',
    description: 'Visas, titres de séjour, contrôle des frontières et police des étrangers.',
    phone: '+243 97 296 3195',
    website: 'https://dgm.cd',
  },
  {
    id: 'ena',
    category: 'organisme',
    name: 'École nationale d’administration',
    sigle: 'ENA',
    description: 'Formation des cadres de l’administration publique congolaise.',
    phone: '+243 832 222 920',
    website: 'https://ena.gouv.cd',
  },
  {
    id: 'adn',
    category: 'organisme',
    name: 'Agence du Développement Numérique',
    sigle: 'ADN',
    description: 'Infrastructures numériques, services digitaux et accompagnement de la transformation numérique.',
    phone: '+243 820 004 488',
    website: 'https://www.adn.cd/fr',
  },
  {
    id: 'sonas',
    category: 'organisme',
    name: 'Société nationale des assurances',
    sigle: 'SONAS',
    description: 'Assurances et couverture sociale dans le secteur public et privé.',
    phone: '+243 81 970 0904',
    website: 'https://www.sonas.cd',
  },
  {
    id: 'arptc',
    category: 'organisme',
    name: 'Autorité de Régulation de la Poste et des Télécommunications',
    sigle: 'ARPTC',
    description: 'Régulation poste & télécoms, numéros, fréquences et médiation consommateurs.',
    phone: '+243 821 918 814',
    website: 'https://www.arptc.gouv.cd',
  },
  {
    id: 'arsp',
    category: 'organisme',
    name: 'Autorité de Régulation des Services Publics',
    sigle: 'ARSP',
    description: 'Qualité et tarifs des services publics (eau, électricité, transports, etc.).',
    phone: '+243 824 940 440',
    website: 'https://arsp.cd',
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
    id: 'regideso',
    category: 'organisme',
    name: 'Régie de distribution d’eau',
    sigle: 'REGIDESO',
    description: 'Production et distribution d’eau potable — ligne d’assistance clientèle.',
    phone: '4020',
    website: 'https://www.regideso.cd',
  },
  {
    id: 'snel',
    category: 'organisme',
    name: 'Société nationale d’électricité',
    sigle: 'SNEL',
    description: 'Production, transport et distribution de l’électricité — centre d’appels.',
    phone: '177',
    website: 'https://www.snel.cd',
  },
]

export function directoryByCategory(cat: DirectoryCategory) {
  return directoryEntries.filter(e => e.category === cat)
}
