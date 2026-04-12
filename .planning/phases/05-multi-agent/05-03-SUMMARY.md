---
phase: 05-multi-agent
plan: "03"
subsystem: memory
tags: [memory, ai-sdk, vector, compression, tdd]
dependency_graph:
  requires: ["05-01"]
  provides: ["memory-strategies", "context-compression"]
  affects: ["chat-route", "agent-invocation"]
tech_stack:
  added: []
  patterns: ["CoreMessage[] composition", "tenant-scoped hybridSearch", "generateText summarization", "context window compression"]
key_files:
  created:
    - packages/web/lib/memory/types.ts
    - packages/web/lib/memory/conversation.ts
    - packages/web/lib/memory/summary.ts
    - packages/web/lib/memory/vector.ts
    - packages/web/lib/memory/hybrid.ts
    - packages/web/lib/memory/compression.ts
    - packages/web/lib/memory/__tests__/conversation.test.ts
    - packages/web/lib/memory/__tests__/summary.test.ts
    - packages/web/lib/memory/__tests__/vector.test.ts
    - packages/web/lib/memory/__tests__/hybrid.test.ts
    - packages/web/lib/memory/__tests__/compression.test.ts
  modified: []
decisions:
  - "Placeholder embedding (1536 zeros) used for hybridSearch in vector.ts — real embedding generation deferred to Phase 6 when embedding model is wired"
  - "microcompactMessages accepts a generateText function parameter to allow injection in tests without module mocking"
  - "collapseMessages: slice(-0) returns all elements in JS — explicit keepLast===0 guard added"
  - "SUMMARY_KEEP_RECENT=4 and VECTOR_KEEP_RECENT=4 as defaults for recent message windows"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-12"
  tasks_completed: 3
  files_created: 11
  files_modified: 0
---

# Phase 05 Plan 03: Memory Strategy System Summary

**One-liner:** Five CoreMessage[] memory strategies (conversation, summary, vector, hybrid) plus snip/microcompact/collapse compression utilities using ai@3.4.33 generateText and hybridSearch.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 (RED) | Write all 5 failing test files | 257d610 |
| 2 (GREEN) | Implement all 5 strategy files + types | cfc90d3 |
| 3 (REFACTOR) | Fix test assertion errors (order check, keepLast=0 edge case) | 065de2b |

## What Was Built

### Memory Strategies

**`types.ts`** — `MemoryBuildParams` interface and `buildContextMessages` router that dynamic-imports the correct strategy module based on the `strategy` field.

**`conversation.ts`** — Fetches full message history from Supabase `messages` table scoped by `conversation_id` + `tenant_id`, maps to `CoreMessage[]`, prepends `systemPrompt` if provided.

**`summary.ts`** — Fetches all messages, splits into older/recent windows (SUMMARY_KEEP_RECENT=4). When `model` is provided, calls `generateText` with hardcoded summarization prompt ("Summarize this conversation in under 200 words, preserving key decisions and facts.") to compress older messages into a system context message.

**`vector.ts`** — Calls `hybridSearch` from `@/lib/vector/search` with `currentPrompt` as `queryText` and `tenantId` for RLS-enforced scoping. Injects search results as `role: 'system'` messages before recent conversation history. Uses placeholder embedding (1536 zeros) pending real embedding generation.

**`hybrid.ts`** — Composes `buildSummaryMemory` + `buildVectorMemory` in parallel, places summary system messages first, then vector context system messages, then deduplicated conversation messages.

**`compression.ts`** — Pure utility functions:
- `estimateTokens(text)`: `Math.ceil(text.length / 4)` 
- `snipMessages(messages, maxMessages)`: preserves all system messages + last N non-system messages
- `collapseMessages(messages, keepLast)`: hard truncation to last N messages (handles keepLast=0 edge case)
- `microcompactMessages(model, messages, keepLast, generateText)`: injectable generateText to summarize older messages into a single system message

### Test Results

All 27 tests passing across 5 test files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect test assertions in compression.test.ts**
- **Found during:** GREEN phase — tests failed with wrong expected values
- **Issue:** `snipMessages` order test asserted `assistantMsg4` at index 1, but the actual last-3 non-system messages from the 9-element input are `[userMsg4, assistantMsg4, userMsg5]`; `collapseMessages` with `keepLast=0` relied on `slice(-0)` which returns the full array in JavaScript
- **Fix:** Corrected test assertions; added `if (keepLast === 0) return []` guard in `collapseMessages`
- **Files modified:** `compression.test.ts`, `compression.ts`
- **Commit:** 065de2b

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| `PLACEHOLDER_EMBEDDING` (1536 zeros) | `packages/web/lib/memory/vector.ts` | 7 | Real embedding generation (e.g., OpenAI text-embedding-3-small) not yet wired. hybridSearch still receives a valid-shape embedding. Future plan wires the embedding model. |

## Threat Surface Scan

All DB queries in conversation.ts, summary.ts, and vector.ts scope by both `conversation_id` and `tenant_id`, consistent with threat T-05-09 mitigation. Summary prompt is hardcoded server-side (T-05-11 mitigation). No new trust boundaries introduced beyond what the plan's threat model covers.

## Self-Check

Files exist:
- `packages/web/lib/memory/types.ts` — created
- `packages/web/lib/memory/conversation.ts` — created
- `packages/web/lib/memory/summary.ts` — created
- `packages/web/lib/memory/vector.ts` — created
- `packages/web/lib/memory/hybrid.ts` — created
- `packages/web/lib/memory/compression.ts` — created
- All 5 test files — created

Commits verified: 257d610, cfc90d3, 065de2b

## Self-Check: PASSED
