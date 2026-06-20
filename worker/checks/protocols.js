import { fetchSafe, getOrigin, getDomain } from '../utils.js'

const DOH = 'https://cloudflare-dns.com/dns-query'

export async function runProtocolChecks(targetUrl) {
  const origin = getOrigin(targetUrl)
  const domain = getDomain(targetUrl)

  const [dnsAidRes, dnssecRes, markdownRes, agentSkillsRes] = await Promise.allSettled([
    dohLookup(`_index._agents.${domain}`, 'SVCB'),
    dohLookup(domain, 'A'),
    fetchSafe(targetUrl, { headers: { Accept: 'text/markdown, text/html;q=0.9, */*;q=0.5' } }),
    fetchSafe(`${origin}/.well-known/agent-skills/index.json`),
  ])

  return [
    checkDnsAid(dnsAidRes, domain),
    checkDnssec(dnssecRes),
    checkMarkdownNegotiation(markdownRes),
    await checkAgentSkills(agentSkillsRes),
  ]
}

async function dohLookup(name, type) {
  const url = `${DOH}?name=${encodeURIComponent(name)}&type=${type}`
  const res = await fetchSafe(url, { headers: { Accept: 'application/dns-json' } })
  if (!res.ok) throw new Error(`DoH lookup failed: ${res.status}`)
  return res.json()
}

function checkDnsAid(result, domain) {
  if (result.status === 'rejected') {
    return { id: 'dns_aid', status: 'fail', detail: `DNS-AID lookup failed: ${result.reason?.message || 'unknown error'}` }
  }
  const data = result.value
  const hasRecord = Array.isArray(data?.Answer) && data.Answer.length > 0
  if (!hasRecord) {
    return {
      id: 'dns_aid',
      status: 'fail',
      detail: `No SVCB record found at _index._agents.${domain}. DNS-based AI agent discovery (DNS-AID draft) is not configured.`,
    }
  }
  return {
    id: 'dns_aid',
    status: 'pass',
    detail: `SVCB record found at _index._agents.${domain}. DNS-AID discovery is configured.`,
  }
}

function checkDnssec(result) {
  if (result.status === 'rejected') {
    return { id: 'dnssec', status: 'fail', detail: `DNSSEC lookup failed: ${result.reason?.message || 'unknown error'}` }
  }
  const data = result.value
  if (data?.AD === true) {
    return { id: 'dnssec', status: 'pass', detail: 'DNSSEC is enabled and the DNS response has the Authenticated Data (AD) flag set.' }
  }
  return {
    id: 'dnssec',
    status: 'fail',
    detail: 'DNSSEC is not enabled or the AD flag is not set in DNS responses. Validating resolvers cannot authenticate your DNS records.',
  }
}

function checkMarkdownNegotiation(result) {
  if (result.status === 'rejected') {
    return { id: 'markdown_negotiation', status: 'fail', detail: `Request failed: ${result.reason?.message || 'unknown error'}` }
  }
  const res = result.value
  const ct = res.headers?.get?.('content-type') || ''
  if (ct.includes('text/markdown')) {
    return { id: 'markdown_negotiation', status: 'pass', detail: 'Server responds with Content-Type: text/markdown when requested via Accept header.' }
  }
  return {
    id: 'markdown_negotiation',
    status: 'fail',
    detail: `Server returned Content-Type: "${ct || 'unknown'}" instead of text/markdown. Serving markdown reduces token costs for AI agents.`,
  }
}

async function checkAgentSkills(result) {
  if (result.status === 'rejected' || !result.value.ok) {
    return { id: 'agent_skills', status: 'fail', detail: '/.well-known/agent-skills/index.json not found.' }
  }
  let data
  try {
    data = await result.value.json()
  } catch {
    return { id: 'agent_skills', status: 'fail', detail: '/.well-known/agent-skills/index.json found but contains invalid JSON.' }
  }
  if (!data.$schema || !Array.isArray(data.skills)) {
    return {
      id: 'agent_skills',
      status: 'fail',
      detail: '/.well-known/agent-skills/index.json found but is missing required $schema field or skills array.',
    }
  }
  return {
    id: 'agent_skills',
    status: 'pass',
    detail: `Agent skills index found with ${data.skills.length} skill(s) declared.`,
  }
}
