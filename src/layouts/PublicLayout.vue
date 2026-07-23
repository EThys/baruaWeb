<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Announcement Banner -->
    <div v-if="showBanner" class="bg-yellow-400 text-yellow-900 text-center text-xs sm:text-sm py-2 px-4 relative font-semibold">
      Pré-enregistrez-vous dès maintenant pour la <span class="font-extrabold">Carte d’Identité Nationale</span> et facilitez l’obtention de vos documents officiels en cliquant <a href="#" class="underline ml-1">ICI</a>.
      <button @click="showBanner = false" class="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-800 hover:text-yellow-900">
        <X :size="16" />
      </button>
    </div>

    <!-- Top bar (tabs + quick links) -->
    <div class="bg-white border-b border-gray-200">
      <div class="page-container h-11 flex items-center justify-between gap-4 text-sm">
        <div class="hidden md:flex items-center gap-2">
          <button
            v-for="tab in navTabs"
            :key="tab.id"
            :class="[
              'px-3 py-1.5 rounded-md font-semibold transition-colors',
              activeTab === tab.id ? 'bg-brand/10 text-brand' : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="ml-auto flex items-center gap-4 text-gray-600">
          <RouterLink to="/annuaire" class="hover:text-brand transition-colors hidden sm:inline-flex">Annuaire de l'administration</RouterLink>
          <RouterLink to="/faq" class="hover:text-brand transition-colors">FAQ</RouterLink>
        </div>
      </div>
    </div>

    <!-- Main Navigation (merged with hero look) -->
    <nav class="bg-hero-gradient border-b border-white/10 sticky top-0 z-50">
      <div class="absolute inset-0 jacquard-nav opacity-15 pointer-events-none"></div>
      <div class="page-container relative">
        <div class="flex items-center h-16 gap-3">
          <!-- Left: Mobile menu + Logo -->
          <button
            @click="toggleSideMenu"
            class="lg:hidden group inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-white"
            aria-label="Ouvrir le menu"
          >
            <Menu v-if="!ui.isMobileMenuOpen" :size="20" />
            <X v-else :size="20" />
            <span class="inline text-sm font-semibold tracking-wide text-white/90">MENU</span>
          </button>

          <RouterLink
            to="/"
            class="flex items-center gap-2.5 sm:gap-3 shrink-0 rounded-lg -ml-0.5 pl-0.5 pr-1 py-0.5 transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <img
              :src="logoBarua"
              alt=""
              width="160"
              height="52"
              class="h-11 w-auto sm:h-12 sm:max-h-[3.25rem] max-h-12 object-contain object-left select-none drop-shadow-[0_1px_10px_rgba(0,0,0,0.18)]"
            />
            <span class="font-display font-bold text-white text-lg sm:text-xl tracking-wide hidden sm:inline leading-none">
              BARUA
            </span>
          </RouterLink>

          <!-- Center: Primary links (desktop) -->
          <div class="hidden lg:flex items-center gap-1 ml-4">
            <RouterLink
              v-for="item in primaryLinks"
              :key="item.to"
              :to="item.to"
              :class="[
                'navlink px-3 py-2 rounded-xl text-sm font-semibold transition-colors',
                isActive(item.to) ? 'navlink--active text-white' : 'text-blue-100/90 hover:text-white'
              ]"
            >
              {{ item.label }}
            </RouterLink>
          </div>

          <!-- Search (desktop) -->
          <div class="hidden lg:flex flex-1 justify-center px-4">
            <div class="w-full max-w-md relative">
              <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
              <input
                v-model="navQuery"
                @keyup.enter="submitNavSearch"
                type="text"
                placeholder="Rechercher un service…"
                class="w-full pl-11 pr-12 py-2.5 rounded-xl border border-white/15 bg-white/10 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="button"
                @click="submitNavSearch"
                class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                aria-label="Rechercher"
              >
                OK
              </button>
            </div>
          </div>

          <!-- Right: Actions (mobile : groupé à droite avec léger retrait) -->
          <div class="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0 ml-auto lg:ml-0 pr-2 sm:pr-0">

            <!-- Notifications (authenticated) -->
            <RouterLink
              v-if="auth.isAuthenticated"
              to="/dashboard/notifications"
              class="relative p-2 text-brand/70 hover:text-brand hover:bg-brand/10 rounded-xl transition-all duration-200"
            >
              <Bell :size="20" />
              <span v-if="ui.unreadCount > 0" class="notif-dot">{{ ui.unreadCount }}</span>
            </RouterLink>

            <!-- Auth : icônes seules sur mobile, texte à partir de sm -->
            <template v-if="!auth.isAuthenticated">
              <RouterLink
                to="/auth/register"
                class="inline-flex items-center justify-center rounded-lg border border-white/40 p-1.5 text-white transition-colors hover:bg-white/10 sm:hidden"
                aria-label="Créer un compte"
              >
                <UserPlus :size="18" stroke-width="2" />
              </RouterLink>
              <RouterLink
                to="/auth/login"
                class="inline-flex items-center justify-center rounded-lg bg-emerald-600 p-1.5 text-white shadow-md transition-colors hover:bg-emerald-500 sm:hidden"
                aria-label="Se connecter"
              >
                <LogIn :size="18" stroke-width="2" />
              </RouterLink>
              <RouterLink
                to="/auth/register"
                class="hidden rounded-xl border border-white/35 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
              >
                Créer un compte
              </RouterLink>
              <RouterLink
                to="/auth/login"
                class="hidden items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-500 sm:inline-flex"
              >
                Se connecter
              </RouterLink>
            </template>

            <!-- User menu (authenticated) -->
            <div v-else class="relative" ref="userMenuRef">
              <button
                type="button"
                @click="toggleUserMenu"
                class="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-brand/5 transition-all duration-200"
              >
                <div
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-brand font-bold shadow-sm text-[10px] sm:text-xs leading-none"
                >
                  {{ auth.initials }}
                </div>
                <ChevronDown
                  :size="12"
                  class="text-brand/70 transition-transform shrink-0"
                  stroke-width="2"
                  :class="{ 'rotate-180': userMenuOpen }"
                />
              </button>
              <!-- Dropdown -->
              <Transition name="dropdown">
                <div v-if="userMenuOpen" class="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl py-1 z-50 border border-brand-dark/10">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ auth.fullName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ auth.user?.email }}</p>
                  </div>
                  <div class="py-1">
                    <RouterLink to="/dashboard" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-brand transition-colors" @click="userMenuOpen = false">
                      <LayoutDashboard :size="15" /> Mon espace
                    </RouterLink>
                    <RouterLink to="/dashboard/mes-demandes" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-brand transition-colors" @click="userMenuOpen = false">
                      <FileText :size="15" /> Mes demandes
                    </RouterLink>
                    <RouterLink to="/dashboard/profil" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-brand transition-colors" @click="userMenuOpen = false">
                      <UserCircle :size="15" /> Mon profil
                    </RouterLink>
                    <RouterLink
                      v-if="auth.isStaff"
                      to="/admin"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-brand transition-colors"
                      @click="userMenuOpen = false"
                    >
                      <LayoutDashboard :size="15" /> Administration
                    </RouterLink>
                  </div>
                  <div class="border-t border-gray-100 mt-1 pt-1 pb-1">
                    <button @click="handleLogout" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut :size="15" /> Déconnexion
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

          </div>
        </div>
      </div>

      <!-- Menu mobile : backdrop et panneau séparés (transition = glissement seul, fond opaque lisible) -->
      <div
        v-if="ui.isMobileMenuOpen"
        class="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-[2px] lg:hidden"
        aria-hidden="true"
        @click="ui.closeMobileMenu()"
      />
      <Transition name="slide-panel">
        <div
          v-if="ui.isMobileMenuOpen"
          class="fixed left-0 top-0 z-[61] flex h-full w-[min(22rem,90vw)] flex-col border-r border-gray-200 bg-white shadow-2xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
            <div class="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-4">
              <RouterLink
                to="/"
                class="flex min-w-0 items-center gap-2.5 rounded-lg py-0.5 pl-0.5 pr-1 -ml-0.5 text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                @click="ui.closeMobileMenu()"
              >
                <img
                  :src="logoBarua"
                  alt=""
                  width="160"
                  height="52"
                  class="h-11 w-auto max-h-12 shrink-0 object-contain object-left"
                />
                <span class="font-display truncate text-base font-bold tracking-wide text-brand">BARUA</span>
              </RouterLink>
              <button
                type="button"
                class="rounded-xl p-2 text-gray-800 transition-colors hover:bg-gray-100"
                aria-label="Fermer le menu"
                @click="ui.closeMobileMenu()"
              >
                <X :size="20" />
              </button>
            </div>

            <div class="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white p-4 text-gray-900">
              <!-- Search (mobile) -->
              <div class="mb-4">
                <div class="relative">
                  <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="navQuery"
                    @keyup.enter="submitNavSearchAndClose"
                    type="text"
                    placeholder="Rechercher un service…"
                    class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>

              <div class="block">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700">Rubriques</div>
                <div class="mb-3 flex flex-wrap gap-2">
                  <button
                    v-for="tab in navTabs"
                    :key="tab.id"
                    type="button"
                    :class="[
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-brand/15 text-brand'
                        : 'bg-gray-50 text-gray-800 hover:bg-brand/10 hover:text-brand',
                    ]"
                    @click="activeTab = tab.id"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </div>

              <div class="space-y-1">
                <RouterLink
                  v-for="item in primaryLinks"
                  :key="item.to"
                  :to="item.to"
                  :class="[
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive(item.to)
                      ? 'bg-brand/12 text-brand'
                      : 'text-gray-900 hover:bg-gray-100',
                  ]"
                  @click="ui.closeMobileMenu()"
                >
                  <component :is="item.icon" :size="18" class="shrink-0 text-brand" />
                  {{ item.label }}
                </RouterLink>

                <div class="mt-2 border-t border-gray-200 pt-3">
                  <template v-if="auth.isAuthenticated">
                    <RouterLink
                      to="/dashboard"
                      class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                      @click="ui.closeMobileMenu()"
                    >
                      <LayoutDashboard :size="18" class="shrink-0 text-brand" /> Mon espace
                    </RouterLink>
                    <RouterLink
                      to="/dashboard/mes-demandes"
                      class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                      @click="ui.closeMobileMenu()"
                    >
                      <FileText :size="18" class="shrink-0 text-brand" /> Mes demandes
                    </RouterLink>
                    <RouterLink
                      to="/dashboard/profil"
                      class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                      @click="ui.closeMobileMenu()"
                    >
                      <UserCircle :size="18" class="shrink-0 text-brand" /> Mon profil
                    </RouterLink>

                    <button
                      type="button"
                      class="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      @click="handleLogout"
                    >
                      <LogOut :size="18" class="shrink-0" /> Déconnexion
                    </button>
                  </template>

                  <template v-else>
                    <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700">Compte</p>
                    <div class="flex gap-2">
                      <RouterLink
                        to="/auth/login"
                        class="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 p-3 text-white shadow-md transition-colors hover:bg-emerald-500"
                        aria-label="Se connecter"
                        @click="ui.closeMobileMenu()"
                      >
                        <LogIn :size="22" stroke-width="2" />
                      </RouterLink>
                      <RouterLink
                        to="/auth/register"
                        class="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-brand bg-white p-3 text-brand shadow-sm transition-colors hover:bg-brand/5"
                        aria-label="Créer un compte"
                        @click="ui.closeMobileMenu()"
                      >
                        <UserPlus :size="22" stroke-width="2" />
                      </RouterLink>
                    </div>
                  </template>
                </div>
              </div>
            </div>
        </div>
      </Transition>
    </nav>

    <!-- Main content -->
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- Footer -->
    <footer class="mt-16 border-t border-gray-200 bg-white relative overflow-hidden">
      <div class="absolute inset-0 jacquard-bg opacity-[0.04] pointer-events-none"></div>
      <div class="page-container py-12 relative">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="sm:col-span-2 lg:col-span-1">
            <RouterLink
              to="/"
              class="inline-flex items-center gap-2.5 mb-3 w-fit rounded-lg py-0.5 -ml-0.5 pl-0.5 pr-1 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
            >
              <img
                :src="logoBarua"
                alt=""
                width="160"
                height="52"
                class="h-11 w-auto sm:h-12 object-contain"
              />
              <span class="font-display font-bold text-lg text-brand">BARUA</span>
            </RouterLink>
            <p class="text-sm text-gray-600 leading-relaxed">
              Plateforme nationale des services publics. Simple, rapide, sécurisé.
            </p>
            <div class="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                Données sécurisées
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                Disponibilité 24/7
              </span>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-sm mb-3 text-gray-900">Services</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><RouterLink to="/services" class="hover:text-brand transition-colors">Tous les services</RouterLink></li>
              <li><RouterLink to="/services/etat-civil" class="hover:text-brand transition-colors">État Civil</RouterLink></li>
              <li><RouterLink to="/services/education" class="hover:text-brand transition-colors">Éducation</RouterLink></li>
              <li><RouterLink to="/services/justice" class="hover:text-brand transition-colors">Justice</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-sm mb-3 text-gray-900">Aide</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><RouterLink to="/faq" class="hover:text-brand transition-colors">FAQ</RouterLink></li>
              <li><RouterLink to="/annuaire" class="hover:text-brand transition-colors">Annuaire Admin.</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-sm mb-3 text-gray-900">Légal</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>
                <RouterLink to="/confidentialite" class="hover:text-brand transition-colors">
                  Confidentialité
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {{ new Date().getFullYear() }} BARUA. Gouvernement de la République. Tous droits réservés.</p>
          <p>Hébergement national. Support institutionnel</p>
        </div>
      </div>
    </footer>

    <!-- Toast Container -->
    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import {
  Bell, ChevronDown, FileText, Landmark, LayoutDashboard,
  LogIn, LogOut, Menu, Search, UserCircle, UserPlus, X
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { usePublicDocumentsStore } from '@/stores/publicDocuments'
import { useServicesStore } from '@/stores/services'
import ToastStack from '@/components/ui/ToastStack.vue'
import logoBarua from '@/assets/logoBarua.png'

const auth = useAuthStore()
const ui   = useUIStore()
const publicDocs = usePublicDocumentsStore()
const servicesStore = useServicesStore()
const router = useRouter()
const route = useRoute()

const showBanner  = ref(true)
const userMenuOpen = ref(false)
const userMenuRef  = ref<HTMLElement | null>(null)
const activeTab    = ref('citizens')

const navTabs = [
  { id: 'citizens',     label: 'Citoyens' },
  { id: 'enterprises', label: 'Entreprises / Associations / Professions libérales' },
]

const primaryLinks = [
  { to: '/',         label: 'Accueil',   icon: Landmark },
  { to: '/services', label: 'Services',  icon: FileText },
  { to: '/annuaire', label: 'Annuaire',  icon: UserCircle },
  { to: '/faq',      label: 'FAQ',       icon: FileText },
]

const navQuery = ref('')

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

function submitNavSearch() {
  const q = navQuery.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
}

function submitNavSearchAndClose() {
  submitNavSearch()
  ui.closeMobileMenu()
}

function toggleSideMenu() {
  userMenuOpen.value = false
  ui.toggleMobileMenu()
}

function toggleUserMenu() {
  // Keep menus mutually exclusive
  ui.closeMobileMenu()
  userMenuOpen.value = !userMenuOpen.value
}

function handleClickOutside(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

async function handleLogout() {
  userMenuOpen.value = false
  auth.logout()
  ui.toast.success('Déconnexion réussie', 'À bientôt !')
  router.push('/')
}

onMounted(() => {
  // Pré-chargement pour éviter un "flash" de contenu vide sur la Home.
  publicDocs.fetchDocumentTypes()
  servicesStore.fetchServicesFromPublicDocuments()

  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }
/* Panneau menu mobile : glissement sans fade (évite transparence globale) */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(-100%);
}
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
/* Entrée : pas d’opacity sur le parent — sinon les v-reveal (opacity enfants) restent invisibles.
   Sortie : fade léger sur l’ancienne page. */
.fade-enter-active {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-enter-from,
.fade-enter-to {
  opacity: 1;
}
.fade-enter-from {
  transform: translateY(14px);
}
.fade-enter-to {
  transform: translateY(0);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.navlink { position: relative; }
.navlink::after {
  content: '';
  position: absolute;
  left: 0.75rem;   /* matches px-3 */
  right: 0.75rem;  /* matches px-3 */
  bottom: -2px;
  height: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 200ms ease;
}
.navlink:hover::after { transform: scaleX(1); }
.navlink--active::after { transform: scaleX(1); }
</style>
