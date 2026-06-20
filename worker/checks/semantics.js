export function runSemanticsChecks(html) {
  if (!html) {
    const skip = (id) => ({ id, status: 'skip', detail: 'Could not fetch page HTML.' })
    return [
      skip('ssr_detection'),
      skip('heading_hierarchy'),
      skip('alt_text'),
      skip('language_declaration'),
      skip('semantic_html'),
    ]
  }

  return [
    checkSsr(html),
    checkHeadingHierarchy(html),
    checkAltText(html),
    checkLanguage(html),
    checkSemanticHtml(html),
  ]
}

function stripTags(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function checkSsr(html) {
  // Strip script and style blocks first
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  // Look for text content in semantic containers
  const containers = /(main|article|section|p)/i
  const contentRe = /<(main|article|section|p)[^>]*>([\s\S]*?)<\/\1>/gi
  let totalText = ''
  let m
  while ((m = contentRe.exec(stripped)) !== null) {
    totalText += stripTags(m[2]) + ' '
    if (totalText.length > 300) break
  }

  // Also check body as fallback
  if (totalText.trim().length < 50) {
    const bodyMatch = stripped.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      totalText = stripTags(bodyMatch[1])
    }
  }

  const meaningful = totalText.replace(/\s+/g, ' ').trim()
  if (meaningful.length < 100) {
    return {
      id: 'ssr_detection',
      status: 'fail',
      detail: `Very little text content found in raw HTML (<100 chars). The page may depend on JavaScript to render content — AI crawlers that don't execute JS will see a near-empty page.`,
    }
  }

  return {
    id: 'ssr_detection',
    status: 'pass',
    detail: `Meaningful text content found in raw HTML (${Math.min(meaningful.length, 9999)}+ chars). Page is readable without JavaScript.`,
  }
}

function checkHeadingHierarchy(html) {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')

  const h1Count = (stripped.match(/<h1[\s>]/gi) || []).length
  const h2Count = (stripped.match(/<h2[\s>]/gi) || []).length
  const h3Count = (stripped.match(/<h3[\s>]/gi) || []).length

  if (h1Count === 0) {
    return { id: 'heading_hierarchy', status: 'fail', detail: 'No H1 heading found. Every page needs exactly one H1 for AI agents to identify the primary topic.' }
  }
  if (h1Count > 1) {
    return { id: 'heading_hierarchy', status: 'fail', detail: `${h1Count} H1 headings found. Pages should have exactly one H1.` }
  }
  if (h3Count > 0 && h2Count === 0) {
    return { id: 'heading_hierarchy', status: 'fail', detail: 'H3 headings found without any H2. Heading levels should not skip (H1 → H3 without H2).' }
  }
  return {
    id: 'heading_hierarchy',
    status: 'pass',
    detail: `Valid heading structure: 1 H1, ${h2Count} H2(s), ${h3Count} H3(s).`,
  }
}

function checkAltText(html) {
  const imgRe = /<img([^>]*)>/gi
  const altRe = /\balt=["']([^"']*)["']/i

  let total = 0
  let missing = 0
  let empty = 0
  let m

  while ((m = imgRe.exec(html)) !== null) {
    const attrs = m[1]
    // Skip presentational images that have role="presentation" or are inside <picture> with aria-hidden
    if (/role=["']presentation["']/i.test(attrs) || /aria-hidden=["']true["']/i.test(attrs)) continue
    total++
    const altMatch = attrs.match(altRe)
    if (!altMatch) {
      missing++
    } else if (altMatch[1].trim() === '') {
      empty++
    }
  }

  if (total === 0) {
    return { id: 'alt_text', status: 'pass', detail: 'No images found on this page.' }
  }

  const bad = missing + empty
  if (bad > 0) {
    return {
      id: 'alt_text',
      status: 'fail',
      detail: `${bad} of ${total} image(s) have missing or empty alt text. AI agents cannot understand visual content without alt text.`,
    }
  }

  return { id: 'alt_text', status: 'pass', detail: `All ${total} image(s) have non-empty alt attributes.` }
}

function checkLanguage(html) {
  const m = html.match(/<html[^>]+lang=["']([^"']*)["']/i)
  if (!m || !m[1].trim()) {
    return {
      id: 'language_declaration',
      status: 'fail',
      detail: 'The <html> element is missing a lang attribute or it is empty. AI agents use this to determine content language.',
    }
  }
  return { id: 'language_declaration', status: 'pass', detail: `Language declared: lang="${m[1]}".` }
}

function checkSemanticHtml(html) {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')

  const found = {
    main: /<main[\s>/i.test(stripped),
    nav: /<nav[\s>/i.test(stripped),
    article: /<article[\s>/i.test(stripped),
    footer: /<footer[\s>/i.test(stripped),
  }

  const presentList = Object.entries(found).filter(([, v]) => v).map(([k]) => `<${k}>`)
  const missingList = Object.entries(found).filter(([, v]) => !v).map(([k]) => `<${k}>`)

  if (presentList.length === 0) {
    return {
      id: 'semantic_html',
      status: 'fail',
      detail: 'No semantic landmark elements (<main>, <nav>, <article>, <footer>) found. AI agents navigate by semantic structure.',
    }
  }

  if (missingList.length > 0) {
    return {
      id: 'semantic_html',
      status: 'pass',
      detail: `Semantic elements found: ${presentList.join(', ')}. Not present: ${missingList.join(', ')}.`,
    }
  }

  return { id: 'semantic_html', status: 'pass', detail: `All key landmark elements present: ${presentList.join(', ')}.` }
}
