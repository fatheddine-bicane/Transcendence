# Why tRPC and TanStack Query

We use **tRPC** and **TanStack Query** (`@trpc/tanstack-react-query`) in the Next.js portals as the typed BFF API layer—without a separate hand-maintained HTTP client for every procedure.

| App | Path | Notes |
| --- | --- | --- |
| Patient portal | `frontend/apps/web` | Locale-aware validation via `next-intl` |
| Staff portal | `frontend/apps/internal` | English-only; same BFF shape; staff-only session gate |

## Goals

- Typed calls from UI → Next BFF without OpenAPI/codegen churn
- Server-only work (Nest proxy, cookies, headers) stays off the browser
- Shared Zod validation on client and server (locale messages on `web` only)
- One pattern for RSC prefetch and client mutations/queries

## tRPC

- **End-to-end types:** Router input/output (e.g. `auth.signIn`) stay in sync with Zod. The client imports `AppRouter`; mistyped inputs fail at compile time.
- **BFF boundary:** Browser talks to `/api/trpc` only. Procedures can call Nest, read/set cookies, and use request headers using server-only env (`API_URL`, etc.).
- **Validation:**
  - **web:** `localizedInput(createSchema)` with `next-intl` messages for `ctx.locale` (`validation.*` keys).
  - **internal:** plain Zod schemas with English messages (no `next-intl`).
- **RSC + client:** The same router works from `trpc/server.tsx` (caller, prefetch, hydrate) and from client components via `TRPCReactProvider`.

## Staff-only portal gate (`internal`)

Nest `POST /auth/sign-in` is shared and issues JWTs for any valid user. The internal portal enforces staff access at the BFF/UI boundary:

1. **`auth.signIn` / `auth.setAccessToken`:** decode Nest `user_type`; reject (no cookies) unless `internal`.
2. **`RequireAccess` on `/dashboard`:** require a non-expired access cookie **and** `user_type === internal`; wrong role clears cookies and redirects to `/`.

Future Nest staff APIs should still use `@RequiredUserTypes(UserType.INTERNAL)` as the API authority.

## TanStack Query

- **Mutation/query lifecycle:** Caching, deduping, retries, and status (`isPending`, error) without custom `useEffect` + `fetch` state in each screen.
- **Portal data pattern:** Lists and detail views invalidate/refetch through query keys instead of ad-hoc reloads.
- **tRPC integration:** `useTRPC()` exposes query/mutation options that plug into `useQuery` / `useMutation` under the layout provider.

## How they fit together

| Layer | Role |
| --- | --- |
| TanStack Form + Zod | Client UX validation |
| tRPC (+ `localizedInput` on web) | Server re-validation |
| TanStack Query | Run procedures, track pending/error, cache results |
| Nest | Auth/data; called only from tRPC/RSC server code |
