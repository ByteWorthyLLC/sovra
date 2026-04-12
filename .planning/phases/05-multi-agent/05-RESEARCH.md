# Phase 5: Multi-Agent - Research

**Researched:** 2026-04-12
**Domain:** Multi-agent orchestration, memory strategies, real-time WebSocket collaboration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Tenant-scoped everything via RLS -- workspaces must be tenant-isolated
- Go worker already has MCP server on port 3001 (Phase 4) -- Socket.IO server goes here too
- AIProviderAdapter pattern (Phase 3) -- extend for multi-agent orchestration
- pgvector + hybrid search (Phase 4) -- reuse for vector memory
- Open-source flexibility -- all integrations must be swappable
- No em dashes in copywriting
- Premium UI for workspace management interfaces
- ai@3.4.33 SDK constraint -- NOT v4/v6 APIs

### Claude's Discretion
All implementation choices at Claude's discretion. Use ROADMAP phase goal, success criteria, and codebase conventions.

### Deferred Ideas (OUT OF SCOPE)
None -- discuss phase skipped.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MUL-01 | Workspace creation and management | Schema exists (workspaces table); workspace_agents join table missing -- needs migration |
| MUL-02 | Agent collaboration modes (round_robin, parallel, sequential) | Orchestrator loop in Next.js API route; schema already encodes mode on workspace |
| MUL-03 | Shared memory between agents | shared_memory table exists; key/value JSONB store; needs server actions |
| MUL-04 | Real-time agent status updates | Socket.IO room per workspace; agents emit status on connect/run/finish |
| MUL-05 | Agent-to-agent messaging | Socket.IO agent:message event within workspace room |
| MUL-06 | Conflict resolution (vote, hierarchy, consensus) | Schema has conflict_resolution field; custom orchestrator logic |
| MEM-01 | Conversation memory (full history) | Pass full messages array from DB to streamText -- already pattern in chat route |
| MEM-02 | Summary memory (condensed) | generateText summary call before main streamText; inject as system context |
| MEM-03 | Vector memory (semantic retrieval) | hybridSearch() already implemented in lib/vector/search.ts -- reuse |
| MEM-04 | Hybrid memory (combined approach) | Compose MEM-01 + MEM-02 + MEM-03 strategies in MemoryStrategy abstraction |
| MEM-05 | Context compression (snip, microcompact, collapse) | Manual message truncation -- prepareStep does NOT exist in ai@3.4.33 |
| REAL-01 | Socket.IO server setup | zishang520/socket.io v2 in Go worker (same process as MCP server port 3001) |
| REAL-02 | Workspace room management | io.To(workspaceId).Emit(); client.Join(workspaceId) pattern |
| REAL-03 | Agent status broadcasting | Emit "agent:status" to workspace room on each status transition |
| REAL-04 | Message streaming | Emit "agent:chunk" events per token chunk, "agent:done" on finish |
| REAL-05 | Reconnection handling | socket.io-client auto-reconnect + rejoin workspace room on reconnect event |
</phase_requirements>

---

## Summary

Phase 5 builds on a solid foundation from prior phases. The database schema already contains `workspaces`, `shared_memory`, and `conversations` (with `workspace_id` FK). The critical gap is a `workspace_agents` join table (many agents per workspace) which requires a new migration. The web package already has `socket.io-client@4.8.3` installed; the Go worker needs `zishang520/socket.io/v2` added to serve the Socket.IO protocol over the existing port 3001 alongside the MCP server.

Memory strategies must be implemented as composable server-side utilities in Next.js (not via any AI SDK built-in, since `prepareStep` does not exist in ai@3.4.33). The `hybridSearch` function from Phase 4 is the direct foundation for vector memory. Context compression is manual message-array manipulation before calling `streamText`.

Multi-agent orchestration runs as an API route in Next.js, driving agents in the configured collaboration mode. The Go worker handles Socket.IO real-time events; Next.js calls the Go worker (or directly emits) for broadcasting. Given the architecture (Next.js API routes as the agent runner, Go worker as the Socket.IO/MCP server), the cleanest design is: Next.js runs orchestration logic and POSTs status updates to a Go worker HTTP endpoint that broadcasts them via Socket.IO.

