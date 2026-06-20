import { fetchSafe } from '../utils.js'

export async function runSecurityChecks(targetUrl, sharedHeaders) {
  const checks = []

  // https — also check HTTP→HTTPS redirect
  checks.push(await checkHttps(targetUrl))

  // Remaining checks use headers from the shared HTTPS fetch
  const h = sharedHeaders

  checks.push(checkHeader(h, 'hsts', 'strict-transport-security',
    'Strict-Transport-Security header found.',
    'Strict-Transport-Security (HSTS) header missing. HSTS tells agents to always use HTTPS.'))

  checks.push(checkHeader(h, 'csp', 'content-security-policy',
    'Content-Security-Policy header found.',
    'Content-Security-Policy header missing. CSP signals to agents that your site controls what resources it loads.'))

  checks.push(checkHeaderValue(h, 'x_content_type', 'x-content-type-options', 'nosniff',
    'X-Content-Type-Options: nosniff is set.',
    'X-Content-Type-Options: nosniff header missing. This prevents type-sniffing attacks.'))

  checks.push(checkHeader(h, 'x_frame_options', 'x-frame-options',
    `X-Frame-Options: ${h?.get?.('x-frame-options') || ''} is set.`,
    'X-Frame-Options header missing. This prevents clickjacking and is a basic security signal.'))

  checks.push(checkHeader(h, 'cors', 'access-control-allow-origin',
    `Access-Control-Allow-Origin: ${h?.get?.('access-control-allow-origin') || ''} is set.`,
    'No Access-Control-Allow-Origin header. AI agents making cross-origin requests may be blocked.'))

  checks.push(checkHeader(h, 'referrer_policy', 'referrer-policy',
    `Referrer-Policy: ${h?.get?.('referrer-policy') || ''} is set.`,
    'Referrer-Policy header missing. This is a privacy/security signal that agents use to assess how carefully a site handles data.'))

  return checks
}

async function checkHttps(targetUrl) {
  const parsed = new URL(targetUrl)

  if (parsed.protocol !== 'https:') {
    return { id: 'https', status: 'fail', detail: 'Page is not served over HTTPS. HTTPS is the baseline trust requirement for AI agents.' }
  }

  // Check HTTP → HTTPS redirect
  try {
    const httpUrl = targetUrl.replace(/^https:/, 'http:')
    const res = await fetchSafe(httpUrl, { redirect: 'manual' })
    const location = res.headers?.get?.('location') || ''
    if (res.status >= 300 && res.status < 400 && location.startsWith('https://')) {
      return { id: 'https', status: 'pass', detail: 'Page is served over HTTPS and HTTP redirects to HTTPS.' }
    }
    return {
      id: 'https',
      status: 'fail',
      detail: 'Page is served over HTTPS but HTTP does not redirect to HTTPS. Users and agents on plain HTTP are not upgraded.',
    }
  } catch {
    // If HTTP check fails but page is HTTPS, still pass
    return { id: 'https', status: 'pass', detail: 'Page is served over HTTPS (HTTP redirect check was inconclusive).' }
  }
}

function checkHeader(headers, id, headerName, passMsg, failMsg) {
  const val = headers?.get?.(headerName)
  if (val) return { id, status: 'pass', detail: passMsg }
  return { id, status: 'fail', detail: failMsg }
}

function checkHeaderValue(headers, id, headerName, expected, passMsg, failMsg) {
  const val = (headers?.get?.(headerName) || '').toLowerCase()
  if (val.includes(expected.toLowerCase())) return { id, status: 'pass', detail: passMsg }
  return { id, status: 'fail', detail: failMsg }
}
