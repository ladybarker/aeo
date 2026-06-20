// Prompt templates. [URL] and [PLATFORM] are replaced at render time.
export const PROMPTS = {
  robots_txt: `My website [URL] is failing the robots.txt check. My site either does not have a robots.txt file or it is not accessible. AI agents check robots.txt before crawling to understand what they are allowed to access.

I use [PLATFORM] for hosting. Help me create a valid robots.txt file and host it at the root of my domain.`,

  ai_crawler_directives: `My website [URL] is failing the AI Crawler Directives check. My robots.txt does not include explicit directives for major AI crawlers like GPTBot, ClaudeBot, PerplexityBot, and Google-Extended. Without these, AI agents cannot tell whether they are welcome.

I use [PLATFORM] for hosting. Help me update my robots.txt to explicitly allow the major AI crawlers. Show me the correct syntax for each bot.`,

  sitemap: `My website [URL] is failing the sitemap.xml check. My site either does not have a sitemap or it is not valid XML. AI agents use sitemaps to discover and index all pages on a site.

I use [PLATFORM] for hosting. Help me create a valid sitemap.xml and host it at /sitemap.xml.`,

  llms_txt: `My website [URL] is failing the llms.txt check. I have not published an /llms.txt file. This is a curated markdown summary of my site designed for AI agents — the AI equivalent of a sitemap. It tells language models which pages matter most and what my site is about.

I use [PLATFORM] for hosting. Help me create a well-structured llms.txt with an H1 site name, a brief description, and a categorized list of my most important pages. Then tell me how to host it at the root of my domain.`,

  llms_full_txt: `My website [URL] is failing the llms-full.txt check. I have not published an /llms-full.txt file. This is the full text content of my site concatenated into one file so AI agents that cannot browse can ingest everything in a single request.

I use [PLATFORM] for hosting. Help me generate an llms-full.txt from my site content and host it at /llms-full.txt.`,

  agents_txt: `My website [URL] is failing the agents.txt check. I have not published an /agents.txt file. This emerging standard lets me declare explicit policies for what AI agents are allowed to do on my site — beyond what robots.txt covers.

I use [PLATFORM] for hosting. Help me create a valid agents.txt and host it at the root of my domain.`,

  link_headers: `My website [URL] is failing the Link Response Headers check. My homepage is not returning HTTP Link headers that tell AI agents where to find machine-readable resources. Without these headers, agents cannot automatically discover what my site offers.

I use [PLATFORM] for hosting. Help me add a response header to all pages:
Link: </.well-known/api-catalog>; rel='api-catalog'
Walk me through the exact steps.`,

  meta_robots: `My website [URL] is failing the Meta Robots check. My page has a meta robots tag that is blocking AI crawlers with noindex, noai, or noimageai directives. This prevents AI agents from indexing and understanding my content.

I use [PLATFORM] for hosting. Help me locate and fix the meta robots tag so AI crawlers are not blocked.`,

  dns_aid: `My website [URL] is failing the DNS for AI Discovery check. I have not published DNS records under the _agents namespace that allow AI agents to discover my site via DNS. This is based on the DNS-AID draft standard.

I use [PLATFORM] for DNS. Help me add an SVCB record at _index._agents.[domain] pointing to my domain with alpn=http/1.1,h2 and port=443. Walk me through the steps.`,

  dnssec: `My website [URL] is failing the DNSSEC check. DNSSEC is not enabled on my domain. Validating resolvers cannot return authenticated DNS data for my domain, which reduces trust for AI agents doing DNS-based discovery.

I use [PLATFORM] for DNS. Help me enable DNSSEC on my domain. Walk me through the steps.`,

  markdown_negotiation: `My website [URL] is failing the Markdown for Agents check. When AI agents send a request with Accept: text/markdown, my site returns HTML instead of markdown. Markdown is significantly more token-efficient for AI agents to process.

I use [PLATFORM] for hosting. Help me intercept requests with Accept: text/markdown, fetch the original HTML, convert it to markdown, and return it with Content-Type: text/markdown. Walk me through implementation and deployment.`,

  agent_skills: `My website [URL] is failing the Agent Skills Discovery Index check. I have not published a /.well-known/agent-skills/index.json file that tells AI agents what capabilities my site supports for agent interaction.

I use [PLATFORM] for hosting. Help me create and serve a valid index.json at that path with a $schema field and a skills array. If I already have a worker or server, show me how to add this as a new route inside it.`,

  json_ld_exists: `My website [URL] is failing the Structured Data check. My pages do not include any JSON-LD markup. JSON-LD is the primary way AI agents understand what your content represents — whether it is a business, product, article, or something else.

I use [PLATFORM] for hosting. Help me add a JSON-LD script block to my homepage HTML head section. Show me the most relevant Schema.org types for a marketing website.`,

  organization_schema: `My website [URL] is failing the Organization Schema check. My JSON-LD does not include an Organization or LocalBusiness type with name, url, and sameAs fields. This is how AI language models consolidate your brand identity across the web into a single entity in their knowledge graph.

I use [PLATFORM] for hosting. Help me write a complete Organization JSON-LD block with name, url, logo, description, and sameAs links to my social profiles. Show me where to add it.`,

  schema_validation: `My website [URL] is failing the Schema Validation check. My JSON-LD blocks contain errors — missing @context, missing @type, or invalid JSON. Invalid structured data is ignored by AI agents entirely.

I use [PLATFORM] for hosting. Help me locate and fix the errors in my JSON-LD. I will paste my current JSON-LD below for you to review: [paste your JSON-LD here]`,

  breadcrumb_schema: `My website [URL] is failing the BreadcrumbList check. My pages do not include BreadcrumbList JSON-LD. Breadcrumbs help AI agents understand the structure and hierarchy of my site.

I use [PLATFORM] for hosting. Help me add BreadcrumbList JSON-LD to my pages. Show me the correct format and where to add it.`,

  ssr_detection: `My website [URL] is failing the Server-Side Rendering check. When my page is fetched without JavaScript, little or no meaningful content is present in the HTML. Most AI crawlers do not execute JavaScript, which means they see a blank or near-empty page.

I use [PLATFORM] for hosting. Help me understand my options for making my content available in raw HTML without JavaScript execution. Options may include SSR, static generation, or pre-rendering.`,

  heading_hierarchy: `My website [URL] is failing the Heading Hierarchy check. My page either has no H1, multiple H1s, or headings that skip levels (e.g. H1 to H3). AI agents use heading structure to navigate and understand page content.

I use [PLATFORM] for hosting. Help me audit and fix my heading structure so there is exactly one H1 and headings nest logically.`,

  alt_text: `My website [URL] is failing the Alt Text check. One or more images on my page are missing alt attributes. AI agents cannot see images and rely on alt text to understand visual content.

I use [PLATFORM] for hosting. Help me identify which images are missing alt text and write descriptive alt text for them.`,

  language_declaration: `My website [URL] is failing the Language Declaration check. My HTML tag is missing a lang attribute or it is empty. AI agents use this to determine the language of the page content.

I use [PLATFORM] for hosting. Help me add the correct lang attribute to my HTML tag. For example: <html lang="en">.`,

  semantic_html: `My website [URL] is failing the Semantic HTML check. My page is missing landmark elements like <main>, <nav>, <article>, or <footer>. AI agents navigate by semantic structure, not visual layout.

I use [PLATFORM] for hosting. Help me add the appropriate semantic HTML landmark elements to my page structure.`,

  https: `My website [URL] is failing the HTTPS check. My site is either not served over HTTPS or does not redirect HTTP to HTTPS. HTTPS is the baseline trust requirement for AI agents before they interact with a site.

I use [PLATFORM] for hosting. Help me enable HTTPS and set up an automatic redirect from HTTP to HTTPS.`,

  hsts: `My website [URL] is failing the HSTS check. My site is not returning a Strict-Transport-Security header. HSTS tells browsers and agents to always use HTTPS and never fall back to HTTP.

I use [PLATFORM] for hosting. Help me add a Strict-Transport-Security header to all responses. Show me the correct value to use.`,

  csp: `My website [URL] is failing the Content Security Policy check. My site is not returning a Content-Security-Policy header. CSP is a trust signal that tells agents my site controls what resources it loads.

I use [PLATFORM] for hosting. Help me add a basic Content-Security-Policy header appropriate for a marketing website.`,

  x_content_type: `My website [URL] is failing the X-Content-Type-Options check. My site is not returning an X-Content-Type-Options: nosniff header. This header prevents agents and browsers from misinterpreting file types.

I use [PLATFORM] for hosting. Help me add X-Content-Type-Options: nosniff to all responses.`,

  x_frame_options: `My website [URL] is failing the X-Frame-Options check. My site is not returning an X-Frame-Options header. This header prevents my site from being embedded in iframes, which is a basic security signal agents check.

I use [PLATFORM] for hosting. Help me add X-Frame-Options: SAMEORIGIN to all responses.`,

  cors: `My website [URL] is failing the CORS check. My site is not returning Access-Control-Allow-Origin headers. AI agents often make cross-origin requests to fetch content and may be blocked without proper CORS headers.

I use [PLATFORM] for hosting. Help me add appropriate CORS headers to my responses for a public marketing website.`,

  referrer_policy: `My website [URL] is failing the Referrer-Policy check. My site is not returning a Referrer-Policy header. This is a security and privacy signal that agents use to assess how carefully a site handles data.

I use [PLATFORM] for hosting. Help me add a Referrer-Policy header to all responses. Recommend the appropriate value for a marketing website.`,
}

export const PLATFORMS = [
  'Cloudflare',
  'Vercel',
  'Netlify',
  'AWS',
  'GitHub Pages',
  'Other',
]