**Primary recommendation:** Add `zishang520/socket.io/v2` to Go worker, add `workspace_agents` migration, implement memory strategies as composable TypeScript functions, and build a workspace orchestrator that drives collaboration modes sequentially.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zishang520/socket.io/v2 | v2.x (latest April 2025) | Socket.IO server in Go | Feature-complete v4+ compatible; Gin integration confirmed; active maintenance |
| socket.io-client | 4.8.3 (already installed) | Socket.IO client in Next.js | Exact version match with server protocol |
| ai | 3.4.33 (already installed) | streamText/generateText for memory | Pinned -- do NOT upgrade |
| pgvector + hybridSearch | already in Phase 4 | Vector memory retrieval | Already implemented in lib/vector/search.ts |
| zod | 3.24.1 (already installed) | Schema validation for workspace/memory inputs | Consistent with existing pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | 5.0.0 (already installed) | WebSocket connection state + workspace state in UI | Real-time agent status store |
| @tanstack/react-query | 5.60.0 (already installed) | Workspace/agent data fetching and mutation | CRUD for workspaces |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zishang520/socket.io/v2 | googollee/go-socket.io | googollee archived; zishang520 actively maintained, v4 compatible |
| zishang520/socket.io/v2 | doquangtan/socket.io/v4 | Websocket-only transport; fewer stars; zishang520 more complete |
| Socket.IO in Go | Socket.IO in Next.js (standalone server) | Would require a second Node.js server process; Go worker already runs on 3001 |
| Manual context compression | prepareStep (v5+) | prepareStep does not exist in ai@3.4.33 -- must use manual array manipulation |

**Installation (Go worker):**
```bash
cd packages/worker
go get github.com/zishang520/socket.io/v2@latest
```

**Version verification:** [VERIFIED: pkg.go.dev] `github.com/zishang520/socket.io/v2` -- latest active release v2.x (April 2025). `socket.io-client@4.8.3` [VERIFIED: npm registry, matches socket.io server 4.8.3].

---

## Architecture Patterns

### Recommended Project Structure

New files/directories this phase adds:

```
packages/
├── web/
│   ├── app/
│   │   └── (tenant)/t/[slug]/
│   │       └── workspaces/          # workspace list + detail pages
│   ├── app/api/
│   │   ├── workspaces/              # CRUD API routes
│   │   └── workspaces/[id]/run/     # orchestration trigger route
│   └── lib/
│       ├── memory/                  # memory strategy implementations
│       │   ├── types.ts
│       │   ├── conversation.ts      # MEM-01
│       │   ├── summary.ts           # MEM-02
│       │   ├── vector.ts            # MEM-03 (wraps hybridSearch)
│       │   ├── hybrid.ts            # MEM-04 (compose all strategies)
│       │   └── compression.ts       # MEM-05 (snip/microcompact/collapse)
│       ├── workspace/               # workspace actions/queries/types
│       └── realtime/                # socket.io-client hook
├── worker/
│   └── internal/
│       └── socketio/                # Socket.IO server + handlers
│           ├── server.go
│           └── handlers.go
└── supabase/
    └── migrations/
        └── 20260412200000_phase5_workspace_agents.sql
```

### Pattern 1: Socket.IO Server in Go Worker (Gin integration)

**What:** Mount Socket.IO server on existing Gin router alongside MCP server.
**When to use:** Real-time agent status, message streaming, workspace rooms.

