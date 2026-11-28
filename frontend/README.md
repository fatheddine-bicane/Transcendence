# Frontend

Turborepo + npm workspaces monorepo for Nafs portals. Apps share lint/TS/Prettier config and UI via `@repo/*` packages.

## Structure

```
frontend/
├── apps/
│   ├── web/        # Patient portal (Next.js, port 3001)
│   └── internal/   # Staff portal (Next.js, port 3002)
└── packages/
    ├── api/        # Shared Nest env, apiFetch/apiFetchAuth, auth cookies/session
    ├── constants/  # Shared portal constants (re-exported from each app)
    ├── eslint-config/
    ├── prettier-config/
    ├── typescript-config/
    └── ui/         # Shared theme, primitives, and forms
```

## Requirements

- Node.js 24.x
- npm `11.20.0` (see `devEngines` in root `package.json`)

## Setup

```bash
cd frontend
npm ci
```

Copy env for each app that talks to Nest:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/internal/.env.example apps/internal/.env.local
```

`API_URL` should point at the Nest API (default `http://localhost:3000`).

`internal` uses the same tRPC BFF auth pattern as `web` (English-only, no i18n) and only accepts sessions with JWT `user_type === internal`. See [docs/frontend/trpc-and-tanstack-query.md](../docs/frontend/trpc-and-tanstack-query.md).

## Scripts

From `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start all apps that define `dev` |
| `npm run build` | Build all apps (`API_URL` required for `web` and `internal`) |
| `npm run lint` | Lint via Turbo |
| `npm run format` | Format via Turbo |

Single app:

```bash
npm run dev --workspace=web
npm run dev --workspace=internal
```

## Packages

| Package | Role |
| --- | --- |
| `@repo/api` | Shared Nest `env`, `apiFetch` / `apiFetchAuth`, auth cookies/session |
| `@repo/constants` | Shared auth/tRPC path + cookie constants (`@repo/constants/server` for server-only) |
| `@repo/eslint-config` | Flat ESLint configs (`next`, `library`) |
| `@repo/typescript-config` | Shared `tsconfig` bases |
| `@repo/prettier-config` | Shared Prettier + Tailwind plugin |
| `@repo/ui` | Theme CSS, UI primitives, TanStack Form helpers |

Import fetch helpers from `@repo/api/fetch` (no local re-export). Constants stay behind local `@/lib/constants*` re-exports for app overrides. UI: `@repo/ui/components/ui/button` and `@repo/ui/styles.css`. Next apps must set `transpilePackages: ['@repo/api', '@repo/constants', '@repo/ui']`.
