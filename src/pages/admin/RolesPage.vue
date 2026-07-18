<template>
  <div class="roles-page space-y-6">
    <header class="roles-hero">
      <div class="roles-hero__glow" aria-hidden="true" />
      <div class="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand/80">
            Administration
          </p>
          <h1 class="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
            Rôles & accès
          </h1>
          <p class="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            Types de comptes de la plateforme. L’attribution des rôles, la certification et
            la création de comptes se gèrent depuis Utilisateurs.
          </p>
        </div>
        <RouterLink to="/admin/utilisateurs" class="btn-primary btn-sm shrink-0">
          Gérer les utilisateurs
        </RouterLink>
      </div>
    </header>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4" role="status" aria-label="Chargement">
      <div v-for="i in 4" :key="i" class="sheet p-5 space-y-3">
        <Shimmer width="35%" height="0.625rem" />
        <Shimmer width="55%" height="1.25rem" />
        <Shimmer width="90%" height="0.75rem" />
      </div>
    </div>

    <div v-else-if="!accounts.length" class="sheet px-6 py-14 text-center">
      <p class="text-slate-600 font-medium">Aucun type de compte disponible.</p>
      <p class="text-sm text-slate-500 mt-1">Réessayez plus tard ou vérifiez la connexion API.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <article
        v-for="a in sortedAccounts"
        :key="a.id"
        class="role-card"
        :class="roleToneClass(a.id)"
      >
        <div class="role-card__accent" aria-hidden="true" />
        <div class="relative min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="sheet-pill" :class="rolePillClass(a.id)">
              {{ a.typeAccount?.name || 'Compte' }}
            </span>
            <span class="text-[11px] font-mono text-slate-400">#{{ a.id }}</span>
          </div>
          <h2 class="font-display font-bold text-lg text-slate-900 mt-2 leading-tight">
            {{ a.name }}
          </h2>
          <p class="text-sm text-slate-500 mt-2 leading-relaxed">
            {{ accountDescription(a.id) }}
          </p>
          <ul class="mt-4 space-y-1.5">
            <li
              v-for="perm in accountPermissions(a.id)"
              :key="perm"
              class="text-xs text-slate-600 pl-3 relative before:absolute before:left-0 before:top-[0.45em] before:h-1 before:w-1 before:rounded-full before:bg-slate-400"
            >
              {{ perm }}
            </li>
          </ul>
        </div>
      </article>
    </div>

    <section class="sheet overflow-hidden">
      <div class="border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
        <h2 class="font-semibold text-slate-900">Attribution des rôles</h2>
        <p class="text-xs text-slate-500">Action disponible sur la fiche utilisateur</p>
      </div>
      <div class="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <p class="text-sm text-slate-600 leading-relaxed max-w-xl">
          Pour assigner un compte (citoyen, admin commune, ministère ou super-admin),
          ouvrez un utilisateur puis utilisez l’action <strong class="font-semibold text-slate-800">Rôle</strong>.
        </p>
        <RouterLink to="/admin/utilisateurs" class="sheet-btn sheet-btn--primary shrink-0">
          Ouvrir Utilisateurs
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getPublicAccounts } from '@/api/admin'
import { PUBLIC_ACCOUNT_IDS } from '@/data/publicAccounts'
import type { PublicAccount } from '@/types'
import Shimmer from '@/components/ui/Shimmer.vue'

const accounts = ref<PublicAccount[]>([])
const loading = ref(true)

const ROLE_ORDER: Record<number, number> = {
  [PUBLIC_ACCOUNT_IDS.CITOYEN]: 1,
  [PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE]: 2,
  [PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE]: 3,
  [PUBLIC_ACCOUNT_IDS.SUPER_ADMIN]: 4,
}

const sortedAccounts = computed(() =>
  [...accounts.value].sort((a, b) => (ROLE_ORDER[a.id] ?? 99) - (ROLE_ORDER[b.id] ?? 99)),
)

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
      return 'Type de compte défini par la plateforme.'
  }
}

function accountPermissions(id: number): string[] {
  switch (id) {
    case PUBLIC_ACCOUNT_IDS.CITOYEN:
      return ['Créer et suivre des demandes', 'Gérer son profil', 'Consulter ses documents']
    case PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE:
      return ['Traiter les demandes locales', 'Gérer les services de la commune', 'Organisme lié requis']
    case PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE:
      return ['Périmètre ministériel', 'Suivi des dossiers sectoriels', 'Organisme lié requis']
    case PUBLIC_ACCOUNT_IDS.SUPER_ADMIN:
      return ['Gestion globale des utilisateurs', 'Documents & services', 'Attribution des rôles']
    default:
      return []
  }
}

function roleToneClass(id: number): string {
  switch (id) {
    case PUBLIC_ACCOUNT_IDS.SUPER_ADMIN:
      return 'role-card--brand'
    case PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE:
      return 'role-card--teal'
    case PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE:
      return 'role-card--amber'
    default:
      return 'role-card--slate'
  }
}

function rolePillClass(id: number): string {
  switch (id) {
    case PUBLIC_ACCOUNT_IDS.SUPER_ADMIN:
      return 'sheet-pill--ok'
    case PUBLIC_ACCOUNT_IDS.ADMIN_COMMUNE:
    case PUBLIC_ACCOUNT_IDS.ADMIN_MINISTERE:
      return 'sheet-pill--warn'
    default:
      return 'sheet-pill--muted'
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

<style scoped>
.roles-hero {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid rgb(226 232 240 / 0.9);
  background:
    linear-gradient(135deg, rgb(248 250 252) 0%, rgb(255 255 255) 48%, rgb(239 246 255 / 0.75) 100%);
  padding: 1.35rem 1.5rem;
  box-shadow: 0 10px 40px -18px rgb(15 23 42 / 0.14);
}

.roles-hero__glow {
  pointer-events: none;
  position: absolute;
  inset: auto -18% -55% auto;
  width: 50%;
  height: 140%;
  background: radial-gradient(circle, rgb(14 165 233 / 0.14), transparent 68%);
}

.role-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.15rem;
  border: 1px solid rgb(226 232 240 / 0.95);
  background: white;
  padding: 1.25rem 1.35rem 1.25rem 1.5rem;
  box-shadow: 0 10px 36px -20px rgb(15 23 42 / 0.16);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}

.role-card:hover {
  border-color: rgb(14 165 233 / 0.28);
  box-shadow: 0 14px 40px -18px rgb(15 23 42 / 0.2);
  transform: translateY(-1px);
}

.role-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgb(148 163 184);
}

.role-card--brand .role-card__accent {
  background: linear-gradient(180deg, #0ea5e9, #0284c7);
}

.role-card--teal .role-card__accent {
  background: linear-gradient(180deg, #14b8a6, #0f766e);
}

.role-card--amber .role-card__accent {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.role-card--slate .role-card__accent {
  background: linear-gradient(180deg, #94a3b8, #64748b);
}
</style>