```go
// Source: pkg.go.dev/github.com/zishang520/socket.io/v2
// packages/worker/internal/socketio/server.go

package socketio

import (
    "github.com/gin-gonic/gin"
    "github.com/zishang520/socket.io/v2/socket"
)

func Mount(router *gin.Engine) *socket.Server {
    c := socket.DefaultServerOptions()
    c.SetCors(&types.Cors{Origin: "*", Credentials: true})

    io := socket.NewServer(nil, c)

    io.On("connection", func(clients ...interface{}) {
        client := clients[0].(*socket.Socket)

        client.On("workspace:join", func(args ...interface{}) {
            workspaceId := args[0].(string)
            client.Join(socket.Room(workspaceId))
            client.Emit("workspace:joined", workspaceId)
        })

        client.On("workspace:leave", func(args ...interface{}) {
            workspaceId := args[0].(string)
            client.Leave(socket.Room(workspaceId))
        })

        client.On("disconnect", func(...interface{}) {})
    })

    router.POST("/socket.io/*f", gin.WrapH(io.ServeHandler(nil)))
    router.GET("/socket.io/*f", gin.WrapH(io.ServeHandler(nil)))

    return io
}
```

### Pattern 2: Workspace Orchestrator (Next.js API Route)

**What:** API route that drives collaboration modes by running agents in sequence/parallel, writing results to DB, and calling Go worker to broadcast status.
**When to use:** MUL-02, MUL-03, MUL-04, MUL-05.

```typescript
// Source: [ASSUMED] based on existing chat route pattern
// packages/web/app/api/workspaces/[id]/run/route.ts

// Collaboration modes:
// round_robin: agent A -> agent B -> agent C -> repeat until done
// parallel: all agents called concurrently with Promise.all
// sequential: agent A finishes, result passed to agent B as context

async function runRoundRobin(agents: Agent[], prompt: string, workspaceId: string) {
  let context = prompt
  for (const agent of agents) {
    const result = await runAgent(agent, context)
    await broadcastStatus(workspaceId, agent.id, 'idle')
    context = result.text  // pass output as next input
  }
}

async function runParallel(agents: Agent[], prompt: string, workspaceId: string) {
  const results = await Promise.all(
    agents.map(agent => runAgent(agent, prompt))
  )
  // Aggregate results for conflict resolution if needed
  return results
}
```

### Pattern 3: Memory Strategy Composition

**What:** Composable TypeScript functions that build the messages array before passing to streamText.
**When to use:** All agent invocations in workspaces; applies based on memory_strategy config.

```typescript
// Source: [ASSUMED] based on ai@3.4.33 streamText API
// packages/web/lib/memory/hybrid.ts

export async function buildContextMessages(
  supabase: SupabaseClient,
  params: {
    conversationId: string
    tenantId: string
    workspaceId: string
    strategy: 'conversation' | 'summary' | 'vector' | 'hybrid'
    maxTokenBudget: number
    currentPrompt: string
  }
): Promise<CoreMessage[]> {
  switch (params.strategy) {
    case 'conversation': return buildConversationMemory(supabase, params)
    case 'summary':      return buildSummaryMemory(supabase, params)
    case 'vector':       return buildVectorMemory(supabase, params)
    case 'hybrid':       return buildHybridMemory(supabase, params)
  }
}
```

### Pattern 4: Context Compression (ai@3.4.33)

**What:** Manual message array manipulation since `prepareStep` does not exist in ai@3.4.33.
**When to use:** Before calling streamText when token count approaches limit.
**Three strategies:**
- **snip**: remove oldest messages from the middle, keep system + recent N messages
- **microcompact**: call generateText to summarize a slice of messages, replace with summary
- **collapse**: keep only the last N messages as raw, discard everything else

```typescript
// Source: [VERIFIED: ai@3.4.33 type defs] -- no prepareStep in 3.4.33
// packages/web/lib/memory/compression.ts

export function snipMessages(
  messages: CoreMessage[],
  maxMessages: number
): CoreMessage[] {
  if (messages.length <= maxMessages) return messages
  // Keep first (system context) and last N user/assistant pairs
  const systemMessages = messages.filter(m => m.role === 'system')
  const conversational = messages.filter(m => m.role !== 'system')
  const recent = conversational.slice(-maxMessages)
  return [...systemMessages, ...recent]
}

export async function microcompactMessages(
  model: LanguageModel,
  messages: CoreMessage[],
  keepLast: number
): Promise<CoreMessage[]> {
  const toCompress = messages.slice(0, -keepLast)
  const { text: summary } = await generateText({
    model,
    messages: toCompress,
    system: 'Summarize this conversation in under 200 words, preserving key decisions and facts.',
  })
  const recent = messages.slice(-keepLast)
  return [{ role: 'system', content: `Previous conversation summary: ${summary}` }, ...recent]
}
```

