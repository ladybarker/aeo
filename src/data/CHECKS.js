// Metadata for every check — maps IDs to display names, descriptions, and categories.
export const CHECKS = {
  // Discovery
  robots_txt: {
    name: 'robots.txt',
    description: 'Verifies that /robots.txt exists and returns a 200 status.',
    category: 'discovery',
  },
  ai_crawler_directives: {
    name: 'AI Crawler Directives',
    description: 'Checks robots.txt for explicit directives targeting GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.',
    category: 'discovery',
  },
  sitemap: {
    name: 'sitemap.xml',
    description: 'Verifies that /sitemap.xml exists and is valid XML.',
    category: 'discovery',
  },
  llms_txt: {
    name: 'llms.txt',
    description: 'Checks for an AI-optimized site index at /llms.txt with at least one H1 heading.',
    category: 'discovery',
  },
  llms_full_txt: {
    name: 'llms-full.txt',
    description: 'Checks for a full-text site dump at /llms-full.txt for AI agents that cannot browse.',
    category: 'discovery',
  },
  agents_txt: {
    name: 'agents.txt',
    description: 'Checks for an /agents.txt file declaring explicit AI agent policies.',
    category: 'discovery',
  },
  link_headers: {
    name: 'Link Response Headers',
    description: 'Checks HTTP response headers for a Link header pointing to machine-readable resources.',
    category: 'discovery',
  },
  meta_robots: {
    name: 'Meta Robots',
    description: 'Checks the meta robots tag does not contain noindex, noai, or noimageai directives.',
    category: 'discovery',
  },

  // Agent Protocols
  dns_aid: {
    name: 'DNS-AID Discovery',
    description: 'Checks for an SVCB DNS record at _index._agents.[domain] for DNS-based AI discovery.',
    category: 'protocols',
  },
  dnssec: {
    name: 'DNSSEC',
    description: 'Checks whether DNSSEC is enabled (Authenticated Data flag in DNS response).',
    category: 'protocols',
  },
  markdown_negotiation: {
    name: 'Markdown for Agents',
    description: 'Checks whether the server returns text/markdown when requested via the Accept header.',
    category: 'protocols',
  },
  agent_skills: {
    name: 'Agent Skills Index',
    description: 'Checks for a valid /.well-known/agent-skills/index.json with $schema and skills array.',
    category: 'protocols',
  },

  // Structured Data
  json_ld_exists: {
    name: 'JSON-LD Structured Data',
    description: 'Checks for at least one <script type="application/ld+json"> block in the page.',
    category: 'structured_data',
  },
  organization_schema: {
    name: 'Organization Schema',
    description: 'Checks for an Organization or LocalBusiness schema with name, url, and sameAs fields.',
    category: 'structured_data',
  },
  schema_validation: {
    name: 'Schema Validation',
    description: 'Verifies all JSON-LD blocks parse correctly and include @context and @type.',
    category: 'structured_data',
  },
  breadcrumb_schema: {
    name: 'Breadcrumb Schema',
    description: 'Checks for a BreadcrumbList schema to help agents understand site hierarchy.',
    category: 'structured_data',
  },

  // Content & Semantics
  ssr_detection: {
    name: 'Server-Side Rendering',
    description: 'Checks that meaningful text content exists in the raw HTML without JavaScript execution.',
    category: 'semantics',
  },
  heading_hierarchy: {
    name: 'Heading Hierarchy',
    description: 'Verifies exactly one H1 and logical heading nesting (no skipped levels).',
    category: 'semantics',
  },
  alt_text: {
    name: 'Image Alt Text',
    description: 'Checks that all <img> elements have non-empty alt attributes.',
    category: 'semantics',
  },
  language_declaration: {
    name: 'Language Declaration',
    description: 'Checks that the <html> element has a non-empty lang attribute.',
    category: 'semantics',
  },
  semantic_html: {
    name: 'Semantic HTML',
    description: 'Checks for landmark elements: <main>, <nav>, <article>, or <footer>.',
    category: 'semantics',
  },

  // Security & Trust
  https: {
    name: 'HTTPS',
    description: 'Verifies the page is served over HTTPS and that HTTP redirects to HTTPS.',
    category: 'security',
  },
  hsts: {
    name: 'HSTS',
    description: 'Checks for the Strict-Transport-Security header.',
    category: 'security',
  },
  csp: {
    name: 'Content Security Policy',
    description: 'Checks for the Content-Security-Policy header.',
    category: 'security',
  },
  x_content_type: {
    name: 'X-Content-Type-Options',
    description: 'Checks for X-Content-Type-Options: nosniff header.',
    category: 'security',
  },
  x_frame_options: {
    name: 'X-Frame-Options',
    description: 'Checks for the X-Frame-Options header to prevent clickjacking.',
    category: 'security',
  },
  cors: {
    name: 'CORS Headers',
    description: 'Checks for Access-Control-Allow-Origin header for cross-origin agent requests.',
    category: 'security',
  },
  referrer_policy: {
    name: 'Referrer Policy',
    description: 'Checks for the Referrer-Policy header as a privacy/trust signal.',
    category: 'security',
  },

  // Informational
  a2a_agent_card: {
    name: 'A2A Agent Card',
    description: 'Checks for an agent-to-agent card at /.well-known/agent.json.',
    category: 'informational',
  },
  mcp_server_card: {
    name: 'MCP Server Card',
    description: 'Checks for an MCP server card at /.well-known/mcp/server-card.json.',
    category: 'informational',
  },
  openapi: {
    name: 'OpenAPI Spec',
    description: 'Checks for an OpenAPI spec at /openapi.json or /openapi.yaml.',
    category: 'informational',
  },
}

export const CATEGORY_META = {
  discovery: { label: 'Discovery', weight: 25 },
  protocols: { label: 'Agent Protocols', weight: 25 },
  structured_data: { label: 'Structured Data', weight: 20 },
  semantics: { label: 'Content & Semantics', weight: 20 },
  security: { label: 'Security & Trust', weight: 10 },
}
