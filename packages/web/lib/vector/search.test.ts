import { describe, it, expect, vi, beforeEach } from 'vitest'
import { semanticSearch, hybridSearch, type SearchResult } from './search'

function createMockSupabase(rpcResult: { data: unknown; error: unknown }) {
  return {
    rpc: vi.fn().mockResolvedValue(rpcResult),
  } as unknown as Parameters<typeof semanticSearch>[0]
}

describe('semanticSearch', () => {
  const fakeEmbedding = new Array(1536).fill(0.1)
  const fakeResults: SearchResult[] = [
    { id: 'doc-1', content: 'result one', metadata: { source: 'test' }, similarity: 0.95 },
    { id: 'doc-2', content: 'result two', metadata: {}, similarity: 0.85 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls match_documents RPC with correct params', async () => {
    const supabase = createMockSupabase({ data: fakeResults, error: null })

    await semanticSearch(supabase, {
      embedding: fakeEmbedding,
      tenantId: 'tenant-abc',
      limit: 5,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('match_documents', {
      query_embedding: JSON.stringify(fakeEmbedding),
      filter_tenant_id: 'tenant-abc',
      match_count: 5,
    })
  })

  it('returns results with id, content, metadata, similarity', async () => {
    const supabase = createMockSupabase({ data: fakeResults, error: null })

    const results = await semanticSearch(supabase, {
      embedding: fakeEmbedding,
      tenantId: 'tenant-abc',
    })

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({
      id: 'doc-1',
      content: 'result one',
      metadata: { source: 'test' },
      similarity: 0.95,
    })
  })

  it('defaults limit to 10', async () => {
    const supabase = createMockSupabase({ data: [], error: null })

    await semanticSearch(supabase, {
      embedding: fakeEmbedding,
      tenantId: 'tenant-abc',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('match_documents', {
      query_embedding: JSON.stringify(fakeEmbedding),
      filter_tenant_id: 'tenant-abc',
      match_count: 10,
    })
  })

  it('caps limit at 50', async () => {
    const supabase = createMockSupabase({ data: [], error: null })

    await semanticSearch(supabase, {
      embedding: fakeEmbedding,
      tenantId: 'tenant-abc',
      limit: 100,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('match_documents', {
      query_embedding: JSON.stringify(fakeEmbedding),
      filter_tenant_id: 'tenant-abc',
      match_count: 50,
    })
  })

  it('throws on RPC error', async () => {
    const supabase = createMockSupabase({ data: null, error: { message: 'RPC failed' } })

    await expect(
      semanticSearch(supabase, { embedding: fakeEmbedding, tenantId: 'tenant-abc' })
    ).rejects.toThrow('RPC failed')
  })
})

describe('hybridSearch', () => {
  const fakeEmbedding = new Array(1536).fill(0.1)
  const fakeResults: SearchResult[] = [
    { id: 'doc-1', content: 'hybrid result', metadata: {}, similarity: 0.032 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls hybrid_search_documents RPC with tenant_id and query text', async () => {
    const supabase = createMockSupabase({ data: fakeResults, error: null })

    await hybridSearch(supabase, {
      embedding: fakeEmbedding,
      queryText: 'search query',
      tenantId: 'tenant-xyz',
      limit: 10,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('hybrid_search_documents', {
      query_embedding: JSON.stringify(fakeEmbedding),
      query_text: 'search query',
      filter_tenant_id: 'tenant-xyz',
      match_count: 10,
    })
  })

  it('includes tenant_id filter in the RPC call', async () => {
    const supabase = createMockSupabase({ data: [], error: null })

    await hybridSearch(supabase, {
      embedding: fakeEmbedding,
      queryText: 'test',
      tenantId: 'tenant-123',
    })

    const rpcCall = vi.mocked(supabase.rpc).mock.calls[0]
    expect(rpcCall[1]).toHaveProperty('filter_tenant_id', 'tenant-123')
  })

  it('maps results correctly with score as similarity', async () => {
    const supabase = createMockSupabase({
      data: [{ id: 'doc-1', content: 'test', metadata: {}, score: 0.032 }],
      error: null,
    })

    const results = await hybridSearch(supabase, {
      embedding: fakeEmbedding,
      queryText: 'test',
      tenantId: 'tenant-abc',
    })

    expect(results[0].similarity).toBe(0.032)
  })

  it('throws on RPC error', async () => {
    const supabase = createMockSupabase({ data: null, error: { message: 'Hybrid failed' } })

    await expect(
      hybridSearch(supabase, {
        embedding: fakeEmbedding,
        queryText: 'test',
        tenantId: 'tenant-abc',
      })
    ).rejects.toThrow('Hybrid failed')
  })
})
