---
phase: 5
slug: multi-agent
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 5 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (TS)** | Vitest 2.x + @testing-library/react 16.x |
| **Framework (Go)** | go test |
| **Config file** | `packages/web/vitest.config.ts` |
| **Quick run command (TS)** | `cd packages/web && pnpm test` |
| **Quick run command (Go)** | `cd packages/worker && go test ./...` |
| **Full suite command** | `cd packages/web && pnpm test -- --reporter=verbose && cd ../worker && go test -v ./...` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run relevant test suite (TS or Go)
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 05-01-01 | 01 | 0 | MUL-01 | unit | `pnpm test -- workspace/` | pending |
| 05-01-02 | 01 | 0 | MUL-02 | unit | `pnpm test -- workspace/` | pending |
| 05-01-03 | 01 | 0 | MUL-03,04,05 | unit | `pnpm test -- workspace/` | pending |
| 05-02-01 | 02 | 1 | MEM-01,02 | unit | `pnpm test -- memory/` | pending |
| 05-02-02 | 02 | 1 | MEM-03,04 | unit | `pnpm test -- memory/` | pending |
| 05-02-03 | 02 | 1 | MEM-05 | unit | `pnpm test -- memory/` | pending |
| 05-03-01 | 03 | 1 | REAL-01,02 | unit | `go test -v ./socket/...` | pending |
| 05-03-02 | 03 | 1 | REAL-03,04,05 | unit | `go test -v ./socket/...` | pending |
| 05-03-03 | 03 | 1 | MUL-06 | unit | `pnpm test -- workspace/` | pending |

*Status: pending | green | red | flaky*

---

## Wave 0 Requirements

- [ ] DB migration for `workspace_agents` join table
- [ ] Test stubs for workspace CRUD, memory strategies, socket handlers

*Existing test infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-time agent status updates in browser | REAL-03 | Requires live Socket.IO connection + running Go worker | Start docker-compose, create workspace, start collaboration, observe status dots |
| WebSocket reconnection after disconnect | REAL-05 | Requires killing and restarting Go worker mid-session | Start collaboration, kill worker, verify reconnection banner, restart worker |
| Multi-agent streaming in workspace | REAL-04 | Requires live LLM API keys for multiple agents | Create workspace with 2+ agents, start round_robin, observe interleaved streaming |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
