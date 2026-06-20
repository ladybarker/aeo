import { fetchSafe, getOrigin, corsHeaders, jsonResponse } from './utils.js'
import { runDiscoveryChecks } from './checks/discovery.js'
import { runProtocolChecks } from './checks/protocols.js'
import { runStructuredDataChecks } from './checks/structured-data.js'
import { runSemanticsChecks } from './checks/semantics.js'
import { runSecurityChecks } from './checks/security.js'

// Informational checks — not scored
async function runInfoChecks(targetUrl) {
  const origin = getOrigin(targetUrl)
  const [agentCard, mcpCard, openApiJson, openApiYaml] = await Promise.allSettled([
    fetchSafe(`${origin}/.well-known/agent.json`),
    fetchSafe(`${origin}/.well-known/mcp/server-card.json`),
    fetchSafe(`${origin}/openapi.json`),
    fetchSafe(`${origin}/openapi.yaml`),
  ])

  return [
    {
      id: 'a2a_agent_card',
      status: 'info',
      detail:
        agentCard.status === 'fulfilled' && agentCard.value.ok
          ? '/.well-known/agent.json found. A2A agent card is published.'
          : '/.well-known/agent.json not found. Agent-to-agent (A2A) card not published.',
      present: agentCard.status === 'fulfilled' && agentCard.value.ok,
    },
    {
      id: 'mcp_server_card',
      status: 'info',
      detail:
        mcpCard.status === 'fulfilled' && mcpCard.value.ok
          ? '/.well-known/mcp/server-card.json found. MCP server card is published.'
          : '/.well-known/mcp/server-card.json not found. MCP server card not published.',
      present: mcpCard.status === 'fulfilled' && mcpCard.value.ok,
    },
    {
      id: 'openapi',
      status: 'info',
      detail: (() => {
        const jsonOk = openApiJson.status === 'fulfilled' && openApiJson.value.ok
        const yamlOk = openApiYaml.status === 'fulfilled' && openApiYaml.value.ok
        if (jsonOk && yamlOk) return 'Both /openapi.json and /openapi.yaml found.'
        if (jsonOk) return '/openapi.json found.'
        if (yamlOk) return '/openapi.yaml found.'
        return 'No OpenAPI spec found at /openapi.json or /openapi.yaml.'
      })(),
      present:
        (openApiJson.status === 'fulfilled' && openApiJson.value.ok) ||
        (openApiYaml.status === 'fulfilled' && openApiYaml.value.ok),
    },
  ]
}

const WEIGHTS = {
  discovery: 0.25,
  protocols: 0.25,
  structured_data: 0.20,
  semantics: 0.20,
  security: 0.10,
}

function scoreCategory(checks) {
  const scoreable = checks.filter(c => c.status === 'pass' || c.status === 'fail')
  if (scoreable.length === 0) return 0
  const passed = scoreable.filter(c => c.status === 'pass').length
  return Math.round((passed / scoreable.length) * 100)
}

function computeScore(categories) {
  let total = 0
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    total += scoreCategory(categories[key]) * weight
  }
  return Math.round(total)
}

function grade(score) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export default {
  async fetch(request, env) {
    const reqOrigin = request.headers.get('origin') || '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(reqOrigin) })
    }

    const url = new URL(request.url)

    if (url.pathname !== '/api/scan' || request.method !== 'POST') {
      return new Response('Not Found', { status: 404 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400, reqOrigin)
    }

    const { url: targetUrl } = body || {}
    if (!targetUrl || typeof targetUrl !== 'string') {
      return jsonResponse({ error: '"url" field is required.' }, 400, reqOrigin)
    }

    let parsed
    try {
      parsed = new URL(targetUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
    } catch {
      return jsonResponse({ error: 'Invalid URL. Must start with http:// or https://' }, 400, reqOrigin)
    }

    const normalized = parsed.href

    // Pre-fetch the main page once — shared across multiple check groups
    let sharedHtml = null
    let sharedHeaders = null
    try {
      const mainRes = await fetchSafe(normalized)
      sharedHtml = mainRes._text || null
      sharedHeaders = mainRes.headers
    } catch {
      // checks handle null gracefully
    }

    // Run all check groups in parallel
    const [discovery, protocols, structured_data, semantics, security, informational] =
      await Promise.all([
        runDiscoveryChecks(normalized, sharedHtml, sharedHeaders),
        runProtocolChecks(normalized),
        Promise.resolve(runStructuredDataChecks(sharedHtml)),
        Promise.resolve(runSemanticsChecks(sharedHtml)),
        runSecurityChecks(normalized, sharedHeaders),
        runInfoChecks(normalized),
      ])

    const categories = { discovery, protocols, structured_data, semantics, security }
    const score = computeScore(categories)

    return jsonResponse(
      {
        url: normalized,
        score,
        grade: grade(score),
        categories: {
          discovery: { label: 'Discovery', score: scoreCategory(discovery), checks: discovery },
          protocols: { label: 'Agent Protocols', score: scoreCategory(protocols), checks: protocols },
          structured_data: { label: 'Structured Data', score: scoreCategory(structured_data), checks: structured_data },
          semantics: { label: 'Content & Semantics', score: scoreCategory(semantics), checks: semantics },
          security: { label: 'Security & Trust', score: scoreCategory(security), checks: security },
        },
        informational,
      },
      200,
      reqOrigin
    )
  },
}
