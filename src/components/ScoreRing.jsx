export default function ScoreRing({ score, grade }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? 'var(--green)' :
    score >= 60 ? 'var(--amber)' :
    'var(--red)'

  const gradeColor =
    grade === 'A' ? 'var(--green)' :
    grade === 'B' ? 'var(--green)' :
    grade === 'C' ? 'var(--amber)' :
    grade === 'D' ? 'var(--amber)' :
    'var(--red)'

  return (
    <div className="score-ring" aria-label={`Score: ${score} out of 100, grade ${grade}`}>
      <svg width="136" height="136" viewBox="0 0 136 136" aria-hidden="true">
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="score-ring__labels">
        <span className="score-ring__number" style={{ color }}>{score}</span>
        <span className="score-ring__sub">/100</span>
        <span className="score-ring__grade" style={{ color: gradeColor }}>{grade}</span>
      </div>
    </div>
  )
}
