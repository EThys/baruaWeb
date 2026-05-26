<template>
  <div class="min-h-screen flex bg-surface-muted">
    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out',
      'bg-sidebar-gradient text-white shadow-2xl',
      sidebarOpen ? 'w-64' : 'w-20',
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0 lg:relative lg:flex'
    ]">
      <RouterLink to="/" class="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0 hover:bg-white/5 transition-colors">
        <div class="h-9 w-9 rounded-xl bg-white/95 flex items-center justify-center p-1 ring-1 ring-white/25 shrink-0">
          <img :src="logoBarua" alt="Barua" width="32" height="32" class="h-8 w-8 object-contain" />
        </div>
        <div v-if="sidebarOpen" class="leading-tight">
          <p class="font-display font-bold text-white text-base tracking-wide">
            {{ auth.isSuperAdmin ? 'Super-admin' : 'Administration' }}
          </p>
          <p class="text-xs text-blue-200 -mt-0.5">Barua</p>
        </div>
      </RouterLink>

      <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :title="!sidebarOpen ? link.label : undefined"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group"
          :class="isActive(link.to)
            ? 'bg-white/20 text-white shadow-glow'
            : 'text-blue-200 hover:bg-white/10 hover:text-white'"
          @click="mobileSidebarOpen = false"
        >
          <component :is="link.icon" :size="19" class="shrink-0" />
          <span v-if="sidebarOpen" class="whitespace-nowrap">{{ link.label }}</span>
        </RouterLink>
      </nav>

      <div class="border-t border-white/10 p-3 space-y-1 shrink-0">
        <RouterLink
          to="/admin/profil"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
        >
          <UserCircle :size="19" class="shrink-0" />
          <span v-if="sidebarOpen">Mon profil</span>
        </RouterLink>
        <RouterLink
          v-if="!auth.isSuperAdmin"
          to="/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
        >
          <LayoutDashboard :size="19" class="shrink-0" />
          <span v-if="sidebarOpen">Espace citoyen</span>
        </RouterLink>
        <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium">
          <LogOut :size="19" class="shrink-0" />
          <span v-if="sidebarOpen">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="mobileSidebarOpen" @click="mobileSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm">
    </div>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6">
          <div>
            <h1 class="text-lg font-display font-bold text-gray-900">{{ pageTitle }}</h1>
            <p class="text-xs text-gray-400 -mt-0.5">{{ pageSub }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              class="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
              @click="mobileSidebarOpen = true"
              aria-label="Ouvrir le menu"
            >
              <Menu :size="20" />
            </button>

            <div class="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500">
              <UserCircle :size="16" class="text-gray-400" />
              <span class="font-medium">{{ auth.fullName }}</span>
              <span class="text-gray-300">•</span>
              <span class="text-xs text-gray-400">{{ roleLabel }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  FileArchive, FilePlus2, FileText, LayoutDashboard, LogOut, Menu, Users, UserCircle, Landmark,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import logoBarua from '@/assets/logoBarua.png'

const auth = useAuthStore()
const ui = useUIStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)

const navLinks = computed(() => {
  if (auth.isSuperAdmin) {
    return [
      { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
      { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
      { to: '/admin/documents', label: 'Documents', icon: FileArchive },
      { to: '/admin/services-documentaires', label: 'Services documentaires', icon: FilePlus2 },
      { to: '/admin/demandes', label: 'Demandes', icon: FileText },
      { to: '/admin/organismes', label: 'Communes', icon: Landmark },
      { to: '/admin/roles', label: 'Rôles & accès', icon: Users },
    ]
  }

  const links = [
    { to: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard },
    { to: '/admin/demandes', label: 'Demandes', icon: FileText },
    { to: '/admin/documents', label: 'Documents', icon: FileArchive },
  ]
  if (auth.canManageServiceDocumentaires) {
    links.splice(1, 0, {
      to: '/admin/services-documentaires',
      label: 'Services documentaires',
      icon: FilePlus2,
    })
  }
  return links
})

const routeTitles: Record<string, { title: string; sub: string }> = {
  'admin-home': { title: 'Administration', sub: 'Pilotage de la plateforme' },
  'admin-users': { title: 'Utilisateurs', sub: 'Liste et attribution des rôles' },
  'admin-organisms': { title: 'Communes', sub: 'Activité par organisme' },
  'admin-requests': { title: 'Demandes', sub: 'Valider, annuler, demander des compléments' },
  'admin-request-detail': { title: 'Détail demande', sub: 'Analyse et décision' },
  'admin-documents': { title: 'Documents', sub: 'Liste du référentiel documentaire' },
  'admin-roles': { title: 'Rôles & accès', sub: 'Types de comptes plateforme' },
  'admin-service-documentaires': {
    title: 'Services documentaires',
    sub: 'Liste et création des offres',
  },
  'admin-profile': { title: 'Mon profil', sub: 'Informations et mot de passe' },
}

const pageTitle = computed(() => routeTitles[route.name as string]?.title ?? 'Administration')
const pageSub = computed(() => routeTitles[route.name as string]?.sub ?? '')
const roleLabel = computed(() => auth.roleLabel)

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

async function handleLogout() {
  auth.logout()
  ui.toast.success('Déconnexion réussie', 'À bientôt !')
  router.push('/')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
