<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
    <div class="text-9xl font-display font-bold text-primary-100 select-none mb-2">404</div>
    <h1 class="font-display font-bold text-2xl text-gray-800 mb-3">Page introuvable</h1>
    <p class="text-gray-500 max-w-sm mb-8 text-sm">
      La page que vous cherchez n'existe pas ou a été déplacée.
    </p>
    <div class="flex gap-3">
      <RouterLink to="/" class="btn-primary btn-lg">
        <Home :size="16" /> Retour à l'accueil
      </RouterLink>
      <RouterLink to="/services" class="btn-outline btn-lg">
        Voir les services
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Home } from 'lucide-vue-next'
</script>