### Pattern 5: Conflict Resolution

**What:** When agents in a workspace produce conflicting outputs, resolve via vote/hierarchy/consensus.
**When to use:** MUL-06, democratic/consensus collaboration modes.

```typescript
// Source: [ASSUMED] based on multi-agent literature patterns
// packages/web/lib/workspace/conflict.ts

export type ConflictResolutionMode = 'vote' | 'hierarchy' | 'consensus'

// vote: majority wins among agent outputs
// hierarchy: first agent's output wins (highest priority agent)
// consensus: all agents must agree (iterative refinement until unanimous)

export function resolveByVote(responses: AgentResponse[]): AgentResponse {
  // Group by semantic similarity, return most common response
  // Simple implementation: group by exact match, return largest group
  const counts = new Map<string, number>()
  responses.forEach(r => counts.set(r.text, (counts.get(r.text) ?? 0) + 1))
  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  return responses.find(r => r.text === winner[0])!
}
```

### Pattern 6: workspace:join / Reconnection (Next.js client)

**What:** React hook wrapping socket.io-client with auto-reconnect and workspace room rejoin.
**When to use:** All workspace detail pages.

```typescript
// Source: [VERIFIED: socket.io-client@4.8.3 API]
// packages/web/lib/realtime/useWorkspaceSocket.ts

export function useWorkspaceSocket(workspaceId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_WORKER_URL!, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    s.on('connect', () => s.emit('workspace:join', workspaceId))
    s.on('reconnect', () => s.emit('workspace:join', workspaceId))  // REAL-05

    setSocket(s)
    return () => { s.disconnect() }
  }, [workspaceId])

  return socket
}
```

### Anti-Patterns to Avoid

- **Running orchestration in Go worker:** All AI provider calls must go through Next.js (ai@3.4.33 + AIProviderAdapter). Go worker is transport only.
- **Storing full message history in shared_memory JSONB:** Use the messages table. shared_memory is for key/value agent coordination state, not conversation history.
- **Bypassing RLS for workspace queries:** Every Supabase call must use the server client with user session -- never service role for user-facing data.
- **Calling prepareStep:** Does not exist in ai@3.4.33. Use manual message manipulation before streamText.
- **socket.io-client inside Server Components:** socket.io-client is browser-only. Must be in `'use client'` components or hooks.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Socket.IO protocol | Custom WebSocket server | zishang520/socket.io/v2 | Rooms, namespaces, reconnection, polling fallback -- enormous edge case surface |
| Vector similarity search | Custom cosine distance | hybridSearch() from Phase 4 | Already implemented, tenant-scoped, index-optimized |
| Socket.IO client reconnection | Custom retry logic | socket.io-client built-in reconnection | Auto-reconnect, exponential backoff, event buffering all built in |
| Workspace RLS | Application-level tenant checks | PostgreSQL RLS policies (already in schema) | Any app-level check can be bypassed; RLS cannot |
| Token counting | Custom tokenizer | Estimate at 4 chars/token or use model metadata | Exact tokenizers are model-specific, complex; rough estimate sufficient for compression trigger |

**Key insight:** Socket.IO in Go has one well-maintained option (zishang520). Don't evaluate the others -- they are archived or websocket-only.

---

## Common Pitfalls

### Pitfall 1: Socket.IO CORS in Go Worker

**What goes wrong:** Browser blocks Socket.IO connection from Next.js (localhost:3000) to Go worker (localhost:3001) due to missing CORS config.
**Why it happens:** zishang520/socket.io requires explicit CORS setup; Gin's CORS middleware does not apply to the Socket.IO handler.
**How to avoid:** Set CORS directly on socket.Server options:
```go
c.SetCors(&types.Cors{Origin: "*", Credentials: true})
```
**Warning signs:** Browser console `CORS error` on socket handshake.

