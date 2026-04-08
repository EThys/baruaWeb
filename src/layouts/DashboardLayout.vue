<template>
  <div class="min-h-screen flex bg-surface-muted">
    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out',
      'bg-sidebar-gradient text-white shadow-2xl',
      sidebarOpen ? 'w-64' : 'w-20',
      // mobile off-canvas
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0 lg:relative lg:flex'
    ]">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <div class="h-9 w-9 rounded-xl bg-white/95 flex items-center justify-center p-1 ring-1 ring-white/25 shrink-0">
          <img :src="logoBarua" alt="Barua" width="32" height="32" class="h-8 w-8 object-contain" />
        </div>
        <span v-if="sidebarOpen" class="font-display font-bold text-white text-lg tracking-wide transition-opacity duration-200">BARUA</span>
      </div>

      <!-- Navigation links -->
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
          <!-- Notification dot -->
          <span v-if="link.badge && sidebarOpen" class="ml-auto badge bg-red-500 text-white text-[10px] px-1.5 py-0.5">
            {{ link.badge }}
          </span>
        </RouterLink>
      </nav>

      <!-- Bottom: profile + logout -->
      <div class="border-t border-white/10 p-3 space-y-1 shrink-0">
        <RouterLink to="/dashboard/profil" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition-all text-sm font-medium">
          <UserCircle :size="19" class="shrink-0" />
          <span v-if="sidebarOpen">Mon profil</span>
        </RouterLink>
        <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium">
          <LogOut :size="19" class="shrink-0" />
          <span v-if="sidebarOpen">Déconnexion</span>
        </button>
      </div>

      <!-- Toggle button -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="absolute -right-3 top-20 w-6 h-6 bg-brand rounded-full flex items-center justify-center shadow-lg hover:bg-brand-dark transition-colors"
      >
        <ChevronRight :size="12" class="text-white transition-transform duration-300" :class="sidebarOpen ? 'rotate-180' : ''" />
      </button>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="mobileSidebarOpen" @click="mobileSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm">
    </div>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6">
          <!-- Page title with breadcrumb -->
          <div>
            <h1 class="text-lg font-display font-bold text-brand">{{ pageTitle }}</h1>
            <p class="text-xs text-gray-400 -mt-0.5">{{ pageSub }}</p>
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-3">
            <!-- Mobile menu button -->
            <button
              class="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
              @click="mobileSidebarOpen = true"
              aria-label="Ouvrir le menu"
            >
              <Menu :size="20" />
            </button>

            <!-- Search shortcut -->
            <RouterLink to="/search"
              class="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 hover:border-gray-300 transition-colors w-52">
              <Search :size="15" />
              <span>Rechercher un service…</span>
            </RouterLink>

            <!-- Notifications -->
            <RouterLink to="/dashboard/notifications" class="relative p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-brand">
              <Bell :size="20" />
              <span v-if="ui.unreadCount" class="notif-dot">{{ ui.unreadCount }}</span>
            </RouterLink>

            <!-- User avatar -->
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-full bg-hero-gradient flex items-center justify-center text-white text-sm font-bold shadow">
                {{ auth.initials }}
              </div>
              <div class="hidden sm:block leading-tight">
                <p class="text-sm font-semibold text-gray-800">{{ auth.fullName }}</p>
                <p class="text-xs text-gray-400">{{ auth.user?.role === 'citizen' ? 'Citoyen' : auth.user?.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- Toast Stack -->
    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  Bell, ChevronRight, FileText, Home, LogOut,
  Search, UserCircle, Plus, Menu
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useRequestsStore } from '@/stores/requests'
import ToastStack from '@/components/ui/ToastStack.vue'
import logoBarua from '@/assets/logoBarua.png'

const auth     = useAuthStore()
const ui       = useUIStore()
const requests = useRequestsStore()
const route    = useRoute()
const router   = useRouter()

const sidebarOpen       = ref(true)
const mobileSidebarOpen = ref(false)

const navLinks = computed(() => [
  { to: '/dashboard',                  label: 'Tableau de bord', icon: Home,     badge: null },
  { to: '/dashboard/documents',        label: 'Mes documents',   icon: FileText, badge: null },
  { to: '/dashboard/mes-demandes',     label: 'Mes demandes',    icon: FileText, badge: requests.activeRequests.length || null },
  { to: '/dashboard/notifications',    label: 'Notifications',   icon: Bell,     badge: ui.unreadCount || null },
  { to: '/services',                   label: 'Nouveau service',  icon: Plus,     badge: null },
])

const routeTitles: Record<string, { title: string; sub: string }> = {
  'dashboard':    { title: 'Tableau de bord', sub: 'Vue d\'ensemble de vos démarches' },
  'my-requests':  { title: 'Mes demandes',    sub: 'Suivez l\'avancement de vos dossiers' },
  'request-detail':{ title: 'Détail demande', sub: 'Informations et historique' },
  'new-request':  { title: 'Nouvelle demande',sub: 'Remplissez le formulaire de demande' },
  'profile':      { title: 'Mon profil',      sub: 'Gérez vos informations personnelles' },
  'notifications':{ title: 'Notifications',   sub: 'Vos alertes et messages' },
}

const pageTitle = computed(() => routeTitles[route.name as string]?.title ?? 'Espace citoyen')
const pageSub   = computed(() => routeTitles[route.name as string]?.sub ?? '')

function isActive(to: string) {
  if (to === '/dashboard') return route.path === '/dashboard'
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
