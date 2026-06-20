import { useState, useRef } from 'react'
import { getFixPrompt } from './prompts.js'

const API_URL = '/api/scan'

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="score-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="score-label">
        <span className="score-number" style={{ color }}>{score}</span>
        <span className="score-sub">/ 100</span>
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          Copy prompt
        </>
      )}
    </button>
  )
}

function CheckItem({ check, siteUrl }) {
  const [open, setOpen] = useState(false)
  const passed = check.passed ?? check.pass ?? check.status === 'pass'
  const name = check.name || check.title || check.id || 'Check'
  const description = check.description || check.details || check.message || ''
  const prompt = getFixPrompt(check, siteUrl)

  return (
    <div className={`check-item ${passed ? 'pass' : 'fail'}`}>
      <div className="check-header" onClick={() => !passed && setOpen((o) => !o)}>
        <span className={`badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
          {passed ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          )}
          {passed ? 'Pass' : 'Fail'}
        </span>
        <span className="check-name">{name}</span>
        {!passed && (
          <span className={`chevron ${open ? 'open' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        )}
      </div>

      {description && <p className="check-description">{description}</p>}

      {!passed && open && (
        <div className="prompt-box">
          <div className="prompt-box-header">
            <span className="prompt-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              AI fix prompt
            </span>
            <CopyButton text={prompt} />
          </div>
          <pre className="prompt-text">{prompt}</pre>
        </div>
      )}
    </div>
  )
}

function normalizeResults(data) {
  // Handle various shapes the API might return
  if (Array.isArray(data)) return { score: null, checks: data }
  if (data.checks) return { score: data.score ?? data.total_score ?? null, checks: data.checks }
  if (data.results) return { score: data.score ?? null, checks: data.results }
  // Flat object of check keys
  const checks = Object.entries(data)
    .filter(([k]) => k !== 'score' && k !== 'url')
    .map(([k, v]) => {
      if (typeof v === 'boolean') return { id: k, name: k, passed: v }
      if (typeof v === 'object') return { id: k, name: k, ...v }
      return { id: k, name: k, passed: Boolean(v) }
    })
  return { score: data.score ?? null, checks }
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  async function scan(e) {
    e.preventDefault()
    const target = url.trim()
    if (!target) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      setResults({ raw: data, url: target, ...normalizeResults(data) })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const passed = results?.checks?.filter((c) => c.passed ?? c.pass ?? c.status === 'pass').length ?? 0
  const total = results?.checks?.length ?? 0
  const score =
    results?.score != null
      ? Number(results.score)
      : total > 0
      ? Math.round((passed / total) * 100)
      : null

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#6366f1" />
            <path d="M8 20L14 8L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 16h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span>AEO Scanner</span>
        </div>
        <p className="header-sub">Check how ready your site is for AI agents</p>
      </header>

      <main className="main">
        <form className="scan-form" onSubmit={scan}>
          <div className="input-row">
            <input
              ref={inputRef}
              className="url-input"
              type="url"
              placeholder="https://yoursite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
            />
            <button className="scan-btn" type="submit" disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Scanning…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  Scan
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}

        {loading && (
          <div className="scanning-state">
            <div className="pulse-dots">
              <span /><span /><span />
            </div>
            <p>Analyzing agent readiness…</p>
          </div>
        )}

        {results && (
          <div className="results">
            <div className="results-summary">
              {score !== null && <ScoreRing score={score} />}
              <div className="summary-text">
                <h2>
                  {score !== null
                    ? score >= 80
                      ? 'Agent Ready'
                      : score >= 50
                      ? 'Needs Work'
                      : 'Not Agent Ready'
                    : 'Scan Complete'}
                </h2>
                <p className="summary-url">{results.url}</p>
                <p className="summary-counts">
                  <span className="count-pass">{passed} passed</span>
                  {' · '}
                  <span className="count-fail">{total - passed} failed</span>
                  {' · '}
                  {total} total checks
                </p>
              </div>
            </div>

            {results.checks?.length > 0 && (
              <div className="checks-list">
                <h3 className="checks-heading">
                  Checks
                  <span className="checks-hint">Click any failed check to see an AI fix prompt</span>
                </h3>
                {/* Show failures first */}
                {[...results.checks]
                  .sort((a, b) => {
                    const ap = a.passed ?? a.pass ?? a.status === 'pass'
                    const bp = b.passed ?? b.pass ?? b.status === 'pass'
                    return ap === bp ? 0 : ap ? 1 : -1
                  })
                  .map((check, i) => (
                    <CheckItem key={check.id || check.name || i} check={check} siteUrl={results.url} />
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        Powered by{' '}
        <a href="https://isitagentready.com" target="_blank" rel="noopener noreferrer">
          Is It Agent Ready
        </a>
      </footer>
    </div>
  )
}