### Pitfall 2: Room Name Collisions

**What goes wrong:** Two tenants with workspaces that have the same UUIDs (impossible by UUID v4, but a naming convention risk if using plain names).
**Why it happens:** Socket.IO rooms are global strings on a single server.
**How to avoid:** Always prefix room names with tenant ID: `room name = "${tenantId}:${workspaceId}"`. Join with this composite key.
**Warning signs:** Cross-tenant workspace events visible to wrong users.

### Pitfall 3: prepareStep Does Not Exist in ai@3.4.33

**What goes wrong:** Developer imports or calls `prepareStep` referencing v5+ docs -- TypeScript compile error or runtime undefined.
**Why it happens:** Most AI SDK documentation online targets v5/v6.
**How to avoid:** Context compression is manual. Build `snipMessages()` and `microcompactMessages()` utilities. Call them before passing messages to streamText.
**Warning signs:** TypeScript error "Property 'prepareStep' does not exist".

### Pitfall 4: Shared Memory Race Conditions in Parallel Mode

**What goes wrong:** Two agents writing to the same shared_memory key simultaneously corrupt or lose updates.
**Why it happens:** `parallel` collaboration mode runs agents concurrently; both try to write the same key.
**How to avoid:** Use Postgres `ON CONFLICT DO UPDATE` (upsert) on shared_memory; accept last-write-wins for parallel mode, or serialize writes per agent. Alternatively, namespace keys by agent ID in parallel mode.
**Warning signs:** shared_memory values are truncated or randomly alternate.

### Pitfall 5: workspace_agents Table Missing

**What goes wrong:** Cannot associate multiple agents with a workspace -- no join table in existing schema.
**Why it happens:** The Phase 1 schema has `workspaces` and `agents` tables but no many-to-many join.
**How to avoid:** Phase 5 migration must add `workspace_agents(workspace_id, agent_id, role, position)` with RLS before any workspace CRUD is implemented.
**Warning signs:** `agents.workspace_id` column referenced in code -- wrong, agents don't have a workspace FK.

### Pitfall 6: Socket.IO Streaming vs AI SDK Streaming

**What goes wrong:** Developer tries to pipe `streamText` readable stream directly to a Socket.IO event, causing buffering issues.
**Why it happens:** streamText returns a `ReadableStream`; Socket.IO emits discrete events.
**How to avoid:** Consume `streamText` with `onChunk` callback, emit each chunk as `agent:chunk` event, emit `agent:done` on finish. Do not pipe streams.

---

## Code Examples

### Socket.IO Server Mount in Go (Gin)

```go
// Source: [VERIFIED: pkg.go.dev/github.com/zishang520/socket.io/v2]
import (
    "github.com/gin-gonic/gin"
    "github.com/zishang520/socket.io/v2/socket"
    "github.com/zishang520/engine.io/v2/types"
)

func MountSocketIO(router *gin.Engine) *socket.Server {
    opts := socket.DefaultServerOptions()
    opts.SetCors(&types.Cors{Origin: "*", Credentials: true})
    io := socket.NewServer(nil, opts)

    io.On("connection", func(clients ...interface{}) {
        client := clients[0].(*socket.Socket)
        client.On("workspace:join", func(args ...interface{}) {
            roomId := args[0].(string)
            client.Join(socket.Room(roomId))
        })
    })

    router.GET("/socket.io/*f", gin.WrapH(io.ServeHandler(nil)))
    router.POST("/socket.io/*f", gin.WrapH(io.ServeHandler(nil)))
    return io
}
```

### Broadcast Agent Status from Go (called by Next.js via HTTP)

