# Phase 3: Agent Core - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped via workflow.skip_discuss)

<domain>
## Phase Boundary

Build agent management and chat interface. This phase delivers the core agent CRUD operations (create, read, update, delete agents with model configuration, system prompts, and tool assignments), plus a real-time chat UI with streaming responses via Vercel AI SDK, message history persistence, and conversation management.

Requirements: AGNT-01 through AGNT-05 (agent operations), CHAT-01 through CHAT-05 (chat interface).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion -- discuss phase was skipped per user setting. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from prior phases:
- AuthAdapter interface pattern (swappable providers) -- extend this pattern to AI providers
- Tenant-scoped everything -- all agent and conversation data must be tenant-isolated via RLS
- Premium UI/UX (Linear/Vercel-level polish, Framer Motion, glass morphism, dark-mode-first)
- Hormozi/Hughes copywriting -- no em dashes anywhere
- Open-source flexibility -- interfaces at every boundary, swappable LLM providers

</decisions>

<code_context>
## Existing Code Insights

Codebase context will be gathered during plan-phase research.

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- discuss phase skipped. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None -- discuss phase skipped.

</deferred>
