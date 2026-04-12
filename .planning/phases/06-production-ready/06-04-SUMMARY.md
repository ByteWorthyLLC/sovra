---
phase: 06-production-ready
plan: 04
subsystem: web-frontend
tags: [billing, api-keys, settings, stripe, framer-motion, radix-ui]
dependency_graph:
  requires: [06-01, 06-02]
  provides: [billing-ui, api-keys-ui, settings-pages]
  affects: [tenant-sidebar, tenant-settings]
tech_stack:
  added: []
  patterns: [server-component-data-load, client-component-interactivity, two-step-dialog, optimistic-update]
key_files:
  created:
    - packages/web/app/(tenant)/t/[slug]/settings/billing/page.tsx
    - packages/web/app/(tenant)/t/[slug]/settings/api-keys/page.tsx
    - packages/web/components/billing/PlanCard.tsx
    - packages/web/components/billing/UsageMetricRow.tsx
    - packages/web/components/billing/BillingPortalButton.tsx
    - packages/web/components/api-keys/ApiKeyRow.tsx
    - packages/web/components/api-keys/CreateApiKeyDialog.tsx
  modified:
    - packages/web/components/tenant/sidebar-nav.tsx
    - packages/web/app/globals.css
decisions:
  - "API keys page is a client component (not server) to allow real-time list refresh after create/revoke without a full page reload"
  - "BillingPortalButton uses tenant context (useTenant) for tenantId rather than accepting it as a prop to avoid prop drilling through the server page"
  - "PlanCard accepts currentPlan as a prop to determine upgrade vs downgrade CTA without external state"
metrics:
  duration: 25m
  completed: 2026-04-12
  tasks_completed: 2
  files_created: 7
  files_modified: 2
---

# Phase 06 Plan 04: Tenant Settings UI Summary

Billing page and API keys settings pages built per UI design contract. Server component data loading for billing, client component interactivity for API key management, Framer Motion animations throughout, exact copywriting from UI spec.

## What Was Built

### Task 1: Billing Page

**Billing page** (`/t/{slug}/settings/billing`) -- server component that loads subscription + usage data via `getSubscriptionForTenant` and `getUsageForTenant`, then renders:

- **PlanCard**: current plan highlighted with `bg-blue-500/[0.06] border-blue-500/30`, tier badges per UI spec color tokens, feature list with Check icons, correct CTAs (Current plan disabled, Upgrade/Downgrade buttons, Contact sales for enterprise), Framer Motion `listItem` stagger animation.
- **UsageMetricRow**: color-coded usage bars (blue < 70%, amber 70-90%, red > 90%), 600ms CSS width transition on mount, tooltip on hover, "Approaching limit" warning text above 90%.
- **BillingPortalButton**: calls `POST /api/billing/portal` with tenantId from context, opens returned URL in new tab, loading spinner state, error toast on failure.

**Sidebar nav** updated: Settings section added with Billing (CreditCard icon) and API keys (KeyRound icon) links. Removed disabled Settings stub.

**globals.css** updated: `key-reveal-highlight` CSS animation added (blue flash 0.4s ease-out).

### Task 2: API Keys Page

**API keys page** (`/t/{slug}/settings/api-keys`) -- client component, fetches keys on mount from `GET /api/keys`, renders:

- **ApiKeyRow**: h-[64px] rows with name, masked `bsk_••••••••{last4}` value, status badge (active green / expired gray / revoked red), expiry date, MoreHorizontal dropdown (Copy key ID, Reveal last 4, Revoke key). Revocation confirmation dialog with exact UI spec copy ("Revoke this API key? Applications using it will stop working immediately.").
- **CreateApiKeyDialog**: two-step dialog -- Step 1 form (name input, expiry select with custom date option, 2-col permissions checkbox grid), Step 2 one-time key reveal with amber warning banner, monospace key display, copy button with `key-reveal-highlight` animation, "I copied my key" primary button. Backdrop tap-outside disabled during reveal step. `cardEnter` Framer Motion animation.
- **Empty state**: centered, py-24, KeyRound icon, "No API keys" heading, body copy, inline Create API key CTA.

## Deviations from Plan

### Auto-fixed Issues

None -- plan executed exactly as written.

## Known Stubs

None -- all data is wired to real API endpoints (`getSubscriptionForTenant`, `getUsageForTenant`, `GET /api/keys`, `POST /api/keys`, `DELETE /api/keys/[id]`, `POST /api/billing/portal`). Storage MB usage reads from `subscription.storage_mb_used` field which defaults to 0 if not present -- this is a legitimate default, not a stub.

## Threat Flags

None -- no new network endpoints introduced. All surfaces were already in the threat model (T-06-14: raw key shown once with forced acknowledgment; T-06-15: permissions validated server-side; T-06-16: error boundary on billing load).

## Self-Check: PASSED

Files exist:
- packages/web/app/(tenant)/t/[slug]/settings/billing/page.tsx -- FOUND
- packages/web/app/(tenant)/t/[slug]/settings/api-keys/page.tsx -- FOUND
- packages/web/components/billing/PlanCard.tsx -- FOUND
- packages/web/components/billing/UsageMetricRow.tsx -- FOUND
- packages/web/components/billing/BillingPortalButton.tsx -- FOUND
- packages/web/components/api-keys/ApiKeyRow.tsx -- FOUND
- packages/web/components/api-keys/CreateApiKeyDialog.tsx -- FOUND

Commits exist:
- 99731d8: feat(06-04): billing page with plan cards, usage meters, and portal button -- FOUND
- 070acde: feat(06-04): API keys page with list, creation dialog, and revocation -- FOUND

TypeScript: clean (pnpm typecheck passes with zero errors)
Acceptance criteria: 15/15 PASS
