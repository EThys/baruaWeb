import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/v1': {
        target: 'http://91.99.168.226:8098',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/vue') || id.includes('/@vue') || id.includes('vue-router') || id.includes('pinia')) return 'vue-core'
            if (id.includes('lucide-vue-next')) return 'ui'
            if (id.includes('vee-validate') || id.includes('@vee-validate') || id.includes('zod')) return 'forms'
            return 'vendor'
          }
        },
      },
    },
  },
})
