import { useState } from 'react'

export default function UrlInput({ onScan, loading }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function validate(raw) {
    const trimmed = raw.trim()
    if (!trimmed) return 'Please enter a URL.'
    let url = trimmed
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    try {
      new URL(url)
      return { valid: true, url }
    } catch {
      return 'Please enter a valid URL (e.g. https://example.com).'
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const result = validate(value)
    if (typeof result === 'string') {
      setError(result)
      return
    }
    setError('')
    onScan(result.url)
  }

  return (
    <form className="url-form" onSubmit={handleSubmit} noValidate>
      <div className="url-form__row">
        <input
          className={`url-form__input${error ? ' url-form__input--error' : ''}`}
          type="text"
          placeholder="https://yoursite.com"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          disabled={loading}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="Website URL to scan"
        />
        <button
          className="url-form__btn"
          type="submit"
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Scanning…
            </>
          ) : (
            'Scan'
          )}
        </button>
      </div>
      {error && <p className="url-form__error" role="alert">{error}</p>}
    </form>
  )
}
