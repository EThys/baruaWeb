import type { DocumentRecord } from '@/types'

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-001',
    title: 'Acte de naissance — Copie intégrale',
    ownerUserId: 'demo-1',
    communeId: 'gombe',
    ministry: 'Ministère de l’Administration Territoriale',
    tags: ['etat civil', 'naissance'],
    fileUrl: '/docs/acte-naissance-demo.txt',
    fileName: 'acte-naissance-demo.txt',
    mimeType: 'text/plain',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    downloads: 2,
  },
  {
    id: 'doc-002',
    title: 'Casier judiciaire — Bulletin n°3',
    ownerUserId: 'demo-1',
    communeId: 'limete',
    ministry: 'Ministère de la Justice',
    tags: ['justice', 'casier'],
    fileUrl: '/docs/casier-demo.txt',
    fileName: 'casier-demo.txt',
    mimeType: 'text/plain',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    downloads: 1,
  },
]

