export default function CategoryCard({ label, score, weight, checks }) {
  const pass = checks.filter(c => c.status === 'pass').length
  const fail = checks.filter(c => c.status === 'fail').length
  const total = pass + fail

  const color =
    score >= 80 ? 'var(--green)' :
    score >= 60 ? 'var(--amber)' :
    'var(--red)'

  return (
    <div className="cat-card">
      <div className="cat-card__header">
        <span className="cat-card__label">{label}</span>
        <span className="cat-card__score" style={{ color }}>{score}<span className="cat-card__score-denom">/100</span></span>
      </div>
      <div className="cat-card__bar-track">
        <div
          className="cat-card__bar-fill"
          style={{ width: `${score}%`, background: color }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="cat-card__counts">
        <span className="cat-card__pass">{pass} passed</span>
        <span className="cat-card__sep">·</span>
        <span className="cat-card__fail">{fail} failed</span>
        <span className="cat-card__weight">{weight}% weight</span>
      </div>
    </div>
  )
}
