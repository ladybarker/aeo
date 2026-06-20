# AEO Check

**Agent Experience Optimization scanner.** Enter any URL and get a pass/fail
report across 31 checks — plus a copyable AI fix prompt for every failure.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite → Cloudflare Pages |
| Backend | Cloudflare Worker |
| DNS checks | Cloudflare DoH (1.1.1.1) |

## Check categories

| Category | Weight | Checks |
|---|---|---|
| Discovery | 25% | robots.txt, AI crawler directives, sitemap, llms.txt, llms-full.txt, agents.txt, Link headers, meta robots |
| Agent Protocols | 25% | DNS-AID, DNSSEC, Markdown negotiation, Agent Skills index |
| Structured Data | 20% | JSON-LD exists, Organization schema, Schema validation, Breadcrumb schema |
| Content & Semantics | 20% | SSR detection, Heading hierarchy, Alt text, Language declaration, Semantic HTML |
| Security & Trust | 10% | HTTPS + redirect, HSTS, CSP, X-Content-Type-Options, X-Frame-Options, CORS, Referrer-Policy |
| Informational (unscored) | — | A2A agent card, MCP server card, OpenAPI spec |

## Local development

**Prerequisites:** Node.js 18+, a Cloudflare account, `wrangler` (installed as a dev dep).

```bash
git clone https://github.com/YOUR_ORG/aeo-check.git
cd aeo-check
npm install
```

Run the Worker in one terminal:

```bash
npm run worker:dev
# Worker available at http://localhost:8787
```

Run the frontend in another terminal:

```bash
npm run dev
# Vite proxies /api → http://localhost:8787 automatically
# Frontend at http://localhost:5173
```

## Deployment

### 1. Deploy the Worker

```bash
cd aeo-check

# Authenticate if you haven't already
npx wrangler login

# Deploy the Worker
npm run worker:deploy
```

After deployment, Wrangler will output a URL like:
`https://aeo-check-api.YOUR_SUBDOMAIN.workers.dev`

Note that URL — you need it for the next step.

### 2. Build the frontend

```bash
# Set the Worker URL for the production build
echo "VITE_API_URL=https://aeo-check-api.YOUR_SUBDOMAIN.workers.dev" > .env

npm run build
# Output: dist/
```

### 3. Deploy frontend to Cloudflare Pages

**Option A — Wrangler CLI:**
```bash
npm run pages:deploy
# Wrangler will prompt for a project name on first run
```

**Option B — Git integration (recommended):**
1. Push this repo to GitHub.
2. In Cloudflare Dashboard → Pages → Create project → Connect to Git.
3. Select your repo.
4. Build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
5. Environment variables → Add `VITE_API_URL` = your Worker URL from step 1.
6. Save & deploy.

### 4. (Optional) Custom domain

In Cloudflare Pages → your project → Custom domains → Add domain.

### 5. (Optional) Restrict CORS to your Pages domain

Edit `worker/wrangler.toml`, uncomment `ALLOWED_ORIGIN` and set it to your
Pages URL. Then update `worker/index.js` to use `env.ALLOWED_ORIGIN` instead
of the request origin.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Production only | Base URL of the deployed Worker (no trailing slash). Empty in dev — Vite proxy handles it. |

See `.env.example` for a template.

## Project structure

```
/
├── index.html
├── vite.config.js          # Vite config + /api proxy for dev
├── wrangler.toml           # Cloudflare Pages config
├── .env.example
├── worker/
│   ├── wrangler.toml       # Worker deploy config
│   ├── index.js            # Worker entry — routing, scoring, orchestration
│   ├── utils.js            # fetchSafe, CORS helpers, HTML utilities
│   └── checks/
│       ├── discovery.js    # 8 discovery checks
│       ├── protocols.js    # 4 agent protocol checks
│       ├── structured-data.js  # 4 structured data checks
│       ├── semantics.js    # 5 content & semantics checks
│       └── security.js     # 7 security & trust checks
└── src/
    ├── App.jsx             # App shell, routing, scan orchestration
    ├── App.css             # All styles (CSS custom properties, dark theme)
    ├── main.jsx
    ├── components/
    │   ├── UrlInput.jsx    # URL form with validation
    │   ├── ScoreRing.jsx   # SVG score ring with letter grade
    │   ├── CategoryCard.jsx # Category sub-score card with progress bar
    │   ├── CheckItem.jsx   # Collapsible check row with "Copy Fix Prompt" button
    │   ├── PromptModal.jsx # Platform-aware fix prompt modal
    │   └── InfoSection.jsx # Informational checks (unscored)
    ├── data/
    │   ├── CHECKS.js       # Check metadata (name, description, category)
    │   └── PROMPTS.js      # Fix prompt templates + platform list
    └── pages/
        ├── PrivacyPolicy.jsx
        └── CookiePolicy.jsx
```

## Scoring

Each category is scored independently as `(passed / total_scoreable) × 100`.
Informational checks (`status: "info"`) are never included in scoring.
`skip` checks are also excluded.

The overall score is a weighted average:

```
score = discovery×0.25 + protocols×0.25 + structured_data×0.20
      + semantics×0.20 + security×0.10
```

Grade: **A** ≥ 90, **B** ≥ 80, **C** ≥ 70, **D** ≥ 60, **F** < 60.
