# Local backend with Docker Compose Postgres

Run the Nest API against the Postgres (and Adminer) stack defined in `backend/docker-compose.yml`.

## Prerequisites

- Node.js (same major as the project)
- Docker + Docker Compose
- Working directory: `backend/`

## 1. Configure `.env`

```bash
cp .env.example .env
```

Use values that match the Compose service. Example:

```env
# postgres container (read by docker compose)
POSTGRES_USER=transcendance
POSTGRES_PASSWORD=transcendance
POSTGRES_DB=transcendance

# Prisma / Nest connection string (host port published by compose)
DATABASE_URL=postgresql://transcendance:transcendance@localhost:5432/transcendance

MAX_POOL_CONNECTIONS=10
MIN_POOL_CONNECTIONS=2

JWT_SECRET_KEY=dev-only-change-me
NODE_ENV=development
```

`DATABASE_URL` must use the same user, password, and database as `POSTGRES_*`. Host is `localhost` and port is `5432` because Compose maps the container port to the host.

## 2. Start the database

From `backend/`:

```bash
docker compose up -d
```

This starts:

| Service  | URL / port              | Purpose              |
| -------- | ----------------------- | -------------------- |
| `db`     | `localhost:5432`        | PostgreSQL 18        |
| `adminer`| http://localhost:8080   | DB UI (optional)     |

Check that Postgres is up:

```bash
docker compose ps
```

In Adminer, connect with:

- System: **PostgreSQL**
- Server: **db** (Compose service name; from the host you can also use `localhost`)
- Username / password / database: the `POSTGRES_*` values from `.env`

## 3. Install, migrate, generate

```bash
npm install
npx prisma migrate dev
npx prisma generate
```

## 4. Seed (optional)

Creates 3 internals, 3 counselors, and 3 patients. Shared password: `Password123!`.

```bash
npm run db:seed
```

Example logins:

- `internal1@example.com`
- `counselor1@example.com`
- `patient1@example.com`

## 5. Run the API

```bash
npm run start:dev
```

Nest loads `.env` and watches for changes. Default API base: `http://localhost:3000`.

## Useful commands

```bash
# stop containers (keeps volume / data)
docker compose stop

# stop and remove containers (keeps named volume)
docker compose down

# wipe DB data as well
docker compose down -v

# re-seed after a reset
npx prisma migrate dev
npm run db:seed
```

## Troubleshooting

- **Connection refused on `5432`:** wait for Postgres to finish starting (`docker compose logs db`), or confirm nothing else is bound to that port.
- **Auth failed / unknown database:** `.env` `POSTGRES_*` must match `DATABASE_URL`. Changing `POSTGRES_*` after the first `up` does not update an existing volume — use `docker compose down -v` and start again if you need new credentials.
- **Adminer “Unable to connect” with server `localhost`:** from inside the Adminer container, use server name `db` (the Compose service name).
