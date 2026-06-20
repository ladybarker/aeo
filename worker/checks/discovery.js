import { fetchSafe, getOrigin, getMetaRobots } from '../utils.js'

export async function runDiscoveryChecks(targetUrl, sharedHtml, sharedHeaders) {
  const origin = getOrigin(targetUrl)

  const [robotsRes, sitemapRes, llmsRes, llmsFullRes, agentsTxtRes] = await Promise.allSettled([
    fetchSafe(`${origin}/robots.txt`),
    fetchSafe(`${origin}/sitemap.xml`),
    fetchSafe(`${origin}/llms.txt`),
    fetchSafe(`${origin}/llms-full.txt`),
    fetchSafe(`${origin}/agents.txt`),
  ])

  // robots_txt
  const robotsTxt = (() => {
    if (robotsRes.status === 'rejected') return { ok: false, text: '' }
    const r = robotsRes.value
    return { ok: r.ok, text: r._text || '' }
  })()

  const checks = []

  // 1. robots_txt
  checks.push(
    robotsTxt.ok
      ? { id: 'robots_txt', status: 'pass', detail: 'robots.txt found and accessible.' }
      : { id: 'robots_txt', status: 'fail', detail: 'robots.txt not found or returned a non-200 status.' }
  )

  // 2. ai_crawler_directives
  checks.push(checkAiCrawlers(robotsTxt.text))

  // 3. sitemap
  checks.push(await checkSitemap(sitemapRes))

  // 4. llms_txt
  checks.push(checkLlmsTxt(llmsRes))

  // 5. llms_full_txt
  checks.push(
    llmsFullRes.status === 'fulfilled' && llmsFullRes.value.ok
      ? { id: 'llms_full_txt', status: 'pass', detail: '/llms-full.txt found and accessible.' }
      : { id: 'llms_full_txt', status: 'fail', detail: '/llms-full.txt not found. Consider publishing full-text concatenation for AI agents.' }
  )

  // 6. agents_txt
  checks.push(
    agentsTxtRes.status === 'fulfilled' && agentsTxtRes.value.ok
      ? { id: 'agents_txt', status: 'pass', detail: '/agents.txt found and accessible.' }
      : { id: 'agents_txt', status: 'fail', detail: '/agents.txt not found. This emerging standard lets you declare explicit AI agent policies.' }
  )

  // 7. link_headers
  checks.push(checkLinkHeaders(sharedHeaders))

  // 8. meta_robots
  checks.push(checkMetaRobots(sharedHtml))

  return checks
}

function checkAiCrawlers(robotsText) {
  if (!robotsText) {
    return { id: 'ai_crawler_directives', status: 'fail', detail: 'Cannot check — robots.txt not accessible.' }
  }

  const bots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']
  const found = bots.filter(bot => new RegExp(`User-agent:\\s*${bot}`, 'i').test(robotsText))

  if (found.length === 0) {
    return {
      id: 'ai_crawler_directives',
      status: 'fail',
      detail: `No explicit directives found for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended). AI agents cannot determine whether they are welcome.`,
    }
  }

  const blocked = found.filter(bot => {
    const section = robotsText.slice(robotsText.toLowerCase().indexOf(`user-agent: ${bot.toLowerCase()}`))
    const nextAgent = section.slice(bot.length).search(/user-agent:/i)
    const block = nextAgent > 0 ? section.slice(0, nextAgent) : section
    return /disallow:\s*\//i.test(block)
  })

  if (blocked.length === found.length) {
    return {
      id: 'ai_crawler_directives',
      status: 'fail',
      detail: `Found directives for ${found.join(', ')}, but all are disallowed.`,
    }
  }

  return {
    id: 'ai_crawler_directives',
    status: 'pass',
    detail: `Explicit directives found for: ${found.join(', ')}.${blocked.length > 0 ? ` Blocked: ${blocked.join(', ')}.` : ' All allowed.'}`,
  }
}

async function checkSitemap(sitemapRes) {
  if (sitemapRes.status === 'rejected' || !sitemapRes.value.ok) {
    return { id: 'sitemap', status: 'fail', detail: '/sitemap.xml not found or returned a non-200 status.' }
  }
  const text = sitemapRes.value._text || ''
  const isXml = text.trimStart().startsWith('<?xml') || text.includes('<urlset') || text.includes('<sitemapindex')
  if (!isXml) {
    return { id: 'sitemap', status: 'fail', detail: '/sitemap.xml exists but does not appear to be valid XML.' }
  }
  const urlCount = (text.match(/<url>/g) || []).length
  return { id: 'sitemap', status: 'pass', detail: `/sitemap.xml found and valid. ${urlCount > 0 ? `Contains ${urlCount} URL entries.` : ''}` }
}

function checkLlmsTxt(llmsRes) {
  if (llmsRes.status === 'rejected' || !llmsRes.value.ok) {
    return { id: 'llms_txt', status: 'fail', detail: '/llms.txt not found. This AI-optimized index helps language models understand your site.' }
  }
  const text = llmsRes.value._text || ''
  const hasH1 = /^#\s+\S/m.test(text)
  if (!hasH1) {
    return { id: 'llms_txt', status: 'fail', detail: '/llms.txt found but is missing a top-level H1 heading (a line starting with "# ").' }
  }
  return { id: 'llms_txt', status: 'pass', detail: '/llms.txt found and contains a valid H1 heading.' }
}

function checkLinkHeaders(headers) {
  const linkHeader = headers?.get?.('link') || ''
  if (!linkHeader) {
    return { id: 'link_headers', status: 'fail', detail: 'No HTTP Link response header found. Link headers help agents auto-discover machine-readable resources.' }
  }
  return { id: 'link_headers', status: 'pass', detail: `Link header found: ${linkHeader.slice(0, 120)}` }
}

function checkMetaRobots(html) {
  if (!html) return { id: 'meta_robots', status: 'skip', detail: 'Could not fetch page HTML.' }
  const content = getMetaRobots(html)
  if (!content) {
    return { id: 'meta_robots', status: 'pass', detail: 'No meta robots tag found — AI crawlers are not blocked via meta tags.' }
  }
  const blocked = /(noindex|noai|noimageai)/i.test(content)
  if (blocked) {
    return { id: 'meta_robots', status: 'fail', detail: `Meta robots tag found with blocking directive: "${content}". AI crawlers may be blocked.` }
  }
  return { id: 'meta_robots', status: 'pass', detail: `Meta robots tag found: "${content}". No AI-blocking directives detected.` }
}
