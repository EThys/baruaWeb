<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display font-bold text-2xl text-gray-900">Communes & organismes</h1>
      <p class="text-sm text-gray-500 mt-1">
        Localités qui proposent des services et volume de demandes (estimation à partir des dossiers).
      </p>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-100 bg-gray-50/80">
              <th class="py-3 px-4">Type</th>
              <th class="py-3 px-4">Nom</th>
              <th class="py-3 px-4">Ville</th>
              <th class="py-3 px-4">Services doc.</th>
              <th class="py-3 px-4">Demandes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in admin.organismStats"
              :key="row.organismId"
              class="border-b border-gray-50"
            >
              <td class="py-3 px-4 text-gray-600">{{ row.typeName }}</td>
              <td class="py-3 px-4 font-medium text-gray-800">{{ row.organismName }}</td>
              <td class="py-3 px-4">{{ row.city || '—' }}</td>
              <td class="py-3 px-4">{{ row.servicesCount }}</td>
              <td class="py-3 px-4">{{ row.demandesCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
onMounted(() => admin.fetchSuperAdminOverview())
</script>
