# Boreal Staff Portal

The Boreal Staff Portal is a Vite-powered React + TypeScript application that provides the internal
operations team with a unified workspace. The scaffold includes connected API services, state
management, responsive layouts, and mobile/PWA primitives wired to the existing Staff App backend.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173) by default and expects
the Staff App backend to be available at `http://localhost:5000` (override with
`VITE_API_BASE_URL`).

## Available scripts

- `npm run dev` – Start the Vite development server.
- `npm run build` – Type-check and create a production build.
- `npm run lint` – Run the ESLint configuration included with the scaffold.
- `npm run preview` – Preview the production build locally.
- `npm run test` / `npm run test:ci` – Execute Vitest unit tests.
- `./smoke-test.sh` – Shell-based API smoke test that validates key endpoints and silo-aware headers.

## Project structure

```
staff-portal/
├─ public/                # Static assets, PWA manifest, service worker skeleton
├─ src/
│  ├─ components/         # Reusable UI primitives (cards, tables, modals, chatbot, etc.)
│  ├─ hooks/              # TanStack Query hooks, RBAC helpers, mobile/PWA utilities
│  ├─ layouts/            # App shell, navigation, protected route wrappers
│  ├─ pages/              # Route-level pages (dashboard, applications, pipeline, admin, AI, etc.)
│  ├─ services/           # Axios API clients with silo-aware headers and integrations
│  ├─ store/              # Zustand stores for auth, portal UI, data cache, and AI events
│  ├─ styles/             # Design tokens, global styles, responsive breakpoints, auth styles
│  ├─ mock/               # Mock data for forms, tables, and pipeline boards
│  ├─ pwa/                # Service worker registration and offline helpers
│  └─ types/              # Shared TypeScript types for backend contracts
└─ tests/                 # Placeholder smoke/spec tests ready for Playwright expansion
```

## Backend integration

All services share a pre-configured Axios client (`src/hooks/api/axiosClient.ts`) that injects the
current JWT token and the active silo (`BF`, `SLF`, or `BI`) via the `X-Silo` header. Service modules
implement typed wrappers for applications, documents, lenders, pipeline, communications, admin retry
queue, notifications, and health/build guard checks. TanStack Query hooks in `src/hooks/api/`
provide cache-aware data fetching and optimistic UI patterns.

## Authentication and RBAC

The login page supports password, passkey, and placeholder Office 365 OAuth flows. Auth state is
hydrated from local storage, and protected routes enforce module/permission access using RBAC rules
in `src/config/rbac.ts`. The silo-aware navigation adapts to the authenticated user, hiding modules
without the required permissions.

## AI, chatbot, and productivity tooling

AI service hooks cover OCR analysis, application summarization, risk scoring, and lender matching.
Captured AI events persist in the dedicated Zustand store for replay and analytics. The chatbot widget
includes quick actions such as “Talk to a Human” and “Report an Issue” to route escalations to the
communications center.

## Mobile, accessibility, and PWA features

The layout is mobile-first with responsive grids, keyboard-focus states, and WCAG-compliant color
contrast. Pipeline drag-and-drop supports touch sensors, and the service worker scaffold seeds
offline caching for shell routes and API responses. The PWA manifest, icon placeholders, and offline
queue utilities enable future installability and resilient submissions.

## Testing & QA

- `tests/smoke.test.ts` contains a Vitest smoke harness that exercises key API hooks.
- `tests/fixtures/` and `src/mock/` deliver reusable datasets for forms, tables, and kanban boards.
- `smoke-test.sh` can be used in CI to validate backend connectivity and silo-aware routing.
- Placeholders for Playwright/Jest e2e coverage are included via the test directory structure.

## Environment variables

Create a `.env` file with:

```
VITE_API_BASE_URL=http://localhost:5000
```

Additional OAuth or feature flag variables can be added as the backend contracts evolve.
