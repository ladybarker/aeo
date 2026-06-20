const UPSTREAM = 'https://isitagentready.com/api/scan'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function onRequestPost({ request }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { url } = body ?? {}
  if (!url || typeof url !== 'string') {
    return json({ error: 'url field is required' }, 400)
  }

  let upstream
  try {
    upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
  } catch (err) {
    return json({ error: `Failed to reach scan service: ${err.message}` }, 502)
  }

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
