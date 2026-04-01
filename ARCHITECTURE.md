# Architecture

## Overview

A message-board application built as a **pnpm monorepo** with a **NestJS** API backend and a **Next.js** frontend. This document covers the API layer — the primary focus of the current implementation.

## Project Structure

```
future-media-challenge/
├── apps/
│   ├── api/              # NestJS backend (REST API)
│   │   └── src/
│   │       ├── auth/     # Authentication (register, login, JWT)
│   │       ├── health/   # Health check endpoint
│   │       ├── message/  # Message CRUD + filtering + pagination
│   │       ├── tag/      # Tag management
│   │       ├── user/     # User profile (GET /users/me)
│   │       ├── migrations/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── mikro-orm.config.ts
│   │       └── seed.ts
│   └── web/              # Next.js frontend
├── docker-compose.yml
├── .env.example
└── pnpm-workspace.yaml
```

## Architecture Decisions

### Domain-Sliced Modules

Each domain concept (auth, user, message, tag, health) lives in its own NestJS module with co-located controller, service, DTOs, and entity. This keeps related code together and makes it easy to reason about each feature in isolation.

The pattern is **controller → service → EntityManager** — a lightweight variant of the repository pattern where MikroORM's `EntityManager` serves as the data-access layer directly, avoiding unnecessary repository abstractions for a project of this scale.

### MikroORM v7 with `defineEntity`

Chose MikroORM v7 for its first-class TypeScript support and the new `defineEntity` + property-builder API. This approach avoids decorator-based entity definitions (decorators were removed in v7) and provides excellent type inference without duplication.

Entities use UUID v7 primary keys — these are time-sortable, which aligns with cursor-based pagination needs without requiring a separate sequence column.

### Authentication: Passport.js + JWT

- **Passport.js** with a JWT strategy for stateless authentication
- **argon2** for password hashing (OWASP-recommended, resistant to GPU attacks)
- Access tokens only — no refresh tokens. A reasonable simplification for a challenge scope; refresh token rotation would be the logical next step

The JWT payload contains `{ sub: userId, email }`. Protected routes use a reusable `JwtAuthGuard`.

### Cursor-Based Pagination

Messages use cursor-based pagination with a composite cursor of `(createdAt, id)`. This provides:

- **Stable ordering** — new inserts don't shift pages (unlike offset-based)
- **Consistent performance** — doesn't degrade as offset grows
- **Natural infinite-scroll support** — the frontend just passes the `nextCursor` value

The cursor is encoded as `{ISO timestamp}_{uuid}` and decoded server-side into a `$or` query for "less than createdAt OR (equal createdAt AND less than id)".

### Filtering

Messages support four optional filters that combine additively:

- `tagId` — filter by tag
- `userId` — filter by author
- `dateFrom` / `dateTo` — date range on `createdAt`

All filters are validated via `class-validator` and `class-transformer` (with `@Type(() => Date)` for automatic date coercion).

### Ownership Enforcement

Only the author can update or delete their own messages. This is enforced at the service layer by comparing the JWT `sub` claim against the message's `author.id`. Non-owners receive a `403 Forbidden`.

### Docker-Based Development

The full stack runs via `docker compose up`:

- **PostgreSQL 17** with a health check — the API waits until DB is ready
- **API** container with volume mounts for hot-reload via SWC watch mode
- **pgAdmin** for database inspection during development

`docker compose watch` enables automatic sync of source files and rebuild on dependency changes.

## Database Schema

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │   Message    │     │     Tag      │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id (UUID v7) │◄───│ author (FK)  │     │ id (UUID v7) │
│ username     │     │ id (UUID v7) │     │ name (unique)│
│ email        │     │ content      │───►│ createdAt    │
│ passwordHash │     │ tag (FK)     │     └──────────────┘
│ createdAt    │     │ createdAt    │
│ updatedAt    │     │ updatedAt    │
└─────────────┘     └──────────────┘
                    idx: (createdAt, id)
```

## API Endpoints

| Method | Path              | Auth     | Description                         |
| ------ | ----------------- | -------- | ----------------------------------- |
| POST   | /auth/register    | Public   | Create account, receive JWT         |
| POST   | /auth/login       | Public   | Authenticate, receive JWT           |
| GET    | /users/me         | Required | Current user profile                |
| GET    | /messages         | Public   | List messages (filtered, paginated) |
| POST   | /messages         | Required | Create a message                    |
| PATCH  | /messages/:id     | Owner    | Update own message                  |
| DELETE | /messages/:id     | Owner    | Delete own message                  |
| GET    | /tags             | Public   | List all tags                       |
| POST   | /tags             | Required | Create a tag                        |
| GET    | /health           | Public   | Health check (DB connectivity)      |

Full OpenAPI documentation is available at `/api` when the server is running.

## Testing

Unit tests use **Vitest** with **unplugin-swc** for SWC-based compilation (matching the NestJS build toolchain). Tests mock the ORM's `EntityManager` and service dependencies.

Coverage:
- **MessageService** — 13 tests (CRUD, ownership enforcement, pagination, filtering)
- **AuthService** — 4 tests (register, login success/failure scenarios)

Run with `pnpm test:api` from the root or `pnpm test` from `apps/api`.

## Next Steps

If this were heading toward production, the following improvements would be prioritized:

1. **Refresh token rotation** — short-lived access tokens with a secure HTTP-only refresh token for better security
2. **Rate limiting** — protect auth endpoints from brute-force attacks (`@nestjs/throttler`)
3. **E2E tests** — test the full request lifecycle against a test database
4. **CI/CD pipeline** — lint, test, build, and deploy on every push
5. **WebSocket support** — real-time message updates via Socket.IO or native WebSockets
6. **Email verification** — confirm user email addresses before allowing posts
7. **Role-based access control** — admin role for moderation (deleting any message, managing tags)
8. **Observability** — structured logging, health check dashboards, error tracking (Sentry)
