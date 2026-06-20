import { CHECKS } from '../data/CHECKS.js'

const PRESENT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Present">
    <circle cx="8" cy="8" r="8" fill="var(--blue)" opacity="0.15" />
    <path d="M8 5v4M8 10.5v.5" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ABSENT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Not present">
    <circle cx="8" cy="8" r="8" fill="var(--gray)" opacity="0.1" />
    <path d="M5 8h6" stroke="var(--gray)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export default function InfoSection({ checks }) {
  if (!checks || checks.length === 0) return null

  return (
    <section className="info-section">
      <h3 className="info-section__heading">
        Informational
        <span className="info-section__badge">not scored</span>
      </h3>
      <p className="info-section__note">
        These checks are for awareness only and do not affect your score.
      </p>
      <div className="info-section__list">
        {checks.map(check => {
          const meta = CHECKS[check.id] || {}
          const name = meta.name || check.id
          const description = meta.description || ''
          return (
            <div key={check.id} className="info-item">
              <span className="info-item__icon">
                {check.present ? PRESENT_ICON : ABSENT_ICON}
              </span>
              <div className="info-item__content">
                <span className="info-item__name">{name}</span>
                <span className="info-item__detail">{check.detail}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
