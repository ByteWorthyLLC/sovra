---
phase: 05-multi-agent
plan: 06
subsystem: workspace-detail-ui
tags: [workspace, ui, real-time, socket-io, zustand, framer-motion, settings-sheet]
dependency_graph:
  requires:
    - "05-04: workspace orchestrator, /api/workspaces/[id]/run"
    - "05-05 (created inline): workspace-store.ts, use-workspace-socket.ts"
    - "05-01: workspace types, queries, actions, shared-memory"
  provides:
    - "Workspace detail page at /t/[slug]/workspaces/[workspaceId]"
    - "ActivityFeed: auto-scroll, streaming chunks, View latest pill"
    - "AgentPanel: live status dots, status-flash, start collaboration"
    - "SharedMemoryPanel: collapsible, strategy tags, compression indicator"
    - "WorkspaceSettingsSheet: 3 tabs, unsaved changes, updateWorkspace action"
    - "ConflictResolutionCard: conflictEnter animation, vote tally, resolved state"
    - "SocketStatusIndicator: 3-state connection dot"
    - "useWorkspaceStore: zustand store (created, not in 05-05)"
    - "useWorkspaceSocket: Socket.IO hook (created, not in 05-05)"
  affects:
    - "05-07: workspace list page can now link to detail page"
tech_stack:
  added:
    - "socket.io-client: connected via useWorkspaceSocket hook"
    - "zustand@5: workspace-store with Map-based agentStatuses + streamingChunks"
  patterns:
    - "Server component fetches data, client wrapper handles real-time"
    - "Framer Motion AnimatePresence for View latest pill and memory panel collapse"
    - "CSS keyframe statusFlash for real-time agent status border pulse (low overhead)"
    - "Radix Tabs for settings sheet 3-tab layout"
key_files:
  created:
    - packages/web/lib/realtime/workspace-store.ts
    - packages/web/lib/realtime/use-workspace-socket.ts
    - packages/web/app/(tenant)/t/[slug]/workspaces/[workspaceId]/page.tsx
    - packages/web/app/(tenant)/t/[slug]/workspaces/[workspaceId]/workspace-detail-client.tsx
    - packages/web/components/workspace/workspace-detail-header.tsx
    - packages/web/components/workspace/activity-feed.tsx
    - packages/web/components/workspace/agent-panel.tsx
    - packages/web/components/workspace/socket-status-indicator.tsx
    - packages/web/components/workspace/context-compression-indicator.tsx
    - packages/web/components/workspace/shared-memory-panel.tsx
    - packages/web/components/workspace/conflict-resolution-card.tsx
    - packages/web/components/workspace/workspace-settings-sheet.tsx
    - packages/web/src/__tests__/workspace/workspace-detail.test.ts
  modified:
    - packages/web/lib/motion.ts (added conflictEnter variant)
    - packages/web/app/globals.css (added statusFlash + status-pulse keyframes)
decisions:
  - "Created workspace-store.ts and use-workspace-socket.ts inline (05-05 not yet executed) -- these are prerequisites for the detail page components; created per Rule 3 blocking fix"
  - "Agent model fields use model_provider/model_name (not model) -- matches actual DB schema in lib/agent/types.ts"
  - "Workspace detail page uses server component + client wrapper pattern -- server fetches all data, client wrapper calls useWorkspaceSocket and wires store"
  - "Activity feed conflict items parse JSON from event.content -- allows ConflictResolutionCard to receive structured props inline in the feed"
  - "AgentPanel desktop-only via hidden md:flex -- mobile access via sheet triggered from header View agents button"
metrics:
  duration: "~9 minutes"
  completed_date: "2026-04-12"
  tasks: 2
  files: 15
---

# Phase 05 Plan 06: Workspace Detail UI Summary

**One-liner:** Workspace detail page with live activity feed, real-time agent status panel, collapsible shared memory, settings sheet (3 tabs), and Socket.IO zustand infrastructure.

## What Was Built

### lib/realtime/workspace-store.ts
Zustand store (created as 05-05 dependency was absent). Manages `connectionStatus`, `agentStatuses` (Map), `activityFeed` (capped at 500 events), and `streamingChunks` (Map). All state transitions tested with 20 vitest assertions.

### lib/realtime/use-workspace-socket.ts
Socket.IO client hook. Connects to Go worker at `NEXT_PUBLIC_WORKER_SOCKET_URL`, joins workspace room with composite `tenantId:workspaceId`, handles reconnect (REAL-05 rejoin), maps all socket events (`agent:status`, `agent:message`, `agent:chunk`, `agent:done`) to zustand store actions.

### Workspace detail page
Server component fetches workspace, agents, memory, and available agents. Client wrapper `WorkspaceDetailClient` calls `useWorkspaceSocket` to connect, builds `agentNames` map for feed display, and manages settings/agent sheet open state. Staggered Framer Motion entrance: header (0ms), feed (60ms), agent panel (120ms).

