export default function CookiePolicy({ onBack }) {
  return (
    <main className="policy-main">
      <button className="back-link" onClick={onBack} type="button">← Back</button>
      <h1>Cookie Policy</h1>
      <p className="policy-updated">Last updated: June 2025</p>

      <h2>Do we use cookies?</h2>
      <p>
        AEO Check does not set or read any cookies. We have no tracking cookies,
        session cookies, or persistent cookies of any kind.
      </p>

      <h2>Third-party cookies</h2>
      <p>
        AEO Check is hosted on Cloudflare Pages. Cloudflare may use technical
        cookies as part of their infrastructure (e.g. DDoS protection challenge
        cookies). These are set by Cloudflare, not by AEO Check, and are governed
        by Cloudflare&apos;s cookie policy.
      </p>

      <h2>Local storage</h2>
      <p>
        We do not use localStorage, sessionStorage, or any browser storage APIs.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If our cookie usage changes, we will update this page. As a tool with
        no login, no tracking, and no personalisation, we anticipate this policy
        will remain the same.
      </p>
    </main>
  )
}
