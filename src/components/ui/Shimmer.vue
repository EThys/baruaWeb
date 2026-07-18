<template>
  <div
    class="shimmer"
    :class="roundedClass"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  width?: string
  height?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}>(), {
  width: '100%',
  height: '1rem',
  rounded: 'md',
})

const roundedClass = computed(() => {
  const map = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  } as const
  return map[props.rounded]
})
</script>
