const ORIGIN = 'https://backend.baruaofficiel.com'

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

module.exports = async function handler(req, res) {
  try {
    const originalUrl = req.url || '/'
    const u = new URL(originalUrl, 'https://vercel.local')
    const prefix = '/auth/'
    const path = u.pathname.startsWith(prefix) ? u.pathname.slice(prefix.length) : u.pathname.replace(/^\//, '')
    const url = `${ORIGIN}/auth/${path}${u.search}`

    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (!v) continue
      const key = k.toLowerCase()
      if (['host', 'connection', 'content-length', 'accept-encoding'].includes(key)) continue
      headers.set(k, Array.isArray(v) ? v.join(',') : String(v))
    }

    const method = req.method || 'GET'
    const body =
      method === 'GET' || method === 'HEAD'
        ? undefined
        : await readRawBody(req)

    const upstream = await fetch(url, {
      method,
      headers,
      body,
    })

    res.statusCode = upstream.status
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return
      res.setHeader(key, value)
    })
    res.setHeader('Cache-Control', 'no-store')

    const buf = Buffer.from(await upstream.arrayBuffer())
    res.end(buf)
  } catch (e) {
    res.statusCode = 502
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({
      message: 'Proxy auth error',
      error: e instanceof Error ? e.message : String(e),
    }))
  }
}
