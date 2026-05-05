<template>
  <div class="min-h-screen bg-surface-muted relative overflow-hidden">
    <!-- Soft government-grade background -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-surface-muted to-primary-50/40 pointer-events-none"></div>
    <div class="absolute inset-0 jacquard-bg opacity-[0.06] pointer-events-none"></div>
    <div class="absolute -top-40 -right-40 w-[520px] h-[520px] bg-brand/10 rounded-full blur-[90px] pointer-events-none"></div>
    <div class="absolute -bottom-48 -left-48 w-[520px] h-[520px] bg-primary-200/20 rounded-full blur-[110px] pointer-events-none"></div>

    <div class="relative z-10 page-container py-10 lg:py-16">
      <div class="mx-auto" :class="shellMaxClass">
        <!-- One joined container (brand + form) -->
        <div class="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-card">
          <div class="absolute inset-0 jacquard-bg opacity-[0.05] pointer-events-none"></div>

          <div class="grid grid-cols-1 lg:grid-cols-2 items-stretch">
            <!-- Brand side (desktop) -->
            <div class="hidden lg:flex relative overflow-hidden">
              <div class="absolute inset-0 bg-hero-gradient opacity-[0.92]"></div>
              <div class="absolute inset-0 jacquard-hero opacity-20 pointer-events-none"></div>
              <div class="relative p-10 flex flex-col">
                <RouterLink to="/" class="inline-flex items-center gap-3 group">
                  <div class="w-12 h-12 rounded-2xl bg-white/95 flex items-center justify-center p-1.5 shadow-xl ring-1 ring-white/40 group-hover:scale-[1.03] transition-transform">
                    <img :src="logoBarua" alt="Barua" width="40" height="40" class="h-9 w-9 object-contain" />
                  </div>
                  <div class="leading-tight">
                    <p class="font-display font-bold text-white text-2xl tracking-wide">BARUA</p>
                    <p class="text-blue-100/90 text-sm font-medium">Plateforme officielle des services</p>
                  </div>
                </RouterLink>

                <div class="mt-10 text-white">
                  <p class="text-sm text-blue-100/90 font-semibold tracking-wide uppercase">Accès sécurisé</p>
                  <h1 class="font-display font-bold text-4xl leading-tight mt-3">
                    Vos démarches,<br />en toute confiance.
                  </h1>
                  <p class="mt-4 text-blue-100/90 leading-relaxed max-w-md">
                    Connectez-vous pour suivre vos demandes, déposer vos pièces et recevoir vos documents.
                  </p>
                </div>

                <div class="mt-auto pt-10 text-xs text-blue-100/70 tracking-wide uppercase">
                  © {{ new Date().getFullYear() }} BARUA — Sécurité & confidentialité
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/30"></div>

            <!-- Form side -->
            <div class="relative p-7 sm:p-10">
              <!-- Mobile header -->
              <RouterLink to="/" class="lg:hidden flex items-center gap-3 mb-8 group">
                <div class="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-1 shadow-sm group-hover:scale-[1.02] transition-transform">
                  <img :src="logoBarua" alt="Barua" width="36" height="36" class="h-9 w-9 object-contain" />
                </div>
                <div class="leading-tight">
                  <p class="font-display font-bold text-brand text-xl tracking-wide">BARUA</p>
                  <p class="text-xs text-gray-500 font-medium">Services de l'État</p>
                </div>
              </RouterLink>

              <RouterView v-slot="{ Component }">
                <Transition name="fade" mode="out-in">
                  <component :is="Component" />
                </Transition>
              </RouterView>
            </div>
          </div>
        </div>

        <p class="mt-8 text-center text-xs text-gray-400 font-medium tracking-wider uppercase lg:hidden">
          © {{ new Date().getFullYear() }} BARUA — Sécurité & confidentialité
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import logoBarua from '@/assets/logoBarua.png'

const route = useRoute()
/** Formulaire inscription plus large que connexion / OTP */
const shellMaxClass = computed(() =>
  route.name === 'register' ? 'max-w-7xl w-full' : 'max-w-5xl',
)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
