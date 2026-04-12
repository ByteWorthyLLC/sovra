---
phase: 6
slug: production-ready
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 6 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (TS)** | Vitest 2.x + @testing-library/react 16.x |
| **Framework (Go)** | go test |
| **Config file** | `packages/web/vitest.config.ts` |
| **Quick run command (TS)** | `cd packages/web && pnpm test` |
| **Quick run command (Go)** | `cd packages/worker && go test ./...` |
| **Full suite command** | `cd packages/web && pnpm test -- --reporter=verbose && cd ../worker && go test -v ./...` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After every task commit:** Run relevant test suite (TS or Go)
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 06-01-01 | 01 | 0 | BILL-01,02 | unit | `pnpm test -- billing/` | pending |
| 06-01-02 | 01 | 0 | BILL-03,04,05 | unit | `pnpm test -- billing/` | pending |
| 06-02-01 | 02 | 1 | APIK-01,02 | unit | `pnpm test -- api-keys/` | pending |
| 06-02-02 | 02 | 1 | APIK-03,04,05 | unit | `pnpm test -- api-keys/` | pending |
| 06-03-01 | 03 | 1 | ADMIN-01,02,03 | unit | `pnpm test -- admin/` | pending |
| 06-03-02 | 03 | 1 | ADMIN-04,05 | unit | `pnpm test -- admin/` | pending |
| 06-04-01 | 04 | 2 | DEPL-01,02,03 | file | `ls platform/` | pending |
| 06-04-02 | 04 | 2 | DEPL-04 | file | `ls .github/workflows/` | pending |
| 06-04-03 | 04 | 2 | DEPL-05 | file | `ls docs/` | pending |
| 06-05-01 | 05 | 2 | MON-01,02 | unit | `pnpm test -- monitoring/` | pending |
| 06-05-02 | 05 | 2 | MON-03,04 | unit | `go test -v ./...` | pending |

*Status: pending | green | red | flaky*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lemon Squeezy checkout flow | BILL-01 | Requires live Lemon Squeezy API keys | Set LEMON_SQUEEZY_API_KEY, click upgrade, verify checkout redirect |
| Webhook signature verification | BILL-05 | Requires real webhook events from Lemon Squeezy | Use LS webhook simulator or ngrok tunnel |
| Railway deploy | DEPL-01 | Requires Railway account and project | `railway up` from project root |
| AWS deploy | DEPL-02 | Requires AWS account and credentials | Follow docs/deployment-aws.md |
| GCP deploy | DEPL-03 | Requires GCP project and credentials | Follow docs/deployment-gcp.md |
| Sentry error capture | MON-01 | Requires live Sentry DSN | Trigger error, verify in Sentry dashboard |
| PostHog event capture | MON-02 | Requires live PostHog project | Trigger event, verify in PostHog dashboard |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 25s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
