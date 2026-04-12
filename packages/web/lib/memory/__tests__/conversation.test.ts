import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildConversationMemory } from '../conversation'
import type { MemoryBuildParams } from '../types'

function makeSupabase(rows: Array<{ role: string; content: string }>) {
  const chain = {
    order: vi.fn().mockResolvedValue({ data: rows, error: null }),
    eq: vi.fn(),
    select: vi.fn(),
    from: vi.fn(),
  }
  chain.eq.mockImplementation((field: string, value: string) => {
    if (field === 'tenant_id' || field === 'conversation_id') return chain
    return chain
  })
  chain.select.mockReturnValue(chain)
  chain.from.mockReturnValue(chain)
  return chain as unknown as ReturnType<typeof makeSupabase>
}

describe('buildConversationMemory', () => {
  it('returns messages as CoreMessage[] in chronological order', async () => {
    const rows = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
      { role: 'user', content: 'How are you?' },
    ]
    const supabase = makeSupabase(rows)

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'conversation',
      maxTokenBudget: 4000,
      currentPrompt: 'How are you?',
    }

    const result = await buildConversationMemory(params)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ role: 'user', content: 'Hello' })
    expect(result[1]).toEqual({ role: 'assistant', content: 'Hi there' })
    expect(result[2]).toEqual({ role: 'user', content: 'How are you?' })
  })

  it('prepends system prompt when provided', async () => {
    const rows = [{ role: 'user', content: 'Hello' }]
    const supabase = makeSupabase(rows)

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'conversation',
      maxTokenBudget: 4000,
      currentPrompt: 'Hello',
      systemPrompt: 'You are a helpful assistant.',
    }

    const result = await buildConversationMemory(params)

    expect(result[0]).toEqual({ role: 'system', content: 'You are a helpful assistant.' })
    expect(result[1]).toEqual({ role: 'user', content: 'Hello' })
    expect(result).toHaveLength(2)
  })

  it('returns only system message when DB returns empty rows', async () => {
    const supabase = makeSupabase([])

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'conversation',
      maxTokenBudget: 4000,
      currentPrompt: 'Hello',
      systemPrompt: 'You are helpful.',
    }

    const result = await buildConversationMemory(params)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ role: 'system', content: 'You are helpful.' })
  })

  it('returns empty array when no messages and no system prompt', async () => {
    const supabase = makeSupabase([])

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'conversation',
      maxTokenBudget: 4000,
      currentPrompt: 'Hello',
    }

    const result = await buildConversationMemory(params)

    expect(result).toHaveLength(0)
  })
})
