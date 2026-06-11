$commits = @(
  @('deploy/nginx-baruaofficiel.conf', 'fix(deploy): serve SPA for GET on /auth routes'),
  @('vite.config.ts', 'fix(dev): proxy /auth with SPA bypass and CORS headers'),
  @('src/api/endpoints.ts', 'feat(api): add admin, document and password endpoints'),
  @('src/api/publicOtp.ts', 'feat(auth): extend OTP response with optional token'),
  @('src/api/publicServiceDocumentaire.ts', 'feat(api): fetch public services documentaires'),
  @('src/api/serviceDocumentaire.ts', 'feat(api): create private service documentaire'),
  @('src/api/admin.ts', 'feat(api): admin users, documents and document types'),
  @('src/api/authPassword.ts', 'feat(api): change and reset password with newPassword body'),
  @('src/services/api.ts', 'feat(api): skipAuth option and reset 401 handling'),
  @('src/data/devises.ts', 'feat(data): FC and USD devise helpers'),
  @('src/data/publicAccounts.ts', 'feat(data): public account id constants'),
  @('src/models/publicServiceDocumentaire.ts', 'feat(models): public service documentaire types'),
  @('src/models/publicOrganisms.ts', 'chore(models): align public organism types'),
  @('src/types/admin.ts', 'feat(types): admin API DTOs'),
  @('src/types/index.ts', 'feat(types): auth payloads and USD currency on services'),
  @('src/utils/accountRole.ts', 'feat(auth): resolve user role from account profiles'),
  @('src/utils/verificationSession.ts', 'feat(auth): persist pending login credentials in session'),
  @('src/stores/verification.ts', 'feat(auth): keep identifier after OTP for password reset'),
  @('src/stores/auth.ts', 'feat(auth): staff roles, permissions and remove demo login'),
  @('src/stores/services.ts', 'feat(services): map API service documentaires to catalog'),
  @('src/stores/admin.ts', 'feat(admin): super-admin overview store'),
  @('src/components/auth/ChangePasswordForm.vue', 'feat(auth): reusable change password form'),
  @('src/pages/auth/LoginPage.vue', 'fix(auth): remove demo login and improve forgot password link'),
  @('src/pages/auth/ForgotPasswordPage.vue', 'feat(auth): forgot password via OTP email'),
  @('src/pages/auth/ResetPasswordPage.vue', 'feat(auth): reset password page after OTP validation'),
  @('src/pages/auth/RegisterPage.vue', 'feat(auth): store credentials for post-verification login'),
  @('src/pages/auth/VerifyEmailPage.vue', 'feat(auth): auto-login after email verification'),
  @('src/pages/dashboard/ProfilePage.vue', 'feat(profile): integrate change password form'),
  @('src/pages/dashboard/DashboardHome.vue', 'chore(dashboard): dashboard home updates'),
  @('src/pages/HomePage.vue', 'fix(home): reactive popular services and commune sections'),
  @('src/pages/ServicesPage.vue', 'fix(services): single grid, filters and loading state'),
  @('src/pages/admin/AdminHome.vue', 'feat(admin): route super-admin to dedicated home'),
  @('src/pages/admin/SuperAdminHome.vue', 'feat(admin): super-admin dashboard with stats'),
  @('src/pages/admin/AdminUsersPage.vue', 'feat(admin): users list and role assignment modal'),
  @('src/pages/admin/AdminDocumentsPage.vue', 'feat(admin): documents list with create modals'),
  @('src/pages/admin/AdminCreateDocumentPage.vue', 'feat(admin): standalone create document page'),
  @('src/pages/admin/AdminServiceDocumentairesPage.vue', 'feat(admin): services list and create modal with FC/USD'),
  @('src/pages/admin/AdminOrganismsPage.vue', 'feat(admin): organism activity stats page'),
  @('src/pages/admin/RolesPage.vue', 'feat(admin): account types and roles page'),
  @('src/layouts/AdminLayout.vue', 'feat(admin): role-based nav, profile and super-admin menu'),
  @('src/layouts/DashboardLayout.vue', 'chore(layout): dashboard layout updates'),
  @('src/layouts/PublicLayout.vue', 'chore(layout): public layout updates'),
  @('src/router/index.ts', 'feat(router): admin routes, reset password and role guards')
)

foreach ($pair in $commits) {
  $file = $pair[0]
  $msg = $pair[1]
  if (-not (Test-Path $file)) { Write-Warning "skip missing $file"; continue }
  git add -- $file
  git commit -m $msg -- $file
  if ($LASTEXITCODE -ne 0) { Write-Warning "commit failed: $file" }
}

Write-Host "Done. Remaining:"
git status --short
