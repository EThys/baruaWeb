/**
 * Cloudflare Pages — proxy same-origin vers le backend (équivalent Nginx).
 * Déployer avec le dossier `functions/` (pas seulement dist/).
 */
const BACKEND_ORIGIN = 'https://backend.baruaofficiel.com'

const AUTH_API_PATHS = new Set(['/auth/login', '/auth/register'])

function shouldProxyToBackend(pathname, method) {
  if (pathname.startsWith('/api/v1/')) return true
  if (AUTH_API_PATHS.has(pathname) && method !== 'GET' && method !== 'HEAD') return true
  return false
}

async function proxyToBackend(request) {
  const url = new URL(request.url)
  const target = `${BACKEND_ORIGIN}${url.pathname}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  return fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  })
}

export async function onRequest(context) {
  const { request, next } = context
  const url = new URL(request.url)

  if (shouldProxyToBackend(url.pathname, request.method)) {
    return proxyToBackend(request)
  }

  return next()
}
