# Launch Foundation

This guide is the operating baseline for teams that want a reliable path from first clone to production launch.

Use it as the command center that ties together quickstart, security hardening, migration, release gates, and upgrade planning.

## Scope

This guide covers:

- onboarding execution order
- production safety gates
- required ownership and evidence for launch
- upgrade readiness for Klienta and Clynova

## Foundation phases

### Phase 0: Day 0 setup

Goal: get a local environment running and validated.

1. Clone and bootstrap:
   ```bash
   git clone https://github.com/ByteWorthyLLC/sovra.git
   cd sovra
   pnpm setup:local:start
   ```
2. Confirm web and worker health:
   - web: `http://localhost:3000/api/health`
   - worker: `http://localhost:8081/health` (or your configured health URL)
3. Complete `templates/onboarding/first-run-checklist-template.md`.

### Phase 1: Team staging baseline

Goal: prepare a secure shared environment before production.

1. Provision `dev`, `staging`, and `prod` environments.
2. Set required secrets and lock internal routes:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `INTERNAL_API_SECRET`
   - `SOCKETIO_ALLOWED_ORIGINS` with explicit hosts
3. Validate tenant isolation and auth boundaries.
4. Complete `templates/onboarding/customer-launch-plan-template.md`.

### Phase 2: Release hardening

Goal: prove release quality on the target commit.

Run all launch gates:

```bash
./scripts/ci/release-readiness-checks.sh
pnpm --filter @sovra/web lint
pnpm --filter @sovra/web typecheck
pnpm --filter @sovra/web test
pnpm --filter @sovra/web build
pnpm go:test
```

Then complete:

- `docs/production-readiness.md`
- `docs/operations-runbook.md`
- `templates/onboarding/production-launch-scorecard-template.md`

### Phase 3: Controlled launch

Goal: ship with rollback safety and clear ownership.

1. Prepare snapshot and rollback owner.
2. Execute staged rollout.
3. Monitor health, auth, worker queue, and billing events.
4. Record incident and cutover outcomes in launch artifacts.

## Required launch artifacts

Before go live, repository artifacts should include:

- onboarding plan with named owners
- production readiness checklist with pass evidence
- cutover checklist with rollback references
- launch scorecard with final decision and signoff

Recommended templates:

- `templates/onboarding/customer-launch-plan-template.md`
- `templates/migrations/cutover-checklist-template.md`
- `templates/onboarding/production-launch-scorecard-template.md`

## Upgrade readiness

When the core launch is stable:

1. Review `docs/upgrade-paths.md`.
2. Score fit using `templates/upgrade/boilerplate-evaluation-template.md`.
3. Promote only with additive and reversible changes.

## Related references

- `docs/customer-onboarding-dx.md`
- `docs/migration-guides.md`
- `docs/open-source-packaging.md`
- `docs/seo-aeo-geo-guidelines.md`
