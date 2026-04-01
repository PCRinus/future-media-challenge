# Future Media Challenge

A message-board application built as a pnpm monorepo with a **NestJS** API and a **Next.js** frontend.

See [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions, structure reasoning, and future improvements.

## Prerequisites

- **Node.js v24** — pinned via `.nvmrc`. Install via [nvm](https://github.com/nvm-sh/nvm):
  ```bash
  nvm install
  ```
- **pnpm 10** — install via corepack:
  ```bash
  corepack enable && corepack prepare pnpm@latest --activate
  ```
- **Docker** — required for the database and recommended for the full dev stack

## Quick Start (Docker)

The fastest way to get everything running:

```bash
# 1. Clone and install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start PostgreSQL + API + pgAdmin
pnpm dev

# 4. Run migrations (in a separate terminal)
docker compose exec api pnpm migration:up

# 5. Seed demo data (optional)
docker compose exec api pnpm seed
```

The API will be available at [http://localhost:3167](http://localhost:3167) with Swagger docs at [http://localhost:3167/api](http://localhost:3167/api).

pgAdmin is available at [http://localhost:5050](http://localhost:5050) (login: `admin@admin.com` / `admin`).

### With file watching (auto-sync + rebuild)

```bash
pnpm dev:watch
```

### Rebuild containers after dependency changes

```bash
pnpm dev:build
```

## Local Development (without Docker)

If you prefer running the API directly on your host:

```bash
# Ensure PostgreSQL is running locally and .env is configured
cp .env.example .env

# Install and start
pnpm install
pnpm --filter api migration:up
pnpm --filter api start:dev
```

## Running Tests

```bash
# API unit tests
pnpm test:api

# All tests across the monorepo
pnpm test
```

## Common Commands

| Command                          | Description                              |
| -------------------------------- | ---------------------------------------- |
| `pnpm dev`                       | Start full stack via Docker Compose      |
| `pnpm dev:watch`                 | Start with file watching (auto-sync)     |
| `pnpm dev:build`                 | Rebuild containers and start             |
| `pnpm test:api`                  | Run API unit tests                       |
| `pnpm test`                      | Run all tests                            |
| `pnpm lint`                      | Lint all packages                        |
| `pnpm format`                    | Format all files with Prettier           |
| `pnpm generate`                  | Regenerate OpenAPI spec + client types   |
| `pnpm --filter api seed`         | Seed demo data                           |
| `pnpm --filter api migration:up` | Run database migrations                  |

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable       | Description                 | Default                                          |
| -------------- | --------------------------- | ------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection URL   | `postgresql://postgres:postgres@localhost:5432/future_media` |
| `JWT_SECRET`   | Secret for signing JWTs     | —                                                |
| `JWT_EXPIRATION` | Token lifetime            | `1h`                                             |
| `PORT`         | API server port             | `3167`                                           |
| `CORS_ORIGIN`  | Allowed frontend origin     | `http://localhost:3000`                           |

## Project Structure

```
future-media-challenge/
├── apps/
│   ├── api/          # NestJS backend (REST API)
│   └── web/          # Next.js frontend
├── docker-compose.yml
├── ARCHITECTURE.md   # Design decisions & reasoning
├── REQUIREMENTS.md   # Challenge specification
└── pnpm-workspace.yaml
```
