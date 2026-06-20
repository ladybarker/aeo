// Maps check identifiers (lowercased name fragments) to AI fix prompts.
// Keys are matched by substring against the lowercased check name/id.
const PROMPT_MAP = [
  {
    match: ['llms.txt', 'llms_txt', 'llmstxt'],
    prompt: (url) =>
      `My website at ${url} is missing an llms.txt file. Please generate an llms.txt file for my site that follows the llms.txt specification (https://llmstxt.org). Include a brief description of the site, key pages with their titles and URLs, and any important context that would help AI assistants understand what my site offers. Format it as plain text with markdown-style headers.`,
  },
  {
    match: ['robots', 'robot'],
    prompt: (url) =>
      `The robots.txt file at ${url} may be blocking AI crawlers. Please write an updated robots.txt that explicitly allows major AI user agents including GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Anthropic-AI, and CCBot, while still protecting any sensitive paths I specify. Show me the full robots.txt content I should use.`,
  },
  {
    match: ['structured data', 'schema', 'json-ld', 'jsonld', 'schema.org'],
    prompt: (url) =>
      `My page at ${url} is missing structured data markup. Based on the page content, please generate the appropriate JSON-LD structured data I should add to the <head> of my HTML. Include Organization, WebPage, and any relevant content-type schemas (Article, Product, FAQPage, etc.). Format it as a <script type="application/ld+json"> block ready to paste into my HTML.`,
  },
  {
    match: ['meta description', 'meta_description'],
    prompt: (url) =>
      `The page at ${url} needs a better meta description for AI agents. Please write a clear, factual meta description (150–160 characters) that accurately summarizes the page content and is optimized for both search engines and AI assistants that use it to understand what the page covers.`,
  },
  {
    match: ['sitemap'],
    prompt: (url) =>
      `My site at ${url} is missing a sitemap or has an invalid one. Please provide a valid XML sitemap template I can use, including instructions on how to add it, how to reference it in robots.txt, and how to submit it to Google Search Console. Also explain why a sitemap helps AI agents discover and understand my content.`,
  },
  {
    match: ['canonical', 'canonical url'],
    prompt: (url) =>
      `The page at ${url} is missing a canonical URL tag. Please explain how to add a proper canonical <link> tag to my HTML, why it matters for AI agents and search engines, and provide the exact tag I should add for this URL.`,
  },
  {
    match: ['https', 'ssl', 'tls', 'secure'],
    prompt: (url) =>
      `My site at ${url} has an HTTPS/SSL issue. Please provide a step-by-step guide to enabling HTTPS on my site, including how to get a free SSL certificate via Let's Encrypt, how to redirect HTTP to HTTPS, and how to update internal links to use HTTPS. Explain why HTTPS is important for AI agent trust.`,
  },
  {
    match: ['heading', 'h1', 'h2', 'headings'],
    prompt: (url) =>
      `The page at ${url} has heading structure issues. Please explain best practices for HTML heading hierarchy (H1–H6) that help AI agents understand page structure, and provide a corrected heading structure for a typical page. Include why clear headings improve AI comprehension and how to audit my current headings.`,
  },
  {
    match: ['alt text', 'image alt', 'alt_text'],
    prompt: (url) =>
      `Images on my page at ${url} are missing alt text. Please explain how to write effective alt text for AI agents and screen readers, provide 5 example before/after alt text improvements, and give me a checklist for auditing all images on my site.`,
  },
  {
    match: ['page speed', 'performance', 'core web vitals', 'load time', 'lcp', 'fid', 'cls'],
    prompt: (url) =>
      `My page at ${url} has performance issues that could affect AI agent access. Please provide a prioritized list of optimizations to improve page load speed, including image optimization, caching headers, code splitting, and CDN setup. Focus on changes that will most improve Largest Contentful Paint (LCP) and overall load time.`,
  },
  {
    match: ['open graph', 'og:', 'opengraph', 'social'],
    prompt: (url) =>
      `My page at ${url} is missing Open Graph meta tags. Please generate the complete set of Open Graph and Twitter Card meta tags I should add to the <head> of my HTML, including og:title, og:description, og:image, og:url, and Twitter equivalents. Explain how these help AI agents understand my content.`,
  },
  {
    match: ['author', 'authorship', 'eeat', 'expertise', 'trust'],
    prompt: (url) =>
      `My site at ${url} lacks authorship and trust signals. Please provide guidance on adding E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals to my content, including author bio markup, credentials, publication dates, and organization information that AI agents use to assess content quality.`,
  },
  {
    match: ['faq', 'question', 'answer'],
    prompt: (url) =>
      `My page at ${url} could benefit from FAQ structured content. Please help me create FAQ-style content with proper FAQPage JSON-LD schema markup. Show me how to structure question-and-answer pairs that AI assistants can easily extract and use when answering user queries about my topic.`,
  },
  {
    match: ['content', 'readability', 'text'],
    prompt: (url) =>
      `The content at ${url} needs to be more AI-readable. Please provide guidance on writing content that AI agents can easily parse and use, including sentence structure, use of headers, bullet points, clear definitions, and avoiding jargon. Rewrite a sample paragraph to show the before/after improvement.`,
  },
]

const DEFAULT_PROMPT = (checkName, url) =>
  `My website at ${url} failed the "${checkName}" check for AI agent optimization. Please explain what this check means, why it matters for AI agents and LLMs accessing my content, and provide specific step-by-step instructions to fix it. Include any code examples or configuration I need.`

export function getFixPrompt(check, siteUrl) {
  const key = (check.name || check.id || '').toLowerCase()
  for (const entry of PROMPT_MAP) {
    if (entry.match.some((m) => key.includes(m))) {
      return entry.prompt(siteUrl)
    }
  }
  return DEFAULT_PROMPT(check.name || check.id || 'Unknown Check', siteUrl)
}