```go
// Next.js POSTs to /internal/broadcast with JSON body
// Go worker broadcasts to workspace room
func (h *BroadcastHandler) Handle(c *gin.Context) {
    var payload struct {
        WorkspaceId string `json:"workspace_id"`
        AgentId     string `json:"agent_id"`
        Event       string `json:"event"`
        Data        any    `json:"data"`
    }
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    h.IO.To(socket.Room(payload.WorkspaceId)).Emit(payload.Event, payload.Data)
    c.JSON(200, gin.H{"ok": true})
}
```

### Workspace Migration (Phase 5)

```sql
-- Source: [ASSUMED] based on existing schema patterns from Phase 1
-- supabase/migrations/20260412200000_phase5_workspace_agents.sql

create table workspace_agents (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  agent_id     uuid not null references agents(id) on delete cascade,
  role         text not null default 'member'
               check (role in ('leader', 'member')),
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  unique(workspace_id, agent_id)
);

alter table workspace_agents enable row level security;
create policy "workspace_agents_select" on workspace_agents
  for select using (tenant_id = (select auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
create policy "workspace_agents_insert" on workspace_agents
  for insert with check (tenant_id = (select auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
create policy "workspace_agents_delete" on workspace_agents
  for delete using (tenant_id = (select auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

create index idx_workspace_agents_workspace on workspace_agents(workspace_id);
create index idx_workspace_agents_tenant on workspace_agents(tenant_id);
```

### Socket.IO Client Hook (Next.js)

