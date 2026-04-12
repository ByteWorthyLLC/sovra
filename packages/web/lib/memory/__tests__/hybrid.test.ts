import { describe, it, expect, vi } from 'vitest'
import { buildHybridMemory } from '../hybrid'
import type { MemoryBuildParams } from '../types'

// Mock the strategy modules
vi.mock('../summary', () => ({
  buildSummaryMemory: vi.fn().mockResolvedValue([
    { role: 'system', content: 'Summary: previous discussion about agents.' },
    { role: 'user', content: 'recent user message' },
    { role: 'assistant', content: 'recent assistant reply' },
  ]),
}))

vi.mock('../vector', () => ({
  buildVectorMemory: vi.fn().mockResolvedValue([
    { role: 'system', content: 'Relevant context: vector result 1' },
    { role: 'system', content: 'Relevant context: vector result 2' },
    { role: 'user', content: 'recent user message' },
    { role: 'assistant', content: 'recent assistant reply' },
  ]),
}))

function makeSupabase() {
  const chain = {
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn(),
    select: vi.fn(),
    from: vi.fn(),
  }
  chain.eq.mockImplementation(() => chain)
  chain.select.mockReturnValue(chain)
  chain.from.mockReturnValue(chain)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return chain as any
}

describe('buildHybridMemory', () => {
  it('calls both buildSummaryMemory and buildVectorMemory', async () => {
    const { buildSummaryMemory } = await import('../summary')
    const { buildVectorMemory } = await import('../vector')

    const supabase = makeSupabase()
    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'hybrid',
      maxTokenBudget: 4000,
      currentPrompt: 'What do you know?',
    }

    await buildHybridMemory(params)

    expect(buildSummaryMemory).toHaveBeenCalledWith(params)
    expect(buildVectorMemory).toHaveBeenCalledWith(params)
  })

  it('places summary messages before vector context messages', async () => {
    const supabase = makeSupabase()
    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'hybrid',
      maxTokenBudget: 4000,
      currentPrompt: 'What do you know?',
    }

    const result = await buildHybridMemory(params)

    // Summary system message should come first
    expect(result[0]).toMatchObject({ role: 'system', content: expect.stringContaining('Summary') })
  })

  it('returns a merged CoreMessage[] array', async () => {
    const supabase = makeSupabase()
    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'hybrid',
      maxTokenBudget: 4000,
      currentPrompt: 'Tell me about agents.',
    }

    const result = await buildHybridMemory(params)

    // All messages should be valid CoreMessages
    for (const msg of result) {
      expect(['system', 'user', 'assistant']).toContain(msg.role)
      expect(typeof msg.content).toBe('string')
    }

    // Should have more than just one of the strategies' output
    expect(result.length).toBeGreaterThan(3)
  })

  it('deduplicates conversation messages', async () => {
    const supabase = makeSupabase()
    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'hybrid',
      maxTokenBudget: 4000,
      currentPrompt: 'test',
    }

    const result = await buildHybridMemory(params)

    // "recent user message" appears in both mocks but should appear once in user/assistant messages
    const userMessages = result.filter((m) => m.role === 'user' && m.content === 'recent user message')
    expect(userMessages.length).toBe(1)
  })
})
