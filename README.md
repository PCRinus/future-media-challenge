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
- **Docker** — required for PostgreSQL (and optional production builds)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start the database and dev servers (API + Web)
pnpm dev

# 4. Run migrations (in a separate terminal)
pnpm --filter api migration:up

# 5. Seed demo data (optional)
pnpm --filter api seed
```

The API will be available at [http://localhost:3167](http://localhost:3167) with Swagger docs at [http://localhost:3167/api](http://localhost:3167/api).

The web app will be available at [http://localhost:3000](http://localhost:3000).

## Production Build (Docker)

Build and run the full stack in production mode:

```bash
pnpm prod
```

This builds optimized Docker images for the API and web app and starts them alongside PostgreSQL.

## Running Tests

```bash
# All tests across the monorepo
pnpm test
```

## Common Commands

| Command                          | Description                                |
| -------------------------------- | ------------------------------------------ |
| `pnpm dev`                       | Start DB container + API + web in parallel |
| `pnpm dev:api`                   | Start only the API dev server              |
| `pnpm dev:web`                   | Start only the web dev server              |
| `pnpm db`                        | Start the PostgreSQL container             |
| `pnpm db:stop`                   | Stop all Docker containers                 |
| `pnpm prod`                      | Build & run production stack via Docker    |
| `pnpm prod:build`                | Build production Docker images only        |
| `pnpm test`                      | Run all tests                              |
| `pnpm lint`                      | Lint all packages                          |
| `pnpm format`                    | Format all files with Prettier             |
| `pnpm generate`                  | Regenerate OpenAPI spec + client types     |
| `pnpm --filter api seed`         | Seed demo data                             |
| `pnpm --filter api migration:up` | Run database migrations                    |

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable         | Description               | Default                                                      |
| ---------------- | ------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/future_media` |
| `JWT_SECRET`     | Secret for signing JWTs   | —                                                            |
| `JWT_EXPIRATION` | Token lifetime            | `1h`                                                         |
| `PORT`           | API server port           | `3167`                                                       |
| `CORS_ORIGIN`    | Allowed frontend origin   | `http://localhost:3000`                                      |

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