```typescript
// Source: [VERIFIED: socket.io-client@4.8.3 API]
'use client'
import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'

export function useWorkspaceSocket(
  workspaceId: string,
  onAgentStatus: (data: { agentId: string; status: string }) => void,
  onAgentChunk: (data: { agentId: string; chunk: string }) => void
) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WORKER_URL!, {
      reconnection: true,
      reconnectionAttempts: 5,
    })

    const joinRoom = () => socket.emit('workspace:join', workspaceId)
    socket.on('connect', joinRoom)
    socket.on('reconnect', joinRoom)
    socket.on('agent:status', onAgentStatus)
    socket.on('agent:chunk', onAgentChunk)

    socketRef.current = socket
    return () => { socket.disconnect() }
  }, [workspaceId])

  return socketRef
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual context truncation only | prepareStep callback (v5+) | ai SDK v5 (2025) | Cannot use -- pinned to v3.4.33; implement manually |
| Long-polling WebSocket fallback | Native WebSocket + HTTP upgrade | Socket.IO v4 default | Faster connection, lower latency |
| In-memory agent state | Shared memory in Postgres | Standard pattern | Survives restarts, multi-instance compatible |

**Deprecated/outdated in this codebase context:**
- `googollee/go-socket.io`: Archived. Do not use.
- `doquangtan/socket.io/v4`: Websocket-only. Lacks polling fallback.
- Any approach that places orchestration logic in Go worker: AIProviderAdapter only lives in Next.js.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | workspace_agents join table does not exist in schema | Architecture Patterns, Pitfall 5 | If it exists, skip that migration; if missing as assumed, must be added |
| A2 | Next.js API route is the right place for orchestration (not Go worker) | Architecture Patterns Pattern 2 | If Go worker must run orchestration, a new gRPC stream or internal HTTP loop is needed |
| A3 | Broadcast from Next.js to Go worker via internal HTTP POST is acceptable latency | Code Examples Pattern | If latency is too high, next.js should connect as a socket.io client to the Go worker directly |
| A4 | Token counting uses rough estimate (4 chars/token) for compression trigger | Don't Hand-Roll | If a specific model's tokenizer is required for accuracy, add tiktoken or model-specific counting |
| A5 | workspace_agents.role = 'leader' drives hierarchy conflict resolution | Architecture Pattern 5 | If hierarchy is purely by position, role column is unnecessary |

---

## Open Questions

1. **Should Next.js connect to Go worker as a socket.io-client for broadcasting, or use an HTTP POST?**
   - What we know: Go worker exposes HTTP via Gin; socket.io-client is installed in web but would add complexity
   - What's unclear: Latency requirements for broadcasting agent status
   - Recommendation: Use internal HTTP POST to `/internal/broadcast` on Go worker -- simpler, no circular dependency

2. **Does the workspace orchestrator need streaming responses, or only final outputs?**
   - What we know: REAL-04 requires message streaming; chat route already streams
   - What's unclear: Whether workspace collaboration mode drives one agent at a time (stream each) or batches
   - Recommendation: Stream each agent's response via `agent:chunk` Socket.IO events, emit `agent:done` when complete

3. **What is the memory_strategy config per workspace?**
   - What we know: REQUIREMENTS.md lists MEM-01 through MEM-04 as separate strategies; workspaces table has no memory_strategy column
   - What's unclear: Whether memory strategy is per-workspace or per-agent-within-workspace
   - Recommendation: Add `memory_strategy text default 'conversation'` to workspaces table in Phase 5 migration

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Go | Socket.IO server | Yes | 1.26.2 | -- |
| Node.js | Web package build | Yes | v22.22.0 | -- |
| socket.io-client | Web realtime hook | Yes | 4.8.3 (installed) | -- |
| zishang520/socket.io/v2 | Go worker Socket.IO server | No (needs go get) | Latest April 2025 | -- |
| pgvector (hybridSearch) | Vector memory | Yes (Phase 4 complete) | in DB + lib | -- |
| ai@3.4.33 | Memory/compression | Yes (installed) | 3.4.33 | -- |

**Missing dependencies with no fallback:**
- `github.com/zishang520/socket.io/v2` -- must `go get` before implementing Socket.IO server

**Missing dependencies with fallback:**
- None

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (web) + go test (worker) |
| Config file | `packages/web/vitest.config.ts` |
| Quick run command | `cd packages/web && npx vitest run --reporter=dot` |
| Full suite command | `cd packages/web && npx vitest run && cd ../worker && go test ./...` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MUL-01 | Workspace CRUD actions (create/list/delete) | unit | `npx vitest run lib/workspace/` | No -- Wave 0 |
| MUL-02 | round_robin orchestrator drives agents in order | unit | `npx vitest run lib/workspace/orchestrator.test.ts` | No -- Wave 0 |
| MUL-03 | shared memory read/write/upsert | unit | `npx vitest run lib/workspace/shared-memory.test.ts` | No -- Wave 0 |
| MUL-05 | agent:message socket event reaches workspace room | manual | Socket.IO integration test | No |
| MUL-06 | resolveByVote returns majority response | unit | `npx vitest run lib/workspace/conflict.test.ts` | No -- Wave 0 |
| MEM-01 | buildConversationMemory returns full history messages | unit | `npx vitest run lib/memory/conversation.test.ts` | No -- Wave 0 |
| MEM-02 | buildSummaryMemory generates summary and injects | unit | `npx vitest run lib/memory/summary.test.ts` | No -- Wave 0 |
| MEM-03 | buildVectorMemory calls hybridSearch with prompt | unit | `npx vitest run lib/memory/vector.test.ts` | No -- Wave 0 |
| MEM-05 | snipMessages truncates to maxMessages | unit | `npx vitest run lib/memory/compression.test.ts` | No -- Wave 0 |
| REAL-01 | Socket.IO server starts and accepts connections | Go test | `go test ./internal/socketio/...` | No -- Wave 0 |
| REAL-05 | Client rejoins workspace room on reconnect | manual | Manual browser test | No |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=dot`
- **Per wave merge:** `npx vitest run && cd packages/worker && go test ./...`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `packages/web/lib/workspace/actions.test.ts` -- covers MUL-01
- [ ] `packages/web/lib/workspace/orchestrator.test.ts` -- covers MUL-02
- [ ] `packages/web/lib/workspace/shared-memory.test.ts` -- covers MUL-03
- [ ] `packages/web/lib/workspace/conflict.test.ts` -- covers MUL-06
- [ ] `packages/web/lib/memory/conversation.test.ts` -- covers MEM-01
- [ ] `packages/web/lib/memory/summary.test.ts` -- covers MEM-02
- [ ] `packages/web/lib/memory/vector.test.ts` -- covers MEM-03
- [ ] `packages/web/lib/memory/compression.test.ts` -- covers MEM-05
- [ ] `packages/worker/internal/socketio/server_test.go` -- covers REAL-01

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Supabase JWT on all API routes (existing pattern) |
| V3 Session Management | yes | Verify JWT before joining workspace Socket.IO room |
| V4 Access Control | yes | RLS on workspace_agents + workspaces; never bypass with service role |
| V5 Input Validation | yes | zod schemas on all workspace/memory API inputs |
| V6 Cryptography | no | No new crypto required |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized workspace room join | Spoofing | Validate tenant membership before `client.Join()` -- emit auth challenge on connection |
| Cross-tenant shared_memory read | Information Disclosure | RLS policy on shared_memory (already in schema); never bypass |
| Malicious agent tool injection via workspace | Tampering | Agent tools list is DB-persisted and tenant-scoped; no user-supplied tool names at runtime |
| Socket.IO room name guessing | Spoofing | Use composite room name `tenantId:workspaceId`; validate workspace belongs to tenant before join |
| Excessive context injection via shared_memory | Elevation of Privilege | Cap shared_memory value size (e.g., 64KB per key); validate with zod before writing |

