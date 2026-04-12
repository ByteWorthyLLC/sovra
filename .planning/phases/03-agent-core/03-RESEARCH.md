# Phase 3: Agent Core - Research

**Researched:** 2026-04-12
**Domain:** Agent CRUD + LLM provider abstraction + streaming chat UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

All implementation choices are at Claude's discretion -- discuss phase was skipped per user setting. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

### Claude's Discretion

Key constraints from prior phases:
- AuthAdapter interface pattern (swappable providers) -- extend this pattern to AI providers
- Tenant-scoped everything -- all agent and conversation data must be tenant-isolated via RLS
- Premium UI/UX (Linear/Vercel-level polish, Framer Motion, glass morphism, dark-mode-first)
- Hormozi/Hughes copywriting -- no em dashes anywhere
- Open-source flexibility -- interfaces at every boundary, swappable LLM providers

### Deferred Ideas (OUT OF SCOPE)

None -- discuss phase skipped.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AGNT-01 | Agent CRUD operations | Supabase `agents` table exists with full schema; RLS policies in place; use Server Actions + TanStack Query |
| AGNT-02 | Model configuration (provider, name, temperature, max_tokens) | DB columns exist; AI provider adapter pattern researched; Zod validation schema designed |
| AGNT-03 | Agent tools assignment | `tools` JSONB column in `agents` table; tool list stored as JSON array; enum-constrained tool names |
| AGNT-04 | System prompt configuration | `system_prompt TEXT` column exists; passed to `streamText` as `system` param |
| AGNT-05 | Agent status tracking (idle, running, error) | `status` column with CHECK constraint; update on stream start/end; optimistic UI |
| CHAT-01 | Real-time chat UI | useChat hook from `ai/react`; Framer Motion message animations; existing motion utilities |
| CHAT-02 | Streaming responses via Vercel AI SDK | `streamText` + `.toDataStreamResponse()` in route handler; `useChat` on client |
| CHAT-03 | Message history persistence | Save user message before API call; save assistant message in `onFinish` callback |
| CHAT-04 | Conversation creation and management | `conversations` table exists; create on first message or explicit action; list/delete operations |
| CHAT-05 | Chat input with file/code support | Textarea with auto-resize; code highlighting via `<pre>`; file attachment as base64 attachment |
</phase_requirements>

---

## Summary

Phase 3 builds on a complete foundation: all 14 database tables exist with RLS policies, the AuthAdapter interface pattern and TenantContext are in place, and the UI component library (Button, Input, Card, Avatar, Badge, motion utilities) is ready to use. The core work is: (1) a LLM provider abstraction layer mirroring AuthAdapter, (2) agent CRUD with Server Actions + TanStack Query, and (3) a streaming chat UI with message persistence.

The installed Vercel AI SDK is `ai@3.4.33` (not v4+ or v6). This version uses `streamText` returning `.toDataStreamResponse()` on the server, and `useChat` from `ai/react` returning `{ messages, input, handleInputChange, handleSubmit, isLoading, stop }` on the client. The v6 API (`UIMessage`, `convertToModelMessages`, `toUIMessageStreamResponse`, `sendMessage`) is NOT available in the installed version and must not be used.

