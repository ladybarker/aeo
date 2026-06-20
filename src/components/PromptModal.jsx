import { useState, useEffect, useRef } from 'react'
import { PROMPTS, PLATFORMS } from '../data/PROMPTS.js'

export default function PromptModal({ checkId, checkName, scannedUrl, onClose }) {
  const [platform, setPlatform] = useState('Cloudflare')
  const [copied, setCopied] = useState(false)
  const backdropRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const rawPrompt = PROMPTS[checkId] || ''
  const filledPrompt = rawPrompt
    .replace(/\[URL\]/g, scannedUrl)
    .replace(/\[PLATFORM\]/g, platform)

  async function copy() {
    await navigator.clipboard.writeText(filledPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleBackdrop(e) {
    if (e.target === backdropRef.current) onClose()
  }

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Fix prompt for ${checkName}`}
    >
      <div className="modal">
        <div className="modal__header">
          <div>
            <h2 className="modal__title">Fix Prompt</h2>
            <p className="modal__subtitle">{checkName}</p>
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            ref={closeRef}
            type="button"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal__platform">
          <label className="modal__platform-label" htmlFor="platform-select">Hosting platform</label>
          <select
            id="platform-select"
            className="modal__platform-select"
            value={platform}
            onChange={e => { setPlatform(e.target.value); setCopied(false) }}
          >
            {PLATFORMS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="modal__prompt-wrap">
          <pre className="modal__prompt">{filledPrompt}</pre>
        </div>

        <div className="modal__footer">
          <button className={`modal__copy-btn${copied ? ' modal__copy-btn--copied' : ''}`} onClick={copy} type="button">
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M2 10V3a1 1 0 0 1 1-1h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Copy to clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