**Critical:** Never allow unauthenticated socket connections to join workspace rooms. Validate JWT or session token in the `workspace:join` handler before calling `client.Join()`. The Go worker cannot access Supabase RLS directly -- Next.js must validate membership before forwarding any broadcast requests.

---

## Project Constraints (from CLAUDE.md)

| Directive | Applies To |
|-----------|-----------|
| `ai@3.4.33` -- NOT v4/v6 APIs | All memory/streaming code |
| Tenant-scoped everything via RLS | workspace_agents migration + all queries |
| No em dashes in copywriting | UI labels and descriptions |
| Premium UI for workspace management | Workspace list and detail pages |
| TDD mandatory -- tests before implementation | All Wave 0 test files |
| Vitest for TS tests, go test for Go tests | Test file creation |
| All API routes must check authentication | /api/workspaces/* routes |
| Go worker has MCP server on port 3001 -- Socket.IO goes here too | Socket.IO mounts on same Gin router |
| Open-source flexibility -- all integrations swappable | Memory strategy abstraction behind interface |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: pkg.go.dev/github.com/zishang520/socket.io/v2] -- Gin integration pattern, rooms API, emit API
- [VERIFIED: npm registry] -- socket.io-client@4.8.3, socket.io@4.8.3 both current
- [VERIFIED: packages/web/node_modules/ai/dist/index.d.ts] -- ai@3.4.33 type definitions confirm prepareStep absent
- [VERIFIED: packages/web/package.json] -- ai@3.4.33, socket.io-client@4.8.3 installed
- [VERIFIED: supabase/migrations/20260412004330_initial_schema.sql] -- workspaces, shared_memory, agents table schemas confirmed
- [VERIFIED: packages/web/lib/vector/search.ts] -- hybridSearch already implemented
- [VERIFIED: packages/web/app/api/chat/route.ts] -- streamText pattern with onStepFinish confirmed

### Secondary (MEDIUM confidence)
- [github.com/zishang520/socket.io releases] -- v3.0.0-rc.14 is latest (April 8 2026 per WebFetch); v2 is stable release
- [vercel/ai discussion #8192] -- context compression via message manipulation before streamText confirmed working
- [vercel.com/blog/ai-sdk-3-4] -- AI SDK 3.4 added onStepFinish, multi-step; no prepareStep

### Tertiary (LOW confidence)
- WebSearch results on multi-agent orchestration patterns -- architectural guidance only, no specific library dependencies

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against registry and installed packages
- Architecture: HIGH -- directly based on existing codebase patterns and confirmed APIs
- Pitfalls: HIGH for items verified against source; MEDIUM for concurrency/race condition patterns
- Socket.IO Go API: HIGH -- verified against pkg.go.dev documentation

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable libraries; 30-day window)
