import { describe, it, expect, vi } from 'vitest'
import { buildSummaryMemory } from '../summary'
import type { MemoryBuildParams } from '../types'

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

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({ text: 'Summary: key decisions made.' }),
}))

describe('buildSummaryMemory', () => {
  it('injects summary as system message and keeps recent messages', async () => {
    const { generateText } = await import('ai')
    const mockGenerateText = vi.mocked(generateText)
    mockGenerateText.mockResolvedValue({ text: 'Summary: key decisions.' } as Awaited<ReturnType<typeof generateText>>)

    // 8 messages total: older ones get summarized, recent ones kept
    const rows = [
      { role: 'user', content: 'msg 1' },
      { role: 'assistant', content: 'reply 1' },
      { role: 'user', content: 'msg 2' },
      { role: 'assistant', content: 'reply 2' },
      { role: 'user', content: 'msg 3' },
      { role: 'assistant', content: 'reply 3' },
      { role: 'user', content: 'msg 4' },
      { role: 'assistant', content: 'reply 4' },
    ]
    const supabase = makeSupabase(rows)

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'summary',
      maxTokenBudget: 4000,
      currentPrompt: 'What happened?',
      model: {} as MemoryBuildParams['model'],
    }

    const result = await buildSummaryMemory(params)

    // First message should be a system message with the summary
    expect(result[0].role).toBe('system')
    expect(result[0].content).toContain('Summary')

    // Should have been called to generate summary
    expect(mockGenerateText).toHaveBeenCalled()
  })

  it('returns only recent messages when model is not provided', async () => {
    const rows = [
      { role: 'user', content: 'msg 1' },
      { role: 'assistant', content: 'reply 1' },
    ]
    const supabase = makeSupabase(rows)

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'summary',
      maxTokenBudget: 4000,
      currentPrompt: 'What happened?',
      // no model provided
    }

    const result = await buildSummaryMemory(params)

    // Without model, should still return messages but no summarization
    expect(result.length).toBeGreaterThan(0)
    // All returned messages should be valid CoreMessages
    for (const msg of result) {
      expect(['system', 'user', 'assistant']).toContain(msg.role)
    }
  })

  it('prepends system prompt before summary', async () => {
    const { generateText } = await import('ai')
    const mockGenerateText = vi.mocked(generateText)
    mockGenerateText.mockResolvedValue({ text: 'Summary of events.' } as Awaited<ReturnType<typeof generateText>>)

    const rows = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `message ${i}`,
    }))
    const supabase = makeSupabase(rows)

    const params: MemoryBuildParams = {
      supabase: supabase as unknown as MemoryBuildParams['supabase'],
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      strategy: 'summary',
      maxTokenBudget: 4000,
      currentPrompt: 'Continue',
      systemPrompt: 'You are a helper.',
      model: {} as MemoryBuildParams['model'],
    }

    const result = await buildSummaryMemory(params)

    // First message is system prompt
    expect(result[0]).toEqual({ role: 'system', content: 'You are a helper.' })
  })
})
