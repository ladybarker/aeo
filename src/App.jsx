import { useState, useCallback } from 'react'
import UrlInput from './components/UrlInput.jsx'
import ScoreRing from './components/ScoreRing.jsx'
import CategoryCard from './components/CategoryCard.jsx'
import CheckItem from './components/CheckItem.jsx'
import PromptModal from './components/PromptModal.jsx'
import InfoSection from './components/InfoSection.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import CookiePolicy from './pages/CookiePolicy.jsx'
import { CATEGORY_META } from './data/CHECKS.js'

const API_URL = (import.meta.env.VITE_API_URL || '') + '/api/scan'

function Header({ onHome }) {
  return (
    <header className="site-header">
      <button className="logo-btn" onClick={onHome} type="button" aria-label="Go to home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="var(--accent)" />
          <path d="M7 17L12 7l5 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.5 14h7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="logo-text">AEO Check</span>
      </button>
      <nav className="site-nav" aria-label="Site navigation">
        <button className="nav-link" onClick={onHome} type="button">Home</button>
      </nav>
    </header>
  )
}

function Footer({ onPrivacy, onCookies }) {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} AEO Check</p>
      <nav className="footer-nav" aria-label="Footer navigation">
        <button className="footer-link" onClick={onPrivacy} type="button">Privacy Policy</button>
        <button className="footer-link" onClick={onCookies} type="button">Cookie Policy</button>
      </nav>
    </footer>
  )
}

function HomePage({ onScan, loading, scanError }) {
  return (
    <main className="home-main">
      <div className="home-hero">
        <h1 className="home-title">Is your site ready for AI agents?</h1>
        <p className="home-desc">
          AEO Check scans any URL and grades it across 31 checks covering discoverability,
          agent protocols, structured data, content quality, and security. For every failed
          check, you get a ready-to-paste AI prompt to fix it — fast.
        </p>
        <UrlInput onScan={onScan} loading={loading} />
        {scanError && (
          <p className="scan-error" role="alert">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="7" stroke="var(--red)" strokeWidth="1.2" />
              <path d="M7.5 4.5v3.5M7.5 10v.5" stroke="var(--red)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {scanError}
          </p>
        )}
      </div>
      <div className="home-checks-preview">
        <div className="home-checks-grid">
          {['Discovery', 'Agent Protocols', 'Structured Data', 'Content & Semantics', 'Security & Trust'].map(c => (
            <div key={c} className="home-check-chip">{c}</div>
          ))}
        </div>
      </div>
    </main>
  )
}

function LoadingState({ url }) {
  return (
    <main className="loading-main" aria-live="polite" aria-busy="true">
      <div className="loading-spinner" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke="var(--border)" strokeWidth="4" />
          <path d="M20 4a16 16 0 0 1 16 16" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="loading-text">Scanning <strong>{url}</strong>…</p>
      <p className="loading-sub">Running 31 checks in parallel. This takes around 10 seconds.</p>
    </main>
  )
}

function ResultsPage({ data, scannedUrl, onRescan, onPromptOpen }) {
  const cats = data.categories
  const categoryOrder = ['discovery', 'protocols', 'structured_data', 'semantics', 'security']

  return (
    <main className="results-main">
      <div className="results-top">
        <ScoreRing score={data.score} grade={data.grade} />
        <div className="results-meta">
          <p className="results-url">{data.url}</p>
          <h2 className="results-headline">
            {data.score >= 80 ? 'Agent Ready' : data.score >= 60 ? 'Needs Work' : 'Not Agent Ready'}
          </h2>
          <p className="results-summary-text">
            Your site scored <strong>{data.score}/100</strong> (grade <strong>{data.grade}</strong>) across
            all weighted AEO checks.
          </p>
          <button className="rescan-btn" onClick={onRescan} type="button">
            Scan another URL
          </button>
        </div>
      </div>

      <section className="cat-grid" aria-label="Category scores">
        {categoryOrder.map(key => {
          const cat = cats[key]
          if (!cat) return null
          const meta = CATEGORY_META[key]
          return (
            <CategoryCard
              key={key}
              label={cat.label}
              score={cat.score}
              weight={meta.weight}
              checks={cat.checks}
            />
          )
        })}
      </section>

      {categoryOrder.map(key => {
        const cat = cats[key]
        if (!cat || cat.checks.length === 0) return null
        const failedChecks = cat.checks.filter(c => c.status === 'fail')
        const otherChecks = cat.checks.filter(c => c.status !== 'fail')

        return (
          <section key={key} className="checks-section">
            <h3 className="checks-section__title">{cat.label}</h3>
            <div className="checks-list">
              {failedChecks.map(check => (
                <CheckItem
                  key={check.id}
                  check={check}
                  scannedUrl={data.url}
                  onPromptOpen={onPromptOpen}
                  defaultOpen={true}
                />
              ))}
              {otherChecks.map(check => (
                <CheckItem
                  key={check.id}
                  check={check}
                  scannedUrl={data.url}
                  onPromptOpen={onPromptOpen}
                  defaultOpen={false}
                />
              ))}
            </div>
          </section>
        )
      })}

      <InfoSection checks={data.informational} />
    </main>
  )
}

export default function App() {
  const [page, setPage] = useState('home') // 'home' | 'results' | 'loading' | 'privacy' | 'cookies'
  const [results, setResults] = useState(null)
  const [scannedUrl, setScannedUrl] = useState('')
  const [scanError, setScanError] = useState('')
  const [modal, setModal] = useState(null) // { checkId, checkName }

  const goHome = useCallback(() => {
    setPage('home')
    setResults(null)
    setScanError('')
  }, [])

  async function handleScan(url) {
    setScannedUrl(url)
    setScanError('')
    setPage('loading')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      setResults(data)
      setPage('results')
    } catch (err) {
      setScanError(err.message || 'Scan failed. Please try again.')
      setPage('home')
    }
  }

  function openModal(checkId, checkName) {
    setModal({ checkId, checkName })
  }

  function closeModal() {
    setModal(null)
  }

  return (
    <div className="app">
      <Header onHome={goHome} />

      {page === 'home' && <HomePage onScan={handleScan} loading={false} scanError={scanError} />}
      {page === 'loading' && <LoadingState url={scannedUrl} />}
      {page === 'results' && results && (
        <ResultsPage
          data={results}
          scannedUrl={scannedUrl}
          onRescan={goHome}
          onPromptOpen={openModal}
        />
      )}
      {page === 'privacy' && <PrivacyPolicy onBack={goHome} />}
      {page === 'cookies' && <CookiePolicy onBack={goHome} />}

      <Footer
        onPrivacy={() => setPage('privacy')}
        onCookies={() => setPage('cookies')}
      />

      {modal && (
        <PromptModal
          checkId={modal.checkId}
          checkName={modal.checkName}
          scannedUrl={scannedUrl}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
