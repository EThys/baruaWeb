import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import type { ProxyOptions } from 'vite'
import { BACKEND_ORIGIN } from './config/backend-origin'

/** Spring renvoie « Invalid CORS request » si Origin = localhost alors que Host = backend. */
function backendProxy(target: string, opts?: { spaGetBypass?: boolean }): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.removeHeader('origin')
        proxyReq.removeHeader('referer')
      })
    },
    ...(opts?.spaGetBypass
      ? {
          bypass(req) {
            if (req.method === 'GET') return '/index.html'
          },
        }
      : {}),
  }
}

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
    // Dev : équivalent `nitro.devProxy` (Casa dashboard) — pas utilisé en prod (Nginx fait le proxy).
    proxy: {
      '/api/v1': backendProxy(BACKEND_ORIGIN),
      '/auth': backendProxy(BACKEND_ORIGIN, { spaGetBypass: true }),
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
