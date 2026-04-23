# First-Run Checklist Template

Use this for day-0 onboarding of a new builder/team.

## 1. Local prerequisites

- [ ] Node.js 20+
- [ ] pnpm 10+
- [ ] Docker installed and running
- [ ] Supabase CLI installed
- [ ] Go installed (if worker development is required)

## 2. Bootstrapping

- [ ] Clone repository
- [ ] Run `pnpm setup:local`
- [ ] Run `supabase start`
- [ ] Fill in Supabase keys in:
  - `.env.local`
  - `packages/web/.env.local`

## 3. App startup

- [ ] Run web app: `cd packages/web && pnpm dev`
- [ ] Optional worker: `cd packages/worker && go run ./cmd/worker`

## 4. Validation

- [ ] `/api/health` responds with `status: "ok"`
- [ ] Can sign in and create a tenant/workspace
- [ ] Worker `/health` responds `ok` (if worker enabled)

## 5. Handoff

- [ ] Assign owner for staging bootstrap
- [ ] Share production readiness checklist (`docs/production-readiness.md`)
- [ ] Share operations runbook (`docs/operations-runbook.md`)
