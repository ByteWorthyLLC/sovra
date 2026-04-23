# Customer Onboarding DX

This guide defines how to onboard a new team from first clone to production launch.

## Onboarding outcomes

- A new developer can run Sovra locally in under 30 minutes.
- A team can stand up a secure staging environment in under 2 business days.
- Release readiness checks and production runbooks are complete before go live.

## Onboarding tracks

| Track | Target user | Output |
|---|---|---|
| Builder quickstart | Individual developer | Running local app with auth and workspace flows |
| Team bootstrap | Product engineering team | Shared staging environment with validated secrets |
| Production launch | Operator and tech lead | Release gate pass, runbooks, rollback owner |

## Builder quickstart

1. Clone and install:
   ```bash
   git clone https://github.com/ByteWorthyLLC/sovra.git
   cd sovra
   pnpm setup:local
   ```
2. Start local data services:
   ```bash
   supabase start
   ```
3. Add Supabase keys to:
   - `.env.local`
   - `packages/web/.env.local`
4. Start web app:
   ```bash
   cd packages/web
   pnpm dev
   ```
5. Start worker (recommended):
   ```bash
   cd ../../packages/worker
   go run ./cmd/worker
   ```

## Team bootstrap checklist

1. Create isolated environments: `dev`, `staging`, `prod`.
2. Set required secrets:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `INTERNAL_API_SECRET`
   - provider keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `HUGGINGFACE_API_KEY`) only when needed
3. Lock worker ingress and origin policy:
   - `SOCKETIO_ALLOWED_ORIGINS` must use explicit host lists in production.
   - `WORKER_INTERNAL_URL` must stay private to trusted network routes.
4. Deploy web and worker as separate services.
5. Validate health and auth paths:
   - web: `/api/health`
   - worker: `/health`
   - tenant creation and workspace creation
6. Run gate scripts:
   ```bash
   ./scripts/ci/release-readiness-checks.sh
   pnpm go:test
   ```

## Production launch gate

Launch only after all items are complete:

- CI and security workflows are green on the target commit.
- `docs/production-readiness.md` is fully checked.
- `docs/operations-runbook.md` owner and escalation path are filled.
- Rollback owner and snapshot reference are recorded.

## MCP implementation guidance

Sovra follows current MCP TypeScript SDK guidance:

- Prefer explicit registration APIs: `registerTool`, `registerPrompt`, `registerResource`.
- Validate tool input/output with strict schemas (`z.object(...)`).
- Prefer Streamable HTTP transport for remote MCP integration.
- Require endpoint auth and host validation for HTTP exposed MCP routes.

Reference docs:

- `docs/architecture.md`
- `docs/worker.md`
- `docs/migration-guides.md`

## Onboarding artifacts in this repo

- `templates/onboarding/customer-launch-plan-template.md`
- `templates/onboarding/first-run-checklist-template.md`
- `templates/migrations/cutover-checklist-template.md`
- `templates/upgrade/boilerplate-evaluation-template.md`
- `templates/marketing/seo-aeo-geo-brief-template.md`
