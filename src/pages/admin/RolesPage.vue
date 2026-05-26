<template>
  <div class="space-y-6">
    <div class="card p-6">
      <h1 class="font-display font-bold text-2xl text-gray-900">Rôles & accès</h1>
      <p class="text-sm text-gray-500 mt-2">
        Types de comptes définis sur la plateforme (API
        <code class="text-xs bg-gray-100 px-1 rounded">/public/accounts</code>).
        Pour attribuer un rôle à un utilisateur, utilisez la page Utilisateurs.
      </p>
      <RouterLink to="/admin/utilisateurs" class="btn-primary btn-sm mt-4 inline-flex">
        Gérer les utilisateurs
      </RouterLink>
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Chargement des rôles…</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="a in accounts"
        :key="a.id"
        class="card p-5 border-l-4"
        :class="accountBorderClass(a.id)"
      >
        <p class="text-xs text-gray-500 uppercase tracking-wide">{{ a.typeAccount.name }}</p>
        <p class="font-semibold text-gray-900 mt-1 text-lg">{{ a.name }}</p>
        <p class="text-sm text-gray-500 mt-2">{{ accountDescription(a.id) }}</p>
        <p class="text-xs text-gray-400 mt-3">ID compte : {{ a.id }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getPublicAccounts } from '@/api/admin'
import { PUBLIC_ACCOUNT_IDS } from '@/data/publicAccounts'
import type { PublicAccount } from '@/types'

const accounts = ref<PublicAccount[]>([])
const loading = ref(true)

function accountDescription(id: number): string {
  switch (id) {
    case PUBLIC_ACCOUNT_IDS.CITOYEN:
      return 'Espace citoyen : déposer et suivre des demandes. Pas de création de services.'
    case PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE:
      return 'Administration d’une commune : services documentaires et demandes locales.'
    case PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE:
      return 'Administration ministérielle : périmètre sectoriel.'
    case PUBLIC_ACCOUNT_IDS.SUPER_ADMIN:
      return 'Supervision globale : utilisateurs, documents, services, rôles.'
    default:
      return ''
  }
}

function accountBorderClass(id: number): string {
  switch (id) {
    case PUBLIC_ACCOUNT_IDS.SUPER_ADMIN:
      return 'border-l-brand'
    case PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE:
    case PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE:
      return 'border-l-amber-500'
    default:
      return 'border-l-gray-300'
  }
}

onMounted(async () => {
  try {
    accounts.value = await getPublicAccounts()
  } finally {
    loading.value = false
  }
})
</script>
