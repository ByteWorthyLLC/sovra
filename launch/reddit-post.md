# Sovra — Reddit Launch Posts

> Three versions targeted at different communities. Post each to its primary subreddit on a different day (24-48hr spacing) to avoid cross-sub spam flags. Always read the sub's self-promotion rules before posting.

---

## Version 1 — r/MachineLearning + r/programming

**Title**: `[P] I open-sourced the multi-tenant infrastructure I rebuilt 4 times for AI products`

**Body** (~410 words):

```
I'm a solo developer who spent the last two years shipping AI products as a
contractor and as ByteWorthy. By the fourth product I noticed I was rebuilding
the exact same seven primitives every time — auth, tenant context, MCP tool
registry, agent state, vector search, real-time, billing. So I extracted the
platform and open-sourced it under MIT.

It's called Sovra. The repo is here: github.com/byteworthyllc/sovra

The problem I kept hitting:

Auth0 doesn't speak tenants. Stripe doesn't meter LLM calls per-tool per-tenant
out of the box. Pinecone bills you separately and doesn't share auth context.
MCP (Anthropic's tool-calling protocol) needs custom glue if you want it
versioned, rate-limited, and tenant-scoped. So you end up with four vendors,
four invoices, four SDK upgrade paths, and four places where tenant context
can break.

What Sovra ships:

- Supabase Auth with tenant context propagated through Postgres RLS — not at
  the application layer where forgotten WHERE clauses leak data
- MCP tool registry: versioned, rate-limited per tool, scoped per tenant
- pgvector with per-tenant namespaces (no separate vector-DB bill)
- Go-based agent runtime with parallel tool calls and cancellation
- Stripe usage metering keyed to tenant + tool
- Socket.IO for real-time agent state and collaborative cursors

The stack is Next.js 15 + Supabase + Go + pgvector. TypeScript everywhere
except the agent runtime (Go for parallel execution + cancellation).

What's open vs paid:

The whole core is MIT. Self-host freely. Sovra Cloud (managed) is on a waitlist
if you'd rather not run Postgres + Go services yourself. Enterprise tier exists
for SOC 2 path + custom SLAs.

Lessons from rebuilding this four times:

1. Tenant context belongs in the database. RLS policies catch the bugs that
   middleware-only tenancy lets ship.
2. MCP tool registry is the missing piece nobody talks about. Once you have one,
   agents become composable instead of bespoke.
3. Real-time agent state is a feature, not a polish. Users want to see what the
   agent is doing, especially when it takes 30+ seconds.

Would love feedback — especially from folks who've shipped multi-tenant AI
products and seen which abstractions held up.

Repo: github.com/byteworthyllc/sovra
Site: byteworthy.io/sovra
Discord: discord.gg/byteworthy
```

---

## Version 2 — r/golang

**Title**: `Built a Go agent runtime for AI tool-calling with parallel execution + cancellation — open-sourced as part of Sovra`

**Body** (~395 words):

```
Posting in r/golang because the most interesting piece of Sovra (the multi-
tenant AI infrastructure I just open-sourced) is the agent runtime in Go.

Background: I'm a solo dev. Built four AI products in two years and got tired
of rewriting the agent layer in Node every time. Node is fine for the API, but
running 5-10 tool calls in parallel with proper context cancellation is the
kind of thing Go just does better.

What the runtime handles:

- Parallel tool calls with sync.WaitGroup + per-call context.Context
- Cancellation that propagates through the MCP client SDK
- Retry with exponential backoff per tool (configurable)
- Per-tool rate limiting via golang.org/x/time/rate
- Structured tool-call observability (every call emits JSON to stdout)

The interesting design choices:

1. The runtime doesn't speak HTTP directly. It reads jobs off a Postgres-backed
   queue (using pgx for LISTEN/NOTIFY). This means horizontal scale is just
   "spin up more runtime workers."

2. Tool definitions live in the registry (Postgres) not in code. Adding a new
   MCP tool is a row insert, not a deploy. The runtime hot-reloads on registry
   change.

3. Tenant context flows through context.Context. Every tool call has a
   tenant_id in the ctx, and the registry rejects calls where the tenant
   doesn't have permission for the tool.

4. Cancellation matters more than people think. When a user closes a chat,
   five in-flight tool calls should die immediately. ctx.Done() makes this
   trivial; doing it in Node with AbortController is doable but uglier.

What's open: MIT, the whole thing. github.com/byteworthyllc/sovra. The runtime
lives in `agents/runtime` if you want to read just that piece.

What's not solved yet: I haven't benchmarked against a Node equivalent. Would
genuinely love it if someone did.

Stack: Go 1.22, pgx, MCP Go SDK, golang.org/x/time/rate.

Happy to take feedback on the runtime specifically, or the broader platform.

Repo: github.com/byteworthyllc/sovra
```

---

## Version 3 — r/nextjs

**Title**: `Open-sourced a Next.js 15 multi-tenant boilerplate with auth, billing, vector search, and MCP tools wired in`

**Body** (~400 words):

```
I've shipped four AI products on Next.js in two years and got tired of
rebuilding the same plumbing every time. So I extracted it into a boilerplate
and open-sourced it under MIT.

It's called Sovra. github.com/byteworthyllc/sovra

What you get out of the box:

- Next.js 15 with App Router, React 19, Server Components everywhere it makes
  sense, Server Actions for mutations
- Supabase Auth with tenant context middleware (every request has the active
  tenant available in a typed context)
- Postgres RLS policies generated per table — tenant isolation enforced at the
  database, not just the app layer
- pgvector with per-tenant namespaces (vector search without paying for a
  separate vendor)
- Stripe wired up for per-tenant usage billing (metered per LLM call + per
  tool call)
- shadcn/ui components throughout the admin
- TypeScript strict mode, end-to-end typed via Supabase generated types

The Next.js-specific design choices that took me longest to get right:

1. Tenant context lives in `headers()` not cookies. Subdomain-based routing
   means `acme.sovra.example.com` works without DNS plumbing — middleware
   reads the host, looks up the tenant, sets it in headers. Server Components
   read it via `headers()`.

2. Server Actions are the right place for tenant-scoped mutations. They run
   server-side, the tenant_id is already in headers, and you don't have to
   re-validate auth in every route handler.

3. RLS policies are the only multi-tenant security I trust. App-layer scoping
   (`WHERE tenant_id = ctx.tenant`) ships cross-tenant bugs eventually. RLS
   makes those bugs impossible.

4. pgvector + RLS works beautifully. Per-tenant vector namespaces with no extra
   schema work — just include tenant_id in the table and the same RLS
   policy applies.

What's open vs paid:

MIT for the whole thing. Sovra Cloud (managed) is on waitlist. Enterprise tier
for SOC 2 path.

Would love feedback from Next.js devs who've shipped multi-tenant production
apps. Specifically: did anyone find a cleaner pattern than headers() for
tenant context?

Repo: github.com/byteworthyllc/sovra
Site: byteworthy.io/sovra
```

---

## Posting checklist (per version)

- [ ] Read each subreddit's self-promotion rules — most cap at 1-in-10 ratio
- [ ] Account has at least 30 days of comment history in the sub before posting
- [ ] Disable crosspost notifications (one community at a time)
- [ ] Reply to every top-level comment within 6 hours of post
- [ ] Don't link to byteworthy.io in the title — repo link is fine
- [ ] If a mod removes the post, ask why before reposting
- [ ] Track UTM `utm_source=reddit&utm_medium=<sub>` in PostHog
