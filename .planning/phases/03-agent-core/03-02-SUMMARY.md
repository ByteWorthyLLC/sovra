---
phase: 03-agent-core
plan: 02
subsystem: agent-ui
tags: [agent-card, agent-form, config-sheet, status-badge, sidebar-nav, motion-variants]
dependency_graph:
  requires: [agent/types, agent/actions, agent/queries, ui/badge, ui/empty-state, ui/input, ui/form-field, motion, toast]
  provides: [agent/card, agent/form, agent/status-badge, agent/tools-selector, agents-page]
  affects: [sidebar-nav, globals.css, motion.ts]
tech_stack:
  added: []
  patterns: [radix-dialog, radix-tabs, radix-select, radix-dropdown-menu, framer-motion-variants, glass-morphism, server-component-with-client-wrapper]
key_files:
  created:
    - packages/web/components/agent/agent-status-badge.tsx
    - packages/web/components/agent/agent-tools-selector.tsx
    - packages/web/components/agent/agent-card.tsx
    - packages/web/components/agent/agent-form.tsx
    - packages/web/app/(tenant)/t/[slug]/agents/page.tsx
    - packages/web/app/(tenant)/t/[slug]/agents/agent-list-client.tsx
    - packages/web/app/(tenant)/t/[slug]/agents/loading.tsx
  modified:
    - packages/web/lib/motion.ts
    - packages/web/app/globals.css
    - packages/web/components/tenant/sidebar-nav.tsx
decisions:
  - "Used separate AgentListClient wrapper to keep page.tsx as server component while managing dialog/sheet state client-side"
  - "AgentForm serves both create (dialog) and edit (sheet) modes via mode prop to avoid code duplication"
  - "Temperature slider uses native range input styled with Tailwind since @radix-ui/react-slider may not be installed"
  - "Agent type defined locally in each component file rather than sharing to avoid coupling to Supabase row shape"
metrics:
  duration: 345s
  completed: "2026-04-12T06:16:20Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 3
---

# Phase 03 Plan 02: Agent Management UI Summary

Agent list page with 3-column card grid, create dialog with glass morphism and Zod validation, 4-tab edit config sheet (General/Model/Tools/Prompt), status badges with pulse animation, and enabled sidebar navigation.

## Task Results

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Motion.ts additions + CSS keyframes + AgentStatusBadge + AgentToolsSelector | 2d21ad9 | Done |
| 2 | Agent card + create dialog + config sheet + agent list page + enable sidebar | cd766f7 | Done |

## What Was Built

### Motion and CSS Additions (2 files modified)
- 3 new animation variants: `messageEnter` (message fade-in), `slideInRight` (edit sheet), `jumpToLatest` (scroll indicator)
- `streaming-cursor` CSS keyframe for blinking cursor animation
- `statusPulse` CSS keyframe for agent running state indicator

### Agent Status Badge (1 file)
- 3 states: idle (zinc-500 dot), running (blue-500 pulsing dot), error (red-500 dot)
- Uses existing Badge component with variant-specific color overrides
- Accessible via aria-label on status dot

### Agent Tools Selector (1 file)
- Checkbox list rendering all items from AVAILABLE_TOOLS constant
- Empty state text when no tools available
- Controlled component with selectedTools/onChange props

### Agent Card (1 file)
- 3-row card layout: name + status badge, model provider/name, action menu
- Dropdown menu with Open chat, Edit, Duplicate (disabled), Delete (red)
- Framer Motion listItem animation on enter
- Hover effects: border highlight, menu button opacity transition
- Entire card links to agent chat page

### Agent Form (1 file, dual mode)
- Create mode: Radix Dialog centered overlay with glass-card morphism, 480px max width
- Edit mode: slide-in-right sheet with 4 Radix Tabs (General, Model, Tools, Prompt)
- General tab: name, description, read-only status badge
- Model tab: provider select, model select (synced to provider), temperature slider with Precise/Creative labels, max tokens input
- Tools tab: AgentToolsSelector integration
- Prompt tab: monospace textarea with character count
- Zod validation on submit, dirty state indicator, loading state
- Calls createAgent/updateAgent server actions with toast feedback

### Agent List Page (3 files)
- Server component fetches agents via listAgents query
- Client wrapper manages create dialog, edit sheet, and delete confirmation state
- 3-column responsive grid (1/2/3 cols at sm/md/lg)
- Stagger animation on grid items (0.04s delay)
- EmptyState with Bot icon and CTA when no agents
- Skeleton loading state with 6 placeholder cards

### Sidebar Navigation (1 file modified)
- Agents nav item changed from disabled to enabled

## Threat Mitigations Applied

| Threat ID | Mitigation | Verified |
|-----------|-----------|----------|
| T-03-06 (Tampering) | agentFormSchema.safeParse validates all fields before server action call | Yes |
| T-03-07 (Elevation) | deleteAgent server action enforces agent:delete permission (from Plan 01) | Yes |
| T-03-08 (Info Disclosure) | listAgents filtered by tenant_id; page resolves tenant from slug | Yes |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed toast API call signature**
- **Found during:** Task 2
- **Issue:** Toast calls used object syntax `toast({ title, variant })` but the actual API takes positional args `toast(variant, title, description?)`
- **Fix:** Changed all toast calls to positional argument format
- **Files modified:** agent-form.tsx, agent-list-client.tsx
- **Commit:** cd766f7

**2. [Rule 1 - Bug] Fixed TypeScript readonly tuple length check**
- **Found during:** Task 1
- **Issue:** `AVAILABLE_TOOLS.length === 0` fails type-check because TS knows the tuple has 5 items
- **Fix:** Cast to `readonly string[]` before length check
- **Files modified:** agent-tools-selector.tsx
- **Commit:** 2d21ad9

## Known Stubs

None. All components are fully wired to Plan 01 server actions and queries.

## Self-Check: PASSED

- All 7 created files exist on disk
- All 3 modified files verified
- Commit 2d21ad9 found in git log
- Commit cd766f7 found in git log
- TypeScript clean (only pre-existing vi error in registry.test.ts from Plan 01)
- ESLint clean (only pre-existing errors in avatar.tsx and test files from prior plans)
