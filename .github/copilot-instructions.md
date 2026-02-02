# Copilot / AI Agent Instructions for proyecto-desarrollo-web ✅

Short summary

- Monorepo (pnpm workspaces) with two main apps:
  - Backend: NestJS + TypeORM + PostgreSQL (folder: `backend/`)
  - Frontend: React (Vite) + React Router (file-based routes) (folder: `frontend/`)
- Shared types/schemas live in `packages/api-types/` (Zod schemas used for runtime validation and typing).

Quick start (most common commands)

- Install: `pnpm install`
- Dev:
  - Frontend: `pnpm dev:frontend` (or `pnpm --filter frontend dev`)
  - Backend (dev server with watch): `pnpm dev:backend` (or `pnpm --filter backend start:dev`)
- DB: set `backend/.env` from `backend/.env.example` (important: `DATABASE_URL`, `ACCESS_TOKEN_SECRET`).
- Migrations & seed (backend):
  - Run: `pnpm --filter backend migration:run`
  - Generate: `pnpm --filter backend migration:generate -- <name>`
  - Seed: `pnpm --filter backend seed`
- Tests:
  - Backend unit: `pnpm --filter backend test` (e2e: `pnpm --filter backend test:e2e`)
  - Frontend: `pnpm --filter frontend test`
- Builds:
  - Frontend: `pnpm --filter frontend build`
  - Backend: `pnpm --filter backend build` (uses `tsdown`)

Why this layout / important architecture notes 🔧

- Backend is modular (NestJS): look at `backend/src/*` modules (e.g., `auth`, `reservations`, `users`, `laboratories`). Each module defines DTOs, entities (TypeORM), services, controllers. Example: `backend/src/reservations/`.
- Shared API contract is authoritative in `packages/api-types/` (Zod schemas + enums). Whenever you change an API shape, update this package first and make sure both front and back reflect the change.
- Frontend uses file-based routes via `react-router` dev routes (`frontend/src/routes.ts`) and automatic route typegen (`pnpm --filter frontend typecheck`).
- Frontend HTTP client: `frontend/src/lib/api.ts` (ky instance with automatic token refresh on 401). The dev server proxies `/api` to `DEV_API_URL` or `http://localhost:3000` (see `vite.config.ts`).

Conventions & patterns to follow (be specific) 📋

- Use Zod schemas from `packages/api-types` when adding or changing payloads and types.
- Backend validations: DTOs use `class-validator` and controllers throw Nest exceptions (messages are in Spanish). Keep user-facing messages consistent and Spanish.
- Auth pattern: JWT access token in Authorization header + refresh tokens in http-only cookie. See `backend/src/auth/*` and `frontend/src/lib/auth.ts`.
- DB operations: prefer TypeORM transactions for multi-step writes (see `reservations.service.create` which creates a reservation and ocupations inside a single transaction).
- Paging/search: use `nestjs-paginate` and exported configs (example: `RESERVATION_PAGINATION_CONFIG`). Reuse these configs for list endpoints.
- Error handling: frontend's `setErrorFromServer` maps backend errors and Zod validation issues into form errors — preserve that shape in API responses when adding validations.

Files & places to read first (examples) 📚

- `README.md` (root) — project overview and common commands
- `backend/src/*` modules (auth, users, reservations, laboratories) — patterns for DTOs, entities, services
- `backend/scripts` — migrations (`migrations.mts`) and seed (`seed.mts`) flow
- `packages/api-types/lib/*.ts` — canonical Zod schemas and enums used across the repo
- `frontend/src/lib/api.ts` and `frontend/src/lib/auth.ts` — HTTP client + token handling
- `frontend/src/routes.ts` — app routes and file-based routing patterns

PR checklist for contributors ✅

- Update `packages/api-types` if any API payload/response changes.
- Run `pnpm --filter backend lint` and `pnpm --filter frontend lint` as appropriate.
- Run build and tests: `pnpm --filter <package> build` and `pnpm --filter <package> test`.
- Migrations: if changing DB schema, add a TypeORM migration with `migration:generate` and include it in the PR.
- If modifying auth behavior, check refresh-token cookie behavior and `frontend` refresh logic on 401s.

Notes & gotchas ⚠️

- Most user-facing messages and validation errors are in Spanish; use Spanish for UX strings.
- Vite dev proxy routes `/api` to backend; if backend runs on a non-default port, set `DEV_API_URL`.
- Backend cookie `secure` is enabled; in some dev setups you may need to tweak cookie settings for local testing.

If anything here is unclear or missing, tell me what you'd like added (e.g., more examples, a specific module walkthrough, or deployment steps).