LLM provider packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`) are not yet installed. They need to be added at `0.0.x` versions to match `ai@3.4.33`'s `@ai-sdk/provider@0.0.26` peer dependency. Staying on `ai@3.x` is correct -- upgrading to v4/v6 is a separate decision outside this phase scope.

**Primary recommendation:** Build an `AIProviderAdapter` interface (mirroring `AuthAdapter`), implement `OpenAIAdapter` and `AnthropicAdapter`, wire `streamText` to the selected adapter, and use `useChat` with the standard 3.4.x API for all streaming UI.

---

## Project Constraints (from CLAUDE.md)

| Constraint | Source | Impact on Phase 3 |
|------------|--------|-------------------|
| AuthAdapter interface pattern -- extend to AI providers | CONTEXT.md | `AIProviderAdapter` interface required; no hardcoded provider |
| Tenant-scoped everything via RLS | CONTEXT.md | All agent/conversation queries must include `tenant_id`; RLS enforces at DB level |
| Premium UI (Linear/Vercel-level, Framer Motion, glass morphism, dark-mode-first) | CONTEXT.md | Chat UI and agent list must use existing motion utilities and glass card patterns |
| No em dashes anywhere | CONTEXT.md | Copy review on all strings |
| Open-source flexibility -- interfaces at every boundary | CONTEXT.md | Provider, message persistence, tool registry all behind interfaces |
| `npm run test && npm run lint && npm run type-check` before commit | CLAUDE.md | Test coverage for agent actions, provider adapter, message persistence |
| No parallel test suites | global CLAUDE.md | Run `vitest run` sequentially |
| Security: all API routes check authentication | CLAUDE.md | Chat route handler must verify session via Supabase SSR client |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 3.4.33 (installed) | `streamText`, `StreamingTextResponse`, `StreamData` | Already installed; v3 API stable |
| `@ai-sdk/openai` | 0.0.72 | OpenAI/GPT provider for `streamText` | Matches `@ai-sdk/provider@0.0.26` in ai@3.4.33 |
| `@ai-sdk/anthropic` | 0.0.56 | Anthropic/Claude provider | Same provider API, same version era |
| `@supabase/supabase-js` | ^2.103.0 (installed) | Agent/conversation/message CRUD | Already wired; RLS in place |
| `@tanstack/react-query` | ^5.60.0 (installed) | Client-side data fetching + cache invalidation | Already installed; used in Phase 2 |
| `zod` | ^3.24.1 (installed) | Agent form validation | Already installed |
| `framer-motion` | ^12.38.0 (installed) | Chat message animations | Already installed; motion utilities at `lib/motion.ts` |
| `zustand` | ^5.0.0 (installed) | Chat UI local state (streaming status, optimistic messages) | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.469.0 (installed) | Agent/chat icons (Bot, Send, Stop, Trash) | All icon needs |
| `@radix-ui/react-dialog` | ^1.1.2 (installed) | Agent create/edit modal | Modal forms |
| `@radix-ui/react-select` | ^2.1.2 (installed) | Provider/model dropdown | Form selects |
| `@radix-ui/react-tabs` | ^1.1.1 (installed) | Agent edit tabs (General, Model, Tools, Prompt) | Tabbed forms |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `ai@3.4.33` | Upgrade to `ai@6.x` | v6 has better API (`UIMessage`, tool streaming) but breaks existing 3.x API; upgrade is out of scope for this phase |
| Server Actions for agent CRUD | REST API routes | Server Actions integrate better with Next.js revalidation; no extra route files |
| TanStack Query | SWR | TQ already installed and used; no reason to add SWR |

**Installation:**
```bash
cd packages/web
pnpm add @ai-sdk/openai@0.0.72 @ai-sdk/anthropic@0.0.56
```

**Version verification:** [VERIFIED: npm registry] `@ai-sdk/openai@0.0.72` and `@ai-sdk/anthropic@0.0.56` both depend on `@ai-sdk/provider@0.0.26`, which matches `ai@3.4.33`'s bundled version exactly.

---

## Architecture Patterns

### Recommended Project Structure
```
packages/web/
├── app/
│   ├── (tenant)/t/[slug]/
│   │   ├── agents/
│   │   │   ├── page.tsx              # Agent list page
│   │   │   ├── [agentId]/
│   │   │   │   ├── page.tsx          # Agent detail / chat page
│   │   │   │   └── edit/page.tsx     # Agent edit page
│   │   │   └── new/page.tsx          # Agent creation page
│   ├── api/
│   │   └── chat/route.ts             # POST streaming route handler
├── components/
│   ├── agent/
│   │   ├── agent-card.tsx            # Agent list card
│   │   ├── agent-form.tsx            # Create/edit form (shared)
│   │   ├── agent-status-badge.tsx    # idle/running/error badge
│   │   └── agent-tools-selector.tsx  # Multi-select tool assignment
│   ├── chat/
│   │   ├── chat-container.tsx        # Full chat UI wrapper
│   │   ├── message-list.tsx          # Scrollable message history
│   │   ├── message-bubble.tsx        # Individual message with streaming
│   │   ├── chat-input.tsx            # Textarea + send + stop
│   │   └── conversation-sidebar.tsx  # Conversation list + new/delete
├── lib/
│   ├── ai/
│   │   ├── adapter.ts                # AIProviderAdapter interface
│   │   ├── openai-adapter.ts         # OpenAI implementation
│   │   ├── anthropic-adapter.ts      # Anthropic implementation
│   │   └── registry.ts               # Provider factory: string -> adapter
│   ├── agent/
│   │   ├── actions.ts                # Server Actions: createAgent, updateAgent, deleteAgent
│   │   ├── queries.ts                # Supabase fetch helpers: getAgent, listAgents
│   │   └── types.ts                  # AgentFormData, AgentConfig Zod schemas
│   └── chat/
│       ├── actions.ts                # Server Actions: createConversation, deleteConversation, saveMessage
│       └── queries.ts                # getMessages, listConversations
```

### Pattern 1: AIProviderAdapter Interface (extends AuthAdapter pattern)

**What:** Thin interface that wraps `streamText` calls. Each provider returns a `StreamTextResult` that the route handler converts to a response. The adapter pattern means swapping from OpenAI to Anthropic requires only changing the `model_provider` field in the agent config.

**When to use:** Every time the chat route handler calls an LLM.

**Example:**
```typescript
// lib/ai/adapter.ts
// [VERIFIED: matches ai@3.4.33 streamText signature from installed type definitions]
import type { LanguageModel, StreamTextResult, CoreTool } from 'ai'

