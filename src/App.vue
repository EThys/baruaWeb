<script setup lang="ts">
import { RouterView } from 'vue-router'
import { routeLoading } from '@/router'
</script>

<template>
  <div :class="['route-loader', routeLoading ? 'route-loader--active' : '']">
    <div class="route-loader__bar"></div>
  </div>
  <RouterView />
</template>
