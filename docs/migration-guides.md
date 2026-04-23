# Migration Guides

This document covers high confidence migration tracks into and beyond Sovra.

## Migration tracks

| Track | Source | Destination |
|---|---|---|
| A | Existing Next.js SaaS app | Sovra OSS foundation |
| B | Single tenant app | Multi tenant Sovra deployment |
| C | Sovra OSS | Klienta vertical |
| D | Sovra OSS | Clynova vertical |

## Track A: Existing SaaS to Sovra

1. Stand up Sovra in parallel. Do not perform in place cutover first.
2. Map current identity model to Sovra auth plus tenant membership.
3. Move domain entities into tenant scoped tables.
4. Move AI route and tool execution logic into Sovra runtime boundaries.
5. Align observability and release checks.

Recommended order:

1. Identity and tenant model
2. Core entities and row level security policies
3. Billing and metering paths
4. AI chat and tool execution
5. Admin and reporting

## Track B: Single tenant to multi tenant

1. Add `tenant_id` columns.
2. Backfill tenant ids for existing rows.
3. Add and validate row level security policies.
4. Add tenant context to APIs and worker jobs.
5. Re run integration tests with cross tenant negative cases.

Minimum test gate:

- user A cannot read or write tenant B resources
- API key scope stays tenant bound
- worker broadcasts and MCP operations enforce tenant boundaries

## Track C and D: Sovra to paid verticals

Sovra remains the base contract.

- Klienta adds agency workflows, white label packaging, and client delivery defaults.
- Clynova adds healthcare interoperability and compliance scaffolding.

Upgrade policy:

- preserve existing `tenant_id` and `user_id` values
- preserve existing auth and session boundaries
- add vertical modules incrementally, preferably behind flags
- keep export and rollback paths available during each phase

## MCP SDK migration guidance

For custom extensions, follow current SDK APIs:

- use `registerTool`, `registerPrompt`, `registerResource`
- avoid removed variadic registration helpers
- enforce schema validated inputs with `z.object(...)`

## Cutover template

Use `templates/migrations/cutover-checklist-template.md`.

Recommended staged cutover:

1. Dry run in staging with production like volume.
2. Freeze writes for final sync window.
3. Execute migration and verification checks.
4. Shift traffic in measured stages.
5. Keep rollback window and snapshots ready.

## Rollback rules

Every production migration must define rollback first:

- snapshot before schema and data changes
- reversible routing and feature toggle controls
- named owner with escalation path
