---
phase: 02-core-infrastructure
plan: 03
subsystem: rbac-middleware
tags: [rbac, middleware, auth, tenant, invitation, permissions]
dependency_graph:
  requires:
    - 02-01 (SupabaseAuthAdapter, createSupabaseServerClient, createSupabaseBrowserClient)
    - 02-02 (createTenantResolver, TenantContext, shared RBAC types, migration 20260412010000)
  provides:
    - SupabasePermissionChecker (DB-backed permission checks)
    - hasPermission (standalone function)
    - DEFAULT_ROLES, DEFAULT_PERMISSIONS, PUBLIC_ROUTES, TENANT_FREE_ROUTES constants
    - usePermission, useRole React hooks
    - middleware.ts (tenant resolution + session refresh + route protection pipeline)
    - createTenant server action
    - createInvitation, createInviteLink, acceptInvitation server actions
  affects:
    - All Next.js routes (middleware runs on every non-static request)
    - Any component checking permissions (usePermission, useRole)
    - Tenant onboarding flow (createTenant)
    - Member management flow (invitation system)
tech_stack:
  added:
    - crypto (Node built-in) for 256-bit secure random invitation tokens
  patterns:
    - Supabase SSR cookie refresh pattern in middleware (createServerClient with setAll)
    - Server Actions with 'use server' directive for tenant/invitation mutations
    - TDD (RED-GREEN) for all three tasks
    - DB-backed permission checks via nested join (tenant_users -> roles -> role_permissions -> permissions)
key_files:
  created:
    - packages/web/lib/rbac/checker.ts
    - packages/web/lib/rbac/constants.ts
    - packages/web/lib/rbac/hooks.ts
    - packages/web/middleware.ts
    - packages/web/lib/tenant/actions.ts
    - packages/web/lib/rbac/invitation.ts
    - packages/web/src/__tests__/rbac/checker.test.ts
    - packages/web/src/__tests__/middleware.test.ts
    - packages/web/src/__tests__/tenant/create.test.ts
    - packages/web/src/__tests__/rbac/invitation.test.ts
  modified:
    - packages/shared/types/database.ts (added roles, permissions, role_permissions, invitations tables + role_id on tenant_users + seed_tenant_roles RPC)
    - packages/web/lib/rbac/hooks.ts (type fix for roles.name access)
    - packages/web/lib/rbac/invitation.ts (typed update calls)
decisions:
  - "Tenant resolution runs before auth in middleware (pitfall avoidance per 02-RESEARCH.md)"
  - "Cache-Control: private, no-store on all authenticated responses to prevent CDN leakage"
  - "Invitation tokens use 256-bit crypto random (32 bytes = 64 hex chars) per T-02-07 mitigation"
  - "Email invite max_uses defaults to 1; link invite max_uses defaults to null (unlimited)"
  - "Already-member on acceptInvitation treated as success (idempotent)"
  - "database.ts updated manually to match migration schema (Supabase local not running in CI)"
metrics:
  duration: ~20 minutes
  completed_date: "2026-04-12"
  tasks_completed: 3
  tasks_total: 3
  files_created: 10
  files_modified: 3
  tests_added: 19
  tests_total: 60
---

# Phase 2 Plan 3: RBAC Middleware Layer Summary

**One-liner:** DB-backed RBAC permission checker, Next.js middleware pipeline (tenant resolution -> session refresh -> route protection), tenant creation with role seeding, and secure invitation system (email + shareable link).

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | RBAC permission checker + constants + hooks | 2c7fef8 | checker.ts, constants.ts, hooks.ts |
| 2 | Root middleware | f11e4ec | middleware.ts |
| 3 | Tenant creation + invitation system | 71a518b | actions.ts, invitation.ts, database.ts |

## What Was Built

### Task 1: RBAC Permission Checker + Constants + Hooks

`SupabasePermissionChecker` implements the `PermissionChecker` interface with a Supabase DB lookup across the `tenant_users -> roles -> role_permissions -> permissions` join chain using `maybeSingle()`. Returns `false` on any DB error.

