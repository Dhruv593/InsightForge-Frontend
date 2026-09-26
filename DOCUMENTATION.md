# Tatparya Web — Engineering Documentation

This document explains the frontend from end to end: how requests move through the application, which file owns each feature, and where to make changes when extending Tatparya.

## 1. Architecture at a glance

```text
Browser
  └─ React Router (`src/App.jsx`)
      ├─ Public pages: landing, auth, legal, blog
      ├─ Protected workspace and account pages
      └─ Owner pages: admin CMS and monitoring
          ↓
React page/component state
          ↓
Service modules (`src/services/*`)
          ↓
Shared Axios client (`src/services/api.js`)
          ↓ HTTPS + Bearer access token
Tatparya FastAPI `/api/v1`
```

The frontend does not calculate analytical results. It renders API-owned messages, reports, evidence-derived chart specifications, and safe execution statuses. Raw dataset processing and LLM orchestration belong to the backend.

## 2. Entry points and providers

| File | Responsibility |
| --- | --- |
| `src/main.jsx` | Mounts React and imports global styles |
| `src/App.jsx` | Defines every browser route and installs global providers |
| `src/context/AuthContext.jsx` | Restores sessions, exposes the current user, and handles login/logout state |
| `src/context/ToastContext.jsx` | Global success/error/info toasts with timed and manual dismissal |
| `src/components/common/AppErrorBoundary.jsx` | Last-resort UI when a React render fails |
| `src/styles.css` | Tailwind import, theme tokens, fonts, global focus rules, and animations |

Provider order in `App.jsx` is:

```text
BrowserRouter → ToastProvider → AuthProvider → Routes
```

Any component under these providers can navigate, show a toast, and access authenticated user state.

## 3. Route ownership

All routes are declared in `src/App.jsx`.

| Route | Page component | Access |
| --- | --- | --- |
| `/` | `pages/LandingPage.jsx` | Public; authenticated users normally redirect to the dashboard |
| `/login`, `/register` | `pages/AuthPage.jsx` | Public |
| `/forgot-password`, `/reset-password`, `/verify-email` | `pages/AccountRecoveryPage.jsx` | Public |
| `/privacy`, `/terms` | `pages/LegalPage.jsx` | Public |
| `/blog` | `pages/BlogListPage.jsx` | Public when blog visibility is enabled |
| `/blog/:slug` | `pages/BlogDetailPage.jsx` | Public published article |
| `/dashboard` | `pages/DashboardPage.jsx` | Authenticated |
| `/dashboard/datasets/:datasetId` | `pages/DashboardPage.jsx` | Authenticated |
| `/dashboard/conversations/:conversationId` | `pages/DashboardPage.jsx` | Authenticated |
| `/account` | `pages/AccountPage.jsx` | Authenticated |
| `/admin` | `pages/AdminDashboardPage.jsx` | Owner/admin |
| `/admin/landing-content/:section?` | `pages/LandingContentPage.jsx` | Owner/admin |
| `/admin/blogs` | `pages/AdminBlogsPage.jsx` | Owner/admin |
| `/admin/contacts` | `pages/AdminContactsPage.jsx` | Owner/admin contact inbox and email replies |
| `/monitoring` | `pages/MonitoringPage.jsx` | Owner/admin |
| `*` | `pages/NotFoundPage.jsx` | Public 404 |

`routes/ProtectedRoute.jsx` restores the session and blocks unauthenticated access. Individual admin pages additionally check `user.is_admin`; the backend repeats that authorization check.

## 4. API and authentication flow

### Axios client

`src/services/api.js` creates the shared Axios instance.

- Reads `VITE_API_BASE_URL`.
- Adds `Authorization: Bearer <access-token>` to authenticated requests.
- On an eligible `401`, performs one refresh request and retries the original request once.
- Deduplicates simultaneous refresh attempts with `refreshPromise`.
- Clears local auth state when refresh fails.
- Converts structured backend errors through `getApiError()`.

Tokens are encapsulated by `src/utils/authStorage.js`. Components should not read or write browser storage directly.

### Authentication files

| File | Purpose |
| --- | --- |
| `services/authService.js` | Register, login, Google challenge/login, current user, logout |
| `services/accountService.js` | Profile, password, sessions, verification, reset, account deletion |
| `components/GoogleSignIn.jsx` | Loads and renders Google Identity Services |
| `pages/AuthPage.jsx` | Login and registration UI |
| `pages/AccountRecoveryPage.jsx` | Email verification and password reset flows |
| `pages/AccountPage.jsx` | Authenticated account management |

Google sign-in uses a backend-created nonce cookie. The browser sends the Google credential to `/auth/google`; no Google client secret belongs in this repository.

## 5. Dashboard data flow

`pages/DashboardPage.jsx` is the workspace route shell. `hooks/useDashboardWorkspace.js` owns dataset, profile, conversation, message, run, queue, polling, and result-loading state. Focused UI is delegated to domain components such as `components/datasets/DatasetLibrary.jsx` and `components/conversations/NewAnalysisFields.jsx`.

### Dataset flow

```text
Upload control
  → datasetService.upload(file)
  → POST /datasets
  → refresh dataset list
  → navigate to /dashboard/datasets/:datasetId
  → profileService.create(datasetId)
  → POST /datasets/:datasetId/profile
  → DatasetProfile renders the stored profile
```

Files involved:

- `services/datasetService.js`: upload/list/get/delete.
- `services/profileService.js`: create/get deterministic profiles.
- `components/datasets/DatasetProfile.jsx`: summary, quality notes, and column details.
- `components/layout/Sidebar.jsx`: datasets and recent analyses.

### Conversation and query flow

```text
Create conversation
  → POST /conversations
  → navigate to conversation route

Submit question
  → POST /conversations/:id/query
  → receive user message + pending analysis run
  → queue notification appears
  → browser polls run/queue/agent status
  → completed run triggers message/report/chart reload
```

Files involved:

- `services/conversationService.js`: conversation CRUD and messages.
- `services/analysisService.js`: query, queue, retry, cancel, runs, agents, claims, charts, reports.
- `components/conversations/ConversationWorkspace.jsx`: conversation layout.
- `components/conversations/MessageList.jsx`: chronological user and assistant messages.
- `components/query/QueryBox.jsx`: autosizing query input and provider selection.
- `components/questions/QuestionNavigator.jsx`: right-side question history.
- `components/layout/AppHeader.jsx`: active queue and account menus.

The frontend polls only safe stage/status information. It does not display private chain-of-thought or raw prompts.

### Result loading

For each completed analysis run, `useDashboardWorkspace.js` loads the persisted report and charts. Presentation is delegated to:

| File | Responsibility |
| --- | --- |
| `components/results/AnalysisCanvas.jsx` | Overall result dashboard layout |
| `components/results/AnalysisResult.jsx` | Result sections and empty/failure handling |
| `components/results/KPIGrid.jsx` | Prioritized KPI cards |
| `components/results/SupportingVisuals.jsx` | Responsive chart grid and expanded chart UI |
| `components/charts/ChartRenderer.jsx` | Plotly rendering from the controlled chart specification |
| `components/charts/chartFigure.js` | Converts backend chart types/data into Plotly traces and layout |
| `utils/resultFormatting.js` | Display-safe number/text formatting |
| `utils/reportLanguage.js` | Converts technical warnings into business-readable language |
| `utils/dashboardReport.js` | Derives dashboard presentation content from saved results |

## 6. Charts and PDF reports

The backend returns chart specifications and verified values. `chartFigure.js` maps those specifications to local Plotly configuration. Never execute JavaScript received from the API.

PDF files are generated client-side from the same saved report and chart specifications used by the screen:

- `components/results/ReportPdfPreview.jsx`: preview modal and download action.
- `utils/reportPdf.js`: jsPDF document composition.
- `utils/dashboardReport.js`: normalized dashboard/report content.
- `components/charts/chartFigure.js`: shared figure definition so screen and PDF chart types remain consistent.

When adding a chart type, update both rendering and report export paths and add a regression case in `tests/reportPresentation.test.js`.

## 7. Landing page and CMS

### Public rendering

`pages/LandingPage.jsx` fetches `/site-content/landing`, merges it with defaults, filters disabled sections, and composes the public page. Stateful sections and shared presentation elements live in `components/landing/`; default content and the recursive normalizer remain in `content/landingContent.js`.

Landing sections are:

- navigation
- hero
- how it works
- product preview
- platform
- FAQ
- closing call to action
- footer

Each section has an `enabled` value. Disabling a section also removes matching anchor links from the public navigation.

### Admin editing

- `components/admin/AdminShell.jsx` owns the admin sidebar and nested landing-section navigation.
- `pages/LandingContentPage.jsx` owns loading, publishing, ordering, and upload actions.
- `components/admin/landing/LandingSectionEditor.jsx` renders the selected section editor.
- `components/admin/landing/LandingEditorFields.jsx` contains the reusable editor controls.
- `services/siteContentService.js` calls the public and admin CMS endpoints.

The product-preview editor uploads images through the backend. Do not add Cloudinary credentials to the client.

## 8. Blog

| File | Responsibility |
| --- | --- |
| `pages/BlogListPage.jsx` | Lists published posts |
| `pages/BlogDetailPage.jsx` | Renders one structured article |
| `pages/AdminBlogsPage.jsx` | Visibility switch and post CRUD |
| `components/blog/BlogHeader.jsx` | Shared public blog header/footer |
| `services/siteContentService.js` | Blog API methods |

Posts contain structured headings and bodies rather than arbitrary HTML. This keeps rendering predictable and avoids injecting untrusted markup.

The public blog switch is stored with landing content. When disabled:

- the Blog link is removed from landing navigation/footer;
- `/blog` and `/blog/:slug` redirect to `/` in the client;
- the backend independently rejects public blog API requests.

## 9. Monitoring and administration

- `pages/AdminDashboardPage.jsx`: overview of landing content, posts, users, and analyses.
- `pages/AdminContactsPage.jsx`: contact totals, status filters, inquiry details, and templated email replies.
- `pages/MonitoringPage.jsx`: owner-only API/database status, provider reliability, agent activity, and recent failures.
- `components/admin/AdminShell.jsx`: shared admin chrome.

Admin status is delivered by `/auth/me`. It is derived from the backend `ADMIN_EMAILS` configuration and must not be assigned by client code.

## 10. Component and utility map

### Common UI

| File | Purpose |
| --- | --- |
| `components/common/BrandLogo.jsx` | Chooses the correct Tatparya logo asset |
| `components/common/Modal.jsx` | Reusable confirmation/input modal |
| `components/common/Seo.jsx` | Per-route title, description, canonical, and robots metadata |
| `components/common/Spinner.jsx` | Loading indicator |
| `components/common/ErrorMessage.jsx` | Inline error presentation |
| `components/layout/DockPanel.jsx` | Collapsible desktop side panel |
| `hooks/usePersistentState.js` | Local-storage-backed UI preferences |

### Public assets

| Path | Purpose |
| --- | --- |
| `public/brand/` | Tatparya logo variations |
| `public/*-preview.png` | Landing-page product screenshots |
| `public/favicon.svg` | Browser/site icon |

### SEO and hosting

- `scripts/generate-seo.mjs`: creates `dist/robots.txt`, `dist/sitemap.xml`, canonical metadata, and social URLs after build.
- `vercel.json`: SPA rewrites plus CSP, HSTS, frame, referrer, content-type, and permissions headers.
- `vite.config.ts`: React, Tailwind, local COOP configuration, and build plugins.

## 11. Adding a feature

### Add a new public page

1. Create `src/pages/NewPage.jsx`.
2. Add the route in `src/App.jsx`.
3. Add `Seo` metadata.
4. Add the route to navigation only where appropriate.
5. If it should be indexed, add its path to `scripts/generate-seo.mjs`.
6. Add API calls to a service module rather than calling Axios from multiple components.

### Add a protected dashboard feature

1. Add the backend endpoint first.
2. Add a method to the relevant `src/services/*Service.js` module.
3. Put workspace loading or polling in `hooks/useDashboardWorkspace.js`; keep route composition in `DashboardPage.jsx` and feature UI in a focused component.
4. Put reusable visuals under `src/components/<feature>/`.
5. Use `getApiError()` and `ToastContext` for failures/success.
6. Test empty, loading, error, mobile, and unauthorized states.

### Add an API resource

Create or extend a service module:

```js
// src/services/exampleService.js
import { api } from './api';

export const exampleService = {
  list: () => api.get('/examples').then(({ data }) => data),
  create: (payload) => api.post('/examples', payload).then(({ data }) => data),
};
```

Do not create a second Axios instance for authenticated application calls; doing so bypasses refresh and error behavior.

### Add a landing-page section

1. Add the default object to `content/landingContent.js`.
2. Add its Pydantic schema and field to the backend `app/schemas/site_content.py`.
3. Create its public component in `components/landing/` and compose it in `pages/LandingPage.jsx`.
4. Add its subtab to `components/admin/AdminShell.jsx`.
5. Add its editor to `components/admin/landing/LandingSectionEditor.jsx`.
6. If the section has an anchor, update the anchor-to-section filter in `LandingPage.jsx`.
7. Verify old saved content still works through the recursive normalizer/defaults.

### Add a chart type

1. Add/confirm the backend whitelist and chart schema.
2. Extend `components/charts/chartFigure.js`.
3. Verify `ChartRenderer.jsx` on desktop, tablet, and mobile.
4. Verify `utils/reportPdf.js` preserves the same type and colors.
5. Add tests to `tests/reportPresentation.test.js`.

### Add an admin page

1. Create the page under `src/pages/`.
2. Add a protected route in `src/App.jsx`.
3. Add a navigation item to `components/admin/AdminShell.jsx`.
4. Check `user.is_admin` in the page.
5. Require `AdminUser` on every corresponding backend endpoint.

## 12. Styling and responsive rules

- Use Tailwind utilities directly in JSX, consistent with the existing codebase.
- Reuse the brand tokens from `styles.css`.
- Keep Plus Jakarta Sans as the default interface font.
- Begin with the 320 px mobile layout, then verify 768 px tablet and desktop.
- Add `min-w-0`, wrapping, and overflow rules inside grid/flex children that display filenames, questions, or article titles.
- Keep interactive controls keyboard accessible and preserve visible focus states.
- Respect `prefers-reduced-motion` for nonessential motion.
- Avoid exposing technical agent details in customer-facing text.

## 13. Testing and quality checks

Run before pushing:

```powershell
npm run lint
npm run build
node --test tests/*.test.js
```

Current tests cover dashboard content prioritization, readable result formatting, cautious recommendations, and chart/PDF consistency.

For manual verification, test at least:

- 320 px mobile, 768 px tablet, and desktop widths
- login, token refresh, logout, and Google sign-in
- dataset upload/profile and long filenames
- query queue, cancellation, retry, failure recovery, and completed results
- every supported chart type plus PDF preview/download
- landing section toggles and blog visibility
- draft versus published blog behavior
- owner and non-owner access to admin routes

## 14. Deployment checklist

1. Set production environment variables in Vercel.
2. Set the backend `FRONTEND_URL` to the exact deployed origin.
3. Run `npm run build` locally.
4. Confirm generated `dist/robots.txt` and `dist/sitemap.xml` contain the production domain.
5. Confirm Google OAuth authorized JavaScript origins include the production frontend.
6. Test direct navigation to nested routes; `vercel.json` must rewrite them to `index.html`.
7. Verify CSP still permits any deliberately added external image, font, script, frame, or API origin.

## 15. Troubleshooting

### Blank page

- Inspect the browser console and network tab.
- Confirm `VITE_API_BASE_URL` exists at build time.
- Confirm the route is declared in `App.jsx`.
- Check whether `AppErrorBoundary` displayed or logged a render error.

### Repeated 401 responses

- Confirm access and refresh tokens exist through `authStorage`.
- Verify backend JWT settings did not change between issuing and refreshing tokens.
- Confirm `/auth/refresh` is reachable and the account session is not revoked.

### Google button missing

- Set `VITE_GOOGLE_SIGN_IN_ENABLED=true`.
- Configure `GOOGLE_CLIENT_ID` on the backend.
- Use matching `localhost` or matching `127.0.0.1` hostnames rather than mixing them.
- Add the exact origin to Google Cloud authorized JavaScript origins.

### Charts visible on screen but wrong in PDF

- Compare the saved chart specification passed to `ChartRenderer` and `reportPdf`.
- Keep chart-type mapping centralized in `chartFigure.js`.
- Add a regression test before changing chart conversion logic.

### CMS changes not visible

- Ensure the admin clicked Publish/Save.
- Confirm the backend content migration has been applied.
- Inspect `/api/v1/site-content/landing` or `/api/v1/blogs`.
- Remember that drafts do not appear publicly and the global blog switch can disable all public blog access.
