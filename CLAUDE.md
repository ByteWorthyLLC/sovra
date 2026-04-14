# Sovra - Claude Code Instructions

## Project Overview

**Sovra** is an open-source AI-native SaaS platform for building multi-tenant AI agent applications with MCP, vector search, and multi-agent collaboration.

- **GitHub:** github.com/byteworthy/sovra
- **Stack:** Next.js 15 + Go 1.22+ + Supabase + Tailwind + shadcn/ui
- **Built by:** ByteWorthy (byteworthy.io)

## Quick Start

```bash
pnpm install
supabase start
cp .env.example .env.local && cp packages/web/.env.example packages/web/.env.local
cd packages/web && pnpm dev          # http://localhost:3000
cd packages/worker && go run ./cmd/worker  # Agent worker (optional)
```

## Directory Structure

```
sovra/
├── packages/
│   ├── web/           # Next.js frontend + API routes
│   ├── worker/        # Go agent worker (MCP, Socket.IO, gRPC)
│   └── shared/        # Shared TypeScript types and schemas
├── supabase/
│   └── migrations/    # 7 database migrations
├── docker/            # Docker Compose (dev + prod)
├── platform/          # Deployment configs (AWS, GCP, Railway)
└── docs/              # Deployment guide, env var reference
```

## Key Patterns

### Multi-Tenancy
- All database queries MUST be tenant-scoped
- Row-level security enforced at Postgres level
- Never bypass RLS in application code

### Security
- All API routes check authentication
- All server actions verify user + tenant membership
- Audit log sensitive operations
- CSP, HSTS, rate limiting, JWT verification in middleware

### npm Scope
- Shared types: `@sovra/shared`
- Web package: `@sovra/web`
- Go module: `github.com/byteworthy/sovra-worker`

## Quality Gates

Before claiming work complete:

1. `pnpm test` — 308 tests must pass
2. `pnpm lint` — zero errors/warnings
3. `npx tsc --noEmit` — TypeScript clean
4. `cd packages/worker && go test ./...` — Go tests pass
5. `pnpm build` — production build succeeds

## Commit Convention

```
type(scope): message
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`
