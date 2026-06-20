export default function PrivacyPolicy({ onBack }) {
  return (
    <main className="policy-main">
      <button className="back-link" onClick={onBack} type="button">← Back</button>
      <h1>Privacy Policy</h1>
      <p className="policy-updated">Last updated: June 2025</p>

      <h2>What we collect</h2>
      <p>
        AEO Check does not collect personal information. When you submit a URL for scanning,
        that URL is sent to our Cloudflare Worker to perform the technical checks. We do not
        store submitted URLs, scan results, or any identifying information about you.
      </p>

      <h2>Scanning third-party sites</h2>
      <p>
        When you scan a URL, our server-side worker makes HTTP requests to that URL and its
        known sub-paths (e.g. /robots.txt, /sitemap.xml). These requests appear in server
        logs of the site being scanned with the user agent <code>AEOCheck/1.0</code>. We
        do not store the content of these responses beyond the duration of a single scan.
      </p>

      <h2>Analytics</h2>
      <p>
        We do not use third-party analytics scripts. Cloudflare may collect aggregate
        request-level data as part of their platform. Please refer to
        Cloudflare&apos;s privacy policy for details.
      </p>

      <h2>Cookies</h2>
      <p>
        AEO Check does not set any cookies. See our <button className="inline-link" onClick={onBack}>Cookie Policy</button> for full details.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, please open an issue on our GitHub repository.
      </p>
    </main>
  )
}
