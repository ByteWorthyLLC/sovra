# Sovra — LinkedIn Carousel (8 slides)

> Export as PDF, 1080×1080 per slide. Sovra accent color (`#2563EB` blue) + ByteWorthy editorial cream backdrop. Mid-tone palette throughout — no neon. Post Tuesday 8am PT, repost from `@kevin-byteworthy` personal account 4 hours later with a reflection comment.

---

## Slide 1 — Hook

**Copy**:
```
I shipped 4 AI products
in 2 years.

I rebuilt the same plumbing
every single time.
```

**Design**:
- Bold serif headline (Fraunces 64pt) on cream
- Slim "1/8" indicator bottom-right in mono
- Sovra mark watermark bottom-left at 30% opacity
- No image, just typography — let the line breaks do the work

---

## Slide 2 — The cost

**Copy**:
```
The 7 things every AI
product rebuilds:

- Auth with tenant context
- MCP tool registry
- Vector search
- Agent state
- Per-tenant billing
- Real-time updates
- Audit chains

6 to 8 weeks before
shipping anything users
actually see.
```

**Design**:
- Left-aligned list, mono font (JetBrains Mono 32pt) for the items
- Top headline in Fraunces serif
- The "6-8 weeks" callout in larger weight, accent blue
- Small icon row across the bottom (lock, plug, search, brain, dollar, lightning, scroll) in #5B7C99

---

## Slide 3 — The "what if"

**Copy**:
```
What if the boring 90%
shipped on day one?

You'd start where most
AI products run out
of money trying to get to.
```

**Design**:
- Two-line headline in Fraunces 56pt
- "boring 90%" highlighted with a thin underline brushstroke in accent blue
- Empty space below — let the question land
- Small "Sovra is what happens when you stop rebuilding." in light italic at the bottom

---

## Slide 4 — Introducing Sovra

**Copy**:
```
Sovra

Open-source multi-tenant
infrastructure for AI products.

Auth · Billing · MCP tools
pgvector · Real-time
Per-tenant context

One platform.
MIT licensed.
```

**Design**:
- Full-bleed Sovra mark left, copy right
- Headline "Sovra" 96pt Fraunces in deep blue (#0F172A)
- The 6 capability words spaced with mid-dot separators
- "MIT licensed" badge bottom-right in a pill shape

---

## Slide 5 — How it works (architecture)

**Copy**:
```
Tenant context lives in
the database, not the app.

Postgres RLS catches the
cross-tenant bugs that
middleware lets ship.

pgvector with per-tenant
namespaces. No separate
vendor bill.
```

**Design**:
- Architecture diagram on the right (the existing Sovra `diagram-architecture.webp`, simplified to 5 nodes)
- Copy left, three short paragraphs, ample line height
- Small annotation arrows pointing from "RLS" text to the Postgres node
- Mono font for the technical labels in the diagram

---

## Slide 6 — Sovra vs the vendor stack

**Copy**:
```
The vendor stack:

Auth0 + Stripe + Pinecone
+ custom MCP glue

= 4 vendors
= 4 SDK upgrade paths
= 4 places tenant context
   can break

Sovra: 1 platform.
Open source. End-to-end.
```

**Design**:
- Two columns: "Vendor stack" left in faded slate, "Sovra" right in accent blue
- Each column has a vertical stack of pills (4 stacked left, 1 single pill right)
- Number tally at the bottom with a "≠" between them
- Subtle drop shadow on the Sovra column to make it feel solid

---

## Slide 7 — Pricing transparency

**Copy**:
```
OSS Core ........ $0
Self-host freely. Forever.

Sovra Cloud ..... waitlist
Managed deployment + SLA.

Enterprise ...... custom
SOC 2 path, custom contracts.

No "contact sales"
black box.
```

**Design**:
- Three rows, each with tier name left + price right, dotted leader line between
- Mono font for prices, Fraunces for tier names
- "No 'contact sales' black box" pulled out in a quote-style block at the bottom in italic
- Sovra mark watermark bottom-right at 20% opacity

---

## Slide 8 — CTA

**Copy**:
```
Star the repo:
github.com/byteworthyllc/sovra

Cloud waitlist:
byteworthy.io/sovra

Built by Kevin Richards
at ByteWorthy.

One developer.
Two years.
Five products.
Zero investors.
```

**Design**:
- Two stacked CTAs at the top with chevron arrows in accent blue
- Founder credit block in middle-italic with a small portrait avatar (or initial mark if no photo yet)
- Stack signature at the bottom: "1 dev · 2 years · 5 products · 0 investors" in mono caps
- Final corner detail: the byteworthy mark + small "byteworthy.io" wordmark

---

## Caption (paste in LinkedIn post body, not the carousel)

```
I shipped 4 AI products in 2 years.

By the fourth one, I noticed I was rebuilding the same seven things every time:
auth with tenant context, MCP tool registry, vector search, agent state,
per-tenant billing, real-time updates, audit chains. 6-8 weeks of plumbing
before any user-facing feature shipped.

So I stopped pretending it was bespoke work and open-sourced the platform.

Sovra is multi-tenant AI infrastructure under MIT. Auth, billing, MCP tools,
pgvector, and a Go agent runtime — one platform instead of four vendors.

The non-obvious bit: tenant context belongs in Postgres RLS, not the app layer.
Middleware-only tenancy ships cross-tenant bugs eventually. RLS makes them
impossible.

Self-host: github.com/byteworthyllc/sovra
Sovra Cloud waitlist: byteworthy.io/sovra

One developer, two years, five products, zero investors. Stack composes —
Klienta uses Sovra's auth, Clynova builds HIPAA on top, Lead Portfolio pipes
into it.

Comments open. What's the worst multi-tenant bug you've shipped?
```

## Engagement plan

- Reply to every comment in the first 6 hours
- Tag at most 1-2 people who'd genuinely benefit (do not mass-tag)
- DM the carousel as a PDF to 5 specific founders the day before for early shares
- Repost from personal account 4 hours after org post
- LinkedIn newsletter follow-up the following week with deep-dive on RLS pattern