export interface AIProviderAdapter {
  readonly provider: string
  getModel(modelName: string): LanguageModel
}

// lib/ai/openai-adapter.ts
import { createOpenAI } from '@ai-sdk/openai'
import type { AIProviderAdapter } from './adapter'

export class OpenAIAdapter implements AIProviderAdapter {
  readonly provider = 'openai'
  private client = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

  getModel(modelName: string) {
    return this.client(modelName)
  }
}

// lib/ai/registry.ts
const registry = new Map<string, AIProviderAdapter>()

export function registerProvider(adapter: AIProviderAdapter) {
  registry.set(adapter.provider, adapter)
}

export function getProvider(name: string): AIProviderAdapter {
  const adapter = registry.get(name)
  if (!adapter) throw new Error(`Unknown provider: ${name}`)
  return adapter
}
```

### Pattern 2: Chat Route Handler (ai@3.4.33 API)

**What:** POST route at `/api/chat` that receives `{ messages, agentId, conversationId }`, loads agent config from Supabase, and streams back using the correct 3.4.x API.

**When to use:** Every streaming chat request.

**CRITICAL VERSION NOTE:** ai@3.4.33 uses `.toDataStreamResponse()` (NOT `.toUIMessageStreamResponse()` which is v6+). The `useChat` hook on the client sends `{ messages: Message[] }` by default.

```typescript
// app/api/chat/route.ts
// [VERIFIED: ai@3.4.33 streamText + toDataStreamResponse from installed type definitions]
import { streamText } from 'ai'
import { createSupabaseServerClient } from '@/lib/auth/server'
import { getProvider } from '@/lib/ai/registry'

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, agentId, conversationId } = await req.json()

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (!agent) return new Response('Agent not found', { status: 404 })

  const adapter = getProvider(agent.model_provider)
  const model = adapter.getModel(agent.model_name)

  const result = await streamText({
    model,
    system: agent.system_prompt ?? undefined,
    messages,
    temperature: agent.temperature,
    maxTokens: agent.max_tokens,
  })

  return result.toDataStreamResponse()
}
```

### Pattern 3: useChat on Client (ai@3.4.33 API)

**What:** `useChat` from `ai/react` (NOT `@ai-sdk/react` directly in app code -- go through the `ai` package re-export to avoid version drift).

**CRITICAL VERSION NOTE:** The 3.4.x hook returns `{ messages, input, handleInputChange, handleSubmit, isLoading, stop, append, reload }`. The v6 hook uses `sendMessage` -- this does NOT exist in 3.4.x.

```typescript
// components/chat/chat-container.tsx
// [VERIFIED: @ai-sdk/react@0.0.70 UseChatHelpers from installed type definitions]
'use client'
import { useChat } from 'ai/react'
import type { Message } from 'ai'

interface ChatContainerProps {
  agentId: string
  conversationId: string
  initialMessages: Message[]
}

export function ChatContainer({ agentId, conversationId, initialMessages }: ChatContainerProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat',
    id: conversationId,
    initialMessages,
    body: { agentId, conversationId },
    onFinish: async (message) => {
      // Persist assistant message to Supabase
      await saveAssistantMessage({ conversationId, message })
    },
  })
  // ...
}
```

### Pattern 4: Agent Server Actions

**What:** Server Actions in `lib/agent/actions.ts` for create, update, delete. The actions use the Supabase server client, check permissions via `hasPermission`, then revalidate the path.

```typescript
// lib/agent/actions.ts
// [ASSUMED] Following the exact pattern of lib/tenant/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/auth/server'
import { hasPermission } from '@/lib/rbac/checker'
import { agentFormSchema } from './types'

