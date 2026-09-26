# Tatparya Web

Tatparya Web is the React frontend for **Tatparya**, an autonomous data-analysis workspace for small and medium-sized businesses. Users can upload a business dataset, ask questions in natural language, follow the analysis process, review verified KPIs and charts, and preview or download a PDF report.

This repository also contains the public marketing site, authentication screens, account management, owner monitoring, landing-page content management, and the blog CMS.

> The backend is maintained separately in the Tatparya API repository. See [DOCUMENTATION.md](./DOCUMENTATION.md) for the complete frontend architecture and extension guide.

## Main features

- Email/password registration, login, refresh, logout, verification, and password recovery
- Google Identity Services sign-in
- Dataset upload and deterministic profile display
- Conversation-based analysis workspace
- Gemini and Groq provider selection
- Queued analysis progress, cancellation, and retry
- Evidence-backed KPI cards, findings, recommendations, and Plotly charts
- Responsive PDF report preview and download
- Responsive left workspace navigation and right question history
- Public landing page, legal pages, blog listing, and full articles
- Owner-only monitoring and content-management dashboard
- Landing-section visibility controls and blog publishing controls
- Accessible toast notifications, loading states, error boundary, and custom 404 page
- Generated `robots.txt` and `sitemap.xml`

## Technology

- React 19
- React Router 7
- Vite 8
- Tailwind CSS 4 utility classes
- Axios
- Plotly.js
- jsPDF
- Plus Jakarta Sans and JetBrains Mono

## Requirements

- Node.js 22.13 or newer
- npm
- A running Tatparya API instance

## Local setup

```powershell
cd client
npm install
Copy-Item .env.example .env
```

Configure `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SITE_URL=http://localhost:5173
VITE_GOOGLE_SIGN_IN_ENABLED=false
```

Start the development server:

```powershell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The backend should normally be running at `http://localhost:8000`. Its Swagger UI is available at `http://localhost:8000/docs` in development.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Full backend API prefix, normally ending in `/api/v1` |
| `VITE_SITE_URL` | Recommended | Canonical public frontend URL used for SEO files |
| `VITE_GOOGLE_SIGN_IN_ENABLED` | No | Displays Google sign-in when the backend Google client ID is configured |

Only public configuration belongs in `VITE_*` values. Never place an API secret, database URL, JWT secret, Cloudinary secret, or Google client secret in the frontend environment.

## Commands

```powershell
npm run dev       # Start Vite development mode
npm run build     # Production build and SEO-file generation
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
node --test tests/*.test.js
```

The production output is generated in `dist/`.

## Application routes

### Public

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | Login |
| `/register` | Registration |
| `/forgot-password` | Password-reset request |
| `/reset-password` | Password reset from email token |
| `/verify-email` | Email verification from token |
| `/privacy` | Privacy policy |
| `/terms` | Terms and conditions |
| `/blog` | Published article list |
| `/blog/:slug` | Full published article |

### Authenticated

| Route | Purpose |
| --- | --- |
| `/dashboard` | Main workspace |
| `/dashboard/datasets/:datasetId` | Dataset profile |
| `/dashboard/conversations/:conversationId` | Analysis conversation and results |
| `/account` | Profile, password, sessions, and account deletion |

### Owner/admin

| Route | Purpose |
| --- | --- |
| `/admin` | Admin overview |
| `/admin/contacts` | Contact inquiry inbox and replies |
| `/admin/landing-content/:section?` | Section-based landing-page editor |
| `/admin/blogs` | Blog visibility, drafts, and publishing |
| `/monitoring` | User, provider, queue, failure, and agent metrics |

Owner routes are also enforced by the API; hiding a route in React is not treated as authorization.

## Typical user flow

1. Register, log in, or use Google sign-in.
2. Upload a CSV, Excel, JSON, or Parquet file.
3. Generate the deterministic dataset profile.
4. Create an analysis conversation for that dataset.
5. Choose Gemini or Groq and submit a question.
6. The API queues the run; the UI polls safe run and agent statuses.
7. Completed reports and chart specifications are loaded from protected endpoints.
8. The user reviews the dashboard and previews or downloads the PDF report.

## Deployment

The repository includes [`vercel.json`](./vercel.json) for Vercel deployment. It provides SPA rewrites and browser security headers.

Set these Vercel environment variables before deployment:

```env
VITE_API_BASE_URL=https://your-api-host.example/api/v1
VITE_SITE_URL=https://your-domain.example
VITE_GOOGLE_SIGN_IN_ENABLED=true
```

The production backend must allow the exact frontend origin through its `FRONTEND_URL` setting. If Google sign-in is enabled, add the same frontend origin to the Google OAuth Web client.

## Documentation

Read [DOCUMENTATION.md](./DOCUMENTATION.md) for:

- component and file ownership
- API/service mappings
- authentication and analysis data flow
- chart and PDF architecture
- admin CMS and blog behavior
- instructions for adding pages, endpoints, dashboard sections, chart types, and other features
- testing, troubleshooting, and deployment notes
