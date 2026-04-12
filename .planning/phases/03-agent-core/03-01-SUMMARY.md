---
phase: 03-agent-core
plan: 01
subsystem: agent-core
tags: [ai-adapters, agent-crud, chat, rbac, zod, server-actions]
dependency_graph:
  requires: [rbac/checker, auth/server, tenant/actions-pattern]
  provides: [ai/adapter, ai/registry, agent/types, agent/actions, agent/queries, chat/actions, chat/queries]
  affects: [agent-ui, chat-ui, streaming]
tech_stack:
  added: ["@ai-sdk/openai@0.0.72", "@ai-sdk/anthropic@0.0.56"]
  patterns: [provider-adapter, registry-pattern, server-actions-crud, zod-validation]
key_files:
  created:
    - packages/web/lib/ai/adapter.ts
    - packages/web/lib/ai/openai-adapter.ts
    - packages/web/lib/ai/anthropic-adapter.ts
    - packages/web/lib/ai/registry.ts
    - packages/web/lib/agent/types.ts
    - packages/web/lib/agent/actions.ts
    - packages/web/lib/agent/queries.ts
    - packages/web/lib/chat/actions.ts
    - packages/web/lib/chat/queries.ts
    - packages/web/src/__tests__/agent/types.test.ts
    - packages/web/src/__tests__/ai/registry.test.ts
    - packages/web/src/__tests__/agent/actions.test.ts
    - packages/web/src/__tests__/chat/actions.test.ts
  modified:
    - packages/web/package.json
    - pnpm-lock.yaml
decisions:
  - "Used adapter pattern for AI providers to allow easy extension"
  - "Registry uses Map with lazy init via initProviders for testability"
  - "Agent actions return {data, error} pattern matching existing tenant actions"
metrics:
  duration: 286s
  completed: "2026-04-12T06:07:18Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 26
  files_created: 13
  files_modified: 2
---

# Phase 03 Plan 01: Agent Core Backend Foundation Summary

AI provider adapter layer with OpenAI/Anthropic implementations, agent CRUD server actions with RBAC enforcement, conversation/message server actions, Zod validation schemas, and 26 unit tests.

## Task Results

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | AI provider adapter + agent types + Zod schemas + tests | df1c376 | Done |
| 2 | Agent CRUD server actions + queries + chat actions/queries + tests | 0deb61c | Done |

## What Was Built

### AI Provider Layer (4 files)
- `AIProviderAdapter` interface with `getModel(modelName)` returning Vercel AI SDK `LanguageModel`
- `OpenAIAdapter` and `AnthropicAdapter` implementations reading API keys from env vars
- Registry pattern: `registerProvider`, `getProvider`, `initProviders` with idempotent initialization

### Agent Types (1 file)
- `SUPPORTED_PROVIDERS`: openai, anthropic
- `PROVIDER_MODELS`: maps each provider to available model names
- `agentFormSchema`: Zod schema validating name (1-100), description (max 500), system_prompt (max 10000), model_provider (enum), model_name, temperature (0-2), max_tokens (1-128000), tools (string array)
- `AVAILABLE_TOOLS`: placeholder tool names for Phase 4

### Agent CRUD Actions (2 files)
- `createAgent`: auth check, `agent:create` RBAC, Zod parse, Supabase insert, revalidatePath
- `updateAgent`: auth check, `agent:update` RBAC, Zod parse, Supabase update by ID
- `deleteAgent`: auth check, `agent:delete` RBAC, Supabase delete with tenant_id guard
- `listAgents`: query by tenant_id, ordered by created_at desc
- `getAgent`: query by agent ID, single result

### Chat Actions (2 files)
- `createConversation`: auth check, insert with agent_id + user_id + tenant_id
- `deleteConversation`: auth check, delete by ID
- `saveMessage`: auth check, insert with conversation_id, tenant_id, role, content
- `listConversations`: query by tenant_id + agent_id, ordered by updated_at desc
- `getMessages`: query by conversation_id, ordered by created_at asc

### Tests (4 files, 26 tests)
- `types.test.ts`: 10 tests for Zod schema validation + provider constants
- `registry.test.ts`: 5 tests for provider registry lifecycle
- `actions.test.ts`: 5 tests for agent CRUD auth/permission/success paths
- `chat/actions.test.ts`: 6 tests for conversation/message operations

## Threat Mitigations Applied

| Threat ID | Mitigation | Verified |
|-----------|-----------|----------|
| T-03-01 (Spoofing) | Every action calls `getUser()` first; returns error on null | Yes, tested |
| T-03-02 (Elevation) | `hasPermission()` with agent:create/update/delete before DB ops | Yes, tested |
| T-03-03 (Tampering) | `agentFormSchema.parse(formData)` validates all input | Yes, tested |
| T-03-04 (Cross-tenant) | All queries filter by tenant_id; delete uses dual eq guard | Yes |
| T-03-05 (API key disclosure) | Keys read from server env vars only; never in DB or client | Yes |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All exports are fully wired implementations.

## Self-Check: PASSED

- All 13 created files exist on disk
- Commit df1c376 found in git log
- Commit 0deb61c found in git log
- 26/26 tests passing