export async function createAgent(tenantId: string, formData: unknown) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const permitted = await hasPermission(supabase, user.id, tenantId, 'agent:create')
  if (!permitted) throw new Error('Forbidden')

  const validated = agentFormSchema.parse(formData)
  const { data, error } = await supabase.from('agents').insert({
    ...validated,
    tenant_id: tenantId,
    created_by: user.id,
  }).select().single()

  if (error) throw new Error(error.message)
  revalidatePath(`/t/[slug]/agents`)
  return data
}
```

### Pattern 5: Message Persistence During Streaming

**What:** User messages are saved to Supabase BEFORE the `useChat` hook fires (to guarantee persistence even if streaming fails). Assistant messages are saved in the `onFinish` callback after streaming completes.

**Why:** Saving mid-stream is complex and unnecessary. Users need the complete assistant message, not partial chunks.

```typescript
// Two-phase persistence:
// 1. Before submit: POST /api/messages to save user message
// 2. In onFinish: call saveAssistantMessage server action

// lib/chat/actions.ts
export async function saveMessage({ 
  conversationId, tenantId, role, content 
}: SaveMessageParams) {
  const supabase = await createSupabaseServerClient()
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    tenant_id: tenantId,
    role,
    content,
  })
}
```

### Anti-Patterns to Avoid
- **Using v6 API on v3 SDK:** `toUIMessageStreamResponse()`, `UIMessage`, `convertToModelMessages`, `sendMessage` do not exist in ai@3.4.33. Using them causes TypeScript errors and runtime failures.
- **Hardcoding OpenAI:** Agent `model_provider` field must route through the adapter registry, not be hardcoded in the route handler.
- **Missing tenant_id on insert:** The RLS `agents_insert` policy checks `tenant_id = get_current_tenant_id()`. Inserts without `tenant_id` fail silently. Always provide it explicitly.
- **Saving PHI in agent system prompts without attention:** System prompts are stored in plaintext in PostgreSQL. If prompts contain user PII, add a note in docs. Not a blocker for this project (not HIPAA).
- **Reading agent in route handler without RLS:** The server client uses the anon key + RLS. The route handler must use `createSupabaseServerClient()` (cookie-based auth), not a service role client, so RLS enforces tenant isolation.
- **Not updating agent status:** `status` must transition to `running` at stream start and back to `idle` at stream end (or `error` on failure). Not doing this breaks AGNT-05.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LLM streaming protocol | Custom SSE parser | `streamText().toDataStreamResponse()` | Handles backpressure, chunking, error encoding |
| Streaming UI state | Manual `useState` for chunks | `useChat` from `ai/react` | Handles append, loading state, error, abort |
| Provider API wrappers | Custom fetch to OpenAI/Anthropic | `@ai-sdk/openai`, `@ai-sdk/anthropic` | Retry logic, token counting, error normalization |
| Form validation | Custom validator | `zod` + existing pattern | Already used in Phase 2 auth forms |
| Permission checks | Manual role check | `hasPermission()` from `lib/rbac/checker` | Already implemented; test-covered |

---

## Common Pitfalls

### Pitfall 1: SDK Version API Mismatch
**What goes wrong:** Using v4/v6 API docs with ai@3.4.33. The docs at ai-sdk.dev now document v6. The installed version is 3.4.33.
**Why it happens:** Vercel AI SDK docs redirect to latest (v6). Training data may reference v4 API.
**How to avoid:** Always use `.toDataStreamResponse()` (not `.toUIMessageStreamResponse()`). Import `useChat` from `ai/react`. The `Message` type from `ai` has `{ id, role, content }` shape (not `parts` array which is v6).
**Warning signs:** TypeScript errors on `toUIMessageStreamResponse`, `UIMessage`, `sendMessage`, `convertToModelMessages`.

### Pitfall 2: get_current_tenant_id() Returns NULL
**What goes wrong:** Agent insert/select returns empty results or RLS violation.
**Why it happens:** `get_current_tenant_id()` reads from `tenant_users` using `auth.uid()`. If the user has no tenant membership, it returns NULL and all RLS policies fail.
**How to avoid:** Always verify tenant membership before agent operations. Use `useTenant()` context to get `tenantId` and pass it explicitly.
**Warning signs:** Empty agent lists when agents exist; insert succeeds but returns no data.

### Pitfall 3: Streaming Route Handler Not Handling Auth Errors
**What goes wrong:** Unauthenticated requests to `/api/chat` get 500 instead of 401.
**Why it happens:** `createSupabaseServerClient()` requires cookie context. In route handlers, this works only if cookies are forwarded correctly.
**How to avoid:** Always call `getUser()` first in the route handler and return `401` before calling `streamText`. The middleware already protects pages, but API routes need explicit auth checks.
**Warning signs:** 500 errors on chat; Supabase logs showing "JWT expired" or missing cookie.

### Pitfall 4: Provider Packages Version Mismatch
**What goes wrong:** `@ai-sdk/openai@3.0.52` (latest) installed alongside `ai@3.4.33` causes peer dep conflicts.
**Why it happens:** The major version bump in `@ai-sdk/openai@3.x` changed the provider interface; it requires `ai@4.x+`.
**How to avoid:** Use `@ai-sdk/openai@0.0.72` and `@ai-sdk/anthropic@0.0.56` -- the `0.0.x` era that matches `@ai-sdk/provider@0.0.26`.
**Warning signs:** pnpm peer dep warnings; `LanguageModel` type mismatch errors.

### Pitfall 5: Conversation Without Agent
**What goes wrong:** Chat page loads but messages fail to stream.
**Why it happens:** The `conversations` table has `agent_id` as nullable. If a conversation is created without an agent reference, the route handler can't load model config.
**How to avoid:** Create conversations with `agent_id` set. Validate on conversation creation. Handle null agent gracefully in the route handler.

---

## Code Examples

### Agent Zod Schema
```typescript
// lib/agent/types.ts
// [VERIFIED: matches agents table schema in migration 20260412004330_initial_schema.sql]
import { z } from 'zod'

