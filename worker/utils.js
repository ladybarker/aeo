const TIMEOUT_MS = 12000

export async function fetchSafe(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'AEOCheck/1.0 (+https://aeocheck.com)',
        ...(options.headers || {}),
      },
    })
    // Buffer text so callers can read it multiple times
    const text = await res.text().catch(() => '')
    res._text = text
    return res
  } finally {
    clearTimeout(timer)
  }
}

export function getOrigin(url) {
  const parsed = new URL(url)
  return `${parsed.protocol}//${parsed.host}`
}

export function getDomain(url) {
  return new URL(url).hostname
}

export function getMetaRobots(html) {
  // Match both orderings: name first or content first
  const m =
    html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i)
  return m ? m[1] : null
}

export function extractJsonLd(html) {
  const results = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try { results.push(JSON.parse(m[1])) } catch { results.push(null) }
  }
  return results
}

export function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export function jsonResponse(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}
