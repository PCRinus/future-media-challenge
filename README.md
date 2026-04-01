# Future Media Challenge

A pnpm monorepo containing a Next.js frontend and a Nest.js backend.

## Project Structure

```
future-media-challenge/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Nest.js backend
├── packages/         # Shared libraries (types, utils, etc.)
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- **Node.js v24** — pinned via `.nvmrc`. Install from [nodejs.org](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm):
  ```bash
  nvm install    # reads .nvmrc automatically
  ```
- **pnpm** — Install via [pnpm.io](https://pnpm.io/installation) or:
  ```bash
  corepack enable && corepack prepare pnpm@latest --activate
  ```

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Run the frontend (Next.js)

```bash
pnpm --filter web dev
```

Runs on [http://localhost:3000](http://localhost:3000).

### Run the backend (Nest.js)

```bash
pnpm --filter api start:dev
```

Runs on [http://localhost:3000](http://localhost:3000) by default (change the port to avoid conflicts).

### Run both

```bash
pnpm --filter web dev & pnpm --filter api start:dev
```

## Common Commands

| Command                      | Description                 |
| ---------------------------- | --------------------------- |
| `pnpm install`               | Install all dependencies    |
| `pnpm --filter web <script>` | Run a script in the web app |
| `pnpm --filter api <script>` | Run a script in the API     |
| `pnpm --filter web build`    | Build the frontend          |
| `pnpm --filter api build`    | Build the backend           |
| `pnpm --filter api test`     | Run API tests               |

## Adding Shared Packages

Create a new package under `packages/` (e.g., `packages/types`) and reference it from either app:

```bash
pnpm --filter web add types --workspace
```
