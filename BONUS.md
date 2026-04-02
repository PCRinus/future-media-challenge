# Bonus Points

## Include at least one example test

Both apps have unit/component tests written with **Vitest**.

**API (NestJS service tests)**

`MessageService` and `AuthService` are tested by mocking MikroORM's `EntityManager` and compiling a lightweight NestJS test module via `@nestjs/testing`. The tests cover the full service surface: CRUD operations, ownership enforcement (`ForbiddenException` on wrong author, `NotFoundException` on missing message), cursor-based pagination logic, and all filter combinations.

- `MessageService` — 13 tests
- `AuthService` — 4 tests (register, login, duplicate email, wrong password)

**Web (React component tests)**

`ComposeForm` and `MessageCard` are tested with `@testing-library/react` and `jsdom`. API hooks are mocked with `vi.mock()` so the tests run without a real server. Coverage includes the character counter, tag selection, submit guard (disabled with empty content or no tag), edit/delete visibility gating by authorship, the inline edit flow with save/cancel, and the delete confirmation step.

Run all tests from the root: `pnpm test`

---

## Docker-based setup

A `docker-compose.yml` at the root covers the full stack:

| Service   | Image                | Purpose                                     |
| --------- | -------------------- | ------------------------------------------- |
| `db`      | `postgres:17-alpine` | PostgreSQL with a `pg_isready` health check |
| `api`     | Custom Dockerfile    | NestJS API (production build)               |
| `web`     | Custom Dockerfile    | Next.js frontend (production build)         |
| `pgadmin` | `dpage/pgadmin4`     | DB inspection UI (opt-in via profile)       |

The API container waits for the `db` health check to pass before starting (`depends_on: condition: service_healthy`). `app.enableShutdownHooks()` is configured in the API so in-flight requests complete before a container terminates on `SIGTERM`.

- **Development**: `pnpm dev` starts PostgreSQL via Docker and the API + web in watch mode locally
- **Production**: `pnpm prod` builds and runs all services via Docker Compose (`docker compose --profile prod up`)
- **DB tools**: `docker compose --profile tools up pgadmin` starts pgAdmin on port 5050

**Potential improvement: fully containerized local development**

Currently the API and web processes run on the host during development, only the database is containerized. A potential next step would be to add a `dev` Compose profile that also runs the API and web inside containers, with the host source directories bind-mounted as volumes:

```yaml
api-dev:
  profiles: [dev]
  build:
    context: .
    dockerfile: apps/api/Dockerfile
    target: dev # a dedicated dev stage that installs devDependencies
  volumes:
    - ./apps/api/src:/app/apps/api/src # source changes visible inside the container
    - ./apps/api/package.json:/app/apps/api/package.json
  command: pnpm --filter api dev # SWC watch mode inside the container
  depends_on:
    db:
      condition: service_healthy
```

The same pattern applies to the web service. Because the source files are mounted rather than copied at build time, the container reflects changes immediately — hot-reload and HMR work exactly as they do locally, but the runtime environment (Node version, OS, path resolution) matches production. `docker compose watch` can further automate rebuilds when `package.json` changes, handling dependency installs inside the container automatically.

---

## Input validation and basic error handling

**API**

A global [ValidationPipe](./apps/api/src/main.ts) (with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`) is registered in `main.ts`. Every DTO uses `class-validator` decorators, for example: [CreateMessageDto](./apps/api/src/message/dto/create-message.dto.ts), [RegisterDto](./apps/api/src/auth/dto/register.dto.ts), and [MessageFilterDto](./apps/api/src/message/dto/message-filter.dto.ts).:

Invalid requests receive a `400 Bad Request` with a structured error body listing every failing constraint. Ownership violations return `403 Forbidden`; missing resources return `404 Not Found`.

**Frontend**

The login and register forms use **React Hook Form** with a **Zod v4** schema validated through `@hookform/resolvers/standard-schema`. Errors are shown inline beneath each field without a full-page render cycle.

API-level errors (e.g. "email already in use") are caught in the mutation's `onError` handler and displayed as a red banner above the form via `getErrorMessage()`, which extracts the structured message from the API's `400`/`409` response when available.

For the message compose and edit flows:

- The compose textarea enforces `maxLength={240}` at the HTML level and shows a live character counter that turns red below 20 characters remaining
- The same counter is shown in the inline edit textarea on `MessageCard`
- The submit button is disabled when content is empty or no tag is selected
- All mutations surface errors as toast notifications via **Sonner**

---

## Observability suggestions

**Health check**

`GET /health` queries the database with `orm.isConnected()` and returns `{ status: "ok" | "error", database: "connected" | "disconnected" }` with a `503` on failure. This is ready to be wired into an uptime monitor for example.

**Structured logging**

For production, the NestJS logger would be replaced with **pino** (via `nestjs-pino`) to emit JSON-structured logs with request ID, method, path, status code, and latency on every request. JSON logs integrate directly with CloudWatch or Datadog without custom parsing.

**Error tracking**

DataDog or Sentry could be used here. For example, Sentry's NestJS SDK (`@sentry/nestjs`) captures unhandled exceptions with full stack traces, request context, and user information.

---

# Bonus Question: High Read Load

## Caching with Redis or ValKey (or similar)

The most queried endpoint by far is `GET /messages` with no filters, because it is the default feed that every user lands on. Caching the first page of results in **Redis** or **ValKey** with a short TTL (e.g. 10–30 seconds) would significantly reduce database load.

NestJS integrates with Redis via `@nestjs/cache-manager` and the `cache-manager-ioredis` store: https://docs.nestjs.com/techniques/caching#auto-caching-responses

Cache invalidation is straightforward given the data shape: any write to the `messages` table (create, update, delete) busts the affected cache keys. Filtered queries (by tag, user, date range) are less cacheable due to the combinations of filters, but the unfiltered first page alone covers the majority of traffic.

## Read Replicas

**Read replicas** allow `SELECT` queries to be routed to one or more replica instances, leaving the primary for writes only. Since `GET /messages` is the dominant operation and it's entirely read-only, routing those queries to a replica directly halves the load on the primary — and replicas can be scaled out independently as traffic grows. MikroORM supports multiple connections, so a read-only `EntityManager` pointed at the replica endpoint can be wired in at the service layer.

## Database Connection Pooling

Under high concurrency, a large number of short-lived API instances each holding open PostgreSQL connections can exhaust the database's connection limit before CPU or memory become a bottleneck. **AWS RDS Proxy** sits between the application and RDS and multiplexes many application connections onto a smaller pool of long-lived database connections. This is particularly important when running the API as Lambda functions or many ECS tasks, both of which can spike connection counts sharply.

## HTTP Cache Headers

For the public `GET /messages` endpoint (which doesn't require auth), adding `Cache-Control: public, max-age=10, stale-while-revalidate=30` headers allows a CDN like **CloudFront** to cache responses. Subsequent requests for the same query are served entirely from the CDN — the origin API never sees them. Combined with cursor-based pagination (which the app already uses), cache keys are stable and predictable.

## Architectural choices that already help at scale

Some decisions already in the codebase should provide benefits under load without further changes:

- **Cursor-based pagination** — offset pagination requires the database to scan and discard all preceding rows on each page. Cursor pagination uses an indexed seek (`WHERE (createdAt, id) < (?, ?)`) so every page is O(1) regardless of how deep into the feed a user scrolls.