export const SUPPORTED_PROVIDERS = ['openai', 'anthropic'] as const
export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number]

export const agentFormSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  system_prompt: z.string().max(10000).optional(),
  model_provider: z.enum(SUPPORTED_PROVIDERS),
  model_name: z.string().min(1),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().int().min(1).max(128000),
  tools: z.array(z.string()).default([]),
})

export type AgentFormData = z.infer<typeof agentFormSchema>

// Suggested models per provider
export const PROVIDER_MODELS: Record<SupportedProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
}
```

### Message Type for ai@3.4.33
```typescript
// [VERIFIED: Message type from @ai-sdk/ui-utils@0.0.50 via ai@3.4.33]
// Message shape in 3.4.x:
// { id: string, role: 'user' | 'assistant' | 'system' | 'function' | 'tool' | 'data', content: string }
// NOT the v6 shape with message.parts[]

import type { Message } from 'ai'

// Display pattern for 3.4.x:
function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={message.role === 'user' ? 'user-bubble' : 'assistant-bubble'}>
      {message.content}  {/* Direct string access, not message.parts */}
    </div>
  )
}
```

### Conversation Creation Server Action
```typescript
// lib/chat/actions.ts [ASSUMED - following actions.ts pattern from lib/tenant/actions.ts]
'use server'
import { createSupabaseServerClient } from '@/lib/auth/server'

