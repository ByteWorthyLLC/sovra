# Sovra — Twitter / X Launch Thread

> 8 tweets, each ≤280 chars. Post Tuesday or Wednesday, 9-11am PT. Attach hero image to tweet 1, demo GIF to tweet 4, comparison shot to tweet 5.

## Tweet 1 — Hook (attach hero image)

```
I shipped 4 AI products in 2 years.

Each one I rebuilt the same plumbing: auth, tenants, MCP tools, vector search, billing.

So I stopped pretending it was bespoke work and open-sourced the platform.

Meet Sovra: multi-tenant AI infra. MIT licensed.
```

(218 chars)

## Tweet 2 — Problem

```
Every AI product founder hits the same wall around customer 5:

Auth0 doesn't speak tenants. Stripe doesn't meter LLM calls. Pinecone doesn't share auth. MCP needs custom glue.

You spend 6-8 weeks wiring 4 vendors before you ship a single user-facing feature.
```

(266 chars)

## Tweet 3 — Insight

```
The non-obvious part:

Tenant context isn't an app-layer concern. It needs to live in Postgres RLS so a forgotten WHERE clause can't leak data across customers.

Most "multi-tenant" SaaS templates put it in middleware. That's how cross-tenant bugs ship.
```

(257 chars)

## Tweet 4 — Solution (attach demo GIF)

```
Sovra wires the seven layers AI products keep rebuilding:

- Supabase Auth + tenant context
- MCP tool registry (versioned, rate-limited)
- pgvector with per-tenant namespaces
- Go agent runtime (parallel + cancellable)
- Stripe usage billing per tenant
- Socket.IO real-time
```

(279 chars)

## Tweet 5 — Proof (attach comparison shot)

```
Vendor stack vs Sovra:

Auth0 + Stripe + Pinecone + MCP glue
= 4 vendors
= 4 invoices
= 4 SDK upgrades
= 4 places tenant context can break

Sovra = 1 platform, 1 license (MIT), tenant context propagated through RLS end-to-end.
```

(228 chars)

## Tweet 6 — Transparency

```
Open-source MIT. Self-host the whole thing for $0 forever.

Sovra Cloud (managed) is on waitlist for teams who don't want to operate Postgres + Go services.

Enterprise tier exists for SOC 2 + custom SLAs but pricing is published, not "contact sales."
```

(258 chars)

## Tweet 7 — Use cases

```
Teams running Sovra so far:

- Vertical AI startups onboarding their first 50 tenants
- Post-prototype pre-Series A founders shipping paid customers
- Agencies running multiple AI products on shared infra
- Healthcare AI teams (composes with Clynova for HIPAA)
```

(265 chars)

## Tweet 8 — CTA

```
Self-host: github.com/byteworthyllc/sovra
Cloud waitlist: byteworthy.io/sovra
Discord: discord.gg/byteworthy

I'm one developer. Two years. Five products. Zero investors.

If Sovra saves you 6 weeks, star the repo. If it doesn't, tell me why on Discord.
```

(259 chars)

## Engagement plan

- Quote-tweet from `@byteworthyllc` org account 1hr after personal post
- Mention `@dhravyash` if MCP tooling resonates (he posts MCP-adjacent)
- Reply to Theo's most recent AI infra take with thread link if relevant
- Cross-post tweet 1 + 4 + 8 to LinkedIn 4 hours later
- Hashtags only on tweet 8 if needed: `#buildinpublic #opensource #aiagents`
