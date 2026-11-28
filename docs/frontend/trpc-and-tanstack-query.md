# Why tRPC and TanStack Query

We use **tRPC** and **TanStack Query** (`@trpc/tanstack-react-query`) in `frontend/apps/web` as the typed portal API layer inside Next.js—without a separate hand-maintained HTTP client for every procedure.

## Goals

- Typed calls from UI → Next BFF without OpenAPI/codegen churn
- Server-only work (Nest proxy, cookies, headers) stays off the browser
- Shared Zod validation with locale-aware messages on client and server
- One pattern for RSC prefetch and client mutations/queries

## tRPC

- **End-to-end types:** Router input/output (e.g. `auth.signIn`) stay in sync with Zod. The client imports `AppRouter`; mistyped inputs fail at compile time.
- **BFF boundary:** Browser talks to `/api/trpc` only. Procedures can call Nest, read/set cookies, and use request headers using server-only env (`API_URL`, etc.).
- **Locale-aware validation:** `localizedInput(createSchema)` runs the same schema factory as TanStack Form, with `next-intl` messages for `ctx.locale` (`validation.*` keys). Client and server stay aligned.
- **RSC + client:** The same router works from `trpc/server.tsx` (caller, prefetch, hydrate) and from client components via `TRPCReactProvider`.

## TanStack Query

- **Mutation/query lifecycle:** Caching, deduping, retries, and status (`isPending`, error) without custom `useEffect` + `fetch` state in each screen.
- **Portal data pattern:** After auth is wired, lists and detail views can invalidate/refetch through query keys instead of ad-hoc reloads.
- **tRPC integration:** `useTRPC()` exposes query/mutation options that plug into `useQuery` / `useMutation` under the existing locale layout provider.

## How they fit together

| Layer | Role |
| --- | --- |
| TanStack Form + Zod | Client UX validation (`useSignInSchema`) |
| tRPC + `localizedInput` | Server re-validation with the same schema factory |
| TanStack Query | Run procedures, track pending/error, cache results |
| Nest (later) | Real auth/data; called only from tRPC/RSC server code |
