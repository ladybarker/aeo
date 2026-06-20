import { extractJsonLd } from '../utils.js'

export function runStructuredDataChecks(html) {
  if (!html) {
    const skip = (id) => ({ id, status: 'skip', detail: 'Could not fetch page HTML.' })
    return [
      skip('json_ld_exists'),
      skip('organization_schema'),
      skip('schema_validation'),
      skip('breadcrumb_schema'),
    ]
  }

  const rawBlocks = extractJsonLdRaw(html)
  const parsed = parseBlocks(rawBlocks)

  return [
    checkJsonLdExists(rawBlocks),
    checkOrganizationSchema(parsed),
    checkSchemaValidation(rawBlocks, parsed),
    checkBreadcrumbSchema(parsed),
  ]
}

function extractJsonLdRaw(html) {
  const blocks = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim())
  }
  return blocks
}

function parseBlocks(rawBlocks) {
  return rawBlocks.map(raw => {
    try { return JSON.parse(raw) } catch { return null }
  })
}

function flattenGraph(obj) {
  if (!obj) return []
  if (Array.isArray(obj)) return obj.flatMap(flattenGraph)
  if (obj['@graph']) return [obj, ...flattenGraph(obj['@graph'])]
  return [obj]
}

function checkJsonLdExists(rawBlocks) {
  if (rawBlocks.length === 0) {
    return { id: 'json_ld_exists', status: 'fail', detail: 'No JSON-LD <script> blocks found. Structured data is how AI agents understand what your content represents.' }
  }
  return { id: 'json_ld_exists', status: 'pass', detail: `Found ${rawBlocks.length} JSON-LD block(s).` }
}

function checkOrganizationSchema(parsed) {
  const orgTypes = ['Organization', 'LocalBusiness', 'Corporation', 'NGO', 'EducationalOrganization']
  const all = parsed.flatMap(flattenGraph)
  const org = all.find(node => {
    if (!node || !node['@type']) return false
    const t = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
    return t.some(type => orgTypes.includes(type))
  })

  if (!org) {
    return {
      id: 'organization_schema',
      status: 'fail',
      detail: 'No Organization or LocalBusiness schema found. This is how AI language models consolidate your brand identity.',
    }
  }

  const missing = []
  if (!org.name) missing.push('name')
  if (!org.url) missing.push('url')
  if (!org.sameAs) missing.push('sameAs')

  if (missing.length > 0) {
    return {
      id: 'organization_schema',
      status: 'fail',
      detail: `Organization schema found but missing required fields: ${missing.join(', ')}.`,
    }
  }

  return {
    id: 'organization_schema',
    status: 'pass',
    detail: `Valid Organization schema found with name, url, and sameAs.`,
  }
}

function checkSchemaValidation(rawBlocks, parsed) {
  if (rawBlocks.length === 0) {
    return { id: 'schema_validation', status: 'skip', detail: 'No JSON-LD blocks to validate.' }
  }

  const errors = []
  rawBlocks.forEach((raw, i) => {
    const obj = parsed[i]
    if (obj === null) {
      errors.push(`Block ${i + 1}: invalid JSON`)
      return
    }
    if (!obj['@context']) errors.push(`Block ${i + 1}: missing @context`)
    if (!obj['@type'] && !obj['@graph']) errors.push(`Block ${i + 1}: missing @type`)
  })

  if (errors.length > 0) {
    return { id: 'schema_validation', status: 'fail', detail: `Schema errors: ${errors.join('; ')}` }
  }

  return { id: 'schema_validation', status: 'pass', detail: `All ${rawBlocks.length} JSON-LD block(s) are valid with @context and @type.` }
}

function checkBreadcrumbSchema(parsed) {
  const all = parsed.flatMap(flattenGraph)
  const hasBreadcrumb = all.some(node => {
    if (!node || !node['@type']) return false
    const t = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
    return t.includes('BreadcrumbList')
  })

  if (!hasBreadcrumb) {
    return { id: 'breadcrumb_schema', status: 'fail', detail: 'No BreadcrumbList schema found. Breadcrumbs help AI agents understand your site hierarchy.' }
  }
  return { id: 'breadcrumb_schema', status: 'pass', detail: 'BreadcrumbList schema found.' }
}

export { extractJsonLdRaw, parseBlocks }