### ActivityFeed
Auto-scroll to bottom on new events; shows "View latest" pill (jumpToLatest variant + AnimatePresence) when user has scrolled up. Three event types: `system_event` (Info icon), `agent_message` (name chip + content bubble with #131316 bg), `conflict` (renders ConflictResolutionCard). Streaming chunks shown with blinking cursor. Empty state copy matches UI spec. All content rendered as React text nodes (XSS-safe by default).

### AgentPanel
320px desktop right panel. Per-agent status dot updates from zustand `agentStatuses`. CSS `statusFlash` animation fires on status change via `useEffect` + ref comparison. Active agents get `border-left: 2px solid blue-500`. Start collaboration POSTs to `/api/workspaces/[id]/run`.

### SocketStatusIndicator
Three states with correct colors and aria-labels: connected (green solid, "Live" hidden on narrow), reconnecting (amber pulsing via `status-pulse`, "Reconnecting..."), disconnected (red static, "Offline").

### SharedMemoryPanel
Collapsible with Framer Motion height animation (spring damping 25). Header shows memory strategy tag (colored per spec) + ContextCompressionIndicator right-aligned. Memory entries show agent name, strategy tag, timestamp, truncated content with "Show more" toggle.

### ContextCompressionIndicator
Only visible when `compressionEnabled && usage >= 50%`. Token count in `font-mono`, progress bar with CSS `transition-[width] duration-400`. Color thresholds: <60% blue, 60-80% amber, >80% red. Warning tooltip text matches copywriting contract.

### ConflictResolutionCard
`conflictEnter` Framer Motion variant. Proposal A/B with agent names, truncated text, expand toggle. Vote tally badges re-mount with key change for count-up effect. Resolved state shifts background/border to green. Status badge toggles amber/green.

### WorkspaceSettingsSheet
`slideInRight` animation, w-[480px] desktop / full-screen mobile. Three Radix tabs with 150ms fade + translateX +/-8px content transition. General tab: name input, description textarea, agent checkboxes with model chip. Collaboration tab: mode select with descriptions, conditional conflict resolution and max concurrent inputs. Memory tab: strategy select with descriptions, compression toggle, threshold input. Footer: "Unsaved changes" amber warning when dirty, Cancel/Save buttons. Calls `updateWorkspace` server action on save.

## Test Results

| Suite | Tests | Result |
|-------|-------|--------|
| workspace-detail.test.ts | 20 | PASS |
| **Total new** | **20** | **ALL PASS** |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] workspace-store.ts and use-workspace-socket.ts missing (05-05 not executed)**
- **Found during:** Task 1 setup -- detail page imports both files
- **Issue:** Plan 05-05 had not been executed in this worktree. Both realtime files were required by the detail page components.
- **Fix:** Created `packages/web/lib/realtime/workspace-store.ts` and `packages/web/lib/realtime/use-workspace-socket.ts` implementing the full interface specified in 05-05-PLAN.md.
- **Files modified:** Both new files
- **Commits:** 4c13482

**2. [Rule 1 - Bug] Agent model field mismatch**
- **Found during:** TypeScript compilation -- `model` column does not exist on agents table
- **Issue:** Agent schema uses `model_provider` + `model_name`, not `model`
- **Fix:** Updated all interfaces and display strings in page.tsx, workspace-detail-client.tsx, agent-panel.tsx, workspace-settings-sheet.tsx
- **Files modified:** 4 files
- **Commit:** 4c13482 (same commit, caught pre-commit)

**3. [Rule 3 - Blocking] pnpm deps not installed in worktree**
- **Found during:** Running vitest -- `vitest: command not found`
- **Issue:** This worktree had no node_modules installed
- **Fix:** Ran `pnpm install --frozen-lockfile` from worktree root
- **Files modified:** node_modules (not committed)

## Known Stubs

None. All components are fully wired to real data sources and zustand store.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-05-19 | WorkspaceSettingsSheet validates with zod workspaceFormSchema client-side; updateWorkspace server action re-validates |
| T-05-20 | readSharedMemory uses Supabase server client with user session; RLS enforces tenant isolation |
| T-05-21 | All agent message content rendered as React text nodes only (XSS-safe by default); no raw HTML injection used anywhere in the feed |

## Self-Check: PASSED

Files exist:
- packages/web/lib/realtime/workspace-store.ts: FOUND
- packages/web/lib/realtime/use-workspace-socket.ts: FOUND
- packages/web/app/(tenant)/t/[slug]/workspaces/[workspaceId]/page.tsx: FOUND
- packages/web/components/workspace/activity-feed.tsx: FOUND
- packages/web/components/workspace/agent-panel.tsx: FOUND
- packages/web/components/workspace/socket-status-indicator.tsx: FOUND
- packages/web/components/workspace/shared-memory-panel.tsx: FOUND
- packages/web/components/workspace/workspace-settings-sheet.tsx: FOUND
- packages/web/components/workspace/conflict-resolution-card.tsx: FOUND
- packages/web/components/workspace/context-compression-indicator.tsx: FOUND
- packages/web/src/__tests__/workspace/workspace-detail.test.ts: FOUND

Commits exist:
- 4c13482: feat(05-06): workspace detail page, activity feed, agent panel, socket infrastructure
- bdc122e: feat(05-06): shared memory panel, settings sheet, conflict card, compression indicator
