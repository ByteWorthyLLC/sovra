import { describe, it, expect, vi } from 'vitest'
import { buildVectorMemory } from '../vector'
import type { MemoryBuildParams } from '../types'

// Mock the hybridSearch dependency
vi.mock('@/lib/vector/search', () => ({
  hybridSearch: vi.fn().mockResolvedValue([
    { id: '1', content: 'Relevant context about AI agents', metadata: {}, similarity: 0.9 },
    { id: '2', content: 'Notes on memory strategies', metadata: {}, similarity: 0.8 },
  ]),
}))

// Mock embedText to return a fake embedding vector
vi.mock('@/lib/vector/embed', () => ({
  embedText: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
}))

function makeSupabase(rows: Array<{ role: string; content: string }>) {
  const chain = {
    order: vi.fn().mockResolvedValue({ data: rows, error: null }),
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

describe('buildVectorMemory', () => {
  it('calls hybridSearch with current prompt and returns results as system context', async () => {
    const { hybridSearch } = await import('@/lib/vector/search')
    const mockHybridSearch = vi.mocked(hybridSearch)

    const rows = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' },
    ]
    const supabase = makeSupabase(rows)

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'vector',
      maxTokenBudget: 4000,
      currentPrompt: 'Tell me about AI agents',
    }

    const result = await buildVectorMemory(params)

    // hybridSearch should have been called
    expect(mockHybridSearch).toHaveBeenCalled()

    // First message(s) should contain vector context as system messages
    const systemMessages = result.filter((m) => m.role === 'system')
    expect(systemMessages.length).toBeGreaterThan(0)

    // Context should contain the retrieved content
    const combinedContent = systemMessages.map((m) => m.content).join(' ')
    expect(combinedContent).toContain('Relevant context about AI agents')
  })

  it('includes recent conversation messages after vector context', async () => {
    const rows = [
      { role: 'user', content: 'recent message' },
      { role: 'assistant', content: 'recent reply' },
    ]
    const supabase = makeSupabase(rows)

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'vector',
      maxTokenBudget: 4000,
      currentPrompt: 'recent message',
    }

    const result = await buildVectorMemory(params)

    // Should include user/assistant messages from recent conversation
    const conversationMessages = result.filter((m) => m.role !== 'system')
    expect(conversationMessages.length).toBeGreaterThan(0)
  })

  it('passes tenantId to hybridSearch for tenant isolation', async () => {
    const { hybridSearch } = await import('@/lib/vector/search')
    const mockHybridSearch = vi.mocked(hybridSearch)
    mockHybridSearch.mockClear()

    const supabase = makeSupabase([])

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-xyz',
      strategy: 'vector',
      maxTokenBudget: 4000,
      currentPrompt: 'test prompt',
    }

    await buildVectorMemory(params)

    expect(mockHybridSearch).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({ tenantId: 'tenant-xyz', queryText: 'test prompt' })
    )
  })
})
