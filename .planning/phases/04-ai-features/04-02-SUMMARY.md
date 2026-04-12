---
phase: 04-ai-features
plan: 02
subsystem: mcp-client
tags: [mcp, tool-calling, vercel-ai-sdk, streaming, cost-tracking]
dependency_graph:
  requires: [04-01]
  provides: [mcp-client, tool-registry, chat-tool-integration]
  affects: [packages/web/lib/mcp, packages/web/app/api/chat]
tech_stack:
  added: []
  patterns: [singleton-mcp-client, json-schema-to-zod, graceful-degradation, tool-cost-tracking]
key_files:
  created:
    - packages/web/lib/mcp/client.ts
    - packages/web/lib/mcp/client.test.ts
    - packages/web/lib/mcp/tool-registry.ts
    - packages/web/lib/mcp/tool-registry.test.ts
    - packages/web/app/api/chat/route.test.ts
  modified:
    - packages/web/app/api/chat/route.ts
decisions:
  - Used vi.hoisted() pattern for vitest mock factories to share mock refs across hoisted vi.mock calls
  - callTool takes 3 args (params, resultSchema, options) per SDK v1.29.0 -- signal goes in third arg
  - CoreTool<any,any> type used for agentTools to satisfy streamText generic constraints
  - Json type from shared types for input/output fields in tool_executions insert
metrics:
  duration: 558s
  completed: "2026-04-12T07:11:20Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 19
  tests_passing: 19
---

# Phase 04 Plan 02: MCP Client Integration and Chat Tool Calling Summary

Singleton MCP client connecting to Go worker via StreamableHTTPClientTransport, tool registry converting MCP tools to Vercel AI SDK format with zod schemas and 30s abort signals, chat route wired with maxSteps=10 and tool_executions cost tracking.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | MCP client singleton + tool registry with tests | 7fa384f | client.ts, tool-registry.ts, 2 test files |
| 2 | Wire tools into chat route + tool execution tracking | 5a97c7e | route.ts, route.test.ts |

## What Was Built

### Task 1: MCP Client and Tool Registry
- **client.ts**: Singleton `getMcpClient()` creates `Client` with `StreamableHTTPClientTransport` to `WORKER_MCP_URL` (default `http://worker:3001/mcp`). `resetMcpClient()` for testing/reconnect. Connection failures throw descriptive errors and clear singleton.
- **tool-registry.ts**: `buildAiToolsFromMcp(client)` calls `client.listTools()`, converts each MCP tool to Vercel AI SDK `tool()` with dynamically built zod schema from JSON Schema properties. Supports string, number, integer, boolean, array types. Execute function calls `client.callTool()` with `AbortSignal.timeout(30000)` in options.
- **getAgentTools()**: Filters tool record to only those assigned to the agent.

### Task 2: Chat Route Integration
- Chat route loads MCP tools before `streamText`, filtered by `agent.tools` column
- `maxSteps: 10` enables multi-step tool use
- Graceful degradation: MCP connection failure logs warning, streams without tools
- `onFinish` callback iterates `steps[].toolCalls` and records each in `tool_executions` with:
  - `tenant_id` from agent record (RLS-safe, not from user input)
  - `cost_usd` from static `TOOL_COSTS` map per tool type
  - `status` ('success' or 'error') based on whether toolResult exists
  - `input`/`output` cast to Json type for Supabase compatibility

## Decisions Made

1. **vi.hoisted() for mock sharing** -- Vitest hoists vi.mock() above all imports; vi.hoisted() creates refs that both the mock factory and test code can access
2. **callTool 3-arg signature** -- SDK v1.29.0 callTool takes (params, resultSchema, options); AbortSignal goes in the third arg, not the second
3. **CoreTool generic type** -- streamText requires `Record<string, CoreTool<any, any>>` for tools; raw `Record<string, unknown>` doesn't satisfy the constraint
4. **Static cost map** -- Tool costs are estimates per type, not actual API costs; sufficient for usage monitoring

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] callTool signature differs from plan**
- **Found during:** Task 1 type checking
- **Issue:** Plan showed `client.callTool(params, { signal })` but SDK v1.29.0 signature is `callTool(params, resultSchema?, options?)`
- **Fix:** Passed signal as third argument: `callTool(params, undefined, { signal })`
- **Files modified:** tool-registry.ts, tool-registry.test.ts
- **Commit:** 5a97c7e

**2. [Rule 1 - Bug] TypeScript strict mode type mismatches**
- **Found during:** Task 2 tsc --noEmit
- **Issue:** `Record<string, unknown>` not assignable to `Record<string, CoreTool<any, any>>` for streamText tools; `unknown` args/result not assignable to supabase `Json` type
- **Fix:** Added proper CoreTool type for agentTools, Json casts for insert fields
- **Files modified:** route.ts
- **Commit:** 5a97c7e

## Test Coverage

| File | Tests | Status |
|------|-------|--------|
| lib/mcp/client.test.ts | 5 | All passing |
| lib/mcp/tool-registry.test.ts | 8 | All passing |
| app/api/chat/route.test.ts | 6 | All passing |
| **Total** | **19** | **All passing** |

## Threat Mitigations Applied

| Threat ID | Mitigation | Status |
|-----------|-----------|--------|
| T-04-08 | AbortSignal.timeout(30000) on every callTool; maxSteps=10 caps invocations | Applied |
| T-04-09 | tenant_id from agent record (RLS-fetched), not user input | Applied |
| T-04-10 | WORKER_MCP_URL internal Docker URL; graceful degradation on failure | Applied |
| T-04-12 | Auth check (getUser) exists before any tool execution path | Pre-existing |

## Known Stubs

None. All functions are fully wired to production MCP client and Supabase.

## Self-Check: PASSED
