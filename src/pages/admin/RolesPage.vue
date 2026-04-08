<template>
  <div class="space-y-6">
    <div class="card p-6">
      <h1 class="font-display font-bold text-2xl text-gray-900">Rôles & permissions</h1>
      <p class="text-sm text-gray-500 mt-2">
        MVP: écran réservé au <span class="font-semibold">super-admin</span>.
        La prochaine étape consiste à brancher un backend et une matrice permissions (CRUD) par ressource.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="card p-5">
        <p class="text-xs text-gray-500">Commune</p>
        <p class="font-semibold text-gray-900 mt-1">Gestion locale (archives, dossiers)</p>
        <p class="text-sm text-gray-500 mt-2">Accès limité à une commune.</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500">Ministère</p>
        <p class="font-semibold text-gray-900 mt-1">Gestion sectorielle</p>
        <p class="text-sm text-gray-500 mt-2">Accès aux documents du ministère.</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500">Super-admin</p>
        <p class="font-semibold text-gray-900 mt-1">Rôles, accès, supervision</p>
        <p class="text-sm text-gray-500 mt-2">Définit les rôles et les permissions.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

