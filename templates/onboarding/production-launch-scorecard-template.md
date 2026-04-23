# Production Launch Scorecard Template

Use this scorecard in final launch review. Keep evidence links in every row.

## Release information

- Product:
- Environment:
- Target commit SHA:
- Launch owner:
- Rollback owner:
- Review date:

## Readiness scoring

Score each category from 1 to 5.

- 1 = blocked
- 3 = usable with known gaps
- 5 = ready for production

| Category | Score (1-5) | Owner | Evidence links | Notes |
|---|---|---|---|---|
| CI and required checks |  |  |  |  |
| Security workflow and scan posture |  |  |  |  |
| Web lint, typecheck, and tests |  |  |  |  |
| Worker test and runtime health |  |  |  |  |
| Tenant isolation validation |  |  |  |  |
| Auth and API key controls |  |  |  |  |
| Billing and metering validation |  |  |  |  |
| Monitoring and alert routing |  |  |  |  |
| Operations runbook readiness |  |  |  |  |
| Rollback snapshot and drill |  |  |  |  |

## Gate decisions

- Minimum category score required to launch:
- Any category below minimum? (yes/no):
- Launch decision: `go` / `hold`
- Reason:

## Risk register

| Risk | Severity | Mitigation | Owner | Due date |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Final signoff

- Product owner:
- Engineering owner:
- Operations owner:
- Date and time:
