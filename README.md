# Tatparya frontend

React and Vite frontend for the Tatparya API. It uses Plus Jakarta Sans typography and inline Tailwind utility classes for the complete responsive interface.

## Requirements

- Node.js 22.13 or newer
- The Tatparya FastAPI backend configured and running

## Setup

```bash
cd client
npm install
```

Copy `.env.example` to `.env` and point it at the backend API:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

The backend normally runs from `server/` with:

```bash
python -m uvicorn app.main:app --reload
```

## Routes

- `/` — public landing page
- `/login` — account login
- `/register` — account registration
- `/dashboard` — protected workspace
- `/dashboard/datasets/:datasetId` — selected dataset
- `/dashboard/conversations/:conversationId` — selected conversation

## Implemented features

- Persistent access and refresh tokens with centralized local storage
- Automatic one-time access-token refresh and request retry
- Session restoration with `/auth/me`
- Protected dashboard routes and logout
- Dataset upload, selection, listing, and deletion
- Deterministic profile creation and compact profile summaries
- Conversation creation, selection, rename, and deletion
- Chronological message history
- Gemini/Groq provider selection, pending-run creation, and execution
- Backend-authoritative assistant message and analysis-run refresh after execution
- Stage 8 evidence-grounded analytical responses with completed runs labeled `Analysis complete`
- Stage 9 structured reports with compact data notes and optional recommendations
- Interactive Plotly charts rendered only from backend-verified chart data
- Friendly structured API errors and responsive loading/empty states

After query creation, the frontend executes the returned run ID without resending the provider. While that request is open it displays `Analyzing…`; afterward it reloads message history and run state from the backend. Failures show a concise safe error and are never retried automatically. Stage 6 returned only an infrastructure acknowledgement and generated no fake analysis in the browser.

Stage 8 replaces the plan-only response with persisted results calculated by controlled Pandas, DuckDB, and SciPy tools. The UI remains conversational and does not expose raw evidence JSON, p-value tables, agent prompts, token usage, or latency.

During execution, the chat polls safe agent-run statuses and displays user-facing progress such as understanding the question, reviewing verified dataset context, building the plan, calculating evidence, and validating statistics. These labels reflect persisted workflow stages and never expose private model reasoning.

Completed Stage 9 runs load their persisted report and chart specifications from ownership-protected APIs. `ChartRenderer.jsx` maps only the controlled backend chart whitelist to locally defined Plotly traces; it does not execute backend JavaScript. The Supporting Visuals section is omitted when no charts are returned, while report data notes, limitations, and recommendations are shown as compact result sections. The conversation does not expose claims, Critic internals, raw evidence, tool inputs, or agent logs.
