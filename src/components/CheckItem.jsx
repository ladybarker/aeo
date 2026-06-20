import { useState } from 'react'
import { CHECKS } from '../data/CHECKS.js'
import { PROMPTS } from '../data/PROMPTS.js'

const STATUS_ICONS = {
  pass: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Pass">
      <circle cx="8" cy="8" r="8" fill="var(--green)" opacity="0.15" />
      <path d="M5 8.5l2 2 4-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  fail: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Fail">
      <circle cx="8" cy="8" r="8" fill="var(--red)" opacity="0.15" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  skip: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Skip">
      <circle cx="8" cy="8" r="8" fill="var(--gray)" opacity="0.15" />
      <path d="M5 8h6" stroke="var(--gray)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Info">
      <circle cx="8" cy="8" r="8" fill="var(--blue)" opacity="0.15" />
      <path d="M8 7v4M8 5.5v.5" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

export default function CheckItem({ check, scannedUrl, onPromptOpen, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = CHECKS[check.id] || {}
  const name = meta.name || check.id
  const description = meta.description || ''
  const isFail = check.status === 'fail'
  const hasPrompt = isFail && PROMPTS[check.id]

  return (
    <div className={`check-item check-item--${check.status}`}>
      <button
        className="check-item__header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        type="button"
      >
        <span className="check-item__icon">{STATUS_ICONS[check.status] || STATUS_ICONS.skip}</span>
        <span className="check-item__name">{name}</span>
        <span className={`check-item__chevron${open ? ' check-item__chevron--open' : ''}`} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="check-item__body">
          <p className="check-item__description">{description}</p>
          <p className="check-item__detail">{check.detail}</p>
          {hasPrompt && (
            <button
              className="check-item__prompt-btn"
              onClick={() => onPromptOpen(check.id, name)}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 4h6M4 7h6M4 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Copy Fix Prompt
            </button>
          )}
        </div>
      )}
    </div>
  )
}
