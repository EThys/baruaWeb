const ORIGIN = 'http://91.99.168.226:8098'

module.exports = async function handler(req, res) {
  try {
    const path = Array.isArray(req.query?.path) ? req.query.path.join('/') : (req.query?.path ?? '')
    const url = `${ORIGIN}/api/v1/${path}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`

    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (!v) continue
      const key = k.toLowerCase()
      // Ne pas forward certains headers hop-by-hop.
      if (['host', 'connection', 'content-length'].includes(key)) continue
      headers.set(k, Array.isArray(v) ? v.join(',') : String(v))
    }

    const method = req.method || 'GET'
    const body = method === 'GET' || method === 'HEAD' ? undefined : req.body

    const upstream = await fetch(url, {
      method,
      headers,
      body: body ? (typeof body === 'string' || body instanceof Uint8Array ? body : JSON.stringify(body)) : undefined,
    })

    res.statusCode = upstream.status
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return
      res.setHeader(key, value)
    })
    // On force même-origine (pas besoin de CORS côté navigateur).
    res.setHeader('Cache-Control', 'no-store')

    const buf = Buffer.from(await upstream.arrayBuffer())
    res.end(buf)
  } catch (e) {
    res.statusCode = 502
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ message: 'Proxy API error', error: e instanceof Error ? e.message : String(e) }))
  }
}