`constants.ts` defines `DEFAULT_ROLES` (owner/admin/member/viewer), `DEFAULT_PERMISSIONS` (15 actions), `PUBLIC_ROUTES` (5 paths), and `TENANT_FREE_ROUTES` (6 paths).

`hooks.ts` provides `usePermission(action)` and `useRole()` client hooks that query Supabase from the browser and track loading state.

### Task 2: Root Middleware

Pipeline order: (1) tenant resolution, (2) Supabase SSR client creation with cookie refresh, (3) `getUser()` session validation, (4) public route bypass, (5) unauthenticated redirect, (6) authenticated user redirect from login/signup, (7) `x-tenant-slug` header, (8) `Cache-Control: private, no-store`.

`config.matcher` excludes `_next/static`, `_next/image`, `favicon.ico`, and all image file extensions.

### Task 3: Tenant Creation + Invitation System

`createTenant` server action: inserts tenant row, calls `seed_tenant_roles` RPC to provision 4 default roles, queries owner role ID, inserts `tenant_users` record with `role: 'owner'`. Returns `{ tenant, error }`.

`createInvitation` generates 256-bit crypto random token, sets `expires_at` to now + N days (default 7), inserts invitation row. Email invites default to `max_uses: 1`; link invites default to `max_uses: null`.

`acceptInvitation` validates: (a) user authenticated, (b) invitation exists with `status: 'pending'`, (c) not expired, (d) not at max uses. Adds user to `tenant_users`, increments `use_count`, marks email invites as `accepted`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Updated database.ts with new schema tables**
- **Found during:** Task 3 TypeScript type-check
- **Issue:** `database.ts` did not include the `roles`, `permissions`, `role_permissions`, `invitations` tables or the `role_id` column on `tenant_users` added in migration `20260412010000`. TypeScript errors prevented compilation.
- **Fix:** Manually added all four new tables with Row/Insert/Update types and relationships, added `role_id` to `tenant_users`, added `seed_tenant_roles` RPC function type.
- **Files modified:** `packages/shared/types/database.ts`
- **Commit:** 71a518b

**2. [Rule 1 - Bug] Fixed type error in useRole hooks.ts**
- **Found during:** Task 3 TypeScript type-check
- **Issue:** `(tuData as Record<string, unknown>)?.roles?.name` caused TS error because `Record<string, unknown>` doesn't have `name` on the nested type.
- **Fix:** Cast to `{ roles?: { name?: string } | null }` for type-safe access.
- **Files modified:** `packages/web/lib/rbac/hooks.ts`
- **Commit:** 71a518b

**3. [Rule 1 - Bug] Fixed typed Supabase update in acceptInvitation**
- **Found during:** Task 3 TypeScript type-check
- **Issue:** `Record<string, unknown>` not assignable to Supabase's strict typed update parameter.
- **Fix:** Split conditional update into two typed calls (one with `status: 'accepted'`, one without).
- **Files modified:** `packages/web/lib/rbac/invitation.ts`
- **Commit:** 71a518b

## Test Coverage

| Suite | Tests | Status |
|-------|-------|--------|
| rbac/checker | 6 | Pass |
| middleware | 7 | Pass |
| tenant/create | 4 | Pass |
| rbac/invitation | 9 | Pass (3 createInvitation + 1 createInviteLink + 4 acceptInvitation) |
| Prior suites (auth + tenant resolver + context) | 34 | Pass |
| **Total** | **60** | **All pass** |

## Security Controls Implemented

Per threat model in plan:

| Threat | Mitigation Implemented |
|--------|----------------------|
| T-02-07 Invitation token spoofing | 256-bit crypto random token; DB lookup with status+expiry+max_uses checks |
| T-02-08 Middleware route bypass | Explicit PUBLIC_ROUTES whitelist; all other routes require authenticated user |
| T-02-09 Invitation role elevation | Role comes from invitation row set by admin; user cannot supply role |
| T-02-11 Session info disclosure | Cache-Control: private, no-store on all authenticated responses |

## Self-Check: PASSED

All 10 created files exist on disk. All 3 task commits verified in git history (2c7fef8, f11e4ec, 71a518b). TypeScript compiles with zero errors. 60 tests pass.
