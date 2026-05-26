import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const routeLoading = ref(false)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    // ─── Public Layout ────────────────────────────────────────────────────
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/HomePage.vue'),
          meta: { title: 'Accueil — Barua' },
        },
        {
          path: 'services',
          name: 'services',
          component: () => import('@/pages/ServicesPage.vue'),
          meta: { title: 'Tous les services — Barua' },
        },
        {
          path: 'services/:categorySlug',
          name: 'service-category',
          component: () => import('@/pages/ServiceCategoryPage.vue'),
          meta: { title: 'Services — Barua' },
        },
        {
          path: 'services/:categorySlug/:serviceId',
          name: 'service-detail',
          component: () => import('@/pages/ServiceDetailPage.vue'),
          meta: { title: 'Détail du service — Barua' },
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('@/pages/SearchPage.vue'),
          meta: { title: 'Recherche — Barua' },
        },
        {
          path: 'annuaire',
          name: 'directory',
          component: () => import('@/pages/DirectoryPage.vue'),
          meta: { title: 'Annuaire — Barua' },
        },
        {
          path: 'faq',
          name: 'faq',
          component: () => import('@/pages/FaqPage.vue'),
          meta: { title: 'FAQ — Barua' },
        },
        {
          path: 'localites',
          name: 'localities',
          component: () => import('@/pages/LocalitiesPage.vue'),
          meta: { title: 'Localités — Barua' },
        },
      ],
    },

    // ─── Auth Layout ──────────────────────────────────────────────────────
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      redirect: '/auth/login',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/auth/LoginPage.vue'),
          meta: { title: 'Connexion — Barua', guest: true },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/auth/RegisterPage.vue'),
          meta: { title: 'Créer un compte — Barua', guest: true },
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
          meta: { title: 'Mot de passe oublié — Barua', guest: true },
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/pages/auth/ResetPasswordPage.vue'),
          meta: { title: 'Réinitialiser le mot de passe — Barua', guest: true },
        },
        {
          path: 'verify-email',
          name: 'verify-email',
          component: () => import('@/pages/auth/VerifyEmailPage.vue'),
          meta: { title: 'Valider le compte — Barua', guest: true },
        },
      ],
    },

    // ─── Dashboard Layout (protected) ────────────────────────────────────
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/dashboard/DashboardHome.vue'),
          meta: { title: 'Mon espace — Barua' },
        },
        {
          path: 'mes-demandes',
          name: 'my-requests',
          component: () => import('@/pages/dashboard/MyRequestsPage.vue'),
          meta: { title: 'Mes demandes — Barua' },
        },
        {
          path: 'documents',
          name: 'my-documents',
          component: () => import('@/pages/dashboard/DocumentsPage.vue'),
          meta: { title: 'Mes documents — Barua' },
        },
        {
          path: 'mes-demandes/:id',
          name: 'request-detail',
          component: () => import('@/pages/dashboard/RequestDetailPage.vue'),
          meta: { title: 'Suivi de demande — Barua' },
        },
        {
          path: 'nouvelle-demande/:serviceId',
          name: 'new-request',
          component: () => import('@/pages/dashboard/NewRequestPage.vue'),
          meta: { title: 'Nouvelle demande — Barua' },
        },
        {
          path: 'profil',
          name: 'profile',
          component: () => import('@/pages/dashboard/ProfilePage.vue'),
          meta: { title: 'Mon profil — Barua' },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/pages/dashboard/NotificationsPage.vue'),
          meta: { title: 'Notifications — Barua' },
        },
      ],
    },

    // ─── Admin Layout (protected) ─────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresRoles: ['commune_admin', 'ministry_admin', 'super_admin'] },
      children: [
        {
          path: '',
          name: 'admin-home',
          component: () => import('@/pages/admin/AdminHome.vue'),
          meta: { title: 'Administration — Barua' },
        },
        {
          path: 'demandes',
          name: 'admin-requests',
          component: () => import('@/pages/admin/AdminRequestsPage.vue'),
          meta: { title: 'Demandes — Barua' },
        },
        {
          path: 'demandes/:id',
          name: 'admin-request-detail',
          component: () => import('@/pages/admin/AdminRequestDetailPage.vue'),
          meta: { title: 'Détail demande — Barua' },
        },
        {
          path: 'documents',
          name: 'admin-documents',
          component: () => import('@/pages/admin/AdminDocumentsPage.vue'),
          meta: { title: 'Documents — Barua' },
        },
        {
          path: 'utilisateurs',
          name: 'admin-users',
          component: () => import('@/pages/admin/AdminUsersPage.vue'),
          meta: { title: 'Utilisateurs — Barua', requiresRoles: ['super_admin'] },
        },
        {
          path: 'documents/creer',
          redirect: { name: 'admin-documents' },
        },
        {
          path: 'organismes',
          name: 'admin-organisms',
          component: () => import('@/pages/admin/AdminOrganismsPage.vue'),
          meta: { title: 'Communes — Barua', requiresRoles: ['super_admin'] },
        },
        {
          path: 'roles',
          name: 'admin-roles',
          component: () => import('@/pages/admin/RolesPage.vue'),
          meta: { title: 'Rôles & permissions — Barua', requiresRoles: ['super_admin'] },
        },
        {
          path: 'profil',
          name: 'admin-profile',
          component: () => import('@/pages/dashboard/ProfilePage.vue'),
          meta: { title: 'Mon profil — Barua' },
        },
        {
          path: 'services-documentaires',
          name: 'admin-service-documentaires',
          component: () => import('@/pages/admin/AdminServiceDocumentairesPage.vue'),
          meta: {
            title: 'Services documentaires — Barua',
            requiresRoles: ['commune_admin', 'ministry_admin', 'super_admin'],
          },
        },
      ],
    },

    // ─── 404 ─────────────────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: { title: 'Page introuvable — Barua' },
    },
  ],
})

// ─── Navigation Guards ────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  routeLoading.value = true
  document.title = (to.meta.title as string) || 'Barua — Services de l\'État'

  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return { path: auth.defaultHomeRoute() }
  }

  const required = (to.meta.requiresRoles as string[] | undefined)
  if (required?.length) {
    const role = auth.user?.role
    if (!role || !required.includes(role)) {
      return { path: auth.defaultHomeRoute() }
    }
  }

  if (to.path.startsWith('/admin') && auth.isCitizen) {
    return { path: '/dashboard' }
  }
})

router.afterEach(() => {
  // small delay avoids flash on fast routes
  window.setTimeout(() => (routeLoading.value = false), 150)
})

export default router
