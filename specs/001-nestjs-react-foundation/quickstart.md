# Quickstart: NestJS + React Project Foundation

**Feature**: 001-nestjs-react-foundation
**Target audience**: Developer who just cloned the repository

---

## Prerequisites

| Tool | Min Version | Install |
|------|------------|---------|
| Docker Desktop (or Engine + Compose) | ≥ 24 | https://docs.docker.com/get-docker/ |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Node.js | ≥ 20 LTS | https://nodejs.org |
| Git | ≥ 2.40 | https://git-scm.com |

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/<your-org>/nestjs-scaffolding-dashboard.git
cd nestjs-scaffolding-dashboard
pnpm install          # installs both backend and frontend workspaces
```

---

## Step 2 — Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in **required** values:

```dotenv
# Required — must be set before starting
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scaffolding_dev
JWT_ACCESS_SECRET=change-me-to-a-random-32-char-string-at-minimum
JWT_REFRESH_SECRET=change-me-to-another-random-32-char-string

# Required — Redis
REDIS_URL=redis://localhost:6379

# Optional — defaults shown
PORT=3000
NODE_ENV=development
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

> ⚠️ **Never commit `.env`**. It is listed in `.gitignore`. Use `.env.example` for documentation.

---

## Step 3 — Start All Services

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on port 5432
- **Redis 7** on port 6379
- **NestJS backend** on port 3000 (with hot-reload)
- **React frontend** on port 5173 (Vite dev server)

Wait 30–60 seconds for all services to become healthy, then:

```bash
docker-compose ps        # all services should show "healthy"
```

---

## Step 4 — Run Database Migration

```bash
pnpm --filter backend prisma migrate dev --name init
```

This creates the `users` table (with soft-delete column).

---

## Step 5 — Verify the System

### Backend health check

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "System is healthy",
  "data": { "status": "ok", "db": "ok", "redis": "ok" }
}
```

### Swagger UI

Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs) in your browser.

### Frontend

Open [http://localhost:5173](http://localhost:5173) — you should be redirected to `/login`.

---

## Development Workflow

### Backend only (no Docker)

```bash
# Start Postgres + Redis via Docker, then:
pnpm --filter backend run start:dev
```

### Frontend only

```bash
pnpm --filter frontend run dev
```

### Run all tests

```bash
pnpm --filter backend run test          # unit tests
pnpm --filter backend run test:e2e      # e2e tests (requires running Postgres + Redis)
pnpm --filter backend run test:cov      # coverage report
```

### Lint + format

```bash
pnpm lint        # runs ESLint across all workspaces
pnpm format      # Prettier write
```

---

## Stopping Services

```bash
docker-compose down           # stop but preserve volumes (DB data)
docker-compose down -v        # stop AND delete volumes (clean slate)
```

---

## Production Build

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

> **Note**: The production frontend is compiled to static assets. Configure a CDN or
> static file host separately. Reverse proxy (nginx/Traefik) is not configured in Sprint 1.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `DATABASE_URL` validation error on startup | Missing or malformed value in `.env` | Check `.env` against `.env.example`; ensure no spaces around `=` |
| `health/db` returns `"db": "error"` | PostgreSQL not ready | Wait 30s; run `docker-compose ps` to check health |
| Port 3000 already in use | Another process on 3000 | Change `PORT` in `.env` and update `docker-compose.yml` |
| `pnpm: command not found` | pnpm not installed | Run `npm install -g pnpm` |
| Hot-reload not working | Docker volume mount path wrong | Ensure Docker Desktop has access to the project directory |