export async function createConversation({
  tenantId, agentId, title
}: { tenantId: string; agentId: string; title?: string }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('conversations')
    .insert({ tenant_id: tenantId, agent_id: agentId, user_id: user.id, title })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
```

---

## State of the Art

| Old Approach | Current Approach (ai@3.4.33) | Impact |
|--------------|------------------------------|--------|
| `StreamingTextResponse` wrapper | `.toDataStreamResponse()` method | Deprecated but still works in 3.4.x |
| `experimental_streamText` | `streamText` (stable) | Direct import, no experimental prefix |
| `LangChainStream` | `streamText` with AI SDK providers | Better type safety, built-in retry |
| Manual SSE parsing | `useChat` hook | Handles protocol, reconnection, abort |

**Deprecated/outdated in 3.4.x:**
- `StreamingTextResponse`: Use `.toDataStreamResponse()` instead (StreamingTextResponse is still exported but deprecated)
- `experimental_onFunctionCall`: Use `onToolCall` instead
- `maxAutomaticRoundtrips`: Use `maxSteps` instead

---

## Existing Codebase What Already Exists

The following are ready to use without modification:

| Asset | Location | Use in Phase 3 |
|-------|----------|----------------|
| `useTenant()` hook | `lib/tenant/context.tsx` | Get `tenantId` in all agent/chat client components |
| `createSupabaseServerClient()` | `lib/auth/server.ts` | Server Actions + route handler auth |
| `createSupabaseBrowserClient()` | `lib/auth/client.ts` | Client-side queries in TanStack Query |
| `hasPermission()` | `lib/rbac/checker.ts` | RBAC check in agent Server Actions |
| `TRANSITIONS` + `VARIANTS` | `lib/motion.ts` | Chat message animations, agent card enter |
| `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Skeleton`, `Spinner`, `EmptyState` | `components/ui/` | All agent and chat UI |
| `FormField` | `components/ui/form-field.tsx` | Agent create/edit form fields |
| `ToastProvider` (from Radix) | `components/ui/toast-provider.tsx` | Error/success toasts on CRUD |
| `DEFAULT_PERMISSIONS` | `lib/rbac/constants.ts` | `agent:create`, `agent:read`, `agent:update`, `agent:delete` all defined |
| `agents` table + RLS | `supabase/migrations/20260412004330_initial_schema.sql` | Full CRUD ready |
| `conversations` table + RLS | same migration | Create/list/delete ready |
| `messages` table + RLS | same migration | Persist all message roles |
| `Database` type | `packages/shared/types/database.ts` | Full TypeScript types for all tables |
| Sidebar nav (disabled Agents link) | `components/tenant/sidebar-nav.tsx` | Enable `disabled: false` for Agents nav item |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `ai` npm package | CHAT-02 streaming | Yes | 3.4.33 | -- |
| `@ai-sdk/openai` | AGNT-02 OpenAI provider | No (not installed) | -- | Install via pnpm |
| `@ai-sdk/anthropic` | AGNT-02 Anthropic provider | No (not installed) | -- | Install via pnpm |
| `OPENAI_API_KEY` env var | AI provider | Unknown (user provides) | -- | Mock in tests; warn on startup |
| `ANTHROPIC_API_KEY` env var | AI provider | Unknown (user provides) | -- | Mock in tests; warn on startup |
| Supabase (local Docker) | All DB operations | Yes (Docker Compose) | PostgreSQL 15 | -- |
| Node.js | Build + tests | Yes | See package.json | -- |

**Missing dependencies with no fallback:**
- `@ai-sdk/openai@0.0.72` -- must install before implementing provider adapter
- `@ai-sdk/anthropic@0.0.56` -- must install before implementing provider adapter

**Missing dependencies with fallback:**
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: Tests can use mocked adapters; real keys needed for E2E streaming test

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `packages/web/vitest.config.ts` |
| Quick run command | `cd packages/web && pnpm test` |
| Full suite command | `cd packages/web && pnpm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AGNT-01 | createAgent inserts with correct tenant_id | unit | `pnpm test -- --reporter=verbose` | No -- Wave 0 |
| AGNT-01 | deleteAgent checks agent:delete permission | unit | same | No -- Wave 0 |
| AGNT-02 | agentFormSchema validates temperature 0-2 | unit | same | No -- Wave 0 |
| AGNT-02 | agentFormSchema validates max_tokens range | unit | same | No -- Wave 0 |
| AGNT-03 | tools array serializes/deserializes to JSONB | unit | same | No -- Wave 0 |
| AGNT-05 | status badge renders correct color for idle/running/error | unit | same | No -- Wave 0 |
| CHAT-02 | OpenAIAdapter.getModel returns LanguageModel | unit | same | No -- Wave 0 |
| CHAT-02 | Provider registry throws on unknown provider | unit | same | No -- Wave 0 |
| CHAT-03 | saveMessage inserts with correct role and content | unit | same | No -- Wave 0 |
| CHAT-04 | createConversation returns conversation with agent_id | unit | same | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd packages/web && pnpm test`
- **Per wave merge:** `cd packages/web && pnpm test && pnpm lint && pnpm type-check`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `packages/web/src/__tests__/agent/actions.test.ts` -- covers AGNT-01, AGNT-02, AGNT-03
- [ ] `packages/web/src/__tests__/agent/types.test.ts` -- covers AGNT-02 Zod schema
- [ ] `packages/web/src/__tests__/ai/registry.test.ts` -- covers CHAT-02 provider adapter
- [ ] `packages/web/src/__tests__/chat/actions.test.ts` -- covers CHAT-03, CHAT-04
- [ ] `packages/web/src/__tests__/chat/message-bubble.test.tsx` -- covers CHAT-01 render

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Supabase JWT via `createSupabaseServerClient()` in route handler + actions |
| V3 Session Management | Yes | Handled by Supabase SSR middleware (already in place) |
| V4 Access Control | Yes | `hasPermission()` for agent:create/update/delete; RLS for tenant isolation |
| V5 Input Validation | Yes | Zod schema on agent form data; message content length limit |
| V6 Cryptography | No | No new crypto; API keys stored in env vars, not DB |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated chat route access | Spoofing | `getUser()` check at top of route handler; 401 before streamText |
| Cross-tenant agent read via agentId | Elevation of Privilege | RLS `agents_select` policy enforces `tenant_id = get_current_tenant_id()` |
| Prompt injection via user messages | Tampering | System prompt is separate from user content in `streamText`; don't concatenate |
| API key exposure in agent config | Information Disclosure | API keys NEVER stored in `agents` table; always from server env vars |
| Excessive token usage via max_tokens manipulation | Denial of Service | Zod validates `max_tokens <= 128000`; add per-tenant rate limiting in Phase 6 |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@ai-sdk/openai@0.0.72` and `@ai-sdk/anthropic@0.0.56` are compatible with `ai@3.4.33` | Standard Stack | Provider adapter won't type-check; need different version pins |
| A2 | Server Actions pattern follows `lib/tenant/actions.ts` exactly (revalidatePath, error throwing) | Architecture Patterns | Minor -- easy to adjust during implementation |
| A3 | TanStack Query is already wired with a QueryClient provider in the tenant layout | Standard Stack | If not wired, need to add QueryClientProvider to tenant layout |
| A4 | `useChat` `body` option correctly forwards `agentId` and `conversationId` to the route handler | Code Examples | Route handler won't receive agent context; need different approach |

---

## Open Questions

1. **User-provided API keys vs. server env vars**
   - What we know: DB schema has no field for per-tenant API keys in agents table
   - What's unclear: Should tenants provide their own OpenAI/Anthropic keys, or does the platform operator provide one key?
   - Recommendation: Default to server env vars (OPENAI_API_KEY). Per-tenant keys are a Phase 6 feature. Document this assumption in agent creation UI.

2. **Conversation title auto-generation**
   - What we know: `conversations.title` is nullable TEXT
   - What's unclear: Should title auto-generate from first user message?
   - Recommendation: Set title to first 60 chars of first user message on conversation creation. Keep it simple.

3. **File attachment support (CHAT-05)**
   - What we know: ai@3.4.33 supports `experimental_attachments` in useChat
   - What's unclear: What file types are in scope? Images only? Code files?
   - Recommendation: Support text/code files via textarea paste and image URLs. Full file upload (S3/Supabase Storage) is deferred to Phase 4.

---

## Sources

### Primary (HIGH confidence)
- Installed package type definitions: `/packages/web/node_modules/ai/dist/index.d.ts` -- verified streamText, toDataStreamResponse, StreamingTextResponse exports
- Installed package type definitions: `node_modules/.pnpm/@ai-sdk+react@0.0.70/node_modules/@ai-sdk/react/dist/index.d.ts` -- verified UseChatHelpers (handleSubmit, not sendMessage)
- Project migration: `supabase/migrations/20260412004330_initial_schema.sql` -- verified agents/conversations/messages table schemas and RLS policies
- Project shared types: `packages/shared/types/database.ts` -- verified TypeScript Database type for all tables
- npm registry: `@ai-sdk/openai@0.0.72` and `@ai-sdk/anthropic@0.0.56` peer dep `@ai-sdk/provider@0.0.26` matches ai@3.4.33

### Secondary (MEDIUM confidence)
- [ai-sdk.dev Next.js App Router guide](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) -- note: documents v6 API, not 3.4.x; used to understand pattern, not API calls

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry and installed package.json
- Architecture: HIGH -- DB schema verified; pattern follows existing Phase 2 conventions
- Pitfalls: HIGH -- API version mismatch verified against installed type definitions
- Provider compatibility: MEDIUM -- `@ai-sdk/openai@0.0.72` peer deps match, but not tested in this repo yet

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable library versions; AI SDK v3.x is in maintenance)
