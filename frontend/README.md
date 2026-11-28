# Frontend

Turborepo + npm workspaces monorepo for Nafs portals. Apps share lint/TS/Prettier config and UI via `@repo/*` packages.

## Structure

```
frontend/
├── apps/
│   ├── web/        # Patient portal (Next.js, port 3001)
│   └── internal/   # Staff portal (Next.js, port 3002)
└── packages/
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

Copy env for the patient app:

```bash
cp apps/web/.env.example apps/web/.env.local
```

`API_URL` should point at the Nest API (default `http://localhost:3000`).

## Scripts

From `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start all apps that define `dev` |
| `npm run build` | Build all apps (`API_URL` required for `web`) |
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
| `@repo/eslint-config` | Flat ESLint configs (`next`, `library`) |
| `@repo/typescript-config` | Shared `tsconfig` bases |
| `@repo/prettier-config` | Shared Prettier + Tailwind plugin |
| `@repo/ui` | Theme CSS, UI primitives, TanStack Form helpers |

Apps import UI like `@repo/ui/components/ui/button` and theme via `@repo/ui/styles.css`. Next apps must set `transpilePackages: ['@repo/ui']`.
