# Sovra — Show HN Launch Pack

> **Recommended launch window**: Tuesday or Wednesday, 8-10am PT (peak HN traffic)

## Title (60-character cap, action-led)

```
Show HN: Sovra – Open-source multi-tenant infra for AI products
```

**Alternative titles** (rotate if first attempt doesn't catch):
- `Show HN: Sovra – Auth0 + Stripe + Pinecone + MCP, glued and open-sourced`
- `Show HN: Sovra – Stop rebuilding the same AI plumbing for every product`
- `Show HN: Sovra – MCP tool registry + pgvector + per-tenant billing in one`

## First comment (post immediately after submission)

```
Hey HN — Kevin from ByteWorthy.

Sovra is open-source multi-tenant infrastructure for AI products. Auth, billing,
MCP tool registry, pgvector search, and a Go-based agent runtime — one platform
instead of four vendors duct-taped with custom code.

Why I built it: I shipped four AI products in two years. Each one I rebuilt the
same seven things — tenant context, agent state, tool registry, vector search,
billing, real-time, auth. By the fourth time I stopped pretending it was bespoke
work and extracted the platform. Sovra is the result, MIT-licensed.

How it's different:
  - MCP-native tool registry (versioned, multi-tenant, rate-limited per tool)
  - pgvector with per-tenant namespaces (no separate Pinecone bill)
  - Tenant context propagated end-to-end through Postgres RLS, not at app layer
  - Go agent runtime with cancellation + parallel tool calls (not serial JS)

What's open / what's paid:
  - Open source MIT for the entire core
  - Sovra Cloud (managed, waitlist) for teams who don't want to self-host
  - Enterprise tier for SOC 2 path + custom SLAs

Demo: <link to GIF>
Repo: github.com/byteworthyllc/sovra
Pricing: byteworthy.io/sovra

Solo dev, two years in, dogfooded across all five ByteWorthy products. Happy to
answer anything about MCP, multi-tenant Postgres, agent runtimes in Go, or why I
chose pgvector over a vendor vector DB.
```

## Pre-submission checklist

- [ ] Demo GIF (5-10s) shows: clone → seed tenant → register MCP tool → agent call with billing increment
- [ ] README hero loads at desktop + mobile widths
- [ ] github.com/byteworthyllc/sovra description, topics (`mcp`, `multi-tenant`, `pgvector`, `ai-infrastructure`, `agents`), social preview set
- [ ] byteworthy.io/sovra page is up with Cloud waitlist form
- [ ] Discord invite link tested (not expired)
- [ ] First comment text in clipboard, ready to paste in <60s after submission
- [ ] PostHog UTM dashboard live (verify utm_source=hn captures)
- [ ] Twitter thread scheduled 30 min after HN submission
- [ ] At least 3 friends know to read first, then upvote (no obvious vote rings)
- [ ] CHANGELOG.md current — last release dated within 7 days
- [ ] Issues open and triaged — no abandoned-project signal

## Avoid

- "AI-native platform that empowers..." marketing-speak — HN flags it instantly
- Anonymous handle as comment author — use real name
- Linking only to byteworthy.io (commercial) — link to repo first, pricing second
- Replying defensively to Auth0/Stripe loyalists — agree with what's true, push back only on facts
- Disabling Issues to "stay focused" — looks like you can't handle feedback
- Claiming production-ready scale you don't have ("battle-tested across thousands of tenants")
- Comparison shots that hide weaknesses — Sovra is one developer's stack, say so
