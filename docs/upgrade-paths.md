# Upgrade Paths: Sovra to Klienta or Clynova

This guide helps teams move from Sovra OSS to paid ByteWorthy verticals without replatforming.

## Decision matrix

| Requirement | Sovra | Klienta | Clynova |
|---|---|---|---|
| Flexible general AI SaaS foundation | Yes | Optional | Optional |
| Agency and client delivery model | Partial custom work | Yes | No |
| Healthcare interoperability and compliance scaffolding | No | No | Yes |

## Upgrade principles

1. Keep Sovra core contracts intact while adding vertical modules.
2. Preserve tenant and user identity semantics.
3. Roll out changes with feature flags where possible.
4. Define rollback before any production cutover.

## Path A: Sovra to Klienta

Recommended sequence:

1. Baseline current Sovra deployment with tests and health checks.
2. Stand up Klienta modules in staging.
3. Map tenant structures to agency account structures.
4. Validate permission boundaries and white label surfaces.
5. Pilot with selected tenants before full rollout.

## Path B: Sovra to Clynova

Recommended sequence:

1. Baseline current Sovra deployment.
2. Add Clynova modules in staging.
3. Validate healthcare data boundaries and audit requirements.
4. Validate integration interfaces and operations runbooks.
5. Pilot with non production data before regulated launch.

## Shared pre-upgrade checklist

- `ci`, `security`, and `release-readiness` workflows green
- no unresolved critical or high security findings
- schema snapshot and data backup completed
- go live owner and rollback owner assigned

## Shared post-upgrade checklist

- tenant isolation tests pass
- web and worker health checks pass
- billing, audit logs, and background jobs validated
- support and on call runbooks updated

## Planning template

Use `templates/upgrade/boilerplate-evaluation-template.md` to score readiness, risk, and migration complexity.
